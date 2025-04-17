import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getAuthenticatedUser } from '@/app/lib/stytch';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }



    // Get user's bounties
    const bounties = await prisma.bounty.findMany({
      where: {
        userId: user.user_id,
      },
      include: {
        claimants: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json( bounties );
  } catch (error) {
    console.error('Error fetching user bounties:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 