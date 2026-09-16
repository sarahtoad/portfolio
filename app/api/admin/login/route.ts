import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { checkPassword, sessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
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

  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie());
  return res;
}