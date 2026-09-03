/** Lightweight Web Audio sound effects — no assets needed. */

export type SoundName =
  | "click"
  | "reveal"
  | "night"
  | "day"
  | "vote"
  | "timerEnd"
  | "win"
  | "eliminate";

let ctx: AudioContext | null = null;
let soundOn = true;
let musicOn = false;
let musicTimer: ReturnType<typeof setInterval> | null = null;
let musicStep = 0;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

interface ToneOpts {
  type?: OscillatorType;
  gain?: number;
  slideTo?: number;
  attack?: number;
}

function tone(c: AudioContext, freq: number, startAt: number, dur: number, opts: ToneOpts = {}) {
  const { type = "sine", gain = 0.14, slideTo, attack = 0.012 } = opts;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  const t0 = c.currentTime + startAt;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export function playSound(name: SoundName) {
  if (!soundOn) return;
  const c = getCtx();
  if (!c) return;
  switch (name) {
    case "click":
      tone(c, 320, 0, 0.06, { gain: 0.05, type: "triangle" });
      break;
    case "reveal":
      tone(c, 520, 0, 0.12, { gain: 0.09, slideTo: 720 });
      tone(c, 260, 0.02, 0.16, { gain: 0.06 });
      break;
    case "night":
      tone(c, 190, 0, 1.15, { gain: 0.14, type: "sawtooth", slideTo: 70 });
      tone(c, 95, 0, 1.2, { gain: 0.1, slideTo: 55 });
      tone(c, 48, 0.1, 1.1, { gain: 0.08, type: "triangle" });
      break;
    case "day":
      tone(c, 523.25, 0, 0.18, { gain: 0.09 });
      tone(c, 659.25, 0.16, 0.28, { gain: 0.09 });
      break;
    case "vote":
      tone(c, 150, 0, 0.08, { gain: 0.13, type: "square" });
      tone(c, 110, 0.1, 0.11, { gain: 0.11, type: "square" });
      break;
    case "timerEnd":
      tone(c, 880, 0, 0.16, { gain: 0.11, type: "square" });
      tone(c, 880, 0.26, 0.16, { gain: 0.11, type: "square" });
      tone(c, 880, 0.52, 0.34, { gain: 0.11, type: "square" });
      break;
    case "eliminate":
      tone(c, 220, 0, 0.42, { gain: 0.12, type: "triangle", slideTo: 85 });
      tone(c, 110, 0.05, 0.4, { gain: 0.08 });
      break;
    case "win":
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
        tone(c, f, i * 0.14, 0.4, { gain: 0.11, type: "triangle" }),
      );
      tone(c, 261.63, 0.02, 0.7, { gain: 0.06 });
      break;
  }
}

const MUSIC_NOTES = [220, 261.63, 329.63, 261.63, 220, 196, 261.63, 329.63];

function startMusic() {
  if (musicTimer) return;
  musicTimer = setInterval(() => {
    if (!musicOn) return;
    const c = getCtx();
    if (!c) return;
    const f = MUSIC_NOTES[musicStep % MUSIC_NOTES.length];
    tone(c, f, 0, 1.7, { gain: 0.02, type: "sine" });
    tone(c, f / 2, 0, 2.2, { gain: 0.016, type: "sine" });
    musicStep += 1;
  }, 950);
}

function stopMusic() {
  if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
}

/** Call whenever the sound/music preferences change. */
export function configureAudio(opts: { sound: boolean; music: boolean }) {
  soundOn = opts.sound;
  musicOn = opts.music;
  if (opts.music) startMusic();
  else stopMusic();
}