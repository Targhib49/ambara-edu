import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { cardCls } from "@/components/ui/styles";
import { getT } from "@/lib/i18n/server";
import { syllabusSteps } from "@/lib/syllabus/access";
import { refreshSyllabusAccess } from "@/lib/actions/syllabi";

/**
 * A syllabus as the student walks it: the courses in order, what they've
 * scored, and which one is next. Opening this page also opens any course
 * whose gate they've since passed, so the next step is ready when they are.
 */
export default async function StudentSyllabusPage({ params }: { params: Promise<{ syllabusId: string }> }) {
  const student = await requireStudent();
  const { syllabusId } = await params;
  const t = await getT();

  const syllabus = await db.syllabus.findUnique({
    where: { id: syllabusId },
    select: { id: true, title: true, description: true, status: true },
  });
  if (!syllabus || syllabus.status !== "PUBLISHED") notFound();

  const joined = await db.enrollment.findFirst({ where: { studentId: student.id, syllabusId }, select: { studentId: true } });
  if (!joined) notFound();

  await refreshSyllabusAccess(student.id, syllabusId);
  const steps = await syllabusSteps(student.id, syllabusId);
  const done = steps.filter((s) => s.passed).length;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <PageHeader
        crumbs={[{ label: t("nav.home"), href: "/" }, { label: t("nav.explore"), href: "/explore" }, { label: syllabus.title }]}
        title={syllabus.title}
        meta={syllabus.description || t("syllabus.subtitle")}
      />

      <div className={`${cardCls} p-4`}>
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${steps.length ? (done / steps.length) * 100 : 0}%` }} />
          </div>
          <span className="shrink-0 text-sm tabular-nums text-zinc-500">
            {done} / {steps.length}
          </span>
        </div>
      </div>

      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={step.id}>
            {step.unlocked ? (
              <Link href={`/courses/${step.courseId}`} className={`${cardCls} flex items-center gap-3 p-4 hover:border-zinc-300`}>
                <Bullet index={i} passed={step.passed} />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-zinc-900">{step.title}</span>
                  <span className="block text-sm text-zinc-500">
                    {step.passed
                      ? t("syllabus.passed", { n: step.score.pct })
                      : `${t("syllabus.inProgress", { n: step.score.pct })} · ${t("syllabus.passScoreShort", { n: step.passScore })}`}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-medium text-blue-700">{step.score.submitted > 0 ? t("syllabus.continue") : t("syllabus.start")}</span>
              </Link>
            ) : (
              <div className={`${cardCls} flex items-center gap-3 border-dashed p-4`}>
                <Bullet index={i} locked />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-zinc-500">{step.title}</span>
                  <span className="block text-sm text-zinc-400">
                    {step.gate.state === "locked" &&
                      `${t("syllabus.locked", { course: step.gate.afterTitle, needed: step.gate.needed })} · ${t("syllabus.lockedNow", { have: step.gate.have })}`}
                  </span>
                </span>
                <span aria-hidden className="shrink-0 text-zinc-300">🔒</span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Bullet({ index, passed, locked }: { index: number; passed?: boolean; locked?: boolean }) {
  const base = "grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-semibold";
  if (passed) return <span className={`${base} bg-green-100 text-green-700`} aria-hidden>✓</span>;
  if (locked) return <span className={`${base} bg-zinc-100 text-zinc-400`} aria-hidden>{index + 1}</span>;
  return <span className={`${base} bg-blue-100 text-blue-700`} aria-hidden>{index + 1}</span>;
}
