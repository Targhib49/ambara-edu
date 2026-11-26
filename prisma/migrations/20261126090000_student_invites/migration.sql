-- CreateTable
CREATE TABLE "StudentInvite" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "suggestedEmail" TEXT,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentInvite_userId_key" ON "StudentInvite"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentInvite_tokenHash_key" ON "StudentInvite"("tokenHash");

-- AddForeignKey
ALTER TABLE "StudentInvite" ADD CONSTRAINT "StudentInvite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
