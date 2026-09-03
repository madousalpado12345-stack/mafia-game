import { alivePlayers } from "@/game/engine";
import { playSound } from "@/game/sound";
import type { GameState } from "@/game/types";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { GameTopBar, formatTime } from "./ui";

const DURATIONS = [1, 2, 3, 5, 10];

export default function DiscussionScreen({
  game,
  onDone,
  onExit,
  onSave,
}: {
  game: GameState;
  onDone: () => void;
  onExit: () => void;
  onSave: () => void;
}) {
  const [duration, setDuration] = useState(game.settings.discussionMinutes);
  const [secondsLeft, setSecondsLeft] = useState(game.settings.discussionMinutes * 60);
  const [running, setRunning] = useState(true);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0 && !ended) {
      playSound("timerEnd");
      setRunning(false);
      setEnded(true);
    }
  }, [secondsLeft, ended]);

  const pickDuration = (m: number) => {
    setDuration(m);
    setSecondsLeft(m * 60);
    setRunning(false);
    setEnded(false);
  };

  return (
    <div className="flex flex-1 flex-col gap-5">
      <GameTopBar title="النقاش 🗣️" onExit={onExit} onSave={onSave} />

      <div className="text-center">
        <h1 className="text-3xl font-black text-glow-gold">مرحلة النقاش</h1>
        <p className="mx-auto mt-2 max-w-[300px] text-sm leading-6 text-muted-foreground">
          ناقشوا الأحداث وحاولوا اكتشاف المافيا قبل التصويت.
        </p>
      </div>

      <div
        className={cn(
          "mx-auto flex w-full max-w-[300px] flex-col items-center rounded-3xl border p-8",
          ended
            ? "border-primary/60 bg-primary/10"
            : "border-accent/40 bg-card/70 shadow-[0_0_50px_-12px_rgba(255,196,87,0.35)]",
        )}
      >
        <p className="text-xs font-extrabold text-muted-foreground">
          {ended ? "انتهى وقت النقاش" : "الوقت المتبقي"}
        </p>
        <p
          className={cn(
            "mt-2 text-7xl font-black tabular-nums tracking-tight",
            ended ? "text-primary animate-pulse-red" : "text-accent text-glow-gold",
          )}
        >
          {formatTime(secondsLeft)}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {alivePlayers(game.players).length} لاعبين أحياء
        </p>
      </div>

      {!ended && (
        <>
          <div className="flex justify-center gap-2">
            {DURATIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => pickDuration(m)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-extrabold transition-all",
                  duration === m
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-white/10 bg-card/70 text-muted-foreground hover:border-accent/50",
                )}
              >
                {m} دقيقة
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              className="h-12 flex-1 rounded-xl border border-white/10 bg-card/70 text-sm font-extrabold transition-all hover:border-accent/40"
            >
              {running ? "⏸ إيقاف مؤقت" : "▶️ متابعة"}
            </button>
            <button
              type="button"
              onClick={() => setSecondsLeft(0)}
              className="h-12 flex-1 rounded-xl border border-white/10 bg-card/70 text-sm font-extrabold text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground"
            >
              إنهاء النقاش
            </button>
          </div>
        </>
      )}

      {ended && (
        <button
          type="button"
          onClick={onDone}
          className="h-14 w-full rounded-xl bg-primary text-lg font-black text-primary-foreground shadow-[0_4px_28px_rgba(220,60,60,0.4)] transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          الانتقال إلى التصويت 🗳️
        </button>
      )}
    </div>
  );
}