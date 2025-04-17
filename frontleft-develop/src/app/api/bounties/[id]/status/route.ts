import { NextRequest, NextResponse } from 'next/server';
import { updateBountyStatus } from '@/app/lib/db';

// Define the type for Next.js 15.2.2
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const updatedBounty = await updateBountyStatus(params.id, status);
    if (!updatedBounty) {
      return NextResponse.json(
        { error: 'Bounty not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBounty);
  } catch (error) {
    console.error('Error updating bounty status:', error);
    return NextResponse.json(
      { error: 'Failed to update bounty status' },
      { status: 500 }
    );
  }
}