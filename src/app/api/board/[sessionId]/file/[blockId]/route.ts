import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { boardSessionFor } from "@/lib/board/access";
import { parseDoc } from "@/lib/board/doc";
import { parseBlockData } from "@/lib/blocks/schema";
import { ATTACHMENTS_BUCKET, createSupabaseAdminClient } from "@/lib/supabase/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A PDF shown on a session's board. The tutor can open any lesson PDF; the
 * student only the ones the tutor has already put on this board — which may be
 * from a course they aren't enrolled in, so the usual lesson check (in
 * /api/files) would turn them away. The board saves before it tells the
 * student a PDF page exists, so the saved doc is always ahead of the request.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; blockId: string }> }
) {
  const { sessionId, blockId } = await params;
  if (!UUID.test(sessionId) || !UUID.test(blockId)) return new NextResponse("Not found", { status: 404 });
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const session = await boardSessionFor(sessionId, user.id);
  if (!session) return new NextResponse("Not found", { status: 404 });

  if (session.tutorId !== user.id) {
    const doc = session.board ? parseDoc(session.board.doc) : null;
    const onBoard = doc && Object.values(doc.backgrounds).some((bg) => bg.kind === "pdf" && bg.blockId === blockId);
    if (!onBoard) return new NextResponse("Not found", { status: 404 });
  }

  const block = await db.contentBlock.findUnique({ where: { id: blockId } });
  if (!block || block.type !== "FILE_ATTACHMENT") return new NextResponse("Not found", { status: 404 });
  const data = parseBlockData("FILE_ATTACHMENT", block.data);
  if (data.mimeType !== "application/pdf") return new NextResponse("Not found", { status: 404 });

  const supabase = createSupabaseAdminClient();
  const { data: signed, error } = await supabase.storage.from(ATTACHMENTS_BUCKET).createSignedUrl(data.storagePath, 60 * 10);
  if (error || !signed) return new NextResponse("Could not create link", { status: 500 });
  return NextResponse.redirect(signed.signedUrl);
}
