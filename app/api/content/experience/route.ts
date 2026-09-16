import { readJourney } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const experience = await readJourney();
  return Response.json(experience);
}