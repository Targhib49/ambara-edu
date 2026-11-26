import "server-only";
import { createHash, randomBytes } from "crypto";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export const INVITE_TTL_DAYS = 7;
const INVITE_TTL_MS = INVITE_TTL_DAYS * 24 * 60 * 60 * 1000;

export function hashInviteToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Where links should point. The configured URL wins; without one, the host the
 * tutor is using right now, so a link made on a preview deploy opens there.
 */
async function appUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Makes a fresh one-time link for a student and returns it. Any unused link
 * they had stops working: there is only ever one live link per student, so a
 * link forwarded to the wrong person can be cancelled by making a new one.
 */
export async function issueInvite(userId: string): Promise<{ url: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
  await db.$transaction([
    db.studentInvite.deleteMany({ where: { userId, usedAt: null } }),
    db.studentInvite.create({ data: { userId, tokenHash: hashInviteToken(token), expiresAt } }),
  ]);
  return { url: `${await appUrl()}/join/${token}`, expiresAt };
}

export type InviteLookup =
  | { state: "ok"; userId: string; name: string; email: string }
  | { state: "expired" | "used" | "invalid" };

/** Reads a link's state without spending it. */
export async function lookupInvite(token: string): Promise<InviteLookup> {
  if (!token) return { state: "invalid" };
  const invite = await db.studentInvite.findUnique({
    where: { tokenHash: hashInviteToken(token) },
    select: { usedAt: true, expiresAt: true, user: { select: { id: true, name: true, email: true } } },
  });
  if (!invite) return { state: "invalid" };
  if (invite.usedAt) return { state: "used" };
  if (invite.expiresAt < new Date()) return { state: "expired" };
  return { state: "ok", userId: invite.user.id, name: invite.user.name, email: invite.user.email };
}
