'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useStytchUser } from '@stytch/nextjs';
import { NoVideosState } from '@/app/components/dashboard/NoVideosState';
import { useStytchToken } from '@/app/lib/useStytchToken';
import VideoCarousel from '@/app/components/VideoCarousel';
import ReactPlayer from 'react-player/lazy';
import CompletedBountyVideo from '@/app/components/CompletedBountyVideo';

type Bounty = {
  id: string;
  artist: string;
  trackTitle: string;
  description: string | null;
  supportingArtists: string[];
  reward: number;
  videoUrls: string[];
  status: string;
  createdAt: Date;
};

function BountyDetailsContent({ id }: { id: string }) {
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useStytchUser();
  const sessionToken = useStytchToken();
  const [videos, setVideos] = useState<string[]>([]);
  const [claimIds, setClaimIds] = useState<string[]>([]);
  const [isCarouselView, setIsCarouselView] = useState(true);
  
  useEffect(() => {
    const fetchBounty = async () => {
      try {
        const response = await fetch(`/api/bounties/${id}`, {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
          },
        });
        const data = await response.json();
        setBounty(data);
      } catch (error) {
        console.error('Error fetching bounty:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchVideos = async () => {
      try {
        const response = await fetch(`/api/bounties/${id}/video`, {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
          },
        });
        const data = await response.json();
        setVideos(data.urls || []);
        setClaimIds(data.claimIds || []);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    if (id && user?.user_id && sessionToken) {
      fetchBounty();
      fetchVideos();
    }
  }, [id, user?.user_id, sessionToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">Loading...</div>
        </div>
      </div>
    );
  }

  if (!bounty) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-400">Bounty not found</div>
        </div>
      </div>
    );
  }

  const toggleView = () => {
    setIsCarouselView(!isCarouselView);
  };

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Bounty Header */}
          <div className="bg-gray-900 rounded-lg p-8 mb-8 border border-gray-800">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-3xl font-bold text-white">{bounty.trackTitle}</h1>
              <div className="flex items-center gap-2">
                <span className="bg-green-900 text-green-300 px-4 py-2 rounded-lg text-xl font-semibold">
                  ${bounty.reward}
                </span>
                <span className="bg-blue-900 text-blue-300 px-4 py-2 rounded-lg text-xl font-semibold">
                  {bounty.status}
                </span>
              </div>
              
            </div>
            
            
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Producer</h2>
                <div className="text-gray-300">{bounty.artist}</div>
              </div>
              
              {bounty.description && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Description</h2>
                  <p className="text-gray-300">{bounty.description}</p>
                </div>
              )}
              
              {bounty.supportingArtists && bounty.supportingArtists.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Supporting Artists</h2>
                  <div className="flex flex-wrap gap-2">
                    {bounty.supportingArtists.map((artist, index) => (
                      <span
                        key={index}
                        className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-sm"
                      >
                        {artist}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Videos Section */}
          {/* Videos Section */}
            <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Videos</h2>
              </div>

              {bounty.status === "COMPLETED" ? (
                <CompletedBountyVideo 
                  bountyId={bounty.id}
                />
              ) : videos && videos.length > 0 ? (
                <VideoCarousel 
                  videos={videos} 
                  bountyId={bounty.id}
                  claimIds={claimIds}
                  sessionToken={sessionToken || ''}
                />
              ) : (
                <NoVideosState bountyId={bounty.id} />
              )}
            </div>
        </div>
      </div>
    </div>
  );
}

// For App Router in Next.js 13+
export default function BountyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [bountyId, setBountyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Resolve the params Promise
  useEffect(() => {
    async function resolveParams() {
      try {
        const resolvedParams = await params;
        setBountyId(resolvedParams.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to resolve parameters');
      }
    }

    resolveParams();
  }, [params]);

  if (error) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  if (!bountyId) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return <BountyDetailsContent id={bountyId} />;
}