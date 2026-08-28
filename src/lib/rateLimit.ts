/**
 * Fixed-window rate limiter held in process memory.
 *
 * Deliberately free of Next imports so it can be unit tested under plain Node.
 * The `next/headers` variant lives in ./requestIp.
 *
 * Scope and limits, stated plainly: this counts per server instance. A
 * multi-instance or serverless deployment gives each instance its own counters,
 * so the effective limit is `limit x instances`. That is still a large
 * improvement over the previous behaviour (no limit at all — 12 rapid wrong
 * passwords were accepted with no delay), but a shared store such as Redis or
 * Vercel KV is the correct fix if this site ever runs more than one instance.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// An unbounded map keyed by client IP would itself be a memory-exhaustion
// vector, so expired entries are swept and the map is hard-capped.
const MAX_KEYS = 10_000;

function sweep(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  if (buckets.size > MAX_KEYS) {
    // Oldest-first eviction; Map preserves insertion order.
    const excess = buckets.size - MAX_KEYS;
    let removed = 0;
    for (const key of buckets.keys()) {
      buckets.delete(key);
      if (++removed >= excess) break;
    }
  }
}

export type RateLimitResult = { ok: boolean; retryAfterSeconds: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  if (Math.random() < 0.05) sweep(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSeconds: 0 };
}

/**
 * For route handlers, which already hold a Request.
 * Best-effort only: proxy headers are spoofable, so this is abuse damping,
 * not identity.
 */
export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Exposed for tests. */
export function __resetRateLimits() {
  buckets.clear();
}
