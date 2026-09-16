import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/admin";
import { readStore, writeStore } from "@/lib/store";
import { storageError } from "@/lib/routeErr";
import type { Certificate } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAuth(request);
  if (denied) return denied;
  const { id } = await params;
  const body = await request.json();
  const certs = await readStore<Certificate>("certificates", []);
  const idx = certs.findIndex((c) => c.id === id);
  if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
  certs[idx] = { ...certs[idx], ...body, id, image: "image" in body ? String(body.image ?? "") : certs[idx].image };
  try {
    await writeStore("certificates", certs);
  } catch (e) {
    return storageError(e);
  }
  return Response.json(certs[idx]);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAuth(request);
  if (denied) return denied;
  const { id } = await params;
  const certs = await readStore<Certificate>("certificates", []);
  const filtered = certs.filter((c) => c.id !== id);
  try {
    await writeStore("certificates", filtered);
  } catch (e) {
    return storageError(e);
  }
  return Response.json({ ok: true });
}