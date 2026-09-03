/** Core shared types for the Mafia game. */

export type RoleId = "mafia" | "citizen" | "detective" | "doctor" | "jester";

export type Winner = "citizens" | "mafia" | "jester";

export type PlayMode = "friends" | "ai";

export type Difficulty = "easy" | "medium" | "hard";

/** Coarse game phase — derived from the fine-grained screen (never undefined). */
export type GamePhase =
  | "roleReveal"
  | "night"
  | "day"
  | "discussion"
  | "voting"
  | "gameOver";

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
  | "win"
  | "spectate";

/** Every valid screen name (runtime list — used to reject corrupt saves). */
export const SCREEN_NAMES: readonly ScreenName[] = [
  "menu",
  "setup",
  "names",
  "howTo",
  "settings",
  "roleIntro",
  "roleReveal",
  "nightIntro",
  "nightMafia",
  "nightDoctor",
  "nightDetective",
  "dayResults",
  "discussion",
  "votingHandoff",
  "voteResults",
  "win",
  "spectate",
];

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

/** Private knowledge + memory of one AI player. Everything here is strictly
 *  limited to what that player's role allows them to know. */
export interface AiState {
  personalityId: string;
  /** playerId → suspicion 0..100 (evolves from events + discussion). */
  suspectScores: Record<string, number>;
  /** playerId → trust 0..100. */
  trustScores: Record<string, number>;
  /** Known mafia teammates (mafia role only). */
  mafiaTeammateIds: string[];
  /** Investigation results — detective role only. */
  detectiveResults: { targetId: string; isMafia: boolean }[];
  /** Protection choices — doctor role only. */
  savedIds: string[];
  /** Public: players who died at night. */
  knownNightKills: string[];
  /** Public: players eliminated by day vote. */
  knownEliminatedIds: string[];
  /** Public: every recorded vote (voter → target). */
  voteHistory: { voterId: string; targetId: string | null }[];
  /** Public: discussion accusations. */
  accusations: { accuserId: string; accusedId: string }[];
  /** Public: discussion defenses. */
  defenses: { accuserId: string; defenderId: string }[];
}

/** One line of AI discussion. */
export interface Utterance {
  playerId: string;
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
  jesterEnabled: boolean;
}

/** UI / device preferences. */
export interface Prefs {
  soundOn: boolean;
  musicOn: boolean;
  showInstructions: boolean;
  playerCount: number;
  /** Selected game mode in the setup screen. */
  playMode: PlayMode;
  difficulty: Difficulty;
}

export interface Settings {
  prefs: Prefs;
  rules: GameSettings;
}

/** Fully persisted game state — everything needed to resume a game. */
export interface GameState {
  players: Player[];
  settings: GameSettings;
  /** friends = pass-and-play on one phone, ai = one human vs AI characters. */
  playMode: PlayMode;
  difficulty: Difficulty;
  /** AI players' private memory — keyed by player id. */
  aiStates: Record<string, AiState>;
  /** Scripted AI discussion for the current day. */
  discussionScript: Utterance[];
  /** Guards against recording the same day's votes twice. */
  aiVotesRecorded: boolean;
  /** Set once the human has seen the one-time "you are out" screen in AI mode. */
  spectateShown?: boolean;
  /** Active discussion countdown — created on entering discussion and cleared
   *  when moving to voting (single timer, never two at once). */
  discussionTimer: { duration: number; remaining: number } | null;
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