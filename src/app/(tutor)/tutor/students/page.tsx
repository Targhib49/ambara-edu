import { db } from "@/lib/db";
import { StudentTable, CreateStudentForm, type StudentRow } from "./students-ui";
import { isEmailConfigured } from "@/lib/email";
import { PageHeader } from "@/components/ui/PageHeader";
import { SlideOverButton } from "@/components/ui/SlideOver";
import { formatSessionShort, nowMs } from "@/lib/sessions/format";
import { courseOptions } from "@/lib/courses/options";
import { getLanguage, getT } from "@/lib/i18n/server";

export default async function StudentsPage() {
  const t = await getT();
  const language = await getLanguage();
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
    nextSessionLabel: s.sessionsAsStudent[0] ? formatSessionShort(s.sessionsAsStudent[0].startTime, language) : null,
  }));
  const unenrolled = rows.filter((r) => r.courses.length === 0).length;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <PageHeader
        crumbs={[{ label: t("nav.home"), href: "/tutor" }, { label: t("tutorStudents.title") }]}
        title={t("tutorStudents.title")}
        meta={
          <>
            {t("tutorStudents.meta", { n: rows.length })}
            {unenrolled > 0 && (
              <span className="text-amber-700"> · {t("tutorStudents.notEnrolledMeta", { n: unenrolled })}</span>
            )}
          </>
        }
        actions={
          <SlideOverButton
            label={t("tutorStudents.add")}
            title={t("tutorStudents.add")}
            description={t("tutorStudents.addDescription")}
          >
            <CreateStudentForm />
          </SlideOverButton>
        }
      />
      <StudentTable students={rows} courses={courses} mailEnabled={isEmailConfigured()} />
    </div>
  );
}
