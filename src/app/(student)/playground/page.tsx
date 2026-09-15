import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth";
import { isEnabled } from "@/lib/flags";
import { PageHeader } from "@/components/ui/PageHeader";
import { CourseVizList, GamesGrid, ToolsGrid } from "@/components/playground/PlaygroundCards";
import { courseVisualizations } from "@/lib/playground/courseVisualizations";

export default async function PlaygroundPage() {
  const student = await requireStudent();
  // Off means the route doesn't exist, not that it renders empty.
  if (!(await isEnabled("playground"))) notFound();

  const courses = await courseVisualizations({ studentId: student.id });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8">
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Playground" }]}
        title="Playground"
        meta="Games to play, and the animations from your courses to explore on their own. Nothing here is marked."
      />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">Games</h2>
        <GamesGrid basePath="/playground" />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">From your courses</h2>
        <CourseVizList
          courses={courses}
          basePath="/playground"
          emptyText="None of your courses have animations yet. They'll appear here as your lessons add them."
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">Tools</h2>
        <ToolsGrid basePath="/playground" />
      </section>
    </div>
  );
}
