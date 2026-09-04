"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";

/**
 * A student may only record progress against a lesson they can actually see:
 * published, in a course they're enrolled on. Returns the owning course so the
 * caller can revalidate the right pages.
 */
async function visibleLesson(studentId: string, lessonId: string) {
  const lesson = await db.lesson.findFirst({
    where: {
      id: lessonId,
      status: "PUBLISHED",
      chapter: { course: { enrollments: { some: { studentId } } } },
    },
    select: { id: true, chapter: { select: { courseId: true } } },
  });
  if (!lesson) throw new Error("Lesson not found");
  return lesson;
}

/**
 * Called once when a student opens a lesson. Creates the progress row if it's
 * their first visit and refreshes lastViewedAt after that, which is what makes
 * "resume where you left off" possible. Never touches completedAt — opening a
 * lesson is not finishing it.
 */
export async function recordLessonView(lessonId: string) {
  const student = await requireStudent();
  await visibleLesson(student.id, lessonId);

  await db.lessonProgress.upsert({
    where: { studentId_lessonId: { studentId: student.id, lessonId } },
    create: { studentId: student.id, lessonId },
    update: { lastViewedAt: new Date() },
  });
  // Deliberately no revalidate: this fires on every lesson open, and busting
  // the cache each time would cost more than the freshness is worth. The
  // completion toggle below is what changes anything visible.
}

export async function setLessonComplete(lessonId: string, complete: boolean) {
  const student = await requireStudent();
  const lesson = await visibleLesson(student.id, lessonId);
  const completedAt = complete ? new Date() : null;

  await db.lessonProgress.upsert({
    where: { studentId_lessonId: { studentId: student.id, lessonId } },
    create: { studentId: student.id, lessonId, completedAt },
    update: { completedAt },
  });

  revalidatePath(`/courses/${lesson.chapter.courseId}`);
  revalidatePath(`/courses/${lesson.chapter.courseId}/lessons/${lessonId}`);
  revalidatePath("/dashboard");
}
