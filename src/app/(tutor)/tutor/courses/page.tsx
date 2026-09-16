import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { SlideOverButton } from "@/components/ui/SlideOver";
import { NewCourseForm } from "@/components/courses/NewCourseForm";
import { CourseCatalog, type CatalogCourse } from "@/components/courses/CourseCatalog";
import { facetSuggestions } from "@/lib/courses/facets";
import { getT } from "@/lib/i18n/server";

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

export default async function TutorCoursesPage() {
  const t = await getT();
  const [courses, suggestions] = await Promise.all([
    db.course.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        subject: true,
        curriculum: true,
        level: true,
        status: true,
        coverImagePath: true,
        updatedAt: true,
        _count: { select: { enrollments: true, chapters: true } },
        chapters: { select: { _count: { select: { lessons: true, quizzes: true } } } },
      },
    }),
    facetSuggestions(),
  ]);

  const rows: CatalogCourse[] = courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    subject: c.subject,
    curriculum: c.curriculum,
    level: c.level,
    status: c.status,
    coverSrc: c.coverImagePath ? `/api/courses/${c.id}/cover?v=${encodeURIComponent(c.coverImagePath)}` : null,
    chapters: c._count.chapters,
    lessons: c.chapters.reduce((n, ch) => n + ch._count.lessons, 0),
    quizzes: c.chapters.reduce((n, ch) => n + ch._count.quizzes, 0),
    students: c._count.enrollments,
    updatedAt: c.updatedAt.toISOString(),
    updatedLabel: dateFmt.format(c.updatedAt),
  }));

  const published = rows.filter((r) => r.status === "PUBLISHED").length;
  const drafts = rows.filter((r) => r.status === "DRAFT").length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
      <PageHeader
        crumbs={[{ label: t("nav.home"), href: "/tutor" }, { label: t("tutorCourses.title") }]}
        title={t("tutorCourses.title")}
        meta={t("tutorCourses.meta", { published, drafts })}
        actions={
          <SlideOverButton
            label={t("tutorCourses.new")}
            title={t("tutorCourses.new")}
            description={t("tutorCourses.newDescription")}
          >
            <NewCourseForm suggestions={suggestions} />
          </SlideOverButton>
        }
      />
      <CourseCatalog courses={rows} suggestions={suggestions} />
    </div>
  );
}
