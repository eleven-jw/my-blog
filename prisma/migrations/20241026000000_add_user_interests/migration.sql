-- Add interests column to User table
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "interests" TEXT[] DEFAULT ARRAY[]::TEXT[];
