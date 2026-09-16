import "server-only";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendSessionEmail } from "@/lib/email";

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function sendVerificationEmail(user: { id: string; email: string; name: string }) {
  const token = crypto.randomUUID();
  await db.emailVerificationToken.create({
    data: { token, userId: user.id, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = `${appUrl}/verify-email?token=${token}`;

  await sendSessionEmail({
    to: user.email,
    subject: "Verify your email — AmbaraEdu",
    heading: `Welcome, ${user.name}`,
    body: `Please confirm this is your email address:\n\n<a href="${link}">${link}</a>\n\nThis is just for our records — you can already log in with the credentials your tutor gave you.`,
  });
}
