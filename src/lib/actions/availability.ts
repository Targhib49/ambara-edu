"use server";

import { revalidatePath } from "next/cache";
import { getT } from "@/lib/i18n/server";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";
import { parseTimeOfDay } from "@/lib/scheduling";

export type AvailabilityState = { error?: string; success?: string };

function revalidateScheduling() {
  revalidatePath("/tutor/sessions");
  revalidatePath("/sessions");
}

export async function addAvailability(
  _prev: AvailabilityState,
  formData: FormData
): Promise<AvailabilityState> {
  const t = await getT();
  const tutor = await requireTutor();

  const weekday = Number(formData.get("weekday"));
  const startMinute = parseTimeOfDay(String(formData.get("startTime") ?? ""));
  const durationMinutes = Number(formData.get("durationMinutes") ?? 60);

  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) return { error: t("action.pickDay") };
  if (startMinute === null) return { error: t("action.startTimeFormat") };
  if (!durationMinutes || durationMinutes < 15) {
    return { error: t("action.min15") };
  }
  if (startMinute + durationMinutes > 24 * 60) {
    return { error: t("action.pastMidnight") };
  }

  // Overlapping windows would generate duplicate slots for the same time.
  const sameDay = await db.availability.findMany({ where: { tutorId: tutor.id, weekday, active: true } });
  const clash = sameDay.find(
    (w) =>
      startMinute < w.startMinute + w.durationMinutes && w.startMinute < startMinute + durationMinutes
  );
  if (clash) return { error: t("action.overlaps") };

  await db.availability.create({
    data: { tutorId: tutor.id, weekday, startMinute, durationMinutes },
  });
  revalidateScheduling();
  return { success: t("action.windowAdded") };
}

export async function setAvailabilityActive(availabilityId: string, active: boolean) {
  const tutor = await requireTutor();
  await db.availability.updateMany({
    where: { id: availabilityId, tutorId: tutor.id },
    data: { active },
  });
  revalidateScheduling();
}

export async function deleteAvailability(availabilityId: string) {
  const tutor = await requireTutor();
  await db.availability.deleteMany({ where: { id: availabilityId, tutorId: tutor.id } });
  revalidateScheduling();
}
