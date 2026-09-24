import Link from "next/link";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { cardCls } from "@/components/ui/styles";
import { getLanguage, getT } from "@/lib/i18n/server";
import { formatIDR } from "@/lib/billing/money";
import { JoinSyllabusButton, RequestAccessForm, StartOpenCourseButton, WithdrawRequestButton } from "./explore-ui";

/**
 * What a student can take up on their own: the courses open to everyone, the
 * syllabi they can start, and the ones they have to ask for. Signed-in only —
 * there's no public catalogue yet.
 */
export default async function ExplorePage() {
  const student = await requireStudent();
  const t = await getT();
  const language = await getLanguage();

  const [openCourses, syllabi, enrollments, requests] = await Promise.all([
    db.course.findMany({
      where: { status: "PUBLISHED", access: "OPEN" },
      orderBy: { title: "asc" },
      select: { id: true, title: true, description: true, subject: true, _count: { select: { chapters: true } } },
    }),
    db.syllabus.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "asc" },
      include: { courses: { orderBy: { order: "asc" }, include: { course: { select: { title: true } } } } },
    }),
    db.enrollment.findMany({ where: { studentId: student.id }, select: { courseId: true, syllabusId: true } }),
    db.syllabusRequest.findMany({
      where: { studentId: student.id, status: { in: ["PENDING", "AWAITING_PAYMENT", "DECLINED"] } },
      select: { id: true, syllabusId: true, status: true, reply: true, invoiceId: true },
    }),
  ]);

  const enrolledCourses = new Set(enrollments.map((e) => e.courseId));
  const joinedSyllabi = new Set(enrollments.map((e) => e.syllabusId).filter(Boolean) as string[]);
  const requestFor = new Map(requests.map((r) => [r.syllabusId, r]));

  const mine = syllabi.filter((s) => joinedSyllabi.has(s.id));
  const toJoin = syllabi.filter((s) => !joinedSyllabi.has(s.id) && s.access === "OPEN");
  const toRequest = syllabi.filter((s) => !joinedSyllabi.has(s.id) && s.access === "REQUEST");
  const freeToStart = openCourses.filter((c) => !enrolledCourses.has(c.id));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8">
      <PageHeader
        crumbs={[{ label: t("nav.home"), href: "/" }, { label: t("nav.explore") }]}
        title={t("nav.explore")}
        meta={t("explore.subtitle")}
      />

      {mine.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{t("syllabus.yourSyllabi")}</h2>
          <ul className="space-y-3">
            {mine.map((s) => (
              <li key={s.id}>
                <Link href={`/syllabus/${s.id}`} className={`${cardCls} block p-4 hover:border-zinc-300`}>
                  <span className="block font-medium text-zinc-900">{s.title}</span>
                  <span className="block text-sm text-zinc-500">{t("syllabus.courseCount", { n: s.courses.length })}</span>
                  <span className="mt-1 block truncate text-xs text-zinc-400">{s.courses.map((c) => c.course.title).join(" → ")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {freeToStart.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{t("syllabus.freeCourses")}</h2>
          <p className="text-sm text-zinc-500">{t("syllabus.freeCoursesHint")}</p>
          <ul className="space-y-3">
            {freeToStart.map((c) => (
              <li key={c.id} className={`${cardCls} flex flex-wrap items-center gap-3 p-4`}>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-zinc-900">{c.title}</span>
                  {c.description && <span className="block text-sm text-zinc-500">{c.description}</span>}
                  <span className="block text-xs text-zinc-400">{t("count.chapters", { n: c._count.chapters })}</span>
                </span>
                <StartOpenCourseButton courseId={c.id} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {toJoin.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{t("syllabus.available")}</h2>
          <ul className="space-y-3">
            {toJoin.map((s) => (
              <li key={s.id} className={`${cardCls} flex flex-wrap items-center gap-3 p-4`}>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-zinc-900">{s.title}</span>
                  {s.description && <span className="block text-sm text-zinc-500">{s.description}</span>}
                  <span className="mt-1 block truncate text-xs text-zinc-400">{s.courses.map((c) => c.course.title).join(" → ")}</span>
                </span>
                <JoinSyllabusButton syllabusId={s.id} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {toRequest.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{t("syllabus.onRequest")}</h2>
          <ul className="space-y-3">
            {toRequest.map((s) => {
              const request = requestFor.get(s.id);
              return (
                <li key={s.id} className={`${cardCls} flex flex-wrap items-center gap-3 p-4`}>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-zinc-900">{s.title}</span>
                    {s.description && <span className="block text-sm text-zinc-500">{s.description}</span>}
                    <span className="mt-1 block truncate text-xs text-zinc-400">
                      {t("syllabus.courseCount", { n: s.courses.length })} · {s.price > 0 ? formatIDR(s.price, language) : t("syllabus.free")}
                    </span>
                    {request?.status === "PENDING" && <span className="mt-1 block text-xs text-amber-700">{t("syllabus.pending")}</span>}
                    {request?.status === "AWAITING_PAYMENT" && (
                      <span className="mt-1 block text-xs text-amber-700">
                        {t("syllabus.awaitingPayment")} — {t("syllabus.awaitingPaymentHint")}{" "}
                        {request.invoiceId && (
                          <Link href={`/billing/${request.invoiceId}`} className="font-medium text-blue-700 hover:underline">
                            {t("studentBilling.title")} →
                          </Link>
                        )}
                      </span>
                    )}
                    {request?.status === "DECLINED" && (
                      <span className="mt-1 block text-xs text-zinc-500">
                        {t("syllabus.declined")}
                        {request.reply && ` — ${request.reply}`}
                      </span>
                    )}
                  </span>
                  {request?.status === "PENDING" ? (
                    <WithdrawRequestButton requestId={request.id} />
                  ) : request?.status === "AWAITING_PAYMENT" ? null : (
                    <RequestAccessForm syllabusId={s.id} price={s.price > 0 ? formatIDR(s.price, language) : null} />
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {mine.length === 0 && freeToStart.length === 0 && toJoin.length === 0 && toRequest.length === 0 && (
        <p className={`${cardCls} p-6 text-center text-sm text-zinc-500`}>{t("explore.empty")}</p>
      )}
    </div>
  );
}
