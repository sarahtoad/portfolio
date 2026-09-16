import { readQuests } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const projects = await readQuests();
  return Response.json(projects);
}