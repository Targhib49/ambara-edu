"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DataTable, type Column, type Tab } from "@/components/ui/DataTable";
import { Combobox } from "@/components/ui/Combobox";
import { controlCls } from "@/components/ui/styles";

export type TutorQuizRow = {
  id: string;
  title: string;
  isDraft: boolean;
  courseId: string | null;
  courseTitle: string | null;
  chapterId: string | null;
  chapterTitle: string | null;
  /** The lesson it follows, or null for a chapter test at the end of the chapter. */
  lessonTitle: string | null;
  placementSort: string;
  questionCount: number;
  totalPoints: number;
  timeLimitMinutes: number | null;
  maxAttempts: number | null;
  submissionCount: number;
  pendingCount: number;
  createdAt: string;
};

type CourseFilter = { id: string; title: string; chapters: { id: string; title: string }[] };

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
    className: "min-w-[220px]",
    cell: (q) => (
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Link href={`/tutor/quizzes/${q.id}`} className="font-medium text-zinc-900 hover:text-blue-700">
          {q.title}
        </Link>
        {q.isDraft && <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">Draft</span>}
      </span>
    ),
  },
  {
    key: "placement",
    header: "In the syllabus",
    sort: (q) => q.placementSort,
    text: (q) => [q.courseTitle, q.chapterTitle, q.lessonTitle ?? "End of chapter"].filter(Boolean).join(" › "),
    className: "min-w-[220px]",
    cell: (q) => (
      <span className="block max-w-[300px]">
        <span className="block truncate text-zinc-800">{q.courseTitle ?? "—"}</span>
        <span className="block truncate text-xs text-zinc-500">
          {q.chapterTitle}
          {" › "}
          {q.lessonTitle ? (
            q.lessonTitle
          ) : (
            <span className="font-medium text-violet-700">End of chapter</span>
          )}
        </span>
      </span>
    ),
  },
  {
    key: "questions",
    header: "Questions",
    sort: (q) => q.questionCount,
    text: (q) => q.questionCount,
    className: "whitespace-nowrap tabular-nums",
    cell: (q) => (
      <span className="block">
        <span className="block">
          {q.questionCount}
          <span className="text-zinc-400"> · {q.totalPoints} pts</span>
        </span>
        <span className="block text-xs text-zinc-500">
          {[q.timeLimitMinutes ? `${q.timeLimitMinutes} min` : null, q.maxAttempts ? `${q.maxAttempts} attempt${q.maxAttempts === 1 ? "" : "s"}` : null]
            .filter(Boolean)
            .join(" · ") || "Untimed"}
        </span>
      </span>
    ),
  },
  {
    key: "format",
    header: "Format",
    text: (q) =>
      [q.timeLimitMinutes ? `${q.timeLimitMinutes} min` : "", q.maxAttempts ? `${q.maxAttempts} attempts` : ""].filter(Boolean).join(", ") || "Untimed",
    csvOnly: true,
    cell: () => null,
  },
  {
    key: "results",
    header: "Results",
    sort: (q) => q.pendingCount * 10000 + q.submissionCount,
    text: (q) => `${q.submissionCount} (${q.pendingCount} to review)`,
    className: "whitespace-nowrap",
    cell: (q) => (
      <span className="flex items-center gap-2">
        <span className="tabular-nums">{q.submissionCount}</span>
        {q.pendingCount > 0 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">{q.pendingCount} to review</span>
        )}
      </span>
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

export function QuizTable({
  quizzes,
  courses,
  initialCourseId,
}: {
  quizzes: TutorQuizRow[];
  courses: CourseFilter[];
  initialCourseId?: string;
}) {
  const [courseId, setCourseId] = useState(initialCourseId ?? "");
  const [chapterId, setChapterId] = useState("");
  const [kind, setKind] = useState<"" | "lesson" | "chapter">("");

  const course = courses.find((c) => c.id === courseId) ?? null;
  const rows = useMemo(
    () =>
      quizzes.filter(
        (q) =>
          (!courseId || q.courseId === courseId) &&
          (!chapterId || q.chapterId === chapterId) &&
          (!kind || (kind === "lesson" ? q.lessonTitle !== null : q.lessonTitle === null))
      ),
    [quizzes, courseId, chapterId, kind]
  );

  return (
    <DataTable
      // Remount on filter change so paging starts again from the first page.
      key={`${courseId}|${chapterId}|${kind}`}
      rows={rows}
      columns={COLUMNS}
      rowKey={(q) => q.id}
      rowHref={(q) => `/tutor/quizzes/${q.id}`}
      tabs={TABS}
      search={{ placeholder: "Search quizzes", of: (q) => `${q.title} ${q.courseTitle ?? ""} ${q.chapterTitle ?? ""} ${q.lessonTitle ?? ""}` }}
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-56">
            <Combobox
              options={courses.map((c) => ({ value: c.id, label: c.title }))}
              value={courseId}
              onChange={(v) => {
                setCourseId(v);
                setChapterId("");
              }}
              placeholder="All courses"
              aria-label="Filter by course"
            />
          </div>
          <select
            value={chapterId}
            onChange={(e) => setChapterId(e.target.value)}
            disabled={!course}
            aria-label="Filter by chapter"
            className={`${controlCls} w-48 disabled:text-zinc-400`}
          >
            <option value="">{course ? "All chapters" : "Pick a course first"}</option>
            {course?.chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.title}
              </option>
            ))}
          </select>
          <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} aria-label="Filter by kind" className={`${controlCls} w-44`}>
            <option value="">Any position</option>
            <option value="lesson">After a lesson</option>
            <option value="chapter">End of chapter</option>
          </select>
        </div>
      }
      initialSort={{ key: courseId ? "placement" : "createdAt", dir: courseId ? "asc" : "desc" }}
      exportName="quizzes"
      minWidth="760px"
      empty={{ title: "No quizzes yet", hint: "Create one with “New quiz”, or import questions from a sheet." }}
    />
  );
}
