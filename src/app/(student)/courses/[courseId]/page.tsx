import Link from "next/link";
import { notFound } from "next/navigation";
import { courseAdmission } from "@/lib/syllabus/access";
import { StartOpenCourseButton } from "@/app/(student)/explore/explore-ui";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { nowMs, formatSessionTime } from "@/lib/sessions/format";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { summarizeCourseProgress } from "@/lib/progress";
import { buildChapterItems, chapterStatus } from "@/lib/courseItems";
import { ChapterSection } from "@/components/student/ChapterSection";
import { btnPrimary, cardCls } from "@/components/ui/styles";
import { getLanguage, getT } from "@/lib/i18n/server";

const UPCOMING_LIMIT = 5;

export default async function StudentTrackPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const student = await requireStudent();
  const t = await getT();
  const language = await getLanguage();

  const course = await db.course.findFirst({
    where: { id: courseId, status: "PUBLISHED", enrollments: { some: { studentId: student.id } } },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            where: { status: "PUBLISHED" },
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              // Types only — enough to label the row, without pulling every
              // block's JSON payload for the whole course.
              blocks: { select: { type: true } },
              progress: {
                where: { studentId: student.id },
                select: { completedAt: true, lastViewedAt: true },
              },
              quizzes: {
                where: { status: "PUBLISHED" },
                orderBy: { createdAt: "asc" },
                select: {
                  id: true,
                  title: true,
                  style: true,
                  questions: { select: { points: true } },
                  submissions: {
                    where: { studentId: student.id },
                    select: { status: true, autoScore: true, manualScore: true },
                  },
                  practiceProgress: { where: { studentId: student.id }, select: { completedAt: true } },
                  projectProgress: { where: { studentId: student.id }, select: { passedIds: true } },
                },
              },
            },
          },
        },
      },
    },
  });
  // Not enrolled isn't always "no such course": it can be behind a gate they
  // haven't passed, or open to everyone and simply not started yet.
  if (!course) {
    const admission = await courseAdmission(student.id, courseId);
    if (admission.allowed === false && admission.reason === "locked") {
      return (
        <div className="mx-auto w-full max-w-lg px-4 py-16 text-center">
          <p aria-hidden className="text-3xl">🔒</p>
          <h1 className="mt-3 text-xl font-semibold text-zinc-900">{t("course.locked")}</h1>
          <p className="mt-2 text-sm text-zinc-600">
            {t("syllabus.locked", { course: admission.afterTitle, needed: admission.needed })} ·{" "}
            {t("syllabus.lockedNow", { have: admission.have })}
          </p>
          <Link href="/explore" className="mt-4 inline-block text-sm font-medium text-blue-700 hover:underline">
            {admission.syllabusTitle} →
          </Link>
        </div>
      );
    }
    if (admission.allowed === false && admission.reason === "enroll-open") {
      const open = await db.course.findUniqueOrThrow({ where: { id: courseId }, select: { title: true, description: true } });
      return (
        <div className="mx-auto w-full max-w-lg px-4 py-16 text-center">
          <h1 className="text-xl font-semibold text-zinc-900">{open.title}</h1>
          {open.description && <p className="mt-2 text-sm text-zinc-600">{open.description}</p>}
          <p className="mt-2 text-sm text-zinc-500">{t("course.access.OPEN.hint")}</p>
          <div className="mt-4 flex justify-center">
            <StartOpenCourseButton courseId={courseId} />
          </div>
        </div>
      );
    }
    notFound();
  }

  // The chapters' own tests — quizzes not tied to one lesson — shown after each
  // chapter's last lesson.
  const chapterTests = await db.quiz.findMany({
    where: { lessonId: null, status: "PUBLISHED", chapter: { courseId: course.id } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      chapterId: true,
      style: true,
      questions: { select: { points: true } },
      submissions: { where: { studentId: student.id }, select: { status: true, autoScore: true, manualScore: true } },
      practiceProgress: { where: { studentId: student.id }, select: { completedAt: true } },
      projectProgress: { where: { studentId: student.id }, select: { passedIds: true } },
    },
  });
  const testsByChapter = new Map<string, typeof chapterTests>();
  for (const test of chapterTests) {
    if (!test.chapterId) continue;
    testsByChapter.set(test.chapterId, [...(testsByChapter.get(test.chapterId) ?? []), test]);
  }

  const upcomingSessions = await db.session.findMany({
    where: {
      studentId: student.id,
      status: { not: "CANCELLED" },
      startTime: { gte: new Date(nowMs()) },
    },
    include: { tutor: { select: { name: true } } },
    orderBy: { startTime: "asc" },
    take: UPCOMING_LIMIT,
  });

  const orderedLessons = course.chapters.flatMap((m) => m.lessons);
  const progress = summarizeCourseProgress(orderedLessons);
  const resumeLesson = progress.resumeLessonId
    ? orderedLessons.find((l) => l.id === progress.resumeLessonId)
    : null;

  // Chapters as interleaved item lists, plus the single item the student should
  // pick up next — the first unfinished thing in course order.
  const chapterViews = course.chapters
    .filter((c) => c.lessons.length > 0 || testsByChapter.has(c.id))
    .map((chapter) => {
      const items = buildChapterItems(course.id, chapter.lessons, testsByChapter.get(chapter.id) ?? []);
      return { id: chapter.id, title: chapter.title, items, status: chapterStatus(items) };
    });
  const nextItemKey =
    // Practice is optional, so it's never the suggested next step.
    chapterViews.flatMap((c) => c.items).find((i) => !i.complete && !i.optional)?.key ?? null;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
      <div className="min-w-0 space-y-6">
        <Breadcrumbs
          items={[
            { label: t("nav.home"), href: "/dashboard" },
            { label: t("nav.myCourses"), href: "/courses" },
            { label: course.title },
          ]}
        />
        <div className={`${cardCls} overflow-hidden p-6 lg:p-8`}>
          {course.coverImagePath && (
            // Signed URL behind a redirect — not something next/image can optimise.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/courses/${course.id}/cover?v=${encodeURIComponent(course.coverImagePath)}`}
              alt=""
              className="-mx-6 -mt-6 mb-6 aspect-[16/6] w-[calc(100%+3rem)] max-w-none object-cover lg:-mx-8 lg:-mt-8 lg:w-[calc(100%+4rem)]"
            />
          )}
          <h1 className="text-2xl font-semibold">{course.title}</h1>
          {course.description && <p className="mt-2 text-sm text-zinc-600">{course.description}</p>}
          {progress.total > 0 && (
            <div className="mt-5 space-y-1.5">
              <div className="flex items-baseline justify-between gap-3 text-xs text-zinc-500">
                <span>{t("studentCourse.lessonsComplete", { done: progress.completed, total: progress.total })}</span>
                <span className="font-medium text-zinc-700">{progress.pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-[width]"
                  style={{ width: `${progress.pct}%` }}
                />
              </div>
            </div>
          )}
          {resumeLesson ? (
            <Link
              href={`/courses/${course.id}/lessons/${resumeLesson.id}`}
              className={`${btnPrimary} mt-5 max-w-full`}
            >
              <span className="truncate">
                {progress.started ? t("studentCourse.continue") : t("studentCourse.startLearning")}: {resumeLesson.title} →
              </span>
            </Link>
          ) : progress.total > 0 ? (
            <p className="mt-5 inline-block rounded-md bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
              {t("studentCourse.allComplete")}
            </p>
          ) : null}
        </div>

        <div className={`${cardCls} overflow-hidden`}>
          {chapterViews.map((chapter) => (
            <ChapterSection
              key={chapter.id}
              title={chapter.title}
              items={chapter.items}
              status={chapter.status}
              nextItemKey={nextItemKey}
            />
          ))}
          {course.chapters.every((m) => m.lessons.length === 0) && (
            <p className="px-6 py-5 text-sm text-zinc-500">{t("studentCourse.noPublishedLessons")}</p>
          )}
        </div>
      </div>

      <aside className="xl:sticky xl:top-14 xl:self-start">
        <div className={`${cardCls} p-5`}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">{t("tutorSessions.tabUpcoming")}</h2>
          {upcomingSessions.length === 0 ? (
            <p className="text-sm text-zinc-500">{t("studentSessions.noUpcoming")}</p>
          ) : (
            <ul className="space-y-3">
              {upcomingSessions.map((s) => (
                <li key={s.id} className="border-l-2 border-blue-400 pl-3">
                  <p className="text-sm font-medium text-zinc-900">{s.tutor.name}</p>
                  <p className="text-xs text-zinc-500">{formatSessionTime(s.startTime, language)}</p>
                </li>
              ))}
            </ul>
          )}
          <Link href="/sessions" className="mt-4 inline-block text-sm text-blue-700 hover:underline">
            View all sessions →
          </Link>
        </div>
      </aside>
    </div>
  );
}
