import { ROLES, ROLE_ORDER } from "@/game/roles";
import { GhostButton, RoleCard, ScreenShell, SectionTitle } from "./ui";

const PHASES = [
  {
    emoji: "🌙",
    title: "الليل",
    text: "أغمضوا أعينكم. تستيقظ الأدوار الخاصة واحدًا تلو الآخر: المافيا تختار هدفها، الطبيب يحمي لاعبًا، والمحقق يفحص لاعبًا. مرّروا الهاتف سرًا.",
  },
  {
    emoji: "☀️",
    title: "النهار",
    text: "يستيقظ الجميع ليعرفوا من خرج أثناء الليل (إن خرج أحد). تُعلن النتيجة فقط — لا تُكشف الأدوار إلا إذا فعّلت القاعدة.",
  },
  {
    emoji: "🗣️",
    title: "النقاش",
    text: "أهم مرحلة! ناقشوا تصرفات الجميع، اتهموا، دافعوا، وخادعوا. المافيا تحاول توجيه الشك نحو الأبرياء.",
  },
  {
    emoji: "🗳️",
    title: "التصويت",
    text: "يصوّت كل لاعب سرًا ضد من يشتبه فيه. اللاعب الذي يحصل على أكبر عدد من الأصوات يخرج من اللعبة.",
  },
  {
    emoji: "🏆",
    title: "الفوز",
    text: "يفوز المواطنون عند إخراج كل المافيا من اللعبة. تفوز المافيا فقط عندما تصل إلى السيطرة الكاملة ولا يبقى سوى لاعب واحد من غير المافيا. قتل لاعب واحد أثناء الليل لا ينهي المباراة — تستمر جولة بعد جولة حتى يتحقق الفوز الحقيقي. وإذا أُخرج المهرج بالتصويت فاز وحده بالمباراة! 🎭",
  },
];

const RULES = [
  "لا يُسمح بالتصويت على النفس.",
  "اللاعب الخارج من اللعبة لا يصوّت ولا يستخدم قدرته، لكنه يشاهد فقط. 👻",
  "لا تكشف دورك لأي لاعب آخر — لا بالكلام ولا بتصرفاتك.",
  "المحقق يعرف نتيجة الفحص وحده، والمافيا تعرف زملاءها فقط.",
  "المهرج يفوز فقط إذا أُخرج بالتصويت النهاري — لا تكشفوا دوره حتى لا يحقق هدفه.",
  "مرّر الهاتف بصدق ولا تتجسس على أدوار الآخرين.",
];

export default function HowToScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScreenShell className="game-scroll">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-3 text-sm font-bold text-muted-foreground hover:text-foreground"
        >
          → رجوع
        </button>
        <h1 className="text-2xl font-black">طريقة اللعب</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          لعبة اجتماعية تعتمد على النقاش والخداع والاستنتاج. الجميع على هاتف واحد،
          يمررونه سرًا في كل مرحلة.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>مراحل اللعبة</SectionTitle>
        {PHASES.map((p, i) => (
          <div
            key={p.title}
            className="flex gap-3 rounded-xl border border-white/10 bg-card/70 p-4"
          >
            <span className="text-3xl">{p.emoji}</span>
            <div className="flex-1">
              <p className="text-sm font-extrabold">
                {i + 1}. {p.title}
              </p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">{p.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>الأدوار</SectionTitle>
        {ROLE_ORDER.map((roleId) => (
          <RoleCard key={roleId} roleId={roleId} className="p-4 text-start">
            <p className="mt-1 text-xs font-bold" style={{ color: ROLES[roleId].color }}>
              {ROLES[roleId].short}
            </p>
          </RoleCard>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        <SectionTitle>قواعد مهمة</SectionTitle>
        <div className="flex flex-col gap-2">
          {RULES.map((r) => (
            <p key={r} className="rounded-xl border border-white/10 bg-card/70 px-4 py-3 text-xs leading-6 text-muted-foreground">
              • {r}
            </p>
          ))}
        </div>
      </div>

      <GhostButton onClick={onBack}>رجوع إلى القائمة</GhostButton>
    </ScreenShell>
  );
}