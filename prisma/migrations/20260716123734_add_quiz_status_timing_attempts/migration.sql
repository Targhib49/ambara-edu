-- CreateEnum
CREATE TYPE "QuizStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "maxAttempts" INTEGER,
ADD COLUMN     "randomizeQuestionOrder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "QuizStatus" NOT NULL DEFAULT 'PUBLISHED',
ADD COLUMN     "timeLimitMinutes" INTEGER;

-- CreateTable
CREATE TABLE "TimedQuizSession" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "quizId" UUID NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "questionOrder" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimedQuizSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TimedQuizSession_studentId_quizId_key" ON "TimedQuizSession"("studentId", "quizId");

-- AddForeignKey
ALTER TABLE "TimedQuizSession" ADD CONSTRAINT "TimedQuizSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimedQuizSession" ADD CONSTRAINT "TimedQuizSession_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
