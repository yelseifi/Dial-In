import { NextRequest, NextResponse } from 'next/server';
import { createClaimant, getUserById, getUserClaimForBounty, ClaimantCreateInput } from '@/app/lib/db';
import { getAuthenticatedUser } from '@/app/lib/stytch';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const bountyId = searchParams.get('bountyId');

    if (!userId || !bountyId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const existingClaim = await getUserClaimForBounty(userId, bountyId);
    return NextResponse.json({ hasClaimed: !!existingClaim, isCreator: existingClaim?.userId === userId, claim: existingClaim });
  } catch (error) {
    console.error('Error checking claim:', error);
    return NextResponse.json(
      { error: 'Failed to check claim status' },
      { status: 500 }
    );
  }
}
  
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const uid = user.user_id;
    const userInfo = await getUserById(uid);
    const name = userInfo?.name;
    const email = userInfo?.email;
    const phoneNumber = userInfo?.phoneNuber;
    
    // Extract and validate required fields
    const { bountyId, artists, dateSeeing, videoUrl } = body;
    
    if (!name || !email || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Prepare claimant data - only include bountyId if it exists
    const claimantData: ClaimantCreateInput = {
      name,
      email,
      phoneNumber,
      artists,
      dateSeeing: new Date(dateSeeing),
      userId: user.user_id,
      videoUrl,
    };
    
    // Only add bountyId to the object if it's provided
    if (bountyId) {
      claimantData.bountyId = bountyId;
    }
    
    // Create the claimant in the database
    const claimant = await createClaimant(claimantData);
    
    return NextResponse.json(claimant, { status: 201 });
  } catch (error) {
    console.error('Error creating claimant:', error);
    return NextResponse.json(
      { error: 'Failed to create claimant' },
      { status: 500 }
    );
  }
}