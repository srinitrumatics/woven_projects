// app/api/external/v1/products/route.ts
//
// External Products API — single endpoint, multi-tenant.
//
// Authentication:    Authorization: Bearer wovn_<env>_<prefix>_<secret>
// Tenant routing:    determined by the API key (Option A) — caller has no say
// Storage:           upserts into <tenant_schema>.product2 keyed on sfid
// Search index:      automatic — the existing fn_enqueue_algolia_sync trigger
//                    on each schema's product2 picks up the write and queues
//                    a sync to Algolia
//
// HTTP contract
//   POST   accepts { products: [...] } | [...] | { ... }
//          returns 200 with { ok, request_id, tenant, results: [...] }
//   GET    health/info — returns 200 if your key is valid (no DB read)
//   other  405
//
// All errors return:
//   { ok: false, request_id, error: { code, message, details? } }

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { ApiError } from '@/lib/external-api/errors';
import { authenticate, extractBearer, requireScope, type AuthenticatedTenant } from '@/lib/external-api/auth';
import { withTenant, type TenantTx } from '@/lib/external-api/tenant-db';
import { parseProducts, checkBodySize, type ProductInput } from '@/lib/external-api/validation';
import { check as rateLimit } from '@/lib/external-api/rate-limit';
import { recordAudit } from '@/lib/external-api/audit';
import { scopedLogger, type Logger } from '@/lib/external-api/logger';

// Force Node runtime — Edge can't load `pg`.
export const runtime = 'nodejs';
// We always do live writes — no caching.
export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------

export async function POST(req: NextRequest): Promise<Response> {
  return handle(req, 'POST', async (logger, tenant) => {
    requireScope(tenant, 'products:write');
    rateLimit(tenant.apiKeyId, tenant.rateLimitRpm);

    checkBodySize(req.headers.get('content-length'));

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw ApiError.invalidPayload('Body is not valid JSON');
    }

    const products = parseProducts(body);
    logger.info('products_received', { count: products.length });

    // Diagnostic: log the resolved tenant + verify search_path before writing.
    // This makes multi-tenancy bugs obvious in the server stdout.
    logger.info('routing_decision', {
      apiKeyId: tenant.apiKeyId,
      tenantId: tenant.tenantId,
      schemaName: tenant.schemaName,
    });

    const results = await withTenant(tenant.schemaName, async (client) => {
      // Confirm search_path actually targets this tenant's schema
      const sp = await client.query<{ search_path: string }>(`SHOW search_path`);
      logger.info('search_path_set', {
        intended: tenant.schemaName,
        actual: sp.rows[0]?.search_path,
      });

      const out: Array<{ sfid: string; operation: 'inserted' | 'updated' }> = [];
      for (const p of products) {
        const r = await upsertProduct(client, p);
        out.push(r);
      }
      return out;
    });

    logger.info('products_persisted', {
      count: results.length,
      inserted: results.filter(r => r.operation === 'inserted').length,
      updated:  results.filter(r => r.operation === 'updated').length,
    });

    return jsonOk({
      ok: true,
      tenant: tenant.tenantId,
      results,
    });
  });
}

export async function GET(req: NextRequest): Promise<Response> {
  return handle(req, 'GET', async (_logger, tenant) => {
    return jsonOk({
      ok: true,
      tenant: tenant.tenantId,
      schema: tenant.schemaName,
      scopes: tenant.scopes,
      message: 'External Products API. POST products to this endpoint.',
    });
  });
}

// Block everything else with a clean 405.
export async function PUT()    { return methodNotAllowed('PUT'); }
export async function PATCH()  { return methodNotAllowed('PATCH'); }
export async function DELETE() { return methodNotAllowed('DELETE'); }

// ---------------------------------------------------------------------------
// Handler shell — auth, error mapping, audit, structured logging.
// ---------------------------------------------------------------------------

type Handler = (logger: Logger, tenant: AuthenticatedTenant) => Promise<Response>;

async function handle(req: NextRequest, method: string, fn: Handler): Promise<Response> {
  const requestId = req.headers.get('x-request-id') ?? `req_${crypto.randomBytes(8).toString('hex')}`;
  const startedAt = Date.now();
  const path = new URL(req.url).pathname;
  const ip = clientIp(req);
  const userAgent = req.headers.get('user-agent');

  let tenant: AuthenticatedTenant | null = null;
  let logger = scopedLogger({ request_id: requestId, method, path });
  let response: Response;
  let errorCode: string | null = null;
  let errorMessage: string | null = null;

  try {
    tenant = await authenticate(extractBearer(req));
    logger = scopedLogger({
      request_id: requestId,
      method, path,
      tenant_id: tenant.tenantId,
      schema_name: tenant.schemaName,
      api_key_id: tenant.apiKeyId,
    });

    response = await fn(logger, tenant);
    response = withRequestId(response, requestId);
  } catch (err) {
    const apiErr = err instanceof ApiError ? err : null;
    if (apiErr) {
      errorCode = apiErr.code;
      errorMessage = apiErr.message;
      response = jsonError(apiErr.status, requestId, apiErr);
      // 4xx logged at warn, only the unexpected ones at error.
      if (apiErr.status >= 500) {
        logger.error('request_failed', { status: apiErr.status, code: apiErr.code, message: apiErr.message });
      } else {
        logger.warn('request_rejected', { status: apiErr.status, code: apiErr.code, message: apiErr.message });
      }
    } else {
      errorCode = 'INTERNAL_ERROR';
      errorMessage = err instanceof Error ? err.message : 'unknown';
      // Server-side logs get the truth; client gets the scrubbed message.
      logger.error('request_unhandled_error', {
        error: errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
      });
      response = jsonError(500, requestId, new ApiError(500, 'INTERNAL_ERROR', 'Internal server error'));
    }
  }

  const durationMs = Date.now() - startedAt;
  // Best-effort audit + access log.
  recordAudit({
    request_id: requestId,
    tenant_id: tenant?.tenantId ?? null,
    schema_name: tenant?.schemaName ?? null,
    api_key_id: tenant?.apiKeyId ?? null,
    method, path,
    status_code: response.status,
    duration_ms: durationMs,
    request_size: numberOrNull(req.headers.get('content-length')),
    response_size: numberOrNull(response.headers.get('content-length')),
    error_code: errorCode,
    error_message: errorMessage,
    ip, user_agent: userAgent,
  });
  logger.info('request_completed', { status: response.status, duration_ms: durationMs });

  return response;
}

// ---------------------------------------------------------------------------
// DB op
// ---------------------------------------------------------------------------

async function upsertProduct(client: TenantTx, p: ProductInput) {
  // Build dynamic SET clause from supplied fields only.
  // Note: search_path is set by withTenant() — the unqualified 'product2'
  // resolves to the tenant's table.
  const insertCols: string[] = ['sfid'];
  const insertVals: unknown[] = [p.sfid];
  const setExprs: string[] = [];

  // Treat p as a plain bag for dynamic column iteration.
  const bag = p as unknown as Record<string, unknown>;

  const optional: Array<[keyof ProductInput, string]> = [
    ['name', 'name'],
    ['productcode', 'productcode'],
    ['description', 'description'],
    ['family', 'family'],
    ['isactive', 'isactive'],
    ['quantityunitofmeasure', 'quantityunitofmeasure'],
    ['displayurl', 'displayurl'],
    ['externalid', 'externalid'],
  ];

  for (const [key, col] of optional) {
    if (key in p && bag[key] !== undefined) {
      insertCols.push(col);
      insertVals.push(bag[key]);
      setExprs.push(`${col} = EXCLUDED.${col}`);
    }
  }

  const placeholders = insertCols.map((_, i) => `$${i + 1}`).join(', ');

  // Detect inserted vs updated via xmax = 0 trick.  Return sfid (not id)
  // because HC mappings use sfid as the natural key and `id` may not exist.
  const sql = `
    INSERT INTO product2 (${insertCols.join(', ')})
    VALUES (${placeholders})
    ON CONFLICT (sfid) DO UPDATE SET
      ${setExprs.length > 0 ? setExprs.join(', ') : 'sfid = EXCLUDED.sfid'}
    RETURNING sfid AS returned_sfid, (xmax = 0) AS inserted
  `;

  const { rows } = await client.query<{ returned_sfid: string; inserted: boolean }>(sql, insertVals);
  const row = rows[0];
  return {
    sfid: row.returned_sfid,
    operation: row.inserted ? ('inserted' as const) : ('updated' as const),
  };
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

function jsonOk(payload: Record<string, unknown>): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

function jsonError(status: number, requestId: string, err: ApiError): Response {
  const body = {
    ok: false,
    request_id: requestId,
    error: err.toJSON(),
  };
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (err.code === 'RATE_LIMITED' && err.details?.retry_after_seconds) {
    headers['retry-after'] = String(err.details.retry_after_seconds);
  }
  if (err.code === 'UNAUTHORIZED') {
    headers['www-authenticate'] = 'Bearer realm="external-api"';
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function withRequestId(res: Response, requestId: string): Response {
  // Add request_id to a successful body (we already wrote it for errors).
  // We can't mutate the existing body easily; rewrap.
  const headers = new Headers(res.headers);
  headers.set('x-request-id', requestId);
  return new Response(res.body, { status: res.status, headers });
}

function methodNotAllowed(method: string): Response {
  const requestId = `req_${crypto.randomBytes(8).toString('hex')}`;
  return jsonError(405, requestId, ApiError.methodNotAllowed(method));
}

function clientIp(req: NextRequest): string | null {
  // Heroku sets X-Forwarded-For; first IP is the client.
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip');
}

function numberOrNull(v: string | null): number | null {
  if (v == null) return null;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}
