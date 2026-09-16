import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/admin";
import { readStore, writeStore } from "@/lib/store";
import { storageError } from "@/lib/routeErr";
import type { ArtProject } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAuth(request);
  if (denied) return denied;
  const { id } = await params;
  const body = await request.json();
  const list = await readStore<ArtProject>("artprojects", []);
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
  list[idx] = { ...list[idx], ...body, id };
  try {
    await writeStore("artprojects", list);
  } catch (e) {
    return storageError(e);
  }
  return Response.json(list[idx]);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAuth(request);
  if (denied) return denied;
  const { id } = await params;
  const list = await readStore<ArtProject>("artprojects", []);
  const filtered = list.filter((p) => p.id !== id);
  try {
    await writeStore("artprojects", filtered);
  } catch (e) {
    return storageError(e);
  }
  return Response.json({ ok: true });
}