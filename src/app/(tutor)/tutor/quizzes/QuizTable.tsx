"use client";

import Link from "next/link";
import { DataTable, type Column, type Tab } from "@/components/ui/DataTable";
import { badgeColorForKey, initialsFor } from "@/lib/ui/palette";

export type TutorQuizRow = {
  id: string;
  title: string;
  isDraft: boolean;
  /** Lesson it hangs off, or null for a standalone try-out. */
  lessonTitle: string | null;
  trackTitle: string | null;
  questionCount: number;
  totalPoints: number;
  timeLimitMinutes: number | null;
  maxAttempts: number | null;
  submissionCount: number;
  pendingCount: number;
  createdAt: string;
};

const TABS: Tab<TutorQuizRow>[] = [
  { key: "all", label: "All", match: () => true },
  { key: "published", label: "Published", match: (q) => !q.isDraft },
  { key: "draft", label: "Drafts", match: (q) => q.isDraft },
  { key: "review", label: "Needs review", match: (q) => q.pendingCount > 0 },
];

const COLUMNS: Column<TutorQuizRow>[] = [
  {
    key: "title",
    header: "Quiz",
    sort: (q) => q.title.toLowerCase(),
    text: (q) => q.title,
    className: "min-w-[240px]",
    cell: (q) => (
      <div className="flex items-center gap-3">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-semibold ${badgeColorForKey(q.title)}`}>
          {initialsFor(q.title) || "Q"}
        </span>
        <span className="min-w-0">
          <Link href={`/tutor/quizzes/${q.id}`} className="block font-medium text-zinc-900 hover:text-blue-700">
            {q.title}
          </Link>
          {q.isDraft && (
            <span className="mt-0.5 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
              Draft
            </span>
          )}
        </span>
      </div>
    ),
  },
  {
    key: "attached",
    header: "Attached to",
    sort: (q) => (q.lessonTitle ?? "").toLowerCase(),
    text: (q) => (q.lessonTitle ? `${q.lessonTitle}${q.trackTitle ? ` (${q.trackTitle})` : ""}` : "Try-out"),
    cell: (q) =>
      q.lessonTitle ? (
        <span>
          <span className="block text-zinc-700">{q.lessonTitle}</span>
          {q.trackTitle && <span className="block text-xs text-zinc-400">{q.trackTitle}</span>}
        </span>
      ) : (
        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700">Try-out</span>
      ),
  },
  {
    key: "questions",
    header: "Questions",
    sort: (q) => q.questionCount,
    text: (q) => q.questionCount,
    className: "whitespace-nowrap tabular-nums",
    cell: (q) => (
      <span>
        {q.questionCount}
        <span className="text-zinc-400"> · {q.totalPoints} pts</span>
      </span>
    ),
  },
  {
    key: "format",
    header: "Format",
    text: (q) =>
      [q.timeLimitMinutes ? `${q.timeLimitMinutes} min` : "", q.maxAttempts ? `${q.maxAttempts} attempts` : ""]
        .filter(Boolean)
        .join(", ") || "Untimed",
    className: "whitespace-nowrap text-xs",
    cell: (q) =>
      q.timeLimitMinutes || q.maxAttempts ? (
        <span className="text-zinc-500">
          {q.timeLimitMinutes && <span className="block">⏱ {q.timeLimitMinutes} min</span>}
          {q.maxAttempts && (
            <span className="block">
              {q.maxAttempts} attempt{q.maxAttempts === 1 ? "" : "s"}
            </span>
          )}
        </span>
      ) : (
        <span className="text-zinc-400">Untimed</span>
      ),
  },
  {
    key: "submissions",
    header: "Submissions",
    sort: (q) => q.submissionCount,
    text: (q) => q.submissionCount,
    align: "right",
    className: "tabular-nums",
    cell: (q) => q.submissionCount,
  },
  {
    key: "pending",
    header: "Needs review",
    sort: (q) => q.pendingCount,
    text: (q) => q.pendingCount,
    cell: (q) =>
      q.pendingCount > 0 ? (
        <Link
          href={`/tutor/quizzes/${q.id}`}
          className="inline-block whitespace-nowrap rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 hover:bg-amber-200"
        >
          {q.pendingCount} to grade →
        </Link>
      ) : (
        <span className="text-zinc-400">—</span>
      ),
  },
  {
    key: "createdAt",
    header: "Created",
    sort: (q) => q.createdAt,
    text: (q) => q.createdAt.slice(0, 10),
    className: "whitespace-nowrap tabular-nums text-xs",
    cell: (q) => q.createdAt.slice(0, 10),
  },
];

export function QuizTable({ quizzes }: { quizzes: TutorQuizRow[] }) {
  return (
    <DataTable
      rows={quizzes}
      columns={COLUMNS}
      rowKey={(q) => q.id}
      tabs={TABS}
      search={{
        placeholder: "Search quiz, lesson or course",
        of: (q) => `${q.title} ${q.lessonTitle ?? ""} ${q.trackTitle ?? ""}`,
      }}
      initialSort={{ key: "createdAt", dir: "desc" }}
      exportName="quizzes"
      minWidth="900px"
      empty={{ title: "No quizzes yet", hint: "Create one above, or import from CSV below." }}
    />
  );
}
