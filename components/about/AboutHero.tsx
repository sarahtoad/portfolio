"use client";

import { motion } from "framer-motion";
import type { AboutContent } from "@/lib/types";

export default function AboutHero({ content }: { content: AboutContent }) {
  return (
    <section className="relative px-6 py-16 md:py-24 max-w-4xl mx-auto text-center">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-nordic-gold/60 mb-4">The Adventurer</div>
        <h1 className="font-cinzel text-3xl md:text-5xl text-nordic-snow tracking-wide leading-tight">
          {content.heroTagline}
        </h1>
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-nordic-gold/50 to-transparent" />
        <p className="mt-8 text-nordic-silver/80 leading-relaxed max-w-2xl mx-auto text-sm md:text-base">
          {content.bio}
        </p>
      </motion.div>
    </section>
  );
}
