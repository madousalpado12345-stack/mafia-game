/** Acceptance tests for the game-ending logic, as requested:
 *  • Citizens win when the last mafia is gone (aliveMafia === 0).
 *  • Mafia wins ONLY in the final state: exactly ONE non-mafia alive.
 *  • A single night kill never ends the game — it must continue round after
 *    round (night → day → discussion → voting) until a real win state.
 *  • Win checks use only the CURRENT alive roster — never kill counts,
 *    round numbers, or previous-round data. */

import { applyVoteElimination, checkWin, computeVoteOutcome, createGame, resolveNight, startNextNight } from "@/game/engine";
import { aiVotesFor, humanPlayer } from "@/game/ai";
import { maxMafiaCount } from "@/game/roles";
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
  for (let k = 0; k < m; k++) players.push({ id: `m${k}`, name: `مافيا${k}`, role: "mafia", status: "alive", isAi: true });
  for (let k = 0; k < n; k++) players.push({ id: `c${k}`, name: `مدني${k}`, role: k === 0 ? "doctor" : "citizen", status: "alive", isAi: true });
  return players;
}
function expectWinner(players: Player[], expected: Winner | null, label: string) {
  const got = checkWin(players);
  assert(got === expected, `${label} → توقع "${expected ?? "لا فائز"}" حصل "${got}"`);
}

/** Validates a finished game: winner must match the alive roster exactly. */
function validateEnd(game: GameState): boolean {
  const m = game.players.filter((p) => p.status === "alive" && p.role === "mafia").length;
  const nm = game.players.filter((p) => p.status === "alive" && p.role !== "mafia").length;
  if (game.winner === "mafia") return m >= 1 && nm === 1;
  if (game.winner === "citizens") return m === 0;
  if (game.winner === "jester") return true; // يفوز وحده بإخراجه بالتصويت
  return false;
}

console.log("قاعدة checkWin على الحالات المباشرة:");
expectWinner(roster(2, 3), null, "2 مافيا ضد 3 غير مافيا → تستمر");
expectWinner(roster(2, 2), null, "2 مافيا ضد 2 غير مافيا → تستمر (ليست نهاية)");
expectWinner(roster(2, 1), "mafia", "2 مافيا ضد 1 غير مافيا → الحالة النهائية: فوز المافيا");
expectWinner(roster(1, 2), null, "1 مافيا ضد 2 غير مافيا → تستمر");
expectWinner(roster(1, 1), "mafia", "1 مافيا ضد 1 غير مافيا → فوز المافيا");
expectWinner(roster(0, 4), "citizens", "خروج آخر مافيا → فوز المواطنين");
expectWinner(roster(3, 1), "mafia", "3 مافيا ضد 1 غير مافيا → فوز المافيا");
// كل الأدوار غير المافيا تدخل في العدد: طبيب/محقق/مهرج/مواطن
{
  const mixed: Player[] = [
    { id: "m1", name: "مافيا", role: "mafia", status: "alive", isAi: true },
    { id: "j1", name: "مهرج", role: "jester", status: "alive", isAi: true },
  ];
  expectWinner(mixed, "mafia", "1 مافيا ضد مهرج واحد فقط → المهرج ضمن غير المافيا، فوز المافيا");
}

console.log("\nقتل ليلي عبر resolveNight (2 مافيا ضد 5 غير مافيا):");
{
  const game = createGame(
    ["أ", "ب", "ج", "د", "هـ", "و", "ز"],
    { ...DEFAULT_SETTINGS.rules, doctorEnabled: false, detectiveEnabled: false, jesterEnabled: false },
    "friends",
    "medium",
  );
  const mafiaIds = game.players.filter((p) => p.role === "mafia").map((p) => p.id);
  assert(mafiaIds.length === 2, "الطابق يوزع مافيتين في لعبة 7 لاعبين (الافتراضي)");
  const nonMafia = game.players.filter((p) => p.role !== "mafia");
  assert(nonMafia.length === 5, "5 غير مافيا في لعبة 7 لاعبين");

  // الليلة 1: قتل واحد فقط → لا نهاية
  game.nightActions.mafiaTargetId = nonMafia[0].id;
  const deadBefore = game.players.filter((p) => p.status === "dead").length;
  const w1 = resolveNight(game);
  const deadAfter = game.players.filter((p) => p.status === "dead").length;
  assert(deadAfter - deadBefore === 1, "خروج لاعب واحد فقط أثناء الليل");
  assert(w1 === null, "1) بعد قتل واحد (2 مافيا ضد 4 غير مافيا) → لا فائز، المباراة تستمر");
  assert(checkWin(game.players) === null, "الحالة الناتجة لا تعلن فوز المافيا");

  // الليلة 2: قتل آخر → 2v3 → تستمر أيضًا
  startNextNight(game);
  game.nightActions.mafiaTargetId = game.players.find((p) => p.status === "alive" && p.role !== "mafia")!.id;
  assert(resolveNight(game) === null, "الليلة 2: قتل آخر → 2 ضد 3 → تستمر");
  // الليلة 3: قتل → 2v2 → ما زالت تستمر (ليست النهاية)
  startNextNight(game);
  game.nightActions.mafiaTargetId = game.players.find((p) => p.status === "alive" && p.role !== "mafia")!.id;
  assert(resolveNight(game) === null, "الليلة 3: 2 ضد 2 → لا نهاية بعد — القاعدة: تستمر حتى يبقى واحد فقط");
  // الليلة 4: قتل → 2v1 → الحالة النهائية
  startNextNight(game);
  game.nightActions.mafiaTargetId = game.players.find((p) => p.status === "alive" && p.role !== "mafia")!.id;
  assert(resolveNight(game) === "mafia", "الليلة 4: 2 مافيا ضد 1 غير مافيا → فقط هنا تفوز المافيا");
}

console.log("\nالتصويت النهاري عبر applyVoteElimination (لا فوز مبكر):");
{
  // 6 لاعبين نقي: 2 مافيا + 4 مواطنين → الليلة 1 قتل → 2v3
  const game = createGame(
    ["أ", "ب", "ج", "د", "هـ", "و"],
    { ...DEFAULT_SETTINGS.rules, doctorEnabled: false, detectiveEnabled: false, jesterEnabled: false },
    "friends",
    "medium",
  );
  const nonMafia = game.players.filter((p) => p.role !== "mafia");
  game.nightActions.mafiaTargetId = nonMafia[0].id;
  assert(resolveNight(game) === null, "بعد الليلة 1: 2 مافيا ضد 3 غير مافيا → تستمر");

  // النهار: التصويت يُخرج مواطنًا → 2v2 → تستمر (ليست نهاية)
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
  assert(applyVoteElimination(game, outcome) === null, "2) إخراج مافيا بالتصويت مع بقاء أخرى... هنا خرج مواطن: 2v2 → تستمر المباراة");
  assert(checkWin(game.players) === null, "2 مافيا ضد 2 غير مافيا ليست نهاية — تستمر");

  // الليلة التالية: القتل يجعلها 2v1 → نهاية
  startNextNight(game);
  game.nightActions.mafiaTargetId = game.players.find((p) => p.status === "alive" && p.role !== "mafia")!.id;
  assert(resolveNight(game) === "mafia", "4) الوصول إلى 2 مافيا ضد 1 غير مافيا → فوز المافيا");
}

console.log("\nإخراج مافيا بالتصويت (الحالات 2 و3):");
{
  // 7 لاعبين: 2 مافيا + 5 آخرين (الطبيب/المحقق/المهرج معطلة)
  const game = createGame(
    ["أ", "ب", "ج", "د", "هـ", "و", "ز"],
    { ...DEFAULT_SETTINGS.rules, doctorEnabled: false, detectiveEnabled: false, jesterEnabled: false },
    "friends",
    "medium",
  );
  const nonMafia = game.players.filter((p) => p.role !== "mafia");
  game.nightActions.mafiaTargetId = nonMafia[0].id;
  assert(resolveNight(game) === null, "الليلة 1: قتل واحد → تستمر");
  // النهار: التصويت يُخرج مافيا واحدة (بقيت أخرى)
  const alive = game.players.filter((p) => p.status === "alive");
  const mafiaTarget = alive.find((p) => p.role === "mafia")!;
  const votes = alive.map((p) => (p.id === mafiaTarget.id ? { voterId: p.id, targetId: alive.find((q) => q.id !== p.id)!.id } : { voterId: p.id, targetId: mafiaTarget.id }));
  const outcome = computeVoteOutcome(votes, false);
  assert(outcome.eliminatedId === mafiaTarget.id, "التصويت يُخرج مافيا واحدة");
  assert(applyVoteElimination(game, outcome) === null, "2) أُخرجت مافيا بالتصويت لكن توجد أخرى → المباراة تستمر");
}

console.log("\nمباريات الأصدقاء الكاملة (تصويت تسلسلي + امتناع + تعادل):");
{
  const wins: Record<string, number> = { citizens: 0, mafia: 0, jester: 0 };
  let round1MafiaEnd = 0;
  let invalidEnd = 0;
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
    while (!game.winner && guard < 60) {
      guard += 1;
      const round = game.night;
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
      const wNight = resolveNight(game);
      if (wNight) game.winner = wNight;
      if (game.winner) {
        if (game.winner === "mafia" && round === 1) round1MafiaEnd += 1;
        break;
      }
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
      if (w) game.winner = w;
      if (!game.winner && outcome.kind === "tie") {
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
      }
      if (game.winner) {
        if (game.winner === "mafia" && round === 1) round1MafiaEnd += 1;
        break;
      }
      startNextNight(game);
    }
    if (!game.winner) {
      failures += 1;
      console.error("  ❌ لعبة أصدقاء لم تنتهِ خلال 60 جولة");
      continue;
    }
    wins[game.winner] += 1;
    if (!validateEnd(game)) {
      invalidEnd += 1;
      failures += 1;
      console.error("  ❌ نهاية غير صالحة في مباراة أصدقاء");
    }
  }
  assert(round1MafiaEnd === 0, `لا فوز مافيا في الجولة الأولى إطلاقًا (0 من ${N})`);
  assert(invalidEnd === 0, "كل نهاية مافيا حدثت عند بقاء لاعب واحد فقط، وكل فوز مواطنين بعد خروج آخر مافيا");
  console.log(`     التوزيع: مواطنون ${wins.citizens} · مافيا ${wins.mafia} · مهرج ${wins.jester}`);
}

console.log("\nتوزيع عدد المافيا المختار (يطابق الاختيار بالضبط):");
{
  const mkRules = (mafiaCount: number | null) => ({ ...DEFAULT_SETTINGS.rules, mafiaCount });

  for (const chosen of [1, 2, 3]) {
    for (let t = 0; t < 200; t++) {
      const g = createGame(Array.from({ length: 8 }, (_, i) => `ل${i}`), mkRules(chosen), "friends", "medium");
      const m = g.players.filter((p) => p.role === "mafia").length;
      if (m !== chosen) {
        failures += 1;
        console.error(`  ❌ 8 لاعبين باختيار ${chosen} مافيا → وُزّع ${m}`);
      }
    }
  }
  assert(true, "8 لاعبين: اختيار 1/2/3 يوزّع بالضبط 1/2/3 مافيا (200 محاولة لكل اختيار)");

  for (let t = 0; t < 200; t++) {
    const g = createGame(Array.from({ length: 6 }, (_, i) => `ل${i}`), mkRules(3), "friends", "medium");
    const m = g.players.filter((p) => p.role === "mafia").length;
    if (m !== 2) {
      failures += 1;
      console.error(`  ❌ 6 لاعبين باختيار 3 → يجب أن تُقصّ إلى 2، وُزّع ${m}`);
    }
  }
  assert(true, "6 لاعبين: اختيار 3 يُقصّ تلقائيًا إلى الحد الأقصى 2");

  for (let t = 0; t < 200; t++) {
    const g = createGame(Array.from({ length: 16 }, (_, i) => `ل${i}`), mkRules(7), "friends", "medium");
    const m = g.players.filter((p) => p.role === "mafia").length;
    if (m !== 7) {
      failures += 1;
      console.error(`  ❌ 16 لاعبين باختيار 7 → وُزّع ${m}`);
    }
    const nm = g.players.filter((p) => p.role !== "mafia").length;
    if (nm !== 9 || nm <= m) {
      failures += 1;
      console.error(`  ❌ 16 لاعبين: غير المافيا ${nm} يجب أن يكون 9 (> المافيا)`);
    }
  }
  assert(true, "16 لاعبين: الحد الأقصى 7 مافيا ضد 9 آخرين");

  for (let n = 6; n <= 16; n++) {
    const maxM = maxMafiaCount(n);
    for (let t = 0; t < 100; t++) {
      const g = createGame(Array.from({ length: n }, (_, i) => `ل${i}`), mkRules(99), "friends", "medium");
      const m = g.players.filter((p) => p.role === "mafia").length;
      if (m !== maxM) {
        failures += 1;
        console.error(`  ❌ ${n} لاعبين: الحد الأقصى ${maxM}، وُزّع ${m}`);
      }
      if (m >= n - m) {
        failures += 1;
        console.error(`  ❌ ${n} لاعبين: مافيا ${m} >= غير مافيا ${n - m} عند البداية!`);
      }
    }
  }
  assert(true, "العدد الأقصى لكل عدد لاعبين 6–16: يوزَّع بالضبط ولا يسبق التوازن من البداية");
}

console.log("\nمباريات كاملة بعدد مافيا 1 ثم بالحد الأقصى (تصل للنهاية الصحيحة):");
{
  for (const chosen of [1, 2, 7]) {
    let invalid = 0;
    let ended = 0;
    let maxRounds = 0;
    const N = 120;
    for (let t = 0; t < N; t++) {
      const g = createGame(
        Array.from({ length: 16 }, (_, i) => (i === 0 ? "أنت" : `AI${i}`)),
        { ...DEFAULT_SETTINGS.rules, mafiaCount: chosen },
        "ai",
        "medium",
      );
      let guard = 0;
      while (!g.winner && guard < 60) {
        guard += 1;
        maxRounds = Math.max(maxRounds, g.night);
        const aliveAll = g.players.filter((p) => p.status === "alive");
        const mafiaA = aliveAll.filter((p) => p.role === "mafia");
        const targets = aliveAll.filter((p) => p.role !== "mafia");
        if (mafiaA.length > 0 && targets.length > 0) g.nightActions.mafiaTargetId = targets[Math.floor(Math.random() * targets.length)].id;
        const doc = aliveAll.find((p) => p.role === "doctor");
        if (doc) {
          const cands = g.settings.doctorCanHealSelf ? aliveAll : aliveAll.filter((p) => p.id !== doc.id);
          g.nightActions.doctorSaveId = cands[Math.floor(Math.random() * cands.length)]?.id ?? null;
        }
        const det = aliveAll.find((p) => p.role === "detective");
        if (det) {
          const cands = aliveAll.filter((p) => p.id !== det.id);
          if (cands.length > 0) g.nightActions.detectiveCheckId = cands[Math.floor(Math.random() * cands.length)].id;
        }
        const wN = resolveNight(g);
        if (wN) g.winner = wN;
        if (g.winner) break;
        const voters = g.players.filter((p) => p.status === "alive");
        const votes = [];
        for (const v of voters) {
          const cands = voters.filter((p) => p.id !== v.id);
          if (cands.length === 0) continue;
          votes.push({ voterId: v.id, targetId: cands[Math.floor(Math.random() * cands.length)].id });
        }
        g.votes = votes;
        const outcome = computeVoteOutcome(g.votes, false);
        const w = applyVoteElimination(g, outcome);
        if (w) g.winner = w;
        if (g.winner) break;
        startNextNight(g);
      }
      if (g.winner && validateEnd(g)) ended += 1;
      else if (!g.winner) {
        invalid += 1;
        console.error("  ❌ مباراة لم تنتهِ خلال 60 جولة");
      } else {
        invalid += 1;
        console.error("  ❌ نهاية غير صالحة");
      }
    }
    assert(ended === N && invalid === 0, `عدد مافيا ${chosen} (16 لاعبًا): ${ended}/${N} مباراة بلغت النهاية الصحيحة (أقصى ${maxRounds} جولات)`);
  }
}

console.log("\nمباريات AI الكاملة (مسار Landing + بقاء/خروج اللاعب الحقيقي):");
{
  let round1MafiaEnd = 0;
  let invalidEnd = 0;
  let reachedRound2 = 0;
  const N = 1500;
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
    while (!game.winner && guard < 60) {
      guard += 1;
      const round = game.night;
      const aliveAll = game.players.filter((p) => p.status === "alive");
      const humanAlive = !!human && human.status === "alive";
      if (humanAlive && human.role === "mafia") {
        const targets = aliveAll.filter((p) => p.role !== "mafia");
        if (targets.length > 0) game.nightActions.mafiaTargetId = targets[Math.floor(Math.random() * targets.length)].id;
      }
      if (!(humanAlive && human.role === "mafia") && aliveAll.some((p) => p.isAi && p.role === "mafia")) {
        const targets = aliveAll.filter((p) => p.role !== "mafia");
        if (targets.length > 0) game.nightActions.mafiaTargetId = targets[Math.floor(Math.random() * targets.length)].id;
      }
      if (humanAlive && human.role === "doctor") {
        const cands = game.settings.doctorCanHealSelf ? aliveAll : aliveAll.filter((p) => p.id !== human.id);
        game.nightActions.doctorSaveId = cands[Math.floor(Math.random() * cands.length)]?.id ?? null;
      }
      if (!(humanAlive && human.role === "doctor")) {
        const doc = aliveAll.find((p) => p.isAi && p.role === "doctor");
        if (doc) {
          const cands = game.settings.doctorCanHealSelf ? aliveAll : aliveAll.filter((p) => p.id !== doc.id);
          game.nightActions.doctorSaveId = cands[Math.floor(Math.random() * cands.length)]?.id ?? null;
        }
      }
      if (humanAlive && human.role === "detective") {
        const cands = aliveAll.filter((p) => p.id !== human.id);
        if (cands.length > 0) game.nightActions.detectiveCheckId = cands[Math.floor(Math.random() * cands.length)].id;
      }
      if (!(humanAlive && human.role === "detective")) {
        const det = aliveAll.find((p) => p.isAi && p.role === "detective");
        if (det) {
          const cands = aliveAll.filter((p) => p.id !== det.id);
          if (cands.length > 0) game.nightActions.detectiveCheckId = cands[Math.floor(Math.random() * cands.length)].id;
        }
      }
      const wNight = resolveNight(game);
      if (wNight) game.winner = wNight;
      if (game.winner) {
        if (game.winner === "mafia" && round === 1) round1MafiaEnd += 1;
        break;
      }
      // discussion → أصوات AI + صوت الإنسان
      const votes = aiVotesFor(game, null);
      if (humanAlive) {
        const cands = game.players.filter((p) => p.status === "alive" && p.id !== human.id);
        votes.push({ voterId: human.id, targetId: cands.length ? cands[Math.floor(Math.random() * cands.length)].id : null });
      }
      game.votes = votes;
      const outcome = computeVoteOutcome(game.votes, game.settings.allowAbstain);
      const w = applyVoteElimination(game, outcome);
      if (w) game.winner = w;
      if (game.winner) {
        if (game.winner === "mafia" && round === 1) round1MafiaEnd += 1;
        break;
      }
      if (round === 1) reachedRound2 += 1; // أنهى الليلة 1 دون فائز → سيبدأ الليل 2
      startNextNight(game);
    }
    if (game.winner && !validateEnd(game)) {
      invalidEnd += 1;
      failures += 1;
      console.error("  ❌ نهاية غير صالحة في AI");
    }
  }
  assert(round1MafiaEnd === 0, `AI: لا فوز مافيا في الجولة الأولى إطلاقًا (0 من ${N})`);
  assert(reachedRound2 > 0, "المباريات تتجاوز الجولة الأولى إلى ليل 2+");
  assert(invalidEnd === 0, "كل نهاية مافيا عند بقاء لاعب واحد فقط، وكل فوز مواطنين بعد خروج آخر مافيا");
}

if (failures > 0) {
  console.error(`\n❌ ${failures} فحصًا فشل`);
  process.exit(1);
}
console.log("\n✅ جميع فحوصات نهاية المباراة نجحت: لا نهاية بعد جولة أولى وقتل واحد، والمافيا تفوز فقط عند بقاء لاعب واحد من غيرها، والمواطنون عند إخراج كل المافيا.");
