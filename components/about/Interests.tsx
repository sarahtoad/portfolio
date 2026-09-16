"use client";

import { motion } from "framer-motion";
import type { Interest } from "@/lib/types";

export default function Interests({ interests }: { interests: Interest[] }) {
  return (
    <section className="px-6 py-16 max-w-6xl mx-auto">
      <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-nordic-gold/70 mb-6 text-center">
        Beyond the Code
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {interests.map((interest, i) => (
          <motion.div
            key={interest.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="border border-nordic-silver/10 bg-[#0a0c10] p-4 hover:border-nordic-gold/30 transition-colors"
          >
            <span className="text-2xl">{interest.glyph}</span>
            <h3 className="mt-2 font-cinzel text-sm text-nordic-snow tracking-wide">{interest.name}</h3>
            <p className="mt-1 text-xs text-nordic-silver/60 leading-relaxed">{interest.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
