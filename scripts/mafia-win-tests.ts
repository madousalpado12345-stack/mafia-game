/** Explicit acceptance tests for the mafia win condition, as requested:
 *  mafia wins ONLY when aliveMafia >= aliveNonMafia. Never after one kill
 *  while outnumbered; citizens win when the last mafia is gone. */

import { applyVoteElimination, checkWin, computeVoteOutcome, createGame, resolveNight, startNextNight } from "@/game/engine";
import { aiVotesFor, humanPlayer } from "@/game/ai";
import { DEFAULT_SETTINGS } from "@/game/storage";
import type { GameState, Player, Winner } from "@/game/types";

let failures = 0;
function assert(cond: boolean, label: string) {
  if (cond) {
    console.log(`  ✅ ${label}`);
  } else {
    failures += 1;
    console.error(`  ❌ ${label}`);
  }
}

/** Builds a synthetic alive roster with `m` mafia and `n` non-mafia players. */
function roster(m: number, n: number): Player[] {
  const players: Player[] = [];
  let i = 0;
  for (let k = 0; k < m; k++) players.push({ id: `m${k}`, name: `مافيا${k}`, role: "mafia", status: "alive", isAi: true });
  for (let k = 0; k < n; k++) players.push({ id: `c${k}`, name: `مدني${k}`, role: k === 0 ? "doctor" : "citizen", status: "alive", isAi: true });
  return players;
}
function expectWinner(players: Player[], expected: Winner | null, label: string) {
  const got = checkWin(players);
  assert(got === expected, `${label} → توقع "${expected ?? "لا فائز"}" حصل "${got}"`);
}

console.log("الحالات الست الصريحة (checkWin):");
// Case 3: 2 مافيا ضد 3 غير مافيا → تستمر (لا فائز)
expectWinner(roster(2, 3), null, "3) 2 مافيا ضد 3 غير مافيا");
// Case 4: 2 مافيا ضد 2 غير مافيا → فوز المافيا
expectWinner(roster(2, 2), "mafia", "4) 2 مافيا ضد 2 غير مافيا");
// Case 5: 1 مافيا ضد 1 غير مافيا → فوز المافيا
expectWinner(roster(1, 1), "mafia", "5) 1 مافيا ضد 1 غير مافيا");
// Case 6: صفر مافيا → فوز المواطنين
expectWinner(roster(0, 4), "citizens", "6) خروج آخر مافيا → فوز المواطنين");
// حالة إضافية: 1 مافيا ضد 3 غير مافيا → تستمر
expectWinner(roster(1, 3), null, "إضافي) 1 مافيا ضد 3 غير مافيا (تستمر)");

console.log("\nقتل ليلي عبر resolveNight (2 مافيا ضد 5 غير مافيا):");
{
  // 7 players: deck gives 2 مافيا + 5 آخرين
  const game = createGame(
    ["أ", "ب", "ج", "د", "هـ", "و", "ز"],
    { ...DEFAULT_SETTINGS.rules, doctorEnabled: false, detectiveEnabled: false, jesterEnabled: false },
    "friends",
    "medium",
  );
  const mafiaIds = game.players.filter((p) => p.role === "mafia").map((p) => p.id);
  assert(mafiaIds.length === 2, "الطابق يوزع مافيتين في لعبة 7 لاعبين");
  const nonMafia = game.players.filter((p) => p.role !== "mafia");
  assert(nonMafia.length === 5, "5 غير مافيا في لعبة 7 لاعبين");

  // الليلة 1: المافيا تقتل مدنيًا واحدًا فقط
  game.nightActions.mafiaTargetId = nonMafia[0].id;
  const deadBefore = game.players.filter((p) => p.status === "dead").length;
  const w1 = resolveNight(game);
  const deadAfter = game.players.filter((p) => p.status === "dead").length;
  assert(deadAfter - deadBefore === 1, "خروج لاعب واحد فقط أثناء الليل");
  assert(w1 === null, "1) بعد قتل واحد (2 مافيا ضد 4 غير مافيا) → لا فائز، المباراة تستمر");
  assert(checkWin(game.players) === null, "الحالة الناتجة 2v4 لا تعلن فوز المافيا");
}

console.log("\nالتصويت النهاري عبر applyVoteElimination (لا فوز مبكر):");
{
  // 6 players pure: 2 مافيا + 4 مواطنين
  const game = createGame(
    ["أ", "ب", "ج", "د", "هـ", "و"],
    { ...DEFAULT_SETTINGS.rules, doctorEnabled: false, detectiveEnabled: false, jesterEnabled: false },
    "friends",
    "medium",
  );
  const nonMafia = game.players.filter((p) => p.role !== "mafia");
  // الليلة 1 قتل → 2v3 (لا فائز)
  game.nightActions.mafiaTargetId = nonMafia[0].id;
  assert(resolveNight(game) === null, "بعد الليلة 1: 2 مافيا ضد 3 غير مافيا → تستمر");

  // النهار: التصويت يخرج مواطنًا (2v2) → فوز المافيا عند التعادل العددي — قمة مشروعة
  const alive = game.players.filter((p) => p.status === "alive");
  const citizen = alive.find((p) => p.role !== "mafia")!;
  const mafia = alive.filter((p) => p.role === "mafia");
  const votes = [
    { voterId: mafia[0].id, targetId: citizen.id },
    { voterId: mafia[1].id, targetId: citizen.id },
    { voterId: citizen.id, targetId: mafia[0].id },
  ];
  const outcome = computeVoteOutcome(votes, false);
  assert(outcome.kind === "eliminate" && outcome.eliminatedId === citizen.id, "التصويت يُخرج المواطن (أعلى الأصوات)");
  const w = applyVoteElimination(game, outcome);
  assert(w === "mafia", "2 مافيا ضد 2 غير مافيا بعد الإخراج → فوز المافيا (الشرط 2>=2)");

  // الحالة 2: 2 مافيا ضد 4 → قتل واحد فقط → 2v3 → تستمر ثم قتل آخر → 2v2 فقط عندها تنتهي
  const g2 = createGame(
    ["أ", "ب", "ج", "د", "هـ", "و"],
    { ...DEFAULT_SETTINGS.rules, doctorEnabled: false, detectiveEnabled: false, jesterEnabled: false },
    "friends",
    "medium",
  );
  const nm2 = g2.players.filter((p) => p.role !== "mafia");
  g2.nightActions.mafiaTargetId = nm2[0].id;
  assert(resolveNight(g2) === null, "2) 2 مافيا ضد 4: قتل واحد → 2v3 → المباراة تستمر");
  startNextNight(g2);
  g2.nightActions.mafiaTargetId = g2.players.find((p) => p.status === "alive" && p.role !== "mafia")!.id;
  const w2 = resolveNight(g2);
  assert(w2 === "mafia", "2) بعد القتل الثاني أصبح 2v2 → فورًا: فوز المافيا (شرط 2>=2)");
  assert(checkWin(g2.players) === "mafia", "2) عند 2 مافيا ضد 2 غير مافيا فقط → فوز المافيا");
}

console.log("\nفحص مباريات الأصدقاء الكاملة (تصويت تسلسلي يدوي + امتناع + تعادل):");
{
  let wins: Record<string, number> = { citizens: 0, mafia: 0, jester: 0 };
  let earlyMafiaKillWin = 0;
  const N = 2000;
  for (let trial = 0; trial < N; trial++) {
    const n = 6 + Math.floor(Math.random() * 11); // 6..16
    const game = createGame(
      Array.from({ length: n }, (_, i) => `لاعب${i}`),
      DEFAULT_SETTINGS.rules,
      "friends",
      "medium",
    );
    let guard = 0;
    while (!game.winner && guard < 40) {
      guard += 1;
      // night — كل دور حي يتصرف (تسلسل المافيا ثم الطبيب ثم المحقق)
      const aliveN = game.players.filter((p) => p.status === "alive");
      const mafiaN = aliveN.filter((p) => p.role === "mafia");
      if (mafiaN.length > 0) {
        const targets = aliveN.filter((p) => p.role !== "mafia");
        if (targets.length > 0) game.nightActions.mafiaTargetId = targets[Math.floor(Math.random() * targets.length)].id;
      }
      const doc = aliveN.find((p) => p.role === "doctor");
      if (doc) {
        const cands = game.settings.doctorCanHealSelf ? aliveN : aliveN.filter((p) => p.id !== doc.id);
        game.nightActions.doctorSaveId = cands[Math.floor(Math.random() * cands.length)]?.id ?? null;
      }
      const det = aliveN.find((p) => p.role === "detective");
      if (det) {
        const cands = aliveN.filter((p) => p.id !== det.id);
        if (cands.length > 0) game.nightActions.detectiveCheckId = cands[Math.floor(Math.random() * cands.length)].id;
      }
      const deadB = game.players.filter((p) => p.status === "dead").length;
      const wNight = resolveNight(game);
      const deadA = game.players.filter((p) => p.status === "dead").length;
      if (deadA - deadB === 1 && wNight === "mafia") {
        const m = game.players.filter((p) => p.status === "alive" && p.role === "mafia").length;
        const nm = game.players.filter((p) => p.status === "alive" && p.role !== "mafia").length;
        if (m < nm) earlyMafiaKillWin += 1;
      }
      if (wNight) game.winner = wNight;
      if (game.winner) break;
      // day vote — كل حي يصوّت بدوره (مع امتناع أحيانًا)
      const voters = game.players.filter((p) => p.status === "alive");
      const votes = [];
      for (const v of voters) {
        if (Math.random() < 0.08 && game.settings.allowAbstain) {
          votes.push({ voterId: v.id, targetId: null });
          continue;
        }
        const cands = voters.filter((p) => p.id !== v.id);
        votes.push({ voterId: v.id, targetId: cands[Math.floor(Math.random() * cands.length)].id });
      }
      game.votes = votes;
      let outcome = computeVoteOutcome(game.votes, game.settings.allowAbstain);
      let w = applyVoteElimination(game, outcome);
      if (game.winner) break;
      // tie → إعادة تصويت بين المتعادلين (إن فُعّلت) أو عدم إخراج أحد
      if (outcome.kind === "tie") {
        if (game.settings.tieRevote && (outcome.tiedIds ?? []).length > 0) {
          const revoters = game.players.filter((p) => p.status === "alive");
          const rv = [];
          for (const v of revoters) {
            const cands = (outcome.tiedIds ?? []).filter((id) => id !== v.id);
            rv.push({ voterId: v.id, targetId: cands.length ? cands[Math.floor(Math.random() * cands.length)] : null });
          }
          game.votes = rv;
          outcome = computeVoteOutcome(game.votes, false);
          w = applyVoteElimination(game, outcome);
          if (w) game.winner = w;
        } else {
          w = checkWin(game.players);
          if (w) game.winner = w;
        }
      } else if (w) {
        game.winner = w;
      }
      if (game.winner) break;
      startNextNight(game);
    }
    if (!game.winner) {
      failures += 1;
      console.error("  ❌ لعبة أصدقاء لم تنتهِ");
      continue;
    }
    wins[game.winner] += 1;
    // تحقق: أي فوز مافيا يستوفي الشرط العددي
    if (game.winner === "mafia") {
      const m = game.players.filter((p) => p.status === "alive" && p.role === "mafia").length;
      const nm = game.players.filter((p) => p.status === "alive" && p.role !== "mafia").length;
      if (m < nm) {
        failures += 1;
        console.error(`  ❌ فوز مافيا غير صالح: mafia=${m} nonMafia=${nm}`);
      }
    }
  }
  assert(earlyMafiaKillWin === 0, `لا يوجد فوز مافيا بعد قتل واحد بينما هي أقل عددًا (0 حالات من ${N})`);
  console.log(`     التوزيع: مواطنون ${wins.citizens} · مافيا ${wins.mafia} · مهرج ${wins.jester}`);
}

console.log("\nفحص مباريات AI الكاملة (مسار Landing نفسه):");
{
  let early = 0;
  const N = 2000;
  for (let trial = 0; trial < N; trial++) {
    const n = 6 + Math.floor(Math.random() * 11);
    const game = createGame(
      Array.from({ length: n }, (_, i) => (i === 0 ? "أنت" : `AI${i}`)),
      DEFAULT_SETTINGS.rules,
      "ai",
      "medium",
    );
    const human = humanPlayer(game.players);
    let guard = 0;
    while (!game.winner && guard < 40) {
      guard += 1;
      // مسار Landing: AI يملأ أدواره، والإنسان يختار حسب دوره
      const aliveAll = game.players.filter((p) => p.status === "alive");
      if (!(human && human.status === "alive" && human.role === "mafia") && aliveAll.some((p) => p.isAi && p.role === "mafia")) {
        const targets = aliveAll.filter((p) => p.role !== "mafia");
        if (targets.length > 0) game.nightActions.mafiaTargetId = targets[Math.floor(Math.random() * targets.length)].id;
      }
      if (human && human.status === "alive" && human.role === "mafia") {
        const targets = aliveAll.filter((p) => p.role !== "mafia");
        if (targets.length > 0) game.nightActions.mafiaTargetId = targets[Math.floor(Math.random() * targets.length)].id;
      }
      if (!(human && human.status === "alive" && human.role === "doctor")) {
        const doc = aliveAll.find((p) => p.isAi && p.role === "doctor");
        if (doc) {
          const cands = game.settings.doctorCanHealSelf ? aliveAll : aliveAll.filter((p) => p.id !== doc.id);
          game.nightActions.doctorSaveId = cands[Math.floor(Math.random() * cands.length)]?.id ?? null;
        }
      }
      if (human && human.status === "alive" && human.role === "doctor") {
        const cands = game.settings.doctorCanHealSelf ? aliveAll : aliveAll.filter((p) => p.id !== human.id);
        game.nightActions.doctorSaveId = cands[Math.floor(Math.random() * cands.length)]?.id ?? null;
      }
      if (!(human && human.status === "alive" && human.role === "detective")) {
        const det = aliveAll.find((p) => p.isAi && p.role === "detective");
        if (det) {
          const cands = aliveAll.filter((p) => p.id !== det.id);
          if (cands.length > 0) game.nightActions.detectiveCheckId = cands[Math.floor(Math.random() * cands.length)].id;
        }
      }
      if (human && human.status === "alive" && human.role === "detective") {
        const cands = aliveAll.filter((p) => p.id !== human.id);
        if (cands.length > 0) game.nightActions.detectiveCheckId = cands[Math.floor(Math.random() * cands.length)].id;
      }
      const deadB = game.players.filter((p) => p.status === "dead").length;
      const wNight = resolveNight(game);
      const deadA = game.players.filter((p) => p.status === "dead").length;
      if (deadA - deadB === 1 && wNight === "mafia") {
        const m = game.players.filter((p) => p.status === "alive" && p.role === "mafia").length;
        const nm = game.players.filter((p) => p.status === "alive" && p.role !== "mafia").length;
        if (m < nm) early += 1;
      }
      if (wNight) game.winner = wNight;
      if (game.winner) break;
      // day: أصوات AI + صوت الإنسان
      const votes = aiVotesFor(game, null);
      if (human && human.status === "alive") {
        const cands = aliveAll.filter((p) => p.id !== human.id);
        votes.push({ voterId: human.id, targetId: cands.length ? cands[Math.floor(Math.random() * cands.length)].id : null });
      }
      game.votes = votes;
      const outcome = computeVoteOutcome(game.votes, game.settings.allowAbstain);
      const w = applyVoteElimination(game, outcome);
      if (w) game.winner = w;
      if (game.winner) break;
      startNextNight(game);
    }
    if (game.winner === "mafia") {
      const m = game.players.filter((p) => p.status === "alive" && p.role === "mafia").length;
      const nm = game.players.filter((p) => p.status === "alive" && p.role !== "mafia").length;
      if (m < nm) {
        failures += 1;
        console.error(`  ❌ فوز مافيا غير صالح في AI: mafia=${m} nonMafia=${nm}`);
      }
    }
  }
  assert(early === 0, `AI: لا فوز مافيا بعد قتل واحد وهي أقل عددًا (0 من ${N})`);
}

if (failures > 0) {
  console.error(`\n❌ ${failures} فحصًا فشل`);
  process.exit(1);
}
console.log("\n✅ جميع فحوصات شرط فوز المافيا نجحت: لا فوز مبكر بعد قتل واحد، والفوز فقط عند التوازن العددي (mafia >= nonMafia).");
