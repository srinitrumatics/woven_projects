// ============================================
// Algolia Sync Worker — Multi-Schema, Schema-Adaptive
// ============================================
//
// One Node process drains one or more <schema>.algolia_sync_queue tables
// concurrently. Each schema runs an independent polling loop so a slow
// tenant never blocks a fast one.
//
// Modes:
//   ALGOLIA_SYNC_SCHEMAS=sf_00dec00000e1fjdmaa,sf_00dgk000007zmr7uam  (multi)
//   ALGOLIA_SYNC_SCHEMA=sf_00dec00000e1fjdmaa                          (single)
//
// Per-schema Algolia credentials (optional):
//   ALGOLIA_APP_ID_<UPPERSCHEMA>     /  ALGOLIA_ADMIN_KEY_<UPPERSCHEMA>
//
// Schema-adaptive behaviour:
//   - Introspects column shape per schema on startup (`id` vs `record_id` for
//     PK, `attempts` vs `retry_count`, `last_error` vs `error_message`, etc.).
//   - Uses raw SQL with FOR UPDATE SKIP LOCKED for claim/lock — no stored
//     function dependency.
//   - Auto-injects `objectID` from `record_id` (sfid) when payloads lack it,
//     so triggers that don't set it still work.
//
// Test-only env (do not set in prod):
//   _WORKER_MAX_ITERATIONS=N   — exit after N poll cycles (used by smoke tests)

const algoliasearch = require('algoliasearch');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// ============================================
// SCHEMA RESOLUTION
// ============================================

function parseSchemaList() {
    const multi = process.env.ALGOLIA_SYNC_SCHEMAS;
    if (multi) return multi.split(',').map(s => s.trim()).filter(Boolean);
    const single = process.env.ALGOLIA_SYNC_SCHEMA;
    if (single) return [single.trim()];
    return ['salesforce']; // backward-compat default
}

const SCHEMA_NAME_REGEX = /^[a-z][a-z0-9_]{0,62}$/;
const SCHEMAS = parseSchemaList();

if (SCHEMAS.length === 0) {
    throw new Error('No schemas configured. Set ALGOLIA_SYNC_SCHEMAS or ALGOLIA_SYNC_SCHEMA.');
}
for (const s of SCHEMAS) {
    if (!SCHEMA_NAME_REGEX.test(s)) {
        throw new Error(`Invalid schema name ${JSON.stringify(s)}. Must match /^[a-z][a-z0-9_]{0,62}$/`);
    }
}
if (new Set(SCHEMAS).size !== SCHEMAS.length) {
    throw new Error(`Duplicate schemas: ${SCHEMAS.join(',')}`);
}

// ============================================
// CONFIGURATION
// ============================================

const MAX_ITERATIONS = (() => {
    const raw = process.env._WORKER_MAX_ITERATIONS;
    if (!raw) return Infinity;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : Infinity;
})();

const config = {
    postgres: {
        connectionString: process.env.DATABASE_URL,
        max: Math.max(20, SCHEMAS.length * 5),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        ssl: { rejectUnauthorized: false }, // Required for AWS RDS
    },
    worker: {
        batchSize: parseInt(process.env.BATCH_SIZE) || 100,
        pollingInterval: parseInt(process.env.POLLING_INTERVAL) || 5000,
        maxRetries: parseInt(process.env.MAX_RETRIES) || 5,
        shutdownTimeout: parseInt(process.env.SHUTDOWN_TIMEOUT) || 30000,
    },
};

if (!config.postgres.connectionString) throw new Error('Missing DATABASE_URL');

// ============================================
// SHARED RESOURCES
// ============================================

const pgPool = new Pool(config.postgres);

const algoliaClientCache = new Map();
function getAlgoliaClient(appId, apiKey) {
    let c = algoliaClientCache.get(appId);
    if (!c) {
        c = algoliasearch(appId, apiKey);
        algoliaClientCache.set(appId, c);
    }
    return c;
}

let isShuttingDown = false;

function rootLog(level, message, meta = {}) {
    const line = JSON.stringify({ level, timestamp: new Date().toISOString(), message, ...meta });
    if (level === 'error') console.error(line);
    else if (level === 'warn') console.warn(line);
    else console.log(line);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ============================================
// PER-SCHEMA WORKER
// ============================================

class SchemaWorker {
    constructor(schema) {
        this.schema = schema;
        this.activeProcessing = 0;
        this.isRunning = false;
        this.shape = null; // populated by init()

        const upper = schema.toUpperCase();
        const appId =
            process.env[`ALGOLIA_APP_ID_${upper}`] ||
            process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ||
            process.env.ALGOLIA_APP_ID;
        const apiKey =
            process.env[`ALGOLIA_ADMIN_KEY_${upper}`] ||
            process.env.ALGOLIA_ADMIN_KEY;
        if (!appId || !apiKey) {
            throw new Error(
                `Missing Algolia credentials for schema "${schema}". ` +
                `Set ALGOLIA_APP_ID_${upper} + ALGOLIA_ADMIN_KEY_${upper}, ` +
                `or the global ALGOLIA_APP_ID + ALGOLIA_ADMIN_KEY.`
            );
        }
        this.algolia = getAlgoliaClient(appId, apiKey);
    }

    log(level, message, meta = {}) {
        rootLog(level, message, { schema: this.schema, ...meta });
    }

    /** Introspect column shape — done once per worker on startup. */
    async init() {
        const client = await pgPool.connect();
        try {
            const r = await client.query(
                `SELECT column_name FROM information_schema.columns
                  WHERE table_schema = $1 AND table_name = 'algolia_sync_queue'`,
                [this.schema]
            );
            if (r.rows.length === 0) {
                throw new Error(`${this.schema}.algolia_sync_queue does not exist`);
            }
            const cols = new Set(r.rows.map(x => x.column_name));

            const shape = {
                pkCol:      cols.has('id') ? 'id' : (cols.has('queue_id') ? 'queue_id' : null),
                recordCol:  cols.has('record_id') ? 'record_id' : (cols.has('object_id') ? 'object_id' : null),
                tableCol:   cols.has('table_name') ? 'table_name' : null,
                statusCol:  cols.has('status') ? 'status' : null,
                attemptCol: cols.has('attempts') ? 'attempts' : (cols.has('retry_count') ? 'retry_count' : null),
                errorCol:   cols.has('last_error') ? 'last_error' : (cols.has('error_message') ? 'error_message' : null),
                procCol:    cols.has('processed_at') ? 'processed_at' : null,
            };
            if (!shape.statusCol) throw new Error(`${this.schema}.algolia_sync_queue missing 'status' column`);
            if (!shape.recordCol) throw new Error(`${this.schema}.algolia_sync_queue missing 'record_id'/'object_id' column`);
            if (!shape.pkCol)     shape.pkCol = shape.recordCol; // fall back to record_id as identifier

            this.shape = shape;
            this.log('info', 'queue shape detected', shape);
        } finally {
            client.release();
        }
    }

    /** Atomically claim a batch of pending rows. */
    async claimPending(client, batchSize) {
        const { schema } = this;
        const { pkCol, recordCol, tableCol, statusCol, attemptCol } = this.shape;

        const setExprs = [`${statusCol} = 'processing'`];
        if (attemptCol) setExprs.push(`${attemptCol} = COALESCE(${attemptCol}, 0) + 1`);

        // Use FOR UPDATE SKIP LOCKED on the inner SELECT so multiple workers
        // on the same schema (if you scale to >1) interleave safely.
        const sql = `
            UPDATE ${schema}.algolia_sync_queue q
               SET ${setExprs.join(', ')}
             WHERE q.${pkCol} IN (
                SELECT inner_q.${pkCol}
                  FROM ${schema}.algolia_sync_queue inner_q
                 WHERE inner_q.${statusCol} = 'pending'
                 ORDER BY inner_q.${pkCol}
                 LIMIT $1
                 FOR UPDATE SKIP LOCKED
             )
            RETURNING q.${pkCol} AS row_pk,
                      q.${recordCol} AS record_id,
                      ${tableCol ? `q.${tableCol} AS table_name` : `'product2'::text AS table_name`},
                      q.operation,
                      q.payload
        `;
        const r = await client.query(sql, [batchSize]);
        return r.rows;
    }

    async getIndexConfig(client, tableName) {
        // Try exact match first (e.g. 'product2' queued by trigger),
        // then try schema-prefixed form (e.g. 'salesforce.product2' stored in config).
        const candidates = [tableName, `${this.schema}.${tableName}`];
        // If tableName already contains a dot, also try the part after the dot.
        if (tableName.includes('.')) {
            candidates.push(tableName.split('.').pop());
        }
        for (const candidate of candidates) {
            const r = await client.query(
                `SELECT table_name, index_name
                   FROM ${this.schema}.algolia_index_config
                  WHERE table_name = $1
                    AND COALESCE(is_enabled, TRUE) = TRUE
                  LIMIT 1`,
                [candidate]
            );
            if (r.rows[0]) return r.rows[0];
        }
        return null;
    }

    async markCompleted(client, row) {
        const { schema, shape } = this;
        const sets = [`${shape.statusCol} = 'completed'`];
        if (shape.procCol) sets.push(`${shape.procCol} = now()`);
        await client.query(
            `UPDATE ${schema}.algolia_sync_queue SET ${sets.join(', ')} WHERE ${shape.pkCol} = $1`,
            [row.row_pk]
        );
    }

    /**
     * Insert one row into <schema>.algolia_sync_log.
     * Fields match the table definition exactly:
     *   id, queue_id, table_name, record_id, operation, status,
     *   algolia_object_id, request_payload, response_payload,
     *   error_details, sync_duration_ms, synced_at
     */
    async writeSyncLog(client, {
        queueId, tableName, recordId, operation, status,
        algoliaObjectId = null,
        requestPayload  = null,
        responsePayload = null,
        errorDetails    = null,
        durationMs      = null,
    }) {
        try {
            await client.query(
                `INSERT INTO ${this.schema}.algolia_sync_log
                    (queue_id, table_name, record_id, operation, status,
                     algolia_object_id, request_payload, response_payload,
                     error_details, sync_duration_ms, synced_at)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())`,
                [
                    queueId      ?? null,
                    tableName,
                    recordId,
                    operation,
                    status,
                    algoliaObjectId,
                    requestPayload  ? JSON.stringify(requestPayload)  : null,
                    responsePayload ? JSON.stringify(responsePayload) : null,
                    errorDetails,
                    durationMs,
                ]
            );
        } catch (logErr) {
            // Never let logging failures crash the worker.
            this.log('warn', 'algolia_sync_log insert failed', { error: logErr.message });
        }
    }

    async markFailed(client, row, message) {
        const { schema, shape } = this;
        const sets = [`${shape.statusCol} = $2`];
        if (shape.errorCol) sets.push(`${shape.errorCol} = $3`);
        if (shape.procCol)  sets.push(`${shape.procCol} = now()`);

        // Read current attempt count to decide retry vs dead-letter.
        let attempts = 0;
        if (shape.attemptCol) {
            const r = await client.query(
                `SELECT ${shape.attemptCol} AS attempts FROM ${schema}.algolia_sync_queue WHERE ${shape.pkCol} = $1`,
                [row.row_pk]
            );
            attempts = r.rows[0]?.attempts || 0;
        }
        const newStatus = attempts >= config.worker.maxRetries ? 'dead' : 'pending';
        const params = shape.errorCol
            ? [row.row_pk, newStatus, (message || '').slice(0, 1000)]
            : [row.row_pk, newStatus];

        await client.query(
            `UPDATE ${schema}.algolia_sync_queue SET ${sets.join(', ')} WHERE ${shape.pkCol} = $1`,
            params
        );
    }

    /** Process one claimed batch. Pushes to Algolia, marks rows complete/failed. */
    async syncBatch(client, items) {
        if (!items || items.length === 0) return { success: 0, failed: 0 };

        // Group by (table, op) so we make minimal Algolia API calls.
        const groups = new Map();
        for (const it of items) {
            const k = `${it.table_name}|${it.operation}`;
            if (!groups.has(k)) groups.set(k, []);
            groups.get(k).push(it);
        }

        let success = 0, failed = 0;

        for (const [key, batch] of groups) {
            const [tableName, op] = key.split('|');
            const cfg = await this.getIndexConfig(client, tableName);
            if (!cfg) {
                this.log('warn', 'no index config — failing batch', { tableName, op, count: batch.length });
                for (const it of batch) {
                    await this.markFailed(client, it, `No index config for ${tableName}`);
                    failed++;
                }
                continue;
            }
            // Use environment variable index override if present, else fall back to DB config
            const envIndexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || process.env.ALGOLIA_INDEX_NAME;
            const indexName = envIndexName || cfg.index_name;
            const index = this.algolia.initIndex(indexName);

            try {
                if (op === 'DELETE') {
                    const ids = batch.map(it => (it.payload && it.payload.objectID) || it.record_id).filter(Boolean);
                    if (ids.length === 0) {
                        for (const it of batch) {
                            await this.markFailed(client, it, 'no objectID for delete');
                            await this.writeSyncLog(client, {
                                queueId:     it.row_pk,
                                tableName,
                                recordId:    it.record_id,
                                operation:   op,
                                status:      'failed',
                                errorDetails: 'no objectID for delete',
                            });
                            failed++;
                        }
                        continue;
                    }
                    const t0del = Date.now();
                    await index.deleteObjects(ids);
                    const durDel = Date.now() - t0del;
                    for (const it of batch) {
                        await this.markCompleted(client, it);
                        await this.writeSyncLog(client, {
                            queueId:        it.row_pk,
                            tableName,
                            recordId:       it.record_id,
                            operation:      op,
                            status:         'success',
                            algoliaObjectId: (it.payload && it.payload.objectID) || it.record_id,
                            requestPayload:  { indexName, ids },
                            durationMs:     durDel,
                        });
                        success++;
                    }
                } else {
                    // INSERT/UPDATE — saveObjects upserts in Algolia.
                    // Inject objectID from record_id when missing (the key fix).
                    const objects = batch.map(it => {
                        const obj = { ...(it.payload || {}) };
                        if (!obj.objectID) obj.objectID = it.record_id;
                        return obj;
                    }).filter(o => o.objectID);
                    if (objects.length === 0) {
                        for (const it of batch) {
                            await this.markFailed(client, it, 'no objectID');
                            await this.writeSyncLog(client, {
                                queueId:     it.row_pk,
                                tableName,
                                recordId:    it.record_id,
                                operation:   op,
                                status:      'failed',
                                errorDetails: 'no objectID',
                            });
                            failed++;
                        }
                        continue;
                    }
                    const t0save = Date.now();
                    const saveResult = await index.saveObjects(objects);
                    const durSave = Date.now() - t0save;
                    for (const it of batch) {
                        const obj = objects.find(o => o.objectID === it.record_id) || {};
                        await this.markCompleted(client, it);
                        await this.writeSyncLog(client, {
                            queueId:        it.row_pk,
                            tableName,
                            recordId:       it.record_id,
                            operation:      op,
                            status:         'success',
                            algoliaObjectId: obj.objectID || it.record_id,
                            requestPayload:  obj,
                            responsePayload: saveResult ? { taskID: saveResult.taskID, objectIDs: saveResult.objectIDs } : null,
                            durationMs:     durSave,
                        });
                        success++;
                    }
                }
                this.log('info', 'batch sync completed', { tableName, op, count: batch.length, indexName });
            } catch (err) {
                this.log('error', 'batch sync failed', { tableName, op, error: err.message });
                for (const it of batch) {
                    await this.markFailed(client, it, err.message);
                    await this.writeSyncLog(client, {
                        queueId:     it.row_pk,
                        tableName,
                        recordId:    it.record_id,
                        operation:   op,
                        status:      'failed',
                        errorDetails: err.message,
                    });
                    failed++;
                }
            }
        }
        return { success, failed };
    }

    async processQueue() {
        if (isShuttingDown || this.activeProcessing > 0) return;
        this.activeProcessing++;
        const client = await pgPool.connect();
        try {
            const items = await this.claimPending(client, config.worker.batchSize);
            if (items.length === 0) return;
            this.log('info', 'processing batch', { count: items.length });
            const { success, failed } = await this.syncBatch(client, items);
            this.log('info', 'batch processed', { total: items.length, success, failed });
        } catch (err) {
            this.log('error', 'queue error', { error: err.message, stack: err.stack });
        } finally {
            client.release();
            this.activeProcessing--;
        }
    }

    async runLoop() {
        this.isRunning = true;
        this.log('info', 'schema worker started', { ...config.worker });
        let iterations = 0;
        while (this.isRunning && !isShuttingDown && iterations < MAX_ITERATIONS) {
            try { await this.processQueue(); }
            catch (err) { this.log('error', 'unexpected loop error', { error: err.message }); }
            iterations++;
            if (iterations < MAX_ITERATIONS) await sleep(config.worker.pollingInterval);
        }
        while (this.activeProcessing > 0) await sleep(100);
        this.log('info', 'schema worker stopped', { iterations });
    }
}

// ============================================
// ORCHESTRATION
// ============================================

const workers = SCHEMAS.map(s => new SchemaWorker(s));
let runPromise = null;

async function preflight() {
    rootLog('info', 'preflight — initializing schemas', { schemas: SCHEMAS });
    for (const w of workers) await w.init();
    rootLog('info', 'all schemas initialized', { schemas: SCHEMAS, poolMax: config.postgres.max });
}

async function startAll() {
    runPromise = Promise.all(workers.map(w => w.runLoop()));
    await runPromise;
}

async function stopAll() {
    rootLog('info', 'stopping all workers', { schemas: SCHEMAS });
    isShuttingDown = true;
    const timeout = setTimeout(() => {
        rootLog('warn', 'shutdown timeout, forcing exit');
        process.exit(1);
    }, config.worker.shutdownTimeout);
    try { if (runPromise) await runPromise; }
    catch (err) { rootLog('error', 'drain error', { error: err.message }); }
    clearTimeout(timeout);
    await pgPool.end();
    rootLog('info', 'all workers stopped');
}

// ============================================
// SIGNAL HANDLERS
// ============================================

process.on('SIGTERM', async () => { rootLog('info', 'SIGTERM'); await stopAll(); process.exit(0); });
process.on('SIGINT',  async () => { rootLog('info', 'SIGINT');  await stopAll(); process.exit(0); });
process.on('uncaughtException', (e)  => { rootLog('error', 'uncaught', { error: e?.message, stack: e?.stack }); process.exit(1); });
process.on('unhandledRejection', (r) => { rootLog('error', 'unhandled', { error: r?.message || String(r) }); process.exit(1); });

// ============================================
// START
// ============================================

(async () => {
    try {
        await preflight();
        await startAll();
        // If MAX_ITERATIONS finite (tests), exit cleanly after loops finish.
        if (Number.isFinite(MAX_ITERATIONS)) {
            await pgPool.end();
            process.exit(0);
        }
    } catch (err) {
        rootLog('error', 'failed to start', { error: err?.message, stack: err?.stack });
        process.exit(1);
    }
})();
