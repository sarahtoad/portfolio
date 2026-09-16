import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/admin";
import { readStore, writeStore } from "@/lib/store";
import { storageError } from "@/lib/routeErr";
import type { Quest } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAuth(request);
  if (denied) return denied;
  const { id } = await params;
  const body = await request.json();
  const quests = await readStore<Quest>("projects", []);
  const idx = quests.findIndex((q) => q.id === id);
  if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
  const updated = { ...quests[idx], ...body, id };
  if (typeof updated.technologies === "string") updated.technologies = updated.technologies.split(",").map((s: string) => s.trim()).filter(Boolean);
  if (typeof updated.achievements === "string") updated.achievements = updated.achievements.split(",").map((s: string) => s.trim()).filter(Boolean);
  if (typeof updated.lessons === "string") updated.lessons = updated.lessons.split(",").map((s: string) => s.trim()).filter(Boolean);
  quests[idx] = updated;
  try {
    await writeStore("projects", quests);
  } catch (e) {
    return storageError(e);
  }
  return Response.json(quests[idx]);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAuth(request);
  if (denied) return denied;
  const { id } = await params;
  const quests = await readStore<Quest>("projects", []);
  const filtered = quests.filter((q) => q.id !== id);
  try {
    await writeStore("projects", filtered);
  } catch (e) {
    return storageError(e);
  }
  return Response.json({ ok: true });
}