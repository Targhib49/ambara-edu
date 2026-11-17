/** Prints every level-path question of the olympiad course as JSON, for scripts/check-olim-levels.py. */
import { LV_ALJABAR } from "./content/olim-lv-alj";
import { LV_TEORI_BILANGAN } from "./content/olim-lv-tb";
import { LV_KOMBINATORIKA } from "./content/olim-lv-kom";
import { LV_GEOMETRI } from "./content/olim-lv-geo";
import type { Question } from "./content/math-types";

const answerOf = (q: Question) => {
  switch (q.type) {
    case "STEPS":
      return q.steps.map((s) => s.answer);
    case "MULTI_PART":
      return q.parts.map((p) => p.answer);
    case "FIND_MISTAKE":
      return q.wrongIndex;
    case "CODE":
      return null;
    default:
      return q.answer;
  }
};

const out = [LV_ALJABAR, LV_TEORI_BILANGAN, LV_KOMBINATORIKA, LV_GEOMETRI].flatMap((c) =>
  [...c.levels.flatMap((l) => l.quizzes), ...c.closing].map((quiz) => ({
    quiz: quiz.title,
    style: quiz.style,
    questions: quiz.questions.map((q) => ({ type: q.type, answer: answerOf(q), options: "options" in q ? q.options : null })),
  }))
);
console.log(JSON.stringify(out));
