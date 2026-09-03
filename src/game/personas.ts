/** AI character definitions — ids, avatars and speaking-style stats.
 *  Names, trait labels and phrase pools are language-aware: they are read from
 *  the i18n dictionaries through personaName / personaTrait / personaPhrases. */
import { personaPhrases } from "@/i18n/personas";
import { getLang, tList, translate } from "@/i18n";
import type { Lang } from "@/i18n";

export interface PersonaPhrases {
  accuse: string[];
  defend: string[];
  counter: string[];
  analyze: string[];
  reactNight: string[];
  reactNoKill: string[];
  close: string[];
  bait: string[];
}

export interface Persona {
  id: string;
  /** Default (Arabic) name — the localized name comes from personaName(). */
  name: string;
  emoji: string;
  /** How often this character speaks (0..1). */
  talkativeness: number;
  /** How aggressively this character accuses (0..1). */
  boldness: number;
  /** Extra randomness in this character's decisions (0..1). */
  noise: number;
}

export const PERSONAS: Persona[] = [
  { id: "smart", name: "آدم", emoji: "🧠", talkativeness: 0.7, boldness: 0.5, noise: 0.05 },
  { id: "confident", name: "سامر", emoji: "😎", talkativeness: 0.8, boldness: 0.7, noise: 0.1 },
  { id: "skeptic", name: "يوسف", emoji: "🤔", talkativeness: 0.6, boldness: 0.55, noise: 0.12 },
  { id: "quiet", name: "ليلى", emoji: "🤫", talkativeness: 0.25, boldness: 0.3, noise: 0.08 },
  { id: "funny", name: "كريم", emoji: "😂", talkativeness: 0.75, boldness: 0.45, noise: 0.2 },
  { id: "deceiver", name: "منى", emoji: "🎭", talkativeness: 0.65, boldness: 0.6, noise: 0.1 },
  { id: "aggressive", name: "عمر", emoji: "🔥", talkativeness: 0.85, boldness: 0.95, noise: 0.15 },
  { id: "analyst", name: "سارة", emoji: "🕵️", talkativeness: 0.7, boldness: 0.5, noise: 0.05 },
];

/** Structural persona (stats only) — fallback to the first persona. */
export function personaById(id: string): Persona {
  return PERSONAS.find((p) => p.id === id) ?? PERSONAS[0];
}

/** Localized name for a persona (e.g. آدم / Adam / Adam). */
export function personaName(id: string, lang?: Lang): string {
  const l = lang ?? getLang();
  return translate(l, `personas.names.${id}`);
}

/** Short localized trait label for a persona (used in result tables). */
export function personaTrait(id: string): string {
  const l = getLang();
  return translate(l, `personas.traits.${id}`);
}

/** Phrase pools for a persona in the current (or given) language. */
export function phrasesForPersona(id: string, lang?: Lang): PersonaPhrases {
  return personaPhrases(id, lang);
}

/** Localized names for AI players — personas first, then fallback names. */
export function aiNamesFor(count: number, exclude: string[] = [], lang?: Lang): string[] {
  const l = lang ?? getLang();
  const names: string[] = [];
  const used = new Set<string>(exclude);
  const fallbackPool = tList(l, "namePools.pool");
  for (let i = 0; i < count; i++) {
    let name = i < PERSONAS.length ? personaName(PERSONAS[i].id, l) : "";
    if (!name) {
      const pool = fallbackPool.filter((n) => n.trim() && !used.has(n.trim()));
      name = pool[Math.floor(Math.random() * pool.length)]?.trim() ?? translate(l, "namePools.fallback", { n: i + 1 });
    }
    if (used.has(name)) {
      name = `${name} ${i + 1}`;
    }
    used.add(name);
    names.push(name);
  }
  return names;
}