import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { readStats, generateId, recordVisit, recordPageView } from "@/lib/store";

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
  const day = todayKey();
  const ref = referrerHost(body.referrer);
  const { browser, device } = profile(request.headers.get("user-agent"));

  const res = NextResponse.json({ ok: true });
  const visitorId = request.cookies.get(VISITOR_COOKIE)?.value;
  if (!visitorId) {
    const newId = generateId("visitor");
    res.cookies.set(VISITOR_COOKIE, newId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  try {
    await recordVisit({ day, referrer: ref, browser, device, unique: !visitorId });
  } catch {
    /* never break the visitor experience */
  }
  return res;
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as { page?: string };
  const day = todayKey();
  const page = body.page || "/";

  try {
    await recordPageView(day, page);
  } catch {
    /* never break the visitor experience */
  }
  return NextResponse.json({ ok: true });
}
