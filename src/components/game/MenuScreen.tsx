import { useI18n } from "@/i18n";
import { GhostButton, LanguagePicker, PrimaryButton, SectionTitle, ScreenShell } from "./ui";

export default function MenuScreen({
  canContinue,
  onContinue,
  onNewGame,
  onFriends,
  onAi,
  onHowTo,
  onSettings,
}: {
  canContinue: boolean;
  onContinue: () => void;
  onNewGame: () => void;
  onFriends: () => void;
  onAi: () => void;
  onHowTo: () => void;
  onSettings: () => void;
}) {
  const { t: tr } = useI18n();
  return (
    <ScreenShell className="justify-center">
      <div className="mb-3">
        <LanguagePicker />
      </div>
      <div className="mb-4 text-center">
        <div className="animate-flicker text-7xl">🕵️</div>
        <h1 dir="ltr" className="mt-4 text-5xl font-black leading-tight text-glow">mafia</h1>
        <p className="mt-2 text-lg font-bold text-accent text-glow-gold">
          {tr("app.tagline")}
        </p>
        <p className="mx-auto mt-4 max-w-[300px] text-sm leading-6 text-muted-foreground">
          {tr("app.menuDesc")}
        </p>
      </div>

      <div className="flex justify-center gap-3 text-2xl">
        <span>🔪</span>
        <span>🕵️</span>
        <span>❤️</span>
        <span>👤</span>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {canContinue && (
          <PrimaryButton
            onClick={onContinue}
            className="bg-accent text-accent-foreground shadow-[0_4px_24px_rgba(255,196,87,0.25)] hover:bg-accent/90"
          >
            {tr("menu.continue")}
          </PrimaryButton>
        )}
        <PrimaryButton onClick={onNewGame}>{tr("menu.newGame")}</PrimaryButton>
        <GhostButton onClick={onFriends}>{tr("menu.friends")}</GhostButton>
        <GhostButton onClick={onAi}>{tr("menu.ai")}</GhostButton>
        <div className="my-1 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/10" />
          <SectionTitle>{tr("menu.more")}</SectionTitle>
          <span className="h-px flex-1 bg-white/10" />
        </div>
        <GhostButton onClick={onHowTo}>{tr("menu.howTo")}</GhostButton>
        <GhostButton onClick={onSettings}>{tr("menu.settings")}</GhostButton>
      </div>

      <p className="mt-8 text-center text-[11px] text-muted-foreground/70">
        {tr("app.version")}
      </p>
    </ScreenShell>
  );
}