import Link from "next/link";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { badgeColorFor } from "@/lib/ui/palette";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default async function StudentTracksPage() {
  const student = await requireStudent();
  const courses = await db.course.findMany({
    where: { enrollments: { some: { studentId: student.id } } },
    orderBy: { title: "asc" },
    include: {
      chapters: {
        select: { lessons: { where: { status: "PUBLISHED" }, select: { id: true } } },
      },
    },
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "My courses" }]} />
        <h1 className="text-2xl font-semibold">My courses</h1>
      </div>

      {courses.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">
          You aren’t enrolled in any courses yet — your tutor will add you.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {courses.map((course, i) => {
            const lessonCount = course.chapters.reduce((n, m) => n + m.lessons.length, 0);
            const [bg] = badgeColorFor(i).split(" "); // reuse the badge's bg tone for the image placeholder wash
            return (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group overflow-hidden rounded-xl border border-zinc-200 bg-white hover:border-blue-300 hover:shadow-sm"
              >
                <div className={`flex aspect-[4/3] items-center justify-center ${bg}`}>
                  <span className="text-4xl font-semibold text-zinc-900/20">
                    {course.title.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="p-3">
                  <h2 className="truncate text-sm font-medium text-zinc-900 group-hover:text-blue-700">
                    {course.title}
                  </h2>
                  {course.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{course.description}</p>
                  )}
                  <p className="mt-2 text-xs text-zinc-400">{lessonCount} lessons</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
