"use client";

import { useMemo, useState } from "react";
import { DRILL_DEFAULTS, DRILL_SKILLS, parseDrillSkill } from "@/lib/drills/registry";
import Link from "next/link";
import { DataTable, type Column, type Tab } from "@/components/ui/DataTable";
import { Combobox } from "@/components/ui/Combobox";
import { controlCls } from "@/components/ui/styles";
import { QuizStyleChip } from "@/components/quiz/QuizStyleField";
import { QUIZ_STYLES, isGradedStyle, quizStyleKey } from "@/lib/quiz/styles";
import type { QuizStyle } from "@/generated/prisma/enums";
import { useT } from "@/lib/i18n/client";
import type { Translate } from "@/lib/i18n/translate";

export type TutorQuizRow = {
  id: string;
  title: string;
  isDraft: boolean;
  style: QuizStyle;
  drillSkill: string | null;
  drillSeconds: number | null;
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
  /** Practice styles: students who have finished a run. */
  practiceCompletions: number;
  pendingCount: number;
  createdAt: string;
};

type CourseFilter = { id: string; title: string; chapters: { id: string; title: string }[] };

const makeTabs = (t: Translate): Tab<TutorQuizRow>[] => [
  { key: "all", label: t("status.all"), match: () => true },
  { key: "published", label: t("quizTable.published"), match: (q) => !q.isDraft },
  { key: "draft", label: t("quizTable.drafts"), match: (q) => q.isDraft },
  { key: "review", label: t("quizTable.needsReview"), match: (q) => q.pendingCount > 0 },
];

const makeColumns = (t: Translate): Column<TutorQuizRow>[] => [
  {
    key: "title",
    header: t("quizTable.quiz"),
    sort: (q) => q.title.toLowerCase(),
    text: (q) => q.title,
    className: "min-w-[220px]",
    cell: (q) => (
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Link href={`/tutor/quizzes/${q.id}`} className="font-medium text-zinc-900 hover:text-blue-700">
          {q.title}
        </Link>
        <QuizStyleChip style={q.style} />
        {q.isDraft && <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">{t("status.draft")}</span>}
      </span>
    ),
  },
  {
    key: "placement",
    header: t("quizTable.placement"),
    sort: (q) => q.placementSort,
    text: (q) => [q.courseTitle, q.chapterTitle, q.lessonTitle ?? t("courseEditor.endOfChapter")].filter(Boolean).join(" › "),
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
            <span className="font-medium text-violet-700">{t("courseEditor.endOfChapter")}</span>
          )}
        </span>
      </span>
    ),
  },
  {
    key: "questions",
    header: t("quizTable.questions"),
    sort: (q) => q.questionCount,
    text: (q) => q.questionCount,
    className: "whitespace-nowrap tabular-nums",
    cell: (q) =>
      q.style === "DRILL" ? (
        // A drill generates its questions, so show what it drills instead of a count.
        <span className="block">
          <span className="block">{t(DRILL_SKILLS[parseDrillSkill(q.drillSkill)].labelKey)}</span>
          <span className="block text-xs text-zinc-500">
            {t("drill.secondsLeft", { s: q.drillSeconds ?? DRILL_DEFAULTS.drillSeconds })}
          </span>
        </span>
      ) : (
      <span className="block">
        <span className="block">
          {q.questionCount}
          <span className="text-zinc-400"> · {t("quizTable.pts", { n: q.totalPoints })}</span>
        </span>
        <span className="block text-xs text-zinc-500">
          {[
            q.timeLimitMinutes ? t("count.minutes", { n: q.timeLimitMinutes }) : null,
            q.maxAttempts ? t(q.maxAttempts === 1 ? "quizTable.attempt" : "quizTable.attempts", { n: q.maxAttempts }) : null,
          ]
            .filter(Boolean)
            .join(" · ") || t("quizTable.untimed")}
        </span>
      </span>
      ),
  },
  {
    key: "format",
    header: t("quizTable.format"),
    text: (q) =>
      [
        q.timeLimitMinutes ? t("count.minutes", { n: q.timeLimitMinutes }) : "",
        q.maxAttempts ? t("quizTable.attempts", { n: q.maxAttempts }) : "",
      ]
        .filter(Boolean)
        .join(", ") || t("quizTable.untimed"),
    csvOnly: true,
    cell: () => null,
  },
  {
    key: "results",
    header: t("quizTable.results"),
    sort: (q) => q.pendingCount * 10000 + q.submissionCount,
    text: (q) =>
      isGradedStyle(q.style)
        ? t("quizTable.resultsText", { n: q.submissionCount, p: q.pendingCount })
        : t("quizTable.practiceDone", { n: q.practiceCompletions }),
    className: "whitespace-nowrap",
    cell: (q) =>
      !isGradedStyle(q.style) ? (
        <span className="text-emerald-700">{t("quizTable.practiceDone", { n: q.practiceCompletions })}</span>
      ) : (
      <span className="flex items-center gap-2">
        <span className="tabular-nums">{q.submissionCount}</span>
        {q.pendingCount > 0 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">{t("quizTable.toReview", { n: q.pendingCount })}</span>
        )}
      </span>
      ),
  },
  {
    key: "createdAt",
    header: t("quizTable.created"),
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
  const t = useT();
  const [courseId, setCourseId] = useState(initialCourseId ?? "");
  const [chapterId, setChapterId] = useState("");
  const [kind, setKind] = useState<"" | "lesson" | "chapter">("");
  const [style, setStyle] = useState<"" | QuizStyle>("");

  const course = courses.find((c) => c.id === courseId) ?? null;
  const rows = useMemo(
    () =>
      quizzes.filter(
        (q) =>
          (!courseId || q.courseId === courseId) &&
          (!chapterId || q.chapterId === chapterId) &&
          (!kind || (kind === "lesson" ? q.lessonTitle !== null : q.lessonTitle === null)) &&
          (!style || q.style === style)
      ),
    [quizzes, courseId, chapterId, kind, style]
  );

  return (
    <DataTable
      // Remount on filter change so paging starts again from the first page.
      key={`${courseId}|${chapterId}|${kind}|${style}`}
      rows={rows}
      columns={makeColumns(t)}
      rowKey={(q) => q.id}
      rowHref={(q) => `/tutor/quizzes/${q.id}`}
      tabs={makeTabs(t)}
      search={{ placeholder: t("quizTable.search"), of: (q) => `${q.title} ${q.courseTitle ?? ""} ${q.chapterTitle ?? ""} ${q.lessonTitle ?? ""}` }}
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
              placeholder={t("quizTable.allCourses")}
              aria-label={t("quizTable.filterCourse")}
            />
          </div>
          <select
            value={chapterId}
            onChange={(e) => setChapterId(e.target.value)}
            disabled={!course}
            aria-label={t("quizTable.filterChapter")}
            className={`${controlCls} w-48 disabled:text-zinc-400`}
          >
            <option value="">{course ? t("quizTable.allChapters") : t("quizTable.pickCourseFirst")}</option>
            {course?.chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.title}
              </option>
            ))}
          </select>
          <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} aria-label={t("quizTable.filterKind")} className={`${controlCls} w-44`}>
            <option value="">{t("quizTable.anyPosition")}</option>
            <option value="lesson">{t("quizTable.afterLesson")}</option>
            <option value="chapter">{t("courseEditor.endOfChapter")}</option>
          </select>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as typeof style)}
            aria-label={t("quizStyle.filter")}
            className={`${controlCls} w-40`}
          >
            <option value="">{t("quizStyle.anyStyle")}</option>
            {QUIZ_STYLES.map((s) => (
              <option key={s} value={s}>
                {t(quizStyleKey(s))}
              </option>
            ))}
          </select>
        </div>
      }
      initialSort={{ key: courseId ? "placement" : "createdAt", dir: courseId ? "asc" : "desc" }}
      exportName="quizzes"
      minWidth="760px"
      empty={{ title: t("quizTable.empty"), hint: t("quizTable.emptyHint") }}
    />
  );
}
