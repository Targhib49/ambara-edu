"use client";

import Link from "next/link";
import type { SubmissionStatus } from "@/generated/prisma/enums";
import { DataTable, type Column, type Tab } from "@/components/ui/DataTable";
import { SUBMISSION_STATUS_BADGE_CLASS, submissionStatusKey } from "@/lib/quiz/format";
import { ScoreRing } from "@/components/quiz/ScoreRing";
import { badgeColorForKey, initialsFor } from "@/lib/ui/palette";
import { useT } from "@/lib/i18n/client";
import type { Translate } from "@/lib/i18n/translate";

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

const makeTabs = (t: Translate): Tab<StudentQuizRow>[] => [
  { key: "all", label: t("status.all"), match: () => true },
  { key: "todo", label: t("status.notStarted"), match: (q) => q.status === null },
  { key: "done", label: t("status.completed"), match: (q) => q.status !== null },
  { key: "tryout", label: t("quizList.tab.chapterTests"), match: (q) => q.lessonTitle === null },
  { key: "lesson", label: t("quizList.tab.fromLessons"), match: (q) => q.lessonTitle !== null },
];

const statusLabel = (q: StudentQuizRow, t: Translate) =>
  q.status ? t(submissionStatusKey(q.status)) : t("status.notStarted");

const makeColumns = (t: Translate): Column<StudentQuizRow>[] => [
  {
    key: "title",
    header: t("quizList.header.quiz"),
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
            {statusLabel(q, t)} · {q.lessonTitle ?? t("quizList.chapterTest")} ·{" "}
            {t("quizList.questions", { n: q.questionCount })}
            {q.scorePct !== null && ` · ${Math.round(q.scorePct)}%`}
          </span>
        </span>
      </div>
    ),
  },
  {
    key: "from",
    header: t("quizList.header.from"),
    sort: (q) => `${q.trackTitle ?? ""} ${q.lessonTitle ?? ""}`.toLowerCase(),
    text: (q) => [q.trackTitle, q.chapterTitle, q.lessonTitle ?? t("quizList.chapterTest")].filter(Boolean).join(" › "),
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
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700">{t("quizList.chapterTest")}</span>
          <span className="mt-1 block truncate text-xs text-zinc-400">{[q.trackTitle, q.chapterTitle].filter(Boolean).join(" › ")}</span>
        </span>
      ),
  },
  {
    key: "details",
    header: t("quizList.header.details"),
    sort: (q) => q.questionCount,
    text: (q) =>
      [
        t("quizList.questions", { n: q.questionCount }),
        `${q.totalPoints} pts`,
        q.timeLimitMinutes ? t("quizList.minutes", { n: q.timeLimitMinutes }) : null,
        q.attemptsRemaining !== null ? t("quizList.attemptsLeft", { n: q.attemptsRemaining }) : null,
      ]
        .filter(Boolean)
        .join(", "),
    hideBelow: "xl",
    className: "whitespace-nowrap text-xs",
    cell: (q) => (
      <span className="text-zinc-500">
        <span className="block">{t("quizList.questionsPoints", { n: q.questionCount, points: q.totalPoints })}</span>
        {(q.timeLimitMinutes || q.attemptsRemaining !== null) && (
          <span className="block">
            {q.timeLimitMinutes && `⏱ ${t("quizList.minutes", { n: q.timeLimitMinutes })}`}
            {q.timeLimitMinutes && q.attemptsRemaining !== null && " · "}
            {q.attemptsRemaining !== null && t("quizList.attemptsLeft", { n: q.attemptsRemaining })}
          </span>
        )}
      </span>
    ),
  },
  {
    key: "status",
    header: t("quizList.header.status"),
    sort: (q) => statusLabel(q, t),
    text: (q) => statusLabel(q, t),
    hideBelow: "xl",
    cell: (q) => (
      <span
        className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
          q.status ? SUBMISSION_STATUS_BADGE_CLASS[q.status] : "bg-zinc-100 text-zinc-600"
        }`}
      >
        {statusLabel(q, t)}
      </span>
    ),
  },
  {
    key: "score",
    header: t("quizList.header.score"),
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
            {t("quizList.start")}
          </Link>
        )}
      </div>
    ),
  },
];

export function QuizList({ quizzes }: { quizzes: StudentQuizRow[] }) {
  const t = useT();
  return (
    <DataTable
      rows={quizzes}
      columns={makeColumns(t)}
      rowKey={(q) => q.id}
      rowHref={(q) => `/quizzes/${q.id}`}
      tabs={makeTabs(t)}
      search={{ placeholder: t("quizList.search"), of: (q) => `${q.title} ${q.trackTitle ?? ""} ${q.chapterTitle ?? ""} ${q.lessonTitle ?? ""}` }}
      initialSort={{ key: "title", dir: "asc" }}
      minWidth="560px"
      empty={{ title: t("quizList.empty"), hint: t("quizList.emptyHint") }}
    />
  );
}
