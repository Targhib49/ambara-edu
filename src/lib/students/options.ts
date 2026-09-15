import { db } from "@/lib/db";
import type { ComboOption } from "@/components/ui/Combobox";

const GROUP_LABEL = { JUNIOR_HIGH: "Junior high", UNDERGRAD: "Undergrad", GRAD: "Grad" } as const;

/** Every student as a searchable option — name to pick by, email and group to tell namesakes apart. */
export async function studentOptions(): Promise<ComboOption[]> {
  const students = await db.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, studentGroup: true },
  });
  return students.map((s) => ({
    value: s.id,
    label: s.name,
    hint: s.studentGroup ? `${s.email} · ${GROUP_LABEL[s.studentGroup]}` : s.email,
  }));
}
