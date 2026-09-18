-- Guided projects: a program built step by step in a mini editor, graded.
-- The values are inert until the app offers them: the style picker reads its
-- own registry, not the enum.
ALTER TYPE "QuizStyle" ADD VALUE 'PROJECT';
ALTER TYPE "QuestionType" ADD VALUE 'PROJECT_STEP';

-- A project's starter files. Null for every other style.
ALTER TABLE "Quiz" ADD COLUMN "projectFiles" JSONB;

-- A student's work on a project: their files as they are now, the steps whose
-- check has passed, and the failed checks before each one (which is the score).
CREATE TABLE "ProjectProgress" (
    "studentId" UUID NOT NULL,
    "quizId" UUID NOT NULL,
    "files" JSONB NOT NULL,
    "passedIds" TEXT[],
    "failedChecks" JSONB NOT NULL DEFAULT '{}',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProjectProgress_pkey" PRIMARY KEY ("studentId","quizId")
);

CREATE INDEX "ProjectProgress_quizId_idx" ON "ProjectProgress"("quizId");

-- Deleting a student or a quiz takes the project progress with it.
ALTER TABLE "ProjectProgress" ADD CONSTRAINT "ProjectProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectProgress" ADD CONSTRAINT "ProjectProgress_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
