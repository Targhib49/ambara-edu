"use server";

import { revalidatePath } from "next/cache";
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
  const tutor = await requireTutor();

  const weekday = Number(formData.get("weekday"));
  const startMinute = parseTimeOfDay(String(formData.get("startTime") ?? ""));
  const durationMinutes = Number(formData.get("durationMinutes") ?? 60);

  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) return { error: "Pick a day." };
  if (startMinute === null) return { error: "Enter a start time as HH:MM." };
  if (!durationMinutes || durationMinutes < 15) {
    return { error: "Sessions need to be at least 15 minutes." };
  }
  if (startMinute + durationMinutes > 24 * 60) {
    return { error: "That window runs past midnight — split it across two days." };
  }

  // Overlapping windows would generate duplicate slots for the same time.
  const sameDay = await db.availability.findMany({ where: { tutorId: tutor.id, weekday, active: true } });
  const clash = sameDay.find(
    (w) =>
      startMinute < w.startMinute + w.durationMinutes && w.startMinute < startMinute + durationMinutes
  );
  if (clash) return { error: "That overlaps a window you already have on this day." };

  await db.availability.create({
    data: { tutorId: tutor.id, weekday, startMinute, durationMinutes },
  });
  revalidateScheduling();
  return { success: "Window added ✓" };
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
