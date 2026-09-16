import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { readStore, writeStore, generateId } from "@/lib/store";
import type { Message } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: { name?: string; email?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const messages = await readStore<Message>("messages", []);
  const newMsg: Message = {
    id: generateId("raven"),
    name,
    email,
    message,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  messages.push(newMsg);
  await writeStore("messages", messages);

  return NextResponse.json({ ok: true }, { status: 201 });
}