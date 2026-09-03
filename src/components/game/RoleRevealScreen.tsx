import { mafiaTeammates, nameOf } from "@/game/engine";
import { ROLES } from "@/game/roles";
import type { GameState } from "@/game/types";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { GhostButton, PassPhone, PrimaryButton, ScreenShell } from "./ui";

/** Undercover-style secret role reveal:
 *  1. cover — the card is hidden, tap "كشف الدور"
 *  2. revealed — only THIS player's role (name, icon, brief) is shown once
 *  3. متابعة / إخفاء وتسليم — moves to the next player (friends) or the night
 *     (AI mode). The role can never be changed or seen twice. */
export default function RoleRevealScreen({
  game,
  aiMode,
  onShow,
  onHide,
}: {
  game: GameState;
  /** In AI mode the role is shown only to the single human player. */
  aiMode?: boolean;
  /** Called when the current player taps "كشف الدور". */
  onShow: () => void;
  /** Called when the current player confirms and moves on. */
  onHide: () => void;
}) {
  const [stage, setStage] = useState<"cover" | "revealed">("cover");
  const player = game.players[game.revealCursor];
  const total = game.players.length;
  const r = ROLES[player.role];
  const isLast = aiMode || game.revealCursor + 1 >= total;

  const show = () => {
    setStage("revealed");
    onShow();
  };

  const hide = () => {
    setStage("cover");
    onHide();
  };

  return (
    <ScreenShell>
      <p className="text-center text-xs font-extrabold text-muted-foreground">
        {aiMode ? "تقديم الأدوار — دورك أنت" : `تقديم الأدوار — ${game.revealCursor + 1} من ${total}`}
      </p>

      {stage === "cover" ? (
        <>
          <div className="flex-1" />
          <p className="text-center text-lg font-black text-foreground/90">
            دورك هو...
          </p>

          {/* Hidden card back — nothing about the role is visible yet */}
          <div className="relative mx-auto mt-2 w-full max-w-[280px]">
            <div
              className="flex aspect-[3/4] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/20 bg-card/80"
              style={{ boxShadow: "0 0 40px -18px rgba(255,196,87,0.45)" }}
            >
              <span className="text-7xl opacity-40">🎴</span>
              <span className="mt-4 text-6xl font-black text-muted-foreground/50">؟</span>
              <p className="mt-4 px-8 text-center text-xs leading-6 text-muted-foreground">
                بطاقتك مغلقة — لا يمكن لأحد رؤيتها حتى تكشفها أنت.
              </p>
            </div>
          </div>

          {!aiMode ? (
            <PassPhone
              name={player.name}
              note="اضغط «كشف الدور» لترى بطاقتك وحدك، ثم مرّر الهاتف بعد التأكيد."
            />
          ) : (
            <p className="mt-3 rounded-xl border border-white/10 bg-card/70 px-4 py-2.5 text-center text-xs text-muted-foreground">
              أنت: {player.name} — أدوار الشخصيات الأخرى تبقى سرية ولا يمكنك رؤيتها أبدًا.
            </p>
          )}

          <div className="flex-1" />

          <PrimaryButton onClick={show}>كشف الدور 🎭</PrimaryButton>
        </>
      ) : (
        <>
          <div className="flex-1" />
          <p className="text-center text-xs font-extrabold text-muted-foreground">دورك هو</p>

          {/* Revealed role card — name, icon and brief description */}
          <div
            className="relative mx-auto mt-1 w-full max-w-[280px] overflow-hidden rounded-3xl border-2 p-6 text-center"
            style={{
              borderColor: r.color,
              background: `linear-gradient(160deg, ${r.soft}, transparent 78%), var(--card)`,
              boxShadow: `0 0 44px -8px ${r.color}66`,
            }}
          >
            <div className="animate-float text-7xl">{r.emoji}</div>
            <h2 className="mt-3 text-4xl font-black" style={{ color: r.color }}>
              {r.name}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{r.brief}</p>

            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] font-bold text-accent">
              🔒 لا يمكن تغيير الدور بعد الكشف
            </p>

            {player.role === "mafia" && (
              <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-start text-sm">
                <p className="font-extrabold text-red-400">زملاؤك في المافيا:</p>
                <p className="mt-1 leading-6 text-muted-foreground">
                  {mafiaTeammates(game, player.id).length > 0
                    ? mafiaTeammates(game, player.id).map((m) => m.name).join("، ")
                    : "لا يوجد — أنت المافيا الوحيدة المتبقية"}
                </p>
              </div>
            )}
            {player.role === "detective" && (
              <div className="mt-4 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-3 text-start text-sm text-muted-foreground">
                عندما تُطلب منك، اختر لاعبًا لفحصه وستعرف النتيجة وحدك.
              </div>
            )}
            {player.role === "doctor" && (
              <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-start text-sm text-muted-foreground">
                عندما تُطلب منك، اختر لاعبًا لتحميه من استهداف المافيا.
              </div>
            )}
            {player.role === "jester" && (
              <div className="mt-4 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-3 text-start text-sm text-muted-foreground">
                سرّك الأكبر: أثر الشكوك حولك حتى يُصوَّت عليك — عندها تفوز وحدك!
              </div>
            )}
          </div>

          <div className="flex-1" />

          <PrimaryButton onClick={hide} className="bg-secondary text-secondary-foreground shadow-none hover:bg-secondary/80">
            {isLast ? "متابعة 🌙" : "متابعة وتسليم الهاتف"}
          </PrimaryButton>
          <GhostButton onClick={() => setStage("cover")}>إعادة إخفاء البطاقة</GhostButton>
          <p className="text-center text-xs text-muted-foreground">
            {isLast
              ? "بعد المتابعة سيبدأ الليل."
              : `اللاعب التالي: ${nameOf(game.players, game.players[game.revealCursor + 1].id)}`}
          </p>
        </>
      )}
    </ScreenShell>
  );
}