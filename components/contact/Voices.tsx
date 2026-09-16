"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import type { Message } from "@/lib/types";
import { useRefetchOnVisible } from "@/lib/hooks";

export default function Voices() {
  const [messages, setMessages] = useState<Message[]>([]);

  const load = useCallback(() => {
    fetch("/api/content/messages", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { if (Array.isArray(data)) setMessages(data); })
      .catch(() => {});
  }, []);

  useRefetchOnVisible(load);

  if (messages.length === 0) return null;

  return (
    <section className="px-6 py-16 max-w-4xl mx-auto">
      <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-nordic-gold/70 mb-6 text-center">
        Voices from the Realm
      </div>
      <div className="space-y-3">
        {messages.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="border border-nordic-silver/10 bg-[#0a0c10] p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-cinzel text-sm text-nordic-snow">{m.name}</span>
              <span className="font-mono text-[9px] text-nordic-silver/40">{new Date(m.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-nordic-silver/70 leading-relaxed">{m.message}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
