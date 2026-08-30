"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SubmissionStatus } from "@/generated/prisma/enums";
import { SUBMISSION_STATUS_BADGE_CLASS, SUBMISSION_STATUS_LABEL } from "@/lib/quiz/format";
import { ScoreRing } from "@/components/quiz/ScoreRing";
import { badgeColorForKey, initialsFor } from "@/lib/ui/palette";

export type StudentQuizRow = {
  id: string;
  title: string;
  lessonTitle: string | null;
  trackTitle: string | null;
  questionCount: number;
  totalPoints: number;
  timeLimitMinutes: number | null;
  attemptsRemaining: number | null;
  status: SubmissionStatus | null;
  scorePct: number | null;
};

type Filter = "all" | "todo" | "done" | "tryout" | "lesson";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "todo", label: "Not started" },
  { key: "done", label: "Completed" },
  { key: "tryout", label: "Try-outs" },
  { key: "lesson", label: "From lessons" },
];

function matches(row: StudentQuizRow, filter: Filter) {
  switch (filter) {
    case "all":
      return true;
    case "todo":
      return row.status === null;
    case "done":
      return row.status !== null;
    case "tryout":
      return row.lessonTitle === null;
    case "lesson":
      return row.lessonTitle !== null;
  }
}

export function QuizList({ quizzes }: { quizzes: StudentQuizRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(
    () =>
      Object.fromEntries(
        FILTERS.map((f) => [f.key, quizzes.filter((q) => matches(q, f.key)).length])
      ) as Record<Filter, number>,
    [quizzes]
  );

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return quizzes.filter((q) => {
      if (!matches(q, filter)) return false;
      if (!needle) return true;
      return [q.title, q.lessonTitle, q.trackTitle]
        .filter(Boolean)
        .some((s) => s!.toLowerCase().includes(needle));
    });
  }, [quizzes, filter, query]);

  if (quizzes.length === 0) {
    return <p className="text-sm text-zinc-500">No quizzes available yet.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filter === f.key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50"
              }`}
            >
              {f.label}
              <span className={filter === f.key ? "ml-1.5 opacity-70" : "ml-1.5 text-zinc-400"}>
                {counts[f.key]}
              </span>
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="ml-auto w-full min-w-0 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none sm:w-48"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-400">
            <tr>
              <th className="w-[34%] px-4 py-3 font-medium">Quiz</th>
              <th className="hidden w-[21%] px-4 py-3 font-medium sm:table-cell">Where it’s from</th>
              <th className="hidden w-[20%] px-4 py-3 font-medium md:table-cell">Details</th>
              <th className="hidden w-[13%] px-4 py-3 font-medium sm:table-cell">Status</th>
              <th className="w-[12%] px-4 py-3 text-right font-medium">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((q) => (
              <tr
                key={q.id}
                onClick={() => router.push(`/quizzes/${q.id}`)}
                className="cursor-pointer transition hover:bg-blue-50/40"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-semibold ${badgeColorForKey(q.trackTitle ?? q.title)}`}
                    >
                      {initialsFor(q.title) || "Q"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <Link
                        href={`/quizzes/${q.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block truncate font-medium text-zinc-900 hover:text-blue-700"
                      >
                        {q.title}
                      </Link>
                      {/* On narrow screens the source/details columns are hidden —
                          fold the essentials under the title instead. */}
                      <span className="block truncate text-xs text-zinc-500 sm:hidden">
                        {q.status ? SUBMISSION_STATUS_LABEL[q.status] : "Not started"} ·{" "}
                        {q.lessonTitle ?? "Try-out"} · {q.questionCount} questions
                        {q.timeLimitMinutes ? ` · ⏱ ${q.timeLimitMinutes} min` : ""}
                      </span>
                    </span>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-zinc-600 sm:table-cell">
                  {q.lessonTitle ? (
                    <span className="block truncate">
                      {q.lessonTitle}
                      {q.trackTitle && (
                        <span className="block truncate text-xs text-zinc-400">{q.trackTitle}</span>
                      )}
                    </span>
                  ) : (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
                      ⚡ Open anytime
                    </span>
                  )}
                </td>
                <td className="hidden px-4 py-3 text-xs whitespace-nowrap text-zinc-500 md:table-cell">
                  <span className="block">
                    {q.questionCount} questions · {q.totalPoints} pts
                  </span>
                  {(q.timeLimitMinutes || q.attemptsRemaining !== null) && (
                    <span className="block">
                      {q.timeLimitMinutes && `⏱ ${q.timeLimitMinutes} min`}
                      {q.timeLimitMinutes && q.attemptsRemaining !== null && " · "}
                      {q.attemptsRemaining !== null &&
                        `${q.attemptsRemaining} attempt${q.attemptsRemaining === 1 ? "" : "s"} left`}
                    </span>
                  )}
                </td>
                <td className="hidden px-4 py-3 text-xs sm:table-cell">
                  {q.status ? (
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${SUBMISSION_STATUS_BADGE_CLASS[q.status]}`}
                    >
                      {SUBMISSION_STATUS_LABEL[q.status]}
                    </span>
                  ) : (
                    <span className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                      Not started
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    {q.scorePct !== null ? (
                      <ScoreRing pct={q.scorePct} size={38} />
                    ) : (
                      <Link
                        href={`/quizzes/${q.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white hover:bg-blue-500"
                      >
                        Start →
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">No quizzes match that filter.</p>
        )}
      </div>
    </div>
  );
}
