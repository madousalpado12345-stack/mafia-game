import AiDiscussionScreen from "@/components/game/AiDiscussionScreen";
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
  afterDayResolved,
  afterNightResolved,
  aiVotesFor,
  applyAiNightActions,
  buildDiscussionScript,
  humanPlayer,
  isAiMode,
  recordVotes,
  safeDifficulty,
} from "@/game/ai";
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
import {
  cancelNarrator,
  NARRATOR_SCREEN_LINES,
  speakLine,
  type NarratorLineKey,
} from "@/game/narrator";
import { configureAudio, playSound } from "@/game/sound";
import { DEFAULT_SETTINGS, loadAppState, saveAppState } from "@/game/storage";
import { useI18n } from "@/i18n";
import type {
  AppState,
  GameState,
  NightStep,
  PlayMode,
  ScreenName,
  Settings,
  Winner,
} from "@/game/types";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function nightScreenFor(step: NightStep): ScreenName {
  if (step === "mafia") return "nightMafia";
  if (step === "doctor") return "nightDoctor";
  return "nightDetective";
}

function RoleIntro({ aiMode, onBegin }: { aiMode: boolean; onBegin: () => void }) {
  const { t: tr } = useI18n();
  return (
    <ScreenShell>
      <div className="flex-1" />
      <div className="text-center">
        <div className="animate-float text-7xl">🎴</div>
        <h1 className="mt-4 text-3xl font-black text-glow-gold">{tr("roleIntro.title")}</h1>
        <p className="mx-auto mt-3 max-w-[320px] text-sm leading-7 text-muted-foreground">
          {aiMode ? tr("roleIntro.aiText") : tr("roleIntro.friendsText")}
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-card/70 p-4 text-center text-xs leading-6 text-muted-foreground">
        {aiMode ? tr("roleIntro.tipAi") : tr("roleIntro.tipFriends")}
      </div>
      <div className="flex-1" />
      <PrimaryButton onClick={onBegin}>{tr("roleIntro.begin")}</PrimaryButton>
    </ScreenShell>
  );
}

/** Shown once in AI mode when the human has died: the match keeps running and
 *  the human watches it as a spectator. */
function SpectateScreen({
  game,
  onContinue,
  onExit,
  onSave,
}: {
  game: GameState;
  onContinue: () => void;
  onExit: () => void;
  onSave: () => void;
}) {
  const { t: tr } = useI18n();
  const human = humanPlayer(game.players);
  return (
    <ScreenShell>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          className="rounded-lg border border-white/10 bg-card/60 px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
        >
          {tr("common.menu")}
        </button>
        <button
          type="button"
          onClick={onSave}
          className="rounded-lg border border-white/10 bg-card/60 px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
        >
          {tr("common.save")}
        </button>
      </div>
      <div className="flex-1" />
      <div className="text-center">
        <div className="animate-float text-8xl">👻</div>
        <h1 className="mt-4 text-3xl font-black text-glow">{tr("spectate.title")}</h1>
        <p className="mx-auto mt-3 max-w-[330px] text-sm leading-7 text-muted-foreground">
          {tr("spectate.text", { name: human ? human.name : "" })}
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-card/70 p-4 text-center text-xs leading-6 text-muted-foreground">
        {tr("spectate.note")}
      </div>
      <div className="flex-1" />
      <PrimaryButton onClick={onContinue}>{tr("spectate.continue")}</PrimaryButton>
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
  const { t: tr } = useI18n();
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

  /** AI narrator: speaks the night-phase line whenever the screen changes to a
   *  night step (mafia → doctor → detective, per the game's own role order) or
   *  to the day. Lines are serialized inside narrator.ts — never two voices at
   *  once — and absent roles are simply skipped because no screen is shown for
   *  them. Narrator prefs (on/volume/voice) come from the settings screen. */
  const prevScreenRef = useRef(state.screen);
  useEffect(() => {
    const prev = prevScreenRef.current;
    prevScreenRef.current = state.screen;
    if (prev === state.screen) return;
    if (!state.game || !state.settings.prefs.narratorOn) {
      cancelNarrator();
      return;
    }
    const line = NARRATOR_SCREEN_LINES[state.screen as string] as NarratorLineKey | undefined;
    if (line) {
      void speakLine(line, {
        volume: state.settings.prefs.narratorVolume,
        voiceURI: state.settings.prefs.narratorVoice,
      });
    } else {
      cancelNarrator();
    }
  }, [
    state.screen,
    state.game,
    state.settings.prefs.narratorOn,
    state.settings.prefs.narratorVolume,
    state.settings.prefs.narratorVoice,
  ]);

  /** Screen to continue to after the one-time spectator notice (AI mode). */
  const [spectateNext, setSpectateNext] = useState<ScreenName | null>(null);

  /** After a night/vote resolution: if the human just died in AI mode and the
   *  match continues, show the spectator screen once before the natural screen.
   *  Never stalls the game — the natural screen follows on "متابعة المشاهدة". */
  const routeResolved = (game: GameState, naturalNext: ScreenName): ScreenName => {
    if (naturalNext === "win" || !isAiMode(game)) return naturalNext;
    const human = humanPlayer(game.players);
    if ((!human || human.status === "dead") && !game.spectateShown) {
      game.spectateShown = true; // every call site passes a fresh clone
      setSpectateNext(naturalNext);
      return "spectate";
    }
    return naturalNext;
  };

  const spectateContinue = () => {
    if (!state.game) return;
    playSound("click");
    const target = spectateNext ?? (state.game.winner ? "win" : "dayResults");
    setSpectateNext(null);
    setState((s) => ({ ...s, screen: target }));
  };

  // ---- navigation ---------------------------------------------------------

  const goMenu = () =>
    setState((s) => ({ ...s, screen: "menu", pendingNames: null }));

  const goSetup = (mode?: PlayMode) => {
    playSound("click");
    setState((s) => ({
      ...s,
      screen: "setup",
      pendingNames: null,
      settings: {
        ...s.settings,
        prefs: { ...s.settings.prefs, playMode: mode ?? s.settings.prefs.playMode ?? "friends" },
      },
    }));
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
    toast.success(tr("common.saved"));
  };

  const updateSettings = (next: Settings) =>
    setState((s) => ({ ...s, settings: next }));

  // ---- game lifecycle -----------------------------------------------------
  // ── phase state machine ────────────────────────────────────────────────────
  // state.screen   = the current phase (a typed union — never undefined)
  // state.game.night = the current round
  //
  //   roleReveal ─► nightIntro ─► [night action screens] ─► (night resolved)
  //        │ startNight()          startNight()  finishNight()
  //        ▼
  //   dayResults (بداية النهار — auto after night)  ── startDiscussion()
  //        ▼
  //   discussion (timer runs; AI chat in AI mode)   ── startVoting()
  //        ▼
  //   votingHandoff ─► castVote()/finishVoting() ─► voteResults
  //        ▼
  //   voteContinue()/noEliminate()/revote() ─► nightIntro (next round)
  //        ▼
  //   win  — after EVERY elimination checkWinCondition() decides, and if the
  //          game keeps going the night→day→discussion→vote cycle repeats.
  //   spectate — one-time notice when the human dies in AI mode; the same
  //          cycle then continues automatically until someone wins.
  // ───────────────────────────────────────────────────────────────────────────

  const startGame = (names: string[]) => {
    const prefs = state.settings.prefs;
    const game = createGame(
      names,
      state.settings.rules,
      prefs.playMode === "ai" ? "ai" : "friends",
      safeDifficulty(prefs.difficulty),
    );
    const screen: ScreenName = state.settings.prefs.showInstructions
      ? "roleIntro"
      : "roleReveal";
    setSpectateNext(null);
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
    let next: ScreenName;
    if (game.playMode === "ai") {
      next = "nightIntro";
    } else {
      next = game.revealCursor >= game.players.length ? "nightIntro" : "roleReveal";
    }
    playSound(next === "nightIntro" ? "night" : "click");
    setState((s) => ({ ...s, game, screen: next }));
  };

  const startNight = () => {
    if (!state.game) return;
    playSound("click");
    const game = structuredClone(state.game);
    if (isAiMode(game)) applyAiNightActions(game);
    const step = currentNightStep(game);
    if (step === "done") {
      const res = finishNight(game);
      const target = routeResolved(game, res.screen);
      setState((s) => ({ ...s, game, screen: target }));
      playSound(res.sound);
      return;
    }
    setState((s) => ({ ...s, game, screen: nightScreenFor(step) }));
  };

  const finishNight = (game: GameState): { screen: ScreenName; sound: "win" | "day" | "click" } => {
    const step = currentNightStep(game);
    if (step === "done") {
      const winner = resolveNight(game);
      if (isAiMode(game)) afterNightResolved(game);
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
    const target = routeResolved(game, res.screen);
    setState((s) => ({ ...s, game, screen: target }));
    playSound(res.sound);
  };

  const detectiveHide = () => {
    if (!state.game) return;
    const game = structuredClone(state.game);
    const res = finishNight(game);
    const target = routeResolved(game, res.screen);
    setState((s) => ({ ...s, game, screen: target }));
    playSound(res.sound);
  };

  /** Day results → discussion. THE single transition out of the day screen:
   *  creates the countdown in game state and flips the screen to "discussion"
   *  in the same update. Guarded so it can never fire twice for one phase. */
  const startDiscussion = () => {
    if (!state.game) return;
    playSound("click");
    const game = structuredClone(state.game);
    const minutes = Math.max(1, Math.round(game.settings.discussionMinutes || 2));
    game.discussionTimer = { duration: minutes * 60, remaining: minutes * 60 };
    const commit = (s: AppState): AppState => {
      // Only move from the day screen — a second call is ignored, never stacked.
      if (s.screen !== "dayResults") return s;
      return { ...s, game, screen: "discussion" };
    };
    if (isAiMode(game)) {
      const aiAlive = game.players.filter((p) => p.isAi && p.status === "alive").length;
      game.discussionScript = aiAlive > 0 ? buildDiscussionScript(game) : [];
      setState(commit);
      if (aiAlive === 0) beginVoting(game);
      return;
    }
    setState(commit);
  };

  /** One-second tick of the discussion countdown — persisted in game state.
   *  Safe even if the timer was missing (old saves): it is re-created from the
   *  configured duration instead of freezing on a stale value. */
  const tickDiscussionTimer = () => {
    setState((s) => {
      if (!s.game || s.screen !== "discussion") return s;
      const game = structuredClone(s.game);
      const minutes = Math.max(1, Math.round(game.settings.discussionMinutes || 2));
      const timer = game.discussionTimer ?? { duration: minutes * 60, remaining: minutes * 60 };
      const remaining = Math.max(0, timer.remaining - 1);
      game.discussionTimer = { duration: timer.duration, remaining };
      return { ...s, game };
    });
  };

  /** Restarts the countdown with a chosen duration (friends-mode chips). */
  const resetDiscussionTimer = (minutes: number) => {
    setState((s) => {
      if (!s.game) return s;
      const game = structuredClone(s.game);
      game.discussionTimer = { duration: minutes * 60, remaining: minutes * 60 };
      return { ...s, game };
    });
  };

  /** Resets the vote round; in AI mode it fills the AI votes first. Also stops
   *  and clears the discussion timer — voting only happens after discussion. */
  const beginVoting = (game: GameState) => {
    const g = structuredClone(game);
    g.votes = [];
    g.voteCursor = 0;
    g.tiedCandidates = null;
    g.lastVoteOutcome = null;
    g.dayEliminatedId = null;
    g.aiVotesRecorded = false;
    g.discussionTimer = null;
    if (isAiMode(g)) {
      g.votes = aiVotesFor(g, null);
      const human = humanPlayer(g.players);
      if (!human || human.status !== "alive") {
        const res = finalizeVotes(g);
        const target = routeResolved(g, res.winner ? "win" : "voteResults");
        setState((s) => ({ ...s, game: g, screen: target }));
        playSound(res.winner ? "win" : res.kind === "eliminate" ? "eliminate" : "click");
        return;
      }
      setState((s) => ({ ...s, game: g, screen: "votingHandoff" }));
      playSound("click");
      return;
    }
    setState((s) => ({ ...s, game: g, screen: "votingHandoff" }));
    playSound("click");
  };

  const startVoting = () => {
    playSound("click");
    if (!state.game) return;
    beginVoting(state.game);
  };

  /** Applies the vote outcome, records it into AI memory, returns winner + kind. */
  const finalizeVotes = (game: GameState): { winner: Winner | null; kind: string } => {
    const outcome = computeVoteOutcome(game.votes, game.settings.allowAbstain);
    const winner = applyVoteElimination(game, outcome);
    if (isAiMode(game)) {
      recordVotes(game);
      afterDayResolved(game);
    }
    if (winner) game.winner = winner;
    return { winner, kind: outcome.kind };
  };

  const castVote = (targetId: string | null) => {
    if (!state.game) return;
    const game = structuredClone(state.game);

    if (isAiMode(game)) {
      const human = humanPlayer(game.players);
      if (!human) return;
      if (targetId === human.id) {
        toast.error(tr("common.cantVoteSelf"));
        return;
      }
      game.votes.push({ voterId: human.id, targetId });
      const res = finalizeVotes(game);
      const target = routeResolved(game, res.winner ? "win" : "voteResults");
      setState((s) => ({ ...s, game, screen: target }));
      playSound(res.winner ? "win" : res.kind === "eliminate" ? "eliminate" : "click");
      return;
    }

    const voters = alivePlayers(game.players);
    const voter = voters[game.voteCursor];
    if (!voter) return;
    if (targetId === voter.id) {
      toast.error(tr("common.cantVoteSelf"));
      return;
    }
    game.votes.push({ voterId: voter.id, targetId });
    game.voteCursor += 1;
    if (game.voteCursor >= voters.length) {
      const outcome = computeVoteOutcome(game.votes, game.settings.allowAbstain);
      const winner = applyVoteElimination(game, outcome);
      if (winner) game.winner = winner;
      const target = routeResolved(game, winner ? "win" : "voteResults");
      setState((s) => ({ ...s, game, screen: target }));
      playSound(winner ? "win" : outcome.kind === "eliminate" ? "eliminate" : "click");
      return;
    }
    setState((s) => ({ ...s, game, screen: "votingHandoff" }));
    playSound("click");
  };

  const revote = () => {
    if (!state.game) return;
    playSound("click");
    const game = structuredClone(state.game);
    const outcome = game.lastVoteOutcome;
    if (!outcome || outcome.kind !== "tie") return;
    game.tiedCandidates = outcome.tiedIds;
    game.votes = [];
    game.voteCursor = 0;
    game.dayEliminatedId = null;
    game.lastVoteOutcome = null;
    game.aiVotesRecorded = false;
    if (isAiMode(game)) {
      game.votes = aiVotesFor(game, outcome.tiedIds);
      const human = humanPlayer(game.players);
      if (!human || human.status !== "alive") {
        const res = finalizeVotes(game);
        const target = routeResolved(game, res.winner ? "win" : "voteResults");
        setState((s) => ({ ...s, game, screen: target }));
        playSound(res.winner ? "win" : res.kind === "eliminate" ? "eliminate" : "click");
        return;
      }
      setState((s) => ({ ...s, game, screen: "votingHandoff" }));
      return;
    }
    setState((s) => ({ ...s, game, screen: "votingHandoff" }));
  };

  const noEliminate = () => {
    if (!state.game) return;
    const game = structuredClone(state.game);
    game.dayEliminatedId = null;
    if (isAiMode(game)) {
      recordVotes(game);
      afterDayResolved(game);
    }
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
    if (isAiMode(game)) {
      recordVotes(game);
      afterDayResolved(game);
    }
    startNextNight(game);
    setState((s) => ({ ...s, game, screen: "nightIntro" }));
    playSound("night");
  };

  const replaySamePlayers = () => {
    if (!state.game) return;
    const names = state.game.players.map((p) => p.name);
    const game = createGame(
      names,
      state.game.settings,
      state.game.playMode ?? "friends",
      state.game.difficulty ?? "medium",
    );
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
  const humanAlive = game ? (humanPlayer(game.players)?.status ?? "dead") === "alive" : false;
  // AI mode + human out → the match keeps running on its own (spectator).
  const spectator = !!game && isAiMode(game) && !humanAlive;

  const renderScreen = () => {
    switch (state.screen) {
      case "menu":
        return (
          <MenuScreen
            canContinue={!!game && !game.winner}
            onContinue={goContinue}
            onNewGame={() => goSetup()}
            onFriends={() => goSetup("friends")}
            onAi={() => goSetup("ai")}
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
            aiMode={state.settings.prefs.playMode === "ai"}
            onBack={() => goSetup()}
            onStart={startGame}
          />
        );
      case "roleIntro":
        return (
          <RoleIntro aiMode={!!game && game.playMode === "ai"} onBegin={beginReveal} />
        );
      case "roleReveal":
        return game ? (
          <RoleRevealScreen
            game={game}
            aiMode={isAiMode(game)}
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
            aiMode={isAiMode(game)}
            spectator={spectator}
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
          <DayScreen
            game={game}
            spectator={spectator}
            onContinue={startDiscussion}
            onExit={exitToMenu}
            onSave={saveNow}
          />
        ) : null;
      case "discussion": {
        if (!game) return null;
        const minutes = Math.max(1, Math.round(game.settings.discussionMinutes || 2));
        const timer = game.discussionTimer ?? {
          duration: minutes * 60,
          remaining: minutes * 60,
        };
        return game.playMode === "ai" ? (
          <AiDiscussionScreen
            game={game}
            timer={timer}
            onTick={tickDiscussionTimer}
            onDone={startVoting}
            onExit={exitToMenu}
            onSave={saveNow}
          />
        ) : (
          <DiscussionScreen
            game={game}
            timer={timer}
            onTick={tickDiscussionTimer}
            onReset={resetDiscussionTimer}
            onDone={startVoting}
            onExit={exitToMenu}
            onSave={saveNow}
          />
        );
      }
      case "votingHandoff": {
        if (!game) return null;
        const ai = isAiMode(game);
        const human = humanPlayer(game.players);
        const activeVoter = ai ? human : voter;
        const idx = ai
          ? (voters.findIndex((v) => v.id === activeVoter?.id) ?? 0)
          : game.voteCursor;
        return activeVoter ? (
          <VoteScreen
            key={activeVoter.id}
            game={game}
            voter={activeVoter}
            index={idx}
            total={voters.length}
            aiMode={ai}
            onVote={castVote}
            onExit={exitToMenu}
            onSave={saveNow}
          />
        ) : null;
      }
      case "spectate":
        return game ? (
          <SpectateScreen
            game={game}
            onContinue={spectateContinue}
            onExit={exitToMenu}
            onSave={saveNow}
          />
        ) : null;
      case "voteResults":
        return game ? (
          <VoteResultsScreen
            game={game}
            spectator={spectator}
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