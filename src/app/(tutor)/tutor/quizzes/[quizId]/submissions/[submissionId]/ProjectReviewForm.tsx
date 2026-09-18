"use client";

import { useState, useTransition } from "react";
import { reviewProject } from "@/lib/actions/projects";
import { useT } from "@/lib/i18n/client";

/**
 * Reviewing a finished project: the tutor sets the final score itself, from
 * zero to the project's total, starting from the current one. Unlike a quiz
 * review, it can go down as well as up.
 */
export function ProjectReviewForm({
  submissionId,
  autoScore,
  currentScore,
  totalPoints,
  feedback,
  reviewed,
}: {
  submissionId: string;
  autoScore: number;
  currentScore: number;
  totalPoints: number;
  feedback: string;
  reviewed: boolean;
}) {
  const t = useT();
  const [pending, startTransition] = useTransition();
  const [score, setScore] = useState(String(currentScore));
  const [note, setNote] = useState(feedback);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const save = () =>
    startTransition(async () => {
      const result = await reviewProject(submissionId, Number(score), note);
      setMessage("error" in result ? { ok: false, text: result.error } : { ok: true, text: t("qEditor.saved") });
    });

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="mb-2 font-medium">{t("review.title")}</h2>
      <p className="mb-3 text-sm text-zinc-600">
        {t("projectReview.autoLine", { score: autoScore, total: totalPoints })}
        {reviewed && ` ${t("reviewForm.alreadyReviewed")}`}
      </p>
      <label htmlFor="project-final" className="mb-1 block text-xs font-medium text-zinc-500">
        {t("projectReview.finalScore", { total: totalPoints })}
      </label>
      <input
        id="project-final"
        type="number"
        value={score}
        min={0}
        max={totalPoints}
        step="any"
        onChange={(e) => {
          setScore(e.target.value);
          setMessage(null);
        }}
        className="w-32 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
      <label htmlFor="project-feedback" className="mb-1 mt-3 block text-xs font-medium text-zinc-500">
        {t("review.feedback")}
      </label>
      <textarea
        id="project-feedback"
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setMessage(null);
        }}
        rows={3}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {pending ? t("action.saving") : t("review.save")}
        </button>
        {message && <span className={`text-sm ${message.ok ? "text-green-700" : "text-red-600"}`}>{message.text}</span>}
      </div>
    </div>
  );
}
