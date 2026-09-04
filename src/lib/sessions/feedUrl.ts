import "server-only";
import { headers } from "next/headers";

/**
 * Absolute URL for a calendar subscription, built from the request's own host
 * so it is right in local dev, on a preview deployment and in production
 * without another environment variable to keep in step.
 */
export async function feedUrlFor(token: string) {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/api/calendar/${token}`;
}
