/**
 * Base URL of the standalone backend. Configure via NEXT_PUBLIC_API_URL.
 * When empty the API is assumed to be served from the same origin (dev/SSR).
 */
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

export function apiUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE}${path}`;
}

/**
 * Fetch helper that always sends cross-site credentials so the admin session
 * cookie (set by the backend) is included on every request.
 */
export function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), {
    credentials: "include",
    ...options,
  });
}