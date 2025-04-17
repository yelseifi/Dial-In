'use client';

import { useEffect, useState } from 'react';
import VideoUpload from "@/app/components/dashboard/UploadVideo";
import { useStytchToken } from '@/app/lib/useStytchToken';
import dynamic from 'next/dynamic';

// Import ReactPlayer dynamically to avoid SSR issues
const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });

type Claim = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  status: string;
  bounty: {
    id: string;
    artist: string;
    trackTitle: string;
    description: string | null;
    supportingArtists: string[];
    reward: number;
    songUrl?: string;
  };
  videoUrl?: string;
};

function ClaimDetailsContent({ id }: { id: string }) {
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionToken = useStytchToken();

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        const response = await fetch(`/api/claims/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch claim details');
        }
        
        const data = await response.json();
        setClaim(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load claim details');
      } finally {
        setLoading(false);
      }
    };

    if (id && sessionToken) {
      fetchClaim();
    }
  }, [id, sessionToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-400">{error || 'Claim not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Claim Information */}
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
            <h1 className="text-2xl font-bold text-white mb-6">Claim Details</h1>
            
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-300 mb-2">Track Information</h2>
                <p className="text-white">{claim.bounty.trackTitle}</p>
                <p className="text-gray-400">by {claim.bounty.artist}</p>
                {claim.bounty.description && (
                  <p className="text-gray-400 mt-2">{claim.bounty.description}</p>
                )}
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Supporting Artists: </span>
                  <span className="text-gray-400">{claim.bounty.supportingArtists.join(', ')}</span>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Reward: </span>
                  <span className="text-gray-400">${claim.bounty.reward}</span>
                </div>
                {claim.bounty.songUrl && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-500">Song URL: </span>
                    <span className="text-gray-400"><a href={claim.bounty.songUrl} target="_blank" rel="noopener noreferrer">{claim.bounty.songUrl}</a></span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-800">
                <h2 className="text-lg font-semibold text-gray-300 mb-2">Claim Information</h2>
                <p className="text-gray-400">Status: <span className="text-white">{claim.status}</span></p>
                <p className="text-gray-400">Claimant: <span className="text-white">{claim.name}</span></p>
                <p className="text-gray-400">Contact: <span className="text-white">{claim.email}</span></p>
              </div>
            </div>
          </div>

          {/* Video Section */}
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-6">Video Evidence</h2>
            
            {claim.videoUrl ? (
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <ReactPlayer
                  url={claim.videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  playsinline
                  config={{
                    file: {
                      attributes: {
                        controlsList: 'nodownload',
                        className: 'rounded-lg'
                      },
                      forceVideo: true
                    }
                  }}
                  style={{ borderRadius: '0.5rem' }}
                  onError={(e) => console.error("Video playback error:", e)}
                />
              </div>
            ) : (
              <div>
                <p className="text-gray-400 mb-6">
                  Upload a video showing the track being played at the event.
                </p>
                <VideoUpload bountyId={claim.bounty.id} claimId={claim.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// For App Router in Next.js 13+
export default function IndividualClaimPageDashboard({ params }: { params: Promise<{ id: string }> }) {
  const [claimId, setClaimId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Resolve the params Promise
  useEffect(() => {
    async function resolveParams() {
      try {
        const resolvedParams = await params;
        setClaimId(resolvedParams.id);
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

  if (!claimId) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return <ClaimDetailsContent id={claimId} />;
}