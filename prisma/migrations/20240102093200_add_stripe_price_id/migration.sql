-- Drop unused columns from User
ALTER TABLE "User" DROP COLUMN IF EXISTS "stripePriceId";
ALTER TABLE "User" DROP COLUMN IF EXISTS "stripeSubscriptionStatus";

-- Add stripePriceId to Subscription
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "stripePriceId" TEXT;
