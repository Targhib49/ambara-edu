import Link from "next/link";
import { db } from "@/lib/db";
import { createCourse } from "@/lib/actions/courses";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { badgeColorFor } from "@/lib/ui/palette";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default async function TutorTracksPage() {
  const courses = await db.course.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { chapters: true, enrollments: true } } },
  });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Home", href: "/tutor" }, { label: "Courses" }]} />
        <h1 className="text-2xl font-semibold">Courses</h1>
      </div>

      {courses.length === 0 ? (
        <p className="text-sm text-zinc-500">No courses yet — create one below.</p>
      ) : (
        <div className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {courses.map((course, i) => (
            <Link
              key={course.id}
              href={`/tutor/courses/${course.id}`}
              className="flex items-start gap-4 px-5 py-4 first:rounded-t-xl last:rounded-b-xl hover:bg-zinc-50"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-base font-semibold ${badgeColorFor(i)}`}
              >
                {course.title.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-medium text-zinc-900">{course.title}</h2>
                {course.description && (
                  <p className="mt-0.5 line-clamp-1 text-sm text-zinc-500">{course.description}</p>
                )}
              </div>
              <span className="shrink-0 text-xs text-zinc-400">
                {course._count.chapters} chapters · {course._count.enrollments} students
              </span>
              <span className="shrink-0 text-zinc-300">›</span>
            </Link>
          ))}
        </div>
      )}

      <form
        action={createCourse}
        className="max-w-md space-y-3 rounded-xl border border-zinc-200 bg-white p-5"
      >
        <h2 className="font-medium">New course</h2>
        <input
          name="title"
          required
          placeholder="Title (e.g. Control Systems)"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <textarea
          name="description"
          rows={2}
          placeholder="Description (optional)"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <SubmitButton
          pendingLabel="Creating…"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          Create course
        </SubmitButton>
      </form>
    </div>
  );
}
