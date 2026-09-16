"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";
import type { ArtForm, ArtProject } from "@/lib/types";
import { artForms as seed } from "@/data/arts";
import { useRefetchOnVisible } from "@/lib/hooks";

const icons: Record<string, string> = {
  camera: "◉",
  music: "♪",
  box: "◈",
  "pen-tool": "✒",
  film: "▣",
  sparkles: "✦",
};

export default function ArtsSection() {
  const [arts, setArts] = useState<ArtForm[]>(seed);
  const [allProjects, setAllProjects] = useState<ArtProject[]>([]);
  const [active, setActive] = useState<ArtForm | null>(null);

  const load = useCallback(() => {
    fetch("/api/content/creative", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (Array.isArray(data) && data.length) setArts(data); })
      .catch(() => {});
    fetch("/api/content/artprojects", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { if (Array.isArray(data)) setAllProjects(data); })
      .catch(() => {});
  }, []);

  useRefetchOnVisible(load);

  const getProjectsForArt = useCallback(
    (artId: string) => allProjects.filter((p) => p.artId === artId),
    [allProjects]
  );

  return (
    <section className="relative px-6 py-20 md:py-28 max-w-6xl mx-auto overflow-hidden">
      <SectionHeader title="THE ARTS" subtitle="The crafts that breathe life into code — tap one to enter its gallery" />
      <div className="absolute top-24 left-4 text-2xl text-nordic-gold/20 animate-float-rune" aria-hidden>ᚨ</div>
      <div className="absolute top-40 right-8 text-3xl text-nordic-frost/15 animate-float-rune" style={{ animationDelay: "2s" }} aria-hidden>ᛚ</div>
      <div className="absolute bottom-32 left-10 text-2xl text-nordic-frost/15 animate-float-rune" style={{ animationDelay: "4s" }} aria-hidden>ᚺ</div>
      <div className="absolute bottom-20 right-20 text-3xl text-nordic-gold/15 animate-float-rune" style={{ animationDelay: "1s" }} aria-hidden>ᛃ</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {arts.map((art, i) => (
          <ArtFrame key={art.id} art={art} index={i} projects={getProjectsForArt(art.id)} onOpen={() => setActive(art)} />
        ))}
      </div>
      <p className="mt-12 text-center font-cinzel italic text-nordic-silver/60 text-sm md:text-base max-w-xl mx-auto">
        The forge builds, but the soul of a realm is painted, played, and told.
      </p>
      <AnimatePresence>
        {active && <ArtGallery art={active} projects={getProjectsForArt(active.id)} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </section>
  );
}

function ArtFrame({ art, index, projects, onOpen }: { art: ArtForm; index: number; projects: ArtProject[]; onOpen: () => void }) {
  const rotations = ["-1.5deg", "1deg", "-1deg", "1.5deg", "-1.5deg", "1deg"];
  const rotation = rotations[((index % rotations.length) + rotations.length) % rotations.length];
  const latest = projects.find((p) => p.image);
  const latestImage = latest?.image;
  const focalX = latest?.focalX ?? 50;
  const focalY = latest?.focalY ?? 50;

  return (
    <motion.button
      initial={{ opacity: 0, y: 30, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate: Number(rotation.replace("deg", "")) }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.15 }}
      whileHover={{ rotate: 0, scale: 1.03, y: -6 }}
      onClick={onOpen}
      className="group relative text-left bg-gradient-to-b from-[#141a28] to-[#0c0e14] border border-nordic-silver/15 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:border-nordic-gold/50 focus:outline-none transition-colors duration-300"
    >
      <div className="absolute inset-2 border border-nordic-gold/10 pointer-events-none" />
      <div className="relative text-right mb-2">
        <span className="font-cinzel text-[10px] text-nordic-gold/50 tracking-[0.3em]">{art.runeWord}</span>
      </div>
      <div className="relative h-40 overflow-hidden mb-4 flex items-center justify-center">
        {latestImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={latestImage} alt={art.name} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" style={{ objectPosition: `${focalX}% ${focalY}%` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e14] via-transparent to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-nordic-deep-blue/60 via-transparent to-nordic-gold/10" />
            <div className="relative">
              <span className="text-5xl md:text-6xl text-nordic-gold/50 group-hover:text-nordic-gold group-hover:drop-shadow-[0_0_15px_rgba(201,168,76,0.5)] transition-all duration-500">{icons[art.icon] ?? "✦"}</span>
              <motion.div className="absolute -inset-4 border border-nordic-silver/10 rotate-[var(--r)]" animate={{ rotate: [0, 90, 180, 270, 360] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} style={{ ["--r" as string]: rotation }} />
            </div>
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)]" style={{ backgroundSize: "12px 12px" }} />
          </>
        )}
      </div>
      <h3 className="font-cinzel text-lg md:text-xl text-nordic-snow tracking-wide mb-2 group-hover:text-nordic-gold transition-colors duration-300">{art.name}</h3>
      <p className="text-xs md:text-sm text-nordic-silver/75 leading-relaxed">{art.description}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] tracking-[0.25em] text-nordic-frost/70">
          {projects.length === 0 ? "NO WORKS YET" : `${projects.length} WORK${projects.length === 1 ? "" : "S"}`}
        </span>
        <span className="font-mono text-[10px] tracking-[0.25em] text-nordic-gold/70">OPEN GALLERY &#10095;</span>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className="h-px flex-1 bg-gradient-to-r from-nordic-gold/30 to-transparent" />
        <span className="text-nordic-gold/40 text-xs">✦</span>
        <div className="h-px flex-1 bg-gradient-to-l from-nordic-gold/30 to-transparent" />
      </div>
    </motion.button>
  );
}

function ArtGallery({ art, projects, onClose }: { art: ArtForm; projects: ArtProject[]; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", handleKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <motion.div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 md:p-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ duration: 0.4 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-4xl border border-nordic-gold/30 bg-[#0c0e14] shadow-[0_0_80px_rgba(201,168,76,0.12)] p-6 md:p-10">
        <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-nordic-gold/60" />
        <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-nordic-gold/60" />
        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-nordic-gold/60" />
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-nordic-gold/60" />
        <button onClick={onClose} className="absolute top-4 right-4 text-nordic-silver/50 hover:text-nordic-gold transition-colors text-xl z-10" aria-label="Close">&#10005;</button>
        <div className="font-mono text-[10px] text-nordic-gold/70 tracking-[0.3em] uppercase">{art.runeWord}</div>
        <h2 className="mt-1 font-cinzel text-2xl md:text-3xl text-nordic-snow tracking-wide">{art.name}</h2>
        <p className="mt-2 text-sm text-nordic-silver/70 leading-relaxed max-w-2xl">{art.description}</p>
        <div className="mt-3 h-px bg-gradient-to-r from-nordic-gold/50 to-transparent" />
        {projects.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 border border-dashed border-nordic-silver/20 py-14 text-center">
            <div className="text-3xl mb-3">{icons[art.icon] ?? "✦"}</div>
            <p className="font-cinzel text-nordic-silver/70 tracking-wide">No works hang in this gallery yet.</p>
            <p className="mt-2 font-mono text-xs text-nordic-silver/50">The artist is still at the easel…</p>
          </motion.div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {projects.map((p, i) => (<ArtworkCard key={p.id} project={p} icon={icons[art.icon] ?? "✦"} index={i} />))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function ArtworkCard({ project, icon, index }: { project: ArtProject; icon: string; index: number }) {
  return (
    <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.08 }} className="group border border-nordic-silver/15 bg-[#0a0c10] hover:border-nordic-gold/40 transition-colors duration-300 overflow-hidden">
      {project.image ? (
        <div className="relative overflow-hidden bg-black/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.image} alt={project.title} className="w-full h-56 sm:h-64 object-cover transition-transform duration-700 group-hover:scale-[1.04]" style={{ objectPosition: `${project.focalX ?? 50}% ${project.focalY ?? 50}%` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {project.year && <span className="absolute top-3 right-3 font-mono text-[10px] tracking-wider text-nordic-gold bg-black/60 border border-nordic-gold/30 px-2 py-1 backdrop-blur-sm">{project.year}</span>}
        </div>
      ) : (
        <div className="h-40 flex items-center justify-center bg-gradient-to-br from-nordic-deep-blue/40 to-nordic-gold/10 relative">
          <span className="text-5xl text-nordic-gold/50">{icon}</span>
          {project.year && <span className="absolute top-3 right-3 font-mono text-[10px] tracking-wider text-nordic-frost/70">{project.year}</span>}
        </div>
      )}
      <div className="p-5">
        <h3 className="font-cinzel text-lg text-nordic-snow tracking-wide group-hover:text-nordic-gold transition-colors">{project.title}</h3>
        {project.description && <p className="mt-3 text-sm text-nordic-silver/80 leading-relaxed">{project.description}</p>}
        {project.url && <a href={project.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block font-mono text-[10px] tracking-[0.25em] uppercase text-nordic-gold border border-nordic-gold/40 px-4 py-2 hover:bg-nordic-gold/10 transition-colors">View Work &#8618;</a>}
      </div>
    </motion.article>
  );
}
