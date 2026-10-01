import { getRedis } from "./redis";

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

const localBuckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Fixed window limiter backed by Redis.
 *
 * Fails open when Redis is missing so a missing integration can never take the
 * public site down; on Vercel the buckets are simply per-instance in that case.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  const redis = getRedis();

  if (!redis) {
    const now = Date.now();
    const bucket = localBuckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      localBuckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
      if (localBuckets.size > 5_000) localBuckets.clear();
      return { ok: true, remaining: limit - 1, retryAfterSeconds: windowSeconds };
    }
    bucket.count += 1;
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return {
      ok: bucket.count <= limit,
      remaining: Math.max(0, limit - bucket.count),
      retryAfterSeconds,
    };
  }

  const redisKey = `portfolio:ratelimit:${key}`;
  const count = await redis.incr(redisKey);
  if (count === 1) await redis.expire(redisKey, windowSeconds);

  const ok = count <= limit;
  return {
    ok,
    remaining: Math.max(0, limit - count),
    retryAfterSeconds: ok ? 0 : Number((await redis.ttl(redisKey)).toString()) || windowSeconds,
  };
}

export function tooManyRequests(result: RateLimitResult) {
  return Response.json(
    { error: "Too many requests. Please slow down and try again shortly." },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } },
  );
}

/** Sanitises a page path so client input cannot pollute the analytics keys. */
export function safePath(input: string) {
  const raw = input.split("?")[0].split("#")[0].slice(0, 64);
  if (!raw.startsWith("/")) return "/";
  if (!/^\/[a-zA-Z0-9/_-]*$/.test(raw)) return "/";
  if (raw.includes("..")) return "/";
  return raw;
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
