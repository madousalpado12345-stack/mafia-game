/** AI players engine — every decision is limited to what the player's role
 *  actually allows them to know (no cheating). Pure logic over GameState. */
import { PERSONAS, personaById } from "./personas";
import { ROLES, shuffle } from "./roles";
import type {
  AiState,
  Difficulty,
  GameState,
  Player,
  Utterance,
  VoteRecord,
} from "./types";

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function isAiMode(game: GameState): boolean {
  return (game.playMode ?? "friends") === "ai";
}

export function humanPlayer(players: Player[]): Player | undefined {
  return players.find((p) => !p.isAi);
}

function difficultyFactor(game: GameState): number {
  if (game.difficulty === "easy") return 0.55;
  if (game.difficulty === "hard") return 1.15;
  return 0.85;
}

/** Probability of a random decision instead of an analyzed one. */
function noiseProbability(game: GameState): number {
  if (game.difficulty === "easy") return 0.3;
  if (game.difficulty === "medium") return 0.12;
  return 0.04;
}

function sc(st: AiState, map: Record<string, number>, id: string, fallback: number): number {
  return map[id] ?? fallback;
}

function raise(
  st: AiState,
  id: string,
  delta: number,
  kind: "suspect" | "trust",
) {
  if (kind === "suspect") st.suspectScores[id] = clamp(sc(st, st.suspectScores, id, 28) + delta, 0, 100);
  else st.trustScores[id] = clamp(sc(st, st.trustScores, id, 26) + delta, 0, 100);
}

function isMafiaRole(p: Player): boolean {
  return ROLES[p.role].team === "mafia";
}

/** Builds the per-AI private state when a game starts (or resumes). */
export function createAiStates(game: GameState): void {
  if (!game.aiStates) game.aiStates = {};
  const aiPlayers = game.players.filter((p) => p.isAi);
  aiPlayers.forEach((p, i) => {
    const persona = PERSONAS[i % PERSONAS.length];
    const st: AiState = {
      personalityId: persona.id,
      suspectScores: {},
      trustScores: {},
      mafiaTeammateIds: [],
      detectiveResults: [],
      savedIds: [],
      knownNightKills: [],
      knownEliminatedIds: [],
      voteHistory: [],
      accusations: [],
      defenses: [],
    };
    for (const q of game.players) {
      if (q.id === p.id) {
        st.suspectScores[q.id] = 0;
        st.trustScores[q.id] = 90;
      } else {
        // Jittered starting opinions — every player is equally targetable and
        // no AI systematically prefers the first player (or the human) on ties.
        st.suspectScores[q.id] = 16 + Math.random() * 18;
        st.trustScores[q.id] = 14 + Math.random() * 20;
      }
    }
    if (isMafiaRole(p)) {
      st.mafiaTeammateIds = game.players
        .filter((q) => q.id !== p.id && isMafiaRole(q))
        .map((q) => q.id);
      for (const id of st.mafiaTeammateIds) {
        st.suspectScores[id] = 0;
        st.trustScores[id] = 95;
      }
    }
    game.aiStates[p.id] = st;
  });
}

const aiStates = (game: GameState): Record<string, AiState> => game.aiStates ?? {};

/** Fills night actions for AI-held roles (only roles the human does not hold). */
export function applyAiNightActions(game: GameState): void {
  const human = humanPlayer(game.players);
  const states = aiStates(game);
  const factor = difficultyFactor(game);
  const alive = game.players.filter((p) => p.status === "alive");
  const noiseP = noiseProbability(game);

  // ---- mafia picks its target (unless the human is mafia) ------------------
  if (!human || human.status !== "alive" || !isMafiaRole(human)) {
    const mafiaAis = alive.filter((p) => p.isAi && isMafiaRole(p));
    if (mafiaAis.length > 0) {
      const candidates = alive.filter((q) => !isMafiaRole(q));
      if (candidates.length > 0) {
        const scoreFor = (c: Player): number => {
          let score = 0;
          for (const m of mafiaAis) {
            const st = states[m.id];
            if (!st) continue;
            const persona = personaById(st.personalityId);
            score += sc(st, st.suspectScores, c.id, 28) * (0.5 + persona.boldness * 0.7);
            // players who accused mafia members are dangerous
            for (const a of st.accusations) {
              if (a.accusedId === c.id && isMafiaRole(game.players.find((x) => x.id === a.accuserId)!)) {
                score += 18 * factor;
              }
            }
            // players who voted against mafia members are dangerous
            for (const v of st.voteHistory) {
              if (v.targetId === c.id && v.voterId !== c.id) {
                const voter = game.players.find((x) => x.id === v.voterId);
                if (voter && isMafiaRole(voter)) score += 14 * factor;
              }
            }
          }
          return score;
        };
        // The human is just another player — mafia does not know who is real.
        let target = topBy(candidates, scoreFor, 8) ?? candidates[0];
        if (Math.random() < noiseP) {
          target = candidates[Math.floor(Math.random() * candidates.length)];
        }
        game.nightActions.mafiaTargetId = target.id;
      }
    }
  }

  // ---- doctor (unless the human is the doctor) -----------------------------
  if (game.settings.doctorEnabled) {
    const humanDoc = human && human.role === "doctor" && human.status === "alive";
    if (!humanDoc) {
      const doc = alive.find((p) => p.isAi && p.role === "doctor");
      if (doc) {
        const st = states[doc.id];
        const persona = personaById(st?.personalityId ?? "smart");
        let candidates = alive.filter((q) =>
          game.settings.doctorCanHealSelf ? true : q.id !== doc.id,
        );
        if (candidates.length > 0) {
          // The doctor mostly protects trusted townsfolk (likely night targets),
          // and only protects itself when it feels personally threatened.
          const accusationsOnSelf = st
            ? st.accusations.filter((a) => a.accusedId === doc.id).length
            : 0;
          const caution =
            persona.id === "quiet" || persona.id === "skeptic"
              ? 1.6
              : persona.id === "aggressive" || persona.id === "confident"
                ? 0.55
                : 1;
          const selfBias = caution * (5 + accusationsOnSelf * 9 * factor);
          const scoreFor = (c: Player): number => {
            if (!st) return Math.random() * 20;
            if (c.id === doc.id) return selfBias + Math.random() * 2;
            const trust = sc(st, st.trustScores, c.id, 26);
            const suspect = sc(st, st.suspectScores, c.id, 28);
            return trust - suspect * 0.25;
          };
          let target = topBy(candidates, scoreFor, 6) ?? candidates[0];
          if (Math.random() < noiseP) {
            target = candidates[Math.floor(Math.random() * candidates.length)];
          }
          game.nightActions.doctorSaveId = target.id;
        }
      }
    }
  }

  // ---- detective (unless the human is the detective) -----------------------
  if (game.settings.detectiveEnabled) {
    const humanDet = human && human.role === "detective" && human.status === "alive";
    if (!humanDet) {
      const det = alive.find((p) => p.isAi && p.role === "detective");
      if (det) {
        const st = states[det.id];
        const candidates = alive.filter((q) => q.id !== det.id);
        if (candidates.length > 0) {
          const scoreFor = (c: Player): number => {
            if (!st) return Math.random() * 20;
            return sc(st, st.suspectScores, c.id, 28);
          };
          let target = topBy(candidates, scoreFor, 5) ?? candidates[0];
          if (Math.random() < noiseP) {
            target = candidates[Math.floor(Math.random() * candidates.length)];
          }
          game.nightActions.detectiveCheckId = target.id;
          game.detectiveResult = { targetId: target.id, isMafia: isMafiaRole(target) };
        }
      }
    }
  }
}

/** Updates AI memory + opinions after the night resolves. */
export function afterNightResolved(game: GameState): void {
  const states = aiStates(game);
  const factor = difficultyFactor(game);
  const victimId = game.nightEliminatedId;
  const detResult = game.detectiveResult;

  for (const p of game.players) {
    if (!p.isAi) continue;
    const st = states[p.id];
    if (!st) continue;

    // detective records its private result
    if (p.role === "detective" && detResult) {
      st.detectiveResults.push({ ...detResult });
      if (detResult.isMafia) {
        st.suspectScores[detResult.targetId] = 100;
      } else {
        raise(st, detResult.targetId, 30, "trust");
        raise(st, detResult.targetId, -25, "suspect");
      }
    }

    // doctor records its protection choice
    if (p.role === "doctor" && game.nightActions.doctorSaveId) {
      st.savedIds.push(game.nightActions.doctorSaveId);
      if (!victimId) {
        raise(st, game.nightActions.doctorSaveId, 5, "trust");
      }
    }

    // everyone reacts to the night kill
    if (victimId) {
      st.knownNightKills.push(victimId);
      for (const v of st.voteHistory) {
        if (v.targetId === victimId) raise(st, v.voterId, 7 * factor, "suspect");
      }
      for (const a of st.accusations) {
        if (a.accusedId === victimId) raise(st, a.accuserId, 5 * factor, "suspect");
      }
    }
  }
}

/** Records the finished vote round into each AI's memory + opinions. */
export function recordVotes(game: GameState): void {
  if (game.aiVotesRecorded) return;
  const states = aiStates(game);
  const factor = difficultyFactor(game);
  for (const p of game.players) {
    if (!p.isAi) continue;
    const st = states[p.id];
    if (!st) continue;
    st.voteHistory.push(...game.votes);
    for (const v of game.votes) {
      if (!v.voterId || v.voterId === p.id) continue;
      if (v.targetId === p.id) {
        // someone voted against me — suspicious
        raise(st, v.voterId, 10 * factor, "suspect");
      } else if (v.targetId) {
        // voted for my most-suspected player → trust the voter
        const top = topSuspect(st, game.players, p.id);
        if (top && v.targetId === top.id) raise(st, v.voterId, 4, "trust");
      }
    }
  }
  game.aiVotesRecorded = true;
}

/** Updates AI memory + opinions after the day elimination. */
export function afterDayResolved(game: GameState): void {
  const states = aiStates(game);
  const factor = difficultyFactor(game);
  const eliminatedId = game.dayEliminatedId;
  if (!eliminatedId) return;
  const eliminated = game.players.find((p) => p.id === eliminatedId);
  if (!eliminated) return;
  const revealedMafia = game.settings.revealRoleOnElimination && isMafiaRole(eliminated);

  for (const p of game.players) {
    if (!p.isAi) continue;
    const st = states[p.id];
    if (!st) continue;
    st.knownEliminatedIds.push(eliminatedId);
    for (const v of game.votes) {
      if (!v.voterId || v.voterId === p.id || v.targetId !== eliminatedId) continue;
      if (revealedMafia) raise(st, v.voterId, 12 * factor, "trust");
      else raise(st, v.voterId, 8 * factor, "suspect");
    }
    for (const a of st.accusations) {
      if (a.accusedId !== eliminatedId) continue;
      if (revealedMafia) raise(st, a.accuserId, 8 * factor, "trust");
      else raise(st, a.accuserId, 5 * factor, "suspect");
    }
  }
}

/** Picks the best item by score with a small random tie-break so equal scores
 *  never deterministically resolve to the first item in the list. */
function topBy<T>(items: T[], score: (item: T) => number, jitter = 4): T | null {
  if (items.length === 0) return null;
  let best = items[0];
  let bestScore = -Infinity;
  for (const item of items) {
    const s = score(item) + Math.random() * jitter;
    if (s > bestScore) {
      bestScore = s;
      best = item;
    }
  }
  return best;
}

function topSuspect(st: AiState, players: Player[], selfId: string): Player | null {
  const alive = players.filter((p) => p.status === "alive" && p.id !== selfId);
  return topBy(alive, (p) => sc(st, st.suspectScores, p.id, 28), 5);
}

/** Computes the vote of every alive AI player. never self, never dead, and
 *  (for mafia) never a teammate. */
export function aiVotesFor(game: GameState, onlyAmong: string[] | null): VoteRecord[] {
  const states = aiStates(game);
  const noiseP = noiseProbability(game);
  const votes: VoteRecord[] = [];
  const alive = game.players.filter((p) => p.status === "alive" && p.isAi);

  for (const p of alive) {
    const st = states[p.id];
    if (!st) continue;
    const persona = personaById(st.personalityId);
    let candidates = game.players.filter(
      (q) => q.status === "alive" && q.id !== p.id,
    );
    if (onlyAmong) candidates = candidates.filter((q) => onlyAmong.includes(q.id));
    if (p.role === "mafia") candidates = candidates.filter((q) => !isMafiaRole(q));
    if (candidates.length === 0) continue;

    if (p.role === "jester") {
      // The jester wants attention on themselves: half the time it blends in
      // with the crowd, half the time it votes erratically (looks odd).
      const blend = Math.random() < 0.5;
      const pick = blend
        ? (topSuspect(st, candidates, p.id) ?? candidates[0])
        : (topBy(candidates, (q) => 100 - sc(st, st.trustScores, q.id, 26), 6) ?? candidates[0]);
      votes.push({ voterId: p.id, targetId: pick.id });
      continue;
    }

    if (Math.random() < noiseP) {
      const rand = candidates[Math.floor(Math.random() * candidates.length)];
      votes.push({ voterId: p.id, targetId: rand.id });
      continue;
    }

    const pick = topBy(
      candidates,
      (q) => {
        const suspect = sc(st, st.suspectScores, q.id, 28);
        const trust = sc(st, st.trustScores, q.id, 26);
        let score = suspect * (1 + persona.boldness * 0.3) - trust * 0.1;
        if (persona.id === "aggressive") score += 4;
        return score;
      },
      10,
    ) ?? candidates[0];
    votes.push({ voterId: p.id, targetId: pick.id });
  }
  return votes;
}

// ---- discussion script -----------------------------------------------------

interface ScriptAccusation {
  accuserId: string;
  accusedId: string;
}

function fill(template: string, map: Record<string, string>): string {
  let out = template;
  for (const [key, value] of Object.entries(map)) {
    out = out.split(`{${key}}`).join(value);
  }
  return out;
}

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Builds the day's AI conversation and feeds it back into each AI's memory. */
export function buildDiscussionScript(game: GameState): Utterance[] {
  const states = aiStates(game);
  const factor = difficultyFactor(game);
  const alive = game.players.filter((p) => p.status === "alive" && p.isAi);
  if (alive.length === 0) return [];

  const byId = (id: string): Player => game.players.find((p) => p.id === id)!;
  const name = (id: string): string => byId(id).name;
  const utts: Utterance[] = [];
  const scriptAccusations: ScriptAccusation[] = [];
  const responded = new Set<string>();
  const victimId = game.nightEliminatedId;

  const say = (playerId: string, text: string) => {
    utts.push({ playerId, text });
  };

  const recordAccusation = (accuserId: string, accusedId: string) => {
    scriptAccusations.push({ accuserId, accusedId });
    const acc = states[accuserId];
    if (acc) {
      raise(acc, accusedId, 14 * factor, "suspect");
      acc.accusations.push({ accuserId, accusedId });
    }
    // witnesses adjust their own opinions based on how much they trust the accuser
    for (const other of alive) {
      if (other.id === accuserId) continue;
      const ost = states[other.id];
      if (!ost) continue;
      const trustAcc = sc(ost, ost.trustScores, accuserId, 26);
      const boost = ((30 + trustAcc) / 40) * 8 * factor;
      raise(ost, accusedId, boost, "suspect");
      raise(ost, accuserId, 2, "trust");
    }
  };

  const recordDefense = (accuserId: string, defenderId: string) => {
    const d = states[defenderId];
    if (d) {
      d.defenses.push({ accuserId, defenderId });
      raise(d, accuserId, 6 * factor, "suspect");
    }
    for (const other of alive) {
      if (other.id === defenderId) continue;
      const ost = states[other.id];
      if (!ost) continue;
      if (sc(ost, ost.trustScores, defenderId, 26) > 40) {
        raise(ost, accuserId, 4 * factor, "suspect");
      } else {
        raise(ost, accuserId, -1, "suspect");
      }
    }
  };

  const accusationTarget = (speaker: Player, isMafiaSpeaker: boolean): Player | null => {
    const st = states[speaker.id];
    if (!st) return null;
    let candidates = game.players.filter(
      (q) => q.status === "alive" && q.id !== speaker.id,
    );
    if (isMafiaSpeaker) {
      candidates = candidates.filter((q) => !isMafiaRole(q));
      const persona = personaById(st.personalityId);
      if (persona.id === "deceiver") {
        // frame the most trusted innocent
        return topBy(candidates, (q) => sc(st, st.trustScores, q.id, 26), 6);
      }
      if (candidates.length === 0) return null;
      return topSuspect(st, candidates, speaker.id);
    }
    if (candidates.length === 0) return null;
    return topSuspect(st, candidates, speaker.id);
  };

  // 1) opening reaction to the night
  const talkFirst = [...alive].sort((a, b) => {
    const pa = personaById(states[a.id]?.personalityId ?? "smart");
    const pb = personaById(states[b.id]?.personalityId ?? "smart");
    return pb.talkativeness + Math.random() * 0.2 - (pa.talkativeness + Math.random() * 0.2);
  });
  const openingSpeakers = talkFirst.slice(0, alive.length >= 6 ? 2 : 1);
  for (const s of openingSpeakers) {
    const persona = personaById(states[s.id]?.personalityId ?? "smart");
    const pool = victimId ? persona.phrases.reactNight : persona.phrases.reactNoKill;
    say(s.id, fill(pick(pool), { victim: victimId ? name(victimId) : "", count: String(Math.max(1, Math.round(100 / game.players.length))) }));
  }

  // 2) accusation round (talkative characters first)
  const accusers = [...alive].sort((a, b) => {
    const pa = personaById(states[a.id]?.personalityId ?? "smart");
    const pb = personaById(states[b.id]?.personalityId ?? "smart");
    return pb.talkativeness + Math.random() * 0.15 - (pa.talkativeness + Math.random() * 0.15);
  });

  for (const speaker of accusers) {
    if (utts.length >= 40) break;
    const st = states[speaker.id];
    const persona = personaById(st?.personalityId ?? "smart");
    const isMafiaSpeaker = isMafiaRole(speaker);

    if (speaker.role === "jester") {
      // bait: act suspicious, prefer accusing someone trusted
      const candidates = game.players.filter((q) => q.status === "alive" && q.id !== speaker.id);
      const target = topBy(
        candidates,
        (q) => (st ? sc(st, st.trustScores, q.id, 26) : 26),
        8,
      );
      say(speaker.id, fill(pick(persona.phrases.bait), { target: target ? name(target.id) : "الجميع" }));
      continue;
    }

    // mafia defends an attacked teammate instead of accusing
    if (isMafiaSpeaker && st && st.mafiaTeammateIds.length > 0) {
      const attackedTeammate = scriptAccusations.find(
        (a) => st.mafiaTeammateIds.includes(a.accusedId) && a.accusedId !== speaker.id,
      );
      if (attackedTeammate && !responded.has(speaker.id)) {
        responded.add(speaker.id);
        say(speaker.id, fill(pick(persona.phrases.defend), { accuser: name(attackedTeammate.accuserId), target: name(attackedTeammate.accusedId) }));
        continue;
      }
    }

    const target = accusationTarget(speaker, isMafiaSpeaker);
    if (!target) continue;
    say(speaker.id, fill(pick(persona.phrases.accuse), { target: name(target.id), accuser: name(speaker.id) }));
    recordAccusation(speaker.id, target.id);
  }

  // 3) reaction round — accused players respond
  for (const acc of scriptAccusations) {
    if (utts.length >= 40) break;
    const accused = byId(acc.accusedId);
    if (!accused.isAi || accused.status !== "alive" || responded.has(accused.id)) continue;
    responded.add(accused.id);
    const persona = personaById(states[accused.id]?.personalityId ?? "smart");
    const useCounter =
      persona.id === "aggressive" ? Math.random() < 0.65 : Math.random() < 0.3;
    const pool = useCounter ? persona.phrases.counter : persona.phrases.defend;
    say(accused.id, fill(pick(pool), { accuser: name(acc.accuserId), target: name(accused.id) }));
    recordDefense(acc.accuserId, accused.id);
  }

  // 4) vote-analysis round (if there are votes to analyze)
  if (utts.length < 40 && game.votes.length > 0) {
    const analysts = alive.filter((p) => {
      const persona = personaById(states[p.id]?.personalityId ?? "smart");
      return ["smart", "analyst", "skeptic"].includes(persona.id);
    });
    const speaking = shuffle(analysts).slice(0, Math.min(2, analysts.length));
    const realVotes = game.votes.filter((v) => v.targetId);
    for (const s of speaking) {
      if (realVotes.length === 0) break;
      const vote = realVotes[Math.floor(Math.random() * realVotes.length)];
      const persona = personaById(states[s.id]?.personalityId ?? "smart");
      say(
        s.id,
        fill(pick(persona.phrases.analyze), {
          voter: name(vote.voterId),
          target: name(vote.targetId!),
          accuser: name(vote.voterId),
        }),
      );
    }
  }

  // 5) closing statement
  if (utts.length < 40) {
    const closers = [...alive].sort((a, b) => {
      const pa = personaById(states[a.id]?.personalityId ?? "smart");
      const pb = personaById(states[b.id]?.personalityId ?? "smart");
      return pb.talkativeness - pa.talkativeness;
    });
    const closer = closers[0];
    if (closer) {
      const persona = personaById(states[closer.id]?.personalityId ?? "smart");
      say(closer.id, fill(pick(persona.phrases.close), { target: "", accuser: "" }));
    }
  }

  return utts;
}

/** Difficulty label helpers for the UI. */
export const DIFFICULTY_META: Record<Difficulty, { label: string; emoji: string; hint: string }> = {
  easy: { label: "سهل", emoji: "🟢", hint: "يرتكب أخطاء أكثر وتحليله بسيط" },
  medium: { label: "متوسط", emoji: "🟡", hint: "يحلل الأصوات والنقاشات ويرتكب بعض الأخطاء" },
  hard: { label: "صعب", emoji: "🔴", hint: "يحلل السلوك والأحداث ويكتشف التناقضات بمهارة" },
};

/** Returns a valid difficulty key for any (possibly missing/corrupt) value. */
export function safeDifficulty(d: Difficulty | string | null | undefined): Difficulty {
  return d === "easy" || d === "medium" || d === "hard" ? d : "medium";
}

/** Always-valid difficulty metadata — never undefined, never crashes. */
export function difficultyMeta(
  d: Difficulty | string | null | undefined,
): { label: string; emoji: string; hint: string } {
  return DIFFICULTY_META[safeDifficulty(d)];
}