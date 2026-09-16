import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/admin";
import { readStore, writeStore } from "@/lib/store";
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
  await writeStore("projects", quests);
  return Response.json(quests[idx]);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAuth(request);
  if (denied) return denied;
  const { id } = await params;
  const quests = await readStore<Quest>("projects", []);
  await writeStore("projects", quests.filter((q) => q.id !== id));
  return Response.json({ ok: true });
}