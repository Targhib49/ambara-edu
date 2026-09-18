import { requireStudent } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { CourseVizList, GamesGrid, ToolsGrid } from "@/components/playground/PlaygroundCards";
import { courseVisualizations } from "@/lib/playground/courseVisualizations";
import { getT } from "@/lib/i18n/server";

export default async function PlaygroundPage() {
  const student = await requireStudent();

  const t = await getT();
  const courses = await courseVisualizations({ studentId: student.id });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8">
      <PageHeader
        crumbs={[{ label: t("nav.home"), href: "/dashboard" }, { label: t("playground.title") }]}
        title={t("playground.title")}
        meta={t("playground.studentMeta")}
      />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">{t("playground.games")}</h2>
        <GamesGrid basePath="/playground" />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">{t("playground.fromYourCourses")}</h2>
        <CourseVizList
          courses={courses}
          basePath="/playground"
          emptyText={t("playground.noCourseAnimations")}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">{t("playground.tools")}</h2>
        <ToolsGrid basePath="/playground" />
      </section>
    </div>
  );
}
