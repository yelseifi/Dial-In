import { getVideosForBounty, getVideosForClaim, getWinningVideo } from "@/app/lib/db";
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

    const winningVideo = await getWinningVideo(bountyId);
    if (!winningVideo) {
      return NextResponse.json({ error: 'No winning video found' }, { status: 404 });
    }
    if (!winningVideo.key) {
      return NextResponse.json({ error: 'No key found for winning video' }, { status: 404 });
    }
    return NextResponse.json({ winningVideo });
  }