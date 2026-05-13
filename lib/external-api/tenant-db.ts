// lib/external-api/tenant-db.ts
//
// withTenant() — runs a callback inside a transaction whose search_path
// points at the tenant's schema. After COMMIT/ROLLBACK the connection is
// returned to the pool with NO leftover state because we used SET LOCAL.
//
// The schema name is verified against a regex (any 1-63 char identifier)
// and DOUBLE-QUOTED before being placed in search_path, so mixed-case and
// leading-digit names like "00DgK000007zMR7UAM_salesforce" survive without
// Postgres lowercasing them.

import { pool } from '../../db';

// Permits any Postgres-quotable identifier: 1-63 chars of letters/digits/_.
const SAFE_SCHEMA = /^[A-Za-z0-9_]{1,63}$/;

// Minimal local type — the project's pg shim is intentionally loose, so we
// re-tighten it here to get type safety inside the external API only.
export interface TenantTx {
  query<R = unknown>(text: string, values?: unknown[]): Promise<{ rows: R[]; rowCount: number | null }>;
  release(): void;
}

/**
 * Run `fn` against a transaction whose search_path is set to the tenant
 * schema. Commits on success, rolls back on throw. Always releases the
 * underlying pg client.
 *
 * Inside `fn`, write unqualified SQL: `INSERT INTO product2 ...`.
 * It will resolve to <schema>.product2.
 */
export async function withTenant<T>(schema: string, fn: (client: TenantTx) => Promise<T>): Promise<T> {
  if (!SAFE_SCHEMA.test(schema)) {
    // Caller should have validated upstream. Throwing rather than ApiError
    // because hitting this is a programming bug, not a request error.
    throw new Error(`Unsafe schema name rejected: ${schema}`);
  }

  const client: TenantTx = await pool.connect();
  try {
    await client.query('BEGIN');
    // set_config(setting, value, is_local) — is_local=true == SET LOCAL.
    // Schema name is DOUBLE-QUOTED in the search_path so Postgres treats
    // mixed-case and leading-digit names as literal identifiers (otherwise
    // they get lowercased during resolution).  The regex above guarantees
    // the name contains no double-quotes itself, so simple wrapping is safe.
    const quotedSchema = '"' + schema + '"';
    await client.query(`SELECT set_config('search_path', $1 || ', public', true)`, [quotedSchema]);

    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch { /* connection may be dead */ }
    throw err;
  } finally {
    client.release();
  }
}
