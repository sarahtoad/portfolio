"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { JourneyChapter } from "@/lib/types";
import { journeyChapters as seed } from "@/data/journey";
import { useRefetchOnVisible } from "@/lib/hooks";
import SectionHeader from "@/components/ui/SectionHeader";

export default function JourneySection() {
  const [chapters, setChapters] = useState<JourneyChapter[]>(seed);

  const load = useCallback(() => {
    fetch("/api/content/experience", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (Array.isArray(data) && data.length) setChapters(data); })
      .catch(() => {});
  }, []);

  useRefetchOnVisible(load);

  return (
    <section className="relative px-6 py-20 md:py-28 max-w-4xl mx-auto">
      <SectionHeader title="THE JOURNEY" subtitle="Chapters of growth and discovery" />
      <div className="relative">
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-nordic-gold/50 via-nordic-gold/20 to-transparent" />
        {chapters.map((ch, i) => (
          <motion.div
            key={ch.id}
            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className={`relative mb-12 pl-12 md:pl-0 md:w-[45%] ${i % 2 === 0 ? "md:mr-auto md:pr-12 md:text-right" : "md:ml-auto md:pl-12"}`}
          >
            <div className="absolute left-2 md:left-auto md:right-[-5px] top-1 w-3 h-3 border-2 border-nordic-gold rounded-full bg-[#050505] z-10" style={i % 2 !== 0 ? { left: "-5px", right: "auto" } : {}} />
            <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-nordic-gold/60 mb-1">{ch.chapter} {ch.runeSymbol}</div>
            <h3 className="font-cinzel text-lg text-nordic-snow tracking-wide">{ch.title}</h3>
            <div className="font-mono text-[10px] text-nordic-frost/60 mt-0.5">{ch.institution} · {ch.period}</div>
            <p className="mt-2 text-sm text-nordic-silver/70 leading-relaxed">{ch.description}</p>
            <div className="mt-2 flex flex-wrap gap-1 justify-start md:justify-end">
              {ch.highlights.map((h) => (
                <span key={h} className="font-mono text-[9px] text-nordic-gold/60 border border-nordic-gold/20 px-2 py-0.5">{h}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
