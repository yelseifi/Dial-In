import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getAuthenticatedUser } from '@/app/lib/stytch';
import { NextRequest } from 'next/server';
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get bounties where the user is a claimant
    const claims = await prisma.claimant.findMany({
      where: {
        userId: user.user_id,
      },
      include: {
        bounty: {
          select: {
            id: true,
            artist: true,
            trackTitle: true,
            description: true,
            supportingArtists: true,
            reward: true,
            status: true,
            songUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ claims });
  } catch (error) {
    console.error('Error fetching claimed bounties:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 