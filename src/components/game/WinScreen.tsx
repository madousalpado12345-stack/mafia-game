import { alivePlayers } from "@/game/engine";
import { ROLES } from "@/game/roles";
import type { GameState } from "@/game/types";
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
  const mafiaWin = game.winner === "mafia";
  const alive = alivePlayers(game.players);

  return (
    <ScreenShell>
      <div className="text-center">
        <div className={mafiaWin ? "animate-pulse-red text-8xl" : "animate-float text-8xl"}>
          {mafiaWin ? "🔪" : "🏆"}
        </div>
        <p className="mt-4 text-sm font-extrabold text-muted-foreground">انتهت اللعبة</p>
        <h1
          className={`mt-2 text-4xl font-black leading-tight ${
            mafiaWin ? "text-glow text-red-400" : "text-glow-gold text-accent"
          }`}
        >
          {mafiaWin ? "فازت المافيا!" : "فاز المواطنون!"}
        </h1>
        <p className="mx-auto mt-3 max-w-[300px] text-sm leading-6 text-muted-foreground">
          {mafiaWin
            ? "تمكنت المافيا من التفوّق على المواطنين وأصبحت أكثر عددًا منهم."
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
        <SectionTitle>الأدوار النهائية</SectionTitle>
        <div className="flex flex-col gap-2">
          {game.players.map((p) => {
            const r = ROLES[p.role];
            const dead = p.status === "dead";
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-card/70 px-4 py-2.5"
              >
                <span className={dead ? "grayscale" : ""}>{dead ? "👻" : r.emoji}</span>
                <span className={`flex-1 text-sm font-bold ${dead ? "line-through opacity-60" : ""}`}>
                  {p.name}
                </span>
                <span
                  className="rounded-md px-2 py-0.5 text-xs font-extrabold"
                  style={{ color: r.color, background: r.soft }}
                >
                  {r.name}
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