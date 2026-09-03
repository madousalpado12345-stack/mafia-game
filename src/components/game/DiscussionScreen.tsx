import { alivePlayers } from "@/game/engine";
import { playSound } from "@/game/sound";
import type { GameState } from "@/game/types";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { GameTopBar, formatTime } from "./ui";

const DURATIONS = [1, 2, 3, 5, 10];

export default function DiscussionScreen({
  game,
  timer,
  onTick,
  onReset,
  onDone,
  onExit,
  onSave,
}: {
  game: GameState;
  /** Countdown stored in game state (single source of truth). */
  timer: { duration: number; remaining: number };
  /** Ticks the countdown down by one second (the interval lives here). */
  onTick: () => void;
  /** Restarts the countdown with a chosen duration (minutes). */
  onReset: (minutes: number) => void;
  onDone: () => void;
  onExit: () => void;
  onSave: () => void;
}) {
  const [running, setRunning] = useState(true);
  const [ended, setEnded] = useState(false);
  const finishedRef = useRef(false);
  const secondsLeft = timer.remaining;
  const total = Math.max(1, timer.duration);

  // Single interval — cleaned up on pause, unmount and every transition.
  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const iv = setInterval(onTick, 1000);
    return () => clearInterval(iv);
  }, [running, secondsLeft, onTick]);

  // At 00:00 → stop, then move to voting automatically.
  useEffect(() => {
    if (secondsLeft > 0 || finishedRef.current) return;
    finishedRef.current = true;
    setRunning(false);
    setEnded(true);
    playSound("timerEnd");
  }, [secondsLeft]);

  useEffect(() => {
    if (!ended) return;
    const t = setTimeout(() => {
      playSound("click");
      onDone();
    }, 900);
    return () => clearTimeout(t);
  }, [ended, onDone]);

  const pickDuration = (m: number) => {
    playSound("click");
    finishedRef.current = false;
    setEnded(false);
    setRunning(true);
    onReset(m);
  };

  const percent = Math.min(100, Math.round((secondsLeft / total) * 100));

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
          {ended ? "انتهى وقت النقاش — جارٍ الانتقال إلى التصويت..." : "الوقت المتبقي"}
        </p>
        <p
          className={cn(
            "mt-2 text-7xl font-black tabular-nums tracking-tight",
            ended ? "text-primary animate-pulse-red" : secondsLeft <= 10 ? "text-primary animate-pulse-red" : "text-accent text-glow-gold",
          )}
        >
          {formatTime(secondsLeft)}
        </p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-accent transition-all duration-1000 ease-linear"
            style={{ width: `${percent}%` }}
          />
        </div>
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
                  m * 60 === total
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
              onClick={() => {
                playSound("click");
                setRunning((r) => !r);
              }}
              className="h-12 flex-1 rounded-xl border border-white/10 bg-card/70 text-sm font-extrabold transition-all hover:border-accent/40"
            >
              {running ? "⏸ إيقاف مؤقت" : "▶️ متابعة"}
            </button>
            <button
              type="button"
              onClick={() => {
                playSound("click");
                onDone();
              }}
              className="h-12 flex-1 rounded-xl border border-white/10 bg-card/70 text-sm font-extrabold text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground"
            >
              إنهاء النقاش الآن
            </button>
          </div>
        </>
      )}
    </div>
  );
}