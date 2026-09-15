import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth";
import { isEnabled } from "@/lib/flags";
import { findCourseVisualization } from "@/lib/playground/courseVisualizations";
import { PlaygroundFrame } from "@/components/playground/PlaygroundFrame";
import { VizBlock } from "@/components/viz/VizBlock";
import { btnSecondary } from "@/components/ui/styles";

export default async function StudentCourseVizPage({ params }: { params: Promise<{ blockId: string }> }) {
  const student = await requireStudent();
  if (!(await isEnabled("playground"))) notFound();
  const { blockId } = await params;
  const viz = await findCourseVisualization(blockId, { studentId: student.id });
  if (!viz) notFound();

  return (
    <PlaygroundFrame
      crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Playground", href: "/playground" }, { label: viz.title }]}
      title={viz.title}
      meta={`${viz.course.title} › ${viz.chapterTitle} › ${viz.lesson.title}`}
      actions={
        <Link href={`/courses/${viz.course.id}/lessons/${viz.lesson.id}`} className={btnSecondary}>
          Open the lesson
        </Link>
      }
    >
      <VizBlock key={blockId} data={viz.data} />
    </PlaygroundFrame>
  );
}
