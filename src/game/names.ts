import { getLang, tList, translate } from "@/i18n";
import { shuffle } from "./roles";

/** Returns `count` unique random names in the current language
 *  (falls back to numbered names). */
export function randomNames(count: number): string[] {
  const lang = getLang();
  const pool = shuffle(tList(lang, "namePools.pool"));
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const fallback = translate(lang, "namePools.fallback", { n: i + 1 });
    out.push(pool[i % pool.length] ?? fallback);
  }
  return out;
}