import { PrismaClient, Prisma, BountyStatus, ClaimantStatus } from '@prisma/client';

// To avoid multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Types for filtering and creating
export type BountyFilter = {
  status?: BountyStatus;
  searchTerm?: string;
};

export type BountyCreateInput = {
  artist: string;
  trackTitle: string;
  description?: string;
  email: string;
  phoneNumber: string;
  supportingArtists: string[];
  reward: number;
  proofImageUrls: string[];
  userId?: string;
  songUrl?: string;
};

export type ClaimantCreateInput = {
  bountyId?: string;
  name: string;
  email: string;
  phoneNumber: string;
  artists: string[];
  dateSeeing: Date;
  userId: string;
  videoUrl?: string;
};

export type UserCreateInput = {
  id: string;
  email: string;
  phoneNuber: string;
  name?: string;
};

export type VideoCreateInput = {
  claimId: string;
  bountyId: string;
  videoUrl: string;
  key: string
  description?: string;
  uploadedByUserId: string;
};

// Bounty Functions
export async function getAllBounties(filter?: BountyFilter) {
  const { status, searchTerm } = filter || {};
  
  const where: Prisma.BountyWhereInput = {
    ...(status && { status }),
    ...(searchTerm && {
      OR: [
        { artist: { contains: searchTerm, mode: 'insensitive' } },
        { trackTitle: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        {
          supportingArtists: {
            hasSome: (await prisma.bounty.findMany({
              select: { supportingArtists: true },
            })).flatMap(b => b.supportingArtists.map(a => a.toLowerCase()))
              .includes(searchTerm.toLowerCase()) ? [searchTerm] : []
          }
        }
      ],
    }),
  };
  

  return prisma.bounty.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { 
      claimants: {
        where: { status: ClaimantStatus.APPROVED },
        select: {
          id: true,
          name: true,
          status: true,
        }
      }
    },
  });
}

export async function getApprovedBounties(filter?: BountyFilter) {
  return getAllBounties({ 
    ...filter, 
    status: BountyStatus.APPROVED 
  });
}

export async function getBountyById(id: string, includeAllClaimants = false) {
  return prisma.bounty.findUnique({
    where: { id },
    select: {
      id: true,
      artist: true,
      trackTitle: true,
      description: true,
      email: true,
      phoneNumber: true,
      supportingArtists: true,
      reward: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      videoUrls: true,
      claimants: {
        where: includeAllClaimants ? {} : { status: ClaimantStatus.APPROVED },
      },
    },
  });
}

export async function createBounty(data: BountyCreateInput) {
  return prisma.bounty.create({
    data: {
      ...data,
      reward: typeof data.reward === 'string' ? parseFloat(data.reward) : data.reward,
    },
  });
}

export async function updateBountyStatus(id: string, status: BountyStatus) {
  return prisma.bounty.update({
    where: { id },
    data: { status },
  });
}

export async function updateBounty(id: string, data: Partial<BountyCreateInput>) {
  const updateData: Prisma.BountyUpdateInput = { ...data };
  
  // Handle reward conversion if it's a string
  if (typeof data.reward === 'string') {
    updateData.reward = parseFloat(data.reward);
  }
  
  return prisma.bounty.update({
    where: { id },
    data: updateData,
  });
}

// Claimant Functions
export async function getClaimantById(id: string) {
  return prisma.claimant.findUnique({
    where: { id },
    include: {
      bounty: {
        select: {
          id: true,
          artist: true,
          trackTitle: true,
          email: true,
          phoneNumber: true,
          reward: true,
          status: true,
          supportingArtists: true,
          songUrl: true,
        }
      },
    },
  });
}

export async function createClaimant(data: ClaimantCreateInput) {
  return prisma.claimant.create({
    data,
  });
}

export async function getClaimantsByBountyId(bountyId: string, includeAllStatuses = false) {
  return prisma.claimant.findMany({
    where: {
      bountyId,
      ...(includeAllStatuses ? {} : { status: ClaimantStatus.APPROVED }),
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateClaimantStatus(id: string, status: ClaimantStatus) {
  return prisma.claimant.update({
    where: { id },
    data: { status },
  });
}

// Admin Functions
export async function getPendingBounties() {
  return prisma.bounty.findMany({
    where: { status: BountyStatus.PENDING },
    orderBy: { createdAt: 'desc' },
    include: { claimants: true },
  });
}

export async function getAllPendingClaimants() {
  return prisma.claimant.findMany({
    where: { status: ClaimantStatus.PENDING },
    include: { bounty: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getBountyStats() {
  const totalBounties = await prisma.bounty.count();
  const activeBounties = await prisma.bounty.count({
    where: { status: BountyStatus.APPROVED },
  });
  const totalReward = await prisma.bounty.aggregate({
    _sum: { reward: true },
    where: { status: BountyStatus.APPROVED },
  });
  
  return {
    totalBounties,
    activeBounties,
    totalReward: totalReward._sum.reward || 0,
  };
}

export async function getAllClaimants() {
  return prisma.claimant.findMany({
    include: { bounty: true },
    orderBy: { createdAt: 'desc' },
  });
}


export async function createUser(data: UserCreateInput) {
  return prisma.user.create({
    data,
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function getUserClaimForBounty(userId: string, bountyId: string) {
  return prisma.claimant.findFirst({
    where: {
      userId,
      bountyId,
    },
  });
}

export async function getVideosForClaim(claimId: string) {
  return prisma.video.findMany({
    where: {
      claimId,
    },
  });
}

export async function getVideosForBounty(bountyId: string) {
  return prisma.video.findMany({
    where: {
      bountyId,
    },
    select: {
      videoUrl: true,
      key: true,
      claimId: true,
      description: true,
      uploadedByUserId: true,
      bountyId: true,
    }
  });
}

export async function createVideo(data: VideoCreateInput) {
  return prisma.video.create({
    data,
  });
} 

export async function getVideoById(id: string) {
  return prisma.video.findUnique({
    where: { id },
  });
}

export async function declareClaimWinner(claimId: string) {
  // First get the claimant to get the bountyId
  const claimant = await prisma.claimant.findUnique({
    where: { id: claimId },
    select: { bountyId: true }
  });
  
  if (!claimant) {
    throw new Error('Claim not found');
  }
  
  // Check if bountyId exists
  if (!claimant.bountyId) {
    throw new Error('Claim is not associated with a bounty');
  }
  
  // Use a transaction to update both records
  return prisma.$transaction([
    // Update the winning claim to APPROVED
    prisma.claimant.update({
      where: { id: claimId },
      data: { status: ClaimantStatus.APPROVED }
    }),
    // Update the bounty to COMPLETED
    prisma.bounty.update({
      where: { id: claimant.bountyId },
      data: { status: BountyStatus.COMPLETED }
    }),
    // Find the other claimants and update their status to REJECTED
    prisma.claimant.updateMany({
      where: {
        bountyId: claimant.bountyId,
        status: ClaimantStatus.PENDING,
        id: { not: claimId }
      },
      data: { status: ClaimantStatus.REJECTED }
    })
  ]);
}

export async function getWinningVideo(bountyId: string) {
  const winningClaim = await prisma.claimant.findFirst({
    where: {
      bountyId,
      status: ClaimantStatus.APPROVED,
    },
  });
  if (!winningClaim) {
    throw new Error('No winning claim found');
  } 
  return prisma.video.findFirst({
    where: {
      claimId: winningClaim.id,
    },
  });
}