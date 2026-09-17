import Link from "next/link";
import { db } from "@/lib/db";
import { QuizImportPanel } from "./QuizImportPanel";
import { QuizTable, type TutorQuizRow } from "./QuizTable";
import { NewQuizForm } from "@/components/quiz/NewQuizForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { SlideOverButton } from "@/components/ui/SlideOver";
import { placementTree } from "@/lib/courses/placement";
import { getT } from "@/lib/i18n/server";

const pad = (n: number) => String(n).padStart(4, "0");

export default async function TutorQuizzesPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const { course: courseParam } = await searchParams;
  const t = await getT();
  const [quizzes, tree] = await Promise.all([
    db.quiz.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        style: true,
        timeLimitMinutes: true,
        maxAttempts: true,
        createdAt: true,
        chapterId: true,
        chapter: { select: { title: true, order: true, course: { select: { id: true, title: true } } } },
        lesson: { select: { title: true, order: true } },
        questions: { select: { points: true } },
        submissions: { select: { status: true } },
      },
    }),
    placementTree(),
  ]);

  const rows: TutorQuizRow[] = quizzes.map((q) => ({
    id: q.id,
    title: q.title,
    isDraft: q.status === "DRAFT",
    style: q.style,
    courseId: q.chapter?.course.id ?? null,
    courseTitle: q.chapter?.course.title ?? null,
    chapterId: q.chapterId,
    chapterTitle: q.chapter?.title ?? null,
    lessonTitle: q.lesson?.title ?? null,
    // Syllabus order: course, then chapter, then the lesson it follows (chapter tests last).
    placementSort: `${q.chapter?.course.title ?? "~"}|${pad(q.chapter?.order ?? 9999)}|${pad(q.lesson ? q.lesson.order : 9999)}|${q.title}`,
    questionCount: q.questions.length,
    totalPoints: q.questions.reduce((n, x) => n + x.points, 0),
    timeLimitMinutes: q.timeLimitMinutes,
    maxAttempts: q.maxAttempts,
    submissionCount: q.submissions.length,
    pendingCount: q.submissions.filter((s) => s.status === "PENDING_REVIEW").length,
    createdAt: q.createdAt.toISOString(),
  }));

  const needsReview = rows.reduce((n, r) => n + r.pendingCount, 0);
  const published = rows.filter((r) => !r.isDraft).length;
  const initialCourseId = tree.some((c) => c.id === courseParam) ? courseParam : undefined;
  const quizOptions = rows.map((r) => ({
    value: r.id,
    label: r.title,
    hint: [r.courseTitle, r.chapterTitle].filter(Boolean).join(" › ") || undefined,
  }));

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
      <PageHeader
        crumbs={[{ label: t("nav.home"), href: "/tutor" }, { label: t("tutorQuizzes.title") }]}
        title={t("tutorQuizzes.title")}
        meta={
          <>
            {t("tutorQuizzes.meta", { total: rows.length, published })}
            {needsReview > 0 && (
              <span className="text-amber-700"> · {t("tutorQuizzes.toReview", { n: needsReview })}</span>
            )}
            {" · "}
            <Link href="/tutor/courses" className="text-blue-700 hover:underline">
              {t("tutorQuizzes.manageBySyllabus")}
            </Link>
          </>
        }
        actions={
          <>
            <SlideOverButton
              label={t("tutorQuizzes.import")}
              title={t("tutorQuizzes.importTitle")}
              description={t("tutorQuizzes.importDescription")}
              variant="secondary"
              icon="upload"
              width="lg"
            >
              <QuizImportPanel tree={tree} quizOptions={quizOptions} />
            </SlideOverButton>
            <SlideOverButton
              label={t("tutorQuizzes.new")}
              title={t("tutorQuizzes.new")}
              description={t("tutorQuizzes.newDescription")}
            >
              <NewQuizForm tree={tree} defaultCourseId={initialCourseId} />
            </SlideOverButton>
          </>
        }
      />
      <QuizTable
        quizzes={rows}
        courses={tree.map((c) => ({ id: c.id, title: c.title, chapters: c.chapters.map((ch) => ({ id: ch.id, title: ch.title })) }))}
        initialCourseId={initialCourseId}
      />
    </div>
  );
}
