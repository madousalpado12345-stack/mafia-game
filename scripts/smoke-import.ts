/** Imports every app module (component graph + game logic) in dependency
 *  order, so a module-eval-time crash — which tsc can't catch — surfaces here. */

const modules = [
  "@/game/types",
  "@/game/roles",
  "@/game/names",
  "@/game/sound",
  "@/game/storage",
  "@/game/engine",
  "@/game/personas",
  "@/game/ai",
  "@/components/game/ui",
  "@/components/game/MenuScreen",
  "@/components/game/SetupScreen",
  "@/components/game/NamesScreen",
  "@/components/game/RoleRevealScreen",
  "@/components/game/NightScreen",
  "@/components/game/DayScreen",
  "@/components/game/DiscussionScreen",
  "@/components/game/AiDiscussionScreen",
  "@/components/game/VoteScreen",
  "@/components/game/VoteResultsScreen",
  "@/components/game/WinScreen",
  "@/components/game/HowToScreen",
  "@/components/game/SettingsScreen",
  "@/pages/Landing",
];

let failed = 0;
for (const mod of modules) {
  try {
    await import(mod);
    console.log("OK  ", mod);
  } catch (err) {
    failed += 1;
    console.error("FAIL", mod, "→", (err as Error).message);
  }
}
if (failed > 0) {
  console.error(`\n${failed} module(s) failed to import`);
  process.exit(1);
}
console.log("\nAll app modules import cleanly.");
