import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { gradeQuestion } from "@/lib/quiz/grading";
import { formatResponse } from "@/lib/quiz/format";
import { submissionAnswersSchema } from "@/lib/quiz/schema";
import { QuizTakeForm } from "./QuizTakeForm";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";

export default async function StudentQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ quizId: string }>;
  searchParams: Promise<{ retake?: string }>;
}) {
  const { quizId } = await params;
  const { retake } = await searchParams;
  const student = await requireStudent();

  const quiz = await db.quiz.findFirst({
    where: {
      id: quizId,
      lesson: {
        status: "PUBLISHED",
        module: { track: { enrollments: { some: { studentId: student.id } } } },
      },
    },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          module: { select: { trackId: true, track: { select: { title: true } } } },
        },
      },
      questions: { orderBy: { order: "asc" } },
    },
  });
  if (!quiz) notFound();

  const submission = await db.submission.findUnique({
    where: { studentId_quizId: { studentId: student.id, quizId } },
  });

  const totalPoints = quiz.questions.reduce((n, q) => n + q.points, 0);
  const showForm = !submission || retake === "1";

  const crumbs: Crumb[] = quiz.lesson
    ? [
        { label: "Home", href: "/tracks" },
        { label: "My tracks", href: "/tracks" },
        { label: quiz.lesson.module.track.title, href: `/tracks/${quiz.lesson.module.trackId}` },
        { label: quiz.lesson.title, href: `/tracks/${quiz.lesson.module.trackId}/lessons/${quiz.lesson.id}` },
        { label: quiz.title },
      ]
    : [{ label: "Home", href: "/tracks" }, { label: quiz.title }];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <div>
        <Breadcrumbs items={crumbs} />
        <h1 className="mt-2 text-2xl font-semibold">{quiz.title}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {quiz.questions.length} questions · {totalPoints} points total
        </p>
      </div>

      {showForm ? (
        <QuizTakeForm
          quizId={quiz.id}
          questions={quiz.questions.map((q) => ({
            id: q.id,
            type: q.type,
            prompt: q.prompt,
            points: q.points,
            options: q.options,
          }))}
        />
      ) : (
        <QuizResults quiz={quiz} submission={submission} totalPoints={totalPoints} />
      )}
    </div>
  );
}

function QuizResults({
  quiz,
  submission,
  totalPoints,
}: {
  quiz: {
    id: string;
    questions: {
      id: string;
      type: import("@/generated/prisma/enums").QuestionType;
      prompt: string;
      points: number;
      explanation: string;
      options: string[];
      correctAnswer: unknown;
    }[];
  };
  submission: NonNullable<Awaited<ReturnType<typeof db.submission.findUnique>>>;
  totalPoints: number;
}) {
  const answers = submissionAnswersSchema.parse(submission.answers);
  const pendingCount = quiz.questions.filter((q) => {
    const answer = answers.find((a) => a.questionId === q.id);
    return gradeQuestion(q, answer?.response ?? null).status === "PENDING_REVIEW";
  }).length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
        <p className="text-sm font-medium text-blue-800">
          {submission.status === "PENDING_REVIEW" && `Awaiting review on ${pendingCount} question${pendingCount > 1 ? "s" : ""}.`}
          {submission.status === "AUTO_GRADED" && `Score: ${submission.autoScore} / ${totalPoints}`}
          {submission.status === "REVIEWED" &&
            `Final score: ${(submission.autoScore ?? 0) + (submission.manualScore ?? 0)} / ${totalPoints}`}
        </p>
        {submission.feedback && <p className="mt-1 text-sm text-blue-700">{submission.feedback}</p>}
      </div>

      {quiz.questions.map((q, i) => {
        const answer = answers.find((a) => a.questionId === q.id);
        const grade = gradeQuestion(q, answer?.response ?? null);
        return (
          <div key={q.id} className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Q{i + 1} · {q.points} pt{q.points === 1 ? "" : "s"}
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-900">{q.prompt}</p>
            <p className="mt-2 text-sm text-zinc-600">
              Your answer: {formatResponse(q.type, answer?.response, q.options)}
            </p>
            <div className="mt-2">
              {grade.status === "AUTO_GRADED" ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    grade.correct ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {grade.correct ? "Correct" : "Incorrect"}
                </span>
              ) : submission.status === "REVIEWED" ? (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Reviewed by your tutor
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  Awaiting review
                </span>
              )}
            </div>
            {(grade.status === "AUTO_GRADED" || submission.status === "REVIEWED") && q.explanation && (
              <p className="mt-2 text-sm text-zinc-500">{q.explanation}</p>
            )}
          </div>
        );
      })}

      <Link
        href={`/quizzes/${quiz.id}?retake=1`}
        className="inline-block rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm hover:bg-zinc-100"
      >
        Retake quiz
      </Link>
    </div>
  );
}
