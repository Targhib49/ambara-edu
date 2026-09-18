import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import {
  ENTRY_FILE,
  projectFilesSchema,
  projectStepSchema,
  type ProjectFiles,
  type ProjectStep,
} from "@/lib/projects/schema";

/** A step as the server works with it: its question row plus the parsed step. */
export type LoadedStep = {
  id: string;
  points: number;
  /** The question's prompt: what the student is asked to do. */
  instruction: string;
  step: ProjectStep;
};

/** A published project the student may open, with its steps in order. */
export async function projectFor(studentId: string, quizId: string) {
  return db.quiz.findFirst({
    where: {
      id: quizId,
      status: "PUBLISHED",
      style: "PROJECT",
      chapter: { course: { status: "PUBLISHED", enrollments: { some: { studentId } } } },
      OR: [{ lessonId: null }, { lesson: { status: "PUBLISHED" } }],
    },
    include: { questions: { orderBy: { order: "asc" } } },
  });
}

/**
 * The project's steps in order. A step that doesn't parse is skipped rather
 * than taking the whole project down — the tutor's page still shows it.
 */
export function loadSteps(questions: { id: string; type: string; points: number; prompt: string; correctAnswer: unknown }[]): LoadedStep[] {
  return questions.flatMap((q) => {
    if (q.type !== "PROJECT_STEP") return [];
    const parsed = projectStepSchema.safeParse(q.correctAnswer);
    return parsed.success ? [{ id: q.id, points: q.points, instruction: q.prompt, step: parsed.data }] : [];
  });
}

/** The step being worked on: the first one whose check hasn't passed. Null once all have. */
export function currentStep(steps: LoadedStep[], passedIds: string[]): LoadedStep | null {
  return steps.find((s) => !passedIds.includes(s.id)) ?? null;
}

/** The starter files, falling back to an empty main.py if the stored ones don't parse. */
export function starterFiles(projectFiles: unknown): ProjectFiles {
  const parsed = projectFilesSchema.safeParse(projectFiles);
  return parsed.success ? parsed.data : { [ENTRY_FILE]: "" };
}

/**
 * Adds the files a step brings with it. A file the student already has is
 * left alone: their work is never overwritten by the project.
 */
export function withStepFiles(files: ProjectFiles, step: LoadedStep | null): ProjectFiles {
  if (!step) return files;
  const next = { ...files };
  for (const [name, text] of Object.entries(step.step.addFiles)) {
    if (!(name in next)) next[name] = text;
  }
  return next;
}

/** Failed checks by step id, read defensively from the JSON column. */
export function failedChecksOf(value: Prisma.JsonValue): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, number> = {};
  for (const [id, n] of Object.entries(value)) {
    if (typeof n === "number" && Number.isFinite(n) && n >= 0) out[id] = Math.floor(n);
  }
  return out;
}

/**
 * The student's progress, created on first open from the starter files plus
 * whatever the first step brings.
 */
export async function ensureProgress(studentId: string, quiz: { id: string; projectFiles: unknown }, steps: LoadedStep[]) {
  const existing = await db.projectProgress.findUnique({
    where: { studentId_quizId: { studentId, quizId: quiz.id } },
  });
  if (existing) return existing;
  const files = withStepFiles(starterFiles(quiz.projectFiles), currentStep(steps, []));
  return db.projectProgress.upsert({
    // Two tabs opening at once must not both create it.
    where: { studentId_quizId: { studentId, quizId: quiz.id } },
    create: { studentId, quizId: quiz.id, files, passedIds: [], failedChecks: {} },
    update: {},
  });
}
