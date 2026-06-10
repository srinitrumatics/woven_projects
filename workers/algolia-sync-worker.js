// ============================================
// Algolia Sync Worker — Multi-Schema, Schema-Adaptive
// ============================================
//
// Run Modes:
//   node workers/algolia-sync-worker.js                          → auto-discover ALL orgs from organizations table
//   node workers/algolia-sync-worker.js my_algolia_index         → find org by index name, process that schema only
//   node workers/algolia-sync-worker.js my_schema_name           → use schema name directly
//
// Env var overrides (legacy):
//   ALGOLIA_SYNC_SCHEMAS=sf_a,sf_b     (multi)
//   ALGOLIA_SYNC_SCHEMA=sf_a           (single)
//
// Per-schema Algolia credentials (optional):
//   ALGOLIA_APP_ID_<UPPERSCHEMA>  /  ALGOLIA_ADMIN_KEY_<UPPERSCHEMA>
//
// Test-only env (do not set in prod):
//   _WORKER_MAX_ITERATIONS=N   — exit after N poll cycles (used by smoke tests)

const algoliasearch = require('algoliasearch');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// ============================================
// SCHEMA RESOLUTION  (async, runs before worker starts)
// ============================================

const SCHEMA_NAME_REGEX = /^[a-z][a-z0-9_]{0,62}$/;

/**
 * Resolve the list of schemas to process.
 * Priority:
 *   1. CLI arg (index name or schema name)
 *   2. Env vars (ALGOLIA_SYNC_SCHEMAS / ALGOLIA_SYNC_SCHEMA)
 *   3. Auto-discover from organizations table
 *   4. Fallback: ['salesforce']
 */
async function resolveSchemas(dbPool) {
    console.log("[Function Start] algolia-sync-worker.js -> resolveSchemas");
    const cliArg = process.argv[2] ? process.argv[2].trim() : null;

    // ── CLI argument provided ────────────────────────────────────────────────
    if (cliArg) {
        try {
            // Try to find org by algolia_index_name first (case-insensitive)
            const byIndex = await dbPool.query(
                `SELECT algolia_schema, name, algolia_index_name FROM organizations WHERE algolia_index_name ILIKE $1 LIMIT 1`,
                [cliArg]
            );
            if (byIndex.rows.length > 0) {
                const org = byIndex.rows[0];
                const schema = (org.algolia_schema || 'salesforce').replace(/"/g, '').toLowerCase();
                return [schema];
            }

            // Try to find org by algolia_schema (case-insensitive)
            const bySchema = await dbPool.query(
                `SELECT algolia_schema, name, algolia_index_name FROM organizations WHERE algolia_schema ILIKE $1 LIMIT 1`,
                [cliArg]
            );
            if (bySchema.rows.length > 0) {
                const org = bySchema.rows[0];
                const schema = (org.algolia_schema || 'salesforce').replace(/"/g, '').toLowerCase();
                return [schema];
            }

            // Use as raw schema name (manual override), force lowercase
            const lowercaseSchema = cliArg.toLowerCase();
            return [lowercaseSchema];
        } catch (err) {
            console.warn(`[worker] DB lookup failed for CLI arg "${cliArg}": ${err.message} — using as raw schema name`);
            return [cliArg.toLowerCase()];
        }
    }

    // ── Env var overrides (legacy) ────────────────────────────────────────────
    const multi = process.env.ALGOLIA_SYNC_SCHEMAS;
    if (multi) {
        const schemas = multi.split(',').map(s => s.trim()).filter(Boolean);
        return schemas;
    }
    const single = process.env.ALGOLIA_SYNC_SCHEMA;
    if (single) {
        return [single.trim()];
    }

    // ── Auto-discover from organizations table ────────────────────────────────
    try {
        const orgsRes = await dbPool.query(
            `SELECT algolia_schema, name, algolia_index_name FROM organizations WHERE algolia_schema IS NOT NULL AND algolia_schema != ''`
        );
        if (orgsRes.rows.length > 0) {
            const schemas = [...new Set(orgsRes.rows.map(r => (r.algolia_schema || '').replace(/"/g, '').trim()).filter(Boolean))];
            return schemas;
        }
    } catch (err) {
        console.warn(`[worker] Could not query organizations table: ${err.message}`);
    }

    return ['salesforce'];
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
        max: 20, // updated dynamically after schemas are resolved
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 30000, // increased to 30s for serverless DB wake-up
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
    console.log("[Function Start] algolia-sync-worker.js -> getAlgoliaClient");
    let c = algoliaClientCache.get(appId);
    if (!c) {
        c = algoliasearch(appId, apiKey);
        algoliaClientCache.set(appId, c);
    }
    return c;
}

let isShuttingDown = false;

function rootLog(level, message, meta = {}) {
    console.log("[Function Start] algolia-sync-worker.js -> rootLog");
    const line = JSON.stringify({ level, timestamp: new Date().toISOString(), message, ...meta });
    if (level === 'error') console.error(line);
    else if (level === 'warn')
        console.warn(line);
}

function sleep(ms) {
    console.log("[Function Start] algolia-sync-worker.js -> sleep");
    return new Promise(r => setTimeout(r, ms));
}

// ============================================
// PER-SCHEMA WORKER
// ============================================

class SchemaWorker {
    constructor(schema) {
        console.log("[Function Start] algolia-sync-worker.js -> constructor");
        this.schema = schema;
        this.activeProcessing = 0;
        this.isRunning = false;
        this.shape = null; // populated by init()
        this.configuredIndices = new Set();

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
        console.log("[Function Start] algolia-sync-worker.js -> log");
        rootLog(level, message, { schema: this.schema, ...meta });
    }

    /** Introspect column shape — done once per worker on startup. */
    async init() {
        console.log("[Function Start] algolia-sync-worker.js -> init");
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

            // Fetch org details for Salesforce sync
            const orgRes = await client.query(`SELECT * FROM organizations WHERE algolia_schema = $1 LIMIT 1`, [this.schema]);
            if (orgRes.rows.length > 0) {
                this.org = orgRes.rows[0];
            }

            // Get the max systemmodstamp from product2 to initialize sfLastSyncTime
            try {
                const maxDateRes = await client.query(`SELECT MAX(systemmodstamp) as max_date FROM ${this.schema}.product2`);
                if (maxDateRes.rows[0] && maxDateRes.rows[0].max_date) {
                    let d = maxDateRes.rows[0].max_date;
                    if (typeof d === 'string') d = new Date(d);
                    this.sfLastSyncTime = d.toISOString();
                } else {
                    const d = new Date();
                    d.setDate(d.getDate() - 1);
                    this.sfLastSyncTime = d.toISOString();
                }
            } catch (err) {
                this.log('warn', 'Could not fetch max systemmodstamp, using default 1 day ago', { error: err.message });
                const d = new Date();
                d.setDate(d.getDate() - 1);
                this.sfLastSyncTime = d.toISOString();
            }
        } finally {
            client.release();
        }
    }

    /** Atomically claim a batch of pending rows. */
    async claimPending(client, batchSize) {
        console.log("[Function Start] algolia-sync-worker.js -> claimPending");
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
        console.log("[Function Start] algolia-sync-worker.js -> getIndexConfig");
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
        console.log("[Function Start] algolia-sync-worker.js -> markCompleted");
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
        console.log("[Function Start] algolia-sync-worker.js -> writeSyncLog");
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
        console.log("[Function Start] algolia-sync-worker.js -> markFailed");
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
        console.log("[Function Start] algolia-sync-worker.js -> syncBatch");
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
            // Always use the index name from the database config for this tenant.
            // (We DO NOT fall back to NEXT_PUBLIC_ALGOLIA_INDEX_NAME here because it breaks multi-tenant sync).
            const indexName = cfg.index_name;
            const index = this.algolia.initIndex(indexName);
            
            // Ensure faceting is configured automatically upon index creation/usage
            if (!this.configuredIndices.has(indexName)) {
                try {
                    await index.setSettings({
                        attributesForFaceting: [
                            'category',
                            'product_availability',
                            'manufacturer',
                            'searchable(productFamily)'
                        ]
                    });
                    this.log('info', `Configured Algolia facets for index: ${indexName}`);
                    this.configuredIndices.add(indexName);
                } catch (err) {
                    this.log('error', `Failed to configure facets for ${indexName}: ${err.message}`);
                }
            }

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
        console.log("[Function Start] algolia-sync-worker.js -> processQueue");
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
        console.log("[Function Start] algolia-sync-worker.js -> runLoop");
        this.isRunning = true;
        this.log('info', 'schema worker started', { ...config.worker });
        let iterations = 0;
        let lastSfSync = 0;
        const sfSyncInterval = parseInt(process.env.SF_POLLING_INTERVAL) || 60000; // default 1 minute

        while (this.isRunning && !isShuttingDown && iterations < MAX_ITERATIONS) {
            try { 
                const now = Date.now();
                if (now - lastSfSync > sfSyncInterval) {
                    await this.syncFromSalesforce();
                    lastSfSync = now;
                }

                await this.processQueue(); 
            }
            catch (err) { this.log('error', 'unexpected loop error', { error: err.message }); }
            iterations++;
            if (iterations < MAX_ITERATIONS) await sleep(config.worker.pollingInterval);
        }
        while (this.activeProcessing > 0) await sleep(100);
        this.log('info', 'schema worker stopped', { iterations });
    }

    async getSalesforceSession() {
        console.log("[Function Start] algolia-sync-worker.js -> getSalesforceSession");
        if (!this.org) throw new Error("No organization found for schema " + this.schema);
        const org = this.org;
        const tokenUrl = org.salesforce_auth_url || process.env.SF_AUTH_URL || "";
        const clientId = org.client_id || process.env.SF_CLIENT_ID || "";
        const clientSecret = org.client_secret || process.env.SF_CLIENT_SECRET || "";

        if (!tokenUrl || !clientId || !clientSecret) {
            throw new Error("Missing Salesforce credentials for organization");
        }

        const body = new URLSearchParams({
            grant_type: "client_credentials",
            client_id: clientId,
            client_secret: clientSecret,
        });

        const res = await fetch(tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
        });

        if (!res.ok) throw new Error("Failed to authenticate with Salesforce");
        const data = await res.json();
        return { accessToken: data.access_token, instanceUrl: data.instance_url || org.salesforce_url || process.env.SF_DATA_URL };
    }

    async syncFromSalesforce() {
        console.log("[Function Start] algolia-sync-worker.js -> syncFromSalesforce");
        if (!this.org) return; // Cannot sync without org details

        try {
            const session = await this.getSalesforceSession();
            
            let allRecords = [];
            const sinceDate = this.sfLastSyncTime || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            
            const query = `
                SELECT Id, ProductCode, Name, Description, IsActive, Family, CreatedDate, SystemModstamp, 
                       gtherp__Product_Availability__c, gtherp__Manufacturer_Name__c,  
                       gtherp__Available_To_Sell__c,
                       (SELECT Id, Name, UnitPrice, gtherp__Selling_Unit_Price__c FROM PricebookEntries)
                FROM Product2
                WHERE IsActive = true AND SystemModstamp > ${sinceDate}
            `;
            let url = `${session.instanceUrl}/services/data/v60.0/query?q=${encodeURIComponent(query)}`;

            while (url) {
                const res = await fetch(url, {
                    headers: {
                        "Authorization": `Bearer ${session.accessToken}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!res.ok) {
                    const errorBody = await res.text();
                    throw new Error(`Failed to fetch products: ${res.statusText}. ${errorBody}`);
                }
                const data = await res.json();
                allRecords = allRecords.concat(data.records);

                if (data.nextRecordsUrl) {
                    url = `${session.instanceUrl}${data.nextRecordsUrl}`;
                } else {
                    url = null;
                }
            }

            if (allRecords.length === 0) {
                return;
            }

            this.log('info', `Fetched ${allRecords.length} updated products from Salesforce`);

            const client = await pgPool.connect();
            let latestModstamp = this.sfLastSyncTime;
            try {
                for (const p of allRecords) {
                    await client.query(`
                        INSERT INTO "${this.schema}".product2 (
                            sfid, productcode, name, description, isactive, family,
                            gtherp__price__c, list_price__c, gtherp__stock_quantity__c,
                            gtherp__available_quantity__c, gtherp__discount__c,
                            gtherp__category__c, gtherp__sub_category__c,
                            manufacturer_name__c, product_availability__c, createddate, systemmodstamp
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                        ON CONFLICT (sfid) DO UPDATE SET
                            productcode = EXCLUDED.productcode,
                            name = EXCLUDED.name,
                            description = EXCLUDED.description,
                            isactive = EXCLUDED.isactive,
                            family = EXCLUDED.family,
                            gtherp__price__c = EXCLUDED.gtherp__price__c,
                            list_price__c = EXCLUDED.list_price__c,
                            gtherp__stock_quantity__c = EXCLUDED.gtherp__stock_quantity__c,
                            gtherp__available_quantity__c = EXCLUDED.gtherp__available_quantity__c,
                            gtherp__category__c = EXCLUDED.gtherp__category__c,
                            gtherp__sub_category__c = EXCLUDED.gtherp__sub_category__c,
                            manufacturer_name__c = EXCLUDED.manufacturer_name__c,
                            product_availability__c = EXCLUDED.product_availability__c,
                            systemmodstamp = EXCLUDED.systemmodstamp
                    `, [
                        p.Id, p.ProductCode, p.Name, p.Description, p.IsActive, p.Family,
                        (p.PricebookEntries && p.PricebookEntries.records && p.PricebookEntries.records[0] && p.PricebookEntries.records[0].gtherp__Selling_Unit_Price__c) || 0,
                        (p.PricebookEntries && p.PricebookEntries.records && p.PricebookEntries.records[0] && p.PricebookEntries.records[0].UnitPrice) || 0,
                        p.gtherp__Available_To_Sell__c || 0,
                        p.gtherp__Available_To_Sell__c || 0,
                        0,
                        p.Family || 'No Category',
                        '',
                        p.gtherp__Manufacturer_Name__c || '',
                        p.gtherp__Product_Availability__c || '',
                        p.CreatedDate, p.SystemModstamp || ''
                    ]);
                    
                    if (p.SystemModstamp && p.SystemModstamp > latestModstamp) {
                        latestModstamp = p.SystemModstamp;
                    }
                }
                this.sfLastSyncTime = latestModstamp; // update the sync time
                this.log('info', `Successfully upserted ${allRecords.length} products to Postgres database`);
            } finally {
                client.release();
            }
        } catch (err) {
            this.log('error', 'Salesforce sync failed', { error: err.message });
        }
    }
}

// ============================================
// ORCHESTRATION
// ============================================

let workers = [];
let runPromise = null;

async function preflight(schemas) {
    console.log("[Function Start] algolia-sync-worker.js -> preflight");
    rootLog('info', 'preflight — initializing schemas', { schemas });
    for (const w of workers) await w.init();
    rootLog('info', 'all schemas initialized', { schemas, poolMax: config.postgres.max });
}

async function startAll() {
    console.log("[Function Start] algolia-sync-worker.js -> startAll");
    runPromise = Promise.all(workers.map(w => w.runLoop()));
    await runPromise;
}

async function stopAll(schemas) {
    console.log("[Function Start] algolia-sync-worker.js -> stopAll");
    rootLog('info', 'stopping all workers', { schemas });
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
        // Resolve schemas BEFORE building workers (async DB lookup)
        const schemas = await resolveSchemas(pgPool);

        if (schemas.length === 0) {
            rootLog('error', 'No schemas resolved — exiting');
            process.exit(1);
        }
        for (const s of schemas) {
            if (!SCHEMA_NAME_REGEX.test(s)) {
                rootLog('error', `Invalid schema name "${s}" — must match /^[a-z][a-z0-9_]{0,62}$/`);
                process.exit(1);
            }
        }

        // Update pool size based on actual schema count
        config.postgres.max = Math.max(20, schemas.length * 5);

        // Build workers
        workers = schemas.map(s => new SchemaWorker(s));

        await preflight(schemas);
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
