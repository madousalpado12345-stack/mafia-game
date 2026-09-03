/** Per-language AI phrase pools, read from the i18n dictionaries so every
 *  persona speaks the user's selected language. */
import type { PersonaPhrases } from "@/game/personas";
import { getLang, tList, type Lang } from "./index";

const CATEGORIES: (keyof PersonaPhrases)[] = [
  "accuse",
  "defend",
  "counter",
  "analyze",
  "reactNight",
  "reactNoKill",
  "close",
  "bait",
];

/** Phrase pools for a persona in the given (or current) language, falling back
 *  to Arabic so a missing key can never empty a pool. */
export function personaPhrases(id: string, lang?: Lang): PersonaPhrases {
  const l = lang ?? getLang();
  const out = {} as PersonaPhrases;
  for (const cat of CATEGORIES) {
    const pool = tList(l, `personas.phrases.${id}.${cat}`);
    out[cat] = pool.length > 0 ? pool : tList("ar", `personas.phrases.${id}.${cat}`);
  }
  return out;
}