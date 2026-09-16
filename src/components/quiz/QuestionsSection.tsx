"use client";

import { useState } from "react";
import { QuestionEditor, type QuestionForEdit } from "@/components/quiz/QuestionEditor";
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
};

/**
 * One card per question, collapsed by default (a quiz can easily have 25 of
 * these — always-open forms would be unusable). A freshly-added question
 * still carrying its placeholder prompt ("New question") starts expanded so
 * the tutor can fill it in immediately without an extra click.
 */
export function QuestionsSection({ questions }: { questions: QuestionForEdit[] }) {
  const t = useT();
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(questions.filter((q) => q.prompt === "New question").map((q) => q.id))
  );

  function toggle(id: string) {
    setExpanded((prev) => {
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
    <div className="space-y-3">
      {questions.map((q, i) => {
        const isExpanded = expanded.has(q.id);
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
                <span className="shrink-0 text-xs text-zinc-400">
                  {t(q.points === 1 ? "qSection.pt" : "quizTable.pts", { n: q.points })}
                </span>
                <span className="shrink-0 text-xs text-zinc-400">{isExpanded ? "▲" : "▼"}</span>
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
            {isExpanded ? (
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
  );
}
