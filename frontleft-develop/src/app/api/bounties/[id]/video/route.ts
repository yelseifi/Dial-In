import { getVideosForBounty, getVideosForClaim } from "@/app/lib/db";
import { getPreviewUrl } from "@/app/lib/s3";
import { getAuthenticatedUser } from "@/app/lib/stytch";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    } 

    const params = await context.params;
    const bountyId = params.id;
    if (!bountyId) {
      return NextResponse.json({ error: 'Bounty ID is required' }, { status: 400 });
    }
  
    const videos = await getVideosForBounty(bountyId);
    const urls = [];
    const claimIds = [];
    for (const video of videos) {
      if (video.key) {
        const url = await getPreviewUrl(video.key);
        urls.push(url);
        claimIds.push(video.claimId);
      }
    }
    return NextResponse.json({ urls, claimIds });
  }