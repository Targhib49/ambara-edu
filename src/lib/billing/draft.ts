import { planOn, type PlanLike } from "./plan";
import type { BillingKind } from "@/generated/prisma/enums";

export type DraftPlan = PlanLike & {
  id: string;
  courseId: string | null;
  kind: BillingKind;
  amount: number;
  includedSessions: number | null;
  payer: string;
};

export type DraftSession = { id: string; courseId: string | null };

export type DraftItem = {
  sessionId?: string;
  courseId: string | null;
  description: string;
  quantity: number;
  unitAmount: number;
  order: number;
};

export type DraftAllowance = { courseId: string | null; granted: number; used: number; carryIn: number; carryOut: number };

export type DraftInput<S extends DraftSession> = {
  plans: DraftPlan[];
  sessions: S[];
  /** The last day of the month being billed: which arrangement was in force. */
  billedOn: Date;
  /** A subject's title, for labelling lines; null for the any-subject arrangement. */
  titleOf: (courseId: string | null) => string | null;
  /** One session as a line, e.g. "Sesi 4 Sep 16.00 · 60 menit". */
  sessionLine: (session: S) => string;
  /** What a monthly fee's line says. */
  monthlyLine: string;
  /**
   * The balance carried into this month, by subject: positive for sessions
   * already taken against it, negative for sessions still owed.
   */
  carriedIn: (courseId: string | null) => number;
};

/**
 * What a month's invoice bills, worked out from the arrangements and the
 * sessions held. Kept free of the database so the awkward parts — a student
 * on two arrangements at once, and an allowance that rolls into next month —
 * can be read and tested on their own.
 *
 * Rules, in the order they bite:
 * - A subject is priced by its own arrangement, or by the any-subject one.
 * - A monthly fee is charged once, by the subject the arrangement names, and
 *   whether or not the month had sessions.
 * - Sessions a monthly fee covers appear at no charge, so the student sees
 *   what they got. The allowance carries **both ways**: sessions past it
 *   aren't charged again, they come out of next month; and a month that used
 *   fewer than it paid for leaves sessions the student is still owed. That is
 *   `carryOut` — positive means sessions taken in advance, negative means
 *   sessions still owed.
 * - Sessions with no arrangement, or on one that isn't billed here, are
 *   listed at no charge rather than dropped: they stay visible, and they
 *   stop counting as waiting to be invoiced.
 */
export function buildInvoiceDraft<S extends DraftSession>(input: DraftInput<S>): { items: DraftItem[]; allowances: DraftAllowance[] } {
  const { plans, sessions, billedOn, titleOf, sessionLine, monthlyLine, carriedIn } = input;

  // Subjects with sessions this month, plus any whose monthly fee is due.
  const subjects = new Set<string | null>(sessions.map((s) => s.courseId));
  for (const plan of plans) {
    const inForce = planOn(plans.filter((p) => p.courseId === plan.courseId), billedOn);
    if (plan.kind === "MONTHLY" && inForce?.id === plan.id) subjects.add(plan.courseId);
  }

  const items: DraftItem[] = [];
  const allowances: DraftAllowance[] = [];
  let order = 0;

  for (const courseId of subjects) {
    const own = plans.filter((p) => p.courseId === courseId);
    const plan = planOn(own.length ? own : plans.filter((p) => p.courseId === null), billedOn);
    const mine = sessions.filter((s) => s.courseId === courseId);
    const title = titleOf(courseId);
    const label = (text: string) => (title ? `${title} — ${text}` : text);
    const free = (session: S, description: string) => ({
      sessionId: session.id,
      courseId,
      description,
      quantity: 1,
      unitAmount: 0,
      order: order++,
    });

    if (!plan) {
      items.push(...mine.map((s) => free(s, sessionLine(s))));
      continue;
    }

    if (plan.kind === "PER_SESSION") {
      items.push(
        ...mine.map((s) => ({ sessionId: s.id, courseId, description: label(sessionLine(s)), quantity: 1, unitAmount: plan.amount, order: order++ }))
      );
      continue;
    }

    if (plan.kind === "MONTHLY") {
      // A subject that merely falls back to a monthly any-subject arrangement
      // is covered by that one fee, charged under the arrangement's own subject.
      const ownsFee = plan.courseId === courseId;
      if (ownsFee) {
        items.push({ courseId, description: label(monthlyLine), quantity: 1, unitAmount: plan.amount, order: order++ });
      }
      items.push(...mine.map((s) => free(s, sessionLine(s))));
      if (ownsFee && plan.includedSessions) {
        const carryIn = carriedIn(courseId);
        allowances.push({
          courseId,
          granted: plan.includedSessions,
          used: mine.length,
          carryIn,
          carryOut: mine.length + carryIn - plan.includedSessions,
        });
      }
      continue;
    }

    // EXTERNAL or FREE: on the invoice for the record, at no charge.
    const note = plan.kind === "EXTERNAL" && plan.payer ? ` (${plan.payer})` : "";
    items.push(...mine.map((s) => free(s, label(sessionLine(s)) + note)));
  }

  return { items, allowances };
}
