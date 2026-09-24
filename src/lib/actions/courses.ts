"use server";

import { revalidatePath } from "next/cache";
import { getT } from "@/lib/i18n/server";
import { ATTACHMENTS_BUCKET, createSupabaseAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";
import type { CourseStatus } from "@/generated/prisma/enums";

/** A catalogue facet from a form: trimmed, and empty means "not set". */
function facet(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim().replace(/\s+/g, " ");
  return value || null;
}

const COURSE_STATUSES: CourseStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export async function createCourse(formData: FormData) {
  const tutor = await requireTutor();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const course = await db.course.create({
    data: {
      title,
      description: String(formData.get("description") ?? "").trim(),
      subject: facet(formData, "subject"),
      curriculum: facet(formData, "curriculum"),
      level: facet(formData, "level"),
      // Starts hidden from students until the tutor publishes it.
      status: "DRAFT",
      ownerId: tutor.id,
    },
  });
  revalidatePath("/tutor/courses");
  redirect(`/tutor/courses/${course.id}`);
}

export async function updateCourse(courseId: string, formData: FormData) {
  await requireTutor();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const statusRaw = String(formData.get("status") ?? "");
  const accessRaw = String(formData.get("access") ?? "");
  await db.course.update({
    where: { id: courseId },
    data: {
      title,
      description: String(formData.get("description") ?? "").trim(),
      subject: facet(formData, "subject"),
      curriculum: facet(formData, "curriculum"),
      level: facet(formData, "level"),
      ...((COURSE_STATUSES as string[]).includes(statusRaw) ? { status: statusRaw as CourseStatus } : {}),
      // OPEN makes it the free course anyone signed in can start.
      ...(accessRaw === "OPEN" || accessRaw === "ENROLLED" ? { access: accessRaw } : {}),
    },
  });
  revalidateCourse(courseId);
}

export async function setCourseStatus(courseId: string, status: CourseStatus) {
  await requireTutor();
  await db.course.update({ where: { id: courseId }, data: { status } });
  revalidateCourse(courseId);
}

export async function deleteCourse(courseId: string) {
  await requireTutor();
  // Chapters refuse to go while they hold quizzes (so results are never lost by
  // accident). Deleting a whole course is the deliberate case: the tutor has
  // confirmed it takes the quizzes and their results too.
  await db.$transaction([
    db.quiz.deleteMany({ where: { chapter: { courseId } } }),
    db.course.delete({ where: { id: courseId } }),
  ]);
  revalidatePath("/tutor/quizzes");
  revalidatePath("/tutor/courses");
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
  revalidateEnrollment(courseId, [studentId]);
}

/** Enroll several students at once — the bulk "Assign course" on the Students list. */
export async function enrollStudents(courseId: string, studentIds: string[]): Promise<{ error?: string; count?: number }> {
  const t = await getT();
  await requireTutor();
  if (!courseId) return { error: t("action.pickCourse") };
  const students = await db.user.findMany({ where: { id: { in: studentIds }, role: "STUDENT" }, select: { id: true } });
  if (students.length === 0) return { error: t("action.pickOneStudent") };
  const { count } = await db.enrollment.createMany({
    data: students.map((s) => ({ studentId: s.id, courseId })),
    skipDuplicates: true,
  });
  revalidateEnrollment(courseId, students.map((s) => s.id));
  return { count };
}

function revalidateEnrollment(courseId: string, studentIds: string[]) {
  revalidatePath(`/tutor/courses/${courseId}`);
  revalidatePath("/tutor/courses");
  revalidatePath("/tutor/students");
  for (const id of studentIds) revalidatePath(`/tutor/students/${id}`);
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
  const t = await getT();
  await requireTutor();
  const file = formData.get("cover");
  if (!(file instanceof File) || file.size === 0) return { error: t("action.chooseImage") };
  const ext = COVER_TYPES[file.type];
  if (!ext) return { error: t("action.imageType") };
  if (file.size > MAX_COVER_BYTES) return { error: t("action.imageTooBig") };

  const course = await db.course.findUnique({ where: { id: courseId }, select: { coverImagePath: true } });
  if (!course) return { error: t("action.courseGone") };

  const path = `course-covers/${courseId}/${crypto.randomUUID()}.${ext}`;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from(ATTACHMENTS_BUCKET).upload(path, file, { contentType: file.type });
  if (error) return { error: t("action.uploadFailed", { message: error.message }) };

  await db.course.update({ where: { id: courseId }, data: { coverImagePath: path } });
  if (course.coverImagePath) {
    await supabase.storage.from(ATTACHMENTS_BUCKET).remove([course.coverImagePath]);
  }
  revalidateCourse(courseId);
  return { success: t("action.coverUpdated") };
}

export async function removeCourseCover(courseId: string) {
  await requireTutor();
  const course = await db.course.findUnique({ where: { id: courseId }, select: { coverImagePath: true } });
  if (!course?.coverImagePath) return;
  await db.course.update({ where: { id: courseId }, data: { coverImagePath: null } });
  await createSupabaseAdminClient().storage.from(ATTACHMENTS_BUCKET).remove([course.coverImagePath]);
  revalidateCourse(courseId);
}
