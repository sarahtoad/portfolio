import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/admin";
import { readStore, writeStore } from "@/lib/store";
import { storageError } from "@/lib/routeErr";
import type { ArtForm } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAuth(request);
  if (denied) return denied;
  const { id } = await params;
  const body = await request.json();
  const list = await readStore<ArtForm>("creative", []);
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
  list[idx] = { ...list[idx], ...body, id };
  try {
    await writeStore("creative", list);
  } catch (e) {
    return storageError(e);
  }
  return Response.json(list[idx]);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAuth(request);
  if (denied) return denied;
  const { id } = await params;
  const list = await readStore<ArtForm>("creative", []);
  const filtered = list.filter((a) => a.id !== id);
  try {
    await writeStore("creative", filtered);
  } catch (e) {
    return storageError(e);
  }
  return Response.json({ ok: true });
}