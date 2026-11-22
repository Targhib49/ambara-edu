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

/** The board opens this long before a session starts, and stays "live" this long after it ends. */
export const BOARD_LIVE_MARGIN_MS = 30 * 60_000;

/**
 * The session a student is in right now, if any: the one whose board "Ask
 * tutor" should post to. From half an hour before the start to half an hour
 * after the end, so running over doesn't take the button away mid-question.
 */
export async function liveSessionForStudent(studentId: string, now: number): Promise<string | null> {
  const candidates = await db.session.findMany({
    where: {
      studentId,
      status: { notIn: ["CANCELLED", "AWAITING_RESCHEDULE"] },
      startTime: { lte: new Date(now + BOARD_LIVE_MARGIN_MS), gte: new Date(now - 24 * 60 * 60_000) },
    },
    select: { id: true, startTime: true, durationMinutes: true },
    orderBy: { startTime: "desc" },
  });
  const live = candidates.find((s) => s.startTime.getTime() + s.durationMinutes * 60_000 + BOARD_LIVE_MARGIN_MS >= now);
  return live?.id ?? null;
}
