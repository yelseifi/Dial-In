/*
  Warnings:

  - Added the required column `email` to the `Bounty` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `Bounty` table without a default value. This is not possible if the table is not empty.

*/
-- First add the columns as nullable
ALTER TABLE "Bounty" ADD COLUMN "email" TEXT;
ALTER TABLE "Bounty" ADD COLUMN "phoneNumber" TEXT;

-- Update existing records with placeholder values
UPDATE "Bounty" SET 
  "email" = 'no-email@placeholder.com',
  "phoneNumber" = 'no-phone-number'
WHERE "email" IS NULL OR "phoneNumber" IS NULL;

-- Make the columns required
ALTER TABLE "Bounty" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "Bounty" ALTER COLUMN "phoneNumber" SET NOT NULL;
