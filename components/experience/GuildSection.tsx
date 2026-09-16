"use client";

import { motion } from "framer-motion";
import { guildInfo } from "@/data/guild";

export default function GuildSection() {
  return (
    <section className="px-6 py-20 max-w-4xl mx-auto">
      <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-nordic-gold/70 mb-6 text-center">
        ◆ {guildInfo.name} ◆
      </div>
      <p className="text-center font-cinzel italic text-nordic-silver/60 text-sm mb-8">&quot;{guildInfo.motto}&quot;</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {guildInfo.ranks.map((rank, i) => (
          <motion.div
            key={rank.tier}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="border border-nordic-silver/10 bg-[#0a0c10] p-4"
          >
            <div className="font-mono text-[9px] tracking-[0.25em] uppercase text-nordic-gold/60">{rank.tier}</div>
            <p className="mt-1 text-sm text-nordic-silver/70">{rank.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
