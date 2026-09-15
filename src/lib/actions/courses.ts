"use server";

import { revalidatePath } from "next/cache";
import { ATTACHMENTS_BUCKET, createSupabaseAdminClient } from "@/lib/supabase/admin";
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

export async function updateCourse(courseId: string, formData: FormData) {
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

const MAX_COVER_BYTES = 3 * 1024 * 1024;
const COVER_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export type CoverState = { error?: string; success?: string };

function revalidateCourse(courseId: string) {
  revalidatePath(`/tutor/courses/${courseId}`);
  revalidatePath("/tutor/courses");
  revalidatePath("/courses");
  revalidatePath(`/courses/${courseId}`);
}

/**
 * Replace a course's cover image. The new file is uploaded before the old one
 * is removed, so a failed upload never leaves the course without a cover.
 * Checked here as well as in the browser: the size limit is what keeps the
 * request under Vercel's payload ceiling, so it can't only live client-side.
 */
export async function setCourseCover(courseId: string, _prev: CoverState, formData: FormData): Promise<CoverState> {
  await requireTutor();
  const file = formData.get("cover");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an image first." };
  const ext = COVER_TYPES[file.type];
  if (!ext) return { error: "Use a JPG, PNG or WebP image." };
  if (file.size > MAX_COVER_BYTES) return { error: "That image is over 3 MB — try a smaller or compressed one." };

  const course = await db.course.findUnique({ where: { id: courseId }, select: { coverImagePath: true } });
  if (!course) return { error: "That course no longer exists." };

  const path = `course-covers/${courseId}/${crypto.randomUUID()}.${ext}`;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from(ATTACHMENTS_BUCKET).upload(path, file, { contentType: file.type });
  if (error) return { error: `Upload failed: ${error.message}` };

  await db.course.update({ where: { id: courseId }, data: { coverImagePath: path } });
  if (course.coverImagePath) {
    await supabase.storage.from(ATTACHMENTS_BUCKET).remove([course.coverImagePath]);
  }
  revalidateCourse(courseId);
  return { success: "Cover updated ✓" };
}

export async function removeCourseCover(courseId: string) {
  await requireTutor();
  const course = await db.course.findUnique({ where: { id: courseId }, select: { coverImagePath: true } });
  if (!course?.coverImagePath) return;
  await db.course.update({ where: { id: courseId }, data: { coverImagePath: null } });
  await createSupabaseAdminClient().storage.from(ATTACHMENTS_BUCKET).remove([course.coverImagePath]);
  revalidateCourse(courseId);
}
