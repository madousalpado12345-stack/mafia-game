import { cn } from "@/lib/utils";
import { ROLES } from "@/game/roles";
import type { RoleId, Settings } from "@/game/types";
import type { ReactNode } from "react";
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
  disabled,
}: {
  emoji: string;
  title: string;
  desc: string;
  active: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center gap-3 rounded-xl border p-3.5",
        active
          ? "border-accent/60 bg-accent/10"
          : "border-white/10 bg-card/70",
        disabled && "opacity-45",
      )}
    >
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1">
        <p className="text-sm font-extrabold">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
      <span
        className={cn(
          "size-4 rounded-full border-2",
          active ? "border-accent bg-accent" : "border-white/25",
        )}
      />
      {disabled && (
        <span className="absolute -top-2 left-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-primary-foreground">
          قريبًا
        </span>
      )}
    </div>
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
  const r = ROLES[roleId];
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
        <span className="text-[11px] font-bold text-muted-foreground">دائم</span>
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
  const rules = settings.rules;

  const setRules = (patch: Partial<Settings["rules"]>) =>
    onChange({ ...settings, rules: { ...rules, ...patch } });

  return (
    <ScreenShell>
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-3 text-sm font-bold text-muted-foreground hover:text-foreground"
        >
          → رجوع
        </button>
        <h1 className="text-2xl font-black">إعداد اللعبة</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          اضبط عدد اللاعبين والأدوار والقواعد ثم ابدأ.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>عدد اللاعبين</SectionTitle>
        <div className="grid grid-cols-5 gap-2">
          {COUNTS.map((c) => (
            <Chip
              key={c}
              selected={settings.prefs.playerCount === c}
              onClick={() => onChange({ ...settings, prefs: { ...settings.prefs, playerCount: c } })}
            >
              {c}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>طريقة اللعب</SectionTitle>
        <div className="flex flex-col gap-2">
          <ModeCard
            emoji="📱"
            title="تناوب على هاتف واحد"
            desc="اللاعبون يجلسون معًا ويمررون الهاتف سرًا بينهم."
            active
          />
          <ModeCard
            emoji="🤝"
            title="أصدقاء + ذكاء اصطناعي"
            desc="اعب مع أصدقائك ضد شخصيات ذكية."
            active={false}
            disabled
          />
          <ModeCard
            emoji="🤖"
            title="جميع اللاعبين ذكاء اصطناعي"
            desc="شاهد المعركة تدور بين الذكاء الاصطناعي."
            active={false}
            disabled
          />
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>الأدوار في اللعبة</SectionTitle>
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
        <SectionTitle>مدة النقاش</SectionTitle>
        <div className="grid grid-cols-5 gap-2">
          {DURATIONS.map((m) => (
            <Chip
              key={m}
              selected={rules.discussionMinutes === m}
              onClick={() => setRules({ discussionMinutes: m })}
            >
              {m} د
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>إعدادات متقدمة</SectionTitle>
        <div className="flex flex-col gap-2">
          <RuleToggle
            label="كشف دور اللاعب بعد خروجه"
            hint="عندما يخرج لاعب يُعرض دوره على الجميع."
            checked={rules.revealRoleOnElimination}
            onChange={(v) => setRules({ revealRoleOnElimination: v })}
          />
          <RuleToggle
            label="الطبيب يحمي نفسه"
            hint="يستطيع الطبيب اختيار نفسه للحماية."
            checked={rules.doctorCanHealSelf}
            onChange={(v) => setRules({ doctorCanHealSelf: v })}
          />
          <RuleToggle
            label="التصويت على عدم إخراج أحد"
            hint="يستطيع اللاعب التصويت بأن لا يخرج أحد."
            checked={rules.allowAbstain}
            onChange={(v) => setRules({ allowAbstain: v })}
          />
          <RuleToggle
            label="إعادة التصويت عند التعادل"
            hint="إذا تعادل صوتان يُعاد التصويت بينهما."
            checked={rules.tieRevote}
            onChange={(v) => setRules({ tieRevote: v })}
          />
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        <PrimaryButton onClick={onNext}>متابعة إلى أسماء اللاعبين</PrimaryButton>
        <GhostButton onClick={onBack}>رجوع</GhostButton>
      </div>
    </ScreenShell>
  );
}