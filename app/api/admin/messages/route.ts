import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/admin";
import { readStore } from "@/lib/store";
import type { Message } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = requireAuth(request);
  if (denied) return denied;
  return Response.json(await readStore<Message>("messages", []));
}