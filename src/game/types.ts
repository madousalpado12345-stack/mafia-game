/** Core shared types for the Mafia game. */

export type RoleId = "mafia" | "citizen" | "detective" | "doctor";

export type Winner = "citizens" | "mafia";

export type NightStep = "mafia" | "doctor" | "detective";

export type ScreenName =
  | "menu"
  | "setup"
  | "names"
  | "howTo"
  | "settings"
  | "roleIntro"
  | "roleReveal"
  | "nightIntro"
  | "nightMafia"
  | "nightDoctor"
  | "nightDetective"
  | "dayResults"
  | "discussion"
  | "votingHandoff"
  | "voteResults"
  | "win";

export interface Player {
  id: string;
  name: string;
  role: RoleId;
  status: "alive" | "dead";
  isAi: boolean;
}

export interface NightActions {
  mafiaTargetId: string | null;
  doctorSaveId: string | null;
  detectiveCheckId: string | null;
}

export interface DetectiveResult {
  targetId: string;
  isMafia: boolean;
}

export interface VoteRecord {
  voterId: string;
  targetId: string | null;
}

export interface VoteOutcome {
  kind: "eliminate" | "tie" | "abstain" | "noVotes";
  rows: { playerId: string | null; count: number }[];
  eliminatedId: string | null;
  tiedIds: string[];
}

export interface LogEntry {
  id: string;
  night: number;
  phase: "night" | "day";
  text: string;
}

/** Rules — used both as global defaults and as a per-game snapshot. */
export interface GameSettings {
  discussionMinutes: number;
  revealRoleOnElimination: boolean;
  doctorCanHealSelf: boolean;
  allowAbstain: boolean;
  tieRevote: boolean;
  detectiveEnabled: boolean;
  doctorEnabled: boolean;
}

/** UI / device preferences. */
export interface Prefs {
  soundOn: boolean;
  musicOn: boolean;
  showInstructions: boolean;
  playerCount: number;
}

export interface Settings {
  prefs: Prefs;
  rules: GameSettings;
}

/** Fully persisted game state — everything needed to resume a game. */
export interface GameState {
  players: Player[];
  settings: GameSettings;
  night: number;
  revealCursor: number;
  nightActions: NightActions;
  detectiveResult: DetectiveResult | null;
  nightEliminatedId: string | null;
  dayEliminatedId: string | null;
  votes: VoteRecord[];
  voteCursor: number;
  tiedCandidates: string[] | null;
  lastVoteOutcome: VoteOutcome | null;
  winner: Winner | null;
  log: LogEntry[];
  createdAt: number;
}

export interface AppState {
  screen: ScreenName;
  game: GameState | null;
  settings: Settings;
  /** Names carried over from a finished game into a new game setup. */
  pendingNames: string[] | null;
  /** Screen to return to when continuing a saved game from the menu. */
  lastGameScreen: ScreenName | null;
}