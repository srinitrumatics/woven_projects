import { NextResponse } from 'next/server';
import { pool } from '@/db';
import { resolveOrgSchema } from '@/lib/admin-sync-helpers';
import { getLoadRunStatus } from '@/lib/product-load-service';
import { getIndexRunStatus } from '@/lib/product-index-service';

const HISTORY_LIMIT = 20;

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const resolved = await resolveOrgSchema(id);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }
  const { schemaName } = resolved;

  const [loadIdsResult, indexIdsResult] = await Promise.all([
    pool.query(
      `SELECT id FROM "${schemaName}".product_sync_runs ORDER BY started_at DESC LIMIT ${HISTORY_LIMIT}`
    ),
    pool.query(
      `SELECT id FROM "${schemaName}".algolia_index_runs ORDER BY started_at DESC LIMIT ${HISTORY_LIMIT}`
    ),
  ]);

  const loadRuns = await Promise.all(
    loadIdsResult.rows.map((row: any) => getLoadRunStatus(schemaName, row.id))
  );
  const indexRuns = await Promise.all(
    indexIdsResult.rows.map((row: any) => getIndexRunStatus(schemaName, row.id))
  );

  return NextResponse.json({
    loadRuns: loadRuns.filter(Boolean),
    indexRuns: indexRuns.filter(Boolean),
  });
}
