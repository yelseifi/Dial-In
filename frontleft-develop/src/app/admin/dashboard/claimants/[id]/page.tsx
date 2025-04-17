'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type ClaimantDetails = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  status: string;
  bounty: {
    id: string;
    artist: string;
    trackTitle: string;
    email: string;
    phoneNumber: string;
    reward: number;
    supportingArtists: string[];
  };
};

// Updated PageProps to match Next.js 15 requirements
type PageProps = {
  params: Promise<{ id: string }>;
};

export default function ClaimantDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimant, setClaimant] = useState<ClaimantDetails | null>(null);
  const [claimId, setClaimId] = useState<string | null>(null);

  // First, resolve the params Promise to get the ID
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setClaimId(resolvedParams.id);
      } catch (err) {
        console.error('Error resolving params:', err);
        setError('Failed to load claim details - invalid parameters');
        setIsLoading(false);
      }
    };
    
    resolveParams();
  }, [params]);

  // Fetch claimant details once we have the ID
  useEffect(() => {
    if (!claimId) return;
    
    fetch(`/api/claims/${claimId}`)
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          if (res.status === 401) {
            router.push('/admin');
            throw new Error('Please log in to view this page');
          }
          throw new Error(errorData.error || 'Failed to load claim details');
        }
        return res.json();
      })
      .then(data => {
        // Validate the data structure
        if (!data || !data.bounty) {
          throw new Error('Invalid claim data received');
        }
        setClaimant(data);
      })
      .catch(err => {
        console.error('Error loading claim:', err);
        setError(err.message || 'Failed to load claim details');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [claimId, router]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!claimId) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/claims/${claimId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      router.refresh();
      router.push('/admin/dashboard/claimants');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update claim status');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-400">{error}</div>
        <button
          onClick={() => router.push('/admin/dashboard/claimants')}
          className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          Back to Claims
        </button>
      </div>
    );
  }

  if (isLoading || !claimant) {
    return (
      <div className="p-6">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Claim Details</h1>
          <button
            onClick={() => router.push('/admin/dashboard/claimants')}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            Back to Claims
          </button>
        </div>

        {/* Bounty Information */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">Bounty Information</h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-400">Track Title</div>
              <div className="text-white">{claimant.bounty.trackTitle}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Producer</div>
              <div className="text-white">{claimant.bounty.artist}</div>
            </div>
            {claimant.bounty.supportingArtists.length > 0 && (
              <div>
                <div className="text-sm text-gray-400 mb-2">Supporting Artists</div>
                <div className="flex flex-wrap gap-2">
                  {claimant.bounty.supportingArtists.map((artist, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-900 text-blue-300"
                    >
                      {artist}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-400">Producer Contact</div>
              <div className="text-white">{claimant.bounty.email}</div>
              <div className="text-white">{claimant.bounty.phoneNumber}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Reward</div>
              <div className="text-white">${claimant.bounty.reward}</div>
            </div>
          </div>
        </div>

        {/* Claimant Information */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">Claimant Information</h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-400">Name</div>
              <div className="text-white">{claimant.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Contact Information</div>
              <div className="text-white">{claimant.email}</div>
              <div className="text-white">{claimant.phoneNumber}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Status</div>
              <div className="text-white">{claimant.status}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => handleStatusUpdate('APPROVED')}
            disabled={isLoading}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed transition"
          >
            Approve Claim
          </button>
          <button
            onClick={() => handleStatusUpdate('REJECTED')}
            disabled={isLoading}
            className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-500 disabled:bg-red-800 disabled:cursor-not-allowed transition"
          >
            Reject Claim
          </button>
          <button
            onClick={() => handleStatusUpdate('COMPLETED')}
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed transition"
          >
            Mark as Completed
          </button>
        </div>
      </div>
    </div>
  );
}
