import { cancelNarrator, narratorVoices, speakLine } from "@/game/narrator";
import type { Settings } from "@/game/types";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { useEffect, useState } from "react";
import { GhostButton, LanguagePicker, ScreenShell, SectionTitle } from "./ui";

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

export default function SettingsScreen({
  settings,
  onChange,
  onBack,
}: {
  settings: Settings;
  onChange: (next: Settings) => void;
  onBack: () => void;
}) {
  const { t: tr, lang } = useI18n();
  const { prefs, rules } = settings;
  const setPrefs = (patch: Partial<Settings["prefs"]>) =>
    onChange({ ...settings, prefs: { ...prefs, ...patch } });
  const setRules = (patch: Partial<Settings["rules"]>) =>
    onChange({ ...settings, rules: { ...rules, ...patch } });

  // Available narrator voices for the current language (browsers load them
  // asynchronously — refresh on the voiceschanged event).
  const [voices, setVoices] = useState<{ uri: string; name: string }[]>(() =>
    typeof window !== "undefined" ? narratorVoices(lang) : [],
  );
  useEffect(() => {
    const refresh = () => setVoices(narratorVoices(lang));
    refresh();
    const s = typeof window !== "undefined" ? window.speechSynthesis : null;
    s?.addEventListener?.("voiceschanged", refresh);
    return () => s?.removeEventListener?.("voiceschanged", refresh);
  }, [lang]);

  const testNarrator = () => {
    cancelNarrator();
    void speakLine("test", {
      volume: prefs.narratorVolume,
      voiceURI: prefs.narratorVoice,
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
        <h1 className="text-2xl font-black">{tr("settings.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{tr("settings.subtitle")}</p>
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>{tr("settings.soundTitle")}</SectionTitle>
        <div className="flex flex-col gap-2">
          <Toggle
            emoji="🔊"
            label={tr("settings.soundLabel")}
            hint={tr("settings.soundHint")}
            checked={prefs.soundOn}
            onChange={(v) => setPrefs({ soundOn: v })}
          />
          <Toggle
            emoji="🎵"
            label={tr("settings.musicLabel")}
            hint={tr("settings.musicHint")}
            checked={prefs.musicOn}
            onChange={(v) => setPrefs({ musicOn: v })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>{tr("settings.gameTitle")}</SectionTitle>
        <div className="flex flex-col gap-2">
          <div className="rounded-xl border border-white/10 bg-card/70 px-4 py-3">
            <p className="text-sm font-bold">{tr("settings.defaultDiscussion")}</p>
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
                  {tr("setup.minShort", { n: m })}
                </button>
              ))}
            </div>
          </div>
          <Toggle
            emoji="📖"
            label={tr("settings.showInstructionsLabel")}
            hint={tr("settings.showInstructionsHint")}
            checked={prefs.showInstructions}
            onChange={(v) => setPrefs({ showInstructions: v })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>{tr("settings.rulesTitle")}</SectionTitle>
        <div className="flex flex-col gap-2">
          <Toggle
            emoji="👀"
            label={tr("setup.revealRoleLabel")}
            hint={tr("setup.revealRoleHint")}
            checked={rules.revealRoleOnElimination}
            onChange={(v) => setRules({ revealRoleOnElimination: v })}
          />
          <Toggle
            emoji="❤️"
            label={tr("setup.doctorSelfLabel")}
            hint={tr("setup.doctorSelfHint")}
            checked={rules.doctorCanHealSelf}
            onChange={(v) => setRules({ doctorCanHealSelf: v })}
          />
          <Toggle
            emoji="🤷"
            label={tr("setup.abstainLabel")}
            hint={tr("setup.abstainHint")}
            checked={rules.allowAbstain}
            onChange={(v) => setRules({ allowAbstain: v })}
          />
          <Toggle
            emoji="⚖️"
            label={tr("setup.tieRevoteLabel")}
            hint={tr("setup.tieRevoteHint")}
            checked={rules.tieRevote}
            onChange={(v) => setRules({ tieRevote: v })}
          />
          <Toggle
            emoji="🕵️"
            label={tr("settings.detectiveRole")}
            hint={tr("settings.detectiveRoleHint")}
            checked={rules.detectiveEnabled}
            onChange={(v) => setRules({ detectiveEnabled: v })}
          />
          <Toggle
            emoji="💊"
            label={tr("settings.doctorRole")}
            hint={tr("settings.doctorRoleHint")}
            checked={rules.doctorEnabled}
            onChange={(v) => setRules({ doctorEnabled: v })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>{tr("settings.narratorTitle")}</SectionTitle>
        <div className="flex flex-col gap-2">
          <Toggle
            emoji="🎙️"
            label={tr("settings.narratorLabel")}
            hint={tr("settings.narratorHint")}
            checked={prefs.narratorOn}
            onChange={(v) => setPrefs({ narratorOn: v })}
          />
          {prefs.narratorOn && (
            <>
              <div className="rounded-xl border border-white/10 bg-card/70 px-4 py-3">
                <p className="text-sm font-bold">{tr("settings.narratorVolume")}</p>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(prefs.narratorVolume * 100)}
                  onChange={(e) => setPrefs({ narratorVolume: Number(e.target.value) / 100 })}
                  className="mt-2 w-full accent-[#ffc457]"
                  aria-label={tr("settings.narratorVolume")}
                />
                <p className="mt-1 text-center text-xs tabular-nums text-muted-foreground">
                  {Math.round(prefs.narratorVolume * 100)}%
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-card/70 px-4 py-3">
                <p className="text-sm font-bold">{tr("settings.narratorVoice")}</p>
                <select
                  value={prefs.narratorVoice}
                  onChange={(e) => setPrefs({ narratorVoice: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-card px-2 py-2 text-xs font-bold text-foreground outline-none"
                  aria-label={tr("settings.narratorVoice")}
                >
                  <option value="">{tr("settings.narratorDefaultVoice")}</option>
                  {voices.map((v) => (
                    <option key={v.uri} value={v.uri}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={testNarrator}
                className="h-11 w-full rounded-xl border border-accent/40 bg-accent/10 text-sm font-extrabold text-accent transition-all hover:bg-accent/20 active:scale-[0.98]"
              >
                {tr("settings.narratorTest")}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>{tr("settings.interfaceTitle")}</SectionTitle>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-card/70 px-4 py-3">
            <span className="text-xl">🌍</span>
            <p className="flex-1 text-sm font-bold">{tr("settings.language")}</p>
            <LanguagePicker />
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-card/70 px-4 py-3">
            <span className="text-xl">🌙</span>
            <p className="flex-1 text-sm font-bold">{tr("settings.darkMode")}</p>
            <span className="text-xs font-bold text-muted-foreground">
              {tr("settings.darkValue")}
            </span>
          </div>
        </div>
      </div>

      <GhostButton onClick={onBack}>{tr("common.toMenu")}</GhostButton>
    </ScreenShell>
  );
}