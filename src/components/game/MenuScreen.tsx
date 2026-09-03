import { GhostButton, PrimaryButton, SectionTitle, ScreenShell } from "./ui";

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
  return (
    <ScreenShell className="justify-center">
      <div className="mb-4 text-center">
        <div className="animate-flicker text-7xl">🕵️</div>
        <h1 className="mt-4 text-5xl font-black leading-tight text-glow">مافيا</h1>
        <p className="mt-2 text-lg font-bold text-accent text-glow-gold">
          لعبة الشك والخداع
        </p>
        <p className="mx-auto mt-4 max-w-[260px] text-sm leading-6 text-muted-foreground">
          ناقشوا، خادعوا، استنتجوا، وصوّتوا — من سينجو من المافيا؟
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
            ▶️ متابعة اللعبة المحفوظة
          </PrimaryButton>
        )}
        <PrimaryButton onClick={onNewGame}>🎮 لعبة جديدة</PrimaryButton>
        <GhostButton onClick={onFriends}>👥 اللعب مع الأصدقاء</GhostButton>
        <GhostButton onClick={onAi} disabled className="relative">
          🤖 اللعب ضد الذكاء الاصطناعي
          <span className="absolute -top-2 left-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-primary-foreground">
            قريبًا
          </span>
        </GhostButton>
        <div className="my-1 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/10" />
          <SectionTitle>المزيد</SectionTitle>
          <span className="h-px flex-1 bg-white/10" />
        </div>
        <GhostButton onClick={onHowTo}>📖 طريقة اللعب</GhostButton>
        <GhostButton onClick={onSettings}>⚙️ الإعدادات</GhostButton>
      </div>

      <p className="mt-8 text-center text-[11px] text-muted-foreground/70">
        الإصدار 1.0 — تناوب على هاتف واحد · 6–16 لاعبًا
      </p>
    </ScreenShell>
  );
}