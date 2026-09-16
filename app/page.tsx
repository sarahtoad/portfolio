"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { menuItems } from "@/data/menu";
import BackgroundAura from "@/components/ui/BackgroundAura";
import BackgroundNetwork from "@/components/ui/BackgroundNetwork";
import { initBgMusic, playBgMusic } from "@/lib/audioPlayer";
import { playQuestSound } from "@/lib/sound";

type Step = { kind: "small" | "welcome" | "body" | "name"; text: string; roles?: string };

const INTRO_STEPS: Step[] = [
  { kind: "small", text: "The path is yours to forge." },
  { kind: "small", text: "The unknown awaits." },
  { kind: "body", text: "Code. Design. Networks.\nIdeas turned into something real." },
  { kind: "welcome", text: "Welcome to my realm." },
  { kind: "name", text: "Sarah Khodja", roles: "Developer • Designer • Network & Embedded Systems" },
];

function StepLine({ step }: { step: Step }) {
  if (step.kind === "name") {
    return (
      <div className="relative text-center">
        <div className="absolute left-1/2 top-1/2 -z-10 h-36 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-nordic-gold/15 blur-3xl" />
        <div className="mx-auto mb-5 flex items-center justify-center gap-4">
          <span className="h-px w-14 md:w-24 bg-gradient-to-r from-transparent via-nordic-gold/70 to-transparent" />
          <span className="text-nordic-gold text-xl animate-blink">✦</span>
          <span className="h-px w-14 md:w-24 bg-gradient-to-r from-transparent via-nordic-gold/70 to-transparent" />
        </div>
        <h1 className="pt-1 text-4xl font-black text-center tracking-[0.18em] md:text-5xl lg:text-6xl">
          <span className="text-gold-sheen">{step.text}</span>
        </h1>
        {step.roles && (
          <p className="mt-4 font-cinzel italic text-sm tracking-[0.28em] text-nordic-silver/70">
            {step.roles}
          </p>
        )}
      </div>
    );
  }

  if (step.kind === "welcome") {
    return (
      <p className="font-cinzel italic text-nordic-gold/90 text-sm md:text-base tracking-[0.28em] text-center">
        {step.text}
      </p>
    );
  }

  if (step.kind === "body") {
    return (
      <p className="font-mono text-sm md:text-base leading-relaxed tracking-[0.28em] text-nordic-silver/80 text-center whitespace-pre-line">
        {step.text}
      </p>
    );
  }

  return (
    <p className="font-mono text-[13px] md:text-base uppercase tracking-[0.35em] text-nordic-frost/80 text-center">
      {step.text}
    </p>
  );
}

function Corner({ className }: { className: string }) {
  return (
    <span
      className={`pointer-events-none absolute text-nordic-gold/30 text-lg ${className}`}
      aria-hidden="true"
    >
      ✦
    </span>
  );
}

export default function Home() {
  const [phase, setPhase] = useState<"intro" | "menu">("intro");
  const [step, setStep] = useState(0);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const burstId = useRef(0);

  const last = step >= INTRO_STEPS.length - 1;

  const handleTap = (e: React.MouseEvent) => {
    const id = ++burstId.current;
    setBursts((b) => [...b.slice(-4), { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 900);

    if (!last) {
      setStep((s) => s + 1);
      return;
    }
    initBgMusic("/audio/theme.mp3");
    playBgMusic();
    setPhase("menu");
  };

  return (
    <div
      className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4 relative overflow-hidden font-cinzel selection:bg-nordic-gold/30"
      onClick={handleTap}
    >
      <BackgroundNetwork />
      <BackgroundAura />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.10),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)]" />

      <Corner className="left-4 top-4" />
      <Corner className="right-4 top-4" />
      <Corner className="bottom-4 left-4" />
      <Corner className="bottom-4 right-4" />

      <AnimatePresence mode="wait">
        {phase === "intro" ? (
          <motion.div
            key="intro"
            exit={{ opacity: 0, scale: 1.06, filter: "blur(7px)" }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center px-4"
          >
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.3 }}
                className="font-mono text-[10px] tracking-[0.6em] text-nordic-gold/60 uppercase mb-10"
              >
                The Elder Portfolio — Skyrim Edition
              </motion.div>

              <div className="flex min-h-[12rem] md:min-h-[9rem] items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 28, filter: "blur(7px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -28, filter: "blur(7px)" }}
                    transition={{ duration: 0.75, ease: "easeOut" }}
                  >
                    <StepLine step={INTRO_STEPS[step]} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {last && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="mt-10"
                >
                  <div className="mx-auto h-px w-44 md:w-80 bg-gradient-to-r from-transparent via-nordic-gold/80 to-transparent" />
                </motion.div>
              )}
            </div>

            <div className="absolute bottom-10 flex flex-col items-center gap-4">
              <div className="font-mono text-[10px] tracking-[0.55em] uppercase text-nordic-gold/70 animate-pulse">
                {last ? "TAP · TO BEGIN YOUR JOURNEY" : "TAP · TO CONTINUE"}
              </div>
              <div className="flex items-center gap-3">
                {INTRO_STEPS.map((_, i) => {
                  const lit = i <= step;
                  return (
                    <motion.span
                      key={i}
                      animate={{ opacity: lit ? 1 : 0.18, scale: lit ? 1.2 : 1 }}
                      transition={{ duration: 0.5 }}
                      className={lit ? "text-nordic-gold" : "text-nordic-silver/30"}
                    >
                      ◆
                    </motion.span>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="relative text-center max-w-2xl w-full"
          >
            <div className="font-mono text-[10px] tracking-[0.5em] uppercase text-nordic-gold/60 mb-8">
              ◆ The Realm Awaits ◆
            </div>
            <nav className="space-y-3">
              {menuItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                >
                  <Link
                    href={item.href}
                    onClick={playQuestSound}
                    className="group flex items-center justify-center gap-4 font-cinzel text-lg md:text-2xl text-nordic-silver/70 hover:text-nordic-gold transition-colors duration-300 py-2 tracking-[0.2em]"
                  >
                    <span className="text-nordic-gold/40 group-hover:text-nordic-gold transition-colors w-6">{item.rune}</span>
                    <span className="tracking-wider">{item.label}</span>
                    <span className="text-nordic-gold/30 group-hover:text-nordic-gold/70 transition-colors">&#10095;</span>
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-10 h-px bg-gradient-to-r from-transparent via-nordic-gold/30 to-transparent" />
            <p className="mt-4 font-mono text-[9px] tracking-[0.3em] text-nordic-silver/30 uppercase">
              ⌘ Fus·Ro·Dah of C, Python &amp; TypeScript
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {bursts.map((b) => (
        <motion.span
          key={b.id}
          className="pointer-events-none absolute rounded-full border border-nordic-gold/70"
          style={{ left: b.x - 30, top: b.y - 30, width: 60, height: 60 }}
          initial={{ opacity: 0.8, scale: 0.3 }}
          animate={{ opacity: 0, scale: 2.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}