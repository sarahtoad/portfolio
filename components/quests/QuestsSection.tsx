"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import type { Quest } from "@/lib/types";
import { quests as seed } from "@/data/projects";
import { useRefetchOnVisible } from "@/lib/hooks";
import SectionHeader from "@/components/ui/SectionHeader";

export default function QuestsSection() {
  const [quests, setQuests] = useState<Quest[]>(seed);

  const load = useCallback(() => {
    fetch("/api/content/projects", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (Array.isArray(data) && data.length) setQuests(data); })
      .catch(() => {});
  }, []);

  useRefetchOnVisible(load);

  return (
    <section className="relative px-6 py-20 md:py-28 max-w-6xl mx-auto">
      <SectionHeader title="THE QUESTS" subtitle="Projects forged in code and creativity" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {quests.map((q, i) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="border border-nordic-silver/15 bg-[#0a0c10] hover:border-nordic-gold/40 transition-colors duration-300 overflow-hidden"
          >
            {q.image ? (
              <div className="relative h-48 overflow-hidden bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={q.image} alt={q.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-32 bg-gradient-to-br from-nordic-deep-blue/60 to-nordic-gold/10 flex items-center justify-center">
                <span className="font-cinzel text-2xl text-nordic-gold/30">⚔</span>
              </div>
            )}
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-cinzel text-lg text-nordic-snow tracking-wide">{q.name}</h3>
                <span className="font-mono text-[9px] tracking-widest text-nordic-gold/70 border border-nordic-gold/30 px-2 py-0.5">{q.difficulty}</span>
              </div>
              <p className="font-mono text-[10px] text-nordic-frost/60 mb-2">{q.tagline}</p>
              <p className="text-sm text-nordic-silver/70 leading-relaxed">{q.description}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {q.technologies.map((t) => (
                  <span key={t} className="font-mono text-[9px] text-nordic-silver/60 border border-nordic-silver/15 px-2 py-0.5">{t}</span>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                {q.demoUrl && (
                  <a href={q.demoUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] tracking-[0.2em] uppercase text-nordic-gold border border-nordic-gold/40 px-3 py-1.5 hover:bg-nordic-gold/10 transition-colors">
                    Demo ↗
                  </a>
                )}
                {q.repoUrl && (
                  <a href={q.repoUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] tracking-[0.2em] uppercase text-nordic-silver/60 border border-nordic-silver/20 px-3 py-1.5 hover:text-nordic-gold hover:border-nordic-gold/40 transition-colors">
                    Code ↗
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
