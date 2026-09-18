import "server-only";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Whether mail can be sent at all. Screens that would otherwise promise a
 * student an email ask this first: with no key the send is skipped silently,
 * so "we sent you a link" would be a lie rather than a delay.
 */
export function isEmailConfigured(): boolean {
  return resend !== null;
}

/**
 * Best-effort session notification — failures are logged, never thrown, so a
 * flaky email provider can't block a scheduling action from completing.
 * Returns whether the mail actually went out, for the few callers that tell
 * someone it did.
 */
export async function sendSessionEmail(opts: {
  to: string;
  subject: string;
  heading: string;
  body: string;
}): Promise<boolean> {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipped "${opts.subject}" to ${opts.to}`);
    return false;
  }
  try {
    // The SDK reports a rejected send in `error` rather than by throwing, so a
    // bad key or a refused address looks like success unless this is checked.
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "AmbaraEdu <onboarding@resend.dev>",
      to: opts.to,
      subject: opts.subject,
      html: `<div style="font-family: sans-serif; font-size: 15px; color: #18181b;">
        <h2 style="margin-bottom: 8px;">${opts.heading}</h2>
        <p style="white-space: pre-line;">${opts.body}</p>
      </div>`,
    });
    if (error) {
      console.error(`[email] rejected "${opts.subject}" to ${opts.to}:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[email] failed to send "${opts.subject}" to ${opts.to}:`, err);
    return false;
  }
}
