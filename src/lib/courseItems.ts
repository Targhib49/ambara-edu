import type { BlockType, QuizStyle, SubmissionStatus } from "@/generated/prisma/enums";
import type { MessageKey } from "@/lib/i18n/messages";
import { isGradedStyle, quizStyleKey } from "@/lib/quiz/styles";

/**
 * A chapter's contents as one ordered list, the way the syllabus reads: each
 * lesson followed by its own quizzes, then the chapter's tests (quizzes not
 * tied to one lesson) after the last lesson.
 */
export type CourseItem = {
  key: string;
  kind: "lesson" | "quiz";
  title: string;
  href: string;
  /** Short medium label — "Video", "Reading", "Quiz" — as a dictionary key. Derived, never authored. */
  labelKey: MessageKey;
  complete: boolean;
  /**
   * Practice is optional: it earns a completion mark, but never holds a
   * chapter open or becomes the suggested next step — it isn't graded work.
   */
  optional: boolean;
  /** Graded quizzes only: percentage once graded, and how the submission stands. */
  scorePct: number | null;
  status: SubmissionStatus | null;
  /** A guided project that's started but not finished: steps passed so far. */
  projectSteps?: { passed: number; total: number } | null;
};

/**
 * What kind of thing a lesson mostly is, worked out from the blocks it holds
 * rather than a field the tutor has to maintain. Priority runs from the most
 * distinctive medium to the least: a lesson with a video reads as a video even
 * if it also carries notes.
 *
 * Attachments say "File" rather than "PDF" on purpose — telling a PDF from a
 * worksheet needs the block's JSON payload, and loading every block's data for
 * a whole course to refine one label isn't worth the query.
 */
export function lessonTypeKey(blockTypes: BlockType[]): MessageKey {
  const has = (t: BlockType) => blockTypes.includes(t);
  if (has("VIDEO_EMBED")) return "outline.type.video";
  if (has("FILE_ATTACHMENT")) return "outline.type.file";
  if (has("VISUALIZATION")) return "outline.type.interactive";
  if (has("CODE_EDITOR")) return "outline.type.python";
  if (has("CODE_SNIPPET") || has("EQUATION") || has("MARKDOWN")) return "outline.type.reading";
  return "outline.type.lesson";
}

type QuizInput = {
  id: string;
  title: string;
  style: QuizStyle;
  questions: { points: number }[];
  submissions: { status: SubmissionStatus; autoScore: number | null; manualScore: number | null }[];
  practiceProgress: { completedAt: Date | null }[];
  /** Guided projects only: the student's progress, if they've opened it. */
  projectProgress?: { passedIds: unknown }[];
};

/** Steps a student has passed in a started project, or null if it isn't one they've started. */
export function projectStepsOf(quiz: { style: QuizStyle; questions: unknown[]; projectProgress?: { passedIds: unknown }[] }) {
  const progress = quiz.style === "PROJECT" ? quiz.projectProgress?.[0] : undefined;
  if (!progress) return null;
  const passed = Array.isArray(progress.passedIds) ? progress.passedIds.length : 0;
  return { passed: Math.min(passed, quiz.questions.length), total: quiz.questions.length };
}

type LessonInput = {
  id: string;
  title: string;
  blocks: { type: BlockType }[];
  progress: { completedAt: Date | null }[];
  quizzes: QuizInput[];
};

function quizItem(quiz: QuizInput, labelKey: MessageKey): CourseItem {
  const base = { key: `quiz-${quiz.id}`, kind: "quiz" as const, title: quiz.title, href: `/quizzes/${quiz.id}` };

  if (!isGradedStyle(quiz.style)) {
    return {
      ...base,
      labelKey: quizStyleKey(quiz.style),
      complete: quiz.practiceProgress[0]?.completedAt != null,
      optional: true,
      scorePct: null,
      status: null,
    };
  }

  const submission = quiz.submissions[0] ?? null;
  const totalPoints = quiz.questions.reduce((n, q) => n + q.points, 0);
  const score =
    submission === null
      ? null
      : submission.status === "REVIEWED"
        ? (submission.autoScore ?? 0) + (submission.manualScore ?? 0)
        : (submission.autoScore ?? 0);
  return {
    ...base,
    // A guided project says so, wherever it sits in the chapter.
    labelKey: quiz.style === "PROJECT" ? quizStyleKey(quiz.style) : labelKey,
    complete: submission !== null,
    optional: false,
    scorePct: submission !== null && totalPoints > 0 ? ((score ?? 0) / totalPoints) * 100 : null,
    status: submission?.status ?? null,
    projectSteps: submission === null ? projectStepsOf(quiz) : null,
  };
}

export function buildChapterItems(courseId: string, lessons: LessonInput[], chapterTests: QuizInput[] = []): CourseItem[] {
  const lessonItems = lessons.flatMap((lesson) => {
    const lessonItem: CourseItem = {
      key: `lesson-${lesson.id}`,
      kind: "lesson",
      title: lesson.title,
      href: `/courses/${courseId}/lessons/${lesson.id}`,
      labelKey: lessonTypeKey(lesson.blocks.map((b) => b.type)),
      complete: lesson.progress[0]?.completedAt != null,
      optional: false,
      scorePct: null,
      status: null,
    };

    return [lessonItem, ...lesson.quizzes.map((quiz) => quizItem(quiz, "outline.type.quiz"))];
  });
  return [...lessonItems, ...chapterTests.map((quiz) => quizItem(quiz, "outline.type.chapterTest"))];
}

export type ChapterStatus = { complete: boolean; quizzesLeft: number; itemsLeft: number };

/**
 * Rollup shown against a chapter, counting only required items. The label
 * names the remainder ("2 quizzes left") rather than a bare count, so the
 * student sees what's actually outstanding.
 */
export function chapterStatus(items: CourseItem[]): ChapterStatus {
  const outstanding = items.filter((i) => !i.complete && !i.optional);
  return {
    complete: outstanding.length === 0,
    quizzesLeft: outstanding.filter((i) => i.kind === "quiz").length,
    itemsLeft: outstanding.length,
  };
}
