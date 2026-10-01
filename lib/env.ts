const PLACEHOLDER_SECRETS = new Set(["srsl-fallback-secret", "change-me-too", "change-me"]);

export const isProduction = process.env.NODE_ENV === "production";

/**
 * True on Vercel (and any other serverless platform) where the filesystem is
 * read-only: `fs.writeFile` into the deployment bundle always fails there, so
 * every write has to go through Redis / Vercel Blob.
 */
export const isServerless = Boolean(process.env.VERCEL) || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

export function adminPassword() {
  return (process.env.ADMIN_PASSWORD ?? "").trim();
}

export function adminSecret() {
  return (process.env.ADMIN_SECRET ?? "").trim();
}

export function blobToken() {
  return (process.env.BLOB_READ_WRITE_TOKEN ?? "").trim();
}

function usableSecret(value: string) {
  return value.length >= 16 && !PLACEHOLDER_SECRETS.has(value);
}

/** Returns a human readable reason why admin login is unusable, or null. */
export function adminConfigError(): string | null {
  const missing: string[] = [];
  if (!adminPassword()) missing.push("ADMIN_PASSWORD");
  if (!usableSecret(adminSecret())) missing.push("ADMIN_SECRET (16+ random characters)");
  if (!missing.length) return null;
  return `Admin access is not configured. Add ${missing.join(" and ")} to the Vercel project environment variables.`;
}

/** Returns a human readable reason why writes would fail, or null. */
export function storeConfigError(): string | null {
  return isServerless && !redisConfigured()
    ? "Storage is not configured. Add the Upstash Redis integration to the Vercel project (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN, or KV_REST_API_URL + KV_REST_API_TOKEN). Without it, content changes made in /admin cannot be saved."
    : null;
}

export function blobConfigError(): string | null {
  return isServerless && !blobToken()
    ? "File uploads are not configured. Add the Vercel Blob integration to the project (BLOB_READ_WRITE_TOKEN). Serverless deployments have a read-only filesystem, so files cannot be written to /public."
    : null;
}

let redisConfiguredCache: boolean | null = null;

export function redisConfigured() {
  if (redisConfiguredCache !== null) return redisConfiguredCache;
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? process.env.REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.REDIS_REST_TOKEN;
  redisConfiguredCache = Boolean(url?.trim() && token?.trim());
  return redisConfiguredCache;
}

/** Client IP as seen by Vercel's edge. */
export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
