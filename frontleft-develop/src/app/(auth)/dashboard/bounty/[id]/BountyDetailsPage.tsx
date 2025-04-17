'use client';

import { useEffect, useState } from 'react';
import { useStytchUser } from '@stytch/nextjs';
import { NoVideosState } from '@/app/components/dashboard/NoVideosState';

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

export default function BountyDetailsPage({ params }: { params: { id: string } }) {
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useStytchUser();

  useEffect(() => {
    const fetchBounty = async () => {
      try {
        const response = await fetch(`/api/bounties/${params.id}`, {
          headers: {
            'X-User-ID': user?.user_id || '',
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

    if (user?.user_id) {
      fetchBounty();
    }
  }, [params.id, user?.user_id]);

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

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Bounty Header */}
          <div className="bg-gray-900 rounded-lg p-8 mb-8 border border-gray-800">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-3xl font-bold text-white">{bounty.trackTitle}</h1>
              <span className="bg-green-900 text-green-300 px-4 py-2 rounded-lg text-xl font-semibold">
                ${bounty.reward}
              </span>
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
              
              {bounty.supportingArtists.length > 0 && (
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
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-6">Videos</h2>
            
            {bounty.videoUrls && bounty.videoUrls.length > 0 ? (
              <div className="space-y-6">
                {bounty.videoUrls.map((url, index) => (
                  <div key={index} className="aspect-w-16 aspect-h-9">
                    <iframe
                      src={url}
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ))}
              </div>
            ) : (
              <NoVideosState bountyId={bounty.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

