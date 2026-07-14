"use client";

import { useEffect, useMemo, useState } from "react";
import { TutorSessionRow } from "./TutorSessionRow";
import { StudentSessionRow } from "./StudentSessionRow";
import { SessionCalendar } from "./SessionCalendar";
import { nowMs } from "@/lib/sessions/format";
import type { SessionStatus } from "@/generated/prisma/enums";

type BaseRow = {
  id: string;
  startTime: string;
  durationMinutes: number;
  status: SessionStatus;
  notes: string;
  proposedAltTime: string | null;
};
type TutorRow = BaseRow & { studentName: string };
type StudentRow = BaseRow & { tutorName: string };

// The board is shared by both roles; server pages can't pass render
// callbacks across the client boundary, so the role prop picks the row
// component (and which reschedule status means "waiting on you") internally.
type BoardProps =
  | { role: "tutor"; sessions: TutorRow[] }
  | { role: "student"; sessions: StudentRow[] };

const tabCls = (active: boolean) =>
  `rounded px-3 py-1 text-sm font-medium ${active ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`;

export function SessionsBoard(props: BoardProps) {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);

  const isTutor = props.role === "tutor";
  const needsResponseStatus: SessionStatus = isTutor
    ? "RESCHEDULE_REQUESTED_BY_STUDENT"
    : "RESCHEDULE_REQUESTED_BY_TUTOR";
  const sessions = props.sessions as (TutorRow | StudentRow)[];

  const now = nowMs();
  const needsResponse = sessions.filter((s) => s.status === needsResponseStatus);
  const rest = sessions.filter((s) => s.status !== needsResponseStatus);
  const upcoming = useMemo(
    () =>
      rest
        .filter((s) => s.status !== "CANCELLED" && new Date(s.startTime).getTime() >= now)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [rest, now]
  );
  const past = useMemo(
    () =>
      rest
        .filter((s) => s.status === "CANCELLED" || new Date(s.startTime).getTime() < now)
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()),
    [rest, now]
  );

  function selectFromCalendar(sessionId: string) {
    setView("list");
    setPendingScrollId(sessionId);
  }

  useEffect(() => {
    if (view !== "list" || !pendingScrollId) return;
    const id = pendingScrollId;
    const timer = setTimeout(() => {
      const el = document.getElementById(`session-${id}`);
      if (el instanceof HTMLElement) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.boxShadow = "0 0 0 2px var(--color-blue-400, #60a5fa)";
        setTimeout(() => {
          el.style.boxShadow = "";
        }, 1500);
      }
      setPendingScrollId(null);
    }, 50);
    return () => clearTimeout(timer);
  }, [view, pendingScrollId]);

  const row = (s: TutorRow | StudentRow, isPast: boolean) =>
    isTutor ? (
      <TutorSessionRow key={s.id} session={s as TutorRow} />
    ) : (
      <StudentSessionRow key={s.id} session={s as StudentRow} isPast={isPast} />
    );

  return (
    <div>
      <div className="mb-4 inline-flex gap-0.5 rounded-lg bg-zinc-100 p-0.5">
        <button onClick={() => setView("calendar")} className={tabCls(view === "calendar")}>
          Calendar
        </button>
        <button onClick={() => setView("list")} className={tabCls(view === "list")}>
          List
        </button>
      </div>

      {view === "calendar" && (
        <SessionCalendar
          sessions={sessions.map((s) => ({
            id: s.id,
            label: "studentName" in s ? s.studentName : s.tutorName,
            startTime: s.startTime,
            status: s.status,
          }))}
          onSelectSession={selectFromCalendar}
          legendStatuses={["CONFIRMED", needsResponseStatus, "CANCELLED"]}
        />
      )}

      {view === "list" && (
        <div className="space-y-8">
          {needsResponse.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-amber-700">Needs your response</h2>
              {needsResponse.map((s) => row(s, false))}
            </section>
          )}

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Upcoming</h2>
            {upcoming.length === 0 && <p className="text-sm text-zinc-500">No upcoming sessions.</p>}
            {upcoming.map((s) => row(s, false))}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Past</h2>
            {past.length === 0 && <p className="text-sm text-zinc-500">No past sessions yet.</p>}
            {past.map((s) => row(s, true))}
          </section>
        </div>
      )}
    </div>
  );
}
