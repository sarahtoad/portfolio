import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/admin";
import { readStats, writeStats } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = requireAuth(request);
  if (denied) return denied;
  const stats = await readStats();

  const last14: { day: string; visits: number; unique: number; pageViews: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    last14.push({
      day: key,
      visits: stats.days[key]?.visits ?? 0,
      unique: stats.days[key]?.unique ?? 0,
      pageViews: stats.days[key]?.pageViews ?? 0,
    });
  }

  return Response.json({ ...stats, last14 });
}

export async function DELETE(request: NextRequest) {
  const denied = requireAuth(request);
  if (denied) return denied;
  await writeStats({
    totalVisits: 0,
    uniqueVisitors: 0,
    totalPageViews: 0,
    days: {},
    pageViewsByPath: {},
    referrers: {},
    browsers: {},
    devices: {},
  });
  return Response.json({ ok: true });
}