import { ROLES } from "@/game/roles";
import type { RoleId } from "@/game/types";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useEffect, useRef, type ReactNode } from "react";

export function ScreenShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-1 flex-col gap-5", className)}>{children}</div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-extrabold uppercase tracking-wider text-accent/90">
      {children}
    </p>
  );
}

export function PrimaryButton({
  children,
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "h-12 w-full rounded-xl bg-primary text-base font-extrabold text-primary-foreground shadow-[0_4px_24px_rgba(220,60,60,0.35)] transition-all hover:bg-primary/90 hover:shadow-[0_4px_32px_rgba(220,60,60,0.5)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "h-11 w-full rounded-xl border border-white/10 bg-card/70 px-4 text-sm font-bold text-foreground transition-all hover:border-accent/40 hover:bg-card active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** Top bar used inside active-game screens. */
export function GameTopBar({
  title,
  onExit,
  onSave,
}: {
  title: string;
  onExit: () => void;
  onSave: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            className="rounded-lg border border-white/10 bg-card/60 px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            ✕ القائمة
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>الخروج إلى القائمة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حفظ اللعبة تلقائيًا ويمكنك متابعتها لاحقًا من القائمة الرئيسية.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={onExit}>حفظ والخروج</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p className="truncate text-xs font-extrabold text-muted-foreground">{title}</p>
      <button
        type="button"
        onClick={onSave}
        className="rounded-lg border border-white/10 bg-card/60 px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
      >
        💾 حفظ
      </button>
    </div>
  );
}

export function RoleCard({
  roleId,
  className,
  children,
}: {
  roleId: RoleId;
  className?: string;
  children?: ReactNode;
}) {
  const r = ROLES[roleId];
  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl border p-6 text-center", className)}
      style={{
        borderColor: r.color,
        background: `linear-gradient(160deg, ${r.soft}, transparent 72%), var(--card)`,
        boxShadow: `0 0 34px -8px ${r.color}55`,
      }}
    >
      <div className="text-6xl animate-float">{r.emoji}</div>
      <h3 className="mt-3 text-2xl font-black" style={{ color: r.color }}>
        {r.name}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{r.description}</p>
      {children}
    </div>
  );
}

export function SecretBadge() {
  return (
    <p className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
      🤫 دور سري — لا تُظهِره لأي لاعب آخر
    </p>
  );
}

export function PassPhone({ name, note }: { name: string; note?: string }) {
  return (
    <div className="animate-glow rounded-2xl border border-accent/40 bg-accent/10 p-5 text-center">
      <div className="text-3xl">📱</div>
      <p className="mt-2 text-lg font-black text-accent">مرّر الهاتف إلى {name}</p>
      {note && <p className="mt-1 text-xs leading-5 text-muted-foreground">{note}</p>}
    </div>
  );
}

export interface SelectItem {
  id: string;
  label: string;
  emoji?: string;
  hint?: string;
  disabled?: boolean;
}

export function SelectableList({
  items,
  selectedId,
  onSelect,
  empty,
}: {
  items: SelectItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  empty?: string;
}) {
  if (items.length === 0 && empty) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {items.map((it) => {
        const selected = selectedId === it.id;
        return (
          <button
            key={it.id}
            type="button"
            disabled={it.disabled}
            onClick={() => onSelect(it.id)}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-3 text-start transition-all active:scale-[0.99]",
              selected
                ? "border-primary bg-primary/15 shadow-[0_0_18px_rgba(220,60,60,0.18)]"
                : "border-white/10 bg-card/70 hover:border-white/25",
              it.disabled && "pointer-events-none opacity-40",
            )}
          >
            {it.emoji && <span className="text-xl">{it.emoji}</span>}
            <span className="flex-1">
              <span className="block text-sm font-bold">{it.label}</span>
              {it.hint && (
                <span className="mt-0.5 block text-xs text-muted-foreground">{it.hint}</span>
              )}
            </span>
            <span
              className={cn(
                "size-4 shrink-0 rounded-full border-2 transition-colors",
                selected ? "border-primary bg-primary" : "border-white/25",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export function PlayerStatusRow({
  player,
  showRole,
}: {
  player: { id: string; name: string; role: RoleId; status: "alive" | "dead" };
  showRole?: boolean;
}) {
  const r = ROLES[player.role];
  const dead = player.status === "dead";
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-white/10 bg-card/70 px-4 py-2.5",
        dead && "opacity-55",
      )}
    >
      <span className={cn("text-lg", dead ? "grayscale" : "")}>
        {dead ? "👻" : r.emoji}
      </span>
      <span className={cn("flex-1 text-sm font-bold", dead && "line-through")}>
        {player.name}
      </span>
      {dead ? (
        <span className="text-xs font-bold text-muted-foreground">خارج اللعبة</span>
      ) : (
        <span className="text-xs font-bold text-emerald-400">حي</span>
      )}
      {showRole && (
        <span className="text-xs font-extrabold" style={{ color: r.color }}>
          {r.name}
        </span>
      )}
    </div>
  );
}

export function formatVotes(n: number): string {
  if (n === 0) return "0 أصوات";
  if (n === 1) return "صوت واحد";
  if (n === 2) return "صوتان";
  if (n <= 10) return `${n} أصوات`;
  return `${n} صوتًا`;
}

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Fires a callback once, after a delay, while `active` is true. Used to keep
 *  AI-mode games moving on their own when the human is a spectator. */
export function useAutoAdvance(active: boolean | undefined, cb: () => void, delay = 2400) {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  const firedRef = useRef(false);
  useEffect(() => {
    if (!active || firedRef.current) return;
    firedRef.current = true;
    const t = setTimeout(() => {
      try {
        cbRef.current();
      } catch (err) {
        // A spectator auto-advance must never take the whole app down.
        console.error("[autoAdvance]", err);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [active, delay]);
}