"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { createStudent, resendVerificationEmail, type CreateStudentState } from "@/lib/actions/students";
import { enrollStudents } from "@/lib/actions/courses";
import type { StudentGroup } from "@/generated/prisma/enums";
import { badgeColorForKey, initialsFor } from "@/lib/ui/palette";
import { DataTable, type Column, type Tab } from "@/components/ui/DataTable";
import { Combobox, type ComboOption } from "@/components/ui/Combobox";
import { useSlideOver } from "@/components/ui/SlideOver";
import { btnPrimary, btnSecondary, hintCls, inputCls, labelCls } from "@/components/ui/styles";
import { useT } from "@/lib/i18n/client";
import type { MessageKey } from "@/lib/i18n/messages";
import type { Translate } from "@/lib/i18n/translate";

export const GROUP_LABEL_KEYS: Record<StudentGroup, MessageKey> = {
  JUNIOR_HIGH: "group.JUNIOR_HIGH",
  UNDERGRAD: "group.UNDERGRAD",
  GRAD: "group.GRAD",
};

export type StudentRow = {
  id: string;
  name: string;
  email: string;
  studentGroup: StudentGroup | null;
  emailVerifiedAt: Date | null;
  courses: { id: string; title: string }[];
  /** Server-formatted in WIB. */
  nextSessionLabel: string | null;
};

const makeTabs = (t: Translate): Tab<StudentRow>[] => [
  { key: "all", label: t("status.all"), match: () => true },
  { key: "JUNIOR_HIGH", label: t("group.JUNIOR_HIGH"), match: (s) => s.studentGroup === "JUNIOR_HIGH" },
  { key: "UNDERGRAD", label: t("group.UNDERGRAD"), match: (s) => s.studentGroup === "UNDERGRAD" },
  { key: "GRAD", label: t("group.GRAD"), match: (s) => s.studentGroup === "GRAD" },
  // An account that can sign in but sees nothing — worth finding quickly.
  { key: "unenrolled", label: t("students.notEnrolled"), match: (s) => s.courses.length === 0 },
];

const makeColumns = (t: Translate, mailEnabled: boolean): Column<StudentRow>[] => [
  {
    key: "name",
    header: t("students.header.student"),
    sort: (s) => s.name.toLowerCase(),
    text: (s) => s.name,
    className: "min-w-[220px]",
    cell: (s) => (
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${badgeColorForKey(s.name)}`}>
          {initialsFor(s.name)}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-medium text-zinc-900">{s.name}</span>
          <span className="block truncate text-xs text-zinc-500">{s.email}</span>
        </span>
      </div>
    ),
  },
  { key: "email", header: t("students.header.email"), text: (s) => s.email, csvOnly: true, cell: () => null },
  {
    key: "group",
    header: t("students.header.group"),
    sort: (s) => (s.studentGroup ? t(GROUP_LABEL_KEYS[s.studentGroup]) : ""),
    text: (s) => (s.studentGroup ? t(GROUP_LABEL_KEYS[s.studentGroup]) : ""),
    className: "whitespace-nowrap",
    cell: (s) => (s.studentGroup ? t(GROUP_LABEL_KEYS[s.studentGroup]) : <span className="text-zinc-400">—</span>),
  },
  {
    key: "courses",
    header: t("students.header.courses"),
    sort: (s) => s.courses.length,
    text: (s) => s.courses.map((c) => c.title).join("; "),
    cell: (s) =>
      s.courses.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1">
          {s.courses.slice(0, 2).map((c) => (
            <span key={c.id} className="max-w-[160px] truncate rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-700">
              {c.title}
            </span>
          ))}
          {s.courses.length > 2 && (
            <span className="text-[11px] text-zinc-500">{t("students.moreCourses", { n: s.courses.length - 2 })}</span>
          )}
        </div>
      ) : (
        <span className="text-xs font-medium text-amber-700">{t("students.notEnrolled")}</span>
      ),
  },
  {
    key: "next",
    header: t("students.header.nextSession"),
    text: (s) => s.nextSessionLabel ?? "",
    hideBelow: "xl",
    className: "whitespace-nowrap",
    cell: (s) => s.nextSessionLabel ?? <span className="text-zinc-400">—</span>,
  },
  {
    key: "status",
    header: t("students.header.email"),
    sort: (s) => (s.emailVerifiedAt ? 1 : 0),
    text: (s) => (s.emailVerifiedAt ? t("students.verified") : t("students.pending")),
    className: "whitespace-nowrap",
    cell: (s) => (
      <span className="inline-flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            s.emailVerifiedAt ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {s.emailVerifiedAt ? t("students.verified") : t("students.pending")}
        </span>
        {/* Nothing to resend while mail is off; the badge still tells the
            tutor the address was never confirmed. */}
        {!s.emailVerifiedAt && mailEnabled && (
          <button onClick={() => void resendVerificationEmail(s.id)} className="text-xs text-blue-600 hover:underline">
            {t("students.resend")}
          </button>
        )}
      </span>
    ),
  },
];

/** Enroll every ticked student in one course. */
function BulkAssign({ courses, studentIds, onDone }: { courses: ComboOption[]; studentIds: string[]; onDone: () => void }) {
  const t = useT();
  const [courseId, setCourseId] = useState("");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-64">
        <Combobox options={courses} value={courseId} onChange={setCourseId} placeholder={t("students.assignTo")} aria-label={t("students.assignAria")} />
      </div>
      <button
        disabled={!courseId || pending}
        onClick={() =>
          startTransition(async () => {
            const result = await enrollStudents(courseId, studentIds);
            if (result.error) {
              setMessage(result.error);
              return;
            }
            setCourseId("");
            setMessage(null);
            onDone();
          })
        }
        className={btnPrimary}
      >
        {pending ? t("students.assigning") : t("students.assign")}
      </button>
      {message && <span className="text-xs text-red-700">{message}</span>}
    </div>
  );
}

export function StudentTable({
  students,
  courses,
  mailEnabled,
}: {
  students: StudentRow[];
  courses: ComboOption[];
  mailEnabled: boolean;
}) {
  const t = useT();
  return (
    <DataTable
      rows={students}
      columns={makeColumns(t, mailEnabled)}
      rowKey={(s) => s.id}
      rowHref={(s) => `/tutor/students/${s.id}`}
      tabs={makeTabs(t)}
      search={{ placeholder: t("students.search"), of: (s) => `${s.name} ${s.email} ${s.courses.map((c) => c.title).join(" ")}` }}
      initialSort={{ key: "name", dir: "asc" }}
      exportName="students"
      minWidth="700px"
      empty={{ title: t("students.empty"), hint: t("students.emptyHint") }}
      bulkActions={(selected, clear) => (
        <BulkAssign courses={courses} studentIds={selected.map((s) => s.id)} onDone={clear} />
      )}
    />
  );
}

function randomPassword() {
  // No look-alike characters, so it can be read out or written down safely.
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

/** Lives in the "Add student" panel. */
export function CreateStudentForm() {
  const t = useT();
  const panel = useSlideOver();
  const formRef = useRef<HTMLFormElement>(null);
  const [password, setPassword] = useState("");
  const [state, formAction, pending] = useActionState<CreateStudentState, FormData>(async (prev, formData) => {
    const result = await createStudent(prev, formData);
    // Stay open on success: the message carries the login details to hand over,
    // and the next student can be added straight away.
    if (result.success) {
      formRef.current?.reset();
      setPassword("");
    }
    return result;
  }, {});

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div>
        <label className={labelCls} htmlFor="student-name">
          {t("createStudent.fullName")}
        </label>
        <input id="student-name" name="name" required className={inputCls} />
      </div>
      <div>
        <label className={labelCls} htmlFor="student-email">
          {t("createStudent.email")}
        </label>
        <input id="student-email" name="email" type="email" required className={inputCls} />
      </div>
      <div>
        <label className={labelCls} htmlFor="student-password">
          {t("createStudent.tempPassword")}
        </label>
        <div className="flex gap-2">
          <input
            id="student-password"
            name="password"
            type="text"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputCls} font-mono`}
          />
          <button type="button" onClick={() => setPassword(randomPassword())} className={btnSecondary}>
            {t("createStudent.generate")}
          </button>
        </div>
        <p className={hintCls}>{t("createStudent.passwordHint")}</p>
      </div>
      <div>
        <label className={labelCls} htmlFor="student-group">
          {t("createStudent.group")}
        </label>
        <select id="student-group" name="studentGroup" className={inputCls} defaultValue="">
          <option value="">{t("group.notSet")}</option>
          <option value="JUNIOR_HIGH">{t("group.JUNIOR_HIGH")}</option>
          <option value="UNDERGRAD">{t("group.UNDERGRAD")}</option>
          <option value="GRAD">{t("group.GRAD")}</option>
        </select>
      </div>

      {state.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state.success && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">{state.success}</p>}

      <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
        {panel && (
          <button type="button" onClick={panel.close} className={btnSecondary}>
            {state.success ? t("action.done") : t("action.cancel")}
          </button>
        )}
        <button disabled={pending} className={btnPrimary}>
          {pending ? t("action.creating") : t("createStudent.submit")}
        </button>
      </div>
    </form>
  );
}
