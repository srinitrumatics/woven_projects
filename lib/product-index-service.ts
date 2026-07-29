import { randomUUID } from 'crypto';
import algoliasearch from 'algoliasearch';
import { pool } from '@/db';
import { getRunningRun } from './admin-sync-helpers';

const BATCH_SIZE = 500;
const DRAIN_BATCH_SIZE = 200;
const MAX_DRAIN_ITERATIONS = 500;
const MAX_DRAIN_DURATION_MS = 30 * 60 * 1000;

function buildAlgoliaPayload(row: any) {
  const images = row.image_url?.images || [];
  return {
    objectID: row.sfid,
    sku: row.productcode,
    name: row.name,
    description: row.description,
    price: row.gtherp__price__c ?? 0,
    listPrice: row.list_price__c ?? 0,
    unitPrice: row.gtherp__price__c ?? 0,
    stock_quantity: row.gtherp__stock_quantity__c ?? 0,
    available_quantity: row.gtherp__available_quantity__c ?? 0,
    discount: row.gtherp__discount__c ?? 0,
    moq: row.gtherp__moq__c ?? 0,
    available_to_sell: row.gtherp__available_to_sell__c ?? 0,
    image_url: images[0]?.url ?? null,
    images,
    category: row.gtherp__category__c,
    family: row.family,
    sub_category: row.gtherp__sub_category__c,
    manufacturer: row.manufacturer_name__c,
    brand: row.gtherp__brand_name__c,
    status: row.isactive ? 'active' : 'inactive',
    is_active: row.isactive,
    product_availability: row.product_availability__c,
    Availability_Status__c: row.product_availability__c,
    created_at: row.createddate ? Math.floor(new Date(row.createddate).getTime() / 1000) : null,
    updated_at: row.systemmodstamp ? Math.floor(new Date(row.systemmodstamp).getTime() / 1000) : null,
    _tags: [row.family, row.gtherp__category__c, row.gtherp__sub_category__c, row.manufacturer_name__c, row.gtherp__brand_name__c, row.product_availability__c].filter(Boolean),
  };
}


/**
 * Resolves Algolia credentials for a schema, mirroring the exact precedence
 * workers/algolia-sync-worker.js's SchemaWorker constructor uses, so a row
 * behaves identically whether it's processed by this in-process drain or by
 * the standalone worker.
 */
function resolveAlgoliaCredentials(schemaName: string): { appId: string; apiKey: string } | null {
  const upper = schemaName.toUpperCase();
  const appId =
    process.env[`ALGOLIA_APP_ID_${upper}`] ||
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ||
    process.env.ALGOLIA_APP_ID;
  const apiKey =
    process.env[`ALGOLIA_ADMIN_KEY_${upper}`] ||
    process.env.ALGOLIA_ADMIN_KEY;
  if (!appId || !apiKey) return null;
  return { appId, apiKey };
}

type ClaimedRow = {
  row_pk: number;
  record_id: string;
  table_name: string;
  operation: string;
  payload: any;
};

/**
 * Claims up to `limit` pending rows from algolia_sync_queue, the same
 * FOR UPDATE SKIP LOCKED shape as workers/algolia-sync-worker.js's
 * claimPending, so this drain and the standalone worker can safely run
 * concurrently against the same schema without double-processing a row.
 * Deliberately NOT filtered by batch_id — every pending row is eligible,
 * regardless of whether the product2 trigger, a prior Index run, or anything
 * else created it (FR-005).
 */
async function claimPendingQueueRows(schemaName: string, limit: number): Promise<ClaimedRow[]> {
  const result = await pool.query(
    `UPDATE "${schemaName}".algolia_sync_queue q
        SET status = 'processing', retry_count = COALESCE(retry_count, 0) + 1
      WHERE q.id IN (
        SELECT inner_q.id
          FROM "${schemaName}".algolia_sync_queue inner_q
         WHERE inner_q.status = 'pending'
         ORDER BY inner_q.id
         LIMIT $1
         FOR UPDATE SKIP LOCKED
      )
      RETURNING q.id AS row_pk, q.record_id, q.table_name, q.operation, q.payload`,
    [limit]
  );
  return result.rows;
}

async function getIndexNameForTable(schemaName: string, tableName: string): Promise<string | null> {
  const candidates = [tableName, `${schemaName}.${tableName}`, tableName.split('.').pop()];
  for (const candidate of candidates) {
    const result = await pool.query(
      `SELECT index_name FROM "${schemaName}".algolia_index_config
        WHERE table_name = $1 AND COALESCE(is_enabled, TRUE) = TRUE
        LIMIT 1`,
      [candidate]
    );
    if (result.rows[0]) return result.rows[0].index_name;
  }
  return null;
}

async function markRowResult(
  schemaName: string,
  row: ClaimedRow,
  outcome: { status: 'completed' | 'failed'; algoliaObjectId?: string | null; errorMessage?: string; durationMs?: number }
) {
  await pool.query(
    `UPDATE "${schemaName}".algolia_sync_queue
        SET status = $1, processed_at = CURRENT_TIMESTAMP, error_message = $2
      WHERE id = $3`,
    [outcome.status, outcome.errorMessage ?? null, row.row_pk]
  );
  await pool.query(
    `INSERT INTO "${schemaName}".algolia_sync_log
        (queue_id, table_name, record_id, operation, status, algolia_object_id,
         request_payload, error_details, sync_duration_ms, synced_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())`,
    [
      row.row_pk,
      row.table_name,
      row.record_id,
      row.operation,
      outcome.status,
      outcome.algoliaObjectId ?? null,
      row.payload ? JSON.stringify(row.payload) : null,
      outcome.errorMessage ?? null,
      outcome.durationMs ?? null,
    ]
  );
}

/**
 * Pushes one claimed batch to Algolia and marks every row completed/failed,
 * mirroring workers/algolia-sync-worker.js's syncBatch behavior closely
 * enough that history views don't need to know which mechanism processed a
 * given row.
 */
async function pushClaimedRowsToAlgolia(schemaName: string, algoliaClient: ReturnType<typeof algoliasearch>, rows: ClaimedRow[]) {
  const groups = new Map<string, ClaimedRow[]>();
  for (const row of rows) {
    const key = `${row.table_name}|${row.operation}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }

  for (const [key, batch] of groups) {
    const [tableName, operation] = key.split('|');
    const indexName = await getIndexNameForTable(schemaName, tableName);

    if (!indexName) {
      for (const row of batch) {
        await markRowResult(schemaName, row, { status: 'failed', errorMessage: `No index config for ${tableName}` });
      }
      continue;
    }

    const index = algoliaClient.initIndex(indexName);

    try {
      if (operation === 'DELETE') {
        const ids = batch.map((row) => row.payload?.objectID || row.record_id);
        await index.deleteObjects(ids);
        for (const row of batch) {
          await markRowResult(schemaName, row, { status: 'completed', algoliaObjectId: row.payload?.objectID || row.record_id });
        }
      } else {
        const objects = batch.map((row) => ({ ...row.payload, objectID: row.payload?.objectID || row.record_id }));
        await index.saveObjects(objects);
        for (const row of batch) {
          await markRowResult(schemaName, row, { status: 'completed', algoliaObjectId: row.payload?.objectID || row.record_id });
        }
      }
    } catch (err: any) {
      for (const row of batch) {
        await markRowResult(schemaName, row, { status: 'failed', errorMessage: (err.message || 'Algolia push failed').slice(0, 1000) });
      }
    }
  }
}

/**
 * Drains every currently-pending algolia_sync_queue row for this schema,
 * fired-and-forgotten by startIndexRun (not awaited by the API route) so
 * "Index Products" makes progress on its own, without depending on
 * workers/algolia-sync-worker.js being separately running. Safe to run
 * concurrently with that standalone worker (see claimPendingQueueRows).
 */
export async function drainIndexQueue(schemaName: string, runId: string): Promise<void> {
  const credentials = resolveAlgoliaCredentials(schemaName);
  if (!credentials) {
    await pool.query(
      `UPDATE "${schemaName}".algolia_index_runs
          SET status = 'failed', completed_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND status = 'running'`,
      [runId]
    );
    console.error(`[drainIndexQueue] Missing Algolia credentials for schema ${schemaName}; run ${runId} marked failed.`);
    return;
  }

  const algoliaClient = algoliasearch(credentials.appId, credentials.apiKey);
  const deadline = Date.now() + MAX_DRAIN_DURATION_MS;

  for (let iteration = 0; iteration < MAX_DRAIN_ITERATIONS && Date.now() < deadline; iteration++) {
    const rows = await claimPendingQueueRows(schemaName, DRAIN_BATCH_SIZE);
    if (rows.length === 0) break;
    await pushClaimedRowsToAlgolia(schemaName, algoliaClient, rows);
  }
}

type StartIndexRunResult =
  | { ok: true; runId: string; status: string; totalEnqueued: number; startedAt: any; alreadyRunning: boolean }
  | { ok: false; reason: 'not_loaded' };

/**
 * Starts (or joins an already-running) Index run: enqueues one algolia_sync_queue
 * row per active product2 record, tagged with a shared batch_id, for
 * workers/algolia-sync-worker.js to drain on its normal polling cycle.
 */
export async function startIndexRun(schemaName: string): Promise<StartIndexRunResult> {
  const running = await getRunningRun(schemaName, 'algolia_index_runs');
  if (running) {
    // Re-fire the drain even when joining an already-"running" row: if the
    // process that started it exited (deploy, crash, dev-server restart)
    // before finishing, the in-memory loop is gone but the DB row is still
    // "running" — clicking the button again must be able to resume it rather
    // than silently rejoining a run nothing is actually draining anymore.
    // Safe to run alongside a still-live drain too, via claimPendingQueueRows'
    // SKIP LOCKED claiming.
    drainIndexQueue(schemaName, running.id).catch((err) => {
      console.error(`[startIndexRun] Unhandled drain error for schema ${schemaName}, run ${running.id}:`, err);
    });
    return {
      ok: true,
      runId: running.id,
      status: running.status,
      totalEnqueued: running.total_enqueued,
      startedAt: running.started_at,
      alreadyRunning: true,
    };
  }

  const productsResult = await pool.query(
    `SELECT * FROM "${schemaName}".product2 WHERE isactive = true`
  );
  const products = productsResult.rows;

  if (products.length === 0) {
    return { ok: false, reason: 'not_loaded' };
  }

  const batchId = randomUUID();
  const tableName = `${schemaName}.product2`;

  const client = await pool.connect();
  try {
    const insertResult = await client.query(
      `INSERT INTO "${schemaName}".algolia_index_runs (id, total_enqueued) VALUES ($1, $2) RETURNING started_at`,
      [batchId, products.length]
    );

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const chunk = products.slice(i, i + BATCH_SIZE);
      const columns = ['table_name', 'record_id', 'operation', 'payload', 'batch_id'];
      const valuesSql = chunk.map((_: any, j: number) => {
        const base = j * columns.length;
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
      }).join(',\n');

      const params = chunk.flatMap((row: any) => [
        tableName,
        row.sfid,
        'UPDATE',
        JSON.stringify(buildAlgoliaPayload(row)),
        batchId,
      ]);

      await client.query(
        `INSERT INTO "${schemaName}".algolia_sync_queue (${columns.join(', ')})
         VALUES ${valuesSql}
         ON CONFLICT (table_name, record_id, operation) WHERE status = 'pending'
         DO UPDATE SET
           payload = EXCLUDED.payload,
           batch_id = EXCLUDED.batch_id,
           created_at = CURRENT_TIMESTAMP,
           retry_count = 0,
           error_message = NULL`,
        params
      );
    }

    // Fire-and-forget: the drain runs detached from this request/response
    // cycle (same pattern as runLoadAsync), so "Index Products" makes
    // progress on its own regardless of whether workers/algolia-sync-worker.js
    // is separately running.
    drainIndexQueue(schemaName, batchId).catch((err) => {
      console.error(`[startIndexRun] Unhandled drain error for schema ${schemaName}, run ${batchId}:`, err);
    });

    return {
      ok: true,
      runId: batchId,
      status: 'running',
      totalEnqueued: products.length,
      startedAt: insertResult.rows[0].started_at,
      alreadyRunning: false,
    };
  } finally {
    client.release();
  }
}

export async function getIndexRunStatus(schemaName: string, runId: string) {
  const runResult = await pool.query(
    `SELECT * FROM "${schemaName}".algolia_index_runs WHERE id = $1`,
    [runId]
  );
  const run = runResult.rows[0];
  if (!run) return null;

  const countsResult = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'completed') AS succeeded,
       COUNT(*) FILTER (WHERE status IN ('pending', 'processing')) AS pending
     FROM "${schemaName}".algolia_sync_queue
     WHERE batch_id = $1`,
    [runId]
  );
  const succeeded = parseInt(countsResult.rows[0].succeeded, 10);
  const pending = parseInt(countsResult.rows[0].pending, 10);
  // Computed by difference, not `status = 'failed'`: the worker's markFailed
  // writes 'dead' once retries are exhausted (see data-model.md's note on this
  // pre-existing inconsistency), so difference is the only status-agnostic way
  // to count permanently-failed rows.
  const failed = Math.max(0, run.total_enqueued - succeeded - pending);

  let status = run.status;
  let completedAt = run.completed_at;
  if (status === 'running' && pending === 0) {
    status = failed > 0 ? 'completed_with_errors' : 'completed';
    const updateResult = await pool.query(
      `UPDATE "${schemaName}".algolia_index_runs
          SET status = $1, completed_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND status = 'running'
        RETURNING completed_at`,
      [status, runId]
    );
    completedAt = updateResult.rows[0]?.completed_at ?? completedAt;
  }

  return {
    type: 'index' as const,
    runId: run.id as string,
    status: status as string,
    totalEnqueued: run.total_enqueued as number,
    succeeded,
    failed,
    pending,
    startedAt: run.started_at,
    completedAt,
  };
}

export async function getIndexRunFailures(schemaName: string, runId: string) {
  const result = await pool.query(
    `SELECT record_id, error_message
       FROM "${schemaName}".algolia_sync_queue
      WHERE batch_id = $1 AND status NOT IN ('pending', 'processing', 'completed')
      ORDER BY processed_at DESC NULLS LAST
      LIMIT 200`,
    [runId]
  );
  return result.rows.map((row: any) => ({
    recordId: row.record_id as string,
    errorMessage: (row.error_message as string | null) || 'Unknown error',
  }));
}
