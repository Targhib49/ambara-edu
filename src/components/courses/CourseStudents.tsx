"use client";

import { useMemo, useState, useTransition } from "react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { useSlideOver } from "@/components/ui/SlideOver";
import type { ComboOption } from "@/components/ui/Combobox";
import { enrollStudents, setEnrollment } from "@/lib/actions/courses";
import { badgeColorForKey, initialsFor } from "@/lib/ui/palette";
import { btnPrimary, btnSecondary, btnSmall, inputCls } from "@/components/ui/styles";

export type CourseStudentRow = {
  id: string;
  name: string;
  email: string;
  completed: number;
  total: number;
  pct: number;
  enrolledLabel: string;
};

export function CourseStudentsTable({ courseId, students }: { courseId: string; students: CourseStudentRow[] }) {
  const [pending, startTransition] = useTransition();

  const columns: Column<CourseStudentRow>[] = [
    {
      key: "name",
      header: "Student",
      sort: (s) => s.name.toLowerCase(),
      text: (s) => s.name,
      className: "min-w-[220px]",
      cell: (s) => (
        <div className="flex items-center gap-3">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${badgeColorForKey(s.name)}`}>
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
      key: "progress",
      header: "Progress",
      sort: (s) => s.pct,
      text: (s) => `${s.completed}/${s.total}`,
      className: "min-w-[200px]",
      cell: (s) => (
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${s.pct}%` }} />
          </div>
          <span className="w-20 shrink-0 text-right text-xs tabular-nums text-zinc-500">
            {s.completed}/{s.total} · {s.pct}%
          </span>
        </div>
      ),
    },
    { key: "enrolled", header: "Enrolled", text: (s) => s.enrolledLabel, className: "whitespace-nowrap", cell: (s) => s.enrolledLabel },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (s) => (
        <button
          disabled={pending}
          onClick={() => {
            if (confirm(`Remove ${s.name} from this course? Their progress is kept if you add them back.`)) {
              startTransition(() => setEnrollment(courseId, s.id, false));
            }
          }}
          className={`${btnSmall} text-red-600`}
        >
          Remove
        </button>
      ),
    },
  ];

  return (
    <DataTable
      rows={students}
      columns={columns}
      rowKey={(s) => s.id}
      rowHref={(s) => `/tutor/students/${s.id}`}
      search={{ placeholder: "Search name or email", of: (s) => `${s.name} ${s.email}` }}
      initialSort={{ key: "name", dir: "asc" }}
      exportName="course-students"
      minWidth="640px"
      empty={{ title: "No one is enrolled yet", hint: "Use “Enroll students” above." }}
    />
  );
}

/** Lives in the "Enroll students" panel: search, tick, enroll. */
export function EnrollStudentsForm({ courseId, students }: { courseId: string; students: ComboOption[] }) {
  const panel = useSlideOver();
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const matches = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle ? students.filter((s) => `${s.label} ${s.hint ?? ""}`.toLowerCase().includes(needle)) : students;
  }, [students, q]);

  if (students.length === 0) return <p className="text-sm text-zinc-500">Every student is already enrolled.</p>;

  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-4">
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" className={inputCls} aria-label="Search students" />
      <ul className="max-h-[50vh] divide-y divide-zinc-100 overflow-y-auto rounded-md border border-zinc-200">
        {matches.length === 0 && <li className="px-3 py-3 text-sm text-zinc-500">No matches</li>}
        {matches.map((s) => (
          <li key={s.value}>
            <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-zinc-50">
              <input type="checkbox" checked={picked.has(s.value)} onChange={() => toggle(s.value)} className="h-4 w-4 rounded border-zinc-300" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-zinc-900">{s.label}</span>
                {s.hint && <span className="block truncate text-xs text-zinc-500">{s.hint}</span>}
              </span>
            </label>
          </li>
        ))}
      </ul>
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="flex items-center justify-end gap-2 border-t border-zinc-100 pt-4">
        {panel && (
          <button type="button" onClick={panel.close} className={btnSecondary}>
            Cancel
          </button>
        )}
        <button
          disabled={picked.size === 0 || pending}
          onClick={() =>
            startTransition(async () => {
              const result = await enrollStudents(courseId, [...picked]);
              if (result.error) setError(result.error);
              else panel?.close();
            })
          }
          className={btnPrimary}
        >
          {pending ? "Enrolling…" : picked.size > 0 ? `Enroll ${picked.size} student${picked.size === 1 ? "" : "s"}` : "Enroll"}
        </button>
      </div>
    </div>
  );
}
