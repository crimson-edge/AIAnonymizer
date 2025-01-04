-- First, add the new columns as nullable
ALTER TABLE "User" ADD COLUMN "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN "lastName" TEXT;

-- Update existing records to split the name field
UPDATE "User" 
SET 
  "firstName" = COALESCE(SPLIT_PART("name", ' ', 1), 'Unknown'),
  "lastName" = COALESCE(NULLIF(SPLIT_PART("name", ' ', 2), ''), 'User');

-- Make the columns required
ALTER TABLE "User" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "lastName" SET NOT NULL;

-- Drop the old name column
ALTER TABLE "User" DROP COLUMN "name";
