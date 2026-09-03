import { humanPlayer } from "@/game/ai";
import { personaById } from "@/game/personas";
import { playSound } from "@/game/sound";
import type { GameState } from "@/game/types";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { GameTopBar, PrimaryButton } from "./ui";

export default function AiDiscussionScreen({
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
  const script = game.discussionScript ?? [];
  const [shown, setShown] = useState(0); // fully-revealed utterances
  const [typed, setTyped] = useState(0); // chars typed in the current utterance
  const [paused, setPaused] = useState(false);
  const [fast, setFast] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const current = shown < script.length ? script[shown] : null;
  const done = shown >= script.length;
  const human = humanPlayer(game.players);

  useEffect(() => {
    if (paused || done || !current) return;
    const speed = fast ? 6 : 22;
    if (typed < current.text.length) {
      const t = setTimeout(() => setTyped((n) => n + 1), speed);
      return () => clearTimeout(t);
    }
    const pauseMs = fast ? 90 : 650;
    const t = setTimeout(() => {
      setShown((n) => n + 1);
      setTyped(0);
      playSound("click");
    }, pauseMs);
    return () => clearTimeout(t);
  }, [paused, done, current, typed, fast]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [shown, typed]);

  const skipAll = () => {
    setFast(true);
    setShown(script.length);
    setTyped(0);
    playSound("click");
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <GameTopBar title="النقاش 🗣️ — الذكاء الاصطناعي" onExit={onExit} onSave={onSave} />

      <div className="text-center">
        <h1 className="text-3xl font-black text-glow-gold">مرحلة النقاش</h1>
        <p className="mx-auto mt-2 max-w-[310px] text-sm leading-6 text-muted-foreground">
          {human
            ? `شاهد حوار الشخصيات حولك يا ${human.name} — راقب اتهاماتهم ودفاعاتهم ثم صوّت في النهاية.`
            : "شاهد حوار الشخصيات بينما تتواصل المباراة تلقائيًا."}
        </p>
      </div>

      <div className="game-scroll flex max-h-[52dvh] flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {script.slice(0, shown).map((u, i) => {
          const speaker = game.players.find((p) => p.id === u.playerId);
          const persona = speaker?.isAi ? personaById(game.aiStates?.[speaker.id]?.personalityId ?? "smart") : null;
          return (
            <ChatBubble
              key={i}
              name={speaker?.name ?? "؟"}
              emoji={persona?.emoji ?? "👤"}
              text={u.text}
              complete
            />
          );
        })}

        {current && (
          <ChatBubble
            key={`typing-${shown}`}
            name={game.players.find((p) => p.id === current.playerId)?.name ?? "؟"}
            emoji={personaById(game.aiStates?.[current.playerId]?.personalityId ?? "smart").emoji}
            text={current.text.slice(0, typed)}
            active={!paused}
          />
        )}
        <div ref={endRef} />
      </div>

      <div className="mt-auto flex flex-col gap-2">
        {!done && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setPaused((p) => !p);
                playSound("click");
              }}
              className="h-11 flex-1 rounded-xl border border-white/10 bg-card/70 text-sm font-extrabold transition-all hover:border-accent/40"
            >
              {paused ? "▶️ متابعة" : "⏸️ إيقاف مؤقت"}
            </button>
            <button
              type="button"
              onClick={skipAll}
              className="h-11 flex-1 rounded-xl border border-white/10 bg-card/70 text-sm font-extrabold text-muted-foreground transition-all hover:border-accent/40 hover:text-foreground"
            >
              ⏩ تخطي
            </button>
            <button
              type="button"
              onClick={() => {
                playSound("click");
                onDone();
              }}
              className="h-11 flex-1 rounded-xl border border-primary/40 bg-primary/10 text-sm font-extrabold text-primary transition-all hover:bg-primary/20"
            >
              إنهاء النقاش الآن
            </button>
          </div>
        )}
        {done && (
          <PrimaryButton onClick={onDone}>الانتقال إلى التصويت 🗳️</PrimaryButton>
        )}
      </div>
    </div>
  );
}

function ChatBubble({
  name,
  emoji,
  text,
  complete,
  active,
}: {
  name: string;
  emoji: string;
  text: string;
  complete?: boolean;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-2xl border border-white/10 bg-card/70 p-3 transition-opacity",
        !complete && !active && "opacity-70",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-lg",
          active && "animate-glow",
        )}
      >
        {emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-extrabold text-accent">{name}</p>
        <p className="mt-0.5 text-sm leading-6 text-foreground/90">
          {text}
          {!complete && <span className="animate-pulse text-accent">▌</span>}
        </p>
      </div>
    </div>
  );
}