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

function simulateAiGame(count: number, difficulty: Difficulty): Winner {
  const names = ["أحمد", ...aiNamesFor(count - 1, ["أحمد"])];
  const game = createGame(names, RULES, "ai", difficulty);

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
    if (human && human.status === "alive") {
      // the human votes like a smart player: most-suspected alive player
      const candidates = alivePlayers(game.players).filter((p) => p.id !== human.id);
      if (candidates.length > 0) {
        const target = candidates.reduce((best, q) => {
          const avg =
            alivePlayers(game.players)
              .filter((p) => p.isAi && game.aiStates[p.id])
              .reduce((sum, p) => sum + (game.aiStates[p.id].suspectScores[q.id] ?? 28), 0) /
            Math.max(1, alivePlayers(game.players).filter((p) => p.isAi).length);
          const bestAvg =
            alivePlayers(game.players)
              .filter((p) => p.isAi && game.aiStates[p.id])
              .reduce((sum, p) => sum + (game.aiStates[p.id].suspectScores[best.id] ?? 28), 0) /
            Math.max(1, alivePlayers(game.players).filter((p) => p.isAi).length);
          return avg > bestAvg ? q : best;
        }, candidates[0]);
        game.votes.push({ voterId: human.id, targetId: target.id });
      }
    }
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

console.log("\nالتحقق من معرفة الأدوار (لا غش):");
checkRoleKnowledge();
console.log("  ✓ اكتمل");

console.log("\nالتحقق من فوز المهرج:");
checkJesterWin();
console.log("  ✓ اكتمل");

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