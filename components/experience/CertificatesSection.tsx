"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import type { Certificate } from "@/lib/types";
import { certificates as seed } from "@/data/certificates";
import { useRefetchOnVisible } from "@/lib/hooks";
import SectionHeader from "@/components/ui/SectionHeader";

function CertificateCard({ cert, index }: { cert: Certificate; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.65, delay: index * 0.1 }}
      className="group relative h-full"
    >
      <div className="relative h-full border border-nordic-gold/30 bg-gradient-to-b from-[#12161f] via-[#0c0f14] to-[#0a0c10] px-6 py-8 md:px-8 transition-all duration-400 group-hover:border-nordic-gold/60 group-hover:shadow-[0_0_50px_rgba(201,168,76,0.12)]">
        <span className="pointer-events-none absolute left-1.5 top-1.5 h-3 w-3 border-l-2 border-t-2 border-nordic-gold/60" />
        <span className="pointer-events-none absolute right-1.5 top-1.5 h-3 w-3 border-r-2 border-t-2 border-nordic-gold/60" />
        <span className="pointer-events-none absolute bottom-1.5 left-1.5 h-3 w-3 border-b-2 border-l-2 border-nordic-gold/60" />
        <span className="pointer-events-none absolute bottom-1.5 right-1.5 h-3 w-3 border-b-2 border-r-2 border-nordic-gold/60" />
        <div className="pointer-events-none absolute inset-2.5 border border-dashed border-nordic-gold/15" />

        <div className="relative flex flex-col items-center text-center">
          <div className="mb-2 inline-block border border-nordic-gold/50 bg-[#0a0c10] px-3 py-1 font-mono text-[9px] tracking-[0.35em] uppercase text-nordic-gold/80 shadow-[0_0_16px_rgba(201,168,76,0.15)]">
            {cert.year ? `${cert.year} · OFFICIAL` : "OFFICIAL CERTIFICATE"}
          </div>

          {cert.image ? (
            <div className="mb-4 mt-2 w-full overflow-hidden border border-nordic-gold/40 shadow-[0_0_24px_rgba(201,168,76,0.15)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cert.image}
                alt={cert.title}
                className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="relative my-4 flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-nordic-gold/60 shadow-[0_0_28px_rgba(201,168,76,0.2)]" style={{ animation: "spin-slow 16s linear infinite" }} />
              <div className="absolute inset-1.5 rounded-full border border-nordic-gold/20" />
              <div className="absolute inset-3 rounded-full bg-nordic-gold/10" />
              <span className="relative font-cinzel text-4xl text-nordic-gold drop-shadow-[0_0_10px_rgba(201,168,76,0.6)]">
                {cert.seal}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 self-stretch">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-nordic-gold/40 to-transparent" />
            <span className="text-nordic-gold text-sm">✦</span>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-nordic-gold/40 to-transparent" />
          </div>

          <h3 className="mt-4 font-cinzel text-lg tracking-wide text-nordic-snow">
            {cert.title}
          </h3>
          <div className="mt-1.5 font-mono text-[10px] tracking-[0.25em] uppercase text-nordic-frost/70">
            {cert.issuer}
            {cert.issuer && cert.year ? " · " : ""}
            {cert.year}
          </div>

          {cert.description && (
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-nordic-silver/70">
              {cert.description}
            </p>
          )}

          {cert.verifyUrl && (
            <a
              href={cert.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 border-b border-nordic-gold/40 pb-0.5 font-mono text-[10px] tracking-[0.25em] uppercase text-nordic-gold/80 transition-colors hover:text-nordic-gold"
            >
              Verify Credential ↗
            </a>
          )}

          <span className="pointer-events-none mt-4 inline-block border border-nordic-gold/20 bg-nordic-gold/10 px-4 py-1.5 font-mono text-[9px] tracking-[0.4em] uppercase text-nordic-gold/70 shadow-[0_0_12px_rgba(201,168,76,0.10)]">
            CERTIFIED
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function CertificatesSection() {
  const [certs, setCerts] = useState<Certificate[]>(seed);

  const load = useCallback(() => {
    fetch("/api/content/certificates", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!Array.isArray(data) || !data.length) return;
        setCerts((prev) => {
          const merged = [...prev];
          for (const fetched of data) {
            const idx = merged.findIndex((c) => c.id === fetched.id);
            if (idx === -1) {
              merged.push(fetched);
            } else {
              merged[idx] = {
                ...merged[idx],
                ...fetched,
                image: fetched.image || merged[idx].image,
              };
            }
          }
          return merged;
        });
      })
      .catch(() => {});
  }, []);

  useRefetchOnVisible(load);

  return (
    <section className="px-6 py-20 max-w-4xl mx-auto">
      <SectionHeader
        title="CERTIFICATES"
        subtitle="Official diplomas & seals of achievement — proof of every road I've walked"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certs.map((cert, i) => (
          <CertificateCard key={cert.id} cert={cert} index={i} />
        ))}
      </div>
    </section>
  );
}