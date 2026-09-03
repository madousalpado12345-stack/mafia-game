import { alivePlayers } from "@/game/engine";
import type { GameState, Player } from "@/game/types";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { GameTopBar, PassPhone, PrimaryButton, ScreenShell, SelectableList, type SelectItem } from "./ui";

export default function VoteScreen({
  game,
  voter,
  index,
  total,
  aiMode,
  onVote,
  onExit,
  onSave,
}: {
  game: GameState;
  voter: Player;
  index: number;
  total: number;
  /** In AI mode the human votes directly — no phone handoff. */
  aiMode?: boolean;
  /** Records the vote and moves to the next voter. */
  onVote: (targetId: string | null) => void;
  onExit: () => void;
  onSave: () => void;
}) {
  const [phase, setPhase] = useState<"handoff" | "choose">(aiMode ? "choose" : "handoff");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const alive = alivePlayers(game.players);
  const revote = game.tiedCandidates !== null;

  // All candidates look identical — voting must never reveal anyone's role.
  const candidates: SelectItem[] = alive
    .filter((p) => p.id !== voter.id)
    .filter((p) => (revote ? (game.tiedCandidates ?? []).includes(p.id) : true))
    .map((p) => ({
      id: p.id,
      label: p.name,
      emoji: "👤",
    }));

  const canAbstain = game.settings.allowAbstain && !revote;

  return (
    <ScreenShell>
      <GameTopBar
        title={`التصويت — ${index + 1} من ${total}`}
        onExit={onExit}
        onSave={onSave}
      />

      <p className="text-center text-xs font-extrabold text-muted-foreground">
        {aiMode
          ? "التصويت — صوتك أنت"
          : `التصويت ${revote ? "— جولة إعادة" : ""} — المصوت ${index + 1} من ${total}`}
      </p>

      {phase === "handoff" ? (
        <>
          <div className="flex-1" />
          <PassPhone
            name={voter.name}
            note="صوّت سرًا ضد اللاعب الذي تشك فيه. لن يرى أحد اختيارك."
          />
          <div className="flex-1" />
          <PrimaryButton onClick={() => setPhase("choose")}>بدء التصويت 🗳️</PrimaryButton>
        </>
      ) : (
        <>
          <div className="text-center">
            <h2 className="text-xl font-black">اختر من تصوّت ضده</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {aiMode
                ? "هذا صوتك أنت — لا يمكنك التصويت على نفسك."
                : `${voter.name} — لا يمكنك التصويت على نفسك.`}
            </p>
          </div>

          <SelectableList
            items={candidates}
            selectedId={selectedId}
            onSelect={setSelectedId}
            empty="لا يوجد مرشحون في هذه الجولة."
          />

          {canAbstain && (
            <button
              type="button"
              onClick={() => setSelectedId("__abstain__")}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-start transition-all",
                selectedId === "__abstain__"
                  ? "border-muted-foreground bg-muted"
                  : "border-white/10 bg-card/70 hover:border-white/25",
              )}
            >
              <span className="text-xl">🤷</span>
              <span className="flex-1 text-sm font-bold">لا أريد إخراج أحد</span>
              <span
                className={cn(
                  "size-4 rounded-full border-2",
                  selectedId === "__abstain__" ? "border-muted-foreground bg-muted-foreground" : "border-white/25",
                )}
              />
            </button>
          )}

          <div className="mt-2">
            <PrimaryButton
              disabled={selectedId === null}
              onClick={() => {
                onVote(selectedId === "__abstain__" ? null : selectedId);
                setSelectedId(null);
                setPhase("handoff");
              }}
            >
              تأكيد التصويت
            </PrimaryButton>
          </div>
        </>
      )}
    </ScreenShell>
  );
}