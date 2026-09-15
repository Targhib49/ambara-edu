-- Course catalogue facets and status. Existing courses stay visible to students.
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

ALTER TABLE "Track" ADD COLUMN "subject" TEXT,
ADD COLUMN "curriculum" TEXT,
ADD COLUMN "level" TEXT,
ADD COLUMN "status" "CourseStatus" NOT NULL DEFAULT 'PUBLISHED';

-- Quizzes belong to a chapter. Lesson quizzes take their lesson's chapter; the
-- few with no lesson are placed separately, since that takes judgement about
-- the syllabus rather than a rule.
ALTER TABLE "Quiz" ADD COLUMN "chapterId" UUID;

UPDATE "Quiz" AS q
SET "chapterId" = l."moduleId"
FROM "Lesson" AS l
WHERE q."lessonId" = l."id";

CREATE INDEX "Quiz_chapterId_idx" ON "Quiz"("chapterId");

ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
