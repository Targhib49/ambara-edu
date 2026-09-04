import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export default async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Everything except static assets, the Pyodide worker script, and the
    // calendar feed — subscribed by calendar apps that carry no session
    // cookie, and which authenticates on the token in its own URL.
    "/((?!_next/static|_next/image|favicon.ico|pyodide-worker.js|api/calendar/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
