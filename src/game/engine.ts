import { createAiStates } from "./ai";
import { ROLES, buildRoleDeck } from "./roles";
import type {
  Difficulty,
  GamePhase,
  GameSettings,
  GameState,
  NightStep,
  PlayMode,
  Player,
  RoleId,
  ScreenName,
  VoteOutcome,
  VoteRecord,
  Winner,
} from "./types";

let idCounter = 0;
export function uid(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export function createGame(
  names: string[],
  rules: GameSettings,
  playMode: PlayMode = "friends",
  difficulty: Difficulty = "medium",
): GameState {
  const deck = buildRoleDeck(names.length, rules);
  const players: Player[] = names.map((raw, i) => ({
    id: `p${i}`,
    name: raw.trim() || `اللاعب ${i + 1}`,
    role: deck[i],
    status: "alive",
    isAi: playMode === "ai" && i > 0,
  }));
  const game: GameState = {
    players,
    settings: rules,
    playMode,
    difficulty,
    aiStates: {},
    discussionScript: [],
    aiVotesRecorded: false,
    spectateShown: false,
    discussionTimer: null,
    night: 1,
    revealCursor: 0,
    nightActions: { mafiaTargetId: null, doctorSaveId: null, detectiveCheckId: null },
    detectiveResult: null,
    nightEliminatedId: null,
    dayEliminatedId: null,
    votes: [],
    voteCursor: 0,
    tiedCandidates: null,
    lastVoteOutcome: null,
    winner: null,
    log: [],
    createdAt: Date.now(),
  };
  if (playMode === "ai") createAiStates(game);
  return game;
}

export function alivePlayers(players: Player[]): Player[] {
  return players.filter((p) => p.status === "alive");
}

export function deadPlayers(players: Player[]): Player[] {
  return players.filter((p) => p.status === "dead");
}

export function playerById(players: Player[], id: string): Player {
  const found = players.find((p) => p.id === id);
  if (!found) throw new Error(`لاعب غير موجود: ${id}`);
  return found;
}

export function nameOf(players: Player[], id: string): string {
  return playerById(players, id).name;
}

export function isMafiaTeam(player: Player): boolean {
  return ROLES[player.role].team === "mafia";
}

export function hasAliveRole(players: Player[], role: RoleId): boolean {
  return players.some((p) => p.status === "alive" && p.role === role);
}

export function mafiaTeammates(state: GameState, mafiaId: string): Player[] {
  return state.players.filter(
    (p) => p.id !== mafiaId && isMafiaTeam(p) && p.status === "alive",
  );
}

/** Win conditions — recomputed from the CURRENT alive roster after every
 *  elimination (night kill or day vote). Never based on kill counts.
 *
 *  • Mafia wins ONLY when aliveMafia >= aliveNonMafia (parity).
 *  • Citizens win when the last mafia is gone (aliveMafia === 0).
 *  • Otherwise the game continues. */
export function checkWin(players: Player[]): Winner | null {
  const alive = players.filter((p) => p.status === "alive");
  const aliveMafia = alive.filter((p) => isMafiaTeam(p)).length;
  const aliveNonMafia = alive.length - aliveMafia;

  // المافيا تفوز فقط عندما تساوي أو تتجاوز عدد غير المافيا الأحياء.
  if (aliveMafia >= aliveNonMafia) return "mafia";
  // المواطنون يفوزون عندما لا تبقى أي مافيا على قيد الحياة.
  if (aliveMafia === 0) return "citizens";
  return null;
}

/** Order in which roles act during the night (dead roles are skipped). */
export function nightSequence(state: GameState): NightStep[] {
  const steps: NightStep[] = ["mafia"];
  if (state.settings.doctorEnabled && hasAliveRole(state.players, "doctor")) steps.push("doctor");
  if (state.settings.detectiveEnabled && hasAliveRole(state.players, "detective")) steps.push("detective");
  return steps;
}

/** Which night step is pending, or "done" when all actions are complete. */
export function currentNightStep(state: GameState): NightStep | "done" {
  for (const step of nightSequence(state)) {
    if (step === "mafia" && !state.nightActions.mafiaTargetId) return "mafia";
    if (step === "doctor" && !state.nightActions.doctorSaveId) return "doctor";
    if (step === "detective" && !state.nightActions.detectiveCheckId) return "detective";
  }
  return "done";
}

/** Unified elimination step used by every kill/vote: marks the player dead and
 *  logs the public event. Dead players are excluded from every later decision
 *  because all AI/action code only ever looks at alive players. */
function eliminateAndLog(state: GameState, playerId: string, phase: "night" | "day", text: string): Player {
  const p = playerById(state.players, playerId);
  p.status = "dead";
  state.log.push({ id: uid("l"), night: state.night, phase, text });
  return p;
}

/** Applies the night's actions, marks the victim dead, logs public events,
 *  and returns the winner if the game ended during the night. */
export function resolveNight(state: GameState): Winner | null {
  const { mafiaTargetId, doctorSaveId, detectiveCheckId } = state.nightActions;
  const saved = mafiaTargetId !== null && mafiaTargetId === doctorSaveId;
  const eliminatedId = mafiaTargetId && !saved ? mafiaTargetId : null;

  state.nightEliminatedId = eliminatedId;
  if (eliminatedId) {
    eliminateAndLog(
      state,
      eliminatedId,
      "night",
      `خرج ${playerById(state.players, eliminatedId).name} من اللعبة أثناء الليل.`,
    );
  } else {
    state.log.push({
      id: uid("l"),
      night: state.night,
      phase: "night",
      text: "لم يُخرج أحد أثناء الليل.",
    });
  }

  if (detectiveCheckId) {
    const target = playerById(state.players, detectiveCheckId);
    state.detectiveResult = {
      targetId: detectiveCheckId,
      isMafia: isMafiaTeam(target),
    };
  } else {
    state.detectiveResult = null;
  }

  return checkWin(state.players);
}

export function tallyVotes(votes: VoteRecord[]): { playerId: string | null; count: number }[] {
  const map = new Map<string | null, number>();
  for (const v of votes) {
    map.set(v.targetId, (map.get(v.targetId) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([playerId, count]) => ({ playerId, count }))
    .sort((a, b) => b.count - a.count || (a.playerId ?? "").localeCompare(b.playerId ?? ""));
}

/** Computes the outcome of a finished voting round. */
export function computeVoteOutcome(
  votes: VoteRecord[],
  allowAbstain: boolean,
): VoteOutcome {
  const rows = tallyVotes(votes);
  const abstain = rows.find((r) => r.playerId === null)?.count ?? 0;
  const nonAbstain = rows.filter((r) => r.playerId !== null);

  const empty: VoteOutcome = { kind: "noVotes", rows, eliminatedId: null, tiedIds: [] };
  if (nonAbstain.length === 0) return empty;

  const max = Math.max(...nonAbstain.map((r) => r.count));
  if (allowAbstain && abstain > max) {
    return { kind: "abstain", rows, eliminatedId: null, tiedIds: [] };
  }
  const top = nonAbstain.filter((r) => r.count === max).map((r) => r.playerId as string);
  if (top.length > 1) {
    return { kind: "tie", rows, eliminatedId: null, tiedIds: top };
  }
  return { kind: "eliminate", rows, eliminatedId: top[0], tiedIds: [] };
}

/** Applies a finished vote outcome: eliminates the target, logs the event,
 *  and returns the winner if the game ended. Ties are logged but not applied. */
export function applyVoteElimination(state: GameState, outcome: VoteOutcome): Winner | null {
  state.lastVoteOutcome = outcome;
  const eliminatedId = outcome.eliminatedId;
  state.dayEliminatedId = eliminatedId;

  if (outcome.kind === "eliminate" && eliminatedId) {
    const p = playerById(state.players, eliminatedId);
    const reveal = state.settings.revealRoleOnElimination
      ? ` وكان دوره: ${ROLES[p.role].name}.`
      : "";
    eliminateAndLog(state, eliminatedId, "day", `خرج ${p.name} من اللعبة بالتصويت${reveal}`);
    // المهرج يفوز وحده إذا أُخرج بالتصويت النهاري.
    if (p.role === "jester") return "jester";
  } else if (outcome.kind === "tie") {
    state.log.push({
      id: uid("l"),
      night: state.night,
      phase: "day",
      text: "حدث تعادل في التصويت.",
    });
  } else {
    state.log.push({
      id: uid("l"),
      night: state.night,
      phase: "day",
      text: "لم يُخرج أحد بالتصويت.",
    });
  }

  return checkWin(state.players);
}

/** Coarse phase of the game derived from the fine-grained screen. Always one of
 *  the six allowed values — never undefined. */
export function phaseOf(screen: ScreenName): GamePhase {
  switch (screen) {
    case "roleIntro":
    case "roleReveal":
      return "roleReveal";
    case "nightIntro":
    case "nightMafia":
    case "nightDoctor":
    case "nightDetective":
      return "night";
    case "dayResults":
      return "day";
    case "discussion":
      return "discussion";
    case "votingHandoff":
    case "voteResults":
      return "voting";
    case "win":
      return "gameOver";
    default:
      // menu / setup / names / howTo / settings / spectate
      return "roleReveal";
  }
}

/** Resets round-scoped fields and moves to the next night. */
export function startNextNight(state: GameState): void {
  state.night += 1;
  state.nightActions = { mafiaTargetId: null, doctorSaveId: null, detectiveCheckId: null };
  state.detectiveResult = null;
  state.nightEliminatedId = null;
  state.dayEliminatedId = null;
  state.votes = [];
  state.voteCursor = 0;
  state.tiedCandidates = null;
  state.lastVoteOutcome = null;
}