"use client";

import { useActionState } from "react";
import { createQuiz, type CreateQuizState } from "@/lib/actions/quizzes";
import { QuizPlacementFields } from "@/components/quiz/QuizPlacementFields";
import { useSlideOver } from "@/components/ui/SlideOver";
import { btnPrimary, btnSecondary, hintCls, inputCls, labelCls } from "@/components/ui/styles";
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
  const panel = useSlideOver();
  const [state, formAction, pending] = useActionState<CreateQuizState, FormData>(createQuiz, {});

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className={labelCls} htmlFor="quiz-title">
          Title
        </label>
        <input id="quiz-title" name="title" required placeholder="e.g. Try Out — Bab 3: Perbandingan" className={inputCls} />
      </div>

      <QuizPlacementFields tree={tree} defaultCourseId={defaultCourseId} defaultChapterId={defaultChapterId} defaultLessonId={defaultLessonId} />

      <p className={hintCls}>Starts as a draft, so students don&rsquo;t see it until you publish it.</p>
      {state.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
        {panel && (
          <button type="button" onClick={panel.close} className={btnSecondary}>
            Cancel
          </button>
        )}
        <button disabled={pending} className={btnPrimary}>
          {pending ? "Creating…" : "Create and add questions"}
        </button>
      </div>
    </form>
  );
}
