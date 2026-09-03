import type { AppState, Settings } from "./types";

const SAVE_KEY = "mafia-app-state-v1";

export const DEFAULT_SETTINGS: Settings = {
  prefs: {
    soundOn: true,
    musicOn: false,
    showInstructions: true,
    playerCount: 8,
  },
  rules: {
    discussionMinutes: 3,
    revealRoleOnElimination: true,
    doctorCanHealSelf: true,
    allowAbstain: true,
    tieRevote: true,
    detectiveEnabled: true,
    doctorEnabled: true,
  },
};

export function saveAppState(state: AppState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable — game still works, just without persistence
  }
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
    return data;
  } catch {
    return null;
  }
}