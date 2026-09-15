"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { StatusBadge } from "./StatusBadge";
import type { OpenSlot } from "./BookingPanel";
import { formatSessionTime } from "@/lib/sessions/format";
import { requestReschedule, studentPickRescheduleSlot, studentRespondToReschedule } from "@/lib/actions/sessions";
import { badgeColorForKey, initialsFor } from "@/lib/ui/palette";
import type { SessionStatus } from "@/generated/prisma/enums";

const smallBtn =
  "rounded border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-100 disabled:opacity-40";
const primaryBtn =
  "rounded bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-40";
const dateInputCls = "rounded-md border border-zinc-300 px-2 py-1 text-sm";

/** Enough to choose from without turning the card into a month of buttons. */
const MAX_RESCHEDULE_SLOTS = 12;

export function StudentSessionRow({
  session,
  isPast,
  rescheduleSlots,
}: {
  session: {
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
  isPast: boolean;
  /**
   * Open slots to reschedule into. Omitted where a page doesn't load
   * availability (the dashboard) — the card then links to the Sessions page,
   * which has the picker, instead of pretending there are no times.
   */
  rescheduleSlots?: OpenSlot[];
}) {
  const [pending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [altValue, setAltValue] = useState("");
  const [pickError, setPickError] = useState<string | null>(null);

  // Only this tutor's times, long enough for this session.
  const slots = (rescheduleSlots ?? [])
    .filter((slot) => slot.tutorId === session.tutorId && slot.durationMinutes >= session.durationMinutes)
    .slice(0, MAX_RESCHEDULE_SLOTS);
  const slotsByDay = slots.reduce<[string, OpenSlot[]][]>((groups, slot) => {
    const last = groups[groups.length - 1];
    if (last && last[0] === slot.dayLabel) last[1].push(slot);
    else groups.push([slot.dayLabel, [slot]]);
    return groups;
  }, []);

  return (
    <div
      id={`session-${session.id}`}
      className="scroll-mt-24 rounded-xl border border-zinc-200 bg-white p-4 transition-shadow"
    >
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

      {session.status === "AWAITING_RESCHEDULE" && (
        <div className="mt-3 space-y-2.5 rounded-lg border border-violet-200 bg-violet-50/60 p-3">
          <p className="text-sm font-medium text-violet-900">Your tutor needs to move this session — pick a new time.</p>
          {session.statusReason && <p className="text-sm text-violet-800">&ldquo;{session.statusReason}&rdquo;</p>}
          {rescheduleSlots === undefined ? (
            <Link href="/sessions" className="inline-block text-sm font-medium text-violet-800 hover:underline">
              Pick a new time on your Sessions page →
            </Link>
          ) : slotsByDay.length === 0 ? (
            <p className="text-sm text-zinc-600">No open times right now. Message your tutor to arrange one.</p>
          ) : (
            <div className="space-y-2">
              {slotsByDay.map(([day, daySlots]) => (
                <div key={day}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700/70">{day}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {daySlots.map((slot) => (
                      <button
                        key={slot.startIso}
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            setPickError(null);
                            const result = await studentPickRescheduleSlot(session.id, slot.availabilityId, slot.startIso);
                            if (result.error) setPickError(result.error);
                          })
                        }
                        className="rounded-md border border-violet-300 bg-white px-2.5 py-1 text-sm text-violet-900 hover:border-violet-500 hover:bg-violet-100 disabled:opacity-50"
                      >
                        {slot.timeLabel}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {pickError && <p className="text-sm text-red-600">{pickError}</p>}
        </div>
      )}

      {session.status === "CANCELLED" && session.statusReason && (
        <p className="mt-3 text-sm text-zinc-500">Reason: {session.statusReason}</p>
      )}

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
                      await studentRespondToReschedule(session.id, "counter", new Date(altValue).toISOString());
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
