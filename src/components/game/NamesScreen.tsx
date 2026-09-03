import { aiNamesFor, PERSONAS } from "@/game/personas";
import { randomNames } from "@/game/names";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GhostButton, PrimaryButton, ScreenShell, SectionTitle } from "./ui";

export default function NamesScreen({
  count,
  initialNames,
  aiMode,
  onBack,
  onStart,
}: {
  count: number;
  initialNames: string[] | null;
  aiMode?: boolean;
  onBack: () => void;
  onStart: (names: string[]) => void;
}) {
  const [names, setNames] = useState<string[]>(
    () => initialNames && initialNames.length === count ? initialNames : Array(count).fill(""),
  );

  useEffect(() => {
    if (initialNames && initialNames.length === count) {
      setNames(initialNames);
    }
  }, [count, initialNames]);

  const fillRandom = () => setNames(randomNames(count));

  const start = () => {
    const used = new Set<string>();
    let filled: string[];
    if (aiMode) {
      const humanName = names[0].trim() || randomNames(1)[0];
      filled = [humanName, ...aiNamesFor(count - 1, [humanName])];
    } else {
      filled = names.map((n) => n.trim() || randomNames(1)[0]);
      for (let i = 0; i < filled.length; i++) {
        if (used.has(filled[i])) filled[i] = randomNames(1)[0];
        used.add(filled[i]);
      }
    }
    onStart(filled);
  };

  const handleRandomFill = () => {
    if (aiMode) {
      setNames([randomNames(1)[0], ...Array(count - 1).fill("")]);
      toast.info("تم توليد اسم عشوائي لك");
      return;
    }
    fillRandom();
    toast.info("تم توليد أسماء عشوائية");
  };

  if (aiMode) {
    const roster = aiNamesFor(count - 1, [names[0].trim()]).slice(0, count - 1);
    return (
      <ScreenShell>
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-3 text-sm font-bold text-muted-foreground hover:text-foreground"
          >
            → رجوع
          </button>
          <h1 className="text-2xl font-black">من أنت؟</h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            أنت اللاعب الحقيقي الوحيد — سيرافقك {count - 1} من شخصيات الذكاء
            الاصطناعي. أدخل اسمك:
          </p>
        </div>

        <SectionTitle>اسمك</SectionTitle>
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-card/70 px-4 py-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-black text-primary">
            أنت
          </span>
          <input
            value={names[0]}
            maxLength={18}
            onChange={(e) => setNames((prev) => [e.target.value, ...prev.slice(1)])}
            placeholder="اسمك"
            className="h-10 w-full bg-transparent text-sm font-bold outline-none placeholder:text-muted-foreground/60"
          />
        </div>

        <SectionTitle>شخصيات الذكاء الاصطناعي ({count - 1})</SectionTitle>
        <div className="flex flex-col gap-2">
          {roster.map((n, i) => {
            const persona = PERSONAS[i % PERSONAS.length];
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-card/70 px-4 py-2.5"
              >
                <span className="flex-1 text-sm font-bold">{n}</span>
                <span className="text-xs text-muted-foreground">
                  {persona.id === "smart"
                    ? "ذكي"
                    : persona.id === "confident"
                      ? "واثق"
                      : persona.id === "skeptic"
                        ? "شكاك"
                        : persona.id === "quiet"
                          ? "هادئ"
                          : persona.id === "funny"
                            ? "مرح"
                            : persona.id === "deceiver"
                              ? "مخادع"
                              : persona.id === "aggressive"
                                ? "عدواني"
                                : "محلل"}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-2 flex flex-col gap-2">
          <PrimaryButton onClick={start}>بدء اللعبة 🤖</PrimaryButton>
          <GhostButton onClick={handleRandomFill}>🎲 اسم عشوائي</GhostButton>
          <GhostButton onClick={onBack}>رجوع</GhostButton>
        </div>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-3 text-sm font-bold text-muted-foreground hover:text-foreground"
        >
          → رجوع
        </button>
        <h1 className="text-2xl font-black">أسماء اللاعبين</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          أدخل اسمًا لكل لاعب — {count} لاعبين على نفس الهاتف.
        </p>
      </div>

      <SectionTitle>اللاعبون</SectionTitle>
      <div className="flex flex-col gap-2">
        {names.map((n, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-card/70 px-4 py-2"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-black text-primary">
              {i + 1}
            </span>
            <input
              value={n}
              maxLength={18}
              onChange={(e) =>
                setNames((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))
              }
              placeholder={`اللاعب ${i + 1}`}
              className="h-10 w-full bg-transparent text-sm font-bold outline-none placeholder:text-muted-foreground/60"
            />
          </div>
        ))}
      </div>

      <div className="mt-2 flex flex-col gap-2">
        <PrimaryButton onClick={start}>بدء توزيع الأدوار 🎴</PrimaryButton>
        <GhostButton onClick={handleRandomFill}>🎲 أسماء عشوائية</GhostButton>
        <GhostButton onClick={onBack}>رجوع</GhostButton>
      </div>
    </ScreenShell>
  );
}