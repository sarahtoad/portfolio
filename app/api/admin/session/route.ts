import type { NextRequest } from "next/server";
import { verifyAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return Response.json({ ok: verifyAuth(request) });
}