import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/admin";
import { readStore, writeStore, generateId } from "@/lib/store";
import type { ArtProject } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = requireAuth(request);
  if (denied) return denied;
  return Response.json(await readStore<ArtProject>("artprojects", []));
}

export async function POST(request: NextRequest) {
  const denied = requireAuth(request);
  if (denied) return denied;
  const body = await request.json();
  const list = await readStore<ArtProject>("artprojects", []);
  const project: ArtProject = {
    id: generateId(String(body.title ?? "work")),
    artId: String(body.artId ?? ""),
    title: String(body.title ?? ""),
    description: String(body.description ?? ""),
    year: String(body.year ?? ""),
    image: String(body.image ?? ""),
    url: String(body.url ?? ""),
    focalX: typeof body.focalX === "number" ? body.focalX : 50,
    focalY: typeof body.focalY === "number" ? body.focalY : 50,
  };
  list.push(project);
  await writeStore("artprojects", list);
  return Response.json(project, { status: 201 });
}