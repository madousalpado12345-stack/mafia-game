import { mafiaTeammates, nameOf } from "@/game/engine";
import type { GameState } from "@/game/types";
import { useState } from "react";
import { PassPhone, PrimaryButton, RoleCard, SecretBadge, ScreenShell } from "./ui";

export default function RoleRevealScreen({
  game,
  onShow,
  onHide,
}: {
  game: GameState;
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
        توزيع الأدوار السرية — {game.revealCursor + 1} من {total}
      </p>

      {!revealed ? (
        <>
          <div className="flex-1" />
          <PassPhone
            name={player.name}
            note="سيظهر الدور على الشاشة وحدك. أبقِ الهاتف بعيدًا عن أنظار الآخرين."
          />
          <div className="flex-1" />
          <PrimaryButton onClick={show}>إظهار دوري 🤫</PrimaryButton>
          <p className="text-center text-xs text-muted-foreground">
            لا تُطلع أي لاعب آخر على دورك طوال اللعبة.
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
          </RoleCard>
          <SecretBadge />
          <div className="flex-1" />
          <PrimaryButton onClick={hide} className="bg-secondary text-secondary-foreground shadow-none hover:bg-secondary/80">
            إخفاء الدور وتسليم الهاتف
          </PrimaryButton>
          <p className="text-center text-xs text-muted-foreground">
            {game.revealCursor + 1 < total
              ? `اللاعب التالي: ${nameOf(game.players, game.players[game.revealCursor + 1].id)}`
              : "بعد الإخفاء سيبدأ الليل."}
          </p>
        </>
      )}
    </ScreenShell>
  );
}