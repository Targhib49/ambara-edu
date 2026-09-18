import Link from "next/link";
import { DrillPlayer } from "./DrillPlayer";
import { DRILL_DEFAULTS, parseDrillSkill } from "@/lib/drills/registry";
import { isGradedStyle, isTimedStyle } from "@/lib/quiz/styles";
import { toQuestionForForm } from "@/lib/quiz/forms";
import { ReviewPlayer } from "./ReviewPlayer";
import { REVIEW_COUNT_DEFAULT, drawReviewSet } from "@/lib/quiz/review";
import { nowMs } from "@/lib/sessions/format";
import { getT } from "@/lib/i18n/server";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { gradeQuestion } from "@/lib/quiz/grading";
import { formatResponse } from "@/lib/quiz/format";
import { seededPermutation } from "@/lib/quiz/shuffle";
import { submissionAnswersSchema } from "@/lib/quiz/schema";
import { startTimedAttempt } from "@/lib/actions/quizzes";
import { CodeSubmissionView } from "@/components/quiz/CodeSubmissionView";
import { ScoreHistory } from "@/components/quiz/ScoreHistory";
import { ScoreRing } from "@/components/quiz/ScoreRing";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { QuizTakeForm } from "./QuizTakeForm";
import { TimedQuizTakeForm } from "./TimedQuizTakeForm";
import { MasteryPractice } from "./MasteryPractice";
import { isPracticable } from "@/lib/quiz/practice";
import { type Crumb } from "@/components/ui/Breadcrumbs";
import { PageHeader } from "@/components/ui/PageHeader";
import { btnSecondary } from "@/components/ui/styles";
import type { Question } from "@/generated/prisma/client";

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

  const t = await getT();
  const quiz = await db.quiz.findFirst({
    where: {
      id: quizId,
      status: "PUBLISHED",
      // Every quiz belongs to a chapter; the student must be enrolled in that
      // chapter's (published) course, and a lesson quiz also needs its lesson live.
      chapter: { course: { status: "PUBLISHED", enrollments: { some: { studentId: student.id } } } },
      OR: [{ lessonId: null }, { lesson: { status: "PUBLISHED" } }],
    },
    include: {
      lesson: { select: { id: true, title: true } },
      chapter: { select: { courseId: true, title: true, course: { select: { title: true } } } },
      questions: { orderBy: { order: "asc" } },
    },
  });
  if (!quiz) notFound();

  const isPractice = !isGradedStyle(quiz.style);
  // A review draws a fresh set each visit, from chapters before this one.
  const reviewSet =
    quiz.style === "REVIEW"
      ? await drawReviewSet(quiz.id, quiz.reviewCount ?? REVIEW_COUNT_DEFAULT, `${student.id}:${quizId}:${nowMs()}`)
      : [];
  const [submission, attempts, timedSession, practice] = await Promise.all([
    db.submission.findUnique({
      where: { studentId_quizId: { studentId: student.id, quizId } },
    }),
    db.submissionAttempt.findMany({
      where: { studentId: student.id, quizId },
      orderBy: { attemptNumber: "desc" },
    }),
    isTimedStyle(quiz.style)
      ? db.timedQuizSession.findUnique({ where: { studentId_quizId: { studentId: student.id, quizId } } })
      : null,
    isPractice
      ? db.practiceProgress.findUnique({ where: { studentId_quizId: { studentId: student.id, quizId } } })
      : null,
  ]);

  const totalPoints = quiz.questions.reduce((n, q) => n + q.points, 0);
  const isTimed = isTimedStyle(quiz.style);
  // A try-out that shuffles also shuffles each question's options — which is
  // why its results can't show letters: the student saw different ones.
  const shuffleOptions = isTimed && quiz.randomizeQuestionOrder;
  const attemptsUsed = attempts.length + (submission ? 1 : 0);
  const attemptsRemaining = quiz.maxAttempts !== null ? quiz.maxAttempts - attemptsUsed : null;
  const outOfAttempts = attemptsRemaining !== null && attemptsRemaining <= 0 && !timedSession;

  // Untimed quizzes (every quiz today, minus the two try-outs) keep the
  // exact behavior they've always had: instant form, ?retake=1 to redo.
  // Timed quizzes route entirely through the start/session/blocked states
  // below instead — no query-param retake, no form until a session exists.
  const showForm = isTimed ? !!timedSession : !submission || retake === "1";

  // A timed quiz shows its questions in the order frozen at session start
  // (possibly shuffled); everything else uses authoring order.
  const orderedQuestions: Question[] =
    isTimed && timedSession
      ? (timedSession.questionOrder
          .map((id) => quiz.questions.find((q) => q.id === id))
          .filter((q): q is Question => !!q))
      : quiz.questions;

  // The access filter guarantees a chapter; the fallbacks only keep types honest.
  const courseHref = quiz.chapter ? `/courses/${quiz.chapter.courseId}` : "/courses";
  const crumbs: Crumb[] = [
    { label: t("nav.home"), href: "/dashboard" },
    { label: t("nav.myCourses"), href: "/courses" },
    ...(quiz.chapter ? [{ label: quiz.chapter.course.title, href: courseHref }] : []),
    ...(quiz.lesson ? [{ label: quiz.lesson.title, href: `${courseHref}/lessons/${quiz.lesson.id}` }] : []),
    { label: quiz.title },
  ];

  const backHref = quiz.lesson ? `${courseHref}/lessons/${quiz.lesson.id}` : courseHref;
  const backLabel = quiz.lesson
    ? t("quizPage.backToLesson", { title: quiz.lesson.title })
    : t("quizPage.backToCourse", { title: quiz.chapter?.course.title ?? t("quizPage.courseFallback") });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <PageHeader
        crumbs={crumbs}
        title={quiz.title}
        meta={
          quiz.style === "DRILL"
            ? t("drill.meta", {
                seconds: quiz.drillSeconds ?? DRILL_DEFAULTS.drillSeconds,
                target: quiz.drillTarget ?? DRILL_DEFAULTS.drillTarget,
              })
            : quiz.style === "REVIEW"
              ? t("review.meta", { n: reviewSet.length })
              : isPractice
                ? t(quiz.questions.length === 1 ? "practice.metaOne" : "practice.meta", { n: quiz.questions.length })
              : t("quizPage.metaCounts", { q: quiz.questions.length, p: totalPoints })
        }
        actions={
          <Link href={backHref} className={`${btnSecondary} max-w-full`}>
            <span className="truncate">← {backLabel}</span>
          </Link>
        }
      />

      {quiz.style === "REVIEW" ? (
        <ReviewPlayer
          quizId={quiz.id}
          questions={reviewSet.map(toQuestionForForm)}
          sourceTitles={reviewSet.map((q) => q.quiz.title)}
          initialBest={practice?.bestScore ?? null}
        />
      ) : quiz.style === "DRILL" ? (
        <DrillPlayer
          quizId={quiz.id}
          skill={parseDrillSkill(quiz.drillSkill)}
          seconds={quiz.drillSeconds ?? DRILL_DEFAULTS.drillSeconds}
          target={quiz.drillTarget ?? DRILL_DEFAULTS.drillTarget}
          initialBest={practice?.bestScore ?? null}
        />
      ) : isPractice ? (
        <MasteryPractice
          quizId={quiz.id}
          // No correct answers leave the server: practice is checked there.
          questions={quiz.questions.filter(isPracticable).map(toQuestionForForm)}
          initialMasteredIds={practice?.masteredIds ?? []}
          runs={practice?.runs ?? 0}
        />
      ) : isTimed ? (
        <>
          {outOfAttempts && <NoAttemptsLeftCard maxAttempts={quiz.maxAttempts!} isExam={quiz.style === "EXAM"} />}
          {/* The marked paper is shown once the attempt is in, whether or not
              another attempt is left — an exam only ever has the one. */}
          {submission && !timedSession && (
            <QuizResults
              quiz={quiz}
              submission={submission}
              totalPoints={totalPoints}
              hideRetakeLink
              showOptionLetters={!shuffleOptions}
            />
          )}
          {!outOfAttempts && !timedSession && (
            <StartAttemptCard
              quizId={quiz.id}
              questionCount={quiz.questions.length}
              timeLimitMinutes={quiz.timeLimitMinutes!}
              attemptsRemaining={attemptsRemaining}
              isRetry={!!submission}
              isExam={quiz.style === "EXAM"}
              shuffled={quiz.randomizeQuestionOrder}
            />
          )}
          {timedSession && (
            <TimedQuizTakeForm
              quizId={quiz.id}
              startedAt={timedSession.startedAt.toISOString()}
              timeLimitMinutes={quiz.timeLimitMinutes!}
              questions={orderedQuestions.map((q) => ({
                ...toQuestionForForm(q),
                // Seeded by the attempt, so a reload keeps the order and a retake reshuffles.
                optionOrder:
                  shuffleOptions && q.options.length > 1
                    ? seededPermutation(`${timedSession.id}:${q.id}`, q.options.length)
                    : undefined,
              }))}
            />
          )}
        </>
      ) : showForm ? (
        <QuizTakeForm
          quizId={quiz.id}
          questions={quiz.questions.map(toQuestionForForm)}
        />
      ) : submission ? (
        <QuizResults quiz={quiz} submission={submission} totalPoints={totalPoints} showOptionLetters />
      ) : null}

      <ScoreHistory
        totalPoints={totalPoints}
        attempts={attempts.map((a) => ({
          attemptNumber: a.attemptNumber,
          autoScore: a.autoScore,
          manualScore: a.manualScore,
          status: a.status,
          submittedAt: a.submittedAt.toISOString(),
        }))}
        current={
          submission
            ? {
                attemptNumber: attempts.length + 1,
                autoScore: submission.autoScore,
                manualScore: submission.manualScore,
                status: submission.status,
                submittedAt: submission.updatedAt.toISOString(),
              }
            : null
        }
      />
    </div>
  );
}

async function QuizResults({
  quiz,
  submission,
  totalPoints,
  hideRetakeLink,
  showOptionLetters,
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
  /** Timed quizzes render their own "start next attempt" card instead. */
  hideRetakeLink?: boolean;
  /** False when the student answered with shuffled options. */
  showOptionLetters: boolean;
}) {
  const t = await getT();
  // A submission whose stored answers don't parse shouldn't take the whole page
  // down — show the questions with nothing filled in rather than an error.
  const parsedAnswers = submissionAnswersSchema.safeParse(submission.answers);
  const answers = parsedAnswers.success ? parsedAnswers.data : [];
  const pendingCount = quiz.questions.filter((q) => {
    const answer = answers.find((a) => a.questionId === q.id);
    return gradeQuestion(q, answer?.response ?? null).status === "PENDING_REVIEW";
  }).length;
  const displayScore =
    submission.status === "REVIEWED"
      ? (submission.autoScore ?? 0) + (submission.manualScore ?? 0)
      : (submission.autoScore ?? 0);
  const scorePct = totalPoints > 0 ? (displayScore / totalPoints) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-xl border border-blue-200 bg-blue-50 p-5">
        <ScoreRing pct={scorePct} size={64} />
        <div>
          <p className="text-sm font-medium text-blue-800">
            {submission.status === "PENDING_REVIEW" &&
              t(pendingCount > 1 ? "quizPage.provisionalPlural" : "quizPage.provisional", { n: pendingCount })}
            {submission.status === "AUTO_GRADED" && t("quizPage.autoGraded")}
            {submission.status === "REVIEWED" && t("quizPage.finalScore")}
          </p>
          <p className="text-lg font-semibold text-blue-900">
            {displayScore} / {totalPoints}
          </p>
          {submission.feedback && <p className="mt-1 text-sm text-blue-700">{submission.feedback}</p>}
        </div>
      </div>

      {quiz.questions.map((q, i) => {
        const answer = answers.find((a) => a.questionId === q.id);
        const grade = gradeQuestion(q, answer?.response ?? null);
        return (
          <div key={q.id} className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              {t(q.points === 1 ? "quizPage.questionLabel" : "quizPage.questionLabelPlural", { i: i + 1, p: q.points })}
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-900">{q.prompt}</p>
            {q.type === "CODE" ? (
              <div className="mt-2">
                <CodeSubmissionView correctAnswer={q.correctAnswer} response={answer?.response} />
              </div>
            ) : (
              <p className="mt-2 text-sm text-zinc-600">
                {t("quizPage.yourAnswer", {
                  answer: formatResponse(q.type, answer?.response, q.options, {
                    letters: showOptionLetters,
                    noAnswer: t("quiz.noAnswer"),
                  }),
                })}
              </p>
            )}
            <div className="mt-2">
              {grade.status === "AUTO_GRADED" ? (
                // A step, part or correction can be right on its own, so a wrong
                // answer that still earned something says so rather than "wrong".
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    grade.correct
                      ? "bg-green-100 text-green-700"
                      : grade.earnedPoints > 0
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {grade.correct
                    ? t("quiz.correct")
                    : grade.earnedPoints > 0
                      ? t("quiz.partial", { earned: grade.earnedPoints, total: q.points })
                      : t("quiz.incorrect")}
                </span>
              ) : submission.status === "REVIEWED" ? (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {t("quizPage.reviewedByTutor")}
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  {t("quizPage.awaitingReview")}
                </span>
              )}
            </div>
            {(grade.status === "AUTO_GRADED" || submission.status === "REVIEWED") && q.explanation && (
              <p className="mt-2 text-sm text-zinc-500">{q.explanation}</p>
            )}
          </div>
        );
      })}

      {!hideRetakeLink && (
        <Link
          href={`/quizzes/${quiz.id}?retake=1`}
          className="inline-block rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm hover:bg-zinc-100"
        >
          {t("quizPage.retakeQuiz")}
        </Link>
      )}
    </div>
  );
}

async function NoAttemptsLeftCard({ maxAttempts, isExam }: { maxAttempts: number; isExam: boolean }) {
  const t = await getT();
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-center">
      <p className="text-sm font-medium text-zinc-700">
        {isExam
          ? t("quizPage.noAttemptsExam")
          : t(maxAttempts === 1 ? "quizPage.noAttemptsLeftOne" : "quizPage.noAttemptsLeft", { n: maxAttempts })}
      </p>
      <p className="mt-1 text-sm text-zinc-500">{t("quizPage.noAttemptsHint")}</p>
    </div>
  );
}

async function StartAttemptCard({
  quizId,
  questionCount,
  timeLimitMinutes,
  attemptsRemaining,
  isRetry,
  isExam,
  shuffled,
}: {
  quizId: string;
  questionCount: number;
  timeLimitMinutes: number;
  attemptsRemaining: number | null;
  isRetry: boolean;
  isExam: boolean;
  shuffled: boolean;
}) {
  const t = await getT();
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 text-center">
      <p className="text-lg font-semibold text-blue-900">
        {isRetry ? t("quizPage.readyAnother") : t(isExam ? "quizPage.readyStartExam" : "quizPage.readyStart")}
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-blue-800">
        {t(shuffled ? "quizPage.startBlurbBefore" : "quizPage.startBlurbBeforeFixed", { n: questionCount })}{" "}
        <strong>{t("schedule.minutesOption", { n: timeLimitMinutes })}</strong>{" "}
        {t("quizPage.startBlurbAfter")}
        {/* An exam says what it is rather than counting down from one. */}
        {isExam ? (
          <> {t("quizPage.examOneGo")}</>
        ) : (
          attemptsRemaining !== null && (
            <>
              {" "}
              {t(attemptsRemaining === 1 ? "quizPage.attemptRemaining" : "quizPage.attemptsRemaining", { n: attemptsRemaining })}
            </>
          )
        )}
      </p>
      <form action={startTimedAttempt.bind(null, quizId)} className="mt-4">
        <SubmitButton
          pendingLabel={t("quizPage.starting")}
          className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {isRetry ? t("quizPage.startNext") : t(isExam ? "quizPage.startExam" : "quizPage.startTryout")}
        </SubmitButton>
      </form>
    </div>
  );
}
