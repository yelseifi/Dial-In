import { NextRequest, NextResponse } from 'next/server';
import { getBountyById, updateBounty } from '@/app/lib/db';

// Define the correct context type for Next.js 15.2.2
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const bounty = await getBountyById(params.id);
    
    if (!bounty) {
      return NextResponse.json(
        { error: 'Bounty not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(bounty);
  } catch (error) {
    console.error('Error fetching bounty:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bounty' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const data = await request.json();
    
    const updatedBounty = await updateBounty(params.id, data);
    if (!updatedBounty) {
      return NextResponse.json(
        { error: 'Bounty not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedBounty);
  } catch (error) {
    console.error('Error updating bounty:', error);
    return NextResponse.json(
      { error: 'Failed to update bounty' },
      { status: 500 }
    );
  }
}