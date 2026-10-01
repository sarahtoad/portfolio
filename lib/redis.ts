import { Redis } from "@upstash/redis";
import { redisConfigured } from "./env";

let client: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (client !== undefined) return client;
  if (!redisConfigured()) {
    client = null;
    return client;
  }
  const url = (process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? process.env.REDIS_REST_URL)!.trim();
  const token = (process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.REDIS_REST_TOKEN)!.trim();
  client = new Redis({ url, token });
  return client;
}

const RELEASE_SCRIPT = `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`;

/** Serialises read-modify-write cycles inside a single process (local dev). */
const localQueues = new Map<string, Promise<unknown>>();

function withLocalLock<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const previous = localQueues.get(name) ?? Promise.resolve();
  const run = previous.then(fn, fn);
  localQueues.set(
    name,
    run.catch(() => undefined),
  );
  return run;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Guards a read-modify-write against concurrent serverless invocations.
 *
 * Without this, two visitors (or two admin tabs) hitting the same key at the
 * same time both read the old value and the second write silently discards the
 * first one. Redis gets a short lived `SET NX PX` lock; if the lock cannot be
 * taken we still run the mutation rather than failing the request.
 */
export async function withLock<T>(name: string, fn: () => Promise<T>, options?: { ttlMs?: number; retries?: number }): Promise<T> {
  const redis = getRedis();
  if (!redis) return withLocalLock(name, fn);

  const ttlMs = options?.ttlMs ?? 5_000;
  const retries = options?.retries ?? 8;
  const lockKey = `portfolio:lock:${name}`;
  const token = crypto.randomUUID();

  for (let attempt = 0; attempt <= retries; attempt++) {
    const acquired = await redis.set(lockKey, token, { nx: true, px: ttlMs });
    if (acquired === "OK") {
      try {
        return await fn();
      } finally {
        await redis.eval(RELEASE_SCRIPT, [lockKey], [token]).catch(() => undefined);
      }
    }
    await sleep(30 + Math.random() * 90);
  }
  return fn();
}
