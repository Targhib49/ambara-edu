-- Fluency drill: timed rounds of generated questions, aiming for a target.
ALTER TYPE "QuizStyle" ADD VALUE 'DRILL';

-- A drill has no authored questions; these say which generator, how long a
-- round lasts, and the score that counts as done. Null for every other style.
ALTER TABLE "Quiz" ADD COLUMN "drillSeconds" INTEGER,
ADD COLUMN "drillSkill" TEXT,
ADD COLUMN "drillTarget" INTEGER;

-- A drill's best round, kept with the rest of the student's practice progress.
ALTER TABLE "PracticeProgress" ADD COLUMN "bestScore" INTEGER;
