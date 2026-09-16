import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { isEnabled } from "@/lib/flags";
import { summarizeCourseProgress } from "@/lib/progress";
import { PageHeader } from "@/components/ui/PageHeader";
import { getT } from "@/lib/i18n/server";
import { StudentCourseGrid, type StudentCourseCard } from "@/components/student/StudentCourseGrid";

export default async function StudentCoursesPage() {
  const student = await requireStudent();
  const courseV2 = await isEnabled("course_v2");
  const t = await getT();

  const courses = await db.course.findMany({
    where: { status: "PUBLISHED", enrollments: { some: { studentId: student.id } } },
    orderBy: { title: "asc" },
    include: {
      chapters: {
        select: {
          lessons: {
            where: { status: "PUBLISHED" },
            select: { id: true, progress: { where: { studentId: student.id }, select: { completedAt: true, lastViewedAt: true } } },
          },
        },
      },
    },
  });

  const cards: StudentCourseCard[] = courses.map((course) => {
    const lessons = course.chapters.flatMap((c) => c.lessons);
    const progress = summarizeCourseProgress(lessons);
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      subject: [course.subject, course.level].filter(Boolean).join(" · "),
      coverSrc: course.coverImagePath ? `/api/courses/${course.id}/cover?v=${encodeURIComponent(course.coverImagePath)}` : null,
      lessonCount: lessons.length,
      // Without course_v2 there is no lesson completion to report.
      completed: courseV2 ? progress.completed : null,
      pct: courseV2 ? progress.pct : null,
    };
  });
  const inProgress = cards.filter((c) => (c.pct ?? 0) > 0 && (c.pct ?? 0) < 100).length;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <PageHeader
        crumbs={[{ label: t("nav.home"), href: "/dashboard" }, { label: t("courses.title") }]}
        title={t("courses.title")}
        meta={
          cards.length === 0
            ? t("courses.nothingYet")
            : `${t("courses.countMeta", { n: cards.length })}${inProgress ? ` · ${t("courses.inProgress", { n: inProgress })}` : ""}`
        }
      />
      <StudentCourseGrid courses={cards} />
    </div>
  );
}
