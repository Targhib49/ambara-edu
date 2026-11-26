import "server-only";
import crypto from "crypto";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { isEmailConfigured, sendSessionEmail } from "@/lib/email";
import { makeT } from "@/lib/i18n/translate";
import type { Language } from "@/lib/i18n/messages";

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
/** A link the tutor hands over: long enough to reach a student who's slow to reply. */
export const RESET_TTL_MS = 24 * 60 * 60 * 1000;
/** A link someone asked for themselves, sent to their own inbox: short-lived. */
export const SELF_RESET_TTL_MS = 60 * 60 * 1000;

/** Only this goes in the database: a leaked table can't be turned into links. */
export function hashInviteToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Built from the request's own host, like the calendar feed, so links are
 * right locally, on previews and in production — NEXT_PUBLIC_APP_URL isn't
 * set everywhere.
 */
async function linkUrlFor(path: "join" | "reset", token: string) {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/${path}/${token}`;
}

function newToken(kind: "JOIN" | "RESET", ttlMs: number) {
  const token = crypto.randomBytes(24).toString("base64url");
  // createdAt is set here too: an upsert would otherwise keep the first link's date.
  const now = Date.now();
  return { token, data: { kind, tokenHash: hashInviteToken(token), createdAt: new Date(now), expiresAt: new Date(now + ttlMs) } };
}

/**
 * Issues a fresh link for a student, replacing any earlier one — so "new link"
 * is also how a tutor cancels a link sent to the wrong person. Returns the URL,
 * which exists only in this response.
 */
export async function issueInvite(userId: string, suggestedEmail: string | null) {
  const { token, data } = newToken("JOIN", INVITE_TTL_MS);
  const row = { ...data, suggestedEmail };
  await db.studentInvite.upsert({ where: { userId }, create: { userId, ...row }, update: row });
  return linkUrlFor("join", token);
}

/**
 * A one-time link to choose a new password, for an account that has joined.
 * Shares the one-row-per-person slot with join links, so issuing one cancels
 * any earlier reset link. The current password keeps working until the link is
 * used — asking for one can't lock anybody out.
 */
export async function issueResetLink(userId: string, ttlMs: number) {
  const { token, data } = newToken("RESET", ttlMs);
  const row = { ...data, suggestedEmail: null };
  await db.studentInvite.upsert({ where: { userId }, create: { userId, ...row }, update: row });
  return linkUrlFor("reset", token);
}

export async function sendResetEmail(opts: { to: string; name: string; language: Language; url: string; ttl: "hour" | "day" }) {
  if (!isEmailConfigured()) return false;
  const et = makeT(opts.language);
  return sendSessionEmail({
    to: opts.to,
    subject: et("email.reset.subject"),
    heading: et("email.reset.heading", { name: opts.name }),
    body: et(opts.ttl === "hour" ? "email.reset.bodyHour" : "email.reset.bodyDay", {
      link: `<a href="${opts.url}">${opts.url}</a>`,
    }),
  });
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
