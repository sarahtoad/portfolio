"use client";

import { useEffect, useCallback } from "react";

export function useRefetchOnVisible(callback: () => void) {
  const stableCallback = useCallback(callback, [callback]);

  useEffect(() => {
    const handler = () => stableCallback();

    stableCallback();

    window.addEventListener("pageshow", handler);
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") handler();
    });

    return () => {
      window.removeEventListener("pageshow", handler);
      window.removeEventListener("visibilitychange", handler);
    };
  }, [stableCallback]);
}