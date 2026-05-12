// lib/external-api/errors.ts
//
// Structured error type for the external API. Every thrown ApiError carries:
//   - HTTP status
//   - stable error code for clients (NEVER change these)
//   - human message
//   - optional details (field, hints) — safe to expose
//
// Anything else thrown becomes a 500 INTERNAL_ERROR with the message scrubbed
// from the response. The route handler is responsible for that translation.

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INVALID_PAYLOAD'
  | 'PAYLOAD_TOO_LARGE'
  | 'RATE_LIMITED'
  | 'TENANT_NOT_PROVISIONED'
  | 'METHOD_NOT_ALLOWED'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: ApiErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(status: number, code: ApiErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      ...(this.details ? { details: this.details } : {}),
    };
  }

  static unauthorized(msg = 'Invalid or missing API key') {
    return new ApiError(401, 'UNAUTHORIZED', msg);
  }
  static forbidden(msg = 'Insufficient scope') {
    return new ApiError(403, 'FORBIDDEN', msg);
  }
  static invalidPayload(msg: string, details?: Record<string, unknown>) {
    return new ApiError(400, 'INVALID_PAYLOAD', msg, details);
  }
  static payloadTooLarge(msg = 'Request body exceeds limit') {
    return new ApiError(413, 'PAYLOAD_TOO_LARGE', msg);
  }
  static rateLimited(retryAfterSeconds: number) {
    return new ApiError(429, 'RATE_LIMITED', 'Rate limit exceeded', {
      retry_after_seconds: retryAfterSeconds,
    });
  }
  static tenantNotProvisioned(schema: string) {
    return new ApiError(403, 'TENANT_NOT_PROVISIONED', `Tenant schema '${schema}' is not enabled for the external API`);
  }
  static methodNotAllowed(method: string) {
    return new ApiError(405, 'METHOD_NOT_ALLOWED', `Method ${method} not allowed`);
  }
}
