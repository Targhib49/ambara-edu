-- Every quiz already belongs to a chapter (filled by the previous migration and
-- a one-off placement of the few with no lesson), and the deployed code always
-- sets one, so the column can now be required.
ALTER TABLE "Quiz" ALTER COLUMN "chapterId" SET NOT NULL;
