"use client";

import { motion } from "framer-motion";
import { contactChannels } from "@/data/contact";

export default function Channels() {
  return (
    <section className="px-6 py-16 max-w-4xl mx-auto">
      <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-nordic-gold/70 mb-6 text-center">
        Channels
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {contactChannels.map((ch, i) => (
          <motion.div
            key={ch.label}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="border border-nordic-silver/10 bg-[#0a0c10] p-4 text-center"
          >
            <span className="text-2xl">{ch.icon}</span>
            <div className="mt-2 font-cinzel text-sm text-nordic-snow tracking-wide">{ch.label}</div>
            <div className="mt-1 font-mono text-[10px] text-nordic-silver/60">{ch.value}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
