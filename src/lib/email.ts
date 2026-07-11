import "server-only";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Best-effort session notification — failures are logged, never thrown, so a
 * flaky email provider can't block a scheduling action from completing.
 */
export async function sendSessionEmail(opts: {
  to: string;
  subject: string;
  heading: string;
  body: string;
}) {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipped "${opts.subject}" to ${opts.to}`);
    return;
  }
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Tutor LMS <onboarding@resend.dev>",
      to: opts.to,
      subject: opts.subject,
      html: `<div style="font-family: sans-serif; font-size: 15px; color: #18181b;">
        <h2 style="margin-bottom: 8px;">${opts.heading}</h2>
        <p style="white-space: pre-line;">${opts.body}</p>
      </div>`,
    });
  } catch (err) {
    console.error(`[email] failed to send "${opts.subject}" to ${opts.to}:`, err);
  }
}
