import { db } from "@/lib/db";
import type { ComboOption } from "@/components/ui/Combobox";

/** Courses a student can still be put on — archived ones are left out. */
export async function courseOptions(): Promise<ComboOption[]> {
  const courses = await db.course.findMany({
    where: { status: { not: "ARCHIVED" } },
    orderBy: { title: "asc" },
    select: { id: true, title: true, subject: true, curriculum: true, level: true, status: true },
  });
  return courses.map((c) => ({
    value: c.id,
    label: c.title,
    hint: [c.subject, c.curriculum, c.level, c.status === "DRAFT" ? "Draft" : null].filter(Boolean).join(" · ") || undefined,
  }));
}
