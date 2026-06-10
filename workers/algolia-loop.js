// ============================================================================
// algolia-loop.js — polling version of manual-sync.js
// ============================================================================
// SAME proven code that pushed your first record to wovn_products_local.
// The only difference: it wraps the main flow in a 5-second polling loop
// with graceful shutdown.
//
// USAGE
//   set ALGOLIA_SYNC_SCHEMA=sf_00dec00000e1fjdmaa && node workers/algolia-loop.js
//
// Optional env:
//   POLLING_INTERVAL=5000          milliseconds between polls (default 5000)
//   DATABASE_URL                    required
//   ALGOLIA_APP_ID + ALGOLIA_ADMIN_KEY   required
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

const APP_ID = process.env[`ALGOLIA_APP_ID_${SCHEMA.toUpperCase()}`]
    || process.env.NEXT_PUBLIC_ALGOLIA_APP_ID
    || process.env.ALGOLIA_APP_ID;
const API_KEY = process.env[`ALGOLIA_ADMIN_KEY_${SCHEMA.toUpperCase()}`]
    || process.env.ALGOLIA_ADMIN_KEY;
if (!APP_ID || !API_KEY) {
    console.error('Missing Algolia credentials (ALGOLIA_APP_ID + ALGOLIA_ADMIN_KEY)');
    process.exit(1);
}

const POLLING_INTERVAL = parseInt(process.env.POLLING_INTERVAL, 10) || 5000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

function log(level, message, meta = {}) {
    console.log("[Function Start] algolia-loop.js -> log");
}

let isShuttingDown = false;
let cycleInFlight = false;

// Cached after first introspection so we don't re-query columns every cycle.
let cachedShape = null;
const algolia = algoliasearch(APP_ID, API_KEY);

async function introspectQueue(client) {
    console.log("[Function Start] algolia-loop.js -> introspectQueue");
    const r = await client.query(
        `SELECT column_name FROM information_schema.columns
          WHERE table_schema = $1 AND table_name = 'algolia_sync_queue'`,
        [SCHEMA]
    );
    const cols = new Set(r.rows.map(x => x.column_name));
    const shape = {
        pkCol: cols.has('id') ? 'id' : (cols.has('queue_id') ? 'queue_id' : null),
        recordCol: cols.has('record_id') ? 'record_id' : (cols.has('object_id') ? 'object_id' : null),
        tableCol: cols.has('table_name') ? 'table_name' : null,
        attemptCol: cols.has('attempts') ? 'attempts' : (cols.has('retry_count') ? 'retry_count' : null),
        errorCol: cols.has('last_error') ? 'last_error' : (cols.has('error_message') ? 'error_message' : null),
        statusCol: cols.has('status') ? 'status' : null,
        procCol: cols.has('processed_at') ? 'processed_at' : null,
    };
    if (!shape.statusCol) throw new Error(`No 'status' column`);
    if (!shape.recordCol) throw new Error(`No 'record_id'/'object_id' column`);
    return shape;
}

async function cycle() {
    console.log("[Function Start] algolia-loop.js -> cycle");
    if (cycleInFlight || isShuttingDown) return;
    cycleInFlight = true;
    const client = await pool.connect();
    try {
        if (!cachedShape) {
            cachedShape = await introspectQueue(client);
            log('info', 'queue shape detected', cachedShape);
        }
        const shape = cachedShape;
        const idColumn = shape.pkCol || shape.recordCol;

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

        if (pending.rows.length === 0) return;
        log('info', 'pending rows', { count: pending.rows.length });

        const tables = [...new Set(pending.rows.map(r => r.table_name))];
        const cfgRows = await client.query(
            `SELECT table_name, index_name
               FROM ${SCHEMA}.algolia_index_config
              WHERE table_name = ANY($1::text[])
                AND COALESCE(is_enabled, TRUE) = TRUE`,
            [tables]
        );
        const indexByTable = new Map(cfgRows.rows.map(r => [r.table_name, r.index_name]));

        const groups = new Map();
        for (const row of pending.rows) {
            const k = `${row.table_name}|${row.operation}`;
            if (!groups.has(k)) groups.set(k, []);
            groups.get(k).push(row);
        }

        let success = 0, failed = 0;
        for (const [key, items] of groups) {
            const [tableName, op] = key.split('|');
            const indexName = indexByTable.get(tableName);
            if (!indexName) {
                log('warn', 'no index_name configured', { tableName, op });
                for (const it of items) { await markFailed(client, shape, it, `No index config for ${tableName}`); failed++; }
                continue;
            }
            const index = algolia.initIndex(indexName);
            try {
                if (op === 'DELETE') {
                    const ids = items.map(it => (it.payload && it.payload.objectID) || it.record_id).filter(Boolean);
                    if (ids.length > 0) await index.deleteObjects(ids);
                } else {
                    const objects = items.map(it => {
                        const o = { ...(it.payload || {}) };
                        if (!o.objectID) o.objectID = it.record_id;
                        return o;
                    }).filter(o => o.objectID);
                    if (objects.length > 0) await index.saveObjects(objects);
                }
                for (const it of items) { await markCompleted(client, shape, it); success++; }
                log('info', 'batch pushed', { tableName, op, count: items.length, indexName });
            } catch (err) {
                log('error', 'batch failed', { tableName, op, error: err.message });
                for (const it of items) { await markFailed(client, shape, it, err.message); failed++; }
            }
        }
        log('info', 'cycle done', { success, failed });
    } catch (err) {
        log('error', 'cycle error', { error: err.message, stack: err.stack });
    } finally {
        client.release();
        cycleInFlight = false;
    }
}

async function markCompleted(client, shape, it) {
    console.log("[Function Start] algolia-loop.js -> markCompleted");
    const sets = [`${shape.statusCol} = 'completed'`];
    if (shape.procCol) sets.push(`${shape.procCol} = now()`);
    const idCol = shape.pkCol || shape.recordCol;
    await client.query(`UPDATE ${SCHEMA}.algolia_sync_queue SET ${sets.join(', ')} WHERE ${idCol} = $1`, [it.row_pk]);
}

async function markFailed(client, shape, it, message) {
    console.log("[Function Start] algolia-loop.js -> markFailed");
    const sets = [`${shape.statusCol} = 'failed'`];
    if (shape.errorCol) sets.push(`${shape.errorCol} = $2`);
    if (shape.attemptCol) sets.push(`${shape.attemptCol} = COALESCE(${shape.attemptCol}, 0) + 1`);
    if (shape.procCol) sets.push(`${shape.procCol} = now()`);
    const idCol = shape.pkCol || shape.recordCol;
    const params = shape.errorCol ? [it.row_pk, (message || '').slice(0, 1000)] : [it.row_pk];
    await client.query(`UPDATE ${SCHEMA}.algolia_sync_queue SET ${sets.join(', ')} WHERE ${idCol} = $1`, params);
}

// ============================================================================
// MAIN LOOP
// ============================================================================

async function shutdown(signal) {
    console.log("[Function Start] algolia-loop.js -> shutdown");
    log('info', 'shutting down', { signal });
    isShuttingDown = true;
    // Wait up to 30s for in-flight cycle.
    const deadline = Date.now() + 30_000;
    while (cycleInFlight && Date.now() < deadline) {
        await new Promise(r => setTimeout(r, 100));
    }
    try { await pool.end(); } catch { }
    process.exit(0);
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('uncaughtException', (e) => { log('error', 'uncaught', { error: e?.message, stack: e?.stack }); process.exit(1); });
process.on('unhandledRejection', (r) => { log('error', 'unhandled', { error: r?.message || String(r) }); process.exit(1); });

(async () => {
    log('info', 'algolia-loop started', { app_id: APP_ID, polling_interval_ms: POLLING_INTERVAL });
    while (!isShuttingDown) {
        try { await cycle(); }
        catch (err) { log('error', 'cycle threw', { error: err.message, stack: err.stack }); }
        if (!isShuttingDown) await new Promise(r => setTimeout(r, POLLING_INTERVAL));
    }
})();
