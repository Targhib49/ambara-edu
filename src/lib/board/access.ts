import "server-only";
import { db } from "@/lib/db";

/**
 * The session a board belongs to, if this user is in it. Only the session's
 * own tutor and student may open its board — the same rule the Realtime
 * policy (is_session_board_member) applies to the live channel.
 */
export async function boardSessionFor(sessionId: string, userId: string) {
  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: {
      tutor: { select: { id: true, name: true } },
      student: { select: { id: true, name: true } },
      board: true,
    },
  });
  if (!session) return null;
  if (session.tutorId !== userId && session.studentId !== userId) return null;
  return session;
}
