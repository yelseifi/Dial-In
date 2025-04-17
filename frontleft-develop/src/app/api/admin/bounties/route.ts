import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verify } from 'jsonwebtoken'


export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    

    // Fetch all bounties, ordered by creation date
    const bounties = await prisma.bounty.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(bounties)
  } catch (error) {
    console.error('Error fetching bounties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bounties' },
      { status: 500 }
    )
  }
} 