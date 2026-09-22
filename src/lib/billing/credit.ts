import { db } from "@/lib/db";

export type SessionCredit = { courseId: string | null; subject: string | null; sessions: number };

/**
 * Sessions a student has paid for and not yet had, by subject. A monthly fee
 * buys a fixed number of sessions; a month that used fewer leaves the rest
 * owed, and the invoice that closed that month carries the balance. So the
 * newest invoice per subject holds the running answer — negative `carryOut`
 * means sessions still owed.
 */
export async function sessionCredit(studentId: string): Promise<SessionCredit[]> {
  const rows = await db.invoiceAllowance.findMany({
    where: { invoice: { studentId, status: { not: "VOID" } } },
    orderBy: { invoice: { periodStart: "desc" } },
    select: { courseId: true, carryOut: true, course: { select: { title: true } } },
  });
  const latest = new Map<string | null, SessionCredit>();
  for (const row of rows) {
    if (latest.has(row.courseId)) continue;
    latest.set(row.courseId, { courseId: row.courseId, subject: row.course?.title ?? null, sessions: -row.carryOut });
  }
  return [...latest.values()].filter((c) => c.sessions > 0);
}

export const creditTotal = (credits: SessionCredit[]) => credits.reduce((n, c) => n + c.sessions, 0);
