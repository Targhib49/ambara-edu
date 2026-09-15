"use client";

import Link from "next/link";
import type { SubmissionStatus } from "@/generated/prisma/enums";
import { DataTable, type Column, type Tab } from "@/components/ui/DataTable";
import { SUBMISSION_STATUS_BADGE_CLASS, SUBMISSION_STATUS_LABEL } from "@/lib/quiz/format";
import { ScoreRing } from "@/components/quiz/ScoreRing";
import { badgeColorForKey, initialsFor } from "@/lib/ui/palette";

export type StudentQuizRow = {
  id: string;
  title: string;
  lessonTitle: string | null;
  trackTitle: string | null;
  /** Set for every quiz; a quiz with no lesson is the chapter's own test. */
  chapterTitle: string | null;
  questionCount: number;
  totalPoints: number;
  timeLimitMinutes: number | null;
  attemptsRemaining: number | null;
  status: SubmissionStatus | null;
  scorePct: number | null;
};

const TABS: Tab<StudentQuizRow>[] = [
  { key: "all", label: "All", match: () => true },
  { key: "todo", label: "Not started", match: (q) => q.status === null },
  { key: "done", label: "Completed", match: (q) => q.status !== null },
  { key: "tryout", label: "Chapter tests", match: (q) => q.lessonTitle === null },
  { key: "lesson", label: "From lessons", match: (q) => q.lessonTitle !== null },
];

const statusLabel = (q: StudentQuizRow) => (q.status ? SUBMISSION_STATUS_LABEL[q.status] : "Not started");

const COLUMNS: Column<StudentQuizRow>[] = [
  {
    key: "title",
    header: "Quiz",
    sort: (q) => q.title.toLowerCase(),
    text: (q) => q.title,
    className: "min-w-[200px]",
    cell: (q) => (
      <div className="flex items-center gap-3">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-semibold ${badgeColorForKey(q.trackTitle ?? q.title)}`}>
          {initialsFor(q.title) || "Q"}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-medium text-zinc-900">{q.title}</span>
          {/* The columns below are hidden on a phone — fold the essentials under the title. */}
          <span className="block truncate text-xs text-zinc-500 sm:hidden">
            {statusLabel(q)} · {q.lessonTitle ?? "Chapter test"} · {q.questionCount} questions
            {q.scorePct !== null && ` · ${Math.round(q.scorePct)}%`}
          </span>
        </span>
      </div>
    ),
  },
  {
    key: "from",
    header: "Where it's from",
    sort: (q) => `${q.trackTitle ?? ""} ${q.lessonTitle ?? ""}`.toLowerCase(),
    text: (q) => [q.trackTitle, q.chapterTitle, q.lessonTitle ?? "Chapter test"].filter(Boolean).join(" › "),
    hideBelow: "lg",
    className: "min-w-[180px]",
    cell: (q) =>
      q.lessonTitle ? (
        <span className="block max-w-[240px]">
          <span className="block truncate text-zinc-700">{q.lessonTitle}</span>
          {q.trackTitle && <span className="block truncate text-xs text-zinc-400">{q.trackTitle}</span>}
        </span>
      ) : (
        <span className="block max-w-[240px]">
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700">Chapter test</span>
          <span className="mt-1 block truncate text-xs text-zinc-400">{[q.trackTitle, q.chapterTitle].filter(Boolean).join(" › ")}</span>
        </span>
      ),
  },
  {
    key: "details",
    header: "Details",
    sort: (q) => q.questionCount,
    text: (q) =>
      [
        `${q.questionCount} questions`,
        `${q.totalPoints} pts`,
        q.timeLimitMinutes ? `${q.timeLimitMinutes} min` : null,
        q.attemptsRemaining !== null ? `${q.attemptsRemaining} attempts left` : null,
      ]
        .filter(Boolean)
        .join(", "),
    hideBelow: "xl",
    className: "whitespace-nowrap text-xs",
    cell: (q) => (
      <span className="text-zinc-500">
        <span className="block">
          {q.questionCount} questions · {q.totalPoints} pts
        </span>
        {(q.timeLimitMinutes || q.attemptsRemaining !== null) && (
          <span className="block">
            {q.timeLimitMinutes && `⏱ ${q.timeLimitMinutes} min`}
            {q.timeLimitMinutes && q.attemptsRemaining !== null && " · "}
            {q.attemptsRemaining !== null && `${q.attemptsRemaining} attempt${q.attemptsRemaining === 1 ? "" : "s"} left`}
          </span>
        )}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    sort: (q) => statusLabel(q),
    text: statusLabel,
    hideBelow: "xl",
    cell: (q) => (
      <span
        className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
          q.status ? SUBMISSION_STATUS_BADGE_CLASS[q.status] : "bg-zinc-100 text-zinc-600"
        }`}
      >
        {statusLabel(q)}
      </span>
    ),
  },
  {
    key: "score",
    header: "Score",
    align: "right",
    sort: (q) => q.scorePct ?? -1,
    text: (q) => (q.scorePct === null ? "" : `${Math.round(q.scorePct)}%`),
    cell: (q) => (
      <div className="flex justify-end">
        {q.scorePct !== null ? (
          <ScoreRing pct={q.scorePct} size={38} />
        ) : (
          <Link
            href={`/quizzes/${q.id}`}
            className="whitespace-nowrap rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
          >
            Start →
          </Link>
        )}
      </div>
    ),
  },
];

export function QuizList({ quizzes }: { quizzes: StudentQuizRow[] }) {
  return (
    <DataTable
      rows={quizzes}
      columns={COLUMNS}
      rowKey={(q) => q.id}
      rowHref={(q) => `/quizzes/${q.id}`}
      tabs={TABS}
      search={{ placeholder: "Search quizzes", of: (q) => `${q.title} ${q.trackTitle ?? ""} ${q.chapterTitle ?? ""} ${q.lessonTitle ?? ""}` }}
      initialSort={{ key: "title", dir: "asc" }}
      minWidth="560px"
      empty={{ title: "No quizzes yet", hint: "They'll appear here as your lessons add them." }}
    />
  );
}
