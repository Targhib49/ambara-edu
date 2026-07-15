import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export default async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Everything except static assets and the Pyodide worker script
    "/((?!_next/static|_next/image|favicon.ico|pyodide-worker.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
