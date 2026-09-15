"use client";

import { useActionState } from "react";
import { createStudent, deleteStudent, type CreateStudentState } from "@/lib/actions/students";
import type { StudentGroup } from "@/generated/prisma/enums";
import { badgeColorForKey, initialsFor } from "@/lib/ui/palette";
import { DataTable, type Column, type Tab } from "@/components/ui/DataTable";

const inputCls =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";

const GROUP_LABELS: Record<StudentGroup, string> = {
  JUNIOR_HIGH: "Junior high",
  UNDERGRAD: "Undergrad",
  GRAD: "Grad",
};

type StudentRow = {
  id: string;
  name: string;
  email: string;
  studentGroup: StudentGroup | null;
  courses: string[];
};

const TABS: Tab<StudentRow>[] = [
  { key: "all", label: "All", match: () => true },
  { key: "JUNIOR_HIGH", label: "Junior high", match: (s) => s.studentGroup === "JUNIOR_HIGH" },
  { key: "UNDERGRAD", label: "Undergrad", match: (s) => s.studentGroup === "UNDERGRAD" },
  { key: "GRAD", label: "Grad", match: (s) => s.studentGroup === "GRAD" },
  // The one worth a tab of its own: an account that can sign in but sees nothing.
  { key: "unenrolled", label: "Not enrolled", match: (s) => s.courses.length === 0 },
];

const COLUMNS: Column<StudentRow>[] = [
  {
    key: "name",
    header: "Name",
    sort: (s) => s.name.toLowerCase(),
    text: (s) => s.name,
    className: "min-w-[200px]",
    cell: (s) => (
      <div className="flex items-center gap-3">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${badgeColorForKey(s.name)}`}>
          {initialsFor(s.name)}
        </span>
        <span className="font-medium text-zinc-900">{s.name}</span>
      </div>
    ),
  },
  { key: "email", header: "Email", sort: (s) => s.email.toLowerCase(), cell: (s) => s.email },
  {
    key: "group",
    header: "Group",
    sort: (s) => (s.studentGroup ? GROUP_LABELS[s.studentGroup] : ""),
    text: (s) => (s.studentGroup ? GROUP_LABELS[s.studentGroup] : ""),
    cell: (s) => (s.studentGroup ? GROUP_LABELS[s.studentGroup] : <span className="text-zinc-400">—</span>),
  },
  {
    key: "courses",
    header: "Courses",
    sort: (s) => s.courses.length,
    text: (s) => s.courses.join("; "),
    cell: (s) =>
      s.courses.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {s.courses.map((c) => (
            <span key={c} className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600">
              {c}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-zinc-400">—</span>
      ),
  },
  {
    key: "actions",
    header: "",
    align: "right",
    className: "whitespace-nowrap",
    cell: (s) => (
      <button
        onClick={() => {
          if (confirm(`Delete ${s.name}'s account? This removes their login and enrollments.`)) {
            void deleteStudent(s.id);
          }
        }}
        className="text-xs text-red-600 hover:underline"
      >
        Delete
      </button>
    ),
  },
];

export function StudentTable({ students }: { students: StudentRow[] }) {
  return (
    <DataTable
      rows={students}
      columns={COLUMNS}
      rowKey={(s) => s.id}
      tabs={TABS}
      search={{ placeholder: "Search name, email or course", of: (s) => `${s.name} ${s.email} ${s.courses.join(" ")}` }}
      initialSort={{ key: "name", dir: "asc" }}
      exportName="students"
      minWidth="760px"
      empty={{ title: "No students yet", hint: "Create the first one below." }}
    />
  );
}

export function CreateStudentForm() {
  const [state, formAction, pending] = useActionState<CreateStudentState, FormData>(
    createStudent,
    {}
  );

  return (
    <form
      action={formAction}
      className="max-w-md space-y-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <h2 className="font-medium">New student</h2>
      <p className="text-xs text-zinc-500">
        Creates the account immediately — hand the student their email + the password you set here.
      </p>
      <input name="name" required placeholder="Full name" className={inputCls} />
      <input name="email" type="email" required placeholder="Email" className={inputCls} />
      <input
        name="password"
        type="text"
        required
        minLength={8}
        placeholder="Temporary password (min 8 chars)"
        className={inputCls}
      />
      <select name="studentGroup" className={inputCls} defaultValue="">
        <option value="">Group (optional)</option>
        <option value="JUNIOR_HIGH">Junior high</option>
        <option value="UNDERGRAD">Undergrad</option>
        <option value="GRAD">Grad</option>
      </select>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">{state.success}</p>}
      <button
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create student"}
      </button>
    </form>
  );
}
