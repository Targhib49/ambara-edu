import Link from "next/link";
import { getT } from "@/lib/i18n/server";
import { ProjectPlayer, type PlayerStep } from "@/components/projects/ProjectPlayer";
import { ensureProgress, loadSteps } from "@/lib/projects/progress";
import { stepHints } from "@/lib/projects/schema";
import { type Crumb } from "@/components/ui/Breadcrumbs";
import { PageHeader } from "@/components/ui/PageHeader";
import { btnSecondary } from "@/components/ui/styles";
import type { Question, Submission } from "@/generated/prisma/client";

/**
 * A guided project's page. Wider than a quiz page, since it holds an editor.
 * The player gets each step's instruction, example and hint — never its hidden
 * tests, which the server hands out one step at a time when it's checked.
 */
export async function ProjectView({
  studentId,
  courseId,
  quiz,
  submission,
  crumbs,
  backHref,
  backLabel,
}: {
  studentId: string;
  courseId: string;
  quiz: { id: string; title: string; projectFiles: unknown; questions: Question[] };
  submission: Submission | null;
  crumbs: Crumb[];
  backHref: string;
  backLabel: string;
}) {
  const t = await getT();
  const steps = loadSteps(quiz.questions);
  const progress = await ensureProgress(studentId, quiz, steps);
  const files = (progress.files ?? {}) as Record<string, string>;
  const totalPoints = steps.reduce((n, s) => n + s.points, 0);

  const playerSteps: PlayerStep[] = steps.map((s) => ({
    id: s.id,
    stage: s.step.stage,
    title: s.step.title,
    instruction: s.instruction,
    example: s.step.example,
    hints: stepHints(s.step),
    lessonHref: s.step.lessonId ? `/courses/${courseId}/lessons/${s.step.lessonId}` : null,
  }));

  const score =
    submission &&
    (submission.status === "REVIEWED" ? (submission.autoScore ?? 0) + (submission.manualScore ?? 0) : submission.autoScore ?? 0);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-4 px-4 py-6">
      <PageHeader
        crumbs={crumbs}
        title={quiz.title}
        meta={t("project.meta", { n: steps.length, p: totalPoints })}
        actions={
          <Link href={backHref} className={`${btnSecondary} max-w-full`}>
            <span className="truncate">← {backLabel}</span>
          </Link>
        }
      />

      {submission && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm">
          {submission.status === "REVIEWED" ? (
            <p className="text-zinc-800">
              {t("project.reviewedScore", { score: score ?? 0, total: totalPoints })}
            </p>
          ) : (
            <p className="text-zinc-700">{t("project.pendingScore", { score: score ?? 0, total: totalPoints })}</p>
          )}
          {submission.feedback && <p className="mt-2 whitespace-pre-line text-zinc-600">{submission.feedback}</p>}
        </div>
      )}

      {steps.length === 0 ? (
        <p className="rounded-xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500">{t("project.noSteps")}</p>
      ) : (
        <ProjectPlayer
          quizId={quiz.id}
          steps={playerSteps}
          initialFiles={files}
          initialPassedIds={progress.passedIds}
          initialComplete={progress.completedAt !== null}
          initialCheckpoint={(progress.stepStartFiles ?? progress.files ?? {}) as Record<string, string>}
        />
      )}
    </div>
  );
}
