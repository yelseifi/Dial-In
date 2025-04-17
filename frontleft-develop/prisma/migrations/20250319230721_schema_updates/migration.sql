/*
  Warnings:

  - Added the required column `dateSeeing` to the `Claimant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Claimant" ADD COLUMN     "artists" TEXT[],
ADD COLUMN     "dateSeeing" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "description" TEXT;
