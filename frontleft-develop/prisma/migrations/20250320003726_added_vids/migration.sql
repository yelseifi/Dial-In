-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "videoUrl" TEXT,
    "bountyId" TEXT,
    "claimId" TEXT,
    "uploadedByUserId" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);
