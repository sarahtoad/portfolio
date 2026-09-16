"use client";

import { motion } from "framer-motion";
import type { EducationEntry } from "@/lib/types";

export default function Education({ entries }: { entries: EducationEntry[] }) {
  return (
    <section className="px-6 py-16 max-w-4xl mx-auto">
      <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-nordic-gold/70 mb-6 text-center">
        Education
      </div>
      <div className="space-y-4">
        {entries.map((entry, i) => (
          <motion.div
            key={entry.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="border border-nordic-silver/10 bg-[#0a0c10] p-4 flex items-center gap-4"
          >
            <div className="w-3 h-3 rounded-full border-2 shrink-0" style={{ borderColor: entry.kind === "current" ? "#c9a84c" : "#4a4a4a" }} />
            <div>
              <h3 className="font-cinzel text-sm text-nordic-snow tracking-wide">{entry.title}</h3>
              <p className="font-mono text-[11px] text-nordic-silver/60 mt-0.5">{entry.line}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
