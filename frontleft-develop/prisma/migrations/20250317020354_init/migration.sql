-- CreateEnum
CREATE TYPE "BountyStatus" AS ENUM ('PENDING', 'APPROVED', 'ACTIVE', 'CLAIMED', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ClaimantStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Bounty" (
    "id" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "trackTitle" TEXT NOT NULL,
    "description" TEXT,
    "supportingArtists" TEXT[],
    "reward" DOUBLE PRECISION NOT NULL,
    "proofImageUrls" TEXT[],
    "status" "BountyStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bounty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claimant" (
    "id" TEXT NOT NULL,
    "bountyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "status" "ClaimantStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Claimant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Claimant" ADD CONSTRAINT "Claimant_bountyId_fkey" FOREIGN KEY ("bountyId") REFERENCES "Bounty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
