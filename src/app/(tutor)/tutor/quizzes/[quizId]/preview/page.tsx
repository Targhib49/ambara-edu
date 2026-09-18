import { notFound } from "next/navigation";
import { requireTutor } from "@/lib/auth";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProjectPlayer, type PlayerStep, type PreviewData } from "@/components/projects/ProjectPlayer";
import { currentStep, loadSteps, starterFiles, withStepFiles } from "@/lib/projects/progress";

/**
 * The tutor trying a project as a student would, before publishing it. Runs
 * entirely in the page — every step's tests included, since the tutor may see
 * them — and records nothing.
 */
export default async function ProjectPreviewPage({ params }: { params: Promise<{ quizId: string }> }) {
  await requireTutor();
  const t = await getT();
  const { quizId } = await params;
  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!quiz || quiz.style !== "PROJECT") notFound();

  const steps = loadSteps(quiz.questions);
  const playerSteps: PlayerStep[] = steps.map((s) => ({
    id: s.id,
    stage: s.step.stage,
    title: s.step.title,
    instruction: s.instruction,
    example: s.step.example,
    hint: s.step.hint,
  }));
  const preview: PreviewData = {
    runs: Object.fromEntries(steps.map((s) => [s.id, [s.step.example, ...s.step.tests]])),
    addFiles: Object.fromEntries(steps.map((s) => [s.id, s.step.addFiles])),
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-4 px-4 py-6">
      <PageHeader
        crumbs={[
          { label: t("nav.home"), href: "/tutor" },
          { label: t("nav.quizzes"), href: "/tutor/quizzes" },
          { label: quiz.title, href: `/tutor/quizzes/${quiz.id}` },
          { label: t("project.previewBadge") },
        ]}
        title={t("project.previewTitle", { title: quiz.title })}
        meta={t("project.previewIntro")}
      />
      {steps.length === 0 ? (
        <p className="rounded-xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500">{t("project.noSteps")}</p>
      ) : (
        <ProjectPlayer
          quizId={quiz.id}
          steps={playerSteps}
          initialFiles={withStepFiles(starterFiles(quiz.projectFiles), currentStep(steps, []))}
          initialPassedIds={[]}
          initialComplete={false}
          preview={preview}
        />
      )}
    </div>
  );
}
