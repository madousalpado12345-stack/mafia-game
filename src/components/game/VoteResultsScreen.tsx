import { nameOf, playerById } from "@/game/engine";
import { localizedRole, useI18n } from "@/i18n";
import type { GameState } from "@/game/types";
import { cn } from "@/lib/utils";
import {
  GameTopBar,
  GhostButton,
  PrimaryButton,
  ScreenShell,
  formatVotes,
  useAutoAdvance,
} from "./ui";

export default function VoteResultsScreen({
  game,
  spectator,
  canRevote,
  onRevote,
  onNoEliminate,
  onContinue,
  onExit,
  onSave,
}: {
  game: GameState;
  /** AI mode with the human out — ties/votes resolve on their own. */
  spectator?: boolean;
  canRevote: boolean;
  onRevote: () => void;
  onNoEliminate: () => void;
  onContinue: () => void;
  onExit: () => void;
  onSave: () => void;
}) {
  const { t: tr } = useI18n();
  const outcome = game.lastVoteOutcome;
  const isTie = outcome?.kind === "tie";

  // Spectators: show the tally briefly, then keep the match moving — a tie
  // re-votes if allowed, otherwise no one is eliminated.
  useAutoAdvance(spectator, () => {
    if (outcome?.kind === "tie") {
      if (canRevote) onRevote();
      else onNoEliminate();
    } else {
      onContinue();
    }
  }, 2800);

  const tallyCard = (
    <div className="rounded-2xl border border-white/10 bg-card/70 p-4">
      <p className="mb-3 text-center text-xs font-extrabold text-muted-foreground">
        {tr("voteResults.tally")}
      </p>
      <div className="flex flex-col gap-2">
        {(outcome?.rows ?? []).map((row) => {
          const label = row.playerId ? nameOf(game.players, row.playerId) : tr("voteResults.nobodyAbstain");
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
      <GameTopBar title={tr("voteResults.title")} onExit={onExit} onSave={onSave} />

      <div className="text-center">
        <div className="text-7xl">{isTie ? "⚖️" : "🗳️"}</div>
        <h1 className="mt-3 text-3xl font-black text-glow">
          {isTie ? tr("voteResults.tieTitle") : tr("voteResults.resultTitle")}
        </h1>
      </div>

      {tallyCard}

      {outcome?.kind === "eliminate" && outcome.eliminatedId && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-center">
          <div className="text-4xl">⚰️</div>
          <h2 className="mt-2 text-xl font-black text-red-400">
            {tr("voteResults.eliminatedByVote", { name: nameOf(game.players, outcome.eliminatedId) })}
          </h2>
          {game.settings.revealRoleOnElimination && (
            <p className="mt-2 text-sm font-bold text-muted-foreground">
              {tr("voteResults.wasRole", {
                emoji: localizedRole(playerById(game.players, outcome.eliminatedId).role).emoji,
                role: localizedRole(playerById(game.players, outcome.eliminatedId).role).name,
              })}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {tr("voteResults.isOut", { name: nameOf(game.players, outcome.eliminatedId) })}
          </p>
        </div>
      )}

      {(outcome?.kind === "abstain" || outcome?.kind === "noVotes") && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-center">
          <div className="text-4xl">🤝</div>
          <h2 className="mt-2 text-xl font-black text-emerald-400">
            {outcome.kind === "abstain"
              ? tr("voteResults.allAbstain")
              : tr("voteResults.noVotesTitle")}
          </h2>
        </div>
      )}

      {isTie ? (
        <div className="flex flex-col gap-2">
          <p className="text-center text-sm text-muted-foreground">
            {tr("voteResults.tieSub")}
          </p>
          {canRevote && (
            <PrimaryButton onClick={onRevote}>{tr("voteResults.revote")}</PrimaryButton>
          )}
          <GhostButton onClick={onNoEliminate}>{tr("voteResults.noEliminate")}</GhostButton>
        </div>
      ) : (
        <PrimaryButton onClick={onContinue}>{tr("voteResults.nextNight")}</PrimaryButton>
      )}
    </ScreenShell>
  );
}