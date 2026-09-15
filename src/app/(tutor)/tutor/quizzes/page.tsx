import Link from "next/link";
import { db } from "@/lib/db";
import { QuizImportPanel } from "./QuizImportPanel";
import { QuizTable, type TutorQuizRow } from "./QuizTable";
import { NewQuizForm } from "@/components/quiz/NewQuizForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { SlideOverButton } from "@/components/ui/SlideOver";
import { placementTree } from "@/lib/courses/placement";

const pad = (n: number) => String(n).padStart(4, "0");

export default async function TutorQuizzesPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const { course: courseParam } = await searchParams;
  const [quizzes, tree] = await Promise.all([
    db.quiz.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
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
        crumbs={[{ label: "Home", href: "/tutor" }, { label: "Quizzes" }]}
        title="Quizzes"
        meta={
          <>
            {rows.length} quizzes · {published} published
            {needsReview > 0 && <span className="text-amber-700"> · {needsReview} submission{needsReview === 1 ? "" : "s"} to review</span>}
            {" · "}
            <Link href="/tutor/courses" className="text-blue-700 hover:underline">
              Manage by course syllabus
            </Link>
          </>
        }
        actions={
          <>
            <SlideOverButton
              label="Import questions"
              title="Import questions from a sheet"
              description="CSV or Excel. Nothing is saved until the last step."
              variant="secondary"
              icon="upload"
              width="lg"
            >
              <QuizImportPanel tree={tree} quizOptions={quizOptions} />
            </SlideOverButton>
            <SlideOverButton label="New quiz" title="New quiz" description="Place it in the syllabus, then add questions.">
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
