import type { BlockType, SubmissionStatus } from "@/generated/prisma/enums";

/**
 * A chapter's contents as one ordered list: lessons and the quizzes attached to
 * them, interleaved. Quizzes stay children of a lesson in the data model — this
 * only flattens them for display, so a quiz always sits directly beneath the
 * lesson it belongs to.
 */
export type CourseItem = {
  key: string;
  kind: "lesson" | "quiz";
  title: string;
  href: string;
  /** Short medium label — "Video", "Reading", "Quiz". Derived, never authored. */
  label: string;
  complete: boolean;
  /** Quizzes only: percentage once graded, and how the submission stands. */
  scorePct: number | null;
  status: SubmissionStatus | null;
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
export function lessonTypeLabel(blockTypes: BlockType[]): string {
  const has = (t: BlockType) => blockTypes.includes(t);
  if (has("VIDEO_EMBED")) return "Video";
  if (has("FILE_ATTACHMENT")) return "File";
  if (has("VISUALIZATION")) return "Interactive";
  if (has("CODE_EDITOR")) return "Python";
  if (has("CODE_SNIPPET") || has("EQUATION") || has("MARKDOWN")) return "Reading";
  return "Lesson";
}

type LessonInput = {
  id: string;
  title: string;
  blocks: { type: BlockType }[];
  progress: { completedAt: Date | null }[];
  quizzes: {
    id: string;
    title: string;
    questions: { points: number }[];
    submissions: { status: SubmissionStatus; autoScore: number | null; manualScore: number | null }[];
  }[];
};

export function buildChapterItems(courseId: string, lessons: LessonInput[]): CourseItem[] {
  return lessons.flatMap((lesson) => {
    const lessonItem: CourseItem = {
      key: `lesson-${lesson.id}`,
      kind: "lesson",
      title: lesson.title,
      href: `/courses/${courseId}/lessons/${lesson.id}`,
      label: lessonTypeLabel(lesson.blocks.map((b) => b.type)),
      complete: lesson.progress[0]?.completedAt != null,
      scorePct: null,
      status: null,
    };

    const quizItems: CourseItem[] = lesson.quizzes.map((quiz) => {
      const submission = quiz.submissions[0] ?? null;
      const totalPoints = quiz.questions.reduce((n, q) => n + q.points, 0);
      const score =
        submission === null
          ? null
          : submission.status === "REVIEWED"
            ? (submission.autoScore ?? 0) + (submission.manualScore ?? 0)
            : (submission.autoScore ?? 0);
      return {
        key: `quiz-${quiz.id}`,
        kind: "quiz",
        title: quiz.title,
        href: `/quizzes/${quiz.id}`,
        label: "Quiz",
        complete: submission !== null,
        scorePct:
          submission !== null && totalPoints > 0 ? ((score ?? 0) / totalPoints) * 100 : null,
        status: submission?.status ?? null,
      };
    });

    return [lessonItem, ...quizItems];
  });
}

/**
 * Rollup shown against a chapter. Naming the remainder ("2 quizzes left")
 * rather than a bare count tells the student what's actually outstanding.
 */
export function chapterStatus(items: CourseItem[]): { complete: boolean; label: string } {
  const outstanding = items.filter((i) => !i.complete);
  if (outstanding.length === 0) return { complete: true, label: "Complete" };

  const quizzes = outstanding.filter((i) => i.kind === "quiz").length;
  if (quizzes === outstanding.length) {
    return { complete: false, label: `${quizzes} quiz${quizzes === 1 ? "" : "zes"} left` };
  }
  const n = outstanding.length;
  return { complete: false, label: `${n} item${n === 1 ? "" : "s"} left` };
}
