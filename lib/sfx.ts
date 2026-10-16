let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean) {
  muted = m;
}

function buzz(pattern: number | number[]) {
  if (muted || typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  navigator.vibrate(pattern);
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", gain = 0.08, delay = 0, slideTo?: number) {
  if (muted || typeof window === "undefined") return;
  const AC =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  ctx ??= new AC();
  if (ctx.state === "suspended") void ctx.resume();
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  pick: (i: number) => {
    buzz(8);
    tone(520 + Math.min(i, 8) * 55, 0.09, "triangle", 0.09);
  },
  drop: () => tone(300, 0.07, "triangle", 0.05),
  shuffle: () => {
    tone(260, 0.08, "triangle", 0.06);
    tone(340, 0.08, "triangle", 0.06, 0.07);
    tone(420, 0.08, "triangle", 0.06, 0.14);
  },
  hit: (weak: boolean) => {
    buzz(weak ? [25, 40, 35] : 25);
    tone(220, 0.18, "square", 0.07, 0, 110);
    tone(weak ? 880 : 660, 0.2, "triangle", 0.08, 0.08);
    if (weak) tone(1175, 0.28, "triangle", 0.08, 0.18);
  },
  miss: () => {
    buzz([70, 40, 70]);
    tone(180, 0.25, "sawtooth", 0.06, 0, 90);
  },
  /** Quick swoosh as a fighter dashes. */
  whoosh: (enemy: boolean) => tone(enemy ? 300 : 240, 0.16, "sawtooth", 0.035, 0, enemy ? 120 : 700),
  hurt: () => {
    buzz(90);
    tone(140, 0.3, "square", 0.08, 0, 60);
  },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, "triangle", 0.09, i * 0.12)),
  lose: () => [392, 330, 262, 196].forEach((f, i) => tone(f, 0.3, "triangle", 0.08, i * 0.16)),
};
