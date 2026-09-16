let audioCtx: AudioContext | null = null;

export function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function playTone(freq: number, duration = 0.1, volume = 0.1) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    /* silent fail */
  }
}

export function playHoverSound() {
  playTone(800, 0.05, 0.05);
}

export function playClickSound() {
  playTone(600, 0.08, 0.08);
}

export function playSelectSound() {
  playTone(440, 0.15, 0.06);
}

let questAudio: HTMLAudioElement | null = null;

export function playQuestSound() {
  try {
    if (typeof window === "undefined") return;
    if (!questAudio) {
      questAudio = new Audio("/audio/quest-select.mp3");
      questAudio.volume = 0.9;
    }
    questAudio.currentTime = 0;
    const p = questAudio.play();
    if (p) p.catch(() => {});
  } catch {
    /* silent fail */
  }
}