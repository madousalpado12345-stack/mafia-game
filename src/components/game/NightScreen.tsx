import {
  alivePlayers,
  mafiaTeammates,
  nightSequence,
  playerById,
} from "@/game/engine";
import { ROLES } from "@/game/roles";
import type { GameState, NightStep } from "@/game/types";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { GameTopBar, PassPhone, PrimaryButton, ScreenShell, SelectableList, type SelectItem } from "./ui";

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

function NightIntro({ game, onStartNight }: { game: GameState; onStartNight: () => void }) {
  const steps = nightSequence(game);
  return (
    <ScreenShell>
      <div className="flex-1" />
      <div className="text-center">
        <div className="animate-float text-8xl">🌙</div>
        <h1 className="mt-4 text-4xl font-black text-glow">الليل بدأ...</h1>
        <p className="mx-auto mt-3 max-w-[290px] text-sm leading-7 text-muted-foreground">
          أغمضوا أعينكم بهدوء. سيستيقظ أصحاب الأدوار الخاصة واحدًا تلو الآخر لتنفيذ
          قدراتهم — مرّروا الهاتف بينهم سرًا ولا تتجسسوا.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-card/70 p-4">
        <p className="text-center text-xs font-extrabold text-muted-foreground">
          من سيتحرك هذه الليلة
        </p>
        <div className="mt-3 flex justify-center gap-4">
          {steps.map((s) => {
            const r = ROLES[s];
            const actor = alivePlayers(game.players).find((p) => p.role === s);
            return (
              <div key={s} className="text-center">
                <div className="text-3xl">{r.emoji}</div>
                <p className="mt-1 text-xs font-bold" style={{ color: r.color }}>
                  {r.name}
                </p>
                <p className="text-[10px] text-muted-foreground">{actor?.name ?? "—"}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1" />
      <PrimaryButton onClick={onStartNight}>بدء الليل 🌙</PrimaryButton>
      <p className="text-center text-xs text-muted-foreground">الليلة رقم {game.night}</p>
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const r = ROLES[step];

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
      .filter((p) => !(ROLES[p.role].team === "mafia"))
      .map((p) => ({
        id: p.id,
        label: p.name,
        emoji: "👤",
      }));
    handoffName = "المافيا";
    handoffNote =
      "مرّر الهاتف بين أعضاء المافيا واتفقوا معًا على هدف واحد. لا تختاروا لاعبًا من المافيا.";
    ctaLabel = "اختيار الهدف 🔪";
    heading = "المافيا تختار هدفها";
    help = "اتفقوا على لاعب واحد لإخراجه من اللعبة هذه الليلة.";
  } else if (step === "doctor") {
    // All faces look the same — the doctor must not learn who the mafia are.
    candidates = alive
      .filter((p) => game.settings.doctorCanHealSelf || p.id !== actor?.id)
      .map((p) => ({
        id: p.id,
        label: p.name,
        emoji: "👤",
      }));
    handoffName = actor?.name ?? "الطبيب";
    handoffNote = "اختر اللاعب الذي تريد حمايته من استهداف المافيا.";
    ctaLabel = "حماية هذا اللاعب ❤️";
    heading = "الطبيب يحمي لاعبًا";
    help = game.settings.doctorCanHealSelf
      ? "يمكنك حماية نفسك أيضًا إذا أردت."
      : "لا يمكنك حماية نفسك في هذه الجولة.";
  } else {
    candidates = alive
      .filter((p) => p.id !== actor?.id)
      .map((p) => ({
        id: p.id,
        label: p.name,
        emoji: "🕵️",
      }));
    handoffName = actor?.name ?? "المحقق";
    handoffNote = "اختر لاعبًا لفحصه — ستعرف النتيجة وحدك ولن تظهر للآخرين.";
    ctaLabel = "التحقيق مع هذا اللاعب 🕵️";
    heading = "المحقق يفحص لاعبًا";
    help = "ستعرف هل هو من المافيا أم لا، ثم أخفِ النتيجة فورًا.";
  }

  // Detective already chose → show private result
  if (step === "detective" && game.nightActions.detectiveCheckId && game.detectiveResult) {
    const target = playerById(game.players, game.detectiveResult.targetId);
    const isMafia = game.detectiveResult.isMafia;
    return (
      <ScreenShell>
        <GameTopBar title={`الليلة ${game.night} — المحقق`} onExit={onExit} onSave={onSave} />
        <StepDots current={stepIndex} total={totalSteps} />
        <div className="flex-1" />
        <div className="text-center">
          <div className="text-6xl">🕵️</div>
          <h2 className="mt-3 text-xl font-black">نتيجة التحقيق</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            فحصت: {target.name}
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
            {isMafia ? "هذا اللاعب من المافيا" : "هذا اللاعب ليس من المافيا"}
          </p>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          لا تشارك النتيجة مع أحد الآن — استخدمها بذكاء في النقاش.
        </p>
        <div className="flex-1" />
        <PrimaryButton onClick={onDetectiveHide} className="bg-secondary text-secondary-foreground shadow-none hover:bg-secondary/80">
          إخفاء النتيجة
        </PrimaryButton>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <GameTopBar title={`الليلة ${game.night} — ${r.name}`} onExit={onExit} onSave={onSave} />
      <StepDots current={stepIndex} total={totalSteps} />

      {step === "mafia" && mafiaTeammates(game, actor?.id ?? "").length > 0 && (
        <p className="text-center text-xs font-bold text-red-400">
          أنتم المافيا: {[actor?.name, ...mafiaTeammates(game, actor?.id ?? "").map((m) => m.name)].join("، ")}
        </p>
      )}

      {aiMode ? (
        <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4 text-center">
          <p className="text-sm font-black text-accent">أنت: {handoffName}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{handoffNote}</p>
        </div>
      ) : (
        <PassPhone name={handoffName} note={handoffNote} />
      )}

      <div className="text-center">
        <h2 className="text-xl font-black">{heading}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{help}</p>
      </div>

      <SelectableList
        items={candidates}
        selectedId={selectedId}
        onSelect={setSelectedId}
        empty="لا يوجد مرشحون متاحون."
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
  onStartNight,
  onChoose,
  onDetectiveHide,
  onExit,
  onSave,
}: {
  game: GameState;
  step: NightStep | "intro";
  aiMode?: boolean;
  onStartNight: () => void;
  onChoose: (targetId: string) => void;
  onDetectiveHide: () => void;
  onExit: () => void;
  onSave: () => void;
}) {
  if (step === "intro") {
    return <NightIntro game={game} onStartNight={onStartNight} />;
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