-- The remaining quiz styles and question types, added together so the shape of
-- the feature settles in one step. Values are inert until the app lists them:
-- the style picker reads its own registry, not the enum.

-- Structured question formats. Their shape lives in Question.correctAnswer,
-- like every other type, so they need no columns.
ALTER TYPE "QuestionType" ADD VALUE 'STEPS';
ALTER TYPE "QuestionType" ADD VALUE 'MULTI_PART';
ALTER TYPE "QuestionType" ADD VALUE 'FIND_MISTAKE';

-- REVIEW: practice, a mixed set drawn from earlier chapters.
-- EXAM: graded, a try-out you only get one go at.
ALTER TYPE "QuizStyle" ADD VALUE 'REVIEW';
ALTER TYPE "QuizStyle" ADD VALUE 'EXAM';

-- How many questions a review set draws. Null for every other style.
ALTER TABLE "Quiz" ADD COLUMN "reviewCount" INTEGER;
