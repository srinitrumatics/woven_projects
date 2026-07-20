import { NextResponse } from 'next/server';
import { resolveOrgSchema } from '@/lib/admin-sync-helpers';
import { getLoadRunStatus } from '@/lib/product-load-service';
import { getIndexRunStatus, getIndexRunFailures } from '@/lib/product-index-service';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const runId = searchParams.get('runId');

  if (!runId) {
    return NextResponse.json({ error: 'runId query parameter is required' }, { status: 400 });
  }
  if (type !== 'load' && type !== 'index') {
    return NextResponse.json({ error: "type query parameter must be 'load' or 'index'" }, { status: 400 });
  }

  const resolved = await resolveOrgSchema(id);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const status = type === 'load'
    ? await getLoadRunStatus(resolved.schemaName, runId)
    : await getIndexRunStatus(resolved.schemaName, runId);

  if (!status) {
    return NextResponse.json({ error: `Unknown ${type} run for this organization` }, { status: 404 });
  }

  const includeFailures = searchParams.get('includeFailures') === 'true';
  if (type === 'index' && includeFailures && (status as any).failed > 0) {
    const failures = await getIndexRunFailures(resolved.schemaName, runId);
    return NextResponse.json({ ...status, failures });
  }

  return NextResponse.json(status);
}
