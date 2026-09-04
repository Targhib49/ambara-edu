import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { nowMs, formatSessionTime } from "@/lib/sessions/format";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

const UPCOMING_LIMIT = 5;

export default async function StudentTrackPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const student = await requireStudent();

  const course = await db.course.findFirst({
    where: { id: courseId, enrollments: { some: { studentId: student.id } } },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            where: { status: "PUBLISHED" },
            orderBy: { order: "asc" },
            select: { id: true, title: true },
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

  const firstLesson = course.chapters.flatMap((m) => m.lessons)[0];

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
          {firstLesson && (
            <Link
              href={`/courses/${course.id}/lessons/${firstLesson.id}`}
              className="mt-5 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              Start learning →
            </Link>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white">
          {course.chapters
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
                        className="block rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-blue-700"
                      >
                        {lesson.title}
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
