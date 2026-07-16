import "server-only";

// In-memory fixed-window rate limiter. State lives in the process, so on a
// multi-instance / serverless host each instance keeps its own counters — this
// is a best-effort abuse/brute-force speed bump, NOT a distributed quota. Good
// enough on the current single-process shared host; revisit if we scale out.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000; // hard cap so a flood of unique keys can't grow memory unbounded

export type RateLimitResult = { ok: boolean; remaining: number; retryAfterSec: number };

/** Allow up to `limit` hits per `windowMs` for `key`. Call once per request. */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now(); // runtime request handler — Date.now() is fine here
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    if (buckets.size >= MAX_BUCKETS) prune(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSec: 0 };
  }
  if (existing.count >= limit) {
    return { ok: false, remaining: 0, retryAfterSec: Math.ceil((existing.resetAt - now) / 1000) };
  }
  existing.count += 1;
  return { ok: true, remaining: limit - existing.count, retryAfterSec: 0 };
}

/** Drop expired buckets (called only when the map hits its cap). */
function prune(now: number) {
  for (const [k, b] of buckets) if (now >= b.resetAt) buckets.delete(k);
}

/** Best-effort client IP from the usual proxy headers. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Standard 429 JSON response with a Retry-After header. */
export function tooMany(retryAfterSec: number) {
  return Response.json(
    { error: "Too many requests. Please slow down and try again shortly." },
    { status: 429, headers: { "Retry-After": String(Math.max(1, retryAfterSec)) } },
  );
}
