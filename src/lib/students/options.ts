import { db } from "@/lib/db";
import { isPlaceholderEmail } from "@/lib/students/placeholder";
import type { ComboOption } from "@/components/ui/Combobox";

const GROUP_LABEL = { JUNIOR_HIGH: "Junior high", UNDERGRAD: "Undergrad", GRAD: "Grad" } as const;

/** Every student as a searchable option — name to pick by, email and group to tell namesakes apart. */
export async function studentOptions(): Promise<ComboOption[]> {
  const students = await db.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, studentGroup: true },
  });
  return students.map((s) => {
    // Not joined yet: the address is a placeholder, not something to show.
    const parts = [isPlaceholderEmail(s.email) ? null : s.email, s.studentGroup ? GROUP_LABEL[s.studentGroup] : null];
    return { value: s.id, label: s.name, hint: parts.filter(Boolean).join(" · ") };
  });
}
