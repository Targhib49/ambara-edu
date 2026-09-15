import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ATTACHMENTS_BUCKET, createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * A course's cover image, for tutors and students enrolled on it. Redirects to
 * a short-lived signed URL, like lesson attachments. Callers put the storage
 * path in the query string as a version, so a replaced cover gets a new URL and
 * the browser can cache each one without ever showing a stale image.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { courseId } = await params;
  const course = await db.course.findUnique({ where: { id: courseId }, select: { coverImagePath: true } });
  if (!course?.coverImagePath) return new NextResponse("Not found", { status: 404 });

  if (user.role !== "TUTOR") {
    const enrolled = await db.enrollment.findUnique({
      where: { studentId_courseId: { studentId: user.id, courseId } },
    });
    if (!enrolled) return new NextResponse("Not found", { status: 404 });
  }

  const { data, error } = await createSupabaseAdminClient()
    .storage.from(ATTACHMENTS_BUCKET)
    .createSignedUrl(course.coverImagePath, 60 * 60);
  if (error || !data) return new NextResponse("Could not load cover", { status: 500 });

  const res = NextResponse.redirect(data.signedUrl);
  // Just under the signed URL's lifetime, so a cached redirect never points at
  // an expired link.
  res.headers.set("Cache-Control", "private, max-age=3000");
  return res;
}
