import type { Settings } from "@/game/types";
import { cn } from "@/lib/utils";
import { GhostButton, ScreenShell, SectionTitle } from "./ui";

const DURATIONS = [1, 2, 3, 5, 10];

function Toggle({
  emoji,
  label,
  hint,
  checked,
  onChange,
}: {
  emoji: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-card/70 px-4 py-3">
      <span className="text-xl">{emoji}</span>
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

function StaticRow({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-card/70 px-4 py-3">
      <span className="text-xl">{emoji}</span>
      <p className="flex-1 text-sm font-bold">{label}</p>
      <span className="text-xs font-bold text-muted-foreground">{value}</span>
    </div>
  );
}

export default function SettingsScreen({
  settings,
  onChange,
  onBack,
}: {
  settings: Settings;
  onChange: (next: Settings) => void;
  onBack: () => void;
}) {
  const { prefs, rules } = settings;
  const setPrefs = (patch: Partial<Settings["prefs"]>) =>
    onChange({ ...settings, prefs: { ...prefs, ...patch } });
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
        <h1 className="text-2xl font-black">الإعدادات</h1>
        <p className="mt-1 text-sm text-muted-foreground">تُحفظ الإعدادات تلقائيًا.</p>
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>الصوت</SectionTitle>
        <div className="flex flex-col gap-2">
          <Toggle
            emoji="🔊"
            label="الصوت"
            hint="مؤثرات بداية الليل والنهار والتصويت والفوز."
            checked={prefs.soundOn}
            onChange={(v) => setPrefs({ soundOn: v })}
          />
          <Toggle
            emoji="🎵"
            label="الموسيقى"
            hint="موسيقى خلفية هادئة أثناء اللعب."
            checked={prefs.musicOn}
            onChange={(v) => setPrefs({ musicOn: v })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>اللعبة</SectionTitle>
        <div className="flex flex-col gap-2">
          <div className="rounded-xl border border-white/10 bg-card/70 px-4 py-3">
            <p className="text-sm font-bold">مدة النقاش الافتراضية</p>
            <div className="mt-2 flex gap-2">
              {DURATIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setRules({ discussionMinutes: m })}
                  className={cn(
                    "flex-1 rounded-lg border px-2 py-1.5 text-xs font-extrabold transition-all",
                    rules.discussionMinutes === m
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-white/10 text-muted-foreground hover:border-accent/50",
                  )}
                >
                  {m} د
                </button>
              ))}
            </div>
          </div>
          <Toggle
            emoji="📖"
            label="إظهار التعليمات"
            hint="عرض شرح مراحل اللعبة عند البدء."
            checked={prefs.showInstructions}
            onChange={(v) => setPrefs({ showInstructions: v })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>قواعد اللعبة (للألعاب الجديدة)</SectionTitle>
        <div className="flex flex-col gap-2">
          <Toggle
            emoji="👀"
            label="كشف دور اللاعب بعد خروجه"
            hint="يُعرض دور اللاعب الخارج من اللعبة."
            checked={rules.revealRoleOnElimination}
            onChange={(v) => setRules({ revealRoleOnElimination: v })}
          />
          <Toggle
            emoji="❤️"
            label="الطبيب يحمي نفسه"
            hint="يمكن للطبيب اختيار نفسه للحماية."
            checked={rules.doctorCanHealSelf}
            onChange={(v) => setRules({ doctorCanHealSelf: v })}
          />
          <Toggle
            emoji="🤷"
            label="التصويت على عدم إخراج أحد"
            hint="خيار الامتناع أثناء التصويت."
            checked={rules.allowAbstain}
            onChange={(v) => setRules({ allowAbstain: v })}
          />
          <Toggle
            emoji="⚖️"
            label="إعادة التصويت عند التعادل"
            hint="التصويت مجددًا بين المتعادلين."
            checked={rules.tieRevote}
            onChange={(v) => setRules({ tieRevote: v })}
          />
          <Toggle
            emoji="🕵️"
            label="دور المحقق"
            hint="إدراج المحقق في توزيع الأدوار."
            checked={rules.detectiveEnabled}
            onChange={(v) => setRules({ detectiveEnabled: v })}
          />
          <Toggle
            emoji="💊"
            label="دور الطبيب"
            hint="إدراج الطبيب في توزيع الأدوار."
            checked={rules.doctorEnabled}
            onChange={(v) => setRules({ doctorEnabled: v })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>الواجهة</SectionTitle>
        <div className="flex flex-col gap-2">
          <StaticRow emoji="🌍" label="اللغة" value="العربية (الافتراضية)" />
          <StaticRow emoji="🌙" label="الوضع الداكن" value="مفعّل دائمًا" />
        </div>
      </div>

      <GhostButton onClick={onBack}>رجوع إلى القائمة</GhostButton>
    </ScreenShell>
  );
}