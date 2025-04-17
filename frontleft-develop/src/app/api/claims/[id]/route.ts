import { NextRequest, NextResponse } from 'next/server'
import { getClaimantById, updateClaimantStatus } from '@/app/lib/db'
import { getAuthenticatedUser } from '@/app/lib/stytch';

// Define the type for Next.js 15.2.2
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get id from route params - await it!
    const params = await context.params;
    const { id } = params;

    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const claimant = await getClaimantById(id);
    if (!claimant) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    return NextResponse.json(claimant);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch claim' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Await params to get id
    const params = await context.params;
    const { id } = params;
    const { status } = await request.json();

    // Validate status
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const updatedClaimant = await updateClaimantStatus(id, status);
    if (!updatedClaimant) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedClaimant);
  } catch (error) {
    console.error('Error updating claim:', error);
    return NextResponse.json(
      { error: 'Failed to update claim' },
      { status: 500 }
    );
  }
}