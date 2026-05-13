// lib/external-api/auth.ts
//
// SIMPLE PLAINTEXT API KEY AUTH (dev-friendly)
// =============================================================================
// Lookup pattern:
//   1. Caller sends `Authorization: Bearer <api_key>` where <api_key> is the
//      plaintext value stored in public.tenant_api_keys.api_key.
//   2. We do `SELECT ... WHERE api_key = $1 AND is_active = TRUE`.
//   3. That row's schema_name tells us which tenant schema to write to.
//
// NO pepper.  NO hashing.  NO schema whitelist.  Just a plaintext lookup.
// Safe schema names enforced by regex on the row value itself.
//
// FOR PRODUCTION: move back to hash-based auth (sha256(key + pepper) compared
// against key_hash column), and drop the api_key plaintext column.

import { pool } from '../../db';
import { ApiError } from './errors';

// Safe schema-name pattern.  Permits any 1-63 char string of letters
// (any case), digits, or underscores — same rules as Postgres for QUOTED
// identifiers.  Defense in depth: we always double-quote the value when
// using it in SET search_path, so injection is impossible.
const SAFE_SCHEMA_RE = /^[A-Za-z0-9_]{1,63}$/;

export interface AuthenticatedTenant {
  apiKeyId: number;
  tenantId: string;
  schemaName: string;
  scopes: string[];
  rateLimitRpm: number;
}

/** Extract `Bearer <token>` from the Authorization header. */
export function extractBearer(req: Request): string | null {
  const header = req.headers.get('authorization');
  if (!header) return null;
  const m = header.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

/**
 * Resolve the tenant for a presented API key (plaintext).
 * Throws ApiError on every failure path so callers can't forget the check.
 */
export async function authenticate(rawKey: string | null): Promise<AuthenticatedTenant> {
  if (!rawKey) {
    throw ApiError.unauthorized('Missing Authorization: Bearer <api_key>');
  }

  const { rows } = await pool.query(
    `SELECT id, tenant_id, schema_name, scopes, rate_limit_rpm, is_active, expires_at
       FROM public.tenant_api_keys
      WHERE api_key = $1
      LIMIT 1`,
    [rawKey]
  );

  if (rows.length === 0) {
    throw ApiError.unauthorized('Invalid API key');
  }
  const row = rows[0];

  if (!row.is_active) throw ApiError.unauthorized('API key is inactive');
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    throw ApiError.unauthorized('API key is expired');
  }

  if (!SAFE_SCHEMA_RE.test(row.schema_name)) {
    // Row is corrupt — don't trust it.
    throw ApiError.unauthorized('Tenant schema name is invalid');
  }

  // Update last_used_at without blocking the request.
  pool
    .query(`UPDATE public.tenant_api_keys SET last_used_at = now() WHERE id = $1`, [row.id])
    .catch(() => { /* swallow — not critical */ });

  return {
    apiKeyId: row.id,
    tenantId: row.tenant_id,
    schemaName: row.schema_name,
    scopes: row.scopes ?? [],
    rateLimitRpm: row.rate_limit_rpm,
  };
}

export function requireScope(tenant: AuthenticatedTenant, scope: string): void {
  if (!tenant.scopes.includes(scope)) {
    throw ApiError.forbidden(`Missing required scope: ${scope}`);
  }
}

/**
 * Deprecated — kept only so `scripts/generate-tenant-key.ts` still compiles.
 * Use the SQL provisioning block instead (pgcrypto-based, runs in DBeaver).
 */
export function generateKey(env: 'live' | 'test' = 'live'): { fullKey: string; prefix: string; hash: string } {
  const crypto = require('crypto') as typeof import('crypto');
  const prefix = crypto.randomBytes(4).toString('hex');
  const secret = crypto.randomBytes(24).toString('base64url').slice(0, 32);
  const fullKey = `wovn_${env}_${prefix}_${secret}`;
  return { fullKey, prefix, hash: 'deprecated_use_sql_provisioning' };
}
