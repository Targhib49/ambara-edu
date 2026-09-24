import Link from "next/link";
import { DRILL_SKILLS, parseDrillSkill } from "@/lib/drills/registry";
import { isGradedStyle } from "@/lib/quiz/styles";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { updateCourse, deleteCourse, setCourseStatus } from "@/lib/actions/courses";
import { createChapter, renameChapter, deleteChapter, moveChapter } from "@/lib/actions/chapters";
import { createLesson, deleteLesson, moveLesson, setLessonStatus } from "@/lib/actions/lessons";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { PageHeader, PageTabs } from "@/components/ui/PageHeader";
import { SlideOverButton } from "@/components/ui/SlideOver";
import { ClipboardIcon } from "@/components/ui/icons";
import { CourseCoverForm } from "@/components/courses/CourseCoverForm";
import { CourseFacetFields } from "@/components/courses/NewCourseForm";
import { CourseStudentsTable, EnrollStudentsForm, type CourseStudentRow } from "@/components/courses/CourseStudents";
import { NewQuizForm } from "@/components/quiz/NewQuizForm";
import { facetSuggestions } from "@/lib/courses/facets";
import { studentOptions } from "@/lib/students/options";
import type { PlacementCourse } from "@/lib/courses/placement";
import { btnDanger, btnPrimary, btnSecondary, btnSmall, cardCls, hintCls, inputCls, labelCls } from "@/components/ui/styles";
import { getT } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/messages";
import type { Translate } from "@/lib/i18n/translate";
import type { CourseStatus, QuizStyle } from "@/generated/prisma/enums";
import { QuizStyleChip } from "@/components/quiz/QuizStyleField";

const quizSelect = {
  id: true,
  title: true,
  status: true,
  style: true,
  drillSkill: true,
  timeLimitMinutes: true,
  _count: {
    select: {
      questions: true,
      submissions: true,
      practiceProgress: { where: { completedAt: { not: null } } },
    },
  },
} as const;

type QuizSummary = {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  style: QuizStyle;
  drillSkill: string | null;
  timeLimitMinutes: number | null;
  _count: { questions: number; submissions: number; practiceProgress: number };
};

const STATUS_KEYS: Record<CourseStatus, MessageKey> = {
  DRAFT: "courseStatus.DRAFT",
  PUBLISHED: "courseStatus.PUBLISHED",
  ARCHIVED: "courseStatus.ARCHIVED",
};
const STATUS_PILL: Record<CourseStatus, string> = {
  DRAFT: "bg-amber-100 text-amber-800",
  PUBLISHED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-zinc-200 text-zinc-700",
};

/** Indonesian has no plural form, so both keys hold the same ID text. */
const count = (t: Translate, n: number, one: MessageKey, many: MessageKey) => t(n === 1 ? one : many, { n });

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

async function loadCourse(courseId: string) {
  return db.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      description: true,
      subject: true,
      curriculum: true,
      level: true,
      status: true,
      coverImagePath: true,
      access: true,
      _count: { select: { enrollments: true } },
      chapters: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          _count: { select: { quizzes: true } },
          lessons: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, status: true, quizzes: { orderBy: { createdAt: "asc" }, select: quizSelect } },
          },
          // The chapter's own assessments: quizzes not tied to one lesson.
          quizzes: { where: { lessonId: null }, orderBy: { createdAt: "asc" }, select: quizSelect },
        },
      },
    },
  });
}
type Course = NonNullable<Awaited<ReturnType<typeof loadCourse>>>;

export default async function CourseEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { courseId } = await params;
  const { tab: requested } = await searchParams;
  const tab = requested === "students" || requested === "settings" ? requested : "syllabus";
  const t = await getT();

  const course = await loadCourse(courseId);
  if (!course) notFound();

  const base = `/tutor/courses/${course.id}`;
  const lessonCount = course.chapters.reduce((n, ch) => n + ch.lessons.length, 0);
  const quizCount = course.chapters.reduce((n, ch) => n + ch._count.quizzes, 0);
  const facets = [course.subject, course.curriculum, course.level].filter(Boolean).join(" · ");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <PageHeader
        crumbs={[{ label: t("nav.home"), href: "/tutor" }, { label: t("nav.courses"), href: "/tutor/courses" }, { label: course.title }]}
        title={course.title}
        meta={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_PILL[course.status]}`}>{t(STATUS_KEYS[course.status])}</span>
            {facets ? <span>{facets}</span> : <Link href={`${base}?tab=settings`} className="text-blue-700 hover:underline">
                {t("courseEditor.setFacets")}
              </Link>}
            <span>· {count(t, course._count.enrollments, "count.student", "count.students")}</span>
          </span>
        }
        actions={
          <>
            <Link href={`/tutor/quizzes?course=${course.id}`} className={btnSecondary}>
              {t("courseEditor.allQuizzes")}
            </Link>
            {course.status === "DRAFT" && (
              <form action={setCourseStatus.bind(null, course.id, "PUBLISHED")}>
                <SubmitButton pendingLabel={t("courseEditor.publishing")} className={btnPrimary}>
                  {t("courseEditor.publishCourse")}
                </SubmitButton>
              </form>
            )}
            {course.status === "PUBLISHED" && (
              <form action={setCourseStatus.bind(null, course.id, "DRAFT")}>
                <SubmitButton pendingLabel={t("courseEditor.updating")} className={btnSecondary}>
                  {t("courseEditor.unpublish")}
                </SubmitButton>
              </form>
            )}
            {course.status === "ARCHIVED" && (
              <form action={setCourseStatus.bind(null, course.id, "DRAFT")}>
                <SubmitButton pendingLabel={t("courseEditor.restoring")} className={btnSecondary}>
                  {t("courseEditor.restoreDraft")}
                </SubmitButton>
              </form>
            )}
          </>
        }
      />

      <PageTabs
        active={tab}
        tabs={[
          { key: "syllabus", label: t("courseEditor.tabSyllabus"), href: base, count: course.chapters.length },
          { key: "students", label: t("courseEditor.tabStudents"), href: `${base}?tab=students`, count: course._count.enrollments },
          { key: "settings", label: t("courseEditor.tabSettings"), href: `${base}?tab=settings` },
        ]}
      />

      {tab === "syllabus" && <SyllabusTab course={course} lessonCount={lessonCount} quizCount={quizCount} />}
      {tab === "students" && <StudentsTab courseId={course.id} />}
      {tab === "settings" && <SettingsTab course={course} quizCount={quizCount} />}
    </div>
  );
}

async function QuizRow({ quiz, indent }: { quiz: QuizSummary; indent?: boolean }) {
  const t = await getT();
  return (
    <Link
      href={`/tutor/quizzes/${quiz.id}`}
      className={`flex items-center gap-2.5 py-2 pr-4 text-sm hover:bg-blue-50/50 ${indent ? "pl-[4.25rem]" : "pl-4"}`}
    >
      <ClipboardIcon className="h-4 w-4 shrink-0 text-violet-500" />
      <span className="min-w-0 flex-1 truncate text-zinc-700">{quiz.title}</span>
      <QuizStyleChip style={quiz.style} />
      {quiz.status === "DRAFT" && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">{t("status.draft")}</span>}
      {quiz.timeLimitMinutes && <span className="hidden whitespace-nowrap text-xs text-zinc-500 sm:inline">{t("count.minutes", { n: quiz.timeLimitMinutes })}</span>}
      <span className="hidden w-24 shrink-0 text-right text-xs tabular-nums text-zinc-500 sm:inline">
        {quiz.style === "DRILL"
          ? t(DRILL_SKILLS[parseDrillSkill(quiz.drillSkill)].labelKey)
          : count(t, quiz._count.questions, "count.question", "count.questions")}
      </span>
      <span className="hidden w-20 shrink-0 text-right text-xs tabular-nums text-zinc-500 md:inline">
        {isGradedStyle(quiz.style)
          ? count(t, quiz._count.submissions, "count.result", "count.results")
          : t("quizTable.practiceDone", { n: quiz._count.practiceProgress })}
      </span>
    </Link>
  );
}

async function SyllabusTab({ course, lessonCount, quizCount }: { course: Course; lessonCount: number; quizCount: number }) {
  const t = await getT();
  const base = `/tutor/courses/${course.id}`;
  // Only this course, so the quiz panels here start on it.
  const tree: PlacementCourse[] = [
    {
      id: course.id,
      title: course.title,
      archived: false,
      chapters: course.chapters.map((ch) => ({ id: ch.id, title: ch.title, lessons: ch.lessons.map((l) => ({ id: l.id, title: l.title })) })),
    },
  ];
  const last = course.chapters.length - 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-500">
        <span>
          {count(t, course.chapters.length, "count.chapter", "count.chapters")} ·{" "}
          {count(t, lessonCount, "count.lesson", "count.lessons")} · {count(t, quizCount, "count.quiz", "count.quizzes")}
        </span>
        <span className="text-xs">{t("courseEditor.syllabusHint")}</span>
      </div>

      {course.chapters.map((ch, ci) => (
        <section key={ch.id} id={`chapter-${ch.id}`} className={`${cardCls} overflow-hidden`}>
          <header className="flex flex-wrap items-center gap-2 border-b border-zinc-100 bg-zinc-50/60 px-4 py-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-slate-900 text-xs font-semibold text-white">{ci + 1}</span>
            <form action={renameChapter.bind(null, ch.id)} className="group flex min-w-[14rem] flex-1 items-center gap-2">
              <input
                name="title"
                defaultValue={ch.title}
                required
                aria-label={t("courseEditor.chapterTitleAria")}
                className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-[15px] font-semibold text-zinc-900 hover:border-zinc-200 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
              <SubmitButton pendingLabel={t("action.saving")} className={`${btnSmall} opacity-0 group-focus-within:opacity-100`}>
                {t("action.save")}
              </SubmitButton>
            </form>
            <span className="whitespace-nowrap text-xs text-zinc-500">
              {count(t, ch.lessons.length, "count.lesson", "count.lessons")} ·{" "}
              {count(t, ch._count.quizzes, "count.quiz", "count.quizzes")}
            </span>
            <div className="flex items-center gap-1">
              <form action={moveChapter.bind(null, ch.id, "up")}>
                <SubmitButton pendingLabel="" className={btnSmall} disabled={ci === 0} aria-label={t("courseEditor.moveChapterUp")}>↑</SubmitButton>
              </form>
              <form action={moveChapter.bind(null, ch.id, "down")}>
                <SubmitButton pendingLabel="" className={btnSmall} disabled={ci === last} aria-label={t("courseEditor.moveChapterDown")}>↓</SubmitButton>
              </form>
              {ch._count.quizzes > 0 ? (
                <button className={`${btnSmall} text-zinc-400`} disabled title={t("courseEditor.deleteChapterBlocked")}>
                  {t("action.delete")}
                </button>
              ) : (
                <form action={deleteChapter.bind(null, ch.id)}>
                  <ConfirmButton
                    message={t("courseEditor.deleteChapterConfirm", { title: ch.title, n: ch.lessons.length })}
                    className={`${btnSmall} text-red-600`}
                  >
                    {t("action.delete")}
                  </ConfirmButton>
                </form>
              )}
            </div>
          </header>

          {ch.lessons.length === 0 && ch.quizzes.length === 0 && <p className="px-4 py-4 text-sm text-zinc-500">{t("courseEditor.noLessons")}</p>}

          <ol className="divide-y divide-zinc-100">
            {ch.lessons.map((lesson, li) => (
              <li key={lesson.id}>
                <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 hover:bg-zinc-50/70 sm:flex-nowrap">
                  <span className="w-10 shrink-0 text-right text-xs tabular-nums text-zinc-400">
                    {ci + 1}.{li + 1}
                  </span>
                  <Link href={`${base}/lessons/${lesson.id}`} className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800 hover:text-blue-700">
                    {lesson.title}
                  </Link>
                  <form action={setLessonStatus.bind(null, lesson.id, lesson.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED")}>
                    <SubmitButton
                      pendingLabel="…"
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        lesson.status === "PUBLISHED" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                      }`}
                    >
                      {lesson.status === "PUBLISHED" ? t("courseStatus.PUBLISHED") : t("status.draft")}
                    </SubmitButton>
                  </form>
                  <div className="flex items-center gap-1">
                    <SlideOverButton
                      variant="small"
                      label={t("courseEditor.quiz")}
                      title={t("lessonEditor.addQuizTitle")}
                      description={lesson.title}
                    >
                      <NewQuizForm tree={tree} defaultCourseId={course.id} defaultChapterId={ch.id} defaultLessonId={lesson.id} />
                    </SlideOverButton>
                    <form action={moveLesson.bind(null, lesson.id, "up")}>
                      <SubmitButton pendingLabel="" className={btnSmall} disabled={li === 0} aria-label={t("courseEditor.moveLessonUp")}>↑</SubmitButton>
                    </form>
                    <form action={moveLesson.bind(null, lesson.id, "down")}>
                      <SubmitButton pendingLabel="" className={btnSmall} disabled={li === ch.lessons.length - 1} aria-label={t("courseEditor.moveLessonDown")}>↓</SubmitButton>
                    </form>
                    <form action={deleteLesson.bind(null, lesson.id)}>
                      <ConfirmButton
                        message={
                          lesson.quizzes.length > 0
                            ? t("courseEditor.deleteLessonWithQuizzes", { title: lesson.title, n: lesson.quizzes.length })
                            : t("courseEditor.deleteLessonConfirm", { title: lesson.title })
                        }
                        className={`${btnSmall} text-red-600`}
                      >
                        {t("action.delete")}
                      </ConfirmButton>
                    </form>
                  </div>
                </div>
                {lesson.quizzes.map((q) => (
                  <QuizRow key={q.id} quiz={q} indent />
                ))}
              </li>
            ))}
          </ol>

          {ch.quizzes.length > 0 && (
            <div className="border-t border-zinc-100 bg-violet-50/30">
              <p className="px-4 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wide text-violet-700">{t("courseEditor.endOfChapter")}</p>
              {ch.quizzes.map((q) => (
                <QuizRow key={q.id} quiz={q} />
              ))}
            </div>
          )}

          <footer className="flex flex-wrap items-center gap-2 border-t border-zinc-100 px-4 py-3">
            <form action={createLesson.bind(null, ch.id)} className="flex min-w-0 flex-1 gap-2">
              <input
                name="title"
                required
                placeholder={t("courseEditor.newLessonTitle")}
                aria-label={t("courseEditor.newLessonAria", { chapter: ch.title })}
                className={`${inputCls} min-w-0 flex-1`}
              />
              <SubmitButton pendingLabel={t("action.adding")} className={btnSecondary}>
                {t("courseEditor.addLesson")}
              </SubmitButton>
            </form>
            <SlideOverButton
              variant="secondary"
              label={t("courseEditor.chapterTest")}
              title={t("courseEditor.chapterTestTitle")}
              description={ch.title}
            >
              <NewQuizForm tree={tree} defaultCourseId={course.id} defaultChapterId={ch.id} />
            </SlideOverButton>
          </footer>
        </section>
      ))}

      <form action={createChapter.bind(null, course.id)} className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-white p-4">
        <input
          name="title"
          required
          placeholder={t("courseEditor.newChapterPlaceholder", { n: course.chapters.length + 1 })}
          aria-label={t("courseEditor.newChapterAria")}
          className={`${inputCls} min-w-0 flex-1`}
        />
        <SubmitButton pendingLabel={t("action.adding")} className={btnPrimary}>
          {t("courseEditor.addChapter")}
        </SubmitButton>
      </form>
    </div>
  );
}

async function StudentsTab({ courseId }: { courseId: string }) {
  const t = await getT();
  const [enrollments, totalLessons, students] = await Promise.all([
    db.enrollment.findMany({
      where: { courseId },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true, student: { select: { id: true, name: true, email: true } } },
    }),
    db.lesson.count({ where: { status: "PUBLISHED", chapter: { courseId } } }),
    studentOptions(),
  ]);
  const ids = enrollments.map((e) => e.student.id);
  const completed = ids.length
    ? await db.lessonProgress.groupBy({
        by: ["studentId"],
        where: { studentId: { in: ids }, completedAt: { not: null }, lesson: { status: "PUBLISHED", chapter: { courseId } } },
        _count: { _all: true },
      })
    : [];
  const doneBy = new Map(completed.map((c) => [c.studentId, c._count._all]));

  const rows: CourseStudentRow[] = enrollments.map((e) => {
    const done = doneBy.get(e.student.id) ?? 0;
    return {
      id: e.student.id,
      name: e.student.name,
      email: e.student.email,
      completed: done,
      total: totalLessons,
      pct: totalLessons ? Math.round((done / totalLessons) * 100) : 0,
      enrolledLabel: dateFmt.format(e.createdAt),
    };
  });
  const enrolled = new Set(ids);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-zinc-500">
          {t("courseEditor.enrolledCount", { n: rows.length })} ·{" "}
          {count(t, totalLessons, "count.publishedLesson", "count.publishedLessons")}
        </p>
        <SlideOverButton label={t("courseEditor.enrollStudents")} title={t("courseEditor.enrollStudents")}>
          <EnrollStudentsForm courseId={courseId} students={students.filter((s) => !enrolled.has(s.value))} />
        </SlideOverButton>
      </div>
      <CourseStudentsTable courseId={courseId} students={rows} />
    </div>
  );
}

async function SettingsTab({ course, quizCount }: { course: Course; quizCount: number }) {
  const t = await getT();
  const suggestions = await facetSuggestions();
  const statuses: [CourseStatus, string, string][] = [
    ["DRAFT", t("courseStatus.DRAFT"), t("courseEditor.statusDraftHint")],
    ["PUBLISHED", t("courseStatus.PUBLISHED"), t("courseEditor.statusPublishedHint")],
    ["ARCHIVED", t("courseStatus.ARCHIVED"), t("courseEditor.statusArchivedHint")],
  ];

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <form action={updateCourse.bind(null, course.id)} className={`${cardCls} space-y-5 p-5`}>
        <h2 className="text-sm font-semibold text-zinc-900">{t("courseEditor.details")}</h2>
        <div>
          <label className={labelCls} htmlFor="settings-title">
            {t("courseEditor.title")}
          </label>
          <input id="settings-title" name="title" defaultValue={course.title} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="settings-description">
            {t("courseEditor.description")}
          </label>
          <textarea id="settings-description" name="description" defaultValue={course.description} rows={4} className={inputCls} />
        </div>
        <div>
          <CourseFacetFields suggestions={suggestions} defaults={course} />
          <p className={hintCls}>{t("courseEditor.facetsHint")}</p>
        </div>
        <fieldset>
          <legend className={labelCls}>{t("courseEditor.status")}</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {statuses.map(([value, label, sub]) => (
              <label
                key={value}
                className="cursor-pointer rounded-lg border border-zinc-200 px-3 py-2.5 hover:border-zinc-300 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/60 has-[:checked]:ring-1 has-[:checked]:ring-blue-500"
              >
                <input type="radio" name="status" value={value} defaultChecked={course.status === value} className="sr-only" />
                <span className="block text-sm font-medium text-zinc-900">{label}</span>
                <span className="block text-xs text-zinc-500">{sub}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className={labelCls}>{t("courseEditor.access")}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(["ENROLLED", "OPEN"] as const).map((value) => (
              <label
                key={value}
                className="cursor-pointer rounded-lg border border-zinc-200 px-3 py-2.5 hover:border-zinc-300 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/60 has-[:checked]:ring-1 has-[:checked]:ring-blue-500"
              >
                <input type="radio" name="access" value={value} defaultChecked={course.access === value} className="sr-only" />
                <span className="block text-sm font-medium text-zinc-900">{t(`course.access.${value}` as const)}</span>
                <span className="block text-xs text-zinc-500">
                  {value === "OPEN" ? t("course.access.OPEN.hint") : t("courseEditor.accessEnrolledHint")}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex justify-end border-t border-zinc-100 pt-4">
          <SubmitButton pendingLabel={t("action.saving")} className={btnPrimary}>
            {t("courseEditor.saveChanges")}
          </SubmitButton>
        </div>
      </form>

      <div className="space-y-6">
        <section className={`${cardCls} p-5`}>
          <h2 className="text-sm font-semibold text-zinc-900">{t("courseEditor.coverImage")}</h2>
          <p className={hintCls}>{t("courseEditor.coverHint")}</p>
          <div className="mt-3">
            <CourseCoverForm courseId={course.id} coverImagePath={course.coverImagePath} />
          </div>
        </section>
        <section className={`${cardCls} border-red-200 p-5`}>
          <h2 className="text-sm font-semibold text-red-700">{t("courseEditor.deleteCourse")}</h2>
          <p className="mt-1 text-sm text-zinc-600">
            {t("courseEditor.deleteCourseHint", { n: quizCount })}
          </p>
          <form action={deleteCourse.bind(null, course.id)} className="mt-3">
            <ConfirmButton
              message={t("courseEditor.deleteCourseConfirm", { title: course.title, n: quizCount })}
              className={btnDanger}
            >
              {t("courseEditor.deleteCourse")}
            </ConfirmButton>
          </form>
        </section>
      </div>
    </div>
  );
}
