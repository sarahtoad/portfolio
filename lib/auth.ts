import type { NextRequest } from "next/server";
import crypto from "node:crypto";
import { adminConfigError, adminPassword, adminSecret, isProduction } from "./env";
import { clientIp, rateLimit, tooManyRequests } from "./ratelimit";

export const ADMIN_COOKIE = "srsl_admin";

const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const TOKEN_MAX_AGE_MS = TOKEN_MAX_AGE_SECONDS * 1000;
const LOGIN_RATE_LIMIT = 6;
const LOGIN_RATE_WINDOW = 60;

function safeEqual(a: string, b: string) {
  if (a.length === 0 || b.length === 0) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  try {
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

function hmac(body: string) {
  const secret = adminSecret();
  return crypto.createHmac("sha256", secret).update(body).digest("base64url");
}

function signToken() {
  const payload = { admin: true, exp: Date.now() + TOKEN_MAX_AGE_MS };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${hmac(body)}`;
}

function verifyToken(token?: string) {
  if (!token) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;
  try {
    if (!safeEqual(sig, hmac(body))) return false;
    const raw = Buffer.from(body, "base64url").toString("utf8");
    const payload = JSON.parse(raw);
    return payload.admin === true && typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export async function checkLoginRateLimit(req: NextRequest) {
  const ip = clientIp(req);
  const key = `admin:login:${ip}`;
  const rl = await rateLimit(key, LOGIN_RATE_LIMIT, LOGIN_RATE_WINDOW);
  if (!rl.ok) return { allowed: false as const, response: tooManyRequests(rl) };
  return { allowed: true as const };
}

export function checkPassword(password: string) {
  const pw = adminPassword();
  if (!pw) return false;
  return safeEqual(password, pw);
}

export function verifyAuth(req: NextRequest) {
  const configErr = adminConfigError();
  if (configErr) return false;
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  return verifyToken(token);
}

export function sessionCookie() {
  const cookie: {
    name: string;
    value: string;
    httpOnly: boolean;
    sameSite: "lax" | "strict";
    path: string;
    maxAge: number;
    secure?: boolean;
  } = {
    name: ADMIN_COOKIE,
    value: signToken(),
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_MAX_AGE_SECONDS,
  };
  if (isProduction) cookie.secure = true;
  return cookie;
}

export function clearSessionCookie() {
  const cookie: ReturnType<typeof sessionCookie> & { value: string; maxAge: number } = {
    ...sessionCookie(),
    value: "",
    maxAge: 0,
  };
  return cookie;
}
