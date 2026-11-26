import "server-only";
import { isEmailConfigured, sendSessionEmail } from "@/lib/email";
import { makeT } from "@/lib/i18n/translate";
import { INVITE_TTL_DAYS } from "@/lib/invites";
import type { Language } from "@/lib/i18n/messages";

/** Best effort: the tutor always gets the link on screen as well. */
export async function sendInviteEmail(
  user: { email: string; name: string; language: Language },
  url: string
): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  const et = makeT(user.language);
  return sendSessionEmail({
    to: user.email,
    subject: et("email.invite.subject"),
    heading: et("email.invite.heading", { name: user.name }),
    body: et("email.invite.body", { link: `<a href="${url}">${url}</a>`, days: INVITE_TTL_DAYS }),
  });
}
