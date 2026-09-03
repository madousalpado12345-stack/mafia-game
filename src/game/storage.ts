import { SCREEN_NAMES } from "./types";
import type { AppState, Settings } from "./types";

const SAVE_KEY = "mafia-app-state-v1";

export const DEFAULT_SETTINGS: Settings = {
  prefs: {
    soundOn: true,
    musicOn: false,
    showInstructions: true,
    playerCount: 8,
    playMode: "friends",
    difficulty: "medium",
  },
  rules: {
    discussionMinutes: 2,
    revealRoleOnElimination: true,
    doctorCanHealSelf: true,
    allowAbstain: true,
    tieRevote: true,
    detectiveEnabled: true,
    doctorEnabled: true,
    jesterEnabled: true,
  },
};

export function saveAppState(state: AppState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable — game still works, just without persistence
  }
}

/** Merges a (possibly stale / partial) saved settings object over the current
 *  defaults so every preference and rule key always exists. Old saves from
 *  before a feature existed (e.g. difficulty, jesterEnabled) get safe defaults. */
export function normalizeSettings(raw: unknown): Settings {
  const base = { prefs: {}, rules: {} } as Settings;
  if (raw && typeof raw === "object") {
    const r = raw as Partial<Settings>;
    if (r.prefs && typeof r.prefs === "object") base.prefs = r.prefs;
    if (r.rules && typeof r.rules === "object") base.rules = r.rules;
  }
  return {
    prefs: { ...DEFAULT_SETTINGS.prefs, ...base.prefs },
    rules: { ...DEFAULT_SETTINGS.rules, ...base.rules },
  };
}

export function clearAppState() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
}

function isValidAppState(data: unknown): data is AppState {
  if (!data || typeof data !== "object") return false;
  const d = data as Partial<AppState>;
  if (typeof d.screen !== "string") return false;
  // A phase can never be an unknown value — reject corrupt/legacy screens so
  // the game state machine always starts from a valid screen.
  if (!(SCREEN_NAMES as readonly string[]).includes(d.screen)) return false;
  if (!d.settings || typeof d.settings !== "object") return false;
  if (!d.settings.rules || typeof d.settings.rules !== "object") return false;
  if (!d.settings.prefs || typeof d.settings.prefs !== "object") return false;
  if (d.game !== null && d.game !== undefined) {
    const g = d.game as Partial<AppState["game"]>;
    if (!g || !Array.isArray(g.players) || g.players.length === 0) return false;
    if (typeof g.night !== "number") return false;
  }
  return true;
}

export function loadAppState(): AppState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (!isValidAppState(data)) return null;
    const d = data as AppState;
    // Root-cause fix: rehydrate settings over defaults so keys added in later
    // versions (playMode, difficulty, jesterEnabled, ...) are never undefined.
    return { ...d, settings: normalizeSettings(d.settings) };
  } catch {
    return null;
  }
}