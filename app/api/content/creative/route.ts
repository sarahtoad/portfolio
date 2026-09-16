import { readArtForms } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const arts = await readArtForms();
  return Response.json(arts);
}