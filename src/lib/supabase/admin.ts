import "server-only";
import { createClient } from "@supabase/supabase-js";

// Secret-key client: full admin access, bypasses RLS/auth. Server-only — used
// for creating student accounts and storage admin operations.
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export const ATTACHMENTS_BUCKET = "attachments";
