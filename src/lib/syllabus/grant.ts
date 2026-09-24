import { db } from "@/lib/db";
import { syllabusSteps } from "./access";

/**
 * Enrols a student in the courses of a syllabus that are open to them.
 * Courses behind a gate they haven't passed are left out; they're written the
 * moment the gate opens, so access always follows from the one rule rather
 * than from whoever remembered to grant it.
 */
export async function grantSyllabus(studentId: string, syllabusId: string) {
  const steps = await syllabusSteps(studentId, syllabusId);
  const open = steps.filter((s) => s.unlocked).map((s) => s.courseId);
  if (!open.length) return;
  await db.enrollment.createMany({
    data: open.map((courseId) => ({ studentId, courseId, source: "SYLLABUS" as const, syllabusId })),
    skipDuplicates: true,
  });
}

/**
 * Opens the next course once its gate is passed. Called when the student
 * looks at the syllabus, so a course they've just earned is there when they
 * go for it.
 */
export async function refreshSyllabusAccess(studentId: string, syllabusId: string) {
  const joined = await db.enrollment.findFirst({ where: { studentId, syllabusId }, select: { studentId: true } });
  if (!joined) return;
  await grantSyllabus(studentId, syllabusId);
}

/**
 * Opens the syllabi whose invoice has just been paid — Targhib's rule is
 * payment first, then access, so this is what makes the second half happen
 * without him having to remember it.
 */
export async function grantPaidSyllabusRequests(invoiceId: string): Promise<string[]> {
  const requests = await db.syllabusRequest.findMany({
    where: { invoiceId, status: "AWAITING_PAYMENT" },
    select: { id: true, studentId: true, syllabusId: true },
  });
  for (const request of requests) {
    await grantSyllabus(request.studentId, request.syllabusId);
    await db.syllabusRequest.update({ where: { id: request.id }, data: { status: "GRANTED" } });
  }
  // Refreshing the pages is the caller's job: this runs from a server action
  // during a request, and from scripts where there's no cache to clear.
  return requests.map((r) => r.syllabusId);
}
