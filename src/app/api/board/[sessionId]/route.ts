import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { boardSessionFor } from "@/lib/board/access";
import { boardDocSchema, mergeDocs, parseDoc } from "@/lib/board/doc";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Saves a client's snapshot of the board, merged into the stored one. A route
 * handler rather than a server action: snapshots can pass server actions' 1 MB
 * body limit, and the page also saves with `fetch(..., { keepalive })` as it
 * closes, which a server action can't do.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  if (!UUID.test(sessionId)) return NextResponse.json({ error: "not found" }, { status: 404 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "signed out" }, { status: 401 });
  const session = await boardSessionFor(sessionId, user.id);
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });

  const parsed = boardDocSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid board" }, { status: 400 });

  // Read-merge-write in one transaction, row-locked, so two clients saving at
  // the same moment both land instead of the later one dropping the other's strokes.
  await db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT 1 FROM "SessionBoard" WHERE "sessionId" = ${sessionId}::uuid FOR UPDATE`;
    const existing = await tx.sessionBoard.findUnique({ where: { sessionId } });
    const doc = existing ? mergeDocs(parseDoc(existing.doc), parsed.data) : parsed.data;
    await tx.sessionBoard.upsert({
      where: { sessionId },
      create: { sessionId, doc },
      update: { doc },
    });
  });
  return NextResponse.json({ ok: true });
}

/** The saved board, for catching up after a join or reconnect. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  if (!UUID.test(sessionId)) return NextResponse.json({ error: "not found" }, { status: 404 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "signed out" }, { status: 401 });
  const session = await boardSessionFor(sessionId, user.id);
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ doc: session.board ? parseDoc(session.board.doc) : null });
}
