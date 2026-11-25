/**
 * A student added without an email still needs a sign-in account (its id is
 * the student's id everywhere), so it gets a stand-in address on a reserved
 * domain until they join and type their own. `.invalid` can never resolve, so
 * nothing sent there can reach a real person; senders skip it anyway.
 *
 * Shared by server and client code, so no server-only imports here.
 */
const PLACEHOLDER_DOMAIN = "@invite.invalid";

export function placeholderEmail(): string {
  return `pending-${crypto.randomUUID()}${PLACEHOLDER_DOMAIN}`;
}

export function isPlaceholderEmail(email: string): boolean {
  return email.toLowerCase().endsWith(PLACEHOLDER_DOMAIN);
}

/** The address to show or export: empty while it is only a stand-in. */
export function visibleEmail(email: string): string {
  return isPlaceholderEmail(email) ? "" : email;
}
