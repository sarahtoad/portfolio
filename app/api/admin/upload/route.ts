import type { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { requireAuth } from "@/lib/admin";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_FOLDERS = new Set(["certs", "projects", "art"]);

function sanitizeName(name: string) {
  const safe = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  return safe || "file";
}

export async function POST(request: NextRequest) {
  const denied = requireAuth(request);
  if (denied) return denied;

  let body: { name?: unknown; data?: unknown; folder?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const folder = ALLOWED_FOLDERS.has(String(body.folder)) ? String(body.folder) : "certs";
  const raw = String(body.data ?? "");
  const name = sanitizeName(String(body.name ?? "upload.png"));
  const base64 = raw.includes(",") ? raw.slice(raw.indexOf(",") + 1) : raw;

  let buffer: Buffer;
  try {
    buffer = Buffer.from(base64, "base64");
  } catch {
    return Response.json({ error: "Invalid data" }, { status: 400 });
  }
  if (buffer.length === 0 || buffer.length > MAX_BYTES) {
    return Response.json({ error: "File must be under 8 MB" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.promises.mkdir(uploadDir, { recursive: true });
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${name}`;
  await fs.promises.writeFile(path.join(uploadDir, unique), buffer);

  return Response.json({ url: `/uploads/${folder}/${unique}` }, { status: 201 });
}