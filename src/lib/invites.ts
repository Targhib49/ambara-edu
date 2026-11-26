import "server-only";
import crypto from "crypto";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { isEmailConfigured, sendSessionEmail } from "@/lib/email";
import { makeT } from "@/lib/i18n/translate";
import type { Language } from "@/lib/i18n/messages";

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Only this goes in the database: a leaked table can't be turned into links. */
export function hashInviteToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Built from the request's own host, like the calendar feed, so links are
 * right locally, on previews and in production — NEXT_PUBLIC_APP_URL isn't
 * set everywhere.
 */
async function joinUrlFor(token: string) {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/join/${token}`;
}

/**
 * Issues a fresh link for a student, replacing any earlier one — so "new link"
 * is also how a tutor cancels a link sent to the wrong person. Returns the URL,
 * which exists only in this response.
 */
export async function issueInvite(userId: string, suggestedEmail: string | null) {
  const token = crypto.randomBytes(24).toString("base64url");
  const data = {
    tokenHash: hashInviteToken(token),
    suggestedEmail,
    expiresAt: new Date(Date.now() + INVITE_TTL_MS),
  };
  await db.studentInvite.upsert({ where: { userId }, create: { userId, ...data }, update: data });
  return joinUrlFor(token);
}

/** Best effort, like every other mail here; the tutor always gets the link to share too. */
export async function sendInviteEmail(opts: { to: string; name: string; language: Language; url: string }) {
  if (!isEmailConfigured()) return false;
  const et = makeT(opts.language);
  return sendSessionEmail({
    to: opts.to,
    subject: et("email.invite.subject"),
    heading: et("email.invite.heading", { name: opts.name }),
    body: et("email.invite.body", { link: `<a href="${opts.url}">${opts.url}</a>` }),
  });
}
