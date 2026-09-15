"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { createStudent, type CreateStudentState } from "@/lib/actions/students";
import { enrollStudents } from "@/lib/actions/courses";
import type { StudentGroup } from "@/generated/prisma/enums";
import { badgeColorForKey, initialsFor } from "@/lib/ui/palette";
import { DataTable, type Column, type Tab } from "@/components/ui/DataTable";
import { Combobox, type ComboOption } from "@/components/ui/Combobox";
import { useSlideOver } from "@/components/ui/SlideOver";
import { btnPrimary, btnSecondary, hintCls, inputCls, labelCls } from "@/components/ui/styles";

export const GROUP_LABELS: Record<StudentGroup, string> = {
  JUNIOR_HIGH: "Junior high",
  UNDERGRAD: "Undergrad",
  GRAD: "Grad",
};

export type StudentRow = {
  id: string;
  name: string;
  email: string;
  studentGroup: StudentGroup | null;
  courses: { id: string; title: string }[];
  /** Server-formatted in WIB. */
  nextSessionLabel: string | null;
};

const TABS: Tab<StudentRow>[] = [
  { key: "all", label: "All", match: () => true },
  { key: "JUNIOR_HIGH", label: "Junior high", match: (s) => s.studentGroup === "JUNIOR_HIGH" },
  { key: "UNDERGRAD", label: "Undergrad", match: (s) => s.studentGroup === "UNDERGRAD" },
  { key: "GRAD", label: "Grad", match: (s) => s.studentGroup === "GRAD" },
  // An account that can sign in but sees nothing — worth finding quickly.
  { key: "unenrolled", label: "Not enrolled", match: (s) => s.courses.length === 0 },
];

const COLUMNS: Column<StudentRow>[] = [
  {
    key: "name",
    header: "Student",
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
  { key: "email", header: "Email", text: (s) => s.email, csvOnly: true, cell: () => null },
  {
    key: "group",
    header: "Group",
    sort: (s) => (s.studentGroup ? GROUP_LABELS[s.studentGroup] : ""),
    text: (s) => (s.studentGroup ? GROUP_LABELS[s.studentGroup] : ""),
    className: "whitespace-nowrap",
    cell: (s) => (s.studentGroup ? GROUP_LABELS[s.studentGroup] : <span className="text-zinc-400">—</span>),
  },
  {
    key: "courses",
    header: "Courses",
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
          {s.courses.length > 2 && <span className="text-[11px] text-zinc-500">+{s.courses.length - 2} more</span>}
        </div>
      ) : (
        <span className="text-xs font-medium text-amber-700">Not enrolled</span>
      ),
  },
  {
    key: "next",
    header: "Next session",
    text: (s) => s.nextSessionLabel ?? "",
    hideBelow: "xl",
    className: "whitespace-nowrap",
    cell: (s) => s.nextSessionLabel ?? <span className="text-zinc-400">—</span>,
  },
];

/** Enroll every ticked student in one course. */
function BulkAssign({ courses, studentIds, onDone }: { courses: ComboOption[]; studentIds: string[]; onDone: () => void }) {
  const [courseId, setCourseId] = useState("");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-64">
        <Combobox options={courses} value={courseId} onChange={setCourseId} placeholder="Assign to course…" aria-label="Course to assign" />
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
        {pending ? "Assigning…" : "Assign"}
      </button>
      {message && <span className="text-xs text-red-700">{message}</span>}
    </div>
  );
}

export function StudentTable({ students, courses }: { students: StudentRow[]; courses: ComboOption[] }) {
  return (
    <DataTable
      rows={students}
      columns={COLUMNS}
      rowKey={(s) => s.id}
      rowHref={(s) => `/tutor/students/${s.id}`}
      tabs={TABS}
      search={{ placeholder: "Search name, email or course", of: (s) => `${s.name} ${s.email} ${s.courses.map((c) => c.title).join(" ")}` }}
      initialSort={{ key: "name", dir: "asc" }}
      exportName="students"
      minWidth="700px"
      empty={{ title: "No students yet", hint: "Add your first student with the button above." }}
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
          Full name
        </label>
        <input id="student-name" name="name" required className={inputCls} />
      </div>
      <div>
        <label className={labelCls} htmlFor="student-email">
          Email
        </label>
        <input id="student-email" name="email" type="email" required className={inputCls} />
      </div>
      <div>
        <label className={labelCls} htmlFor="student-password">
          Temporary password
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
            Generate
          </button>
        </div>
        <p className={hintCls}>At least 8 characters. Give it to the student; they can change it from their profile.</p>
      </div>
      <div>
        <label className={labelCls} htmlFor="student-group">
          Group
        </label>
        <select id="student-group" name="studentGroup" className={inputCls} defaultValue="">
          <option value="">Not set</option>
          <option value="JUNIOR_HIGH">Junior high</option>
          <option value="UNDERGRAD">Undergrad</option>
          <option value="GRAD">Grad</option>
        </select>
      </div>

      {state.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state.success && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">{state.success}</p>}

      <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
        {panel && (
          <button type="button" onClick={panel.close} className={btnSecondary}>
            {state.success ? "Done" : "Cancel"}
          </button>
        )}
        <button disabled={pending} className={btnPrimary}>
          {pending ? "Creating…" : "Create student"}
        </button>
      </div>
    </form>
  );
}
