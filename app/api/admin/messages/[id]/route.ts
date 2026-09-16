import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/admin";
import { readStore, writeStore } from "@/lib/store";
import type { Message } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAuth(request);
  if (denied) return denied;
  const { id } = await params;
  const body = await request.json();
  const list = await readStore<Message>("messages", []);
  const idx = list.findIndex((m) => m.id === id);
  if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
  list[idx] = { ...list[idx], ...body, id };
  await writeStore("messages", list);
  return Response.json(list[idx]);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAuth(request);
  if (denied) return denied;
  const { id } = await params;
  const list = await readStore<Message>("messages", []);
  await writeStore("messages", list.filter((m) => m.id !== id));
  return Response.json({ ok: true });
}