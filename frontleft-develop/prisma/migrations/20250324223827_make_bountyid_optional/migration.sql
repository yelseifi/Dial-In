-- DropForeignKey
ALTER TABLE "Claimant" DROP CONSTRAINT "Claimant_bountyId_fkey";

-- AlterTable
ALTER TABLE "Claimant" ALTER COLUMN "bountyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Claimant" ADD CONSTRAINT "Claimant_bountyId_fkey" FOREIGN KEY ("bountyId") REFERENCES "Bounty"("id") ON DELETE SET NULL ON UPDATE CASCADE;
