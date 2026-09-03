import { ROLE_ORDER } from "@/game/roles";
import { localizedRole, useI18n } from "@/i18n";
import { GhostButton, RoleCard, ScreenShell, SectionTitle } from "./ui";

export default function HowToScreen({ onBack }: { onBack: () => void }) {
  const { t: tr, raw } = useI18n();
  const phases = (raw("howTo.phases") as { title: string; text: string }[] | undefined) ?? [];
  const rules = (raw("howTo.rules") as string[] | undefined) ?? [];

  return (
    <ScreenShell className="game-scroll">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-3 text-sm font-bold text-muted-foreground hover:text-foreground"
        >
          {tr("common.back")}
        </button>
        <h1 className="text-2xl font-black">{tr("howTo.title")}</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {tr("howTo.subtitle")}
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>{tr("howTo.phasesTitle")}</SectionTitle>
        {phases.map((p, i) => (
          <div
            key={p.title}
            className="flex gap-3 rounded-xl border border-white/10 bg-card/70 p-4"
          >
            <span className="text-3xl">{PHASE_EMOJIS[i] ?? "🌙"}</span>
            <div className="flex-1">
              <p className="text-sm font-extrabold">
                {i + 1}. {p.title}
              </p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">{p.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>{tr("howTo.rolesTitle")}</SectionTitle>
        {ROLE_ORDER.map((roleId) => (
          <RoleCard key={roleId} roleId={roleId} className="p-4 text-start">
            <p className="mt-1 text-xs font-bold" style={{ color: localizedRole(roleId).color }}>
              {localizedRole(roleId).short}
            </p>
          </RoleCard>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>{tr("howTo.rulesTitle")}</SectionTitle>
        <div className="flex flex-col gap-2">
          {rules.map((r) => (
            <p
              key={r}
              className="rounded-xl border border-white/10 bg-card/70 px-4 py-3 text-xs leading-6 text-muted-foreground"
            >
              • {r}
            </p>
          ))}
        </div>
      </div>

      <GhostButton onClick={onBack}>{tr("common.toMenu")}</GhostButton>
    </ScreenShell>
  );
}

const PHASE_EMOJIS = ["🌙", "☀️", "🗣️", "🗳️", "🏆"];