-- AlterEnum
ALTER TYPE "BlockType" ADD VALUE 'GUIDED_CODE';

-- CreateTable
CREATE TABLE "GuidedCodeProgress" (
    "studentId" UUID NOT NULL,
    "blockId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "stepStartCode" TEXT NOT NULL,
    "passedSteps" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuidedCodeProgress_pkey" PRIMARY KEY ("studentId","blockId")
);

-- CreateIndex
CREATE INDEX "GuidedCodeProgress_blockId_idx" ON "GuidedCodeProgress"("blockId");

-- AddForeignKey
ALTER TABLE "GuidedCodeProgress" ADD CONSTRAINT "GuidedCodeProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidedCodeProgress" ADD CONSTRAINT "GuidedCodeProgress_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "ContentBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;
