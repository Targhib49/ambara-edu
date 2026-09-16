import { db } from "@/lib/db";
import { StudentTable, CreateStudentForm, type StudentRow } from "./students-ui";
import { PageHeader } from "@/components/ui/PageHeader";
import { SlideOverButton } from "@/components/ui/SlideOver";
import { formatSessionShort, nowMs } from "@/lib/sessions/format";
import { courseOptions } from "@/lib/courses/options";

export default async function StudentsPage() {
  const now = new Date(nowMs());
  const [students, courses] = await Promise.all([
    db.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        studentGroup: true,
        emailVerifiedAt: true,
        enrollments: { select: { course: { select: { id: true, title: true } } } },
        sessionsAsStudent: {
          where: { startTime: { gte: now }, status: { notIn: ["CANCELLED", "COMPLETED", "AWAITING_RESCHEDULE"] } },
          orderBy: { startTime: "asc" },
          take: 1,
          select: { startTime: true },
        },
      },
    }),
    courseOptions(),
  ]);

  const rows: StudentRow[] = students.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    studentGroup: s.studentGroup,
    emailVerifiedAt: s.emailVerifiedAt,
    courses: s.enrollments.map((e) => e.course),
    nextSessionLabel: s.sessionsAsStudent[0] ? formatSessionShort(s.sessionsAsStudent[0].startTime) : null,
  }));
  const unenrolled = rows.filter((r) => r.courses.length === 0).length;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <PageHeader
        crumbs={[{ label: "Home", href: "/tutor" }, { label: "Students" }]}
        title="Students"
        meta={
          <>
            {rows.length} student{rows.length === 1 ? "" : "s"}
            {unenrolled > 0 && <span className="text-amber-700"> · {unenrolled} not enrolled in any course</span>}
          </>
        }
        actions={
          <SlideOverButton label="Add student" title="Add a student" description="Creates their login straight away.">
            <CreateStudentForm />
          </SlideOverButton>
        }
      />
      <StudentTable students={rows} courses={courses} />
    </div>
  );
}
