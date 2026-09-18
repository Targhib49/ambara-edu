-- The files as they were when a student's current project step opened, so a
-- broken file can be restored to that point. Null until the next step opens.
ALTER TABLE "ProjectProgress" ADD COLUMN "stepStartFiles" JSONB;
