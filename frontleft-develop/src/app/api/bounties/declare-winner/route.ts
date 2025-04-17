import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { BountyStatus } from '@prisma/client';
import { declareClaimWinner } from '@/app/lib/db';
export async function POST(request: NextRequest) {

    const body = await request.json();
    const { bountyId, videoUrl, claimId } = body;

    declareClaimWinner(claimId);
    
    return NextResponse.json({ message: 'Winner declared' });
    
    
}