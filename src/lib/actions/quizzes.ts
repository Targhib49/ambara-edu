"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireTutor, requireStudent } from "@/lib/auth";
import { parseWorkbook, validateRows, type ImportResult } from "@/lib/quiz/import";
import { gradeQuestion, aggregateSubmission } from "@/lib/quiz/grading";
import { submissionAnswersSchema, correctAnswerSchemas } from "@/lib/quiz/schema";
import { countAttemptsUsed, shuffle } from "@/lib/quiz/attempts";
import type { QuestionType, QuizStatus } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";

export async function previewImport(formData: FormData): Promise<ImportResult> {
  await requireTutor();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { drafts: [], errors: [{ rowNumber: 0, message: "No file uploaded." }] };
  }
  const buffer = await file.arrayBuffer();
  const rows = parseWorkbook(buffer);
  if (rows.length === 0) {
    return { drafts: [], errors: [{ rowNumber: 0, message: "The sheet has no data rows." }] };
  }
  return validateRows(rows);
}

export type CommitImportTarget =
  | { mode: "new"; title: string; lessonId: string | null }
  | { mode: "update"; quizId: string };

export type DraftQuestionInput = {
  type: QuestionType;
  prompt: string;
  points: number;
  explanation: string;
  options: string[];
  correctAnswer: unknown;
};

export async function commitImport(target: CommitImportTarget, drafts: DraftQuestionInput[]) {
  await requireTutor();
  if (drafts.length === 0) return;

  if (target.mode === "new" && !target.title.trim()) return;

  const quizId = await db.$transaction(async (tx) => {
    let id: string;
    if (target.mode === "new") {
      const quiz = await tx.quiz.create({
        data: {
          title: target.title.trim(),
          lessonId: target.lessonId,
          importBatchId: randomUUID(),
          status: "DRAFT",
        },
      });
      id = quiz.id;
    } else {
      const quiz = await tx.quiz.findUniqueOrThrow({ where: { id: target.quizId } });
      id = quiz.id;
      await tx.question.deleteMany({ where: { quizId: id } });
    }

    await tx.question.createMany({
      data: drafts.map((d, i) => ({
        quizId: id,
        order: i,
        type: d.type,
        prompt: d.prompt,
        points: d.points,
        explanation: d.explanation,
        options: d.options,
        correctAnswer: d.correctAnswer as Prisma.InputJsonValue,
      })),
    });

    return id;
  });

  revalidatePath("/tutor/quizzes");
  redirect(`/tutor/quizzes/${quizId}`);
}

export async function deleteQuiz(quizId: string) {
  await requireTutor();
  await db.quiz.delete({ where: { id: quizId } });
  revalidatePath("/tutor/quizzes");
  redirect("/tutor/quizzes");
}

export type CreateQuizState = { error?: string };

export async function createQuiz(_prev: CreateQuizState, formData: FormData): Promise<CreateQuizState> {
  await requireTutor();
  const title = String(formData.get("title") ?? "").trim();
  const lessonId = String(formData.get("lessonId") ?? "") || null;
  if (!title) return { error: "Title is required." };

  const quiz = await db.quiz.create({ data: { title, lessonId, status: "DRAFT" } });
  revalidatePath("/tutor/quizzes");
  redirect(`/tutor/quizzes/${quiz.id}`);
}

export async function updateQuizMeta(quizId: string, formData: FormData) {
  await requireTutor();
  const title = String(formData.get("title") ?? "").trim();
  const lessonId = String(formData.get("lessonId") ?? "") || null;
  if (!title) return;

  const timeLimitRaw = String(formData.get("timeLimitMinutes") ?? "").trim();
  const maxAttemptsRaw = String(formData.get("maxAttempts") ?? "").trim();
  const timeLimitMinutes = timeLimitRaw ? Math.max(1, Math.round(Number(timeLimitRaw))) : null;
  const maxAttempts = maxAttemptsRaw ? Math.max(1, Math.round(Number(maxAttemptsRaw))) : null;
  const randomizeQuestionOrder = formData.get("randomizeQuestionOrder") === "on";

  await db.quiz.update({
    where: { id: quizId },
    data: { title, lessonId, timeLimitMinutes, maxAttempts, randomizeQuestionOrder },
  });
  revalidatePath(`/tutor/quizzes/${quizId}`);
  revalidatePath("/tutor/quizzes");
  revalidatePath("/quizzes");
}

export async function setQuizStatus(quizId: string, status: QuizStatus) {
  await requireTutor();
  await db.quiz.update({ where: { id: quizId }, data: { status } });
  revalidatePath(`/tutor/quizzes/${quizId}`);
  revalidatePath("/tutor/quizzes");
  revalidatePath("/quizzes"); // student index visibility changes with status
}

async function nextQuestionOrder(quizId: string) {
  const last = await db.question.findFirst({
    where: { quizId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  return (last?.order ?? -1) + 1;
}

/**
 * Every default is a complete, schema-valid answer (never a blank/broken
 * placeholder) so a freshly-added question round-trips through
 * correctAnswerSchemas immediately — the editor never shows a broken state.
 */
const DEFAULT_QUESTION_DATA: Record<
  QuestionType,
  { prompt: string; options: string[]; correctAnswer: unknown }
> = {
  MULTIPLE_CHOICE: { prompt: "New question", options: ["Option A", "Option B"], correctAnswer: { letter: "A" } },
  MULTI_SELECT: { prompt: "New question", options: ["Option A", "Option B"], correctAnswer: { letters: ["A"] } },
  NUMERIC: { prompt: "New question", options: [], correctAnswer: { value: 0, tolerance: 0 } },
  SHORT_TEXT: { prompt: "New question", options: [], correctAnswer: { kind: "exact", value: "answer" } },
  CODE: { prompt: "New question", options: [], correctAnswer: { testCases: [] } },
};

export async function addQuestion(quizId: string, type: QuestionType) {
  await requireTutor();
  const defaults = DEFAULT_QUESTION_DATA[type];
  await db.question.create({
    data: {
      quizId,
      type,
      order: await nextQuestionOrder(quizId),
      prompt: defaults.prompt,
      points: 1,
      explanation: "",
      options: defaults.options,
      correctAnswer: defaults.correctAnswer as Prisma.InputJsonValue,
    },
  });
  revalidatePath(`/tutor/quizzes/${quizId}`);
}

export type UpdateQuestionInput = {
  prompt: string;
  points: number;
  explanation: string;
  options: string[];
  correctAnswer: unknown;
};
export type UpdateQuestionState = { error?: string };

export async function updateQuestion(
  questionId: string,
  input: UpdateQuestionInput
): Promise<UpdateQuestionState> {
  await requireTutor();
  const question = await db.question.findUniqueOrThrow({ where: { id: questionId } });
  if (!input.prompt.trim()) return { error: "Prompt is required." };

  const parsed = correctAnswerSchemas[question.type].safeParse(input.correctAnswer);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
  }

  await db.question.update({
    where: { id: questionId },
    data: {
      prompt: input.prompt.trim(),
      points: input.points,
      explanation: input.explanation,
      options: input.options,
      correctAnswer: parsed.data as Prisma.InputJsonValue,
    },
  });
  revalidatePath(`/tutor/quizzes/${question.quizId}`);
  return {};
}

export async function deleteQuestion(questionId: string) {
  await requireTutor();
  const question = await db.question.delete({ where: { id: questionId } });
  revalidatePath(`/tutor/quizzes/${question.quizId}`);
}

export async function moveQuestion(questionId: string, direction: "up" | "down") {
  await requireTutor();
  const question = await db.question.findUniqueOrThrow({ where: { id: questionId } });
  const neighbor = await db.question.findFirst({
    where: {
      quizId: question.quizId,
      order: direction === "up" ? { lt: question.order } : { gt: question.order },
    },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return;
  await db.$transaction([
    db.question.update({ where: { id: question.id }, data: { order: neighbor.order } }),
    db.question.update({ where: { id: neighbor.id }, data: { order: question.order } }),
  ]);
  revalidatePath(`/tutor/quizzes/${question.quizId}`);
}

/**
 * Starts (or resumes) a timed try-out attempt: freezes the question order
 * and records the start time server-side so a page reload can't reshuffle
 * questions or reset the countdown. No-op if the quiz isn't timed, if an
 * attempt is already in progress (resume it as-is), or if the student is
 * out of attempts.
 */
export async function startTimedAttempt(quizId: string) {
  const student = await requireStudent();
  const quiz = await db.quiz.findUniqueOrThrow({
    where: { id: quizId },
    include: { questions: { select: { id: true }, orderBy: { order: "asc" } } },
  });
  if (!quiz.timeLimitMinutes) return;

  const existing = await db.timedQuizSession.findUnique({
    where: { studentId_quizId: { studentId: student.id, quizId } },
  });
  if (existing) {
    revalidatePath(`/quizzes/${quizId}`);
    return;
  }

  if (quiz.maxAttempts !== null) {
    const used = await countAttemptsUsed(student.id, quizId);
    if (used >= quiz.maxAttempts) return;
  }

  const ids = quiz.questions.map((q) => q.id);
  await db.timedQuizSession.create({
    data: {
      studentId: student.id,
      quizId,
      questionOrder: quiz.randomizeQuestionOrder ? shuffle(ids) : ids,
    },
  });
  revalidatePath(`/quizzes/${quizId}`);
}

export async function submitQuizAnswers(quizId: string, rawAnswers: unknown) {
  const student = await requireStudent();
  const answers = submissionAnswersSchema.parse(rawAnswers);

  const quiz = await db.quiz.findUniqueOrThrow({
    where: { id: quizId },
    include: { questions: true },
  });

  const grades = quiz.questions.map((q) => {
    const answer = answers.find((a) => a.questionId === q.id);
    return gradeQuestion(q, answer?.response ?? null);
  });
  const { autoScore, status } = aggregateSubmission(grades);

  // Snapshot the outgoing attempt's score before the upsert overwrites it,
  // so students keep a visible score history across retakes.
  const existing = await db.submission.findUnique({
    where: { studentId_quizId: { studentId: student.id, quizId } },
  });
  if (existing) {
    const previousAttempts = await db.submissionAttempt.count({
      where: { studentId: student.id, quizId },
    });
    await db.submissionAttempt.create({
      data: {
        studentId: student.id,
        quizId,
        attemptNumber: previousAttempts + 1,
        autoScore: existing.autoScore,
        manualScore: existing.manualScore,
        status: existing.status,
        submittedAt: existing.updatedAt,
      },
    });
  }

  await db.submission.upsert({
    where: { studentId_quizId: { studentId: student.id, quizId } },
    create: {
      studentId: student.id,
      quizId,
      answers: answers as unknown as Prisma.InputJsonValue,
      autoScore,
      status,
    },
    update: {
      answers: answers as unknown as Prisma.InputJsonValue,
      autoScore,
      manualScore: null,
      status,
      feedback: "",
    },
  });

  // Ends the in-progress timed attempt, if any, so the next Start creates a
  // fresh session (new shuffle, new clock) rather than resuming a submitted one.
  await db.timedQuizSession.deleteMany({ where: { studentId: student.id, quizId } });

  revalidatePath(`/quizzes/${quizId}`);
}

export async function reviewSubmission(submissionId: string, manualScore: number, feedback: string) {
  await requireTutor();
  const submission = await db.submission.update({
    where: { id: submissionId },
    data: { manualScore, feedback, status: "REVIEWED" },
  });
  revalidatePath(`/tutor/quizzes/${submission.quizId}`);
  revalidatePath(`/tutor/quizzes/${submission.quizId}/submissions/${submissionId}`);
  revalidatePath(`/quizzes/${submission.quizId}`);
}
