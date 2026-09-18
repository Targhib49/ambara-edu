import Link from "next/link";
import { QuizStyleChip } from "@/components/quiz/QuizStyleField";
import { isGradedStyle } from "@/lib/quiz/styles";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { BlockRenderer } from "@/components/blocks/renderers";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LessonCompletion } from "@/components/student/LessonCompletion";
import { cardCls } from "@/components/ui/styles";
import { getT } from "@/lib/i18n/server";

export default async function StudentLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const student = await requireStudent();
  const t = await getT();

  const lesson = await db.lesson.findFirst({
    where: {
      id: lessonId,
      status: "PUBLISHED",
      chapter: {
        courseId,
        course: { status: "PUBLISHED", enrollments: { some: { studentId: student.id } } },
      },
    },
    include: {
      chapter: { select: { title: true, course: { select: { title: true } } } },
      blocks: { orderBy: { order: "asc" } },
      quizzes: {
        where: { status: "PUBLISHED" },
        select: {
          id: true,
          title: true,
          style: true,
          practiceProgress: { where: { studentId: student.id }, select: { completedAt: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      progress: { where: { studentId: student.id }, select: { completedAt: true } },
    },
  });
  if (!lesson) notFound();

  // Flattened published-lesson order across the course, for prev/next nav
  const chapters = await db.chapter.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    include: {
      lessons: {
        where: { status: "PUBLISHED" },
        orderBy: { order: "asc" },
        select: { id: true, title: true },
      },
    },
  });
  const flat = chapters.flatMap((m) => m.lessons);
  const idx = flat.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx < flat.length - 1 ? flat[idx + 1] : null;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Breadcrumbs
        items={[
          { label: t("nav.home"), href: "/dashboard" },
          { label: t("nav.myCourses"), href: "/courses" },
          { label: lesson.chapter.course.title, href: `/courses/${courseId}` },
          { label: lesson.title },
        ]}
      />

      <article className={`${cardCls} p-6 lg:p-10`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          {lesson.chapter.title}
        </p>
        <h1 className="mt-1 text-2xl font-semibold">{lesson.title}</h1>

        <div className="mt-6 space-y-5">
          {lesson.blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
          {lesson.blocks.length === 0 && (
            <p className="text-sm text-zinc-500">{t("studentLesson.noContent")}</p>
          )}
        </div>
      </article>

      <LessonCompletion lessonId={lesson.id} initialComplete={lesson.progress[0]?.completedAt != null} />

      {lesson.quizzes.length > 0 && (
        <section className={`${cardCls} p-5`}>
          <h2 className="mb-3 font-medium text-zinc-900">{t("nav.quizzes")}</h2>
          <ul className="space-y-2">
            {lesson.quizzes.map((quiz) => (
              <li key={quiz.id}>
                <Link
                  href={`/quizzes/${quiz.id}`}
                  className="flex items-center justify-between rounded-md border border-zinc-200 px-4 py-2.5 text-sm hover:border-blue-300 hover:bg-zinc-50"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-medium text-zinc-900">{quiz.title}</span>
                    {quiz.style !== "CLASSIC" && <QuizStyleChip style={quiz.style} />}
                  </span>
                  {isGradedStyle(quiz.style) ? (
                    <span className="shrink-0 text-blue-700">{t("studentLesson.takeQuiz")}</span>
                  ) : quiz.practiceProgress[0]?.completedAt ? (
                    <span className="shrink-0 font-medium text-emerald-700">✓ {t("outline.practiceDone")}</span>
                  ) : (
                    <span className="shrink-0 text-emerald-700">{t("practice.startCta")}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav className="flex items-stretch justify-between gap-4">
        {prev ? (
          <Link
            href={`/courses/${courseId}/lessons/${prev.id}`}
            className="max-w-[48%] rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 hover:border-blue-400 hover:text-blue-700"
          >
            <span className="block text-xs text-zinc-400">← Previous</span>
            <span className="mt-0.5 block truncate font-medium">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/courses/${courseId}/lessons/${next.id}`}
            className="ml-auto max-w-[48%] rounded-lg border border-zinc-200 bg-white px-4 py-3 text-right text-sm text-zinc-700 hover:border-blue-400 hover:text-blue-700"
          >
            <span className="block text-xs text-zinc-400">{t("studentLesson.next")}</span>
            <span className="mt-0.5 block truncate font-medium">{next.title}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
