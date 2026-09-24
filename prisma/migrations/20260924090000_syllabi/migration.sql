-- CreateEnum
CREATE TYPE "CourseAccess" AS ENUM ('ENROLLED', 'OPEN');

-- CreateEnum
CREATE TYPE "EnrollmentSource" AS ENUM ('TUTOR', 'OPEN', 'SYLLABUS');

-- CreateEnum
CREATE TYPE "SyllabusAccess" AS ENUM ('OPEN', 'REQUEST');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'AWAITING_PAYMENT', 'GRANTED', 'DECLINED', 'WITHDRAWN');

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "expiresAt" TIMESTAMPTZ(3),
ADD COLUMN     "source" "EnrollmentSource" NOT NULL DEFAULT 'TUTOR',
ADD COLUMN     "syllabusId" UUID;

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "access" "CourseAccess" NOT NULL DEFAULT 'ENROLLED';

-- CreateTable
CREATE TABLE "Syllabus" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "coverImagePath" TEXT,
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "access" "SyllabusAccess" NOT NULL DEFAULT 'REQUEST',
    "price" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Syllabus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyllabusCourse" (
    "id" UUID NOT NULL,
    "syllabusId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "passScore" INTEGER NOT NULL DEFAULT 75,
    "requiresPrevious" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SyllabusCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyllabusRequest" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "syllabusId" UUID NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT NOT NULL DEFAULT '',
    "reply" TEXT NOT NULL DEFAULT '',
    "invoiceId" UUID,
    "decidedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyllabusRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Syllabus_status_idx" ON "Syllabus"("status");

-- CreateIndex
CREATE INDEX "SyllabusCourse_syllabusId_order_idx" ON "SyllabusCourse"("syllabusId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "SyllabusCourse_syllabusId_courseId_key" ON "SyllabusCourse"("syllabusId", "courseId");

-- CreateIndex
CREATE INDEX "SyllabusRequest_status_idx" ON "SyllabusRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SyllabusRequest_studentId_syllabusId_key" ON "SyllabusRequest"("studentId", "syllabusId");

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_syllabusId_fkey" FOREIGN KEY ("syllabusId") REFERENCES "Syllabus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyllabusCourse" ADD CONSTRAINT "SyllabusCourse_syllabusId_fkey" FOREIGN KEY ("syllabusId") REFERENCES "Syllabus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyllabusCourse" ADD CONSTRAINT "SyllabusCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyllabusRequest" ADD CONSTRAINT "SyllabusRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyllabusRequest" ADD CONSTRAINT "SyllabusRequest_syllabusId_fkey" FOREIGN KEY ("syllabusId") REFERENCES "Syllabus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyllabusRequest" ADD CONSTRAINT "SyllabusRequest_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

