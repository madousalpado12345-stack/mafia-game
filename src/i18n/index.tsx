import { ROLES } from "@/game/roles";
import type { RoleId } from "@/game/types";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ar, type Dict } from "./ar";
import { en } from "./en";
import { fr } from "./fr";

export type Lang = "ar" | "fr" | "en";

export interface LangMeta {
  id: Lang;
  /** Native display label — shown in the picker (العربية / Français / English). */
  label: string;
  flag: string;
  dir: "rtl" | "ltr";
}

export const LANGS: LangMeta[] = [
  { id: "ar", label: "العربية", flag: "🇸🇦", dir: "rtl" },
  { id: "fr", label: "Français", flag: "🇫🇷", dir: "ltr" },
  { id: "en", label: "English", flag: "🇬🇧", dir: "ltr" },
];

const DICTS: Record<Lang, Dict> = { ar, fr, en };
const STORAGE_KEY = "mafia-lang";

// ---- module-level current language ----------------------------------------
// Non-React modules (personas, ai, names, ui helpers) read the current language
// through getLang(); the provider keeps it in sync with the UI state.

let currentLang: Lang = "ar";

export function getLang(): Lang {
  return currentLang;
}

/** Overrides the module-level current language (used by the provider on every
 *  change and by headless tools/tests). */
export function setCurrentLang(l: Lang): void {
  currentLang = l;
}

function readInitialLang(): Lang {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "fr" || raw === "en" || raw === "ar") return raw;
  } catch {
    // storage unavailable — default to Arabic
  }
  return "ar";
}

// ---- lookup helpers --------------------------------------------------------

function lookup(dict: Dict, path: string): string | undefined {
  let node: unknown = dict;
  for (const part of path.split(".")) {
    if (node && typeof node === "object" && part in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof node === "string" ? node : undefined;
}

function lookupArray(dict: Dict, path: string): string[] | undefined {
  let node: unknown = dict;
  for (const part of path.split(".")) {
    if (node && typeof node === "object" && part in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return Array.isArray(node) ? (node as string[]) : undefined;
}

export type TVars = Record<string, string | number>;

export function translate(lang: Lang, path: string, vars?: TVars): string {
  let s = lookup(DICTS[lang], path) ?? lookup(ar, path) ?? path;
  if (vars) {
    for (const [key, value] of Object.entries(vars)) {
      s = s.split(`{${key}}`).join(String(value));
    }
  }
  return s;
}

/** Module-level translate using the current language (helpers, personas, AI). */
export function t(path: string, vars?: TVars): string {
  return translate(currentLang, path, vars);
}

/** Localized role info — merges the static look (emoji/color/team) with the
 *  translated role texts. */
export function localizedRole(roleId: RoleId, lang?: Lang): typeof ROLES[RoleId] {
  const l = lang ?? currentLang;
  const base = ROLES[roleId];
  const name = translate(l, `roles.${roleId}.name`);
  const short = translate(l, `roles.${roleId}.short`);
  const brief = translate(l, `roles.${roleId}.brief`);
  const description = translate(l, `roles.${roleId}.description`);
  return {
    ...base,
    name: name === `roles.${roleId}.name` ? base.name : name,
    short: short === `roles.${roleId}.short` ? base.short : short,
    brief: brief === `roles.${roleId}.brief` ? base.brief : brief,
    description: description === `roles.${roleId}.description` ? base.description : description,
  };
}

// ---- React provider --------------------------------------------------------

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  dir: "rtl" | "ltr";
  t: (path: string, vars?: TVars) => string;
  /** Raw (possibly non-string) dictionary value in the current language. */
  raw: (path: string) => unknown;
}

const I18nContext = createContext<I18nContextValue>({
  lang: "ar",
  setLang: () => {},
  dir: "rtl",
  t: (p, v) => translate("ar", p, v),
  raw: (p) => tRaw("ar", p),
});

export function LanguageProvider({
  children,
  initialLang,
}: {
  children: ReactNode;
  /** Optional forced initial language (used by server-render tests). */
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang ?? readInitialLang);

  useEffect(() => {
    setCurrentLang(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // storage unavailable — language just isn't persisted
    }
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);

  const value: I18nContextValue = {
    lang,
    setLang,
    dir: lang === "ar" ? "rtl" : "ltr",
    t: (p, v) => translate(lang, p, v),
    raw: (p) => tRaw(lang, p) ?? tRaw("ar", p),
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}

/** Array-valued dictionary lookup in the given (or current) language. */
export function tList(lang: Lang, path: string): string[] {
  return lookupArray(DICTS[lang], path) ?? lookupArray(ar, path) ?? [];
}

export function tListCurrent(path: string): string[] {
  return tList(currentLang, path);
}

/** Raw (non-string) dictionary value — used for structured entries like the
 *  how-to phases/rules arrays. Falls back to Arabic. */
export function tRaw(lang: Lang, path: string): unknown {
  let node: unknown = DICTS[lang];
  for (const part of path.split(".")) {
    if (node && typeof node === "object" && part in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return node;
}