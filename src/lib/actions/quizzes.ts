"use server";

import { randomUUID } from "crypto";
import { getT } from "@/lib/i18n/server";
import { EXAM_DEFAULTS, TRYOUT_DEFAULTS, isTimedStyle, parseQuizStyle } from "@/lib/quiz/styles";
import { DRILL_DEFAULTS, DRILL_SECONDS_MAX, DRILL_SECONDS_MIN, parseDrillSkill } from "@/lib/drills/registry";
import { REVIEW_COUNT_DEFAULT, REVIEW_COUNT_MAX } from "@/lib/quiz/review";
import { PART_LETTERS } from "@/lib/quiz/format";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireTutor, requireStudent } from "@/lib/auth";
import { parseWorkbook, validateRows, type ImportResult } from "@/lib/quiz/import";
import { gradeQuestion, aggregateSubmission } from "@/lib/quiz/grading";
import { submissionAnswersSchema, correctAnswerSchemas } from "@/lib/quiz/schema";
import { countAttemptsUsed, shuffle } from "@/lib/quiz/attempts";
import type { QuestionType, QuizStatus, QuizStyle } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";

export async function previewImport(formData: FormData): Promise<ImportResult> {
  const t = await getT();
  await requireTutor();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { drafts: [], errors: [{ rowNumber: 0, message: t("action.importNoFile") }] };
  }
  const buffer = await file.arrayBuffer();
  const rows = parseWorkbook(buffer);
  if (rows.length === 0) {
    return { drafts: [], errors: [{ rowNumber: 0, message: t("action.importNoRows") }] };
  }
  return validateRows(rows);
}

/**
 * Where a quiz sits in the syllabus: always a chapter, and optionally a lesson
 * inside it. Checked on the server so a quiz can never point at a lesson from
 * some other chapter.
 */
async function resolvePlacement(
  chapterIdRaw: unknown,
  lessonIdRaw: unknown
): Promise<{ chapterId: string; lessonId: string | null } | { error: string }> {
  const t = await getT();
  const chapterId = String(chapterIdRaw ?? "");
  const lessonId = String(lessonIdRaw ?? "") || null;
  const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
  if (!chapterId || !isUuid(chapterId)) return { error: t("action.chooseCourseChapter") };
  // Also catches the picker's "After a lesson, but none chosen" marker.
  if (lessonId && !isUuid(lessonId)) {
    return { error: t("action.chooseLessonOrEnd") };
  }
  const chapter = await db.chapter.findUnique({ where: { id: chapterId }, select: { id: true } });
  if (!chapter) return { error: t("action.chapterGone") };
  if (lessonId) {
    const lesson = await db.lesson.findFirst({ where: { id: lessonId, chapterId }, select: { id: true } });
    if (!lesson) return { error: t("action.lessonNotInChapter") };
  }
  return { chapterId, lessonId };
}

/** A whole number from a form field, kept within bounds, or the fallback when blank or not a number. */
function clampInt(raw: FormDataEntryValue | null, min: number, max: number, fallback: number) {
  const n = Math.round(Number(String(raw ?? "").trim()));
  return Number.isFinite(n) && String(raw ?? "").trim() !== "" ? Math.min(max, Math.max(min, n)) : fallback;
}

function revalidateQuizLists() {
  revalidatePath("/tutor/quizzes");
  // Course editors show each chapter's quizzes.
  revalidatePath("/tutor/courses", "layout");
  revalidatePath("/quizzes");
}

export type CommitImportTarget =
  | { mode: "new"; title: string; chapterId: string; lessonId: string | null; style: QuizStyle }
  | { mode: "update"; quizId: string };

export type DraftQuestionInput = {
  type: QuestionType;
  prompt: string;
  points: number;
  explanation: string;
  options: string[];
  correctAnswer: unknown;
};

export async function commitImport(
  target: CommitImportTarget,
  drafts: DraftQuestionInput[]
): Promise<{ error?: string } | undefined> {
  const t = await getT();
  await requireTutor();
  if (drafts.length === 0) return { error: t("action.nothingToImport") };
  if (target.mode === "new" && !target.title.trim()) return { error: t("action.quizTitleRequired") };

  let placement: { chapterId: string; lessonId: string | null } | null = null;
  if (target.mode === "new") {
    const resolved = await resolvePlacement(target.chapterId, target.lessonId);
    if ("error" in resolved) return { error: resolved.error };
    placement = resolved;
  }

  const quizId = await db.$transaction(async (tx) => {
    let id: string;
    if (target.mode === "new") {
      if (!placement) throw new Error("A new quiz needs a placement.");
      const quiz = await tx.quiz.create({
        data: {
          title: target.title.trim(),
          chapterId: placement.chapterId,
          lessonId: placement.lessonId,
          importBatchId: randomUUID(),
          status: "DRAFT",
          style: parseQuizStyle(target.style),
          ...(target.style === "TRYOUT" ? TRYOUT_DEFAULTS : {}),
          ...(target.style === "EXAM" ? EXAM_DEFAULTS : {}),
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

  revalidateQuizLists();
  redirect(`/tutor/quizzes/${quizId}`);
}

export async function deleteQuiz(quizId: string) {
  await requireTutor();
  await db.quiz.delete({ where: { id: quizId } });
  revalidateQuizLists();
  redirect("/tutor/quizzes");
}

export type CreateQuizState = { error?: string };

export type DuplicateQuizState = { error?: string };

/**
 * Copies a quiz's questions into a new draft quiz — usually in another style,
 * so the same material can run as, say, a classic quiz and mastery practice
 * after one sesi without writing the questions twice.
 *
 * Only content is copied. Results, attempts and practice progress belong to
 * the original, and the copy isn't tied to the original's import batch, so
 * re-uploading that sheet still updates the original rather than both.
 */
export async function duplicateQuiz(
  sourceQuizId: string,
  _prev: DuplicateQuizState,
  formData: FormData
): Promise<DuplicateQuizState> {
  const t = await getT();
  await requireTutor();
  const source = await db.quiz.findUnique({
    where: { id: sourceQuizId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!source) return { error: t("action.quizGone") };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: t("action.quizTitleRequired") };
  const placement = await resolvePlacement(formData.get("chapterId"), formData.get("lessonId"));
  if ("error" in placement) return { error: placement.error };
  const style = parseQuizStyle(formData.get("style"));

  // A try-out copied as a try-out keeps its clock and attempts; any other
  // quiz becoming a try-out starts on the house defaults.
  const tryout =
    !isTimedStyle(style)
      ? {}
      : isTimedStyle(source.style)
        ? {
            timeLimitMinutes: source.timeLimitMinutes ?? TRYOUT_DEFAULTS.timeLimitMinutes,
            // An exam is one go at it, however many attempts the source allowed.
            maxAttempts: style === "EXAM" ? 1 : source.maxAttempts,
            randomizeQuestionOrder: source.randomizeQuestionOrder,
          }
        : style === "EXAM"
          ? EXAM_DEFAULTS
          : TRYOUT_DEFAULTS;

  // Likewise a drill copied as a drill keeps its skill, clock and target.
  const drill =
    style !== "DRILL"
      ? {}
      : source.style === "DRILL"
        ? { drillSkill: source.drillSkill, drillSeconds: source.drillSeconds, drillTarget: source.drillTarget }
        : DRILL_DEFAULTS;

  // A review copies its set size; it has no questions of its own to copy.
  const review =
    style !== "REVIEW" ? {} : { reviewCount: source.reviewCount ?? REVIEW_COUNT_DEFAULT };

  const copy = await db.$transaction(async (tx) => {
    const quiz = await tx.quiz.create({
      data: { title, ...placement, status: "DRAFT", style, ...tryout, ...drill, ...review },
    });
    await tx.question.createMany({
      data: source.questions.map((q) => ({
        quizId: quiz.id,
        order: q.order,
        type: q.type,
        prompt: q.prompt,
        points: q.points,
        explanation: q.explanation,
        options: q.options,
        correctAnswer: q.correctAnswer as Prisma.InputJsonValue,
      })),
    });
    return quiz;
  });

  revalidateQuizLists();
  redirect(`/tutor/quizzes/${copy.id}`);
}

export async function createQuiz(_prev: CreateQuizState, formData: FormData): Promise<CreateQuizState> {
  const t = await getT();
  await requireTutor();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: t("action.quizTitleRequired") };
  const placement = await resolvePlacement(formData.get("chapterId"), formData.get("lessonId"));
  if ("error" in placement) return { error: placement.error };

  const style = parseQuizStyle(formData.get("style"));
  const quiz = await db.quiz.create({
    data: {
      title,
      ...placement,
      status: "DRAFT",
      style,
      // New try-outs and drills start on their defaults.
      ...(style === "TRYOUT" ? TRYOUT_DEFAULTS : {}),
      ...(style === "EXAM" ? EXAM_DEFAULTS : {}),
      ...(style === "DRILL" ? DRILL_DEFAULTS : {}),
      ...(style === "REVIEW" ? { reviewCount: REVIEW_COUNT_DEFAULT } : {}),
    },
  });
  revalidateQuizLists();
  redirect(`/tutor/quizzes/${quiz.id}`);
}

export async function updateQuizMeta(quizId: string, formData: FormData) {
  await requireTutor();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  // The picker only offers valid placements; a stale one (a lesson deleted
  // meanwhile) keeps the quiz where it was rather than failing the whole save.
  const placement = await resolvePlacement(formData.get("chapterId"), formData.get("lessonId"));

  const style = parseQuizStyle(formData.get("style"));
  // The try-out fields stay in the form (hidden) whatever the style, so they
  // are only read for a try-out. A classic quiz is untimed with unlimited
  // retakes — before styles existed those settings did nothing for it anyway.
  let tryout: { timeLimitMinutes: number | null; maxAttempts: number | null; randomizeQuestionOrder: boolean } = {
    timeLimitMinutes: null,
    maxAttempts: null,
    randomizeQuestionOrder: false,
  };
  if (isTimedStyle(style)) {
    const timeLimitRaw = String(formData.get("timeLimitMinutes") ?? "").trim();
    const maxAttemptsRaw = String(formData.get("maxAttempts") ?? "").trim();
    tryout = {
      // A timed quiz is defined by its clock, so a blank limit takes the default.
      timeLimitMinutes: timeLimitRaw ? Math.max(1, Math.round(Number(timeLimitRaw))) : TRYOUT_DEFAULTS.timeLimitMinutes,
      // An exam is one go at it, whatever the form says.
      maxAttempts: style === "EXAM" ? 1 : maxAttemptsRaw ? Math.max(1, Math.round(Number(maxAttemptsRaw))) : null,
      randomizeQuestionOrder: formData.get("randomizeQuestionOrder") === "on",
    };
  }

  // Same for the drill fields: read only for a drill, cleared otherwise.
  const drill =
    style === "DRILL"
      ? {
          drillSkill: parseDrillSkill(formData.get("drillSkill")),
          drillSeconds: clampInt(formData.get("drillSeconds"), DRILL_SECONDS_MIN, DRILL_SECONDS_MAX, DRILL_DEFAULTS.drillSeconds),
          drillTarget: clampInt(formData.get("drillTarget"), 1, 999, DRILL_DEFAULTS.drillTarget),
        }
      : { drillSkill: null, drillSeconds: null, drillTarget: null };

  const review =
    style === "REVIEW"
      ? { reviewCount: clampInt(formData.get("reviewCount"), 1, REVIEW_COUNT_MAX, REVIEW_COUNT_DEFAULT) }
      : { reviewCount: null };

  await db.quiz.update({
    where: { id: quizId },
    data: {
      title,
      style,
      ...tryout,
      ...drill,
      ...review,
      ...("error" in placement ? {} : placement),
    },
  });
  revalidatePath(`/tutor/quizzes/${quizId}`);
  revalidateQuizLists();
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
/** Placeholder content for a freshly added question, in the tutor's language. */
function defaultQuestionData(
  t: Awaited<ReturnType<typeof getT>>
): Record<QuestionType, { prompt: string; options: string[]; correctAnswer: unknown }> {
  const prompt = t("qEditor.newQuestion");
  const options = [t("qEditor.optionA"), t("qEditor.optionB")];
  return {
    MULTIPLE_CHOICE: { prompt, options, correctAnswer: { letter: "A" } },
    MULTI_SELECT: { prompt, options, correctAnswer: { letters: ["A"] } },
    NUMERIC: { prompt, options: [], correctAnswer: { value: 0, tolerance: 0 } },
    SHORT_TEXT: { prompt, options: [], correctAnswer: { kind: "exact", value: t("qEditor.sampleAnswer") } },
    CODE: { prompt, options: [], correctAnswer: { testCases: [] } },
    STEPS: {
      prompt,
      options: [],
      correctAnswer: {
        steps: [1, 2].map((n) => ({ prompt: t("qEditor.stepN", { n }), answer: t("qEditor.sampleAnswer") })),
      },
    },
    MULTI_PART: {
      prompt,
      options: [],
      correctAnswer: {
        parts: PART_LETTERS.slice(0, 2).map((letter) => ({
          prompt: t("qEditor.partN", { letter }),
          marks: 1,
          answer: t("qEditor.sampleAnswer"),
        })),
      },
    },
    FIND_MISTAKE: {
      prompt,
      options: [],
      correctAnswer: { lines: [1, 2].map((n) => t("qEditor.lineN", { n })), wrongIndex: 1, correction: "" },
    },
    PROJECT_STEP: {
      prompt,
      options: [],
      correctAnswer: {
        stage: t("qEditor.stepN", { n: 1 }),
        title: prompt,
        example: { input: "", expectedOutput: "" },
        tests: [],
        hint: "",
        addFiles: {},
      },
    },
  };
}

export async function addQuestion(quizId: string, type: QuestionType) {
  await requireTutor();
  const defaults = defaultQuestionData(await getT())[type];
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
  const t = await getT();
  await requireTutor();
  const question = await db.question.findUniqueOrThrow({ where: { id: questionId } });
  if (!input.prompt.trim()) return { error: t("action.promptRequired") };

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
  if (!isTimedStyle(quiz.style) || !quiz.timeLimitMinutes) return;

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
