"use client";

import { useEffect, useState, useTransition } from "react";
import { recordLessonView, setLessonComplete } from "@/lib/actions/progress";

/**
 * Completion toggle for a lesson, and the thing that records the visit.
 *
 * The view ping runs from an effect rather than the page's render so opening a
 * lesson doesn't write to the database during server rendering. It is
 * deliberately fire-and-forget: if it fails, the student is still reading their
 * lesson, and a failed bookkeeping call is not worth interrupting that for.
 */
export function LessonCompletion({
  lessonId,
  initialComplete,
}: {
  lessonId: string;
  initialComplete: boolean;
}) {
  const [complete, setComplete] = useState(initialComplete);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    void recordLessonView(lessonId).catch(() => {});
  }, [lessonId]);

  const toggle = () =>
    startTransition(async () => {
      const next = !complete;
      try {
        await setLessonComplete(lessonId, next);
        setComplete(next);
      } catch {
        // Leave the button as it was — the student can try again.
      }
    });

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-white px-5 py-4">
      {complete ? (
        <>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-green-700">
            <CheckCircle /> Completed
          </span>
          <button
            onClick={toggle}
            disabled={pending}
            className="ml-auto text-xs text-zinc-500 hover:text-zinc-800 hover:underline disabled:opacity-50"
          >
            {pending ? "Saving…" : "Mark as not complete"}
          </button>
        </>
      ) : (
        <>
          <span className="text-sm text-zinc-600">Finished this lesson?</span>
          <button
            onClick={toggle}
            disabled={pending}
            className="ml-auto rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Mark as complete"}
          </button>
        </>
      )}
    </div>
  );
}

function CheckCircle() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}
