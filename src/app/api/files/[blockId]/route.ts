import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { parseBlockData } from "@/lib/blocks/schema";
import { ATTACHMENTS_BUCKET, createSupabaseAdminClient } from "@/lib/supabase/admin";

// Access-checked file access: verifies the caller may see the lesson the
// attachment belongs to, then redirects to a short-lived signed storage URL.
// `?inline=1` omits the download disposition so the browser renders the file
// in place (the PDF viewer / image preview embeds this URL).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ blockId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { blockId } = await params;
  const block = await db.contentBlock.findUnique({
    where: { id: blockId },
    include: { lesson: { select: { status: true, chapter: { select: { courseId: true } } } } },
  });
  if (!block || block.type !== "FILE_ATTACHMENT") {
    return new NextResponse("Not found", { status: 404 });
  }

  if (user.role !== "TUTOR") {
    const enrolled = await db.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId: user.id, courseId: block.lesson.chapter.courseId },
      },
    });
    if (!enrolled || block.lesson.status !== "PUBLISHED") {
      return new NextResponse("Not found", { status: 404 });
    }
  }

  const { storagePath, fileName } = parseBlockData("FILE_ATTACHMENT", block.data);
  const inline = request.nextUrl.searchParams.get("inline") === "1";
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .createSignedUrl(storagePath, 60 * 10, inline ? undefined : { download: fileName });
  if (error || !data) {
    return new NextResponse("Could not create download link", { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
