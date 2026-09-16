"use client";

import { motion } from "framer-motion";
import type { SkillBar, SkillGroup } from "@/lib/types";

export default function SkillTree({ bars, groups }: { bars: SkillBar[]; groups: SkillGroup[] }) {
  return (
    <section className="px-6 py-16 max-w-4xl mx-auto">
      <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-nordic-gold/70 mb-8 text-center">
        Skill Tree
      </div>
      <div className="space-y-4 mb-12">
        {bars.map((bar, i) => (
          <motion.div
            key={bar.name}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <div className="flex justify-between mb-1">
              <span className="font-mono text-xs text-nordic-snow">{bar.name}</span>
              <span className="font-mono text-xs text-nordic-gold">{bar.level}%</span>
            </div>
            <div className="h-2 bg-nordic-void border border-nordic-silver/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${bar.level}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className="h-full"
                style={{ background: bar.color ?? "#c9a84c" }}
              />
            </div>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {groups.map((group, i) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="border border-nordic-silver/10 bg-[#0a0c10] p-4"
          >
            <div className="font-mono text-[9px] tracking-[0.25em] uppercase text-nordic-gold/60 mb-1">{group.tier}</div>
            <h3 className="font-cinzel text-sm text-nordic-snow tracking-wide">{group.title}</h3>
            <div className="mt-2 flex flex-wrap gap-1">
              {group.skills.map((skill) => (
                <span key={skill} className="font-mono text-[10px] text-nordic-silver/70 border border-nordic-silver/10 px-2 py-0.5">
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
