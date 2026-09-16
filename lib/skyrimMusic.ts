import { getAudioContext } from "./sound";

let nodes: AudioNode[] = [];
let active = false;

export function startSkyrimAmbience() {
  if (active) return;
  active = true;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 110;
    gain.gain.value = 0.02;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    nodes.push(osc, gain);
  } catch {
    active = false;
  }
}

export function stopSkyrimAmbience() {
  active = false;
  for (const n of nodes) {
    try { if ("stop" in n) (n as OscillatorNode).stop(); } catch {}
    try { n.disconnect(); } catch {}
  }
  nodes = [];
}