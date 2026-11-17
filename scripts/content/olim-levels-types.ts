/**
 * Shapes and builders for the olympiad course's three-level path ("Jalur
 * Bertingkat"), read by scripts/setup-olim-levels.ts. Each topic chapter of
 * "Persiapan Olimpiade Matematika SMP" opens with three level lessons — the
 * Junior Path module pages for that level plus its quizzes — before the
 * existing MS²C sessions.
 *
 * Prompts and explanations may hold $…$ maths (MathText renders it). Step
 * prompts, part prompts and find-the-mistake lines are shown as plain text,
 * so they use Unicode maths only.
 */
import type { ChapterQuiz, Letter, Question } from "./math-types";

export type Level = {
  /** "Level 1: Mengenal Pembagi" — the lesson title, also how apply finds it again. */
  title: string;
  /** Folder in the shared Buku directory holding <dir>/<dir>.pdf. */
  pdfDir: string;
  /** File name students see. */
  pdfName: string;
  intro: string;
  quizzes: ChapterQuiz[];
};

export type LevelChapter = {
  /** The existing MS²C chapter the levels open. */
  chapterTitle: string;
  levels: [Level, Level, Level];
  /** Chapter-level quizzes added after the existing closing tests. */
  closing: ChapterQuiz[];
};

// ---------------------------------------------------------------- builders

export const num = (prompt: string, answer: number, explanation: string, points = 1): Question => ({ type: "NUMERIC", prompt, answer, explanation, points });
export const frac = (prompt: string, answer: string, explanation: string, points = 1): Question => ({ type: "FRACTION", prompt, answer, explanation, points });
export const mc = (prompt: string, options: string[], answer: Letter, explanation: string, points = 1): Question => ({ type: "MULTIPLE_CHOICE", prompt, options, answer, explanation, points });
export const ms = (prompt: string, options: string[], answer: Letter[], explanation: string, points = 1): Question => ({ type: "MULTI_SELECT", prompt, options, answer, explanation, points });
export const steps = (prompt: string, list: [string, string][], explanation: string, points = list.length): Question => ({
  type: "STEPS",
  prompt,
  steps: list.map(([p, answer]) => ({ prompt: p, answer })),
  explanation,
  points,
});
export const parts = (prompt: string, list: [string, string, number?][], explanation: string): Question => {
  const withMarks = list.map(([p, answer, marks]) => ({ prompt: p, answer, marks: marks ?? 1 }));
  return { type: "MULTI_PART", prompt, parts: withMarks, explanation, points: withMarks.reduce((n, x) => n + x.marks, 0) };
};
/** One wrong line, which the student picks; no written correction to match. */
export const mistake = (prompt: string, lines: string[], wrongIndex: number, explanation: string, points = 2): Question => ({
  type: "FIND_MISTAKE",
  prompt: `${prompt} Pilih baris pertama yang salah.`,
  lines,
  wrongIndex,
  correction: "",
  explanation,
  points,
});
export const worked = (
  prompt: string,
  answer: string,
  answerMarks: number,
  rubric: [string, number][],
  solution: string,
  explanation = ""
): Question => ({
  type: "WORKED",
  prompt,
  answer,
  answerMarks,
  rubric: rubric.map(([point, marks]) => ({ point, marks })),
  solution,
  explanation,
  points: answerMarks + rubric.reduce((n, [, m]) => n + m, 0),
});

// ---------------------------------------------------------------- quizzes

export const FRAC = "Tulis pecahan sebagai a/b paling sederhana, misalnya 3/4.";
export const BIG = "Tulis tanpa titik pemisah ribuan.";

export const langkah = (where: string, questions: Question[]): ChapterQuiz => ({ title: `Langkah demi Langkah — ${where}`, style: "MASTERY", questions });
export const latihan = (where: string, questions: Question[]): ChapterQuiz => ({ title: `Latihan — ${where}`, style: "MASTERY", questions });
export const drill = (where: string, label: string, skill: string, seconds = 90, target = 10): ChapterQuiz => ({
  title: `Drill ${label} — ${where}`,
  style: "DRILL",
  settings: { drillSkill: skill, drillSeconds: seconds, drillTarget: target },
  questions: [],
});
export const uji = (where: string, last: boolean, questions: Question[]): ChapterQuiz => ({
  title: `${last ? "Uji Tuntas" : "Uji Naik Level"} — ${where}`,
  style: "CLASSIC",
  questions,
});
export const review = (chapter: string, count = 10): ChapterQuiz => ({
  title: `Review Campuran — ${chapter}`,
  style: "REVIEW",
  settings: { reviewCount: count },
  questions: [],
});

const LEVEL_LINE = ["●○○ · setara materi sekolah kelas 7–8", "●●○ · setara OSN kabupaten/kota", "●●● · setara OSN provinsi/nasional, termasuk soal uraian pembuktian"];

/** The lesson's opening text: what the level is and the order to work through it. */
export function levelIntro(n: 1 | 2 | 3, topics: string, hasDrill: boolean): string {
  const next = n < 3 ? `skor **80 atau lebih** berarti kamu siap naik ke **Level ${n + 1}**.` : "skor **80 atau lebih** berarti kamu siap lanjut ke sesi **Pendalaman** di bawah. Soal uraiannya dinilai tutor dari prosesnya.";
  const items = [
    "**Langkah demi Langkah** — soal yang dipecah menjadi langkah, seperti tanya jawab di modul.",
    "**Latihan** — sepuluh soal yang langsung dicek. Ulangi sampai semuanya benar.",
    ...(hasDrill ? ["**Drill** — ronde cepat melawan waktu untuk melancarkan hitungan."] : []),
    `**${n < 3 ? "Uji Naik Level" : "Uji Tuntas"}** — ${next}`,
  ];
  return [
    `**Level ${n}** — ${LEVEL_LINE[n - 1]}`,
    `Isi: ${topics}.`,
    "Cara belajar: baca setiap Contoh, lalu **tutup dulu baris J** dan coba jawab pertanyaan **T** sendiri sebelum melihat jawabannya. Setelah itu kerjakan berurutan:",
    items.map((s, i) => `${i + 1}. ${s}`).join("\n"),
    "Kunci jawaban latihan modul ada di halaman terakhir PDF.",
  ].join("\n\n");
}
