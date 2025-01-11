-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- Update existing subscription statuses to uppercase
UPDATE "Subscription" SET status = 'ACTIVE' WHERE status = 'active';
