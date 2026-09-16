"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const inputCls = "w-full bg-[#0a0c10] border border-nordic-silver/20 text-nordic-snow px-3 py-2 text-sm focus:outline-none focus:border-nordic-gold/60 transition-colors";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSent(true);
      setForm({ name: "", email: "", message: "" });
    } catch {
      /* silent */
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
        <div className="text-3xl mb-3">✦</div>
        <p className="font-cinzel text-nordic-gold tracking-wide">Your raven has been sent.</p>
        <p className="mt-2 font-mono text-xs text-nordic-silver/60">I will respond when the winds carry it back.</p>
        <button onClick={() => setSent(false)} className="mt-4 font-mono text-[10px] text-nordic-gold/60 hover:text-nordic-gold transition-colors">
          Send another
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 max-w-lg mx-auto">
      <div>
        <label className="block font-mono text-[10px] tracking-[0.25em] uppercase text-nordic-gold/70 mb-1">Name</label>
        <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} required />
      </div>
      <div>
        <label className="block font-mono text-[10px] tracking-[0.25em] uppercase text-nordic-gold/70 mb-1">Email</label>
        <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputCls} required />
      </div>
      <div>
        <label className="block font-mono text-[10px] tracking-[0.25em] uppercase text-nordic-gold/70 mb-1">Message</label>
        <textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} rows={5} className={inputCls} required />
      </div>
      <button type="submit" disabled={busy} className="font-mono text-[11px] tracking-[0.2em] uppercase text-nordic-charcoal bg-nordic-gold px-6 py-2.5 hover:bg-[#ddb860] transition-colors disabled:opacity-50">
        {busy ? "Sending…" : "Send Raven"}
      </button>
    </form>
  );
}
