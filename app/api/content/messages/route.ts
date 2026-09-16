import { readMessages } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const messages = await readMessages();
  const published = messages.filter((m) => m.status === "published");
  return Response.json(published);
}