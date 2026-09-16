import { readArtProjects } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artId = searchParams.get("artId");
  let projects = await readArtProjects();
  if (artId) {
    projects = projects.filter((p) => p.artId === artId);
  }
  projects.sort((a, b) => (b.year ?? "").localeCompare(a.year ?? ""));
  return Response.json(projects);
}