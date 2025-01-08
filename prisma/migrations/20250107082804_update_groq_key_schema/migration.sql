/*
  Warnings:

  - You are about to drop the column `successCount` on the `GroqKey` table. All the data in the column will be lost.
  - You are about to drop the column `totalUsage` on the `GroqKey` table. All the data in the column will be lost.
  - You are about to alter the column `totalCost` on the `GroqKey` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,4)`.

*/
-- AlterTable
ALTER TABLE "GroqKey" DROP COLUMN "successCount",
DROP COLUMN "totalUsage",
ADD COLUMN     "totalRequests" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "totalCost" SET DATA TYPE DECIMAL(10,4),
ALTER COLUMN "totalTokens" SET DATA TYPE BIGINT;

-- CreateTable
CREATE TABLE "RequestLog" (
    "id" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latency" INTEGER NOT NULL,
    "tokens" INTEGER NOT NULL,
    "cost" DECIMAL(10,4) NOT NULL,
    "success" BOOLEAN NOT NULL,
    "errorType" TEXT,
    "userId" TEXT,
    "requestType" TEXT NOT NULL,

    CONSTRAINT "RequestLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RequestLog_keyId_idx" ON "RequestLog"("keyId");

-- CreateIndex
CREATE INDEX "RequestLog_timestamp_idx" ON "RequestLog"("timestamp");

-- AddForeignKey
ALTER TABLE "RequestLog" ADD CONSTRAINT "RequestLog_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "GroqKey"("key") ON DELETE CASCADE ON UPDATE CASCADE;
