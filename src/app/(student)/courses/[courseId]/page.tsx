import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { nowMs, formatSessionTime } from "@/lib/sessions/format";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { isEnabled } from "@/lib/flags";
import { summarizeCourseProgress } from "@/lib/progress";
import { buildChapterItems, chapterStatus } from "@/lib/courseItems";
import { ChapterSection } from "@/components/student/ChapterSection";

const UPCOMING_LIMIT = 5;

export default async function StudentTrackPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const student = await requireStudent();
  const courseV2 = await isEnabled("course_v2");

  const course = await db.course.findFirst({
    where: { id: courseId, enrollments: { some: { studentId: student.id } } },
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
                  questions: { select: { points: true } },
                  submissions: {
                    where: { studentId: student.id },
                    select: { status: true, autoScore: true, manualScore: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!course) notFound();

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
  const firstLesson = orderedLessons[0];
  const progress = summarizeCourseProgress(orderedLessons);
  const resumeLesson = progress.resumeLessonId
    ? orderedLessons.find((l) => l.id === progress.resumeLessonId)
    : null;

  // Chapters as interleaved item lists, plus the single item the student should
  // pick up next — the first unfinished thing in course order.
  const chapterViews = course.chapters
    .filter((c) => c.lessons.length > 0)
    .map((chapter) => {
      const items = buildChapterItems(course.id, chapter.lessons);
      return { id: chapter.id, title: chapter.title, items, status: chapterStatus(items) };
    });
  const nextItemKey =
    chapterViews.flatMap((c) => c.items).find((i) => !i.complete)?.key ?? null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
      <div className="min-w-0 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/dashboard" },
            { label: "My courses", href: "/courses" },
            { label: course.title },
          ]}
        />
        <div className="rounded-xl border border-zinc-200 bg-white p-6 lg:p-8">
          <h1 className="text-2xl font-semibold">{course.title}</h1>
          {course.description && <p className="mt-2 text-sm text-zinc-600">{course.description}</p>}
          {courseV2 && progress.total > 0 && (
            <div className="mt-5 space-y-1.5">
              <div className="flex items-baseline justify-between gap-3 text-xs text-zinc-500">
                <span>
                  {progress.completed} of {progress.total} lessons complete
                </span>
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
          {courseV2 && resumeLesson ? (
            <Link
              href={`/courses/${course.id}/lessons/${resumeLesson.id}`}
              className="mt-5 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              {progress.started ? "Continue" : "Start learning"}: {resumeLesson.title} →
            </Link>
          ) : courseV2 && progress.total > 0 ? (
            <p className="mt-5 inline-block rounded-md bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
              All lessons complete — nice work.
            </p>
          ) : (
            firstLesson && (
              <Link
                href={`/courses/${course.id}/lessons/${firstLesson.id}`}
                className="mt-5 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
              >
                Start learning →
              </Link>
            )
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          {courseV2
            ? chapterViews.map((chapter) => (
                <ChapterSection
                  key={chapter.id}
                  title={chapter.title}
                  items={chapter.items}
                  status={chapter.status}
                  nextItemKey={nextItemKey}
                />
              ))
            : course.chapters
                .filter((m) => m.lessons.length > 0)
                .map((chapter, i) => (
                  <div key={chapter.id} className={i > 0 ? "border-t border-zinc-200" : ""}>
                    <p className="px-6 pt-4 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      {chapter.title}
                    </p>
                    <ul className="px-3 pb-3 pt-1">
                      {chapter.lessons.map((lesson) => (
                        <li key={lesson.id}>
                          <Link
                            href={`/courses/${course.id}/lessons/${lesson.id}`}
                            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-blue-700"
                          >
                            <span className="min-w-0 flex-1">{lesson.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
          {course.chapters.every((m) => m.lessons.length === 0) && (
            <p className="px-6 py-5 text-sm text-zinc-500">No published lessons yet.</p>
          )}
        </div>
      </div>

      <aside className="lg:sticky lg:top-14 lg:self-start">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">Upcoming</h2>
          {upcomingSessions.length === 0 ? (
            <p className="text-sm text-zinc-500">No upcoming sessions.</p>
          ) : (
            <ul className="space-y-3">
              {upcomingSessions.map((s) => (
                <li key={s.id} className="border-l-2 border-blue-400 pl-3">
                  <p className="text-sm font-medium text-zinc-900">{s.tutor.name}</p>
                  <p className="text-xs text-zinc-500">{formatSessionTime(s.startTime)}</p>
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
