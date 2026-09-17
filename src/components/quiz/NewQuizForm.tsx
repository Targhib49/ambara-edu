"use client";

import { useActionState, useState } from "react";
import type { QuizStyle } from "@/generated/prisma/enums";
import { createQuiz, type CreateQuizState } from "@/lib/actions/quizzes";
import { QuizPlacementFields } from "@/components/quiz/QuizPlacementFields";
import { QuizStyleField } from "@/components/quiz/QuizStyleField";
import { useSlideOver } from "@/components/ui/SlideOver";
import { btnPrimary, btnSecondary, hintCls, inputCls, labelCls } from "@/components/ui/styles";
import { useT } from "@/lib/i18n/client";
import type { PlacementCourse } from "@/lib/courses/placement";

/**
 * Lives in the "New quiz" panel. Only what's needed to place the quiz — the
 * questions, time limit and attempts are set on the quiz's own page, which this
 * opens straight after.
 */
export function NewQuizForm({
  tree,
  defaultCourseId,
  defaultChapterId,
  defaultLessonId,
}: {
  tree: PlacementCourse[];
  defaultCourseId?: string;
  defaultChapterId?: string;
  defaultLessonId?: string;
}) {
  const t = useT();
  const panel = useSlideOver();
  const [style, setStyle] = useState<QuizStyle>("CLASSIC");
  const [state, formAction, pending] = useActionState<CreateQuizState, FormData>(createQuiz, {});

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className={labelCls} htmlFor="quiz-title">
          {t("courseEditor.title")}
        </label>
        <input id="quiz-title" name="title" required placeholder={t("newQuiz.titlePlaceholder")} className={inputCls} />
      </div>

      <QuizPlacementFields tree={tree} defaultCourseId={defaultCourseId} defaultChapterId={defaultChapterId} defaultLessonId={defaultLessonId} />

      <QuizStyleField value={style} onChange={setStyle} />

      <p className={hintCls}>{t("newQuiz.hint")}</p>
      {state.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
        {panel && (
          <button type="button" onClick={panel.close} className={btnSecondary}>
            {t("action.cancel")}
          </button>
        )}
        <button disabled={pending} className={btnPrimary}>
          {pending ? t("action.creating") : style === "DRILL" ? t("drill.createCta") : t("newQuiz.create")}
        </button>
      </div>
    </form>
  );
}
