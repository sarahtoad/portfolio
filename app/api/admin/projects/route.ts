import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/admin";
import { readStore, writeStore, generateId } from "@/lib/store";
import type { Quest } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = requireAuth(request);
  if (denied) return denied;
  const quests = await readStore<Quest>("projects", []);
  return Response.json(quests);
}

export async function POST(request: NextRequest) {
  const denied = requireAuth(request);
  if (denied) return denied;
  const body = await request.json();
  const quests = await readStore<Quest>("projects", []);
  const quest: Quest = {
    id: generateId(String(body.name ?? "quest")),
    name: String(body.name ?? ""),
    tagline: String(body.tagline ?? ""),
    status: body.status === "IN PROGRESS" ? "IN PROGRESS" : "COMPLETED",
    difficulty: ["APPRENTICE", "JOURNEYMAN", "EXPERT", "MASTER"].includes(body.difficulty) ? body.difficulty : "APPRENTICE",
    objective: String(body.objective ?? ""),
    description: String(body.description ?? ""),
    technologies: Array.isArray(body.technologies) ? body.technologies : String(body.technologies ?? "").split(",").map((s: string) => s.trim()).filter(Boolean),
    achievements: Array.isArray(body.achievements) ? body.achievements : String(body.achievements ?? "").split(",").map((s: string) => s.trim()).filter(Boolean),
    lessons: Array.isArray(body.lessons) ? body.lessons : String(body.lessons ?? "").split(",").map((s: string) => s.trim()).filter(Boolean),
    image: String(body.image ?? ""),
    demoUrl: String(body.demoUrl ?? ""),
    repoUrl: String(body.repoUrl ?? ""),
  };
  quests.push(quest);
  await writeStore("projects", quests);
  return Response.json(quest, { status: 201 });
}