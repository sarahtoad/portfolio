import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { readStats, writeStats, generateId } from "@/lib/store";

export const dynamic = "force-dynamic";
const VISITOR_COOKIE = "srsl_uid";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function referrerHost(referrer?: string) {
  if (!referrer) return "direct";
  try {
    const u = new URL(referrer);
    return u.hostname || "direct";
  } catch {
    return "direct";
  }
}

function profile(userAgent?: string | null): { browser: string; device: string } {
  const ua = userAgent ?? "";
  const low = ua.toLowerCase();
  const device = /ipad|tablet/.test(low)
    ? "Tablet"
    : /mobile|android|iphone|ipod|windows phone/.test(low)
      ? "Mobile"
      : "Desktop";
  const browser = /edg(e|iaos)?\//.test(low)
    ? "Edge"
    : /opera|opr\//.test(low)
      ? "Opera"
      : /firefox|fxios/.test(low)
        ? "Firefox"
        : /samsungbrowser/.test(low)
          ? "Samsung Internet"
          : /chrome|crios/.test(low)
            ? "Chrome"
            : /safari\//.test(low)
              ? "Safari"
              : "Other";
  return { browser, device };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as { referrer?: string };
  const stats = await readStats();
  const day = todayKey();
  const dayStats = stats.days[day] ?? { visits: 0, unique: 0, pageViews: 0 };

  stats.totalVisits += 1;
  dayStats.visits += 1;

  const res = NextResponse.json({ ok: true });

  const visitorId = request.cookies.get(VISITOR_COOKIE)?.value;
  if (!visitorId) {
    stats.uniqueVisitors += 1;
    dayStats.unique += 1;
    const newId = generateId("visitor");
    res.cookies.set(VISITOR_COOKIE, newId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  const ref = referrerHost(body.referrer);
  stats.referrers[ref] = (stats.referrers[ref] ?? 0) + 1;
  const { browser, device } = profile(request.headers.get("user-agent"));
  stats.browsers[browser] = (stats.browsers[browser] ?? 0) + 1;
  stats.devices[device] = (stats.devices[device] ?? 0) + 1;

  stats.days[day] = dayStats;
  await writeStats(stats);
  return res;
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as { page?: string };
  const stats = await readStats();
  const day = todayKey();
  const dayStats = stats.days[day] ?? { visits: 0, unique: 0, pageViews: 0 };

  stats.totalPageViews += 1;
  dayStats.pageViews += 1;

  const page = body.page || "/";
  stats.pageViewsByPath[page] = (stats.pageViewsByPath[page] ?? 0) + 1;

  stats.days[day] = dayStats;
  await writeStats(stats);
  return NextResponse.json({ ok: true });
}