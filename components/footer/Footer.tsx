"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-nordic-gold/10 py-8 mt-20">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <div className="h-px bg-gradient-to-r from-transparent via-nordic-gold/30 to-transparent mb-6" />
        <p className="font-mono text-[10px] tracking-[0.25em] text-nordic-silver/40 uppercase">
          Crafted with passion · Sarah Khodja · {new Date().getFullYear()}
        </p>
        <Link
          href="/admin"
          className="inline-block mt-3 font-mono text-[9px] tracking-[0.2em] text-nordic-silver/20 hover:text-nordic-gold/40 transition-colors uppercase"
        >
          ◆
        </Link>
      </div>
    </footer>
  );
}
