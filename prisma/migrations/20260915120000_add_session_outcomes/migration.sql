-- AlterEnum
ALTER TYPE "SessionStatus" ADD VALUE 'COMPLETED';
ALTER TYPE "SessionStatus" ADD VALUE 'AWAITING_RESCHEDULE';

-- CreateEnum
CREATE TYPE "Attendance" AS ENUM ('ATTENDED', 'NO_SHOW');

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "attendance" "Attendance",
ADD COLUMN     "cancelledAt" TIMESTAMPTZ(3),
ADD COLUMN     "statusReason" TEXT;
