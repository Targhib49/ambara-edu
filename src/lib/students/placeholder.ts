// A student added by name gets a sign-in account straight away, under an
// address nobody owns, until they accept their invite and set their own.
// `.invalid` is reserved (RFC 2606): it can never resolve, so even a send that
// slipped past the guard in email.ts would go nowhere.
// Shared by server and client code, so no "server-only" here.

export const PLACEHOLDER_EMAIL_DOMAIN = "invite.ambaraedu.invalid";

export function placeholderEmailFor(id: string) {
  return `pending-${id}@${PLACEHOLDER_EMAIL_DOMAIN}`;
}

/** True while the student hasn't joined yet — their address is ours, not theirs. */
export function isPlaceholderEmail(email: string) {
  return email.toLowerCase().endsWith(`@${PLACEHOLDER_EMAIL_DOMAIN}`);
}
