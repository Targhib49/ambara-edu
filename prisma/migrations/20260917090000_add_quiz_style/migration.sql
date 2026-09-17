-- How a quiz plays. CLASSIC is the untimed, all-on-one-page quiz every quiz
-- started as; TRYOUT is the timed exam simulation. Further styles are added one
-- at a time as their players are built.
CREATE TYPE "QuizStyle" AS ENUM ('CLASSIC', 'TRYOUT');

ALTER TABLE "Quiz" ADD COLUMN "style" "QuizStyle" NOT NULL DEFAULT 'CLASSIC';

-- Until now a try-out was implied by having a time limit. Every timed quiz
-- becomes an explicit try-out; everything else stays classic.
UPDATE "Quiz" SET "style" = 'TRYOUT' WHERE "timeLimitMinutes" IS NOT NULL;
