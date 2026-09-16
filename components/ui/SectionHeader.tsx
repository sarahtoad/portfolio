"use client";

import { motion } from "framer-motion";

export default function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12 md:mb-16"
    >
      <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-nordic-gold/70 mb-2">
        ◆ {title} ◆
      </div>
      <div className="mt-2 h-px bg-gradient-to-r from-transparent via-nordic-gold/50 to-transparent" />
      {subtitle && (
        <p className="mt-4 font-cinzel italic text-nordic-silver/60 text-sm md:text-base max-w-xl mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
