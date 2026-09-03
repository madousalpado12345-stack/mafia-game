import {
  alivePlayers,
  mafiaTeammates,
  nightSequence,
  playerById,
} from "@/game/engine";
import { localizedRole, useI18n } from "@/i18n";
import type { GameState, NightStep } from "@/game/types";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { GameTopBar, PassPhone, PrimaryButton, ScreenShell, SelectableList, useAutoAdvance, type SelectItem } from "./ui";

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i === current ? "w-6 bg-accent" : "w-1.5 bg-white/15",
          )}
        />
      ))}
    </div>
  );
}

function NightIntro({
  game,
  aiMode,
  spectator,
  onStartNight,
}: {
  game: GameState;
  aiMode?: boolean;
  /** AI mode with the human out — the night starts itself. */
  spectator?: boolean;
  onStartNight: () => void;
}) {
  const { t: tr } = useI18n();
  const steps = nightSequence(game);
  // Spectators: let the AI night play out without waiting for a tap.
  useAutoAdvance(spectator, onStartNight, 2200);
  return (
    <ScreenShell>
      <div className="flex-1" />
      <div className="text-center">
        <div className="animate-float text-8xl">🌙</div>
        <h1 className="mt-4 text-4xl font-black text-glow">{tr("night.introTitle")}</h1>
        <p className="mx-auto mt-3 max-w-[310px] text-sm leading-7 text-muted-foreground">
          {tr("night.introText")}
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-card/70 p-4">
        <p className="text-center text-xs font-extrabold text-muted-foreground">
          {tr("night.whoMoves")}
        </p>
        <div className="mt-3 flex justify-center gap-4">
          {steps.map((s) => {
            const r = localizedRole(s);
            return (
              <div key={s} className="text-center">
                <div className="text-3xl">{r.emoji}</div>
                <p className="mt-1 text-xs font-bold" style={{ color: r.color }}>
                  {r.name}
                </p>
                {/* صاحب الدور يبقى سرًا — لا تظهر أسماء اللاعبين أبدًا. */}
                <p className="text-[10px] text-muted-foreground">؟</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1" />
      <PrimaryButton onClick={onStartNight}>{tr("night.startNight")}</PrimaryButton>
      <p className="text-center text-xs text-muted-foreground">
        {tr("night.nightNumber", { n: game.night })}
      </p>
    </ScreenShell>
  );
}

function NightAction({
  game,
  step,
  stepIndex,
  totalSteps,
  aiMode,
  onChoose,
  onDetectiveHide,
  onExit,
  onSave,
}: {
  game: GameState;
  step: NightStep;
  stepIndex: number;
  totalSteps: number;
  /** In AI mode the acting player is the human — no phone handoff. */
  aiMode?: boolean;
  onChoose: (targetId: string) => void;
  onDetectiveHide: () => void;
  onExit: () => void;
  onSave: () => void;
}) {
  const { t: tr } = useI18n();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const r = localizedRole(step);

  const alive = alivePlayers(game.players);
  const actor = alive.find((p) => p.role === step);

  let candidates: SelectItem[];
  let handoffName: string;
  let handoffNote: string;
  let ctaLabel: string;
  let heading: string;
  let help: string;

  if (step === "mafia") {
    candidates = alive
      .filter((p) => !(localizedRole(p.role).team === "mafia"))
      .map((p) => ({
        id: p.id,
        label: p.name,
      }));
    handoffName = tr("night.mafiaHandoff");
    handoffNote = tr("night.mafiaNote");
    ctaLabel = tr("night.mafiaCta");
    heading = tr("night.mafiaHeading");
    help = tr("night.mafiaHelp");
  } else if (step === "doctor") {
    // All faces look the same — the doctor must not learn who the mafia are.
    candidates = alive
      .filter((p) => game.settings.doctorCanHealSelf || p.id !== actor?.id)
      .map((p) => ({
        id: p.id,
        label: p.name,
      }));
    handoffName = tr("night.doctorHandoff");
    handoffNote = tr("night.doctorNote");
    ctaLabel = tr("night.doctorCta");
    heading = tr("night.doctorHeading");
    help = game.settings.doctorCanHealSelf
      ? tr("night.doctorHelpSelf")
      : tr("night.doctorHelpNoSelf");
  } else {
    candidates = alive
      .filter((p) => p.id !== actor?.id)
      .map((p) => ({
        id: p.id,
        label: p.name,
      }));
    handoffName = tr("night.detectiveHandoff");
    handoffNote = tr("night.detectiveNote");
    ctaLabel = tr("night.detectiveCta");
    heading = tr("night.detectiveHeading");
    help = tr("night.detectiveHelp");
  }

  // Detective already chose → show private result
  if (step === "detective" && game.nightActions.detectiveCheckId && game.detectiveResult) {
    const target = playerById(game.players, game.detectiveResult.targetId);
    const isMafia = game.detectiveResult.isMafia;
    return (
      <ScreenShell>
        <GameTopBar title={tr("night.titleWithRole", { n: game.night, role: r.name })} onExit={onExit} onSave={onSave} />
        <StepDots current={stepIndex} total={totalSteps} />
        <div className="flex-1" />
        <div className="text-center">
          <div className="text-6xl">🕵️</div>
          <h2 className="mt-3 text-xl font-black">{tr("night.resultTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {tr("night.checked", { name: target.name })}
          </p>
        </div>
        <div
          className={cn(
            "mt-6 rounded-2xl border p-6 text-center",
            isMafia
              ? "border-red-500/50 bg-red-500/10"
              : "border-emerald-500/50 bg-emerald-500/10",
          )}
        >
          <div className="text-5xl">{isMafia ? "🔴" : "✅"}</div>
          <p
            className={cn(
              "mt-3 text-lg font-black",
              isMafia ? "text-red-400" : "text-emerald-400",
            )}
          >
            {isMafia ? tr("night.isMafia") : tr("night.notMafia")}
          </p>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {tr("night.dontShare")}
        </p>
        <div className="flex-1" />
        <PrimaryButton onClick={onDetectiveHide} className="bg-secondary text-secondary-foreground shadow-none hover:bg-secondary/80">
          {tr("night.hideResult")}
        </PrimaryButton>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <GameTopBar title={tr("night.titleWithRole", { n: game.night, role: r.name })} onExit={onExit} onSave={onSave} />
      <StepDots current={stepIndex} total={totalSteps} />

      {/* الجملة الخاصة بالدور أولًا، ثم قائمة اللاعبين للاختيار. */}
      <div className="text-center">
        <h2 className="text-xl font-black">{heading}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{help}</p>
      </div>

      {step === "mafia" && mafiaTeammates(game, actor?.id ?? "").length > 0 && (
        <p className="text-center text-xs font-bold text-red-400">
          {tr("night.mafiaTeammatesLine", {
            names: [actor?.name, ...mafiaTeammates(game, actor?.id ?? "").map((m) => m.name)].join(tr("common.listSep")),
          })}
        </p>
      )}

      {aiMode ? (
        <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4 text-center">
          <p className="text-sm font-black text-accent">{handoffName}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{handoffNote}</p>
        </div>
      ) : (
        <PassPhone name={handoffName} note={handoffNote} />
      )}

      <SelectableList
        items={candidates}
        selectedId={selectedId}
        onSelect={setSelectedId}
        empty={tr("night.empty")}
      />

      <div className="mt-2 flex flex-col gap-2">
        <PrimaryButton disabled={!selectedId} onClick={() => selectedId && onChoose(selectedId)}>
          {ctaLabel}
        </PrimaryButton>
      </div>
    </ScreenShell>
  );
}

export default function NightScreen({
  game,
  step,
  aiMode,
  spectator,
  onStartNight,
  onChoose,
  onDetectiveHide,
  onExit,
  onSave,
}: {
  game: GameState;
  step: NightStep | "intro";
  aiMode?: boolean;
  spectator?: boolean;
  onStartNight: () => void;
  onChoose: (targetId: string) => void;
  onDetectiveHide: () => void;
  onExit: () => void;
  onSave: () => void;
}) {
  if (step === "intro") {
    return <NightIntro game={game} aiMode={aiMode} spectator={spectator} onStartNight={onStartNight} />;
  }
  const sequence = nightSequence(game);
  const stepIndex = sequence.indexOf(step);
  return (
    <NightAction
      game={game}
      step={step}
      stepIndex={stepIndex}
      totalSteps={sequence.length}
      aiMode={aiMode}
      onChoose={onChoose}
      onDetectiveHide={onDetectiveHide}
      onExit={onExit}
      onSave={onSave}
    />
  );
}