"use client";

import { useActionState, useState, useTransition } from "react";
import { createStudent, resendVerificationEmail, type CreateStudentState } from "@/lib/actions/students";
import { enrollStudents } from "@/lib/actions/courses";
import type { StudentGroup } from "@/generated/prisma/enums";
import { badgeColorForKey, initialsFor } from "@/lib/ui/palette";
import { DataTable, type Column, type Tab } from "@/components/ui/DataTable";
import { Combobox, type ComboOption } from "@/components/ui/Combobox";
import { SlideOverButton, useSlideOver } from "@/components/ui/SlideOver";
import { InviteLinkCard, NewInviteLinkPanel } from "@/components/students/InviteLink";
import { btnPrimary, btnSecondary, hintCls, inputCls, labelCls } from "@/components/ui/styles";
import { useT } from "@/lib/i18n/client";
import type { MessageKey } from "@/lib/i18n/messages";
import type { Translate } from "@/lib/i18n/translate";
import { Alert } from "@/components/ui/Alert";

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
  /** Added by name and hasn't used their join link yet; `email` is a placeholder. */
  invitePending: boolean;
  courses: { id: string; title: string }[];
  /** Server-formatted in WIB. */
  nextSessionLabel: string | null;
};

const makeTabs = (t: Translate): Tab<StudentRow>[] => [
  { key: "all", label: t("status.all"), match: () => true },
  { key: "JUNIOR_HIGH", label: t("group.JUNIOR_HIGH"), match: (s) => s.studentGroup === "JUNIOR_HIGH" },
  { key: "UNDERGRAD", label: t("group.UNDERGRAD"), match: (s) => s.studentGroup === "UNDERGRAD" },
  { key: "GRAD", label: t("group.GRAD"), match: (s) => s.studentGroup === "GRAD" },
  { key: "invited", label: t("students.invitePending"), match: (s) => s.invitePending },
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
          <span className="block truncate font-medium text-ink">{s.name}</span>
          {s.invitePending ? (
            <span className="block truncate text-xs text-warning-ink">{t("students.notJoinedYet")}</span>
          ) : (
            <span className="block truncate text-xs text-ink-subtle">{s.email}</span>
          )}
        </span>
      </div>
    ),
  },
  { key: "email", header: t("students.header.email"), text: (s) => (s.invitePending ? "" : s.email), csvOnly: true, cell: () => null },
  {
    key: "group",
    header: t("students.header.group"),
    sort: (s) => (s.studentGroup ? t(GROUP_LABEL_KEYS[s.studentGroup]) : ""),
    text: (s) => (s.studentGroup ? t(GROUP_LABEL_KEYS[s.studentGroup]) : ""),
    className: "whitespace-nowrap",
    cell: (s) => (s.studentGroup ? t(GROUP_LABEL_KEYS[s.studentGroup]) : <span className="text-ink-faint">—</span>),
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
            <span key={c.id} className="max-w-[160px] truncate rounded-full bg-surface-sunken px-2 py-0.5 text-[11px] text-ink-soft">
              {c.title}
            </span>
          ))}
          {s.courses.length > 2 && (
            <span className="text-[11px] text-ink-subtle">{t("students.moreCourses", { n: s.courses.length - 2 })}</span>
          )}
        </div>
      ) : (
        <span className="text-xs font-medium text-warning-ink">{t("students.notEnrolled")}</span>
      ),
  },
  {
    key: "next",
    header: t("students.header.nextSession"),
    text: (s) => s.nextSessionLabel ?? "",
    hideBelow: "xl",
    className: "whitespace-nowrap",
    cell: (s) => s.nextSessionLabel ?? <span className="text-ink-faint">—</span>,
  },
  {
    key: "status",
    header: t("students.header.email"),
    sort: (s) => (s.invitePending ? -1 : s.emailVerifiedAt ? 1 : 0),
    text: (s) =>
      s.invitePending ? t("students.invitePending") : s.emailVerifiedAt ? t("students.verified") : t("students.pending"),
    className: "whitespace-nowrap",
    cell: (s) =>
      s.invitePending ? (
        // The panel renders inside this row; keep its clicks from opening the student.
        <span className="inline-flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs text-warning-ink">{t("students.invitePending")}</span>
          <SlideOverButton
            label={t("invite.newLink")}
            title={t("invite.newLinkTitle", { name: s.name })}
            variant="small"
            icon="none"
          >
            <NewInviteLinkPanel studentId={s.id} name={s.name} />
          </SlideOverButton>
        </span>
      ) : (
      <span className="inline-flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            s.emailVerifiedAt ? "bg-success-soft text-success-ink" : "bg-warning-soft text-warning-ink"
          }`}
        >
          {s.emailVerifiedAt ? t("students.verified") : t("students.pending")}
        </span>
        {/* Nothing to resend while mail is off; the badge still tells the
            tutor the address was never confirmed. */}
        {!s.emailVerifiedAt && mailEnabled && (
          <button onClick={() => void resendVerificationEmail(s.id)} className="text-xs text-brand-ink hover:underline">
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
      {message && <span className="text-xs text-danger-ink">{message}</span>}
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
      search={{ placeholder: t("students.search"), of: (s) => `${s.name} ${s.invitePending ? "" : s.email} ${s.courses.map((c) => c.title).join(" ")}` }}
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

/** Lives in the "Add student" panel. */
export function CreateStudentForm() {
  const t = useT();
  const panel = useSlideOver();
  const [state, formAction, pending] = useActionState<CreateStudentState, FormData>(createStudent, {});
  // Cleared by "Add another" so the next student starts from a blank form.
  const [dismissed, setDismissed] = useState<CreateStudentState | null>(null);
  const invite = state !== dismissed ? state.invite : undefined;

  if (invite) {
    // Stay open: the link has to be copied or shared before the panel goes.
    return (
      <div className="space-y-4">
        <p className="text-sm text-ink-muted">{t("createStudent.created", { name: invite.name })}</p>
        <InviteLinkCard invite={invite} />
        <div className="flex justify-end gap-2 border-t border-line-soft pt-4">
          <button type="button" onClick={() => setDismissed(state)} className={btnSecondary}>
            {t("createStudent.addAnother")}
          </button>
          {panel && (
            <button type="button" onClick={panel.close} className={btnPrimary}>
              {t("action.done")}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className={labelCls} htmlFor="student-name">
          {t("createStudent.fullName")}
        </label>
        <input id="student-name" name="name" required className={inputCls} />
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
      <div>
        <label className={labelCls} htmlFor="student-email">
          {t("createStudent.emailOptional")}
        </label>
        <input id="student-email" name="email" type="email" className={inputCls} />
        <p className={hintCls}>{t("createStudent.emailHint")}</p>
      </div>

      {state.error && state !== dismissed && (
        <Alert tone="danger">{state.error}</Alert>
      )}

      <div className="flex justify-end gap-2 border-t border-line-soft pt-4">
        {panel && (
          <button type="button" onClick={panel.close} className={btnSecondary}>
            {t("action.cancel")}
          </button>
        )}
        <button disabled={pending} className={btnPrimary}>
          {pending ? t("action.creating") : t("createStudent.submit")}
        </button>
      </div>
    </form>
  );
}
