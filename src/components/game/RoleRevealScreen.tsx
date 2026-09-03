import { mafiaTeammates, nameOf } from "@/game/engine";
import type { GameState } from "@/game/types";
import { useState } from "react";
import { PassPhone, PrimaryButton, RoleCard, SecretBadge, ScreenShell } from "./ui";

export default function RoleRevealScreen({
  game,
  aiMode,
  onShow,
  onHide,
}: {
  game: GameState;
  /** In AI mode the role is shown only to the single human player. */
  aiMode?: boolean;
  /** Called when the current player taps "show my role". */
  onShow: () => void;
  /** Called when the current player hides the role and passes the phone. */
  onHide: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const player = game.players[game.revealCursor];
  const total = game.players.length;

  const show = () => {
    setRevealed(true);
    onShow();
  };

  const hide = () => {
    setRevealed(false);
    onHide();
  };

  return (
    <ScreenShell>
      <p className="text-center text-xs font-extrabold text-muted-foreground">
        {aiMode ? "دورك السري 🤫" : `توزيع الأدوار السرية — ${game.revealCursor + 1} من ${total}`}
      </p>

      {!revealed ? (
        <>
          <div className="flex-1" />
          {aiMode ? (
            <div className="rounded-2xl border border-accent/40 bg-accent/10 p-5 text-center">
              <div className="text-3xl">🙋</div>
              <p className="mt-2 text-lg font-black text-accent">أنت: {player.name}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                سيظهر دورك السري على الشاشة وحدك. لن يرى أحد غيرك ما سيظهر الآن.
              </p>
            </div>
          ) : (
            <PassPhone
              name={player.name}
              note="سيظهر الدور على الشاشة وحدك. أبقِ الهاتف بعيدًا عن أنظار الآخرين."
            />
          )}
          <div className="flex-1" />
          <PrimaryButton onClick={show}>إظهار دوري 🤫</PrimaryButton>
          <p className="text-center text-xs text-muted-foreground">
            {aiMode
              ? "الشخصيات الأخرى تعرف أدوارها سرًا — لا يمكنك رؤيتها."
              : "لا تُطلع أي لاعب آخر على دورك طوال اللعبة."}
          </p>
        </>
      ) : (
        <>
          <div className="flex-1" />
          <RoleCard roleId={player.role}>
            {player.role === "mafia" && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm">
                <p className="font-extrabold text-red-400">زملاؤك في المافيا:</p>
                <p className="mt-1 text-muted-foreground">
                  {mafiaTeammates(game, player.id).length > 0
                    ? mafiaTeammates(game, player.id).map((m) => m.name).join("، ")
                    : "لا يوجد — أنت المافيا الوحيدة المتبقية"}
                </p>
              </div>
            )}
            {player.role === "detective" && (
              <div className="mt-4 rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-sm text-muted-foreground">
                عندما تُطلب منك، اختر لاعبًا لفحصه وستعرف النتيجة وحدك.
              </div>
            )}
            {player.role === "doctor" && (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-muted-foreground">
                عندما تُطلب منك، اختر لاعبًا لتحميه من استهداف المافيا.
              </div>
            )}
            {player.role === "jester" && (
              <div className="mt-4 rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 text-sm text-muted-foreground">
                سرّك الأكبر: أثر الشكوك حولك حتى يُصوَّت عليك وتُخرج بالتصويت — عندها
                تفوز وحدك بالمباراة! لا تكشف نيتك لأحد.
              </div>
            )}
          </RoleCard>
          <SecretBadge />
          <div className="flex-1" />
          <PrimaryButton onClick={hide} className="bg-secondary text-secondary-foreground shadow-none hover:bg-secondary/80">
            {aiMode ? "إخفاء الدور وبدء الليل 🌙" : "إخفاء الدور وتسليم الهاتف"}
          </PrimaryButton>
          <p className="text-center text-xs text-muted-foreground">
            {aiMode
              ? "بعد الإخفاء سيبدأ الليل."
              : game.revealCursor + 1 < total
                ? `اللاعب التالي: ${nameOf(game.players, game.players[game.revealCursor + 1].id)}`
                : "بعد الإخفاء سيبدأ الليل."}
          </p>
        </>
      )}
    </ScreenShell>
  );
}