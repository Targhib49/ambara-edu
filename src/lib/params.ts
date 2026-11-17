import { notFound } from "next/navigation";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Every id in a URL is a Postgres uuid, and Postgres rejects anything else
 * outright — a mistyped or cut-off link would throw inside the query and land
 * on the error page instead of "not found". Call this on the route's id params
 * before they reach the database.
 */
export function requireUuids(...ids: string[]): void {
  if (!ids.every((id) => UUID.test(id))) notFound();
}
