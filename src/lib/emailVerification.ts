import "server-only";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendSessionEmail } from "@/lib/email";
import { makeT } from "@/lib/i18n/translate";
import type { Language } from "@/lib/i18n/messages";

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** The copy follows the recipient's own language, not whoever triggered the send. */
export async function sendVerificationEmail(user: { id: string; email: string; name: string; language: Language }) {
  const et = makeT(user.language);
  const token = crypto.randomUUID();
  await db.emailVerificationToken.create({
    data: { token, userId: user.id, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = `${appUrl}/verify-email?token=${token}`;

  await sendSessionEmail({
    to: user.email,
    subject: et("email.verify.subject"),
    heading: et("email.verify.heading", { name: user.name }),
    body: et("email.verify.body", { link: `<a href="${link}">${link}</a>` }),
  });
}
