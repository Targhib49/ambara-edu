"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { btnPrimary, btnSecondary, inputCls, labelCls } from "@/components/ui/styles";
import { joinOpenCourse, joinSyllabus, requestSyllabus, withdrawRequest, type SyllabusResult } from "@/lib/actions/syllabi";
import { useT } from "@/lib/i18n/client";

const empty = {} as SyllabusResult;

/** Starting a course that's open to everyone: one press, then straight into it. */
export function StartOpenCourseButton({ courseId }: { courseId: string }) {
  const t = useT();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="shrink-0">
      <button
        type="button"
        disabled={pending}
        className={btnPrimary}
        onClick={() =>
          start(async () => {
            const result = await joinOpenCourse(courseId);
            if (result.error) setError(result.error);
            else router.push(`/courses/${courseId}`);
          })
        }
      >
        {pending ? t("syllabus.starting") : t("syllabus.start")}
      </button>
      {error && <span className="block text-xs text-red-700">{error}</span>}
    </span>
  );
}

export function JoinSyllabusButton({ syllabusId }: { syllabusId: string }) {
  const t = useT();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="shrink-0">
      <button
        type="button"
        disabled={pending}
        className={btnPrimary}
        onClick={() =>
          start(async () => {
            const result = await joinSyllabus(syllabusId);
            if (result.error) setError(result.error);
            else router.push(`/syllabus/${syllabusId}`);
          })
        }
      >
        {pending ? t("syllabus.starting") : t("syllabus.join")}
      </button>
      {error && <span className="block text-xs text-red-700">{error}</span>}
    </span>
  );
}

/** Asking for a syllabus that has to be approved — and paid for, if it has a price. */
export function RequestAccessForm({ syllabusId, price }: { syllabusId: string; price: string | null }) {
  const t = useT();
  const [state, action] = useActionState(requestSyllabus, empty);
  const [open, setOpen] = useState(false);
  if (state.ok) return <p className="text-sm text-green-700">{t("syllabus.requestSent")}</p>;
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={btnSecondary}>
        {price ? `${t("syllabus.request")} · ${price}` : t("syllabus.request")}
      </button>
    );
  }
  return (
    <form action={action} className="w-full space-y-2">
      <input type="hidden" name="syllabusId" value={syllabusId} />
      <label className={labelCls} htmlFor={`msg-${syllabusId}`}>
        {t("syllabus.requestMessage")}
      </label>
      <textarea id={`msg-${syllabusId}`} name="message" rows={2} className={inputCls} />
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      <div className="flex gap-2">
        <SubmitButton pendingLabel={t("action.adding")} className={btnPrimary}>
          {t("syllabus.request")}
        </SubmitButton>
        <button type="button" onClick={() => setOpen(false)} className={btnSecondary}>
          {t("action.cancel")}
        </button>
      </div>
    </form>
  );
}

export function WithdrawRequestButton({ requestId }: { requestId: string }) {
  const t = useT();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => void (await withdrawRequest(requestId)))}
      className="text-xs font-medium text-zinc-500 hover:text-red-600 disabled:opacity-50"
    >
      {t("syllabus.withdraw")}
    </button>
  );
}
