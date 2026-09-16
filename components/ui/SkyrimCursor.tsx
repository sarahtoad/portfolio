"use client";

import { useEffect, useRef } from "react";

export default function SkyrimCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pos = { x: -100, y: -100 };
    const cur = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };
    let raf = 0;
    let hovering = false;

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const target = (e.target as HTMLElement).closest(
        "a, button, input, textarea, select, label, [data-cursor]"
      );
      hovering = !!target;
    };

    const onDown = () => {
      if (cursorRef.current)
        cursorRef.current.style.scale = hovering ? "1.25" : "0.8";
    };
    const onUp = () => {
      if (cursorRef.current) cursorRef.current.style.scale = "1";
    };

    const loop = () => {
      cur.x += (pos.x - cur.x) * 0.6;
      cur.y += (pos.y - cur.y) * 0.6;
      ring.x += (pos.x - ring.x) * 0.35;
      ring.y += (pos.y - ring.y) * 0.35;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
        cursorRef.current.style.opacity = "1";
        if (!hovering) cursorRef.current.style.scale = "1";
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) scale(${hovering ? 1.25 : 1})`;
        ringRef.current.style.opacity = hovering ? "1" : "0.55";
      }

      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-nordic-gold/25 opacity-0 transition-opacity duration-300"
        aria-hidden="true"
      />
      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] opacity-0"
        aria-hidden="true"
      >
        <div className="relative -translate-x-1/2 -translate-y-1/2">
          <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 border-nordic-gold/80 shadow-[0_0_8px_rgba(201,168,76,0.65)] animate-spin-slow" />
          <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-nordic-gold shadow-[0_0_6px_rgba(201,168,76,0.9)]" />
        </div>
      </div>
    </>
  );
}