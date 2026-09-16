import type { NextRequest } from "next/server";
import crypto from "node:crypto";

export const ADMIN_COOKIE = "srsl_admin";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "srsl-fallback-secret";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function checkPassword(password: string) {
  return safeEqual(password, ADMIN_PASSWORD);
}

function hmac(body: string) {
  return crypto.createHmac("sha256", ADMIN_SECRET).update(body).digest("base64url");
}

function signToken() {
  const payload = { admin: true, exp: Date.now() + TOKEN_MAX_AGE * 1000 };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${hmac(body)}`;
}

function verifyToken(token?: string) {
  if (!token) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;
  if (!safeEqual(sig, hmac(body))) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return payload.admin === true && typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function verifyAuth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  return verifyToken(token);
}

export function sessionCookie() {
  const value = signToken();
  return {
    name: ADMIN_COOKIE,
    value,
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: TOKEN_MAX_AGE,
  };
}

export function clearSessionCookie() {
  return {
    name: ADMIN_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}