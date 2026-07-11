"use client";

import { useState, useTransition } from "react";
import { reviewSubmission } from "@/lib/actions/quizzes";
import type { SubmissionStatus } from "@/generated/prisma/enums";

export function ReviewForm({
  submissionId,
  autoScore,
  totalPoints,
  manualScore,
  feedback,
  status,
}: {
  submissionId: string;
  autoScore: number;
  totalPoints: number;
  manualScore: number | null;
  feedback: string;
  status: SubmissionStatus;
}) {
  const [pending, startTransition] = useTransition();
  const [score, setScore] = useState(String(manualScore ?? ""));
  const [note, setNote] = useState(feedback);
  const [saved, setSaved] = useState(false);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="mb-3 font-medium">Review</h2>
      <p className="mb-3 text-sm text-zinc-600">
        Auto-graded so far: <strong>{autoScore}</strong> / {totalPoints} points.
        {status === "REVIEWED" && " Already reviewed — you can update it below."}
      </p>
      <label className="mb-1 block text-xs font-medium text-zinc-500">
        Additional points for manually-reviewed questions
      </label>
      <input
        type="number"
        value={score}
        onChange={(e) => {
          setScore(e.target.value);
          setSaved(false);
        }}
        min={0}
        step="any"
        className="w-32 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
      <label className="mb-1 mt-3 block text-xs font-medium text-zinc-500">Feedback for the student</label>
      <textarea
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setSaved(false);
        }}
        rows={3}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await reviewSubmission(submissionId, Number(score) || 0, note);
            setSaved(true);
          })
        }
        className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {pending ? "Saving…" : saved ? "Saved ✓" : "Save review"}
      </button>
    </div>
  );
}
