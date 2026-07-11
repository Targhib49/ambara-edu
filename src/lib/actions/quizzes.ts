"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireTutor, requireStudent } from "@/lib/auth";
import { parseWorkbook, validateRows, type ImportResult } from "@/lib/quiz/import";
import { gradeQuestion, aggregateSubmission } from "@/lib/quiz/grading";
import { submissionAnswersSchema } from "@/lib/quiz/schema";
import type { QuestionType } from "@/generated/prisma/enums";
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
