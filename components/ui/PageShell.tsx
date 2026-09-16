"use client";

import type { ReactNode } from "react";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import BackgroundAura from "@/components/ui/BackgroundAura";
import BackgroundNetwork from "@/components/ui/BackgroundNetwork";

export default function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 bg-[#050505]">
        <BackgroundNetwork />
        <BackgroundAura />
      </div>
      <Navbar />
      <main className="pt-20">
        <div className="text-center py-12 md:py-16">
          <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-nordic-gold/70 mb-2">
            ◆ {title} ◆
          </div>
          {subtitle && (
            <p className="mt-2 font-cinzel italic text-nordic-silver/60 text-sm max-w-lg mx-auto px-4">
              {subtitle}
            </p>
          )}
          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-nordic-gold/50 to-transparent" />
        </div>
        {children}
      </main>
      <Footer />
    </div>
  );
}
