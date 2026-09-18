"use client";

import { useState } from "react";
import { PracticeQuizContext, QuestionEditor, type QuestionForEdit } from "@/components/quiz/QuestionEditor";
import { MESSAGES } from "@/lib/i18n/messages";
import { deleteQuestion, moveQuestion } from "@/lib/actions/quizzes";
import { formatCorrectAnswer } from "@/lib/quiz/format";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useT } from "@/lib/i18n/client";
import type { MessageKey } from "@/lib/i18n/messages";
import type { QuestionType } from "@/generated/prisma/enums";

const smallBtn =
  "rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 disabled:opacity-40";

const TYPE_KEYS: Record<QuestionType, MessageKey> = {
  MULTIPLE_CHOICE: "questionType.MULTIPLE_CHOICE",
  MULTI_SELECT: "questionType.MULTI_SELECT",
  NUMERIC: "questionType.NUMERIC",
  SHORT_TEXT: "questionType.SHORT_TEXT",
  CODE: "questionType.CODE",
  STEPS: "questionType.STEPS",
  MULTI_PART: "questionType.MULTI_PART",
  FIND_MISTAKE: "questionType.FIND_MISTAKE",
  PROJECT_STEP: "questionType.PROJECT_STEP",
};

/**
 * One card per question, collapsed by default (a quiz can easily have 25 of
 * these — always-open forms would be unusable). A freshly-added question
 * still carrying its placeholder prompt ("New question") starts expanded so
 * the tutor can fill it in immediately without an extra click.
 */
/** The placeholder a new question starts with, in either language. */
const NEW_QUESTION_PROMPTS: string[] = [MESSAGES["qEditor.newQuestion"].ID, MESSAGES["qEditor.newQuestion"].EN];

export function QuestionsSection({ questions, practice = false }: { questions: QuestionForEdit[]; practice?: boolean }) {
  const t = useT();
  // Questions whose open/closed state the tutor flipped. A question still
  // carrying its placeholder prompt starts open — including one added after the
  // page loaded — so it can be filled in without an extra click.
  const [toggled, setToggled] = useState<Set<string>>(() => new Set());
  const isExpanded = (q: QuestionForEdit) => NEW_QUESTION_PROMPTS.includes(q.prompt) !== toggled.has(q.id);

  function toggle(id: string) {
    setToggled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (questions.length === 0) {
    return <p className="text-sm text-zinc-500">{t("qSection.empty")}</p>;
  }

  return (
    <PracticeQuizContext.Provider value={practice}>
    <div className="space-y-3">
      {questions.map((q, i) => {
        const expanded = isExpanded(q);
        return (
          <div key={q.id} className="rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                type="button"
                onClick={() => toggle(q.id)}
                className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
              >
                <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
                  Q{i + 1}
                </span>
                <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {t(TYPE_KEYS[q.type])}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-zinc-900">{q.prompt}</span>
                {!practice && (
                  <span className="shrink-0 text-xs text-zinc-400">
                    {t(q.points === 1 ? "qSection.pt" : "quizTable.pts", { n: q.points })}
                  </span>
                )}
                <span className="shrink-0 text-xs text-zinc-400">{expanded ? "▲" : "▼"}</span>
              </button>
              <div className="flex shrink-0 gap-1.5">
                <form action={moveQuestion.bind(null, q.id, "up")}>
                  <SubmitButton pendingLabel="" className={smallBtn} disabled={i === 0} title={t("lessonEditor.moveUp")}>↑</SubmitButton>
                </form>
                <form action={moveQuestion.bind(null, q.id, "down")}>
                  <SubmitButton pendingLabel="" className={smallBtn} disabled={i === questions.length - 1} title={t("lessonEditor.moveDown")}>↓</SubmitButton>
                </form>
                <form action={deleteQuestion.bind(null, q.id)}>
                  <ConfirmButton message={t("qSection.deleteConfirm")} className={`${smallBtn} text-red-600`}>
                    {t("action.delete")}
                  </ConfirmButton>
                </form>
              </div>
            </div>
            {expanded ? (
              <div className="border-t border-zinc-100 p-4">
                <QuestionEditor question={q} />
              </div>
            ) : (
              <p className="border-t border-zinc-100 px-4 py-2 text-xs text-zinc-500">
                {t("qSection.correct", { answer: formatCorrectAnswer(q.type, q.correctAnswer, q.options) })}
              </p>
            )}
          </div>
        );
      })}
    </div>
    </PracticeQuizContext.Provider>
  );
}
