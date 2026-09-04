"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";

async function courseIdOfLesson(lessonId: string) {
  const lesson = await db.lesson.findUniqueOrThrow({
    where: { id: lessonId },
    select: { chapter: { select: { courseId: true } } },
  });
  return lesson.chapter.courseId;
}

export async function createLesson(chapterId: string, formData: FormData) {
  await requireTutor();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const chapter = await db.chapter.findUniqueOrThrow({ where: { id: chapterId } });
  const last = await db.lesson.findFirst({
    where: { chapterId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  await db.lesson.create({
    data: { chapterId, title, order: (last?.order ?? -1) + 1 },
  });
  revalidatePath(`/tutor/courses/${chapter.courseId}`);
}

export async function renameLesson(lessonId: string, formData: FormData) {
  await requireTutor();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  await db.lesson.update({ where: { id: lessonId }, data: { title } });
  const courseId = await courseIdOfLesson(lessonId);
  revalidatePath(`/tutor/courses/${courseId}`);
  revalidatePath(`/tutor/courses/${courseId}/lessons/${lessonId}`);
}

export async function deleteLesson(lessonId: string) {
  await requireTutor();
  const courseId = await courseIdOfLesson(lessonId);
  await db.lesson.delete({ where: { id: lessonId } });
  revalidatePath(`/tutor/courses/${courseId}`);
}

export async function setLessonStatus(lessonId: string, status: "DRAFT" | "PUBLISHED") {
  await requireTutor();
  await db.lesson.update({ where: { id: lessonId }, data: { status } });
  const courseId = await courseIdOfLesson(lessonId);
  revalidatePath(`/tutor/courses/${courseId}`);
  revalidatePath(`/tutor/courses/${courseId}/lessons/${lessonId}`);
}

export async function moveLesson(lessonId: string, direction: "up" | "down") {
  await requireTutor();
  const lesson = await db.lesson.findUniqueOrThrow({ where: { id: lessonId } });
  const neighbor = await db.lesson.findFirst({
    where: {
      chapterId: lesson.chapterId,
      order: direction === "up" ? { lt: lesson.order } : { gt: lesson.order },
    },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return;
  await db.$transaction([
    db.lesson.update({ where: { id: lesson.id }, data: { order: neighbor.order } }),
    db.lesson.update({ where: { id: neighbor.id }, data: { order: lesson.order } }),
  ]);
  const courseId = await courseIdOfLesson(lessonId);
  revalidatePath(`/tutor/courses/${courseId}`);
}
