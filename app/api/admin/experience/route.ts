import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/admin";
import { readStore, writeStore, generateId } from "@/lib/store";
import type { JourneyChapter } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = requireAuth(request);
  if (denied) return denied;
  return Response.json(await readStore<JourneyChapter>("experience", []));
}

export async function POST(request: NextRequest) {
  const denied = requireAuth(request);
  if (denied) return denied;
  const body = await request.json();
  const list = await readStore<JourneyChapter>("experience", []);
  const chapter: JourneyChapter = {
    id: generateId(String(body.title ?? "chapter")),
    chapter: String(body.chapter ?? ""),
    title: String(body.title ?? ""),
    institution: String(body.institution ?? ""),
    period: String(body.period ?? ""),
    description: String(body.description ?? ""),
    highlights: Array.isArray(body.highlights) ? body.highlights : String(body.highlights ?? "").split(",").map((s: string) => s.trim()).filter(Boolean),
    runeSymbol: String(body.runeSymbol ?? ""),
  };
  list.push(chapter);
  await writeStore("experience", list);
  return Response.json(chapter, { status: 201 });
}