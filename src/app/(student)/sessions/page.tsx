import { requireStudent } from "@/lib/auth";
import { StudentSessions } from "@/components/profile/StudentSessions";

/** Also the Sessions tab of the student's profile; this page stays as the sidebar shortcut. */
export default async function StudentSessionsPage() {
  const student = await requireStudent();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <StudentSessions studentId={student.id} withHeader />
    </div>
  );
}
