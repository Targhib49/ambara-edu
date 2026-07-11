"use client";

import { useActionState } from "react";
import { createStudent, deleteStudent, type CreateStudentState } from "@/lib/actions/students";
import type { StudentGroup } from "@/generated/prisma/enums";
import { badgeColorFor, initialsFor } from "@/lib/ui/palette";

const inputCls =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";

const GROUP_LABELS: Record<StudentGroup, string> = {
  JUNIOR_HIGH: "Junior high",
  UNDERGRAD: "Undergrad",
  GRAD: "Grad",
};

export function StudentTable({
  students,
}: {
  students: {
    id: string;
    name: string;
    email: string;
    studentGroup: StudentGroup | null;
    tracks: string[];
  }[];
}) {
  if (students.length === 0) {
    return <p className="text-sm text-zinc-500">No students yet — create the first one below.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-400">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Group</th>
            <th className="px-4 py-3">Tracks</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {students.map((s, i) => (
            <tr key={s.id}>
              <td className="px-4 py-3 font-medium">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${badgeColorFor(i)}`}
                  >
                    {initialsFor(s.name)}
                  </span>
                  {s.name}
                </div>
              </td>
              <td className="px-4 py-3 text-zinc-600">{s.email}</td>
              <td className="px-4 py-3 text-zinc-600">
                {s.studentGroup ? GROUP_LABELS[s.studentGroup] : "—"}
              </td>
              <td className="px-4 py-3 text-zinc-600">{s.tracks.join(", ") || "—"}</td>
              <td className="px-4 py-3 text-right">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
