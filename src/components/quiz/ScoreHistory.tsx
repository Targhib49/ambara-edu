"use client";

import { formatSessionTime } from "@/lib/sessions/format";
import type { SubmissionStatus } from "@/generated/prisma/enums";
import { SUBMISSION_STATUS_BADGE_CLASS, SUBMISSION_STATUS_LABEL } from "@/lib/quiz/format";

type AttemptRow = {
  attemptNumber: number;
  autoScore: number | null;
  manualScore: number | null;
  status: SubmissionStatus;
  submittedAt: string;
};

function scoreLabel(row: { autoScore: number | null; manualScore: number | null; status: SubmissionStatus }, totalPoints: number) {
  const score =
    row.status === "REVIEWED" ? (row.autoScore ?? 0) + (row.manualScore ?? 0) : row.autoScore ?? 0;
  return `${score} / ${totalPoints}`;
}

/**
 * Client component (dates must format in the student's timezone, not the
 * server's). Shows the live submission as the latest attempt plus the
 * snapshots taken before each retake.
 */
export function ScoreHistory({
  attempts,
  current,
  totalPoints,
}: {
  attempts: AttemptRow[]; // newest first
  current: AttemptRow | null; // the live submission, shown on top
  totalPoints: number;
}) {
  const rows = current ? [current, ...attempts] : attempts;
  if (rows.length <= 1) return null; // history is only interesting with 2+ attempts

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="text-sm font-medium text-zinc-700">Score history</h2>
      <ul className="mt-3 divide-y divide-zinc-100">
        {rows.map((row, i) => (
          <li key={`${row.attemptNumber}-${row.submittedAt}`} className="flex flex-wrap items-center gap-3 py-2 text-sm">
            <span className="w-20 text-zinc-500">
              Attempt {row.attemptNumber}
              {i === 0 && <span className="ml-1 text-xs text-blue-600">(latest)</span>}
            </span>
            <span className="font-mono font-medium text-zinc-800">{scoreLabel(row, totalPoints)}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${SUBMISSION_STATUS_BADGE_CLASS[row.status]}`}
            >
              {SUBMISSION_STATUS_LABEL[row.status]}
            </span>
            <span className="ml-auto text-xs text-zinc-400">{formatSessionTime(row.submittedAt)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
