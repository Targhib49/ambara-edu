import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { parseBlockData } from "@/lib/blocks/schema";
import { ATTACHMENTS_BUCKET, createSupabaseAdminClient } from "@/lib/supabase/admin";

// Access-checked file download: verifies the caller may see the lesson the
// attachment belongs to, then redirects to a short-lived signed storage URL.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ blockId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { blockId } = await params;
  const block = await db.contentBlock.findUnique({
    where: { id: blockId },
    include: { lesson: { select: { status: true, module: { select: { trackId: true } } } } },
  });
  if (!block || block.type !== "FILE_ATTACHMENT") {
    return new NextResponse("Not found", { status: 404 });
  }

  if (user.role !== "TUTOR") {
    const enrolled = await db.enrollment.findUnique({
      where: {
        studentId_trackId: { studentId: user.id, trackId: block.lesson.module.trackId },
      },
    });
    if (!enrolled || block.lesson.status !== "PUBLISHED") {
      return new NextResponse("Not found", { status: 404 });
    }
  }

  const { storagePath, fileName } = parseBlockData("FILE_ATTACHMENT", block.data);
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .createSignedUrl(storagePath, 60 * 10, { download: fileName });
  if (error || !data) {
    return new NextResponse("Could not create download link", { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
