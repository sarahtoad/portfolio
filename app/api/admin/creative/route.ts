import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/admin";
import { readStore, writeStore, generateId } from "@/lib/store";
import type { ArtForm } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = requireAuth(request);
  if (denied) return denied;
  return Response.json(await readStore<ArtForm>("creative", []));
}

export async function POST(request: NextRequest) {
  const denied = requireAuth(request);
  if (denied) return denied;
  const body = await request.json();
  const list = await readStore<ArtForm>("creative", []);
  const art: ArtForm = {
    id: generateId(String(body.name ?? "art")),
    name: String(body.name ?? ""),
    description: String(body.description ?? ""),
    icon: String(body.icon ?? "sparkles"),
    runeWord: String(body.runeWord ?? ""),
  };
  list.push(art);
  await writeStore("creative", list);
  return Response.json(art, { status: 201 });
}