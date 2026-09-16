import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyAuth, clearSessionCookie } from "./auth";

export function requireAuth(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}