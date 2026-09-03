import type { GameSettings, RoleId } from "./types";

export interface RoleInfo {
  id: RoleId;
  name: string;
  emoji: string;
  team: "mafia" | "citizens";
  short: string;
  description: string;
  color: string;
  soft: string;
}

export const ROLES: Record<RoleId, RoleInfo> = {
  mafia: {
    id: "mafia",
    name: "المافيا",
    emoji: "🔪",
    team: "mafia",
    short: "اقضِ على المواطنين ليلًا دون أن يُكشف أمرك",
    description:
      "كل ليلة تختارون معًا لاعبًا واحدًا لإخراجه من اللعبة. مهمتكم ألا يعرف أحد هويتكم، وأن تصبحوا أكثر عددًا من المواطنين.",
    color: "#f87171",
    soft: "rgba(248,113,113,0.13)",
  },
  citizen: {
    id: "citizen",
    name: "مواطن",
    emoji: "👤",
    team: "citizens",
    short: "اكتشف المافيا وصوّت عليها",
    description:
      "ليس لديك قدرة خاصة، لكن صوتك مهم. راقب تصرفات الجميع وناقش واستنتج من المافيا ثم صوّت لإخراجها.",
    color: "#a8b3c5",
    soft: "rgba(168,179,197,0.1)",
  },
  detective: {
    id: "detective",
    name: "المحقق",
    emoji: "🕵️",
    team: "citizens",
    short: "افحص لاعبًا كل ليلة لتعرف حقيقته",
    description:
      "كل ليلة تختار لاعبًا واحدًا لفحصه، وسيعرف الهاتف وحدك ما إذا كان من المافيا. استخدم المعلومة بذكاء ولا تكشف نفسك بسرعة.",
    color: "#38bdf8",
    soft: "rgba(56,189,248,0.12)",
  },
  doctor: {
    id: "doctor",
    name: "الطبيب",
    emoji: "❤️",
    team: "citizens",
    short: "احمِ لاعبًا واحدًا كل ليلة",
    description:
      "كل ليلة تختار لاعبًا واحدًا لتحميه من المافيا. إذا كان هو الهدف المستهدف، فلن يخرج أحد من اللعبة تلك الليلة.",
    color: "#4ade80",
    soft: "rgba(74,222,128,0.12)",
  },
  jester: {
    id: "jester",
    name: "المهرج",
    emoji: "🤡",
    team: "citizens",
    short: "اجعل الجميع يصوّتون عليك",
    description:
      "دورك غريب: تريد أن يُصوَّت عليك وتُخرج بالتصويت النهاري! أثِر الشكوك حولك بطريقة ذكية دون أن يكتشف أحد نيتك. إذا أُخرجت بالتصويت فزت وحدك بالمباراة.",
    color: "#c084fc",
    soft: "rgba(192,132,252,0.13)",
  },
};

export const ROLE_ORDER: RoleId[] = ["mafia", "detective", "doctor", "jester", "citizen"];

export function shuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Number of mafia members for a given player count. */
export function mafiaCountFor(playerCount: number): number {
  if (playerCount <= 7) return 2;
  if (playerCount <= 10) return 3;
  if (playerCount <= 14) return 4;
  return 5;
}

export function buildRoleDeck(playerCount: number, rules: GameSettings): RoleId[] {
  const deck: RoleId[] = [];
  for (let i = 0; i < mafiaCountFor(playerCount); i++) deck.push("mafia");
  if (rules.detectiveEnabled) deck.push("detective");
  if (rules.doctorEnabled) deck.push("doctor");
  if (rules.jesterEnabled) deck.push("jester");
  while (deck.length < playerCount) deck.push("citizen");
  return shuffle(deck);
}