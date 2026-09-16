"use client";

import { useEffect, useRef } from "react";

const GOLD = "201,168,76";
const FROST = "127,179,211";

interface PNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Spark {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  age: number;
  life: number;
}

export default function BackgroundNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let nodes: PNode[] = [];
    let sparks: Spark[] = [];
    const mouse = { x: -9999, y: -9999 };
    let w = 0;
    let h = 0;
    let dpr = 1;
    let lastSpawn = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(24, Math.min(90, Math.floor((w * h) / 22000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    };

    const spawnSpark = () => {
      if (nodes.length < 2) return;
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      const b = nodes[Math.floor(Math.random() * nodes.length)];
      sparks.push({
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        age: 0,
        life: 700 + Math.random() * 450,
      });
    };

    const drawSpark = (s: Spark) => {
      const t = s.age / s.life;
      if (t >= 1) return;
      const alpha = Math.sin(Math.PI * t);
      const steps = 9;
      const dx = s.x2 - s.x1;
      const dy = s.y2 - s.y1;
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      for (let i = 1; i < steps; i++) {
        const jag = (Math.random() - 0.5) * (8 + (1 - t) * 34);
        const nx = s.x1 + (dx * i) / steps + jag;
        const ny = s.y1 + (dy * i) / steps + jag;
        ctx.lineTo(nx, ny);
      }
      ctx.lineTo(s.x2, s.y2);
      ctx.strokeStyle = `rgba(${GOLD},${0.8 * alpha})`;
      ctx.lineWidth = 1.1;
      ctx.shadowColor = `rgba(${GOLD},${0.9 * alpha})`;
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(s.x2, s.y2, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${FROST},${0.8 * alpha})`;
      ctx.fill();
    };

    const frame = (time: number) => {
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = w + 20;
        else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        else if (n.y > h + 20) n.y = -20;
      }

      const LINK = 150;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 >= LINK * LINK) continue;
          const alpha = (1 - Math.sqrt(d2) / LINK) * 0.22;
          ctx.strokeStyle =
            (i * 7 + j) % 3 === 0
              ? `rgba(${FROST},${alpha})`
              : `rgba(${GOLD},${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      const mx = mouse.x;
      const my = mouse.y;
      if (mx > 0) {
        for (const n of nodes) {
          const dx = n.x - mx;
          const dy = n.y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 >= 220 * 220) continue;
          const alpha = (1 - Math.sqrt(d2) / 220) * 0.28;
          ctx.strokeStyle = `rgba(${GOLD},${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(mx, my);
          ctx.stroke();
        }
      }

      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${FROST},0.7)`;
        ctx.fill();
      }

      if (time - lastSpawn > 1700) {
        spawnSpark();
        lastSpawn = time;
      }
      sparks = sparks.filter((s) => (s.age += 16.7) < s.life);
      for (const s of sparks) drawSpark(s);

      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
      aria-hidden="true"
    />
  );
}