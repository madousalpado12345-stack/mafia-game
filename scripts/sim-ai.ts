/**
 * Headless game-loop simulation — verifies the full Mafia loop works:
 *  - AI night/vote decisions never break role secrecy
 *  - all win conditions fire (citizens / mafia / jester)
 *  - ties resolve, night/day alternate, games always end
 * Run: bun scripts/sim-ai.ts
 */
import {
  afterDayResolved,
  afterNightResolved,
  aiVotesFor,
  applyAiNightActions,
  buildDiscussionScript,
  humanPlayer,
  recordVotes,
} from "../src/game/ai";
import {
  alivePlayers,
  applyVoteElimination,
  computeVoteOutcome,
  createGame,
  currentNightStep,
  resolveNight,
  startNextNight,
} from "../src/game/engine";
import { aiNamesFor } from "../src/game/personas";
import { ROLES } from "../src/game/roles";
import { difficultyMeta, safeDifficulty } from "../src/game/ai";
import { normalizeSettings } from "../src/game/storage";
import type { Difficulty, GameSettings, GameState, Winner } from "../src/game/types";

const RULES: GameSettings = {
  discussionMinutes: 3,
  revealRoleOnElimination: true,
  doctorCanHealSelf: true,
  allowAbstain: true,
  tieRevote: true,
  detectiveEnabled: true,
  doctorEnabled: true,
  jesterEnabled: true,
};

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
let failures = 0;
let nightsTotal = 0;

function fail(msg: string) {
  failures += 1;
  console.error("  ✗ FAIL:", msg);
}

function assert(cond: boolean, msg: string) {
  if (!cond) fail(msg);
}

function randomOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** The simulated human votes for the most-suspected alive player. */
function humanSmartVote(game: GameState): void {
  const human = humanPlayer(game.players);
  if (!human || human.status !== "alive") return;
  const candidates = alivePlayers(game.players).filter((p) => p.id !== human.id);
  if (candidates.length === 0) return;
  const ais = alivePlayers(game.players).filter((p) => p.isAi && game.aiStates[p.id]);
  const avgSuspicion = (id: string): number =>
    ais.reduce((sum, p) => sum + (game.aiStates[p.id].suspectScores[id] ?? 28), 0) /
    Math.max(1, ais.length);
  const target = candidates.reduce(
    (best, q) => (avgSuspicion(q.id) > avgSuspicion(best.id) ? q : best),
    candidates[0],
  );
  game.votes.push({ voterId: human.id, targetId: target.id });
}

function simulateAiGame(count: number, difficulty: Difficulty): Winner {
  const names = ["أحمد", ...aiNamesFor(count - 1, ["أحمد"])];
  const game = createGame(names, RULES, "ai", difficulty);
  return runAiGame(game, count, difficulty);
}

/** Plays an already-created AI game (night by night) until it ends. */
function runAiGame(game: GameState, count: number, difficulty: Difficulty): Winner {
  while (!game.winner && game.night < 60) {
    // ---- night ----
    applyAiNightActions(game);
    let step = currentNightStep(game);
    // human acts if their role is pending
    if (step === "mafia") {
      const candidates = alivePlayers(game.players).filter((p) => ROLES[p.role].team !== "mafia");
      game.nightActions.mafiaTargetId = randomOf(candidates).id;
      step = currentNightStep(game);
    }
    if (step === "doctor") {
      game.nightActions.doctorSaveId = randomOf(alivePlayers(game.players)).id;
      step = currentNightStep(game);
    }
    if (step === "detective") {
      const det = alivePlayers(game.players).find((p) => p.role === "detective")!;
      const target = randomOf(alivePlayers(game.players).filter((p) => p.id !== det.id));
      game.nightActions.detectiveCheckId = target.id;
      game.detectiveResult = { targetId: target.id, isMafia: ROLES[target.role].team === "mafia" };
      step = currentNightStep(game);
    }
    assert(step === "done", `night steps never stall (night ${game.night})`);
    // mafia never targets its own team
    if (game.nightActions.mafiaTargetId) {
      const target = game.players.find((p) => p.id === game.nightActions.mafiaTargetId)!;
      assert(ROLES[target.role].team !== "mafia", "mafia target is never mafia");
    }
    resolveNight(game);
    afterNightResolved(game);
    if (game.winner) break;

    // ---- day ----
    const script = buildDiscussionScript(game);
    for (const u of script) {
      const sp = game.players.find((p) => p.id === u.playerId);
      assert(!!sp && sp.isAi && sp.status === "alive", "discussion speakers are alive AI");
    }
    game.votes = aiVotesFor(game, null);
    const human = humanPlayer(game.players);
    if (human && human.status === "alive") humanSmartVote(game);
    // AI votes are legal
    for (const v of game.votes) {
      const voter = game.players.find((p) => p.id === v.voterId)!;
      const target = v.targetId ? game.players.find((p) => p.id === v.targetId) : null;
      assert(voter.status === "alive", "voters are alive");
      if (v.targetId) {
        assert(target!.status === "alive", "vote targets are alive");
        assert(v.voterId !== v.targetId, "no self votes");
        if (ROLES[voter.role].team === "mafia" && voter.isAi) {
          assert(ROLES[target!.role].team !== "mafia", "AI mafia never votes a teammate");
        }
      }
    }
    let outcome = computeVoteOutcome(game.votes, game.settings.allowAbstain);
    let winner = applyVoteElimination(game, outcome);
    recordVotes(game);
    afterDayResolved(game);
    if (winner) {
      game.winner = winner;
      break;
    }

    // ties: one re-vote, then no elimination
    if (outcome.kind === "tie" && game.settings.tieRevote) {
      game.tiedCandidates = outcome.tiedIds;
      game.votes = aiVotesFor(game, outcome.tiedIds);
      if (human && human.status === "alive") {
        const tied = alivePlayers(game.players).filter(
          (p) => outcome.tiedIds.includes(p.id) && p.id !== human.id,
        );
        if (tied.length > 0) game.votes.push({ voterId: human.id, targetId: randomOf(tied).id });
      }
      for (const v of game.votes) {
        const voter = game.players.find((p) => p.id === v.voterId)!;
        const target = v.targetId ? game.players.find((p) => p.id === v.targetId) : null;
        if (v.targetId) {
          assert(v.voterId !== v.targetId, "no self votes (revote)");
          if (ROLES[voter.role].team === "mafia" && voter.isAi) {
            assert(ROLES[target!.role].team !== "mafia", "AI mafia never votes a teammate (revote)");
          }
        }
      }
      outcome = computeVoteOutcome(game.votes, game.settings.allowAbstain);
      winner = applyVoteElimination(game, outcome);
      recordVotes(game);
      afterDayResolved(game);
      if (winner) {
        game.winner = winner;
        break;
      }
    }
    startNextNight(game);
  }

  assert(!!game.winner, `game ${count}/${difficulty} ended with a winner`);
  assert(["citizens", "mafia", "jester"].includes(game.winner ?? ""), "valid winner kind");
  nightsTotal += game.night;
  return game.winner as Winner;
}

/** Plays exactly round 1 and reports how the human fared (fairness metric). */
function firstRoundHumanStats(
  count: number,
  difficulty: Difficulty,
): { mafiaTeam: boolean; aliveAfterNight: boolean; aliveAfterDay: boolean } {
  const names = ["أحمد", ...aiNamesFor(count - 1, ["أحمد"])];
  const game = createGame(names, RULES, "ai", difficulty);
  const human = humanPlayer(game.players)!;
  const mafiaTeam = ROLES[human.role].team === "mafia";

  // night 1 (human acts if it holds a night role)
  applyAiNightActions(game);
  let step = currentNightStep(game);
  if (step === "mafia") {
    const candidates = alivePlayers(game.players).filter((p) => ROLES[p.role].team !== "mafia");
    game.nightActions.mafiaTargetId = randomOf(candidates).id;
    step = currentNightStep(game);
  }
  if (step === "doctor") {
    game.nightActions.doctorSaveId = randomOf(alivePlayers(game.players)).id;
    step = currentNightStep(game);
  }
  if (step === "detective") {
    const det = alivePlayers(game.players).find((p) => p.role === "detective")!;
    const target = randomOf(alivePlayers(game.players).filter((p) => p.id !== det.id));
    game.nightActions.detectiveCheckId = target.id;
    game.detectiveResult = { targetId: target.id, isMafia: ROLES[target.role].team === "mafia" };
  }
  resolveNight(game);
  const aliveAfterNight = human.status === "alive";
  if (game.winner) return { mafiaTeam, aliveAfterNight, aliveAfterDay: human.status === "alive" };

  // day 1 discussion + vote
  buildDiscussionScript(game);
  game.votes = aiVotesFor(game, null);
  if (human.status === "alive") humanSmartVote(game);
  const outcome = computeVoteOutcome(game.votes, game.settings.allowAbstain);
  applyVoteElimination(game, outcome);
  return { mafiaTeam, aliveAfterNight, aliveAfterDay: human.status === "alive" };
}

/** The game must keep running to the end when the human dies at night. */
function checkHumanOutAtNightContinues(): void {
  let tested = 0;
  while (tested < 30) {
    const names = ["أحمد", ...aiNamesFor(7, ["أحمد"])];
    const game = createGame(names, RULES, "ai", "medium");
    const human = humanPlayer(game.players)!;
    if (ROLES[human.role].team === "mafia") continue; // mafia can't be night-killed
    applyAiNightActions(game);
    game.nightActions.mafiaTargetId = human.id; // force the night kill on the human
    game.nightActions.doctorSaveId = null; // prevent a save from blocking the test
    resolveNight(game);
    assert(human.status === "dead", "human is forced out at night");
    if (game.winner) continue;
    startNextNight(game);
    const winner = runAiGame(game, 8, "medium");
    assert(!!winner, "game reaches a winner after the human died at night");
    tested += 1;
  }
}

/** The game must keep running to the end when the human is voted out. */
function checkHumanOutByVoteContinues(): void {
  let tested = 0;
  while (tested < 30) {
    const names = ["أحمد", ...aiNamesFor(7, ["أحمد"])];
    const game = createGame(names, RULES, "ai", "medium");
    const human = humanPlayer(game.players)!;
    if (human.role === "jester") continue; // jester voted out ends the game by design
    const voters = alivePlayers(game.players).filter((p) => p.id !== human.id);
    game.votes = voters.map((v) => ({ voterId: v.id, targetId: human.id }));
    const outcome = computeVoteOutcome(game.votes, game.settings.allowAbstain);
    const winner = applyVoteElimination(game, outcome);
    assert(human.status === "dead", "human is forced out by vote");
    if (winner) continue;
    recordVotes(game);
    afterDayResolved(game);
    startNextNight(game);
    const winner2 = runAiGame(game, 8, "medium");
    assert(!!winner2, "game reaches a winner after the human was voted out");
    tested += 1;
  }
}

function simulateFriendsGame(count: number): Winner {
  const names = Array.from({ length: count }, (_, i) => `اللاعب ${i + 1}`);
  const game = createGame(names, RULES, "friends");
  while (!game.winner && game.night < 60) {
    let step = currentNightStep(game);
    if (step === "mafia") {
      const candidates = alivePlayers(game.players).filter((p) => ROLES[p.role].team !== "mafia");
      game.nightActions.mafiaTargetId = randomOf(candidates).id;
      step = currentNightStep(game);
    }
    if (step === "doctor") {
      game.nightActions.doctorSaveId = randomOf(alivePlayers(game.players)).id;
      step = currentNightStep(game);
    }
    if (step === "detective") {
      const det = alivePlayers(game.players).find((p) => p.role === "detective")!;
      const target = randomOf(alivePlayers(game.players).filter((p) => p.id !== det.id));
      game.nightActions.detectiveCheckId = target.id;
      game.detectiveResult = { targetId: target.id, isMafia: ROLES[target.role].team === "mafia" };
    }
    resolveNight(game);
    if (game.winner) break;
    game.votes = alivePlayers(game.players).map((p) => {
      const candidates = alivePlayers(game.players).filter((q) => q.id !== p.id);
      return { voterId: p.id, targetId: randomOf(candidates).id };
    });
    const outcome = computeVoteOutcome(game.votes, game.settings.allowAbstain);
    const winner = applyVoteElimination(game, outcome);
    if (winner) {
      game.winner = winner;
      break;
    }
    startNextNight(game);
  }
  assert(!!game.winner, `friends game ${count} ended with a winner`);
  return game.winner as Winner;
}

// ---- stale/legacy settings regression (the 'hint' crash) --------------------
function checkLegacySettings(): void {
  // Simulates an app state saved BEFORE AI mode existed (no playMode/difficulty)
  const legacy = normalizeSettings({
    prefs: { soundOn: false, playerCount: 8 },
    rules: { tieRevote: false },
  });
  assert(legacy.prefs.difficulty === "medium", "missing difficulty defaults to medium");
  assert(legacy.prefs.playMode === "friends", "missing playMode defaults to friends");
  assert(legacy.prefs.soundOn === false, "existing prefs are preserved");
  assert(legacy.prefs.playerCount === 8, "existing playerCount is preserved");
  assert(legacy.rules.jesterEnabled === true, "missing rule defaults are filled");
  assert(legacy.rules.tieRevote === false, "existing rules are preserved");

  // The exact expression that crashed SetupScreen must never throw:
  const hint = difficultyMeta(undefined).hint;
  assert(typeof hint === "string" && hint.length > 0, "difficulty hint is always a string");
  assert(safeDifficulty("bogus") === "medium", "invalid difficulty falls back to medium");
  assert(safeDifficulty("hard") === "hard", "valid difficulty is kept");
  assert(difficultyMeta(null as unknown as string).hint.length > 0, "null difficulty is safe");
}

// ---- role-knowledge checks (no cheating) -----------------------------------
function checkRoleKnowledge(): void {
  const names = ["أحمد", ...aiNamesFor(9, ["أحمد"])];
  const game = createGame(names, RULES, "ai", "hard");
  for (const p of game.players) {
    if (!p.isAi) continue;
    const st = game.aiStates[p.id];
    const isMafia = ROLES[p.role].team === "mafia";
    assert(st.mafiaTeammateIds.length > 0 === isMafia, "only mafia know teammates");
    for (const id of st.mafiaTeammateIds) {
      assert(
        ROLES[game.players.find((x) => x.id === id)!.role].team === "mafia",
        "teammates are real mafia",
      );
    }
    assert(st.detectiveResults.length === 0, "no detective results at start");
    assert(!!st.personalityId, "every AI has a personality");
    // everyone's suspicion scores are within range
    for (const q of game.players) {
      assert(st.suspectScores[q.id] >= 0 && st.suspectScores[q.id] <= 100, "scores in range");
    }
  }
}

// ---- jester win fires when voted out ---------------------------------------
function checkJesterWin(): void {
  const names = ["أحمد", ...aiNamesFor(5, ["أحمد"])];
  const game = createGame(names, RULES, "ai", "medium");
  const jester = game.players.find((p) => p.role === "jester")!;
  const voters = alivePlayers(game.players).filter((p) => p.id !== jester.id);
  game.votes = voters.map((v) => ({ voterId: v.id, targetId: jester.id }));
  const outcome = computeVoteOutcome(game.votes, game.settings.allowAbstain);
  const winner = applyVoteElimination(game, outcome);
  assert(winner === "jester", "jester wins when voted out");
  assert(game.players.find((p) => p.id === jester.id)!.status === "dead", "jester is out");
}

// ---- run everything ---------------------------------------------------------
console.log("بدء محاكاة ألعاب الذكاء الاصطناعي...\n");
const aiWins = { citizens: 0, mafia: 0, jester: 0 } as Record<Winner, number>;
let aiGames = 0;  for (const count of [6, 7, 8, 10, 12, 14, 16]) {
    for (const difficulty of DIFFICULTIES) {
      const reps = difficulty === "medium" ? 120 : 60;
      for (let i = 0; i < reps; i++) {
        const winner = simulateAiGame(count, difficulty);
        aiWins[winner] += 1;
        aiGames += 1;
      }
    }
  }

console.log(`ألعاب AI مكتملة: ${aiGames}`);
console.log(
  `  فوز المواطنين: ${aiWins.citizens} · فوز المافيا: ${aiWins.mafia} · فوز المهرج: ${aiWins.jester}`,
);
console.log(`  متوسط عدد الليالي: ${(nightsTotal / Math.max(1, aiGames)).toFixed(1)}`);

console.log("\nالتحقق من الإعدادات القديمة (خطأ hint):");
checkLegacySettings();
console.log("  ✓ اكتمل");

console.log("\nالتحقق من معرفة الأدوار (لا غش):");
checkRoleKnowledge();
console.log("  ✓ اكتمل");

console.log("\nالتحقق من فوز المهرج:");
checkJesterWin();
console.log("  ✓ اكتمل");

console.log("\nعدالة استهداف اللاعب الحقيقي (الجولة الأولى):");
let humanAliveAfterNight = 0;
let humanAliveAfterDay = 0;
let humanFairGames = 0;
for (const count of [6, 8, 12, 16]) {
  for (const difficulty of DIFFICULTIES) {
    for (let i = 0; i < 60; i++) {
      const s = firstRoundHumanStats(count, difficulty);
      humanFairGames += 1;
      if (s.aliveAfterNight) humanAliveAfterNight += 1;
      if (s.aliveAfterDay) humanAliveAfterDay += 1;
    }
  }
}
const pct = (n: number) => `${((n / Math.max(1, humanFairGames)) * 100).toFixed(0)}%`;
console.log(`  نجا من الليلة الأولى: ${pct(humanAliveAfterNight)}`);
console.log(`  نجا حتى نهاية اليوم الأول: ${pct(humanAliveAfterDay)}`);
assert(
  humanAliveAfterDay / Math.max(1, humanFairGames) > 0.5,
  "human survives round 1 in the majority of games (not systematically eliminated)",
);
console.log("  ✓ اللاعب الحقيقي لا يُستهدف بشكل منهجي في الجولة الأولى");

console.log("\nاستمرار المباراة بعد خروج اللاعب الحقيقي:");
checkHumanOutAtNightContinues();
checkHumanOutByVoteContinues();
console.log("  ✓ المباراة تكمل الليل والنهار والتصويت حتى النهاية (مشاهدة)");

// ---- sample discussion for eyeballing quality ------------------------------
{
  const names = ["أحمد", ...aiNamesFor(7, ["أحمد"])];
  const game = createGame(names, RULES, "ai", "medium");
  const script = buildDiscussionScript(game);
  console.log("\nعينة من حوار النقاش (الليلة 1):");
  for (const u of script.slice(0, 8)) {
    const speaker = game.players.find((p) => p.id === u.playerId)!;
    console.log(`  ${speaker.name}: \"${u.text}\"`);
  }
}

console.log("\nمحاكاة ألعاب الأصدقاء (رجression):");
const friendsWins = { citizens: 0, mafia: 0, jester: 0 } as Record<Winner, number>;
for (const count of [6, 8, 12, 16]) {
  for (let i = 0; i < 50; i++) {
    const winner = simulateFriendsGame(count);
    friendsWins[winner] += 1;
  }
}
console.log(
  `  فوز المواطنين: ${friendsWins.citizens} · فوز المافيا: ${friendsWins.mafia} · فوز المهرج: ${friendsWins.jester}`,
);

console.log(failures === 0 ? "\n✅ كل الفحوصات نجحت!" : `\n❌ عدد الإخفاقات: ${failures}`);
process.exit(failures === 0 ? 0 : 1);