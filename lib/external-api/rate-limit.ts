// lib/external-api/rate-limit.ts
//
// Token-bucket rate limiter, in-process. Per API-key.
//
// PRODUCTION NOTE: This is per-dyno. If you scale to >1 dyno, each gets its
// own bucket → effective limit = limit_rpm × dyno_count. For strict global
// limits, replace with Redis (Upstash on Heroku) using INCR + EXPIRE.
//
// Math: bucket fills at rate_rpm tokens per 60s, capacity = rate_rpm.
// Each request costs 1 token. If empty, return retry-after.

import { ApiError } from './errors';

interface Bucket {
  tokens: number;
  capacity: number;
  refillPerMs: number;
  lastRefillMs: number;
}

const buckets = new Map<number, Bucket>();
const MAX_BUCKETS = 10_000; // soft cap; LRU-ish trim below

export function check(apiKeyId: number, rpm: number): void {
  if (rpm <= 0) return; // no limit configured
  const now = Date.now();

  let b = buckets.get(apiKeyId);
  if (!b) {
    if (buckets.size >= MAX_BUCKETS) trimBuckets();
    b = {
      tokens: rpm,
      capacity: rpm,
      refillPerMs: rpm / 60_000,
      lastRefillMs: now,
    };
    buckets.set(apiKeyId, b);
  }

  // Refill: tokens accrued since last check, capped at capacity.
  const elapsed = now - b.lastRefillMs;
  if (elapsed > 0) {
    b.tokens = Math.min(b.capacity, b.tokens + elapsed * b.refillPerMs);
    b.lastRefillMs = now;
  }

  if (b.tokens < 1) {
    const msUntilOne = (1 - b.tokens) / b.refillPerMs;
    const retryAfterSeconds = Math.max(1, Math.ceil(msUntilOne / 1000));
    throw ApiError.rateLimited(retryAfterSeconds);
  }

  b.tokens -= 1;
}

/** Remove the oldest 10% of buckets when at capacity. Cheap, infrequent. */
function trimBuckets(): void {
  const sorted = Array.from(buckets.entries()).sort((a, b) => a[1].lastRefillMs - b[1].lastRefillMs);
  const drop = Math.ceil(sorted.length * 0.1);
  for (let i = 0; i < drop; i++) buckets.delete(sorted[i][0]);
}

// Test hook — clears all buckets.
export function _resetBuckets(): void {
  buckets.clear();
}
