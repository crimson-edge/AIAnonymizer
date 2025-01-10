-- Add availableTokens field to Subscription model
ALTER TABLE "Subscription" ADD COLUMN "availableTokens" INTEGER NOT NULL DEFAULT 0;

-- Initialize availableTokens to monthlyLimit - monthlyUsage for all users
UPDATE "Subscription" s
SET "availableTokens" = s."monthlyLimit" - u."monthlyUsage"
FROM "User" u
WHERE s."userId" = u.id;
