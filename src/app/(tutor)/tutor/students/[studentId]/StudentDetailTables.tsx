"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DataTable, type Column, type Tab } from "@/components/ui/DataTable";
import { Combobox, type ComboOption } from "@/components/ui/Combobox";
import { useSlideOver } from "@/components/ui/SlideOver";
import { StatusBadge } from "@/components/sessions/StatusBadge";
import { enrollStudents, setEnrollment } from "@/lib/actions/courses";
import { deleteStudent } from "@/lib/actions/students";
import { ATTENDANCE_LABEL } from "@/lib/sessions/format";
import { SUBMISSION_STATUS_BADGE_CLASS, SUBMISSION_STATUS_LABEL } from "@/lib/quiz/format";
import { btnDanger, btnPrimary, btnSecondary, btnSmall, labelCls } from "@/components/ui/styles";
import type { SessionStatus, SubmissionStatus } from "@/generated/prisma/enums";

export type StudentCourseRow = {
  id: string;
  title: string;
  completed: number;
  total: number;
  pct: number;
  enrolledLabel: string;
};

export type StudentQuizResultRow = {
  id: string;
  quizId: string;
  title: string;
  /** Course › Chapter › Lesson. */
  where: string;
  status: SubmissionStatus;
  pct: number | null;
  scoreLabel: string;
  submittedLabel: string;
  submittedAt: string;
};

export type StudentSessionHistoryRow = {
  id: string;
  startTime: string;
  whenLabel: string;
  durationMinutes: number;
  status: SessionStatus;
  attendance: "ATTENDED" | "NO_SHOW" | null;
  notes: string;
};

export function StudentCoursesTable({ studentId, courses }: { studentId: string; courses: StudentCourseRow[] }) {
  const [pending, startTransition] = useTransition();

  const columns: Column<StudentCourseRow>[] = [
    {
      key: "title",
      header: "Course",
      sort: (c) => c.title.toLowerCase(),
      text: (c) => c.title,
      cell: (c) => (
        <Link href={`/tutor/courses/${c.id}`} className="font-medium text-zinc-900 hover:text-blue-700">
          {c.title}
        </Link>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      sort: (c) => c.pct,
      text: (c) => `${c.pct}%`,
      className: "min-w-[200px]",
      cell: (c) => (
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${c.pct}%` }} />
          </div>
          <span className="w-24 shrink-0 text-right text-xs tabular-nums text-zinc-500">
            {c.completed}/{c.total} · {c.pct}%
          </span>
        </div>
      ),
    },
    { key: "enrolled", header: "Enrolled", text: (c) => c.enrolledLabel, className: "whitespace-nowrap", cell: (c) => c.enrolledLabel },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (c) => (
        <button
          disabled={pending}
          onClick={() => {
            if (confirm(`Remove this student from "${c.title}"? Their progress is kept if you add them back.`)) {
              startTransition(() => setEnrollment(c.id, studentId, false));
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
      rows={courses}
      columns={columns}
      rowKey={(c) => c.id}
      search={{ placeholder: "Search courses", of: (c) => c.title }}
      initialSort={{ key: "title", dir: "asc" }}
      minWidth="640px"
      empty={{ title: "Not enrolled in any course", hint: "Use “Assign course” at the top of the page." }}
    />
  );
}

const QUIZ_TABS: Tab<StudentQuizResultRow>[] = [
  { key: "all", label: "All", match: () => true },
  { key: "review", label: "Needs review", match: (q) => q.status === "PENDING_REVIEW" },
  { key: "graded", label: "Graded", match: (q) => q.status !== "PENDING_REVIEW" },
];

const QUIZ_COLUMNS: Column<StudentQuizResultRow>[] = [
  {
    key: "title",
    header: "Quiz",
    sort: (q) => q.title.toLowerCase(),
    text: (q) => q.title,
    className: "min-w-[240px]",
    cell: (q) => (
      <span className="block">
        <span className="block font-medium text-zinc-900">{q.title}</span>
        <span className="block text-xs text-zinc-500">{q.where || "—"}</span>
      </span>
    ),
  },
  { key: "where", header: "Placement", text: (q) => q.where, csvOnly: true, cell: () => null },
  {
    key: "score",
    header: "Score",
    sort: (q) => q.pct ?? -1,
    text: (q) => q.scoreLabel,
    className: "whitespace-nowrap tabular-nums",
    cell: (q) => (
      <span>
        <span className="font-medium text-zinc-900">{q.pct === null ? "—" : `${q.pct}%`}</span>
        <span className="ml-1.5 text-xs text-zinc-500">{q.scoreLabel}</span>
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    sort: (q) => SUBMISSION_STATUS_LABEL[q.status],
    text: (q) => SUBMISSION_STATUS_LABEL[q.status],
    cell: (q) => (
      <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${SUBMISSION_STATUS_BADGE_CLASS[q.status]}`}>
        {SUBMISSION_STATUS_LABEL[q.status]}
      </span>
    ),
  },
  { key: "submitted", header: "Submitted", sort: (q) => q.submittedAt, text: (q) => q.submittedLabel, className: "whitespace-nowrap", cell: (q) => q.submittedLabel },
];

export function StudentQuizTable({ results }: { results: StudentQuizResultRow[] }) {
  return (
    <DataTable
      rows={results}
      columns={QUIZ_COLUMNS}
      rowKey={(q) => q.id}
      rowHref={(q) => `/tutor/quizzes/${q.quizId}/submissions/${q.id}`}
      tabs={QUIZ_TABS}
      search={{ placeholder: "Search quizzes", of: (q) => `${q.title} ${q.where}` }}
      initialSort={{ key: "submitted", dir: "desc" }}
      exportName="quiz-results"
      minWidth="680px"
      empty={{ title: "No quizzes submitted yet" }}
    />
  );
}

const SESSION_COLUMNS: Column<StudentSessionHistoryRow>[] = [
  { key: "when", header: "When", sort: (s) => s.startTime, text: (s) => s.whenLabel, className: "whitespace-nowrap", cell: (s) => s.whenLabel },
  { key: "length", header: "Length", sort: (s) => s.durationMinutes, text: (s) => s.durationMinutes, className: "whitespace-nowrap tabular-nums", cell: (s) => `${s.durationMinutes} min` },
  {
    key: "status",
    header: "Status",
    text: (s) => (s.attendance ? `${s.status} (${ATTENDANCE_LABEL[s.attendance]})` : s.status),
    cell: (s) => (
      <span className="flex flex-wrap items-center gap-1.5">
        <StatusBadge status={s.status} />
        {s.attendance && (
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${s.attendance === "ATTENDED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {ATTENDANCE_LABEL[s.attendance]}
          </span>
        )}
      </span>
    ),
  },
  {
    key: "notes",
    header: "Notes",
    text: (s) => s.notes,
    cell: (s) =>
      s.notes ? (
        <span className="line-clamp-2 block max-w-[320px]" title={s.notes}>
          {s.notes}
        </span>
      ) : (
        <span className="text-zinc-400">—</span>
      ),
  },
];

export function StudentSessionHistoryTable({ sessions }: { sessions: StudentSessionHistoryRow[] }) {
  return (
    <DataTable
      rows={sessions}
      columns={SESSION_COLUMNS}
      rowKey={(s) => s.id}
      search={{ placeholder: "Search notes", of: (s) => s.notes }}
      initialSort={{ key: "when", dir: "desc" }}
      exportName="sessions"
      minWidth="640px"
      empty={{ title: "No sessions yet", hint: "Use “Schedule session” at the top of the page." }}
    />
  );
}

/** Lives in the "Assign course" panel on a student's page. */
export function AssignCourseForm({ studentId, courses }: { studentId: string; courses: ComboOption[] }) {
  const panel = useSlideOver();
  const [courseId, setCourseId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (courses.length === 0) {
    return <p className="text-sm text-zinc-500">This student is already on every available course.</p>;
  }

  return (
    <div className="space-y-5">
      <div>
        <label className={labelCls}>Course</label>
        <Combobox options={courses} value={courseId} onChange={setCourseId} placeholder="Search by title, subject or level" aria-label="Course" />
      </div>
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
        {panel && (
          <button type="button" onClick={panel.close} className={btnSecondary}>
            Cancel
          </button>
        )}
        <button
          disabled={!courseId || pending}
          onClick={() =>
            startTransition(async () => {
              const result = await enrollStudents(courseId, [studentId]);
              if (result.error) setError(result.error);
              else panel?.close();
            })
          }
          className={btnPrimary}
        >
          {pending ? "Assigning…" : "Assign course"}
        </button>
      </div>
    </div>
  );
}

export function DeleteStudentButton({ studentId, name, disabled }: { studentId: string; name: string; disabled?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending || disabled}
      onClick={() => {
        if (!confirm(`Delete ${name}'s account? This removes their login, enrollments, quiz results and progress.`)) return;
        startTransition(async () => {
          await deleteStudent(studentId);
          router.push("/tutor/students");
        });
      }}
      className={btnDanger}
    >
      {pending ? "Deleting…" : "Delete student"}
    </button>
  );
}
