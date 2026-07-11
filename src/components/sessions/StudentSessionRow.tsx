"use client";

import { useState, useTransition } from "react";
import { StatusBadge } from "./StatusBadge";
import { formatSessionTime } from "@/lib/sessions/format";
import { requestReschedule, studentRespondToReschedule } from "@/lib/actions/sessions";
import { badgeColorForKey, initialsFor } from "@/lib/ui/palette";
import type { SessionStatus } from "@/generated/prisma/enums";

const smallBtn =
  "rounded border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-100 disabled:opacity-40";
const primaryBtn =
  "rounded bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-40";
const dateInputCls = "rounded-md border border-zinc-300 px-2 py-1 text-sm";

export function StudentSessionRow({
  session,
  isPast,
}: {
  session: {
    id: string;
    tutorName: string;
    startTime: string;
    durationMinutes: number;
    status: SessionStatus;
    notes: string;
    proposedAltTime: string | null;
  };
  isPast: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [altValue, setAltValue] = useState("");

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${badgeColorForKey(session.tutorName)}`}
        >
          {initialsFor(session.tutorName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-zinc-900">{session.tutorName}</p>
          <p className="text-sm text-zinc-500">
            {formatSessionTime(session.startTime)} · {session.durationMinutes} min
          </p>
        </div>
        <StatusBadge status={session.status} />
      </div>

      {session.status === "RESCHEDULE_REQUESTED_BY_STUDENT" && (
        <p className="mt-3 text-sm text-zinc-500">
          Waiting on your tutor to respond to your proposed time
          {session.proposedAltTime && (
            <>
              : <strong>{formatSessionTime(session.proposedAltTime)}</strong>
            </>
          )}
        </p>
      )}

      {!isPast && session.status === "CONFIRMED" && (
        <div className="mt-3">
          {formOpen ? (
            <span className="flex flex-wrap items-center gap-1.5">
              <input
                type="datetime-local"
                value={altValue}
                onChange={(e) => setAltValue(e.target.value)}
                className={dateInputCls}
              />
              <button
                disabled={pending || !altValue}
                className={primaryBtn}
                onClick={() =>
                  startTransition(async () => {
                    await requestReschedule(session.id, new Date(altValue).toISOString());
                    setFormOpen(false);
                  })
                }
              >
                Send request
              </button>
              <button className={smallBtn} onClick={() => setFormOpen(false)}>
                Cancel
              </button>
            </span>
          ) : (
            <button className={smallBtn} onClick={() => setFormOpen(true)}>
              Request reschedule
            </button>
          )}
        </div>
      )}

      {!isPast && session.status === "RESCHEDULE_REQUESTED_BY_TUTOR" && (
        <div className="mt-3 space-y-2">
          <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Your tutor proposed:{" "}
            <strong>{session.proposedAltTime && formatSessionTime(session.proposedAltTime)}</strong>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              disabled={pending}
              className={primaryBtn}
              onClick={() => startTransition(() => studentRespondToReschedule(session.id, "accept"))}
            >
              Accept
            </button>
            {formOpen ? (
              <span className="flex items-center gap-1.5">
                <input
                  type="datetime-local"
                  value={altValue}
                  onChange={(e) => setAltValue(e.target.value)}
                  className={dateInputCls}
                />
                <button
                  disabled={pending || !altValue}
                  className={smallBtn}
                  onClick={() =>
                    startTransition(async () => {
                      await studentRespondToReschedule(
                        session.id,
                        "counter",
                        new Date(altValue).toISOString()
                      );
                      setFormOpen(false);
                    })
                  }
                >
                  Send
                </button>
                <button className={smallBtn} onClick={() => setFormOpen(false)}>
                  Cancel
                </button>
              </span>
            ) : (
              <button className={smallBtn} onClick={() => setFormOpen(true)}>
                Propose different time
              </button>
            )}
          </div>
        </div>
      )}

      {session.notes && (
        <div className="mt-3 border-t border-zinc-100 pt-3">
          <p className="mb-1 text-xs font-medium text-zinc-500">Session notes</p>
          <p className="whitespace-pre-line text-sm text-zinc-700">{session.notes}</p>
        </div>
      )}
    </div>
  );
}
