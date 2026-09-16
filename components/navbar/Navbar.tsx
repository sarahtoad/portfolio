"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "@/data/menu";
import { playQuestSound } from "@/lib/sound";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/90 backdrop-blur-sm border-b border-nordic-gold/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-cinzel text-lg tracking-wider text-nordic-gold hover:text-nordic-snow transition-colors">
          SARAH
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={playQuestSound}
              className={`font-mono text-[10px] tracking-[0.2em] uppercase transition-colors ${
                pathname === item.href
                  ? "text-nordic-gold"
                  : "text-nordic-silver/60 hover:text-nordic-gold"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-nordic-silver/60 hover:text-nordic-gold"
          aria-label="Menu"
        >
          <span className="text-xl">{open ? "✕" : "☰"}</span>
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-nordic-gold/10 bg-[#050505]/95 backdrop-blur-sm">
          <div className="px-6 py-4 space-y-3">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { setOpen(false); playQuestSound(); }}
                className={`block font-mono text-[11px] tracking-[0.2em] uppercase transition-colors ${
                  pathname === item.href
                    ? "text-nordic-gold"
                    : "text-nordic-silver/60 hover:text-nordic-gold"
                }`}
              >
                <span className="mr-2">{item.rune}</span> {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
