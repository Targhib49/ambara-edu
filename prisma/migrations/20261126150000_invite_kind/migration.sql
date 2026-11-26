-- CreateEnum
CREATE TYPE "InviteKind" AS ENUM ('JOIN', 'RESET');

-- AlterTable: existing rows are all join links.
ALTER TABLE "StudentInvite" ADD COLUMN "kind" "InviteKind" NOT NULL DEFAULT 'JOIN';
