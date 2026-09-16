import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/admin";
import { readStore, writeStore, generateId } from "@/lib/store";
import type { Certificate } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = requireAuth(request);
  if (denied) return denied;
  const certs = await readStore<Certificate>("certificates", []);
  return Response.json(certs);
}

export async function POST(request: NextRequest) {
  const denied = requireAuth(request);
  if (denied) return denied;
  const body = await request.json();
  const certs = await readStore<Certificate>("certificates", []);
  const cert: Certificate = {
    id: generateId(String(body.title ?? "cert")),
    title: String(body.title ?? ""),
    issuer: String(body.issuer ?? ""),
    year: String(body.year ?? ""),
    description: String(body.description ?? ""),
    seal: String(body.seal ?? "ᚨ"),
    verifyUrl: String(body.verifyUrl ?? ""),
    image: String(body.image ?? ""),
  };
  certs.push(cert);
  await writeStore("certificates", certs);
  return Response.json(cert, { status: 201 });
}