"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Combobox, type ComboOption } from "@/components/ui/Combobox";
import { useSlideOver } from "@/components/ui/SlideOver";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { btnPrimary, btnSecondary, hintCls, inputCls, labelCls } from "@/components/ui/styles";
import {
  addSyllabusCourse,
  approveRequest,
  createSyllabus,
  declineRequest,
  moveSyllabusCourse,
  removeSyllabusCourse,
  updateSyllabus,
  updateSyllabusCourse,
  type SyllabusResult,
} from "@/lib/actions/syllabi";
import { formatIDR } from "@/lib/billing/money";
import { useT } from "@/lib/i18n/client";
import type { CourseStatus, SyllabusAccess } from "@/generated/prisma/enums";

const empty = {} as SyllabusResult;

function Problem({ state }: { state: SyllabusResult }) {
  return state.error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p> : null;
}

/** Creating one: a name is enough, the rest is set on its own page. */
export function NewSyllabusForm() {
  const t = useT();
  const [state, action] = useActionState(createSyllabus, empty);
  const router = useRouter();
  const id = state.ok ? state.id : undefined;
  useEffect(() => {
    if (id) router.push(`/tutor/syllabi/${id}`);
  }, [id, router]);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className={labelCls} htmlFor="syllabus-title">
          {t("syllabus.name")}
        </label>
        <input id="syllabus-title" name="title" autoFocus className={inputCls} />
      </div>
      <div>
        <label className={labelCls} htmlFor="syllabus-desc">
          {t("syllabus.description")}
        </label>
        <textarea id="syllabus-desc" name="description" rows={3} className={inputCls} />
      </div>
      <Problem state={state} />
      <SubmitButton pendingLabel={t("action.adding")} className={btnPrimary}>
        {t("syllabus.new")}
      </SubmitButton>
    </form>
  );
}

/** Name, description, who can get in, and what it costs. */
export function SyllabusSettingsForm({
  id,
  title,
  description,
  access,
  status,
  price,
}: {
  id: string;
  title: string;
  description: string;
  access: SyllabusAccess;
  status: CourseStatus;
  price: number;
}) {
  const t = useT();
  const [state, action] = useActionState(updateSyllabus, empty);
  const [chosen, setChosen] = useState<SyllabusAccess>(access);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <div>
        <label className={labelCls} htmlFor="s-title">
          {t("syllabus.name")}
        </label>
        <input id="s-title" name="title" defaultValue={title} className={inputCls} />
      </div>
      <div>
        <label className={labelCls} htmlFor="s-desc">
          {t("syllabus.description")}
        </label>
        <textarea id="s-desc" name="description" rows={3} defaultValue={description} className={inputCls} />
      </div>

      <fieldset>
        <legend className={labelCls}>{t("syllabus.access")}</legend>
        <div className="space-y-1.5">
          {(["OPEN", "REQUEST"] as SyllabusAccess[]).map((option) => (
            <label
              key={option}
              className={`flex cursor-pointer gap-2 rounded-md border p-2.5 ${chosen === option ? "border-blue-400 bg-blue-50/50" : "border-zinc-200"}`}
            >
              <input type="radio" name="access" value={option} checked={chosen === option} onChange={() => setChosen(option)} className="mt-0.5" />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-zinc-900">{t(`syllabus.access.${option}` as never)}</span>
                <span className="block text-xs text-zinc-500">{t(`syllabus.access.${option}.hint` as never)}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {chosen === "REQUEST" && (
        <div>
          <label className={labelCls} htmlFor="s-price">
            {t("syllabus.price")}
          </label>
          <input id="s-price" name="price" inputMode="numeric" defaultValue={price || ""} placeholder="0" className={inputCls} />
          <p className={hintCls}>{t("syllabus.priceHint")}</p>
        </div>
      )}

      <div>
        <label className={labelCls} htmlFor="s-status">
          {t("courseEditor.status")}
        </label>
        <select id="s-status" name="status" defaultValue={status} className={inputCls}>
          <option value="DRAFT">{t("status.draft")}</option>
          <option value="PUBLISHED">{t("status.published")}</option>
          <option value="ARCHIVED">{t("courseStatus.ARCHIVED")}</option>
        </select>
      </div>

      <Problem state={state} />
      <SubmitButton pendingLabel={t("lessonEditor.updating")} className={btnPrimary}>
        {t("invoice.save")}
      </SubmitButton>
    </form>
  );
}

export function AddCourseForm({ syllabusId, courses }: { syllabusId: string; courses: ComboOption[] }) {
  const t = useT();
  const [state, action] = useActionState(addSyllabusCourse, empty);
  const slideOver = useSlideOver();
  const done = state.ok === true;
  useEffect(() => {
    if (done) slideOver?.close();
  }, [done, slideOver]);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="syllabusId" value={syllabusId} />
      <div>
        <label className={labelCls}>{t("nav.courses")}</label>
        <Combobox name="courseId" options={courses} placeholder={t("syllabus.addCourse")} />
      </div>
      <Problem state={state} />
      <SubmitButton pendingLabel={t("action.adding")} className={btnPrimary}>
        {t("action.add")}
      </SubmitButton>
    </form>
  );
}

/** One course's row in the builder: order, pass mark, whether it's gated. */
export function SyllabusCourseRow({
  id,
  title,
  index,
  count,
  passScore,
  requiresPrevious,
}: {
  id: string;
  title: string;
  index: number;
  count: number;
  passScore: number;
  requiresPrevious: boolean;
}) {
  const t = useT();
  const [state, action] = useActionState(updateSyllabusCourse, empty);
  const [pending, setPending] = useState(false);
  const move = async (direction: "up" | "down") => {
    setPending(true);
    await moveSyllabusCourse(id, direction);
    setPending(false);
  };
  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3">
      <span className="w-5 shrink-0 text-right text-xs tabular-nums text-zinc-400">{index + 1}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-zinc-900">{title}</span>
        <span className="block text-xs text-zinc-500">{index === 0 ? t("syllabus.first") : t("syllabus.passScoreShort", { n: passScore })}</span>
      </span>

      <form action={action} className="flex items-center gap-2">
        <input type="hidden" name="id" value={id} />
        <label className="flex items-center gap-1.5 text-xs text-zinc-600">
          <input
            name="passScore"
            defaultValue={passScore}
            inputMode="numeric"
            aria-label={t("syllabus.passScore")}
            className="w-14 rounded border border-zinc-300 px-2 py-1 text-sm"
          />
          %
        </label>
        {index > 0 && (
          <label className="flex items-center gap-1.5 text-xs text-zinc-600" title={t("syllabus.requiresPrevious")}>
            <input type="checkbox" name="requiresPrevious" defaultChecked={requiresPrevious} />
            🔒
          </label>
        )}
        <SubmitButton pendingLabel="…" className={`${btnSecondary} px-2 py-1 text-xs`}>
          {t("invoice.save")}
        </SubmitButton>
      </form>

      <div className="flex items-center gap-1">
        <button type="button" disabled={pending || index === 0} onClick={() => move("up")} aria-label="↑" className="rounded px-1.5 py-1 text-xs text-zinc-500 hover:bg-zinc-100 disabled:opacity-30">
          ↑
        </button>
        <button type="button" disabled={pending || index === count - 1} onClick={() => move("down")} aria-label="↓" className="rounded px-1.5 py-1 text-xs text-zinc-500 hover:bg-zinc-100 disabled:opacity-30">
          ↓
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => confirm(t("quizDetail.deleteConfirm", { title })) && removeSyllabusCourse(id)}
          aria-label={t("action.delete")}
          className="rounded px-1.5 py-1 text-xs text-zinc-400 hover:text-red-600 disabled:opacity-30"
        >
          ✕
        </button>
      </div>
      {state.error && <p className="w-full text-xs text-red-700">{state.error}</p>}
    </li>
  );
}

/** A student's request, with the two buttons that answer it. */
export function RequestRow({
  requestId,
  studentName,
  syllabusTitle,
  message,
  price,
  createdLabel,
}: {
  requestId: string;
  studentName: string;
  syllabusTitle: string;
  message: string;
  price: number;
  createdLabel: string;
}) {
  const t = useT();
  const [approveState, approve] = useActionState(approveRequest, empty);
  const [declineState, decline] = useActionState(declineRequest, empty);
  const [reply, setReply] = useState("");
  return (
    <li className="space-y-2 px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-zinc-900">
          <span className="font-medium">{studentName}</span> · {syllabusTitle}
        </p>
        <p className="text-xs text-zinc-500">
          {createdLabel} · {price > 0 ? formatIDR(price) : t("syllabus.free")}
        </p>
      </div>
      {message && <p className="rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-600">{message}</p>}
      <input
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder={t("syllabus.reply")}
        aria-label={t("syllabus.reply")}
        className={inputCls}
      />
      <div className="flex flex-wrap gap-2">
        <form action={approve}>
          <input type="hidden" name="requestId" value={requestId} />
          <input type="hidden" name="reply" value={reply} />
          <SubmitButton pendingLabel={t("lessonEditor.updating")} className={btnPrimary}>
            {price > 0 ? `${t("syllabus.approve")} · ${t("billing.newInvoice")}` : t("syllabus.approve")}
          </SubmitButton>
        </form>
        <form action={decline}>
          <input type="hidden" name="requestId" value={requestId} />
          <input type="hidden" name="reply" value={reply} />
          <SubmitButton pendingLabel={t("lessonEditor.updating")} className={btnSecondary}>
            {t("syllabus.decline")}
          </SubmitButton>
        </form>
      </div>
      <Problem state={approveState} />
      <Problem state={declineState} />
    </li>
  );
}
