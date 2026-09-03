import { nameOf, playerById } from "@/game/engine";
import { ROLES } from "@/game/roles";
import type { GameState } from "@/game/types";
import { cn } from "@/lib/utils";
import { GameTopBar, GhostButton, PrimaryButton, ScreenShell, formatVotes } from "./ui";

export default function VoteResultsScreen({
  game,
  canRevote,
  onRevote,
  onNoEliminate,
  onContinue,
  onExit,
  onSave,
}: {
  game: GameState;
  canRevote: boolean;
  onRevote: () => void;
  onNoEliminate: () => void;
  onContinue: () => void;
  onExit: () => void;
  onSave: () => void;
}) {
  const outcome = game.lastVoteOutcome;
  const isTie = outcome?.kind === "tie";

  const tallyCard = (
    <div className="rounded-2xl border border-white/10 bg-card/70 p-4">
      <p className="mb-3 text-center text-xs font-extrabold text-muted-foreground">
        نتيجة الأصوات
      </p>
      <div className="flex flex-col gap-2">
        {(outcome?.rows ?? []).map((row) => {
          const label = row.playerId ? nameOf(game.players, row.playerId) : "لا أحد (امتناع)";
          const isTop =
            row.playerId !== null && outcome?.kind === "eliminate" && row.playerId === outcome.eliminatedId;
          return (
            <div
              key={row.playerId ?? "__abstain__"}
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2",
                isTop
                  ? "border-red-500/50 bg-red-500/10"
                  : "border-white/5 bg-white/[0.03]",
              )}
            >
              <span className={cn("text-sm font-bold", isTop && "text-red-400")}>{label}</span>
              <span className="text-xs font-extrabold text-muted-foreground">
                {formatVotes(row.count)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <ScreenShell>
      <GameTopBar title="نتيجة التصويت 🗳️" onExit={onExit} onSave={onSave} />

      <div className="text-center">
        <div className="text-7xl">{isTie ? "⚖️" : "🗳️"}</div>
        <h1 className="mt-3 text-3xl font-black text-glow">
          {isTie ? "حدث تعادل!" : "نتيجة التصويت"}
        </h1>
      </div>

      {tallyCard}

      {outcome?.kind === "eliminate" && outcome.eliminatedId && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-center">
          <div className="text-4xl">⚰️</div>
          <h2 className="mt-2 text-xl font-black text-red-400">
            تم التصويت ضد {nameOf(game.players, outcome.eliminatedId)}
          </h2>
          {game.settings.revealRoleOnElimination && (
            <p className="mt-2 text-sm font-bold text-muted-foreground">
              كان دوره: {ROLES[playerById(game.players, outcome.eliminatedId).role].emoji}{" "}
              {ROLES[playerById(game.players, outcome.eliminatedId).role].name}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {nameOf(game.players, outcome.eliminatedId)} خارج اللعبة الآن 👻
          </p>
        </div>
      )}

      {(outcome?.kind === "abstain" || outcome?.kind === "noVotes") && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-center">
          <div className="text-4xl">🤝</div>
          <h2 className="mt-2 text-xl font-black text-emerald-400">
            {outcome.kind === "abstain"
              ? "قرر الجميع عدم إخراج أحد"
              : "لم يُسجَّل أي تصويت ضد أحد"}
          </h2>
        </div>
      )}

      {isTie ? (
        <div className="flex flex-col gap-2">
          <p className="text-center text-sm text-muted-foreground">
            حصل لاعبان أو أكثر على نفس عدد الأصوات. اختار المضيف ما يحدث:
          </p>
          {canRevote && (
            <PrimaryButton onClick={onRevote}>🔁 إعادة التصويت</PrimaryButton>
          )}
          <GhostButton onClick={onNoEliminate}>عدم إخراج أي لاعب</GhostButton>
        </div>
      ) : (
        <PrimaryButton onClick={onContinue}>متابعة إلى الليلة القادمة 🌙</PrimaryButton>
      )}
    </ScreenShell>
  );
}