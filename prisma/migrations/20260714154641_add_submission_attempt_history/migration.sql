-- CreateTable
CREATE TABLE "SubmissionAttempt" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "quizId" UUID NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "autoScore" DOUBLE PRECISION,
    "manualScore" DOUBLE PRECISION,
    "status" "SubmissionStatus" NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubmissionAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubmissionAttempt_studentId_quizId_idx" ON "SubmissionAttempt"("studentId", "quizId");

-- AddForeignKey
ALTER TABLE "SubmissionAttempt" ADD CONSTRAINT "SubmissionAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionAttempt" ADD CONSTRAINT "SubmissionAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
