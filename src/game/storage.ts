import { SCREEN_NAMES } from "./types";
import type { AppState, Settings } from "./types";

/**
 * Storage versioning: bumping the key orphans any state written by older
 * (possibly buggy / mid-transition) builds so a stale save can never crash
 * the app on load. Old keys are cleaned up on first load.
 */
const SAVE_KEY = "mafia-app-state-v2";
const LEGACY_KEYS = ["mafia-app-state-v1"];

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

function dropLegacyKeys() {
  try {
    for (const key of LEGACY_KEYS) localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/** Every screen may restore an in-progress game. If the stored game does not
 *  match the current game schema it is dropped (back to the menu) instead of
 *  letting a half-shaped object crash a screen at load. */
function isUsableGame(g: unknown): g is NonNullable<AppState["game"]> {
  if (!g || typeof g !== "object") return false;
  const game = g as Partial<NonNullable<AppState["game"]>>;
  if (!Array.isArray(game.players) || game.players.length < 2) return false;
  if (typeof game.night !== "number" || game.night < 1) return false;
  if (!game.settings || typeof game.settings !== "object") return false;
  if (typeof game.settings.discussionMinutes !== "number") return false;
  // A saved phase always has the fields the screens read. Missing/corrupt
  // optional ones are tolerated (screens already fall back), but the core
  // round data must exist in a sane shape.
  if (!game.players.every((p) => p && typeof p.id === "string" && typeof p.name === "string")) {
    return false;
  }
  return true;
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
  if (d.game !== null && d.game !== undefined && !isUsableGame(d.game)) return false;
  return true;
}

export function loadAppState(): AppState | null {
  try {
    dropLegacyKeys();
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
