import { db } from '../db';
import { organizations } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Ad-hoc verification script for the split Load/Index sync flow, run via
 * `npm run test:product-sync`. Exercises the real API routes against a
 * running dev server (`npm run dev`) for one organization, and asserts the
 * invariants described in specs/051-product-algolia-sync-split/quickstart.md.
 *
 * Usage: PRODUCT_SYNC_TEST_ORG_ID=<uuid> BASE_URL=http://localhost:3000 npm run test:product-sync
 * If PRODUCT_SYNC_TEST_ORG_ID is omitted, the first organization with a
 * configured algoliaSchema is used.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 20 * 60 * 1000;

async function pollUntilTerminal(orgId: string, type: 'load' | 'index', runId: string) {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const res = await fetch(`${BASE_URL}/api/admin/organizations/${orgId}/sync/status?type=${type}&runId=${runId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(`status poll failed: ${JSON.stringify(data)}`);
    if (data.status !== 'running') return data;
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error(`${type} run ${runId} did not reach a terminal state within ${POLL_TIMEOUT_MS}ms`);
}

async function resolveTestOrgId(): Promise<string> {
  const explicit = process.env.PRODUCT_SYNC_TEST_ORG_ID;
  if (explicit) return explicit;

  const rows = await db.select().from(organizations);
  const withSchema = rows.find((o) => !!o.algoliaSchema);
  if (!withSchema) throw new Error('No organization with algoliaSchema configured found — set PRODUCT_SYNC_TEST_ORG_ID');
  return withSchema.id;
}

async function main() {
  const orgId = await resolveTestOrgId();
  console.log(`[product-sync-test] Using organization ${orgId} against ${BASE_URL}`);

  // ── Load Products ──────────────────────────────────────────────────────
  const loadStart = await fetch(`${BASE_URL}/api/admin/organizations/${orgId}/sync/load`, { method: 'POST' });
  const loadStartData = await loadStart.json();
  if (loadStart.status !== 202) throw new Error(`Expected 202 from /sync/load, got ${loadStart.status}: ${JSON.stringify(loadStartData)}`);
  console.log(`[product-sync-test] Load run started: ${loadStartData.runId}`);

  const loadFinal = await pollUntilTerminal(orgId, 'load', loadStartData.runId);
  console.log('[product-sync-test] Load run finished:', loadFinal);

  const loadTotal = loadFinal.upserted + loadFinal.skipped + loadFinal.failed;
  if (loadTotal !== loadFinal.salesforceTotal) {
    throw new Error(`Load counts do not add up: upserted(${loadFinal.upserted}) + skipped(${loadFinal.skipped}) + failed(${loadFinal.failed}) = ${loadTotal} !== salesforceTotal(${loadFinal.salesforceTotal})`);
  }
  console.log('[product-sync-test] ✅ Load counts reconcile with salesforceTotal');

  // ── Index Products ─────────────────────────────────────────────────────
  const indexStart = await fetch(`${BASE_URL}/api/admin/organizations/${orgId}/sync/index`, { method: 'POST' });
  const indexStartData = await indexStart.json();
  if (indexStart.status !== 202) throw new Error(`Expected 202 from /sync/index, got ${indexStart.status}: ${JSON.stringify(indexStartData)}`);
  console.log(`[product-sync-test] Index run started: ${indexStartData.runId}`);

  const indexFinal = await pollUntilTerminal(orgId, 'index', indexStartData.runId);
  console.log('[product-sync-test] Index run finished:', indexFinal);

  const indexTotal = indexFinal.succeeded + indexFinal.failed;
  if (indexTotal !== indexFinal.totalEnqueued) {
    throw new Error(`Index counts do not add up: succeeded(${indexFinal.succeeded}) + failed(${indexFinal.failed}) = ${indexTotal} !== totalEnqueued(${indexFinal.totalEnqueued})`);
  }
  console.log('[product-sync-test] ✅ Index counts reconcile with totalEnqueued');

  console.log('[product-sync-test] ✅ All checks passed');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[product-sync-test] ❌ FAILED:', err.message);
    process.exit(1);
  });
