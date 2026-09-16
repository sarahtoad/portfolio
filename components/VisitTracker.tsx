"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function VisitTracker() {
  const pathname = usePathname();
  const tracked = useRef(false);

  useEffect(() => {
    try {
      if (!window.sessionStorage.getItem("srsl_tracked")) {
        window.sessionStorage.setItem("srsl_tracked", "1");
        fetch("/api/track/visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referrer: document.referrer }),
        }).catch(() => {});
      }
    } catch { /* private mode */ }
  }, []);

  useEffect(() => {
    if (!pathname) return;
    if (tracked.current) {
      fetch("/api/track/visit", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ page: pathname }) }).catch(() => {});
    } else {
      tracked.current = true;
    }
  }, [pathname]);

  return null;
}
