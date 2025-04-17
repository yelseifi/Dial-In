import { NextRequest, NextResponse } from "next/server";
import { getPreviewUrl } from "@/app/lib/s3";
import { getVideosForBounty } from "@/app/lib/db";
import { getAuthenticatedUser } from "@/app/lib/stytch";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const bountyId = searchParams.get('bountyId');
  if (!bountyId) {
    return NextResponse.json({ error: 'Bounty ID is required' }, { status: 400 });
  }

  const videos = await getVideosForBounty(bountyId);
  const urls = [];

  for (const video of videos) {
    // Check if video.key exists before passing it to getPreviewUrl
    if (video.key) {
      const url = await getPreviewUrl(video.key);
      urls.push(url);
    }
  }

  return NextResponse.json({ urls });
}