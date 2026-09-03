import type { GameSettings, RoleId } from "./types";

export interface RoleInfo {
  id: RoleId;
  name: string;
  emoji: string;
  team: "mafia" | "citizens";
  short: string;
  /** Short description shown on the secret role-reveal card. */
  brief: string;
  description: string;
  color: string;
  soft: string;
}

export const ROLES: Record<RoleId, RoleInfo> = {
  mafia: {
    id: "mafia",
    name: "مافيا",
    emoji: "🔪",
    team: "mafia",
    short: "اقضِ على المواطنين ليلًا دون أن يُكشف أمرك",
    brief: "تعمل مع المافيا الأخرى للقضاء على المواطنين أثناء الليل.",
    description:
      "كل ليلة تختارون معًا لاعبًا واحدًا لإخراجه من اللعبة. مهمتكم ألا يعرف أحد هويتكم، وأن تواصلوا القتل ليلًا حتى لا يتبقى سوى لاعب واحد من غير المافيا.",
    color: "#f87171",
    soft: "rgba(248,113,113,0.13)",
  },
  citizen: {
    id: "citizen",
    name: "مواطن",
    emoji: "👤",
    team: "citizens",
    short: "اكتشف المافيا وصوّت عليها",
    brief: "ليس لديك قدرة ليلية. حاول اكتشاف المافيا من خلال النقاش والتصويت.",
    description:
      "ليس لديك قدرة خاصة، لكن صوتك مهم. راقب تصرفات الجميع وناقش واستنتج من المافيا ثم صوّت لإخراجها.",
    color: "#a8b3c5",
    soft: "rgba(168,179,197,0.1)",
  },
  detective: {
    id: "detective",
    name: "محقق",
    emoji: "🕵️",
    team: "citizens",
    short: "افحص لاعبًا كل ليلة لتعرف حقيقته",
    brief: "يمكنك التحقيق في لاعب أثناء الليل لمعرفة ما إذا كان من المافيا.",
    description:
      "كل ليلة تختار لاعبًا واحدًا لفحصه، وسيعرف الهاتف وحدك ما إذا كان من المافيا. استخدم المعلومة بذكاء ولا تكشف نفسك بسرعة.",
    color: "#38bdf8",
    soft: "rgba(56,189,248,0.12)",
  },
  doctor: {
    id: "doctor",
    name: "طبيب",
    emoji: "❤️",
    team: "citizens",
    short: "احمِ لاعبًا واحدًا كل ليلة",
    brief: "يمكنك حماية لاعب أثناء الليل.",
    description:
      "كل ليلة تختار لاعبًا واحدًا لتحميه من المافيا. إذا كان هو الهدف المستهدف، فلن يخرج أحد من اللعبة تلك الليلة.",
    color: "#4ade80",
    soft: "rgba(74,222,128,0.12)",
  },
  jester: {
    id: "jester",
    name: "مهرج",
    emoji: "🤡",
    team: "citizens",
    short: "اجعل الجميع يصوّتون عليك",
    brief: "هدفك أن يتم إخراجك عن طريق التصويت أثناء النهار.",
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

/** Largest mafia count that still makes sense for a player count: the game
 *  must start with more non-mafia than mafia (so parity is never true at the
 *  very first check), and there has to be room left for the other roles. */
export function maxMafiaCount(playerCount: number): number {
  return Math.max(1, Math.floor((playerCount - 1) / 2));
}

/** Recommended (standard) mafia count for a player count — used whenever the
 *  host has not chosen a custom count. Matches the classic distribution. */
export function recommendedMafiaCount(playerCount: number): number {
  return Math.min(mafiaCountFor(playerCount), maxMafiaCount(playerCount));
}

/** The mafia count the deck will actually deal for these rules:
 *  an explicit host choice wins (clamped to a valid range), otherwise the
 *  recommended count for the player count is used. Never random. */
export function effectiveMafiaCount(
  playerCount: number,
  rules: Pick<GameSettings, "mafiaCount"> | undefined,
): number {
  const max = maxMafiaCount(playerCount);
  const explicit = rules?.mafiaCount;
  if (typeof explicit === "number" && Number.isFinite(explicit) && explicit >= 1) {
    return Math.max(1, Math.min(Math.floor(explicit), max));
  }
  return recommendedMafiaCount(playerCount);
}

export function buildRoleDeck(playerCount: number, rules: GameSettings): RoleId[] {
  const deck: RoleId[] = [];
  // Deal exactly the chosen mafia count (or the recommended one when null).
  const mafia = effectiveMafiaCount(playerCount, rules);
  for (let i = 0; i < mafia; i++) deck.push("mafia");
  if (rules.detectiveEnabled) deck.push("detective");
  if (rules.doctorEnabled) deck.push("doctor");
  if (rules.jesterEnabled) deck.push("jester");
  while (deck.length < playerCount) deck.push("citizen");
  return shuffle(deck);
}