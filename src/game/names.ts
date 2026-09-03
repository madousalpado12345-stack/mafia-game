import { shuffle } from "./roles";

export const ARABIC_NAMES = [
  "أحمد",
  "محمد",
  "علي",
  "سامي",
  "خالد",
  "يوسف",
  "عمر",
  "حسن",
  "طارق",
  "فهد",
  "زيد",
  "ماجد",
  "وليد",
  "بدر",
  "أنس",
  "إبراهيم",
  "عبد الله",
  "هشام",
  "رامي",
  "ناصر",
  "ليلى",
  "سارة",
  "ريم",
  "هند",
  "مريم",
  "عائشة",
  "فاطمة",
  "دانة",
  "نور",
  "لمى",
  "جود",
  "شهد",
  "ديما",
  "لينا",
  "رنا",
  "سلوى",
  "آية",
  "مي",
  "غادة",
  "أمل",
];

/** Returns `count` unique random Arabic names (falls back to numbered names). */
export function randomNames(count: number): string[] {
  const pool = shuffle(ARABIC_NAMES);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(pool[i % pool.length] ?? `اللاعب ${i + 1}`);
  }
  return out;
}