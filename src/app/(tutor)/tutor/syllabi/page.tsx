import Link from "next/link";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { SlideOverButton } from "@/components/ui/SlideOver";
import { cardCls } from "@/components/ui/styles";
import { getLanguage, getT } from "@/lib/i18n/server";
import { formatIDR } from "@/lib/billing/money";
import { dateLabel } from "@/lib/billing/period";
import { NewSyllabusForm, RequestRow } from "./syllabi-ui";

/**
 * The syllabi and the requests waiting on them. A syllabus is a course of
 * study — several courses in order, each opening when the one before it is
 * passed — so this screen is about shape and access, not content.
 */
export default async function TutorSyllabiPage() {
  await requireTutor();
  const t = await getT();
  const language = await getLanguage();

  const [syllabi, requests] = await Promise.all([
    db.syllabus.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        courses: { orderBy: { order: "asc" }, include: { course: { select: { title: true } } } },
        _count: { select: { enrollments: true } },
      },
    }),
    db.syllabusRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { student: { select: { name: true } }, syllabus: { select: { title: true, price: true } } },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <PageHeader
        crumbs={[{ label: t("nav.home"), href: "/tutor" }, { label: t("syllabus.title") }]}
        title={t("syllabus.title")}
        meta={t("syllabus.subtitle")}
        actions={
          <SlideOverButton label={t("syllabus.new")} title={t("syllabus.new")}>
            <NewSyllabusForm />
          </SlideOverButton>
        }
      />

      {requests.length > 0 && (
        <section className={`${cardCls} overflow-hidden`}>
          <h2 className="border-b border-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-900">
            {t("syllabus.requests")} · {requests.length}
          </h2>
          <ul className="divide-y divide-zinc-100">
            {requests.map((r) => (
              <RequestRow
                key={r.id}
                requestId={r.id}
                studentName={r.student.name}
                syllabusTitle={r.syllabus.title}
                message={r.message}
                price={r.syllabus.price}
                createdLabel={dateLabel(r.createdAt, language)}
              />
            ))}
          </ul>
        </section>
      )}

      {syllabi.length === 0 ? (
        <p className={`${cardCls} p-6 text-center text-sm text-zinc-500`}>{t("syllabus.noneYet")}</p>
      ) : (
        <ul className="space-y-3">
          {syllabi.map((s) => (
            <li key={s.id}>
              <Link href={`/tutor/syllabi/${s.id}`} className={`${cardCls} block p-4 hover:border-zinc-300`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium text-zinc-900">{s.title}</span>
                  <span className="text-xs text-zinc-500">
                    {t(`status.${s.status === "PUBLISHED" ? "published" : s.status === "DRAFT" ? "draft" : "archived"}` as never)} ·{" "}
                    {t(`syllabus.access.${s.access}` as never)}
                    {s.access === "REQUEST" && ` · ${s.price > 0 ? formatIDR(s.price, language) : t("syllabus.free")}`}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  {t("syllabus.courseCount", { n: s.courses.length })} · {t("syllabus.studentsIn", { n: s._count.enrollments })}
                </p>
                {s.courses.length > 0 && (
                  <p className="mt-1 truncate text-xs text-zinc-400">{s.courses.map((c) => c.course.title).join(" → ")}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
