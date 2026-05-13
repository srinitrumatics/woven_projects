// lib/external-api/logger.ts
//
// Structured JSON logger. Writes one line per event to stdout — Heroku
// Logplex / any log aggregator can index it without parsing.
//
// Why not pino/winston? No new dependency, and one-line JSON is enough for
// Heroku Logplex. Swap to pino later if you need transports.

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  request_id?: string;
  tenant_id?: string;
  schema_name?: string;
  api_key_id?: number;
  [k: string]: unknown;
}

function emit(level: LogLevel, msg: string, ctx?: LogContext) {
  // stdout in production (Heroku captures it). Keep it on one line.
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    msg,
    ...ctx,
  });
  if (level === 'error' || level === 'warn') {
    console.error(line);
  } else {
    console.log(line);
  }
}

export const log = {
  debug: (msg: string, ctx?: LogContext) => {
    if (process.env.LOG_LEVEL === 'debug') emit('debug', msg, ctx);
  },
  info:  (msg: string, ctx?: LogContext) => emit('info', msg, ctx),
  warn:  (msg: string, ctx?: LogContext) => emit('warn', msg, ctx),
  error: (msg: string, ctx?: LogContext) => emit('error', msg, ctx),
};

// Per-request scoped logger that automatically merges context.
export function scopedLogger(base: LogContext) {
  return {
    debug: (msg: string, extra?: LogContext) => log.debug(msg, { ...base, ...extra }),
    info:  (msg: string, extra?: LogContext) => log.info(msg,  { ...base, ...extra }),
    warn:  (msg: string, extra?: LogContext) => log.warn(msg,  { ...base, ...extra }),
    error: (msg: string, extra?: LogContext) => log.error(msg, { ...base, ...extra }),
  };
}

export type Logger = ReturnType<typeof scopedLogger>;
