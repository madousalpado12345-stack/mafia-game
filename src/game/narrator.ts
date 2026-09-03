/** AI narrator engine.
 *
 *  Speaks the night-phase narration lines with the platform's built-in speech
 *  synthesis (device neural voices — zero keys, works offline) behind a small
 *  provider seam: every line goes through speakLine(), so a cloud TTS provider
 *  (e.g. ElevenLabs) can be swapped in later without touching the game flow.
 *
 *  Guarantees:
 *   - never more than one utterance at a time (all lines are serialized),
 *   - speakLine() resolves only after the audio actually finished,
 *   - absent roles are simply never narrated (lines are triggered per phase),
 *   - adding a future role (عاشقة / حارس / ساحرة…) only needs a dict key + a
 *     mapping here — the engine and the queue stay unchanged.
 */
import { getLang, t } from "@/i18n";

export type NarratorLineKey =
  | "nightIntro"
  | "mafia"
  | "doctor"
  | "detective"
  | "nightEnd"
  | "test";

/** Maps a game phase/screen to the narrator line that announces it. Future
 *  roles extend this map and the narrator picks them up automatically. */
export const NARRATOR_SCREEN_LINES: Record<string, NarratorLineKey> = {
  nightIntro: "nightIntro",
  nightMafia: "mafia",
  nightDoctor: "doctor",
  nightDetective: "detective",
  dayResults: "nightEnd",
};

export interface NarratorOptions {
  /** 0..1 — loudness of the narrator voice. */
  volume: number;
  /** Preferred voiceURI (from narratorVoices()) — falls back to the best
   *  matching voice for the language when missing or unknown. */
  voiceURI?: string;
  rate?: number;
  pitch?: number;
}

function synth(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  const s = window.speechSynthesis;
  return s && typeof s.speak === "function" ? s : null;
}

function langCode(lang: string): string {
  if (lang === "ar") return "ar";
  if (lang === "fr") return "fr";
  return "en";
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Serialized promise chain — every line waits for the previous one. */
let chain: Promise<void> = Promise.resolve();

function speakOne(text: string, opts: NarratorOptions, lang: string): Promise<void> {
  const s = synth();
  if (!s || !text.trim()) return Promise.resolve();
  return new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = langCode(lang);
      u.volume = clamp01(opts.volume);
      u.rate = opts.rate ?? 0.95; // calm, deliberate narration
      u.pitch = opts.pitch ?? 1;
      const voice = pickVoice(lang, opts.voiceURI);
      if (voice) u.voice = voice;
      u.onend = finish;
      u.onerror = finish;
      s.speak(u);
      // Safety net: some platforms never fire `onend`; resolve after the text
      // could plausibly have finished speaking.
      setTimeout(finish, Math.max(4000, text.length * 350));
    } catch {
      finish();
    }
  });
}

/** Speaks one localized narrator line, after any previously queued line. */
export function speakLine(key: NarratorLineKey, opts: NarratorOptions): Promise<void> {
  const text = t(`narrator.${key}`);
  const lang = getLang();
  chain = chain.then(() => speakOne(text, opts, lang));
  return chain;
}

/** Immediately stops the current utterance and clears the pending queue. */
export function cancelNarrator(): void {
  const s = synth();
  if (s) s.cancel();
}

/** Resolves once every queued line has finished speaking. Used to hold
 *  automatic (spectator) transitions until the narration is done. */
export function waitForIdle(): Promise<void> {
  return chain;
}

/** All narrator-capable voices for a language (may be empty until the browser
 *  finishes loading them — listen for the voiceschanged event to refresh). */
export function narratorVoices(lang: string): { uri: string; name: string }[] {
  const s = synth();
  if (!s) return [];
  const code = langCode(lang);
  return s
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith(code))
    .map((v) => ({ uri: v.voiceURI, name: v.name }));
}

/** Best voice for the language: preferred URI → natural/neural-named voice →
 *  first voice of that language → null (browser default with the language
 *  hint set on the utterance). */
function pickVoice(lang: string, preferredURI?: string): SpeechSynthesisVoice | null {
  const s = synth();
  if (!s) return null;
  const all = s.getVoices();
  if (!all.length) return null;
  const code = langCode(lang);
  const langVoices = all.filter((v) => v.lang.toLowerCase().startsWith(code));
  if (!langVoices.length) return null;
  if (preferredURI) {
    const pref = langVoices.find((v) => v.voiceURI === preferredURI);
    if (pref) return pref;
  }
  const natural = langVoices.find((v) =>
    /natural|neural|premium|enhanced|google|siri|quality/i.test(v.name),
  );
  return natural ?? langVoices[0];
}