import { alivePlayers, deadPlayers, playerById } from "@/game/engine";
import { waitForIdle } from "@/game/narrator";
import { localizedRole, useI18n } from "@/i18n";
import type { GameState } from "@/game/types";
import { GameTopBar, logEntryText, PlayerStatusRow, PrimaryButton, ScreenShell, SectionTitle, useAutoAdvance } from "./ui";

function LogList({ game }: { game: GameState }) {
  const { t: tr } = useI18n();
  return (
    <details className="group rounded-xl border border-white/10 bg-card/70">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-bold text-accent">
        {tr("day.logTitle")}
        <span className="float-left text-xs text-muted-foreground">{tr("day.logTap")}</span>
      </summary>
      <div className="flex flex-col gap-2 border-t border-white/10 px-4 py-3">
        {game.log.length === 0 && (
          <p className="text-sm text-muted-foreground">{tr("day.logEmpty")}</p>
        )}
        {game.log.map((entry) => (
          <p key={entry.id} className="text-xs leading-5 text-muted-foreground">
            <span className="font-extrabold text-accent">
              {tr("common.nightX", { n: entry.night })} —{" "}
              {entry.phase === "night" ? tr("common.nightPhase") : tr("common.dayPhase")}:
            </span>{" "}
            {logEntryText(entry, game.players)}
          </p>
        ))}
      </div>
    </details>
  );
}

export default function DayScreen({
  game,
  spectator,
  onContinue,
  onExit,
  onSave,
}: {
  game: GameState;
  /** AI mode with the human out — the game advances on its own. */
  spectator?: boolean;
  onContinue: () => void;
  onExit: () => void;
  onSave: () => void;
}) {
  const { t: tr } = useI18n();
  // Spectators see the night result briefly, then discussion starts itself.
  // The advance waits for the narrator's closing line to finish, so the next
  // phase never interrupts the voice-over (still at least ~2.6s total).
  useAutoAdvance(spectator, () => {
    const started = Date.now();
    void waitForIdle().then(() => {
      const wait = 2600 - (Date.now() - started);
      setTimeout(onContinue, Math.max(0, wait));
    });
  }, 600);

  const eliminatedId = game.nightEliminatedId;
  const eliminated = eliminatedId ? playerById(game.players, eliminatedId) : null;
  const reveal = game.settings.revealRoleOnElimination;

  return (
    <ScreenShell>
      <GameTopBar title={tr("common.dayNightX", { n: game.night })} onExit={onExit} onSave={onSave} />

      <div className="text-center">
        <div className="animate-float text-8xl">☀️</div>
        <h1 className="mt-4 text-4xl font-black text-glow-gold">{tr("day.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{tr("day.woke")}</p>
      </div>

      {eliminated ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-center">
          <div className="text-5xl">⚰️</div>
          <h2 className="mt-3 text-2xl font-black text-red-400 text-glow">
            {tr("day.eliminatedX", { name: eliminated.name })}
          </h2>
          {reveal && (
            <p className="mt-2 text-sm font-bold text-muted-foreground">
              {tr("day.andWasRole", { emoji: localizedRole(eliminated.role).emoji, role: localizedRole(eliminated.role).name })}
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            {tr("day.staysBut", { name: eliminated.name })}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-center">
          <div className="text-5xl">🌿</div>
          <h2 className="mt-3 text-2xl font-black text-emerald-400">
            {tr("day.noElim")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {tr("day.doctorSaved")}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <SectionTitle>{tr("day.playersAlive", { n: alivePlayers(game.players).length })}</SectionTitle>
        <div className="flex flex-col gap-2">
          {game.players.map((p) => (
            <PlayerStatusRow key={p.id} player={p} />
          ))}
        </div>
        {deadPlayers(game.players).length > 0 && (
          <p className="text-center text-xs text-muted-foreground">            {tr("day.outOfGame", { names: deadPlayers(game.players).map((p) => p.name).join(tr("common.listSep")) })}
          </p>
        )}
      </div>

      <LogList game={game} />

      <div className="mt-2">
        <PrimaryButton onClick={onContinue}>{tr("day.startDiscussion")}</PrimaryButton>
      </div>
    </ScreenShell>
  );
}