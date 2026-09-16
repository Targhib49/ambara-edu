import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export default async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Everything except static assets, the Pyodide worker script, and the
    // EM course widgets. The widgets are iframed inside lesson pages: gating
    // them would render the login page *inside the frame* the moment a session
    // expired, which reads as a broken widget rather than a broken session.
    // They are standalone vector-algebra visualisations — no student data.
    "/((?!_next/static|_next/image|favicon.ico|pyodide-worker.js|em-widgets/|api/calendar/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
