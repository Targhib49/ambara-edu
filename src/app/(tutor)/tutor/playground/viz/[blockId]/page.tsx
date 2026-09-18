import Link from "next/link";
import { getT } from "@/lib/i18n/server";
import { notFound } from "next/navigation";
import { requireTutor } from "@/lib/auth";
import { findCourseVisualization } from "@/lib/playground/courseVisualizations";
import { PlaygroundFrame } from "@/components/playground/PlaygroundFrame";
import { VizBlock } from "@/components/viz/VizBlock";
import { btnSecondary } from "@/components/ui/styles";

export default async function TutorCourseVizPage({ params }: { params: Promise<{ blockId: string }> }) {
  await requireTutor();
  const t = await getT();
  const { blockId } = await params;
  const viz = await findCourseVisualization(blockId);
  if (!viz) notFound();

  return (
    <PlaygroundFrame
      crumbs={[
        { label: t("nav.home"), href: "/tutor" },
        { label: t("playground.title"), href: "/tutor/playground?tab=courses" },
        { label: viz.title },
      ]}
      title={viz.title}
      meta={`${viz.course.title} › ${viz.chapterTitle} › ${viz.lesson.title}`}
      actions={
        <Link href={`/tutor/courses/${viz.course.id}/lessons/${viz.lesson.id}`} className={btnSecondary}>
          {t("playground.editInLesson")}
        </Link>
      }
    >
      <VizBlock key={blockId} data={viz.data} />
    </PlaygroundFrame>
  );
}
