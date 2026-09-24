import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SlideOverButton } from "@/components/ui/SlideOver";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { cardCls } from "@/components/ui/styles";
import { getT } from "@/lib/i18n/server";
import { deleteSyllabus } from "@/lib/actions/syllabi";
import { AddCourseForm, SyllabusCourseRow, SyllabusSettingsForm } from "../syllabi-ui";

/** Building one syllabus: which courses, in what order, and what passing each takes. */
export default async function SyllabusBuilderPage({ params }: { params: Promise<{ syllabusId: string }> }) {
  await requireTutor();
  const { syllabusId } = await params;
  const t = await getT();

  const syllabus = await db.syllabus.findUnique({
    where: { id: syllabusId },
    include: {
      courses: { orderBy: { order: "asc" }, include: { course: { select: { id: true, title: true } } } },
      _count: { select: { enrollments: true } },
    },
  });
  if (!syllabus) notFound();

  const inIt = new Set(syllabus.courses.map((c) => c.courseId));
  const courses = (
    await db.course.findMany({ where: { status: { not: "ARCHIVED" } }, orderBy: { title: "asc" }, select: { id: true, title: true, status: true } })
  )
    .filter((c) => !inIt.has(c.id))
    .map((c) => ({ value: c.id, label: c.title, hint: c.status === "DRAFT" ? t("status.draft") : undefined }));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <div>
        <Breadcrumbs
          items={[
            { label: t("nav.home"), href: "/tutor" },
            { label: t("syllabus.title"), href: "/tutor/syllabi" },
            { label: syllabus.title },
          ]}
        />
        <h1 className="mt-2 text-2xl font-semibold">{syllabus.title}</h1>
      </div>

      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{t("syllabus.courses")}</h2>
          <SlideOverButton label={t("syllabus.addCourse")} title={t("syllabus.addCourse")}>
            <AddCourseForm syllabusId={syllabus.id} courses={courses} />
          </SlideOverButton>
        </div>
        {syllabus.courses.length === 0 ? (
          <p className={`${cardCls} p-6 text-center text-sm text-zinc-500`}>{t("syllabus.noCourses")}</p>
        ) : (
          <ul className={`${cardCls} divide-y divide-zinc-100`}>
            {syllabus.courses.map((row, i) => (
              <SyllabusCourseRow
                key={row.id}
                id={row.id}
                title={row.course.title}
                index={i}
                count={syllabus.courses.length}
                passScore={row.passScore}
                requiresPrevious={row.requiresPrevious}
              />
            ))}
          </ul>
        )}
        <p className="text-xs text-zinc-500">{t("syllabus.builderHint")}</p>
      </section>

      <section className={`${cardCls} space-y-4 p-4`}>
        <h2 className="text-sm font-semibold text-zinc-900">{t("syllabus.settings")}</h2>
        <SyllabusSettingsForm
          id={syllabus.id}
          title={syllabus.title}
          description={syllabus.description}
          access={syllabus.access}
          status={syllabus.status}
          price={syllabus.price}
        />
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">{t("syllabus.studentsIn", { n: syllabus._count.enrollments })}</p>
        {syllabus._count.enrollments === 0 && (
          <form
            action={async () => {
              "use server";
              await deleteSyllabus(syllabus.id);
              redirect("/tutor/syllabi");
            }}
          >
            <ConfirmButton
              message={t("quizDetail.deleteConfirm", { title: syllabus.title })}
              className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              {t("action.delete")}
            </ConfirmButton>
          </form>
        )}
      </section>

      <Link href="/explore" className="inline-block text-sm font-medium text-blue-700 hover:underline">
        {t("syllabus.previewStudent")} →
      </Link>
    </div>
  );
}
