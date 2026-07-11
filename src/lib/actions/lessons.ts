"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";

async function trackIdOfLesson(lessonId: string) {
  const lesson = await db.lesson.findUniqueOrThrow({
    where: { id: lessonId },
    select: { module: { select: { trackId: true } } },
  });
  return lesson.module.trackId;
}

export async function createLesson(moduleId: string, formData: FormData) {
  await requireTutor();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const mod = await db.module.findUniqueOrThrow({ where: { id: moduleId } });
  const last = await db.lesson.findFirst({
    where: { moduleId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  await db.lesson.create({
    data: { moduleId, title, order: (last?.order ?? -1) + 1 },
  });
  revalidatePath(`/tutor/tracks/${mod.trackId}`);
}

export async function renameLesson(lessonId: string, formData: FormData) {
  await requireTutor();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  await db.lesson.update({ where: { id: lessonId }, data: { title } });
  const trackId = await trackIdOfLesson(lessonId);
  revalidatePath(`/tutor/tracks/${trackId}`);
  revalidatePath(`/tutor/tracks/${trackId}/lessons/${lessonId}`);
}

export async function deleteLesson(lessonId: string) {
  await requireTutor();
  const trackId = await trackIdOfLesson(lessonId);
  await db.lesson.delete({ where: { id: lessonId } });
  revalidatePath(`/tutor/tracks/${trackId}`);
}

export async function setLessonStatus(lessonId: string, status: "DRAFT" | "PUBLISHED") {
  await requireTutor();
  await db.lesson.update({ where: { id: lessonId }, data: { status } });
  const trackId = await trackIdOfLesson(lessonId);
  revalidatePath(`/tutor/tracks/${trackId}`);
  revalidatePath(`/tutor/tracks/${trackId}/lessons/${lessonId}`);
}

export async function moveLesson(lessonId: string, direction: "up" | "down") {
  await requireTutor();
  const lesson = await db.lesson.findUniqueOrThrow({ where: { id: lessonId } });
  const neighbor = await db.lesson.findFirst({
    where: {
      moduleId: lesson.moduleId,
      order: direction === "up" ? { lt: lesson.order } : { gt: lesson.order },
    },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return;
  await db.$transaction([
    db.lesson.update({ where: { id: lesson.id }, data: { order: neighbor.order } }),
    db.lesson.update({ where: { id: neighbor.id }, data: { order: lesson.order } }),
  ]);
  const trackId = await trackIdOfLesson(lessonId);
  revalidatePath(`/tutor/tracks/${trackId}`);
}
