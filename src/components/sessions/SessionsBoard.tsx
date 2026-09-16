"use client";

import { useEffect, useState } from "react";
import { StudentSessionRow } from "./StudentSessionRow";
import { SessionCalendar } from "./SessionCalendar";
import { TutorSessionsTable, type TutorSessionTableRow } from "./TutorSessionsTable";
import type { OpenSlot } from "./BookingPanel";
import { nowMs } from "@/lib/sessions/format";
import { useT } from "@/lib/i18n/client";
import type { SessionStatus } from "@/generated/prisma/enums";

export type StudentSessionBoardRow = {
  id: string;
  tutorId: string;
  tutorName: string;
  startTime: string;
  durationMinutes: number;
  status: SessionStatus;
  notes: string;
  statusReason: string | null;
  proposedAltTime: string | null;
};

// Shared by both roles; server pages can't pass render callbacks across the
// client boundary, so the role prop picks the list view internally. Tutors get
// the action table, students keep the card list.
type BoardProps =
  | { role: "tutor"; sessions: TutorSessionTableRow[] }
  | { role: "student"; sessions: StudentSessionBoardRow[]; rescheduleSlots: OpenSlot[] };

const STUDENT_NEEDS_RESPONSE: SessionStatus[] = ["RESCHEDULE_REQUESTED_BY_TUTOR", "AWAITING_RESCHEDULE"];
const FINISHED: SessionStatus[] = ["CANCELLED", "COMPLETED"];

const tabCls = (active: boolean) =>
  `rounded px-3 py-1 text-sm font-medium ${active ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`;

export function SessionsBoard(props: BoardProps) {
  const t = useT();
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);
  const isTutor = props.role === "tutor";

  const calendarSessions = (props.sessions as (TutorSessionTableRow | StudentSessionBoardRow)[]).map((s) => ({
    id: s.id,
    label: "studentName" in s ? s.studentName : s.tutorName,
    startTime: s.startTime,
    status: s.status,
  }));

  const now = nowMs();
  const studentSessions = props.role === "student" ? props.sessions : [];
  const needsResponse = studentSessions.filter((s) => STUDENT_NEEDS_RESPONSE.includes(s.status));
  const rest = studentSessions.filter((s) => !STUDENT_NEEDS_RESPONSE.includes(s.status));
  const upcoming = rest
    .filter((s) => !FINISHED.includes(s.status) && new Date(s.startTime).getTime() >= now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const past = rest
    .filter((s) => FINISHED.includes(s.status) || new Date(s.startTime).getTime() < now)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

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

  return (
    <div>
      <div className="mb-4 inline-flex gap-0.5 rounded-lg bg-zinc-100 p-0.5">
        <button onClick={() => setView("calendar")} className={tabCls(view === "calendar")}>
          {t("sessions.viewCalendar")}
        </button>
        <button onClick={() => setView("list")} className={tabCls(view === "list")}>
          {t("sessions.viewList")}
        </button>
      </div>

      {view === "calendar" && (
        <SessionCalendar
          sessions={calendarSessions}
          onSelectSession={selectFromCalendar}
          legendStatuses={
            isTutor
              ? ["CONFIRMED", "RESCHEDULE_REQUESTED_BY_STUDENT", "AWAITING_RESCHEDULE", "COMPLETED", "CANCELLED"]
              : ["CONFIRMED", "AWAITING_RESCHEDULE", "COMPLETED", "CANCELLED"]
          }
        />
      )}

      {view === "list" &&
        (props.role === "tutor" ? (
          <TutorSessionsTable sessions={props.sessions} />
        ) : (
          <div className="space-y-8">
            {needsResponse.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-amber-700">{t("studentSessions.needsResponse")}</h2>
                {needsResponse.map((s) => (
                  <StudentSessionRow key={s.id} session={s} isPast={false} rescheduleSlots={props.rescheduleSlots} />
                ))}
              </section>
            )}

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">{t("tutorSessions.tabUpcoming")}</h2>
              {upcoming.length === 0 && <p className="text-sm text-zinc-500">{t("studentSessions.noUpcoming")}</p>}
              {upcoming.map((s) => (
                <StudentSessionRow key={s.id} session={s} isPast={false} rescheduleSlots={props.rescheduleSlots} />
              ))}
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">{t("studentSessions.past")}</h2>
              {past.length === 0 && <p className="text-sm text-zinc-500">{t("studentSessions.noPast")}</p>}
              {past.map((s) => (
                <StudentSessionRow key={s.id} session={s} isPast rescheduleSlots={props.rescheduleSlots} />
              ))}
            </section>
          </div>
        ))}
    </div>
  );
}
