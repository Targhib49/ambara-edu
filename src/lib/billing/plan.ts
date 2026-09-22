import type { BillingKind } from "@/generated/prisma/enums";
import type { MessageKey } from "@/lib/i18n/messages";

export type PlanLike = {
  kind: BillingKind;
  amount: number;
  includedSessions: number | null;
  payer: string;
  startsOn: Date;
};

/**
 * The arrangement in force on a day: the latest plan that had started by
 * then. Plans are never edited in place, so an invoice raised in October
 * still bills September at September's price.
 */
export function planOn<T extends PlanLike>(plans: T[], on: Date): T | null {
  const started = plans.filter((p) => p.startsOn.getTime() <= on.getTime());
  if (!started.length) return null;
  return started.reduce((latest, p) => (p.startsOn.getTime() > latest.startsOn.getTime() ? p : latest));
}

/** Whether sessions on this plan turn into money at all. */
export function planCharges(kind: BillingKind): boolean {
  return kind === "PER_SESSION" || kind === "MONTHLY";
}

export const billingKindKey = (kind: BillingKind) => `billing.kind.${kind}` as MessageKey;

export const BILLING_KINDS: BillingKind[] = ["PER_SESSION", "MONTHLY", "EXTERNAL", "FREE"];
