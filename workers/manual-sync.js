// ============================================================================
// Manual one-shot sync for sf_00dec00000e1fjdmaa.algolia_sync_queue
// ============================================================================
// What it does:
//   1. Connects to Postgres + reads the queue's actual column shape (so it
//      adapts to whatever this schema uses: id vs record_id, attempts vs
//      retry_count, etc.).
//   2. Selects pending rows.
//   3. For each row: ensures payload.objectID is set (from record_id / sfid
//      if missing), looks up the Algolia index from algolia_index_config,
//      and pushes via the v3 algoliasearch client (same as the main worker).
//   4. Marks the row 'completed' (or 'failed' on error) using whichever
//      columns actually exist on this queue table.
//
// Usage:
//   $env:ALGOLIA_SYNC_SCHEMA="sf_00dec00000e1fjdmaa"; node workers/manual-sync.js
//   # or:
//   set ALGOLIA_SYNC_SCHEMA=sf_00dec00000e1fjdmaa && node workers/manual-sync.js
//
// Environment:
//   DATABASE_URL                — Postgres connection string
//   ALGOLIA_SYNC_SCHEMA         — which schema's queue to drain
//   ALGOLIA_APP_ID / ALGOLIA_ADMIN_KEY (or NEXT_PUBLIC_ALGOLIA_APP_ID)
//
// This script processes ALL currently-pending rows once, then exits.
// Run it again to process new ones. It does not poll.
// ============================================================================

const algoliasearch = require('algoliasearch');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const SCHEMA = (process.env.ALGOLIA_SYNC_SCHEMA || '').trim();
if (!/^[a-z][a-z0-9_]{0,62}$/.test(SCHEMA)) {
    console.error('Set ALGOLIA_SYNC_SCHEMA to a valid schema name (e.g. sf_00dec00000e1fjdmaa)');
    process.exit(1);
}

const APP_ID  = process.env[`ALGOLIA_APP_ID_${SCHEMA.toUpperCase()}`]
             || process.env.NEXT_PUBLIC_ALGOLIA_APP_ID
             || process.env.ALGOLIA_APP_ID;
const API_KEY = process.env[`ALGOLIA_ADMIN_KEY_${SCHEMA.toUpperCase()}`]
             || process.env.ALGOLIA_ADMIN_KEY;
if (!APP_ID || !API_KEY) {
    console.error('Missing Algolia credentials (ALGOLIA_APP_ID + ALGOLIA_ADMIN_KEY)');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

function log(level, message, meta = {}) {
    console.log("[Function Start] manual-sync.js -> log");
}

// Introspect the queue's columns so we adapt to either schema convention.
async function introspectQueue(client) {
    console.log("[Function Start] manual-sync.js -> introspectQueue");
    const r = await client.query(
        `SELECT column_name FROM information_schema.columns
          WHERE table_schema = $1 AND table_name = 'algolia_sync_queue'`,
        [SCHEMA]
    );
    const cols = new Set(r.rows.map(x => x.column_name));

    // Figure out the primary-key-ish column and the table-name column.
    const pkCol      = cols.has('id') ? 'id' : (cols.has('queue_id') ? 'queue_id' : null);
    const recordCol  = cols.has('record_id') ? 'record_id' : (cols.has('object_id') ? 'object_id' : null);
    const tableCol   = cols.has('table_name') ? 'table_name' : null;
    const attemptCol = cols.has('attempts') ? 'attempts' : (cols.has('retry_count') ? 'retry_count' : null);
    const errorCol   = cols.has('last_error') ? 'last_error' : (cols.has('error_message') ? 'error_message' : null);
    const statusCol  = cols.has('status') ? 'status' : null;
    const procCol    = cols.has('processed_at') ? 'processed_at' : null;

    if (!statusCol)  throw new Error(`No 'status' column in ${SCHEMA}.algolia_sync_queue`);
    if (!recordCol)  throw new Error(`No 'record_id' or 'object_id' column in ${SCHEMA}.algolia_sync_queue`);

    return { cols, pkCol, recordCol, tableCol, attemptCol, errorCol, statusCol, procCol };
}

async function main() {
    console.log("[Function Start] manual-sync.js -> main");
    log('info', 'manual-sync started', { app_id: APP_ID });

    const client = await pool.connect();
    try {
        const shape = await introspectQueue(client);
        log('info', 'queue shape detected', {
            pk: shape.pkCol, record: shape.recordCol, table: shape.tableCol,
            attempt: shape.attemptCol, error: shape.errorCol,
        });

        const idColumn = shape.pkCol || shape.recordCol; // fallback: identify rows by record_id
        const tableColExpr = shape.tableCol ? shape.tableCol : `'product2'::text AS table_name`;

        // Pull pending rows.
        const pending = await client.query(
            `SELECT ${idColumn} AS row_pk,
                    ${shape.recordCol} AS record_id,
                    ${shape.tableCol ? shape.tableCol : `'product2'::text`} AS table_name,
                    operation,
                    payload
               FROM ${SCHEMA}.algolia_sync_queue
              WHERE ${shape.statusCol} = 'pending'
              ORDER BY ${idColumn}
              LIMIT 100`
        );

        log('info', 'pending rows', { count: pending.rows.length });
        if (pending.rows.length === 0) {
            log('info', 'nothing to do — queue is empty');
            return;
        }

        // Load index configs for the tables we'll touch.
        const tables = [...new Set(pending.rows.map(r => r.table_name))];
        const cfgRows = await client.query(
            `SELECT table_name, index_name
               FROM ${SCHEMA}.algolia_index_config
              WHERE table_name = ANY($1::text[])
                AND COALESCE(is_enabled, TRUE) = TRUE`,
            [tables]
        );
        const indexByTable = new Map(cfgRows.rows.map(r => [r.table_name, r.index_name]));
        log('info', 'index configs', { entries: [...indexByTable.entries()] });

        const algolia = algoliasearch(APP_ID, API_KEY);
        let success = 0, failed = 0, skipped = 0;

        // Group by (table, op) to batch.
        const groups = new Map();
        for (const row of pending.rows) {
            const k = `${row.table_name}|${row.operation}`;
            if (!groups.has(k)) groups.set(k, []);
            groups.get(k).push(row);
        }

        for (const [key, items] of groups) {
            const [tableName, op] = key.split('|');
            const indexName = indexByTable.get(tableName);
            if (!indexName) {
                log('warn', 'no index_name configured', { tableName, op, items: items.length });
                for (const it of items) {
                    await markFailed(client, shape, it, `No index config for ${tableName}`);
                    failed++;
                }
                continue;
            }
            const index = algolia.initIndex(indexName);

            try {
                if (op === 'DELETE') {
                    const ids = items.map(it => objectIdFor(it)).filter(Boolean);
                    if (ids.length === 0) {
                        log('warn', 'DELETE batch had no derivable objectIDs', { tableName });
                        for (const it of items) { await markFailed(client, shape, it, 'no objectID'); failed++; }
                        continue;
                    }
                    await index.deleteObjects(ids);
                } else {
                    // INSERT or UPDATE — saveObjects upserts in Algolia.
                    const objects = items.map(it => {
                        const obj = { ...(it.payload || {}) };
                        if (!obj.objectID) obj.objectID = it.record_id;  // KEY FIX
                        return obj;
                    }).filter(o => o.objectID);
                    if (objects.length === 0) {
                        log('warn', 'save batch had no objectIDs', { tableName });
                        for (const it of items) { await markFailed(client, shape, it, 'no objectID'); failed++; }
                        continue;
                    }
                    await index.saveObjects(objects);
                }

                for (const it of items) {
                    await markCompleted(client, shape, it);
                    success++;
                }
                log('info', 'batch pushed', { tableName, op, count: items.length, indexName });
            } catch (err) {
                log('error', 'batch failed', { tableName, op, error: err.message });
                for (const it of items) {
                    await markFailed(client, shape, it, err.message);
                    failed++;
                }
            }
        }

        log('info', 'manual-sync done', { success, failed, skipped });
    } finally {
        client.release();
        await pool.end();
    }
}

function objectIdFor(it) {
    console.log("[Function Start] manual-sync.js -> objectIdFor");
    return (it.payload && it.payload.objectID) || it.record_id || null;
}

async function markCompleted(client, shape, it) {
    console.log("[Function Start] manual-sync.js -> markCompleted");
    const sets = [`${shape.statusCol} = 'completed'`];
    if (shape.procCol) sets.push(`${shape.procCol} = now()`);
    const idCol = shape.pkCol || shape.recordCol;
    await client.query(
        `UPDATE ${SCHEMA}.algolia_sync_queue
            SET ${sets.join(', ')}
          WHERE ${idCol} = $1`,
        [it.row_pk]
    );
}

async function markFailed(client, shape, it, message) {
    console.log("[Function Start] manual-sync.js -> markFailed");
    const sets = [`${shape.statusCol} = 'failed'`];
    if (shape.errorCol) sets.push(`${shape.errorCol} = $2`);
    if (shape.attemptCol) sets.push(`${shape.attemptCol} = COALESCE(${shape.attemptCol}, 0) + 1`);
    if (shape.procCol) sets.push(`${shape.procCol} = now()`);
    const idCol = shape.pkCol || shape.recordCol;
    const params = shape.errorCol ? [it.row_pk, (message || '').slice(0, 1000)] : [it.row_pk];
    await client.query(
        `UPDATE ${SCHEMA}.algolia_sync_queue
            SET ${sets.join(', ')}
          WHERE ${idCol} = $1`,
        params
    );
}

main().catch(err => {
    log('error', 'fatal', { error: err.message, stack: err.stack });
    pool.end().finally(() => process.exit(1));
});
