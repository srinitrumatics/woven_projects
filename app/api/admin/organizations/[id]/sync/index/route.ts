import { NextResponse } from 'next/server';
import { resolveOrgSchema } from '@/lib/admin-sync-helpers';
import { startIndexRun } from '@/lib/product-index-service';

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const resolved = await resolveOrgSchema(id);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const run = await startIndexRun(resolved.schemaName);

  if (!run.ok) {
    return NextResponse.json(
      { error: 'No products loaded yet. Run Load Products first.' },
      { status: 409 }
    );
  }

  return NextResponse.json(
    { runId: run.runId, status: run.status, totalEnqueued: run.totalEnqueued, startedAt: run.startedAt },
    { status: 202 }
  );
}
