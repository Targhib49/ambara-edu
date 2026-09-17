-- Mastery practice: one question at a time, checked instantly; a wrong answer
-- comes back later, until every question has been answered right once.
ALTER TYPE "QuizStyle" ADD VALUE 'MASTERY';

-- A student's run through a practice quiz. Kept apart from Submission on
-- purpose, so practice can never reach a score, an average or the review queue.
CREATE TABLE "PracticeProgress" (
    "studentId" UUID NOT NULL,
    "quizId" UUID NOT NULL,
    "masteredIds" TEXT[],
    "completedAt" TIMESTAMP(3),
    "runs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PracticeProgress_pkey" PRIMARY KEY ("studentId","quizId")
);

CREATE INDEX "PracticeProgress_quizId_idx" ON "PracticeProgress"("quizId");

-- Deleting a student or a quiz takes its practice progress with it.
ALTER TABLE "PracticeProgress" ADD CONSTRAINT "PracticeProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PracticeProgress" ADD CONSTRAINT "PracticeProgress_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
