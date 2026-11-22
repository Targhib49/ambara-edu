import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { requireUuids } from "@/lib/params";
import { boardSessionFor } from "@/lib/board/access";
import { emptyDoc, parseDoc } from "@/lib/board/doc";
import { getLanguage, getT } from "@/lib/i18n/server";
import { LanguageProvider } from "@/lib/i18n/client";
import { formatSessionInstant } from "@/lib/sessions/format";
import { LiveBoard } from "@/components/board/LiveBoard";

export const metadata: Metadata = { title: "Board · AmbaraEdu" };

/**
 * The live whiteboard for one session, full screen and outside both shells so
 * the page gets every pixel. Only that session's tutor and student get in.
 */
export default async function BoardPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  requireUuids(sessionId);
  const user = await requireUser();
  const session = await boardSessionFor(sessionId, user.id);
  if (!session) notFound();

  const language = await getLanguage();
  const t = await getT();
  const isTutor = session.tutorId === user.id;
  const other = isTutor ? session.student.name : session.tutor.name;

  return (
    <LanguageProvider language={language}>
      <LiveBoard
        sessionId={session.id}
        me={{ id: user.id, name: user.name, role: isTutor ? "TUTOR" : "STUDENT" }}
        initialDoc={session.board ? parseDoc(session.board.doc) : emptyDoc()}
        title={t("board.title", { name: other })}
        subtitle={formatSessionInstant(session.startTime, language)}
        backHref={isTutor ? "/tutor/sessions" : "/sessions"}
      />
    </LanguageProvider>
  );
}
