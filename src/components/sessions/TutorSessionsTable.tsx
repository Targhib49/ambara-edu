"use client";

import { useState, useTransition } from "react";
import { DataTable, type Column, type Tab } from "@/components/ui/DataTable";
import { StatusBadge } from "./StatusBadge";
import { ATTENDANCE_LABEL, SESSION_STATUS_LABEL } from "@/lib/sessions/format";
import {
  cancelSessionWithReason,
  completeSession,
  requestStudentReschedule,
  tutorRespondToReschedule,
} from "@/lib/actions/sessions";
import { badgeColorForKey, initialsFor } from "@/lib/ui/palette";
import type { SessionStatus } from "@/generated/prisma/enums";

export type TutorSessionTableRow = {
  id: string;
  studentName: string;
  startTime: string;
  /** Server-formatted in WIB, so the browser never re-formats it differently. */
  whenLabel: string;
  /** YYYY-MM-DD in WIB, for the date window. */
  localDate: string;
  durationMinutes: number;
  status: SessionStatus;
  notes: string;
  statusReason: string | null;
  attendance: "ATTENDED" | "NO_SHOW" | null;
  proposedAltLabel: string | null;
  /** Worked out on the server, so the table doesn't read the clock during render. */
  hasStarted: boolean;
};

type Mode = "done" | "cancel" | "reschedule" | "counter";

const smallBtn =
  "whitespace-nowrap rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40";
const primaryBtn =
  "whitespace-nowrap rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-40";
const dangerBtn =
  "whitespace-nowrap rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40";
const fieldCls =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

const needsAction = (s: TutorSessionTableRow) =>
  s.status === "RESCHEDULE_REQUESTED_BY_STUDENT" || (s.status === "CONFIRMED" && s.hasStarted);

const TABS: Tab<TutorSessionTableRow>[] = [
  { key: "needs", label: "Needs action", match: needsAction },
  {
    key: "upcoming",
    label: "Upcoming",
    match: (s) =>
      (s.status === "CONFIRMED" || s.status === "PROPOSED" || s.status === "RESCHEDULE_REQUESTED_BY_TUTOR") &&
      !s.hasStarted,
  },
  { key: "waiting", label: "Waiting on student", match: (s) => s.status === "AWAITING_RESCHEDULE" },
  { key: "completed", label: "Completed", match: (s) => s.status === "COMPLETED" },
  { key: "cancelled", label: "Cancelled", match: (s) => s.status === "CANCELLED" },
  { key: "all", label: "All", match: () => true },
];

/** The panel that opens in place of a row. Its own component so it can hold form state. */
function ActionPanel({ row, mode, onClose }: { row: TutorSessionTableRow; mode: Mode; onClose: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<"ATTENDED" | "NO_SHOW">(row.attendance ?? "ATTENDED");
  const [notes, setNotes] = useState(row.notes);
  const [reason, setReason] = useState("");
  const [offerReschedule, setOfferReschedule] = useState(true);
  const [note, setNote] = useState("");
  const [counterValue, setCounterValue] = useState("");

  const run = (action: () => Promise<{ error?: string } | void>) =>
    startTransition(async () => {
      setError(null);
      const result = await action();
      if (result && result.error) setError(result.error);
      else onClose();
    });

  const context = (
    <span className="font-normal text-zinc-500">
      {" "}
      · {row.studentName}, {row.whenLabel}
    </span>
  );

  return (
    <div className="max-w-2xl space-y-3">
      {mode === "done" && (
        <>
          <p className="text-sm font-medium text-zinc-900">
            {row.status === "COMPLETED" ? "Edit session record" : "Mark as done"}
            {context}
          </p>
          <div role="radiogroup" aria-label="Attendance" className="flex flex-wrap gap-2">
            {(["ATTENDED", "NO_SHOW"] as const).map((value) => (
              <label
                key={value}
                className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm ${
                  attendance === value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-zinc-300 bg-white text-zinc-700"
                }`}
              >
                <input
                  type="radio"
                  name={`attendance-${row.id}`}
                  value={value}
                  checked={attendance === value}
                  onChange={() => setAttendance(value)}
                  className="sr-only"
                />
                {ATTENDANCE_LABEL[value]}
              </label>
            ))}
          </div>
          <div>
            <label htmlFor={`notes-${row.id}`} className="mb-1 block text-xs font-medium text-zinc-500">
              Notes for {row.studentName}
            </label>
            <textarea
              id={`notes-${row.id}`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="What you covered, and anything to practise before next time"
              className={fieldCls}
            />
            <p className="mt-1 text-xs text-zinc-400">Your student sees these on their Sessions page.</p>
          </div>
          <div className="flex gap-2">
            <button className={primaryBtn} disabled={pending} onClick={() => run(() => completeSession(row.id, { attendance, notes }))}>
              {pending ? "Saving…" : "Save"}
            </button>
            <button className={smallBtn} onClick={onClose}>
              Close
            </button>
          </div>
        </>
      )}

      {mode === "cancel" && (
        <>
          <p className="text-sm font-medium text-zinc-900">
            Cancel session{context}
          </p>
          <div>
            <label htmlFor={`reason-${row.id}`} className="mb-1 block text-xs font-medium text-zinc-500">
              Reason
            </label>
            <textarea
              id={`reason-${row.id}`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="e.g. I'm unwell — sorry for the short notice"
              className={fieldCls}
            />
          </div>
          <label className="flex items-start gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={offerReschedule}
              onChange={(e) => setOfferReschedule(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              Let {row.studentName} pick a new time from my availability instead
              <span className="block text-xs text-zinc-400">They&rsquo;ll see your open slots on their Sessions page.</span>
            </span>
          </label>
          <div className="flex gap-2">
            <button
              className={offerReschedule ? primaryBtn : dangerBtn}
              disabled={pending || !reason.trim()}
              onClick={() => run(() => cancelSessionWithReason(row.id, { reason, offerReschedule }))}
            >
              {pending ? "Sending…" : offerReschedule ? "Send reschedule request" : "Cancel session"}
            </button>
            <button className={smallBtn} onClick={onClose}>
              Close
            </button>
          </div>
        </>
      )}

      {mode === "reschedule" && (
        <>
          <p className="text-sm font-medium text-zinc-900">
            Ask to reschedule{context}
          </p>
          <p className="text-sm text-zinc-600">
            {row.studentName} will choose a new time from your open availability. This time is released straight away.
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Optional note, e.g. something came up on Tuesday"
            className={fieldCls}
            aria-label="Note for the student"
          />
          <div className="flex gap-2">
            <button className={primaryBtn} disabled={pending} onClick={() => run(() => requestStudentReschedule(row.id, { note }))}>
              {pending ? "Sending…" : "Send request"}
            </button>
            <button className={smallBtn} onClick={onClose}>
              Close
            </button>
          </div>
        </>
      )}

      {mode === "counter" && (
        <>
          <p className="text-sm font-medium text-zinc-900">
            Propose a different time{context}
          </p>
          {row.proposedAltLabel && <p className="text-sm text-zinc-600">They asked for {row.proposedAltLabel}.</p>}
          <input
            type="datetime-local"
            value={counterValue}
            onChange={(e) => setCounterValue(e.target.value)}
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            aria-label="Proposed time"
          />
          <div className="flex gap-2">
            <button
              className={primaryBtn}
              disabled={pending || !counterValue}
              onClick={() =>
                run(() => tutorRespondToReschedule(row.id, "counter", new Date(counterValue).toISOString()))
              }
            >
              {pending ? "Sending…" : "Send"}
            </button>
            <button className={smallBtn} onClick={onClose}>
              Close
            </button>
          </div>
        </>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function TutorSessionsTable({ sessions }: { sessions: TutorSessionTableRow[] }) {
  const [open, setOpen] = useState<{ id: string; mode: Mode } | null>(null);
  const [pending, startTransition] = useTransition();
  const initialTab = sessions.some(needsAction) ? "needs" : "upcoming";

  const columns: Column<TutorSessionTableRow>[] = [
    {
      key: "student",
      header: "Student",
      sort: (s) => s.studentName.toLowerCase(),
      text: (s) => s.studentName,
      cell: (s) => (
        // The id lets a click on the calendar scroll to this row.
        <span id={`session-${s.id}`} className="flex items-center gap-3 scroll-mt-24">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${badgeColorForKey(s.studentName)}`}>
            {initialsFor(s.studentName)}
          </span>
          <span className="whitespace-nowrap font-medium text-zinc-900">{s.studentName}</span>
        </span>
      ),
    },
    {
      key: "when",
      header: "When",
      sort: (s) => s.startTime,
      text: (s) => `${s.whenLabel} (${s.durationMinutes} min)`,
      className: "whitespace-nowrap",
      cell: (s) => (
        <span>
          <span className="block text-zinc-800">{s.whenLabel}</span>
          <span className="block text-xs tabular-nums text-zinc-500">{s.durationMinutes} min</span>
          {s.status === "RESCHEDULE_REQUESTED_BY_STUDENT" && s.proposedAltLabel && (
            <span className="mt-0.5 block text-xs text-amber-700">Asks for {s.proposedAltLabel}</span>
          )}
          {s.status === "RESCHEDULE_REQUESTED_BY_TUTOR" && s.proposedAltLabel && (
            <span className="mt-0.5 block text-xs text-zinc-500">You proposed {s.proposedAltLabel}</span>
          )}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sort: (s) => SESSION_STATUS_LABEL[s.status],
      text: (s) => `${SESSION_STATUS_LABEL[s.status]}${s.attendance ? ` (${ATTENDANCE_LABEL[s.attendance]})` : ""}`,
      cell: (s) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={s.status} />
          {s.status === "COMPLETED" && s.attendance && (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                s.attendance === "ATTENDED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {ATTENDANCE_LABEL[s.attendance]}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "notes",
      header: "Notes",
      text: (s) => (s.statusReason ? `Reason: ${s.statusReason}` : s.notes),
      cell: (s) => {
        const showReason = (s.status === "CANCELLED" || s.status === "AWAITING_RESCHEDULE") && s.statusReason;
        const body = showReason ? `Reason: ${s.statusReason}` : s.notes;
        return body ? (
          <span className="line-clamp-2 block max-w-[220px]" title={body}>
            {body}
          </span>
        ) : (
          <span className="text-zinc-400">—</span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (s) => {
        if (s.status === "CANCELLED") return <span className="text-xs text-zinc-400">—</span>;
        return (
          <div className="flex flex-wrap justify-end gap-1.5">
            {s.status === "RESCHEDULE_REQUESTED_BY_STUDENT" && (
              <>
                <button
                  className={primaryBtn}
                  disabled={pending}
                  onClick={() => startTransition(() => tutorRespondToReschedule(s.id, "accept"))}
                >
                  {pending ? "Accepting…" : "Accept"}
                </button>
                <button className={smallBtn} onClick={() => setOpen({ id: s.id, mode: "counter" })}>
                  Counter
                </button>
              </>
            )}
            {s.status === "CONFIRMED" && s.hasStarted && (
              <button className={primaryBtn} onClick={() => setOpen({ id: s.id, mode: "done" })}>
                Mark done
              </button>
            )}
            {s.status === "COMPLETED" && (
              <button className={smallBtn} onClick={() => setOpen({ id: s.id, mode: "done" })}>
                Edit notes
              </button>
            )}
            {(s.status === "CONFIRMED" || s.status === "PROPOSED") && !s.hasStarted && (
              <button className={smallBtn} onClick={() => setOpen({ id: s.id, mode: "reschedule" })}>
                Reschedule
              </button>
            )}
            {s.status !== "COMPLETED" && (
              <button className={dangerBtn} onClick={() => setOpen({ id: s.id, mode: "cancel" })}>
                Cancel
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      rows={sessions}
      columns={columns}
      rowKey={(s) => s.id}
      tabs={TABS}
      initialTab={initialTab}
      search={{ placeholder: "Search student or notes", of: (s) => `${s.studentName} ${s.notes} ${s.statusReason ?? ""}` }}
      dateOf={(s) => s.localDate}
      initialSort={{ key: "when", dir: "asc" }}
      exportName="sessions"
      minWidth="720px"
      empty={{ title: "No sessions yet", hint: "Schedule one above, or publish availability so students can book." }}
      expandedKey={open?.id ?? null}
      renderExpanded={(row) =>
        open ? <ActionPanel key={`${row.id}-${open.mode}`} row={row} mode={open.mode} onClose={() => setOpen(null)} /> : null
      }
    />
  );
}
