import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verify } from 'jsonwebtoken'


// Define the type for Next.js 15.2.2
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Verify admin access
    
    // Await params to get id
    const params = await context.params;
    const { status } = await request.json()
    
    // Validate status
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }
    
    // Update bounty status
    const updatedBounty = await prisma.bounty.update({
      where: { id: params.id },
      data: { status }
    })
    
    return NextResponse.json(updatedBounty)
  } catch (error) {
    console.error('Error updating bounty:', error)
    return NextResponse.json(
      { error: 'Failed to update bounty' },
      { status: 500 }
    )
  }
}