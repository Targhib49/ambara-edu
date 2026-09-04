"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";

export async function createCourse(formData: FormData) {
  const tutor = await requireTutor();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const course = await db.course.create({
    data: {
      title,
      description: String(formData.get("description") ?? "").trim(),
      ownerId: tutor.id,
    },
  });
  redirect(`/tutor/courses/${course.id}`);
}

export async function updateTrack(courseId: string, formData: FormData) {
  await requireTutor();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  await db.course.update({
    where: { id: courseId },
    data: {
      title,
      description: String(formData.get("description") ?? "").trim(),
    },
  });
  revalidatePath(`/tutor/courses/${courseId}`);
}

export async function deleteCourse(courseId: string) {
  await requireTutor();
  await db.course.delete({ where: { id: courseId } });
  redirect("/tutor/courses");
}

export async function setEnrollment(courseId: string, studentId: string, enrolled: boolean) {
  await requireTutor();
  if (enrolled) {
    await db.enrollment.upsert({
      where: { studentId_courseId: { studentId, courseId } },
      create: { studentId, courseId },
      update: {},
    });
  } else {
    await db.enrollment.deleteMany({ where: { studentId, courseId } });
  }
  revalidatePath(`/tutor/courses/${courseId}`);
}
