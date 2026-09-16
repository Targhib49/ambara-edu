-- Interface language per person. Everyone starts on Indonesian; English is one
-- click away in the top bar. Course and quiz content is unaffected.
CREATE TYPE "Language" AS ENUM ('ID', 'EN');

ALTER TABLE "User" ADD COLUMN "language" "Language" NOT NULL DEFAULT 'ID';
