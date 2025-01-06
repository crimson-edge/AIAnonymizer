-- CreateTable
CREATE TABLE "GroqKeyUsage" (
    "id" TEXT NOT NULL,
    "groqKeyId" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroqKeyUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GroqKeyUsage_groqKeyId_idx" ON "GroqKeyUsage"("groqKeyId");

-- CreateIndex
CREATE INDEX "GroqKeyUsage_createdAt_idx" ON "GroqKeyUsage"("createdAt");

-- AddForeignKey
ALTER TABLE "GroqKeyUsage" ADD CONSTRAINT "GroqKeyUsage_groqKeyId_fkey" FOREIGN KEY ("groqKeyId") REFERENCES "GroqKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
