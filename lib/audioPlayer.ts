let bgMusic: HTMLAudioElement | null = null;
let isPlaying = false;
let volume = 0.3;
const listeners = new Set<() => void>();

function emit() {
  for (const fn of listeners) fn();
}

export function subscribeMusic(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

export function initBgMusic(src: string) {
  if (bgMusic) return bgMusic;
  bgMusic = new Audio(src);
  bgMusic.loop = true;
  bgMusic.volume = volume;
  bgMusic.onended = () => {
    isPlaying = false;
    emit();
  };
  return bgMusic;
}

export function playBgMusic() {
  if (!bgMusic) initBgMusic("/audio/theme.mp3");
  bgMusic?.play().then(() => { isPlaying = true; }).catch(() => {});
  isPlaying = true;
  emit();
}

export function toggleBgMusic() {
  if (isPlaying) {
    bgMusic?.pause();
    isPlaying = false;
  } else {
    playBgMusic();
  }
  emit();
  return isPlaying;
}

export function pauseBgMusic() {
  bgMusic?.pause();
  isPlaying = false;
  emit();
}

export function setMusicVolume(vol: number) {
  volume = Math.max(0, Math.min(1, vol));
  if (bgMusic) bgMusic.volume = volume;
}

export function getMusicVolume() {
  return volume;
}

export function isMusicPlaying() {
  return isPlaying;
}