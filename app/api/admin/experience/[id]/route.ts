import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/admin";
import { readStore, writeStore } from "@/lib/store";
import { storageError } from "@/lib/routeErr";
import type { JourneyChapter } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAuth(request);
  if (denied) return denied;
  const { id } = await params;
  const body = await request.json();
  const list = await readStore<JourneyChapter>("experience", []);
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
  const updated = { ...list[idx], ...body, id };
  if (typeof updated.highlights === "string") updated.highlights = updated.highlights.split(",").map((s: string) => s.trim()).filter(Boolean);
  list[idx] = updated;
  try {
    await writeStore("experience", list);
  } catch (e) {
    return storageError(e);
  }
  return Response.json(list[idx]);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAuth(request);
  if (denied) return denied;
  const { id } = await params;
  const list = await readStore<JourneyChapter>("experience", []);
  const filtered = list.filter((c) => c.id !== id);
  try {
    await writeStore("experience", filtered);
  } catch (e) {
    return storageError(e);
  }
  return Response.json({ ok: true });
}