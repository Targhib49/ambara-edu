"use client";

import { useState, useTransition } from "react";
import { StatusBadge } from "./StatusBadge";
import { formatSessionTime, toDatetimeLocalValue } from "@/lib/sessions/format";
import { moveSession, cancelSession, tutorRespondToReschedule, updateSessionNotes } from "@/lib/actions/sessions";
import { badgeColorForKey, initialsFor } from "@/lib/ui/palette";
import type { SessionStatus } from "@/generated/prisma/enums";

const smallBtn =
  "rounded border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-100 disabled:opacity-40";
const primaryBtn =
  "rounded bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-40";
const dateInputCls = "rounded-md border border-zinc-300 px-2 py-1 text-sm";

export function TutorSessionRow({
  session,
}: {
  session: {
    id: string;
    studentName: string;
    startTime: string;
    durationMinutes: number;
    status: SessionStatus;
    notes: string;
    proposedAltTime: string | null;
  };
}) {
  const [pending, startTransition] = useTransition();
  const [moveOpen, setMoveOpen] = useState(false);
  const [moveValue, setMoveValue] = useState(toDatetimeLocalValue(session.startTime));
  const [counterOpen, setCounterOpen] = useState(false);
  const [counterValue, setCounterValue] = useState("");
  const [notes, setNotes] = useState(session.notes);
  const [notesSaved, setNotesSaved] = useState(false);

  const cancelled = session.status === "CANCELLED";

  return (
    <div
      id={`session-${session.id}`}
      className="scroll-mt-24 rounded-xl border border-zinc-200 bg-white p-4 transition-shadow"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${badgeColorForKey(session.studentName)}`}
        >
          {initialsFor(session.studentName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-zinc-900">{session.studentName}</p>
          <p className="text-sm text-zinc-500">
            {formatSessionTime(session.startTime)} · {session.durationMinutes} min
          </p>
        </div>
        <StatusBadge status={session.status} />
      </div>

      {session.status === "RESCHEDULE_REQUESTED_BY_STUDENT" && session.proposedAltTime && (
        <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Proposed: <strong>{formatSessionTime(session.proposedAltTime)}</strong>
        </div>
      )}
      {session.status === "RESCHEDULE_REQUESTED_BY_TUTOR" && session.proposedAltTime && (
        <p className="mt-3 text-sm text-zinc-500">
          Awaiting response to your proposal of{" "}
          <strong>{formatSessionTime(session.proposedAltTime)}</strong>
        </p>
      )}

      {!cancelled && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {session.status === "RESCHEDULE_REQUESTED_BY_STUDENT" && (
            <button
              disabled={pending}
              className={primaryBtn}
              onClick={() => startTransition(() => tutorRespondToReschedule(session.id, "accept"))}
            >
              Accept
            </button>
          )}
          {counterOpen ? (
            <span className="flex items-center gap-1.5">
              <input
                type="datetime-local"
                value={counterValue}
                onChange={(e) => setCounterValue(e.target.value)}
                className={dateInputCls}
              />
              <button
                disabled={pending || !counterValue}
                className={primaryBtn}
                onClick={() =>
                  startTransition(async () => {
                    await tutorRespondToReschedule(
                      session.id,
                      "counter",
                      new Date(counterValue).toISOString()
                    );
                    setCounterOpen(false);
                  })
                }
              >
                Send
              </button>
              <button className={smallBtn} onClick={() => setCounterOpen(false)}>
                Cancel
              </button>
            </span>
          ) : (
            session.status === "RESCHEDULE_REQUESTED_BY_STUDENT" && (
              <button className={smallBtn} onClick={() => setCounterOpen(true)}>
                Propose different time
              </button>
            )
          )}

          {moveOpen ? (
            <span className="flex items-center gap-1.5">
              <input
                type="datetime-local"
                value={moveValue}
                onChange={(e) => setMoveValue(e.target.value)}
                className={dateInputCls}
              />
              <button
                disabled={pending || !moveValue}
                className={smallBtn}
                onClick={() =>
                  startTransition(async () => {
                    await moveSession(session.id, new Date(moveValue).toISOString());
                    setMoveOpen(false);
                  })
                }
              >
                Confirm move
              </button>
              <button className={smallBtn} onClick={() => setMoveOpen(false)}>
                Cancel
              </button>
            </span>
          ) : (
            <button className={smallBtn} onClick={() => setMoveOpen(true)}>
              Move
            </button>
          )}

          <button
            disabled={pending}
            className={`${smallBtn} text-red-600`}
            onClick={() => {
              if (!confirm(`Cancel the session with ${session.studentName} on ${formatSessionTime(session.startTime)}?`)) {
                return;
              }
              startTransition(() => cancelSession(session.id));
            }}
          >
            Cancel session
          </button>
        </div>
      )}

      <div className="mt-3 border-t border-zinc-100 pt-3">
        <label className="mb-1 block text-xs font-medium text-zinc-500">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setNotesSaved(false);
          }}
          rows={2}
          placeholder="What was covered, next steps…"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          disabled={pending}
          className={`${smallBtn} mt-1.5`}
          onClick={() =>
            startTransition(async () => {
              await updateSessionNotes(session.id, notes);
              setNotesSaved(true);
            })
          }
        >
          {notesSaved ? "Saved ✓" : "Save notes"}
        </button>
      </div>
    </div>
  );
}
