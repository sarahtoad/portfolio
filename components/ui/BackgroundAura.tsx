"use client";

import { useMemo } from "react";

const RUNES = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᛒ", "ᛃ", "ᛖ", "ᛗ", "ᛚ", "ᛜ", "ᛞ", "ᛟ", "ᛁ"];
const CODE = ["</>", "{ }", "0", "1", "()", "=>", "let", "const", "[ ]", "0101"];
const DRAGON = ["Dovahkiin", "Fus", "Ro", "Dah", "E=mc2", "0x7F"];
const SCIENCE = [
  "TCP/IP", "OSI", "HTTP", "DNS", "IPv4", "NaN", "null", "404",
  "1010", "0x1F", "C++", "SQL", "CPU", "SSH", "Git", "RAM",
  "λ", "∑", "∫", "¬p ∧ q", "2^n", "log n",
];

function pick<T>(arr: T[], i: number) {
  return arr[i % arr.length];
}

export default function BackgroundAura() {
  const layer1 = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        char: pick(RUNES, i * 3 + 1),
        top: (i * 71 + 13) % 92,
        left: (i * 53 + 7) % 96,
        size: 14 + ((i * 7) % 16),
        delay: (i * 0.7) % 6,
        dur: 5 + ((i * 3) % 5),
      })),
    []
  );
  const layer2 = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        char: pick(CODE, i * 5 + 2),
        top: (i * 83 + 41) % 90,
        left: (i * 47 + 33) % 92,
        size: 11 + ((i * 5) % 9),
        delay: (i * 0.9) % 6,
        dur: 6 + ((i * 2) % 4),
      })),
    []
  );
  const layer3 = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        char: pick(DRAGON, i + 4),
        top: (i * 137 + 23) % 85,
        left: (i * 91 + 11) % 80,
        size: 9,
        delay: (i * 1.3) % 6,
        dur: 7 + ((i * 3) % 5),
      })),
    []
  );
  const layer4 = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        char: pick(SCIENCE, i * 7 + 3),
        top: (i * 59 + 31) % 88,
        left: (i * 73 + 17) % 90,
        size: 9 + ((i * 4) % 8),
        delay: (i * 0.8) % 7,
        dur: 9 + ((i * 3) % 6),
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {layer1.map((r, i) => (
        <span
          key={`r${i}`}
          className="absolute font-cinzel animate-float-rune select-none text-nordic-gold/10"
          style={{ top: `${r.top}%`, left: `${r.left}%`, fontSize: r.size, animationDelay: `${r.delay}s`, animationDuration: `${r.dur}s` }}
        >
          {r.char}
        </span>
      ))}
      {layer2.map((c, i) => (
        <span
          key={`c${i}`}
          className="absolute font-mono animate-float-rune select-none text-nordic-frost/10"
          style={{ top: `${c.top}%`, left: `${c.left}%`, fontSize: c.size, animationDelay: `${c.delay}s`, animationDuration: `${c.dur}s` }}
        >
          {c.char}
        </span>
      ))}
      {layer3.map((d, i) => (
        <span
          key={`d${i}`}
          className="absolute font-mono animate-float-rune select-none text-nordic-silver/5 tracking-[0.3em]"
          style={{ top: `${d.top}%`, left: `${d.left}%`, fontSize: d.size, animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }}
        >
          {d.char}
        </span>
      ))}
      {layer4.map((s, i) => (
        <span
          key={`s${i}`}
          className="absolute font-mono animate-float-rune select-none text-nordic-frost/[0.07] tracking-[0.2em]"
          style={{ top: `${s.top}%`, left: `${s.left}%`, fontSize: s.size, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }}
        >
          {s.char}
        </span>
      ))}
    </div>
  );
}