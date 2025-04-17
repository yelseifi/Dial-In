import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Fetch all claims, ordered by creation date
    const claims = await prisma.claimant.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        bounty: {
          select: {
            trackTitle: true,
            artist: true,
            reward: true
          }
        }
      }
    })

    return NextResponse.json(claims)
  } catch (error) {
    console.error('Error fetching claims:', error)
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    )
  }
}