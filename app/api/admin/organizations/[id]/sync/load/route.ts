import { NextResponse } from 'next/server';
import { resolveOrgSchema } from '@/lib/admin-sync-helpers';
import { startLoadRun, runLoadAsync } from '@/lib/product-load-service';

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const resolved = await resolveOrgSchema(id);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const { org, schemaName } = resolved;
  const run = await startLoadRun(schemaName);

  if (!run.alreadyRunning) {
    // Intentionally not awaited: the Heroku web dyno keeps running after this
    // response is sent, so the load continues in the background while the
    // client polls GET /sync/status for progress.
    runLoadAsync(schemaName, run.runId, org).catch((err) => {
      console.error(`[sync/load] Unhandled error for org ${id}, run ${run.runId}:`, err);
    });
  }

  return NextResponse.json(
    { runId: run.runId, status: run.status, startedAt: run.startedAt },
    { status: 202 }
  );
}
