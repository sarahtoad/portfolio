import { readAbout } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const about = await readAbout();
  return Response.json(about);
}