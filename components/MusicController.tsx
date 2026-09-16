"use client";

import { useEffect, useState } from "react";
import { toggleBgMusic, isMusicPlaying, subscribeMusic } from "@/lib/audioPlayer";

export default function MusicController() {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setPlaying(isMusicPlaying());
    const unsub = subscribeMusic(() => setPlaying(isMusicPlaying()));
    return unsub;
  }, []);

  return (
    <button onClick={toggleBgMusic} className="fixed bottom-4 right-4 z-50 w-10 h-10 flex items-center justify-center border border-nordic-gold/30 bg-[#0a0c10]/80 backdrop-blur-sm text-nordic-gold/70 hover:text-nordic-gold hover:border-nordic-gold/60 transition-colors" aria-label="Toggle music" title="Dovahkiin's song">
      {playing ? "♪" : "♪̸"}
    </button>
  );
}