import { readCertificates } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const certs = await readCertificates();
  return Response.json(certs);
}