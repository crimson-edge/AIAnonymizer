-- CreateTable
CREATE TABLE "GroqKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "isInUse" BOOLEAN NOT NULL DEFAULT false,
    "currentSession" TEXT,
    "lastUsed" TIMESTAMP(3),
    "totalUsage" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroqKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroqKey_key_key" ON "GroqKey"("key");
