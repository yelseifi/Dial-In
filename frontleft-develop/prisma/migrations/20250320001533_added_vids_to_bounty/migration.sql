-- AlterTable
ALTER TABLE "Bounty" ADD COLUMN     "videoUrls" TEXT[];

-- AlterTable
ALTER TABLE "Claimant" ALTER COLUMN "dateSeeing" DROP NOT NULL;
