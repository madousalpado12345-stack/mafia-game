import { alivePlayers } from "@/game/engine";
import { personaById } from "@/game/personas";
import { ROLES } from "@/game/roles";
import type { GameState } from "@/game/types";
import { cn } from "@/lib/utils";
import { GhostButton, PrimaryButton, ScreenShell, SectionTitle } from "./ui";

export default function WinScreen({
  game,
  onSamePlayers,
  onNewSetup,
  onMenu,
}: {
  game: GameState;
  onSamePlayers: () => void;
  onNewSetup: () => void;
  onMenu: () => void;
}) {
  const jesterWin = game.winner === "jester";
  const mafiaWin = game.winner === "mafia";
  const alive = alivePlayers(game.players);

  return (
    <ScreenShell>
      <div className="text-center">
        <div
          className={
            jesterWin
              ? "animate-float text-8xl"
              : mafiaWin
                ? "animate-pulse-red text-8xl"
                : "animate-float text-8xl"
          }
        >
          {jesterWin ? "🎭" : mafiaWin ? "🔪" : "🏆"}
        </div>
        <p className="mt-4 text-sm font-extrabold text-muted-foreground">انتهت اللعبة</p>
        <h1
          className={`mt-2 text-4xl font-black leading-tight ${
            jesterWin
              ? "text-glow text-purple-400"
              : mafiaWin
                ? "text-glow text-red-400"
                : "text-glow-gold text-accent"
          }`}
        >
          {jesterWin ? "فاز المهرج!" : mafiaWin ? "فازت المافيا!" : "فاز المواطنون!"}
        </h1>
        <p className="mx-auto mt-3 max-w-[300px] text-sm leading-6 text-muted-foreground">
          {jesterWin
            ? "تم التصويت على المهرج وإخراجه — لكنه حقق هدفه المنشود وفاز وحده بالمباراة!"
            : mafiaWin
              ? "سيطرت المافيا على المباراة تمامًا — لم يبقَ سوى لاعب واحد من غير المافيا."
              : "تمكن المواطنون من كشف المافيا وإخراجها جميعًا من اللعبة."}
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-card/70 p-4 text-center">
        <p className="text-xs font-extrabold text-muted-foreground">
          استمرت اللعبة {game.night} {game.night === 1 ? "ليلة" : game.night === 2 ? "ليلتين" : "ليالي"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {alive.length} {alive.length === 1 ? "لاعب نجا" : "لاعبين نجوا"} في النهاية
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>النتيجة النهائية</SectionTitle>
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 rounded-xl border border-white/10 bg-card/40 px-4 py-1.5 text-[10px] font-extrabold text-muted-foreground">
          <span>اللاعب</span>
          <span>الشخصية / الدور</span>
          <span>النتيجة</span>
        </div>
        <div className="flex flex-col gap-2">
          {game.players.map((p) => {
            const r = ROLES[p.role];
            const dead = p.status === "dead";
            const persona = p.isAi ? personaById(game.aiStates?.[p.id]?.personalityId ?? "smart") : null;
            return (
              <div
                key={p.id}
                className={cn(
                  "grid grid-cols-[1fr_auto_auto] items-center gap-x-3 rounded-xl border border-white/10 bg-card/70 px-4 py-2.5",
                  dead && "opacity-60",
                )}
              >
                <span className="flex items-center gap-2 overflow-hidden">
                  <span className={`truncate text-sm font-bold ${dead ? "line-through" : ""}`}>
                    {p.name}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  {p.isAi ? (
                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                      {persona?.id === "smart"
                        ? "ذكي"
                        : persona?.id === "confident"
                          ? "واثق"
                          : persona?.id === "skeptic"
                            ? "شكاك"
                            : persona?.id === "quiet"
                              ? "هادئ"
                              : persona?.id === "funny"
                                ? "مرح"
                                : persona?.id === "deceiver"
                                  ? "مخادع"
                                  : persona?.id === "aggressive"
                                    ? "عدواني"
                                    : "محلل"}
                    </span>
                  ) : (
                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-bold text-accent">
                      أنت
                    </span>
                  )}
                  <span
                    className="rounded-md px-2 py-0.5 text-[11px] font-extrabold"
                    style={{ color: r.color, background: r.soft }}
                  >
                    {r.name}
                  </span>
                </span>
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-[11px] font-extrabold",
                    dead ? "bg-white/5 text-muted-foreground" : "bg-emerald-500/10 text-emerald-400",
                  )}
                >
                  {dead ? "خارج 👻" : "حي ✓"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <details className="group rounded-xl border border-white/10 bg-card/70">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-bold text-accent">
          📜 سجل الأحداث
        </summary>
        <div className="flex flex-col gap-2 border-t border-white/10 px-4 py-3">
          {game.log.map((entry) => (
            <p key={entry.id} className="text-xs leading-5 text-muted-foreground">
              <span className="font-extrabold text-accent">
                الليلة {entry.night} — {entry.phase === "night" ? "الليل" : "النهار"}:
              </span>{" "}
              {entry.text}
            </p>
          ))}
        </div>
      </details>

      <div className="mt-2 flex flex-col gap-2">
        <PrimaryButton onClick={onSamePlayers}>🔄 لعبة جديدة بنفس اللاعبين</PrimaryButton>
        <GhostButton onClick={onNewSetup}>🎲 لعبة جديدة بأدوار عشوائية</GhostButton>
        <GhostButton onClick={onMenu}>🏠 العودة إلى القائمة الرئيسية</GhostButton>
      </div>
    </ScreenShell>
  );
}