"use client";

import { useActionState, useMemo, useState } from "react";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { btnPrimary, btnSecondary, cardCls, inputCls, labelCls } from "@/components/ui/styles";
import { setSessionSubjects, type BillingResult } from "@/lib/actions/billing";
import { useT } from "@/lib/i18n/client";

export type TaggableSession = {
  id: string;
  studentId: string;
  studentName: string;
  /** Server-formatted in app time. */
  whenLabel: string;
  /** "2026-09" — what the month filter matches. */
  month: string;
  durationMinutes: number;
  statusLabel: string;
  subject: string | null;
  seriesLabel: string | null;
};

/**
 * Tagging sessions with their subject, in bulk. The filters narrow to one
 * student, one month or one weekly series at a time, which is how a tutor
 * remembers what a session was: "Tuesdays at four were maths".
 */
export function SubjectTagger({
  sessions,
  courses,
  students,
}: {
  sessions: TaggableSession[];
  courses: { value: string; label: string }[];
  students: { value: string; label: string }[];
}) {
  const t = useT();
  const [state, action] = useActionState(setSessionSubjects, {} as BillingResult);
  const [student, setStudent] = useState("");
  const [month, setMonth] = useState("");
  const [onlyUntagged, setOnlyUntagged] = useState(true);
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const shown = useMemo(
    () =>
      sessions.filter(
        (s) =>
          (!student || s.studentId === student) &&
          (!month || s.month === month) &&
          (!onlyUntagged || s.subject === null)
      ),
    [sessions, student, month, onlyUntagged]
  );

  const months = useMemo(() => [...new Set(sessions.map((s) => s.month))].sort().reverse(), [sessions]);
  const toggle = (id: string) =>
    setPicked((old) => {
      const next = new Set(old);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <form action={action} className="space-y-4">
      <div className={`${cardCls} flex flex-wrap items-end gap-3 p-3`}>
        <div className="min-w-[10rem]">
          <label className={labelCls} htmlFor="filter-student">
            {t("students.header.student")}
          </label>
          <select id="filter-student" value={student} onChange={(e) => setStudent(e.target.value)} className={inputCls}>
            <option value="">{t("status.all")}</option>
            {students.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[8rem]">
          <label className={labelCls} htmlFor="filter-month">
            {t("billing.month")}
          </label>
          <select id="filter-month" value={month} onChange={(e) => setMonth(e.target.value)} className={inputCls}>
            <option value="">{t("status.all")}</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm text-zinc-700">
          <input type="checkbox" checked={onlyUntagged} onChange={(e) => setOnlyUntagged(e.target.checked)} />
          {t("subjects.untagged")}
        </label>
        <div className="ml-auto flex items-end gap-2">
          <button type="button" onClick={() => setPicked(new Set(shown.map((s) => s.id)))} className={btnSecondary}>
            {t("subjects.selectAll")}
          </button>
          {picked.size > 0 && (
            <button type="button" onClick={() => setPicked(new Set())} className={btnSecondary}>
              {t("subjects.clear")}
            </button>
          )}
        </div>
      </div>

      <div className={`${cardCls} overflow-hidden`}>
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs text-zinc-500">
            <tr>
              <th className="w-10 px-3 py-2" />
              <th className="px-3 py-2 font-medium">{t("students.header.student")}</th>
              <th className="px-3 py-2 font-medium">{t("studentDetail.when")}</th>
              <th className="px-3 py-2 font-medium">{t("schedule.subject")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {shown.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-sm text-zinc-500">
                  {t("subjects.none")}
                </td>
              </tr>
            )}
            {shown.map((s) => (
              <tr key={s.id} className={picked.has(s.id) ? "bg-blue-50/50" : undefined}>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    name="sessionId"
                    value={s.id}
                    checked={picked.has(s.id)}
                    onChange={() => toggle(s.id)}
                    aria-label={`${s.studentName} ${s.whenLabel}`}
                  />
                </td>
                <td className="px-3 py-2 text-zinc-800">{s.studentName}</td>
                <td className="px-3 py-2 text-zinc-600">
                  {s.whenLabel}
                  <span className="text-zinc-400"> · {s.durationMinutes}m · {s.statusLabel}</span>
                  {s.seriesLabel && <span className="block text-xs text-zinc-400">{s.seriesLabel}</span>}
                </td>
                <td className="px-3 py-2 text-zinc-600">{s.subject ?? <span className="text-zinc-400">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`${cardCls} flex flex-wrap items-end gap-3 p-3`}>
        <p className="pb-2 text-sm text-zinc-600">{t("subjects.selected", { n: picked.size })}</p>
        <div className="min-w-[12rem]">
          <label className={labelCls} htmlFor="apply-course">
            {t("subjects.apply")}
          </label>
          <select id="apply-course" name="courseId" className={inputCls}>
            {courses.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
            <option value="">{t("schedule.noSubject")}</option>
          </select>
        </div>
        <SubmitButton pendingLabel={t("lessonEditor.updating")} className={btnPrimary}>
          {t("subjects.applyButton")}
        </SubmitButton>
        {state.error && <p className="pb-2 text-sm text-red-700">{state.error}</p>}
        {state.ok && <p className="pb-2 text-sm text-green-700">{t("subjects.done")}</p>}
      </div>
    </form>
  );
}
