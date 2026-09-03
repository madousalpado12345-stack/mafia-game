/** Renders every game screen with a real GameState through react-dom/server.
 *  Catches render-time crashes that tsc/module-import cannot. */

import { renderToString } from "react-dom/server";
import { createGame, startNextNight } from "@/game/engine";
import { buildDiscussionScript, applyAiNightActions } from "@/game/ai";
import { DEFAULT_SETTINGS } from "@/game/storage";
import { LanguageProvider } from "@/i18n";
import type { Lang } from "@/i18n";
import type { GameState } from "@/game/types";
import { createElement } from "react";

import MenuScreen from "@/components/game/MenuScreen";
import SetupScreen from "@/components/game/SetupScreen";
import NamesScreen from "@/components/game/NamesScreen";
import RoleRevealScreen from "@/components/game/RoleRevealScreen";
import NightScreen from "@/components/game/NightScreen";
import DayScreen from "@/components/game/DayScreen";
import DiscussionScreen from "@/components/game/DiscussionScreen";
import AiDiscussionScreen from "@/components/game/AiDiscussionScreen";
import VoteScreen from "@/components/game/VoteScreen";
import VoteResultsScreen from "@/components/game/VoteResultsScreen";
import WinScreen from "@/components/game/WinScreen";
import HowToScreen from "@/components/game/HowToScreen";
import SettingsScreen from "@/components/game/SettingsScreen";

const noop = () => {};
const settings = { ...DEFAULT_SETTINGS, prefs: { ...DEFAULT_SETTINGS.prefs } };
const rules = DEFAULT_SETTINGS.rules;

// --- AI game (human first, alive) ---
const names8 = ["أنت", "آدم", "سامر", "يوسف", "ليلى", "كريم", "منى", "عمر"];
const aiGame: GameState = createGame(names8, rules, "ai", "medium");
applyAiNightActions(aiGame);
aiGame.discussionScript = buildDiscussionScript(aiGame);
aiGame.discussionTimer = { duration: 120, remaining: 120 };
const human = aiGame.players[0];
// ensure human alive
for (const p of aiGame.players) if (p.id === human.id) p.status = "alive";

// --- friends game (5 roles spread, dead players exist) ---
const frGame: GameState = createGame(
  ["أحمد", "سارة", "خالد", "نور", "ياسمين", "مازن", "هدى", "طارق"],
  rules,
  "friends",
  "medium",
);
frGame.players[1].status = "dead";
frGame.discussionTimer = { duration: 120, remaining: 95 };

const alive = (g: GameState) => g.players.filter((p) => p.status === "alive");
const voter = alive(frGame)[0];

const cases: [string, React.ReactElement][] = [
  [
    "MenuScreen",
    createElement(MenuScreen, {
      canContinue: false,
      onContinue: noop,
      onNewGame: noop,
      onFriends: noop,
      onAi: noop,
      onHowTo: noop,
      onSettings: noop,
    }),
  ],
  [
    "SetupScreen",
    createElement(SetupScreen, { settings, onChange: noop, onBack: noop, onNext: noop }),
  ],
  [
    "NamesScreen",
    createElement(NamesScreen, {
      count: 8,
      initialNames: null,
      aiMode: true,
      onBack: noop,
      onStart: noop,
    }),
  ],
  [
    "RoleRevealScreen (ai)",
    createElement(RoleRevealScreen, { game: aiGame, aiMode: true, onShow: noop, onHide: noop }),
  ],
  [
    "RoleRevealScreen (friends)",
    createElement(RoleRevealScreen, { game: frGame, aiMode: false, onShow: noop, onHide: noop }),
  ],
  [
    "NightIntro",
    createElement(NightScreen, {
      game: frGame,
      step: "intro",
      aiMode: false,
      spectator: false,
      onStartNight: noop,
      onChoose: noop,
      onDetectiveHide: noop,
      onExit: noop,
      onSave: noop,
    }),
  ],
  [
    "NightMafia",
    createElement(NightScreen, {
      game: frGame,
      step: "mafia",
      aiMode: false,
      spectator: false,
      onStartNight: noop,
      onChoose: noop,
      onDetectiveHide: noop,
      onExit: noop,
      onSave: noop,
    }),
  ],
  [
    "DayScreen",
    createElement(DayScreen, { game: aiGame, spectator: false, onContinue: noop, onExit: noop, onSave: noop }),
  ],
  [
    "DiscussionScreen (friends)",
    createElement(DiscussionScreen, {
      game: frGame,
      timer: { duration: 120, remaining: 95 },
      onTick: noop,
      onReset: noop,
      onDone: noop,
      onExit: noop,
      onSave: noop,
    }),
  ],
  [
    "AiDiscussionScreen",
    createElement(AiDiscussionScreen, {
      game: aiGame,
      timer: { duration: 120, remaining: 120 },
      onTick: noop,
      onDone: noop,
      onExit: noop,
      onSave: noop,
    }),
  ],
  [
    "VoteScreen",
    createElement(VoteScreen, {
      game: frGame,
      voter,
      index: 0,
      total: alive(frGame).length,
      aiMode: false,
      onVote: noop,
      onExit: noop,
      onSave: noop,
    }),
  ],
  [
    "VoteResultsScreen",
    createElement(VoteResultsScreen, {
      game: frGame,
      spectator: false,
      canRevote: true,
      onRevote: noop,
      onNoEliminate: noop,
      onContinue: noop,
      onExit: noop,
      onSave: noop,
    }),
  ],
  ["WinScreen", createElement(WinScreen, { game: aiGame, onSamePlayers: noop, onNewSetup: noop, onMenu: noop })],
  ["HowToScreen", createElement(HowToScreen, { onBack: noop })],
  [
    "SettingsScreen",
    createElement(SettingsScreen, { settings, onChange: noop, onBack: noop }),
  ],
];

const LANGS: Lang[] = ["ar", "fr", "en"];
let failed = 0;
for (const [name, el] of cases) {
  for (const lang of LANGS) {
    try {
      const html = renderToString(
        createElement(LanguageProvider, { initialLang: lang }, el),
      );
      if (!html || html.length < 10) throw new Error("empty render output");
      console.log(`OK   ${name} [${lang}] (${html.length} chars)`);
    } catch (err) {
      failed += 1;
      console.error(`FAIL ${name} [${lang}] → ${(err as Error).message}`);
    }
  }
}

// --- WinScreen with every winner, every language ---
for (const winner of ["citizens", "mafia", "jester"] as const) {
  for (const lang of LANGS) {
    const g = structuredClone(aiGame);
    g.winner = winner;
    try {
      renderToString(
        createElement(
          LanguageProvider,
          { initialLang: lang },
          createElement(WinScreen, { game: g, onSamePlayers: noop, onNewSetup: noop, onMenu: noop }),
        ),
      );
      console.log(`OK   WinScreen (winner=${winner}) [${lang}]`);
    } catch (err) {
      failed += 1;
      console.error(`FAIL WinScreen (${winner}) [${lang}] → ${(err as Error).message}`);
    }
  }
}

if (failed > 0) {
  console.error(`\n${failed} render case(s) FAILED`);
  process.exit(1);
}
console.log("\nAll screens render without crashing.");
