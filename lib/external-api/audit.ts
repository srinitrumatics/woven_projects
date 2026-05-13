// lib/external-api/audit.ts
//
// Append a row to public.tenant_api_audit. Best-effort: never block or fail
// a request because of an audit write.

import { pool } from '../../db';
import { log } from './logger';

export interface AuditEntry {
  request_id: string;
  tenant_id: string | null;
  schema_name: string | null;
  api_key_id: number | null;
  method: string;
  path: string;
  status_code: number;
  duration_ms: number;
  request_size: number | null;
  response_size: number | null;
  error_code: string | null;
  error_message: string | null;
  ip: string | null;
  user_agent: string | null;
}

export function recordAudit(entry: AuditEntry): void {
  // Fire-and-forget. Catches its own errors.
  pool.query(
    `INSERT INTO public.tenant_api_audit
        (request_id, tenant_id, schema_name, api_key_id, method, path,
         status_code, duration_ms, request_size, response_size,
         error_code, error_message, ip, user_agent)
     VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::inet,$14)`,
    [
      entry.request_id, entry.tenant_id, entry.schema_name, entry.api_key_id,
      entry.method, entry.path, entry.status_code, entry.duration_ms,
      entry.request_size, entry.response_size,
      entry.error_code, entry.error_message,
      entry.ip, entry.user_agent,
    ]
  ).catch((err: unknown) => {
    log.error('audit_write_failed', {
      request_id: entry.request_id,
      error: err instanceof Error ? err.message : String(err),
    });
  });
}
