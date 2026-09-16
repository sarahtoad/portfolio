import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/admin";
import { readAbout, writeAbout } from "@/lib/store";
import { storageError } from "@/lib/routeErr";
import type { AboutContent } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = requireAuth(request);
  if (denied) return denied;
  return Response.json(await readAbout());
}

export async function POST(request: NextRequest) {
  const denied = requireAuth(request);
  if (denied) return denied;
  const body = (await request.json()) as Partial<AboutContent>;
  const current = await readAbout();
  const updated: AboutContent = { ...current, ...body };
  try {
    await writeAbout(updated);
  } catch (e) {
    return storageError(e);
  }
  return Response.json(updated);
}