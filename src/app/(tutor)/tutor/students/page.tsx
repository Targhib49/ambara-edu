import { db } from "@/lib/db";
import { StudentTable, CreateStudentForm } from "./students-ui";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default async function StudentsPage() {
  const students = await db.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { name: "asc" },
    include: { enrollments: { include: { track: { select: { title: true } } } } },
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Home", href: "/tutor" }, { label: "Students" }]} />
        <h1 className="text-2xl font-semibold">Students</h1>
      </div>
      <StudentTable
        students={students.map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          studentGroup: s.studentGroup,
          tracks: s.enrollments.map((e) => e.track.title),
        }))}
      />
      <CreateStudentForm />
    </div>
  );
}
