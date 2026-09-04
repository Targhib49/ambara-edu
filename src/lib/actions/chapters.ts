"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";

export async function createChapter(courseId: string, formData: FormData) {
  await requireTutor();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const last = await db.chapter.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  await db.chapter.create({
    data: { courseId, title, order: (last?.order ?? -1) + 1 },
  });
  revalidatePath(`/tutor/courses/${courseId}`);
}

export async function renameChapter(chapterId: string, formData: FormData) {
  await requireTutor();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const chapter = await db.chapter.update({ where: { id: chapterId }, data: { title } });
  revalidatePath(`/tutor/courses/${chapter.courseId}`);
}

export async function deleteChapter(chapterId: string) {
  await requireTutor();
  const chapter = await db.chapter.delete({ where: { id: chapterId } });
  revalidatePath(`/tutor/courses/${chapter.courseId}`);
}

export async function moveChapter(chapterId: string, direction: "up" | "down") {
  await requireTutor();
  const chapter = await db.chapter.findUniqueOrThrow({ where: { id: chapterId } });
  const neighbor = await db.chapter.findFirst({
    where: {
      courseId: chapter.courseId,
      order: direction === "up" ? { lt: chapter.order } : { gt: chapter.order },
    },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return;
  await db.$transaction([
    db.chapter.update({ where: { id: chapter.id }, data: { order: neighbor.order } }),
    db.chapter.update({ where: { id: neighbor.id }, data: { order: chapter.order } }),
  ]);
  revalidatePath(`/tutor/courses/${chapter.courseId}`);
}
