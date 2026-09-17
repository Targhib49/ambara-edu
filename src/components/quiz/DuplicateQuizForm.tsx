"use client";

import { useActionState } from "react";
import { duplicateQuiz, type DuplicateQuizState } from "@/lib/actions/quizzes";
import { QuizPlacementFields } from "@/components/quiz/QuizPlacementFields";
import { QuizStyleField } from "@/components/quiz/QuizStyleField";
import { useSlideOver } from "@/components/ui/SlideOver";
import { btnPrimary, btnSecondary, hintCls, inputCls, labelCls } from "@/components/ui/styles";
import { useT } from "@/lib/i18n/client";
import type { PlacementCourse } from "@/lib/courses/placement";
import type { QuizStyle } from "@/generated/prisma/enums";

/**
 * Lives in the "Duplicate as…" panel on a quiz's page. Starts from the
 * original's placement and suggests a different style, since reusing the same
 * questions in another style is what this is for.
 */
export function DuplicateQuizForm({
  sourceQuizId,
  defaultTitle,
  defaultStyle,
  tree,
  chapterId,
  lessonId,
}: {
  sourceQuizId: string;
  defaultTitle: string;
  defaultStyle: QuizStyle;
  tree: PlacementCourse[];
  chapterId: string;
  lessonId: string | null;
}) {
  const t = useT();
  const panel = useSlideOver();
  const [state, formAction, pending] = useActionState<DuplicateQuizState, FormData>(
    duplicateQuiz.bind(null, sourceQuizId),
    {}
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className={labelCls} htmlFor="duplicate-title">
          {t("courseEditor.title")}
        </label>
        <input id="duplicate-title" name="title" required defaultValue={defaultTitle} className={inputCls} />
      </div>

      <QuizStyleField defaultStyle={defaultStyle} />

      <QuizPlacementFields tree={tree} defaultChapterId={chapterId} defaultLessonId={lessonId} />

      <p className={hintCls}>{t("newQuiz.hint")}</p>
      {state.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
        {panel && (
          <button type="button" onClick={panel.close} className={btnSecondary}>
            {t("action.cancel")}
          </button>
        )}
        <button disabled={pending} className={btnPrimary}>
          {pending ? t("action.creating") : t("quizDuplicate.submit")}
        </button>
      </div>
    </form>
  );
}
