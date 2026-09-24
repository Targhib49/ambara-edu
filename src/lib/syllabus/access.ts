import { db } from "@/lib/db";
import { courseScores, type CourseScore } from "./score";

/** Why a course in a syllabus is or isn't open to a student. */
export type CourseGate =
  | { state: "open" }
  | { state: "locked"; afterTitle: string; needed: number; have: number }
  | { state: "passed"; score: number };

export type SyllabusStep = {
  id: string;
  courseId: string;
  title: string;
  order: number;
  passScore: number;
  requiresPrevious: boolean;
  score: CourseScore;
  passed: boolean;
  /** Whether the student may open it now. */
  unlocked: boolean;
  gate: CourseGate;
};

/**
 * A syllabus as one student sees it: each course in order, what they've
 * scored, and which ones are open.
 *
 * The rule is a chain — a course with `requiresPrevious` waits for the course
 * before it to reach its own pass mark. Once a course opens it stays open,
 * even if a later regrade drops an earlier score, because taking access back
 * from someone mid-lesson is worse than the odd student being a few points
 * short.
 */
export async function syllabusSteps(studentId: string, syllabusId: string): Promise<SyllabusStep[]> {
  const rows = await db.syllabusCourse.findMany({
    where: { syllabusId },
    orderBy: { order: "asc" },
    include: { course: { select: { id: true, title: true } } },
  });
  const scores = await courseScores(studentId, rows.map((r) => r.course.id));
  const enrolled = new Set(
    (await db.enrollment.findMany({ where: { studentId, courseId: { in: rows.map((r) => r.course.id) } }, select: { courseId: true } })).map(
      (e) => e.courseId
    )
  );

  const steps: SyllabusStep[] = [];
  let previous: { title: string; passed: boolean; passScore: number; pct: number } | null = null;
  for (const row of rows) {
    const score = scores.get(row.course.id) ?? { earned: 0, total: 0, pct: 0, quizzes: 0, submitted: 0 };
    const passed = score.pct >= row.passScore;
    // The first course is always open; a later one waits on the one before it,
    // unless the student is already enrolled — access once given isn't taken back.
    const gatedOn = row.requiresPrevious ? previous : null;
    const unlocked = !gatedOn || gatedOn.passed || enrolled.has(row.course.id);
    steps.push({
      id: row.id,
      courseId: row.course.id,
      title: row.course.title,
      order: row.order,
      passScore: row.passScore,
      requiresPrevious: row.requiresPrevious,
      score,
      passed,
      unlocked,
      gate: unlocked
        ? passed
          ? { state: "passed", score: score.pct }
          : { state: "open" }
        : { state: "locked", afterTitle: gatedOn!.title, needed: gatedOn!.passScore, have: gatedOn!.pct },
    });
    previous = { title: row.course.title, passed, passScore: row.passScore, pct: score.pct };
  }
  return steps;
}

/**
 * Whether a student may open a course, and why. Enrollment is the only thing
 * that grants access — a course open to everyone and a syllabus a student has
 * joined both write one — so this answers with what to do about it rather
 * than inventing a second way in.
 */
export type CourseAdmission =
  | { allowed: true }
  | { allowed: false; reason: "enroll-open" } // open to all: enrol them and let them in
  | { allowed: false; reason: "locked"; syllabusTitle: string; afterTitle: string; needed: number; have: number }
  | { allowed: false; reason: "no-access" };

export async function courseAdmission(studentId: string, courseId: string): Promise<CourseAdmission> {
  const course = await db.course.findUnique({ where: { id: courseId }, select: { access: true, status: true } });
  if (!course || course.status !== "PUBLISHED") return { allowed: false, reason: "no-access" };

  const enrollment = await db.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
    select: { expiresAt: true },
  });
  if (enrollment && (!enrollment.expiresAt || enrollment.expiresAt.getTime() > Date.now())) return { allowed: true };

  if (course.access === "OPEN") return { allowed: false, reason: "enroll-open" };

  // In a syllabus the student is in, but behind a gate they haven't passed.
  const inSyllabi = await db.syllabusCourse.findMany({
    where: { courseId, syllabus: { status: "PUBLISHED" } },
    select: { syllabusId: true, syllabus: { select: { title: true } } },
  });
  for (const row of inSyllabi) {
    const joined = await db.enrollment.findFirst({ where: { studentId, syllabusId: row.syllabusId }, select: { studentId: true } });
    if (!joined) continue;
    const steps = await syllabusSteps(studentId, row.syllabusId);
    const step = steps.find((s) => s.courseId === courseId);
    if (step && step.gate.state === "locked") {
      return {
        allowed: false,
        reason: "locked",
        syllabusTitle: row.syllabus.title,
        afterTitle: step.gate.afterTitle,
        needed: step.gate.needed,
        have: step.gate.have,
      };
    }
  }
  return { allowed: false, reason: "no-access" };
}
