"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";

export async function createTrack(formData: FormData) {
  const tutor = await requireTutor();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const track = await db.track.create({
    data: {
      title,
      description: String(formData.get("description") ?? "").trim(),
      ownerId: tutor.id,
    },
  });
  redirect(`/tutor/tracks/${track.id}`);
}

export async function updateTrack(trackId: string, formData: FormData) {
  await requireTutor();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  await db.track.update({
    where: { id: trackId },
    data: {
      title,
      description: String(formData.get("description") ?? "").trim(),
    },
  });
  revalidatePath(`/tutor/tracks/${trackId}`);
}

export async function deleteTrack(trackId: string) {
  await requireTutor();
  await db.track.delete({ where: { id: trackId } });
  redirect("/tutor/tracks");
}

export async function setEnrollment(trackId: string, studentId: string, enrolled: boolean) {
  await requireTutor();
  if (enrolled) {
    await db.enrollment.upsert({
      where: { studentId_trackId: { studentId, trackId } },
      create: { studentId, trackId },
      update: {},
    });
  } else {
    await db.enrollment.deleteMany({ where: { studentId, trackId } });
  }
  revalidatePath(`/tutor/tracks/${trackId}`);
}
