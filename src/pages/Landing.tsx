import DayScreen from "@/components/game/DayScreen";
import DiscussionScreen from "@/components/game/DiscussionScreen";
import HowToScreen from "@/components/game/HowToScreen";
import MenuScreen from "@/components/game/MenuScreen";
import NamesScreen from "@/components/game/NamesScreen";
import NightScreen from "@/components/game/NightScreen";
import RoleRevealScreen from "@/components/game/RoleRevealScreen";
import SettingsScreen from "@/components/game/SettingsScreen";
import SetupScreen from "@/components/game/SetupScreen";
import VoteResultsScreen from "@/components/game/VoteResultsScreen";
import VoteScreen from "@/components/game/VoteScreen";
import WinScreen from "@/components/game/WinScreen";
import { PrimaryButton, ScreenShell } from "@/components/game/ui";
import {
  alivePlayers,
  applyVoteElimination,
  checkWin,
  computeVoteOutcome,
  createGame,
  currentNightStep,
  isMafiaTeam,
  playerById,
  resolveNight,
  startNextNight,
} from "@/game/engine";
import { configureAudio, playSound } from "@/game/sound";
import { DEFAULT_SETTINGS, loadAppState, saveAppState } from "@/game/storage";
import type {
  AppState,
  GameState,
  NightStep,
  ScreenName,
  Settings,
} from "@/game/types";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function nightScreenFor(step: NightStep): ScreenName {
  if (step === "mafia") return "nightMafia";
  if (step === "doctor") return "nightDoctor";
  return "nightDetective";
}

function RoleIntro({ onBegin }: { onBegin: () => void }) {
  return (
    <ScreenShell>
      <div className="flex-1" />
      <div className="text-center">
        <div className="animate-float text-7xl">🎴</div>
        <h1 className="mt-4 text-3xl font-black text-glow-gold">توزيع الأدوار</h1>
        <p className="mx-auto mt-3 max-w-[300px] text-sm leading-7 text-muted-foreground">
          سيُظهر الهاتف لكل لاعب دوره سرًا واحدًا تلو الآخر. مرّروا الهاتف بينكم ولا
          تُطلعوا أحدًا على دوركم.
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-card/70 p-4 text-center text-xs leading-6 text-muted-foreground">
        💡 كل لاعب يضغط «إظهار دوري» ويراه وحده، ثم يضغط «إخفاء الدور» ويمرر الهاتف
        إلى اللاعب التالي.
      </div>
      <div className="flex-1" />
      <PrimaryButton onClick={onBegin}>ابدأ التوزيع 🎴</PrimaryButton>
    </ScreenShell>
  );
}

const INITIAL_STATE: AppState = {
  screen: "menu",
  game: null,
  settings: DEFAULT_SETTINGS,
  pendingNames: null,
  lastGameScreen: null,
};

export default function Landing() {
  const [state, setState] = useState<AppState>(() => loadAppState() ?? INITIAL_STATE);

  // Auto-save the whole app state (game + settings) on every change.
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  useEffect(() => {
    configureAudio({
      sound: state.settings.prefs.soundOn,
      music: state.settings.prefs.musicOn,
    });
  }, [state.settings.prefs.soundOn, state.settings.prefs.musicOn]);

  // ---- navigation ---------------------------------------------------------

  const goMenu = () =>
    setState((s) => ({ ...s, screen: "menu", pendingNames: null }));

  const goSetup = () => {
    playSound("click");
    setState((s) => ({ ...s, screen: "setup", pendingNames: null }));
  };

  const goNames = () => setState((s) => ({ ...s, screen: "names" }));

  const goHowTo = () => {
    playSound("click");
    setState((s) => ({ ...s, screen: "howTo" }));
  };

  const goSettings = () => {
    playSound("click");
    setState((s) => ({ ...s, screen: "settings" }));
  };

  const goContinue = () =>
    setState((s) => ({ ...s, screen: s.lastGameScreen ?? "roleReveal" }));

  const exitToMenu = () =>
    setState((s) => ({ ...s, screen: "menu", lastGameScreen: s.screen }));

  const saveNow = () => {
    saveAppState(state);
    toast.success("تم حفظ اللعبة ✓");
  };

  const aiSoon = () => {
    playSound("click");
    toast.info("وضع الذكاء الاصطناعي قريبًا في النسخة القادمة 🤖");
  };

  const updateSettings = (next: Settings) =>
    setState((s) => ({ ...s, settings: next }));

  // ---- game lifecycle -----------------------------------------------------

  const startGame = (names: string[]) => {
    const game = createGame(names, state.settings.rules);
    const screen: ScreenName = state.settings.prefs.showInstructions
      ? "roleIntro"
      : "roleReveal";
    setState((s) => ({ ...s, game, screen, pendingNames: null }));
    playSound("reveal");
  };

  const beginReveal = () => {
    playSound("click");
    setState((s) => ({ ...s, screen: "roleReveal" }));
  };

  const hideRole = () => {
    if (!state.game) return;
    const game = structuredClone(state.game);
    game.revealCursor += 1;
    const next: ScreenName =
      game.revealCursor >= game.players.length ? "nightIntro" : "roleReveal";
    playSound(next === "nightIntro" ? "night" : "click");
    setState((s) => ({ ...s, game, screen: next }));
  };

  const startNight = () => {
    playSound("click");
    setState((s) => {
      if (!s.game) return s;
      const step = currentNightStep(s.game);
      return { ...s, screen: step === "done" ? "nightIntro" : nightScreenFor(step) };
    });
  };

  const finishNight = (game: GameState): { screen: ScreenName; sound: "win" | "day" | "click" } => {
    const step = currentNightStep(game);
    if (step === "done") {
      const winner = resolveNight(game);
      if (winner) {
        game.winner = winner;
        return { screen: "win", sound: "win" };
      }
      return { screen: "dayResults", sound: "day" };
    }
    return { screen: nightScreenFor(step), sound: "click" };
  };

  const chooseNightAction = (targetId: string) => {
    if (!state.game) return;
    const game = structuredClone(state.game);
    const step = currentNightStep(game);
    if (step === "mafia") {
      game.nightActions.mafiaTargetId = targetId;
    } else if (step === "doctor") {
      game.nightActions.doctorSaveId = targetId;
    } else if (step === "detective") {
      game.nightActions.detectiveCheckId = targetId;
      const target = playerById(game.players, targetId);
      game.detectiveResult = { targetId, isMafia: isMafiaTeam(target) };
      setState((s) => ({ ...s, game, screen: "nightDetective" }));
      playSound("vote");
      return;
    }
    const res = finishNight(game);
    setState((s) => ({ ...s, game, screen: res.screen }));
    playSound(res.sound);
  };

  const detectiveHide = () => {
    if (!state.game) return;
    const game = structuredClone(state.game);
    const res = finishNight(game);
    setState((s) => ({ ...s, game, screen: res.screen }));
    playSound(res.sound);
  };

  const dayContinue = () => {
    playSound("click");
    setState((s) => ({ ...s, screen: "discussion" }));
  };

  const startVoting = () => {
    playSound("click");
    setState((s) => {
      if (!s.game) return s;
      const game = structuredClone(s.game);
      game.votes = [];
      game.voteCursor = 0;
      game.tiedCandidates = null;
      game.lastVoteOutcome = null;
      game.dayEliminatedId = null;
      return { ...s, game, screen: "votingHandoff" };
    });
  };

  const castVote = (targetId: string | null) => {
    if (!state.game) return;
    const game = structuredClone(state.game);
    const voters = alivePlayers(game.players);
    const voter = voters[game.voteCursor];
    if (!voter) return;
    if (targetId === voter.id) {
      toast.error("لا يمكنك التصويت على نفسك");
      return;
    }
    game.votes.push({ voterId: voter.id, targetId });
    game.voteCursor += 1;
    if (game.voteCursor >= voters.length) {
      const outcome = computeVoteOutcome(game.votes, game.settings.allowAbstain);
      const winner = applyVoteElimination(game, outcome);
      if (winner) {
        game.winner = winner;
        setState((s) => ({ ...s, game, screen: "win" }));
        playSound("win");
        return;
      }
      setState((s) => ({ ...s, game, screen: "voteResults" }));
      playSound(outcome.kind === "eliminate" ? "eliminate" : "click");
      return;
    }
    setState((s) => ({ ...s, game, screen: "votingHandoff" }));
    playSound("click");
  };

  const revote = () => {
    if (!state.game) return;
    const game = structuredClone(state.game);
    const outcome = game.lastVoteOutcome;
    if (!outcome || outcome.kind !== "tie") return;
    game.tiedCandidates = outcome.tiedIds;
    game.votes = [];
    game.voteCursor = 0;
    game.dayEliminatedId = null;
    game.lastVoteOutcome = null;
    setState((s) => ({ ...s, game, screen: "votingHandoff" }));
    playSound("click");
  };

  const noEliminate = () => {
    if (!state.game) return;
    const game = structuredClone(state.game);
    game.dayEliminatedId = null;
    const winner = checkWin(game.players);
    if (winner) {
      game.winner = winner;
      setState((s) => ({ ...s, game, screen: "win" }));
      playSound("win");
      return;
    }
    startNextNight(game);
    setState((s) => ({ ...s, game, screen: "nightIntro" }));
    playSound("night");
  };

  const voteContinue = () => {
    if (!state.game) return;
    const game = structuredClone(state.game);
    startNextNight(game);
    setState((s) => ({ ...s, game, screen: "nightIntro" }));
    playSound("night");
  };

  const replaySamePlayers = () => {
    if (!state.game) return;
    const names = state.game.players.map((p) => p.name);
    const game = createGame(names, state.game.settings);
    setState((s) => ({
      ...s,
      game,
      screen: s.settings.prefs.showInstructions ? "roleIntro" : "roleReveal",
      pendingNames: null,
    }));
    playSound("reveal");
  };

  const newSetupFromWin = () => {
    const names = state.game?.players.map((p) => p.name) ?? null;
    playSound("click");
    setState((s) => ({ ...s, screen: "setup", pendingNames: names }));
  };

  // ---- render -------------------------------------------------------------

  const game = state.game;
  const voters = game ? alivePlayers(game.players) : [];
  const voter = game ? voters[game.voteCursor] : undefined;

  const renderScreen = () => {
    switch (state.screen) {
      case "menu":
        return (
          <MenuScreen
            canContinue={!!game && !game.winner}
            onContinue={goContinue}
            onNewGame={goSetup}
            onFriends={goSetup}
            onAi={aiSoon}
            onHowTo={goHowTo}
            onSettings={goSettings}
          />
        );
      case "setup":
        return (
          <SetupScreen
            settings={state.settings}
            onChange={updateSettings}
            onBack={goMenu}
            onNext={goNames}
          />
        );
      case "names":
        return (
          <NamesScreen
            count={state.settings.prefs.playerCount}
            initialNames={state.pendingNames}
            onBack={goSetup}
            onStart={startGame}
          />
        );
      case "roleIntro":
        return <RoleIntro onBegin={beginReveal} />;
      case "roleReveal":
        return game ? (
          <RoleRevealScreen
            game={game}
            onShow={() => playSound("reveal")}
            onHide={hideRole}
          />
        ) : null;
      case "nightIntro":
      case "nightMafia":
      case "nightDoctor":
      case "nightDetective":
        if (!game) return null;
        return (
          <NightScreen
            game={game}
            step={
              state.screen === "nightIntro"
                ? "intro"
                : state.screen === "nightMafia"
                  ? "mafia"
                  : state.screen === "nightDoctor"
                    ? "doctor"
                    : "detective"
            }
            onStartNight={startNight}
            onChoose={chooseNightAction}
            onDetectiveHide={detectiveHide}
            onExit={exitToMenu}
            onSave={saveNow}
          />
        );
      case "dayResults":
        return game ? (
          <DayScreen game={game} onContinue={dayContinue} onExit={exitToMenu} onSave={saveNow} />
        ) : null;
      case "discussion":
        return game ? (
          <DiscussionScreen game={game} onDone={startVoting} onExit={exitToMenu} onSave={saveNow} />
        ) : null;
      case "votingHandoff":
        return game && voter ? (
          <VoteScreen
            key={voter.id}
            game={game}
            voter={voter}
            index={game.voteCursor}
            total={voters.length}
            onVote={castVote}
            onExit={exitToMenu}
            onSave={saveNow}
          />
        ) : null;
      case "voteResults":
        return game ? (
          <VoteResultsScreen
            game={game}
            canRevote={game.settings.tieRevote}
            onRevote={revote}
            onNoEliminate={noEliminate}
            onContinue={voteContinue}
            onExit={exitToMenu}
            onSave={saveNow}
          />
        ) : null;
      case "win":
        return game ? (
          <WinScreen
            game={game}
            onSamePlayers={replaySamePlayers}
            onNewSetup={newSetupFromWin}
            onMenu={goMenu}
          />
        ) : null;
      case "howTo":
        return <HowToScreen onBack={goMenu} />;
      case "settings":
        return <SettingsScreen settings={state.settings} onChange={updateSettings} onBack={goMenu} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-cinema relative min-h-dvh text-foreground">
      {/* decorative background glows */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-[110px]" />
        <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute left-[-8rem] top-1/3 h-64 w-64 rounded-full bg-sky-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-8 pt-5">
        <motion.div
          key={state.screen}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
          className="flex flex-1 flex-col"
        >
          {renderScreen()}
        </motion.div>
      </div>
    </div>
  );
}