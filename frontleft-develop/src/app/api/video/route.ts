import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/app/lib/stytch';
import prisma from '@/lib/prisma';
import { uploadVideo } from '@/app/lib/s3';
import { ClaimantStatus } from '@prisma/client';
import { createVideo } from '@/app/lib/db';
import { getVideosForClaim } from '@/app/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const claimId = searchParams.get('claimId');

    if (!claimId) {
      return NextResponse.json({ error: 'Claim ID is required' }, { status: 400 });
    }

    // Get the video for the claim
    const videos = await getVideosForClaim(claimId);

    const videoUrls = videos.map((video) => video.videoUrl);



    return NextResponse.json(videoUrls);
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the form data
    const formData = await request.json();
    const bountyId = formData.bountyId;
    const claimId = formData.claimId;
    const videoUrl = formData.videoUrl;
    const key = formData.key;


    if (!videoUrl || !claimId) {
      return NextResponse.json(
        { error: 'Video file and claim ID are required' },
        { status: 400 }
      );
    }

    // Verify the claim exists and belongs to the user
    const claim = await prisma.claimant.findUnique({
      where: { id: claimId },
      select: { userId: true },
    });

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    if (claim.userId !== user.user_id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }


    // Create video record in database
    const video = await createVideo({
      videoUrl,
      claimId,
      bountyId,
      uploadedByUserId: user.user_id,
      key,
    });

    // Update claim status to indicate video has been uploaded
    await prisma.claimant.update({
      where: { id: claimId },
      data: { 
        status: ClaimantStatus.APPROVED,
        videoUrl: videoUrl,
      },
    });

    return NextResponse.json({
      message: 'Video uploaded successfully',
      video: {
        id: video.id,
        videoUrl: video.videoUrl,
        key: video.key,
        createdAt: video.createdAt,
      },
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    );
  }
}
