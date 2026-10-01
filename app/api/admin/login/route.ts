import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { checkLoginRateLimit, checkPassword, sessionCookie } from "@/lib/auth";
import { adminConfigError } from "@/lib/env";

export async function POST(request: NextRequest) {
  const rl = await checkLoginRateLimit(request);
  if (!rl.allowed) return rl.response;

  let password = "";
  try {
    const body = await request.json();
    password = String(body?.password ?? "");
  } catch {
    password = "";
  }

  if (!checkPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const configErr = adminConfigError();
  if (configErr) {
    return NextResponse.json({ error: configErr }, { status: 503 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie());
  return res;
}
