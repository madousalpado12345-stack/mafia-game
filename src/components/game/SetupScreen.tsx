import { cn } from "@/lib/utils";
import { DIFFICULTY_META, safeDifficulty } from "@/game/ai";
import { effectiveMafiaCount, maxMafiaCount, recommendedMafiaCount } from "@/game/roles";
import { localizedRole, useI18n } from "@/i18n";
import type { Difficulty, RoleId, Settings } from "@/game/types";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { GhostButton, PrimaryButton, SectionTitle, ScreenShell } from "./ui";

const COUNTS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
const DURATIONS = [1, 2, 3, 5, 10];

function Chip({
  selected,
  onClick,
  children,
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-xl border px-3 py-2.5 text-sm font-extrabold transition-all active:scale-95",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-[0_0_16px_rgba(220,60,60,0.35)]"
          : "border-white/10 bg-card/70 text-foreground hover:border-primary/50",
        disabled && "pointer-events-none opacity-40",
      )}
    >
      {children}
    </button>
  );
}

function ModeCard({
  emoji,
  title,
  desc,
  active,
  onClick,
}: {
  emoji: string;
  title: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-3 rounded-xl border p-3.5 text-start transition-all active:scale-[0.99]",
        active
          ? "border-accent/60 bg-accent/10 shadow-[0_0_20px_-6px_rgba(255,196,87,0.3)]"
          : "border-white/10 bg-card/70 hover:border-white/25",
      )}
    >
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1">
        <p className="text-sm font-extrabold">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
      <span
        className={cn(
          "size-4 shrink-0 rounded-full border-2 transition-colors",
          active ? "border-accent bg-accent" : "border-white/25",
        )}
      />
    </button>
  );
}

function RoleToggleCard({
  roleId,
  fixed,
  enabled,
  onToggle,
}: {
  roleId: RoleId;
  fixed?: boolean;
  enabled?: boolean;
  onToggle?: () => void;
}) {
  const { t: tr } = useI18n();
  const r = localizedRole(roleId);
  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-card/70 p-3.5"
      style={{ boxShadow: `inset 3px 0 0 ${r.color}` }}
    >
      <span className="text-2xl">{r.emoji}</span>
      <div className="flex-1">
        <p className="text-sm font-extrabold" style={{ color: r.color }}>
          {r.name}
        </p>
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{r.short}</p>
      </div>
      {fixed ? (
        <span className="text-[11px] font-bold text-muted-foreground">{tr("setup.fixed")}</span>
      ) : (
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={onToggle}
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full transition-colors",
            enabled ? "bg-primary" : "bg-white/15",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 size-5 rounded-full bg-white transition-all",
              enabled ? "right-0.5" : "right-[22px]",
            )}
          />
        </button>
      )}
    </div>
  );
}

function RuleToggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-card/70 px-4 py-3">
      <div className="flex-1">
        <p className="text-sm font-bold">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-white/15",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white transition-all",
            checked ? "right-0.5" : "right-[22px]",
          )}
        />
      </button>
    </div>
  );
}

export default function SetupScreen({
  settings,
  onChange,
  onBack,
  onNext,
}: {
  settings: Settings;
  onChange: (next: Settings) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const { t: tr } = useI18n();
  const rules = settings.rules;
  const playerCount = settings.prefs.playerCount;

  const setRules = (patch: Partial<Settings["rules"]>) =>
    onChange({ ...settings, rules: { ...rules, ...patch } });

  // ---- عدد المافيا --------------------------------------------------------
  const mafiaValue = effectiveMafiaCount(playerCount, rules);
  const mafiaMax = maxMafiaCount(playerCount);
  const mafiaRec = recommendedMafiaCount(playerCount);

  /** Writes the exact chosen count (null = back to the automatic/recommended). */
  const setMafiaCount = (value: number) => {
    const clamped = Math.max(1, Math.min(Math.floor(value), mafiaMax));
    const next: Settings = {
      ...settings,
      rules: { ...rules, mafiaCount: clamped === mafiaRec ? null : clamped },
    };
    onChange(next);
  };

  /** Changing the player count re-clamps any explicit mafia choice to the new
   *  valid range so the shown number is always exactly what will be dealt. */
  const pickPlayerCount = (count: number) => {
    const explicit = rules.mafiaCount;
    const clamped =
      explicit === null ? null : Math.max(1, Math.min(explicit, maxMafiaCount(count)));
    onChange({
      ...settings,
      prefs: { ...settings.prefs, playerCount: count },
      rules: {
        ...rules,
        mafiaCount: clamped === null ? null : clamped === recommendedMafiaCount(count) ? null : clamped,
      },
    });
  };

  return (
    <ScreenShell>
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-3 text-sm font-bold text-muted-foreground hover:text-foreground"
        >
          {tr("common.back")}
        </button>
        <h1 className="text-2xl font-black">{tr("setup.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{tr("setup.subtitle")}</p>
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>{tr("setup.playerCount")}</SectionTitle>
        <div className="grid grid-cols-5 gap-2">
          {COUNTS.map((c) => (
            <Chip
              key={c}
              selected={playerCount === c}
              onClick={() => pickPlayerCount(c)}
            >
              {c}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>{tr("setup.mafiaCount")}</SectionTitle>
        <div className="flex items-stretch justify-between gap-3 rounded-2xl border border-white/10 bg-card/70 p-3">
          <button
            type="button"
            disabled={mafiaValue <= 1}
            onClick={() => setMafiaCount(mafiaValue - 1)}
            className="w-16 rounded-xl border border-white/10 bg-white/5 text-2xl font-black text-foreground transition-all hover:border-primary/50 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
            aria-label={tr("setup.mafiaCount")}
          >
            −
          </button>
          <div className="flex flex-1 flex-col items-center justify-center">
            <p className="text-4xl font-black tabular-nums text-primary">{mafiaValue}</p>
            <p className="text-[11px] font-bold text-muted-foreground">
              {rules.mafiaCount === null ? tr("setup.mafiaAuto") : tr("setup.mafiaInGame")}
            </p>
          </div>
          <button
            type="button"
            disabled={mafiaValue >= mafiaMax}
            onClick={() => setMafiaCount(mafiaValue + 1)}
            className="w-16 rounded-xl border border-white/10 bg-white/5 text-2xl font-black text-foreground transition-all hover:border-primary/50 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
            aria-label={tr("setup.mafiaCount")}
          >
            +
          </button>
        </div>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {tr("setup.mafiaHint", {
            mafia: mafiaValue,
            others: playerCount - mafiaValue,
            max: mafiaMax,
          })}
        </p>
        {rules.mafiaCount !== null && (
          <button
            type="button"
            onClick={() => setMafiaCount(mafiaRec)}
            className="text-center text-xs font-bold text-accent underline-offset-4 hover:underline"
          >
            {tr("setup.mafiaReset", { n: mafiaRec })}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>{tr("setup.playMode")}</SectionTitle>
        <div className="flex flex-col gap-2">
          <ModeCard
            emoji="👥"
            title={tr("setup.friendsTitle")}
            desc={tr("setup.friendsDesc")}
            active={settings.prefs.playMode === "friends"}
            onClick={() => onChange({ ...settings, prefs: { ...settings.prefs, playMode: "friends" } })}
          />
          <ModeCard
            emoji="🤖"
            title={tr("setup.aiTitle")}
            desc={tr("setup.aiDesc")}
            active={settings.prefs.playMode === "ai"}
            onClick={() => onChange({ ...settings, prefs: { ...settings.prefs, playMode: "ai" } })}
          />
          <ModeCard
            emoji="🤝"
            title={tr("setup.hybridTitle")}
            desc={tr("setup.hybridDesc")}
            active={false}
            onClick={() => toast.info(tr("setup.hybridSoon"))}
          />
        </div>
      </div>

      {settings.prefs.playMode === "ai" && (
        <div className="flex flex-col gap-2.5">
          <SectionTitle>{tr("setup.difficulty")}</SectionTitle>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(DIFFICULTY_META) as Difficulty[]).map((d) => {
              const meta = DIFFICULTY_META[d];
              return (
                <Chip
                  key={d}
                  selected={safeDifficulty(settings.prefs.difficulty) === d}
                  onClick={() => onChange({ ...settings, prefs: { ...settings.prefs, difficulty: d } })}
                >
                  {meta.emoji} {tr(`difficulty.${d}.label`)}
                </Chip>
              );
            })}
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {tr(`difficulty.${safeDifficulty(settings.prefs.difficulty)}.hint`)}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <SectionTitle>{tr("setup.rolesTitle")}</SectionTitle>
        <div className="flex flex-col gap-2">
          <RoleToggleCard roleId="mafia" fixed />
          <RoleToggleCard roleId="citizen" fixed />
          <RoleToggleCard
            roleId="detective"
            enabled={rules.detectiveEnabled}
            onToggle={() => setRules({ detectiveEnabled: !rules.detectiveEnabled })}
          />
          <RoleToggleCard
            roleId="doctor"
            enabled={rules.doctorEnabled}
            onToggle={() => setRules({ doctorEnabled: !rules.doctorEnabled })}
          />
          <RoleToggleCard
            roleId="jester"
            enabled={rules.jesterEnabled}
            onToggle={() => setRules({ jesterEnabled: !rules.jesterEnabled })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>{tr("setup.discussionTitle")}</SectionTitle>
        <div className="grid grid-cols-5 gap-2">
          {DURATIONS.map((m) => (
            <Chip
              key={m}
              selected={rules.discussionMinutes === m}
              onClick={() => setRules({ discussionMinutes: m })}
            >
              {tr("setup.minShort", { n: m })}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>{tr("setup.advanced")}</SectionTitle>
        <div className="flex flex-col gap-2">
          <RuleToggle
            label={tr("setup.revealRoleLabel")}
            hint={tr("setup.revealRoleHint")}
            checked={rules.revealRoleOnElimination}
            onChange={(v) => setRules({ revealRoleOnElimination: v })}
          />
          <RuleToggle
            label={tr("setup.doctorSelfLabel")}
            hint={tr("setup.doctorSelfHint")}
            checked={rules.doctorCanHealSelf}
            onChange={(v) => setRules({ doctorCanHealSelf: v })}
          />
          <RuleToggle
            label={tr("setup.abstainLabel")}
            hint={tr("setup.abstainHint")}
            checked={rules.allowAbstain}
            onChange={(v) => setRules({ allowAbstain: v })}
          />
          <RuleToggle
            label={tr("setup.tieRevoteLabel")}
            hint={tr("setup.tieRevoteHint")}
            checked={rules.tieRevote}
            onChange={(v) => setRules({ tieRevote: v })}
          />
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        <PrimaryButton onClick={onNext}>
          {settings.prefs.playMode === "ai" ? tr("setup.continueAi") : tr("setup.continueNames")}
        </PrimaryButton>
        <GhostButton onClick={onBack}>{tr("common.backShort")}</GhostButton>
      </div>
    </ScreenShell>
  );
}