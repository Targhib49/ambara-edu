/**
 * Progress arithmetic, kept as pure functions over rows the caller already
 * fetched — the course page and the dashboard both need these numbers from
 * queries they were making anyway, so recomputing them here costs no round trip.
 */
export type LessonWithProgress = {
  id: string;
  progress: { completedAt: Date | null; lastViewedAt: Date }[];
};

export type CourseProgress = {
  completed: number;
  total: number;
  pct: number;
  /** Where "Continue" should go: the lesson they were last in, else the first unfinished one. */
  resumeLessonId: string | null;
  started: boolean;
};

export function isLessonComplete(lesson: LessonWithProgress): boolean {
  return lesson.progress[0]?.completedAt != null;
}

/** `lessons` must already be in course order — the fallback resume point is positional. */
export function summarizeCourseProgress(lessons: LessonWithProgress[]): CourseProgress {
  const total = lessons.length;
  const completed = lessons.filter(isLessonComplete).length;
  const unfinished = lessons.filter((l) => !isLessonComplete(l));

  // Most recently opened unfinished lesson wins; otherwise start at the first
  // unfinished one. A fully complete course has nothing to resume.
  const lastViewed = unfinished
    .filter((l) => l.progress.length > 0)
    .sort(
      (a, b) => (b.progress[0]?.lastViewedAt.getTime() ?? 0) - (a.progress[0]?.lastViewedAt.getTime() ?? 0)
    )[0];

  return {
    completed,
    total,
    pct: total === 0 ? 0 : Math.round((completed / total) * 100),
    resumeLessonId: lastViewed?.id ?? unfinished[0]?.id ?? null,
    started: lessons.some((l) => l.progress.length > 0),
  };
}
