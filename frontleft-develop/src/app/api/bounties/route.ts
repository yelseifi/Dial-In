import { NextRequest, NextResponse } from 'next/server';
import {
  getAllBounties,
  getApprovedBounties,
  createBounty,
  type BountyCreateInput,
} from '@/app/lib/db';
import { BountyStatus } from '@prisma/client/wasm';
import { uploadMultipleToS3, processMultipleFileUploads } from '@/app/lib/upload';
import { getAuthenticatedUser } from '@/app/lib/stytch';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const searchTerm = searchParams.get('search');
  
  try {
    const bounties = await getAllBounties({
      status: status as BountyStatus,
      searchTerm: searchTerm || undefined
    });
    return NextResponse.json(bounties);
  } catch (error) {
    console.error('Error fetching bounties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bounties' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Get the user ID added by the middleware
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Extract and validate required fields
    const artist = formData.get('artist') as string;
    const trackTitle = formData.get('trackTitle') as string;
    const description = formData.get('description') as string;
    const supportingArtistsStr = formData.get('supportingArtists') as string;
    const reward = parseFloat(formData.get('reward') as string);
    const email = formData.get('email') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const songUrl = formData.get('songUrl') as string;

    if (!artist || !trackTitle || !reward || isNaN(reward) || !email || !phoneNumber || !songUrl) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }
    
    // Process supporting artists
    const supportingArtists = supportingArtistsStr
      ? supportingArtistsStr.split(',').map(artist => artist.trim())
      : [];
    
    // Process and upload proof images
    const proofFiles = await processMultipleFileUploads(formData, 'proofImages');
    const proofImageUrls = proofFiles.length > 0
      ? await uploadMultipleToS3(proofFiles)
      : [];
    
    // Create bounty data object
    const bountyData: BountyCreateInput = {
      artist,
      trackTitle,
      description,
      email,
      phoneNumber,
      supportingArtists,
      reward,
      proofImageUrls,
      userId: user.user_id,
      songUrl,
    };
    
    // Create the bounty in the database
    const bounty = await createBounty(bountyData);
    return NextResponse.json(bounty, { status: 201 });
  } catch (error) {
    console.error('Error creating bounty:', error);
    return NextResponse.json(
      { error: 'Failed to create bounty' },
      { status: 500 }
    );
  }
}