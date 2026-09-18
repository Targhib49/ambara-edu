"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireStudent, requireTutor } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { aggregateSubmission, gradeQuestion } from "@/lib/quiz/grading";
import { projectFilesSchema, type ProjectFiles, type ProjectRun } from "@/lib/projects/schema";
import {
  currentStep,
  failedChecksOf,
  loadSteps,
  projectFor,
  withStepFiles,
  type LoadedStep,
} from "@/lib/projects/progress";

/**
 * Guided projects run in the student's browser — the server has no Python —
 * so a check's pass or fail is reported by the browser, as with code
 * questions. What the server does hold: only the step being worked on can be
 * checked, the failed checks that make the score are counted here, and a
 * finished project is frozen. The tutor's review is the backstop.
 */

async function loadProject(quizId: string) {
  const student = await requireStudent();
  const quiz = await projectFor(student.id, quizId);
  if (!quiz) return null;
  const progress = await db.projectProgress.findUnique({
    where: { studentId_quizId: { studentId: student.id, quizId } },
  });
  if (!progress) return null;
  return { student, quiz, progress, steps: loadSteps(quiz.questions) };
}

function parseFiles(raw: unknown): ProjectFiles | null {
  const parsed = projectFilesSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export type SaveResult = { ok: true } | { error: string };

/** Autosave: the student's files as they are now. Refused once the project is finished. */
export async function saveProjectFiles(quizId: string, rawFiles: unknown): Promise<SaveResult> {
  const t = await getT();
  const loaded = await loadProject(quizId);
  if (!loaded) return { error: t("project.unavailable") };
  if (loaded.progress.completedAt) return { error: t("project.alreadyFinished") };
  const files = parseFiles(rawFiles);
  if (!files) return { error: t("project.badFiles") };
  await db.projectProgress.update({
    where: { studentId_quizId: { studentId: loaded.student.id, quizId } },
    data: { files },
  });
  return { ok: true };
}

export type StepChecks = { runs: ProjectRun[] } | { error: string };

/**
 * The runs that check a step — its example and its hidden tests. Only handed
 * out for the step being worked on, so later steps' tests aren't in the page.
 */
export async function getStepChecks(quizId: string, stepId: string): Promise<StepChecks> {
  const t = await getT();
  const loaded = await loadProject(quizId);
  if (!loaded || loaded.progress.completedAt) return { error: t("project.unavailable") };
  const current = currentStep(loaded.steps, loaded.progress.passedIds);
  if (!current || current.id !== stepId) return { error: t("project.notCurrentStep") };
  return { runs: [current.step.example, ...current.step.tests] };
}

export type CheckRecord =
  | { error: string }
  | {
      passed: boolean;
      passedIds: string[];
      failedChecks: Record<string, number>;
      /** The files after the check, including any the next step brings. */
      files: ProjectFiles;
      /** Names of files that just appeared with the next step. */
      addedFiles: string[];
      complete: boolean;
    };

/**
 * Records a check of the current step. A failed one is counted against the
 * step; a passed one opens the next step (adding any files it brings), and
 * passing the last step finishes the project: it becomes a Submission and
 * goes to the tutor's review queue.
 */
export async function recordProjectCheck(
  quizId: string,
  stepId: string,
  passed: boolean,
  rawFiles: unknown
): Promise<CheckRecord> {
  const t = await getT();
  const loaded = await loadProject(quizId);
  if (!loaded) return { error: t("project.unavailable") };
  const { student, quiz, progress, steps } = loaded;
  if (progress.completedAt) return { error: t("project.alreadyFinished") };
  const current = currentStep(steps, progress.passedIds);
  if (!current || current.id !== stepId) return { error: t("project.notCurrentStep") };
  const files = parseFiles(rawFiles);
  if (!files) return { error: t("project.badFiles") };

  const failedChecks = failedChecksOf(progress.failedChecks);
  const key = { studentId_quizId: { studentId: student.id, quizId } };

  if (!passed) {
    failedChecks[stepId] = (failedChecks[stepId] ?? 0) + 1;
    await db.projectProgress.update({ where: key, data: { files, failedChecks } });
    return { passed: false, passedIds: progress.passedIds, failedChecks, files, addedFiles: [], complete: false };
  }

  const passedIds = [...progress.passedIds, stepId];
  const next = currentStep(steps, passedIds);
  const nextFiles = withStepFiles(files, next);
  const addedFiles = Object.keys(nextFiles).filter((name) => !(name in files));

  if (next) {
    await db.projectProgress.update({ where: key, data: { files: nextFiles, passedIds } });
    return { passed: true, passedIds, failedChecks, files: nextFiles, addedFiles, complete: false };
  }

  await finishProject(student.id, quiz.id, steps, failedChecks);
  await db.projectProgress.update({ where: key, data: { files: nextFiles, passedIds, completedAt: new Date() } });
  revalidatePath(`/quizzes/${quizId}`);
  revalidatePath("/quizzes");
  revalidatePath("/courses", "layout");
  revalidatePath("/dashboard");
  revalidatePath(`/tutor/quizzes/${quizId}`);
  return { passed: true, passedIds, failedChecks, files: nextFiles, addedFiles, complete: true };
}

/**
 * The finished project as a Submission: one answer per step, carrying whether
 * it passed and the failed checks before it did. Graded like any other quiz,
 * so it always lands in the review queue with its automatic score.
 */
async function finishProject(studentId: string, quizId: string, steps: LoadedStep[], failedChecks: Record<string, number>) {
  const answers = steps.map((s) => ({
    questionId: s.id,
    response: { passed: true, failedChecks: failedChecks[s.id] ?? 0 },
  }));
  const grades = steps.map((s, i) =>
    gradeQuestion({ type: "PROJECT_STEP", points: s.points, correctAnswer: s.step }, answers[i].response)
  );
  const { autoScore, status } = aggregateSubmission(grades);
  // A project is finished once, so an existing submission (a double click
  // racing itself) is left as it is.
  await db.submission.upsert({
    where: { studentId_quizId: { studentId, quizId } },
    create: { studentId, quizId, answers, autoScore, status },
    update: {},
  });
}

export type ProjectReviewResult = { ok: true; finalScore: number } | { error: string };

/**
 * The tutor's review of a finished project. The tutor sets the final score
 * directly — up or down from the automatic one — rather than adding points,
 * since reading the code can lower a grade as easily as raise it. It is
 * stored the way every review is, as the difference from the automatic score,
 * so every screen that adds the two keeps working.
 */
export async function reviewProject(submissionId: string, rawFinal: number, feedback: string): Promise<ProjectReviewResult> {
  const t = await getT();
  await requireTutor();
  const submission = await db.submission.findUnique({
    where: { id: submissionId },
    include: { quiz: { select: { id: true, style: true, questions: { select: { points: true } } } } },
  });
  if (!submission || submission.quiz.style !== "PROJECT") return { error: t("project.unavailable") };
  const total = submission.quiz.questions.reduce((n, q) => n + q.points, 0);
  const finalScore = Number(rawFinal);
  if (!Number.isFinite(finalScore) || finalScore < 0 || finalScore > total) {
    return { error: t("projectReview.scoreRange", { total }) };
  }
  const rounded = Math.round(finalScore * 100) / 100;
  const manualScore = Math.round((rounded - (submission.autoScore ?? 0)) * 100) / 100;
  await db.submission.update({
    where: { id: submissionId },
    data: { manualScore, feedback: feedback.slice(0, 5000), status: "REVIEWED" },
  });
  revalidatePath(`/tutor/quizzes/${submission.quizId}`);
  revalidatePath(`/tutor/quizzes/${submission.quizId}/submissions/${submissionId}`);
  revalidatePath(`/quizzes/${submission.quizId}`);
  return { ok: true, finalScore: rounded };
}
