import { db, pool } from '@/db';
import { organizations } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type ResolvedOrgSchema =
  | { ok: true; org: typeof organizations.$inferSelect; schemaName: string }
  | { ok: false; status: 404 | 400; error: string };

/**
 * Look up an organization by id and validate it has the schema/index it needs
 * for product sync. Shared by the load/index/status/history routes so they
 * don't each re-implement the org-lookup + validation logic that used to live
 * inline in app/api/admin/organizations/[id]/sync/route.ts.
 */
export async function resolveOrgSchema(orgId: string): Promise<ResolvedOrgSchema> {
  const [org] = await db.select().from(organizations).where(eq(organizations.id, orgId));
  if (!org) {
    return { ok: false, status: 404, error: 'Organization not found' };
  }

  if (!org.algoliaSchema) {
    return { ok: false, status: 400, error: 'Organization has no database schema configured' };
  }
  if (!org.algoliaIndexName) {
    return { ok: false, status: 400, error: 'Organization has no Algolia index configured' };
  }

  const schemaName = org.algoliaSchema.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return { ok: true, org, schemaName };
}

export type RunTable = 'product_sync_runs' | 'algolia_index_runs';

/**
 * Return the currently running row (if any) for a given run table in an org's
 * schema. Used as the concurrency guard before starting a new Load/Index run —
 * mirrors the status-scoped partial unique index already used by
 * unique_pending_operation_idx on algolia_sync_queue (see db/algolia.sql).
 */
export async function getRunningRun(schemaName: string, table: RunTable): Promise<any | null> {
  const result = await pool.query(
    `SELECT * FROM "${schemaName}"."${table}" WHERE status = 'running' LIMIT 1`
  );
  return result.rows[0] ?? null;
}
