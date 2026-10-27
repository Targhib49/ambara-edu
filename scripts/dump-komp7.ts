/** Prints every Kompetisi Kelas 7 question as JSON, for scripts/check-komp7.py. */
import { KOMP7_LATIHAN } from "./content/komp7-latihan";
import { KOMP7_SIMULASI } from "./content/komp7-simulasi";

const out = [...KOMP7_LATIHAN, KOMP7_SIMULASI].flatMap((c) =>
  c.quizzes.map((q) => ({
    chapter: c.chapterTitle,
    quiz: q.title,
    style: q.style,
    settings: q.settings ?? null,
    questions: q.questions.map((x) => ({ type: x.type, points: x.points, answer: "answer" in x ? x.answer : null, answerMarks: "answerMarks" in x ? x.answerMarks : null, rubric: "rubric" in x ? x.rubric.reduce((n, r) => n + r.marks, 0) : null, options: "options" in x ? x.options : null })),
  }))
);
console.log(JSON.stringify(out));
