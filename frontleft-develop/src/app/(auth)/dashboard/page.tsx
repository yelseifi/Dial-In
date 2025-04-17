'use client';

import { useEffect, useState } from 'react';
import { useStytch, useStytchUser } from '@stytch/nextjs';
import { BountyCard } from '@/app/components/BountyCard';
import Link from 'next/link';
import { BountyCardDashboard } from '@/app/components/dashboard/BountyCardDashboard';
import { ClaimCardDashboard } from '@/app/components/dashboard/ClaimCardDashboard';
import { useStytchToken } from '@/app/lib/useStytchToken';
import { MMWClaimCard } from '@/app/components/dashboard/MMWClaimCard';

type Bounty = {
  id: string;
  artist: string;
  trackTitle: string;
  description: string | null;
  supportingArtists: string[];
  reward: number;
  proofImageUrls: string[];
  status: string;
  songUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  claimants: {
    id: string;
    name: string;
    status: string;
  }[];
};

export type Claim = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  status: string;
  bounty?: Bounty;
  artists?: string[];
  videoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function DashboardPage() {
  const [myBounties, setMyBounties] = useState<Bounty[]>([]);
  const [claimedBounties, setClaimedBounties] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const stytch = useStytch();
  const {user, isInitialized} = useStytchUser()
  const sessionToken = useStytchToken();

  useEffect(() => {
    const fetchBounties = async () => {
      try {
        // Only fetch data if user is initialized and authenticated
        if (isInitialized && user?.user_id) {
          // Fetch user's bounties
          const response = await fetch('/api/bounties/my-bounties', {
            headers: {
              'Authorization': `Bearer ${sessionToken}`,
            },
          });
          const data = await response.json();
          setMyBounties(data);
  
          // Fetch claimed bounties
          const claimsResponse = await fetch('/api/bounties/claimed', {
            headers: {
              'Authorization': `Bearer ${sessionToken}`,
            },
          });
          const claimsData = await claimsResponse.json();
          setClaimedBounties(claimsData.claims);
        }
      } catch (error) {
        console.error('Error fetching bounties:', error);
      } finally {
        // Only set loading to false if initialized
        if (isInitialized) {
          setLoading(false);
        }
      }
    };
  
    // Only redirect if user is initialized but not authenticated
    if (isInitialized && !user?.user_id) {
      window.location.href = '/auth';
      return;
    }
    
    // If user is authenticated, fetch bounties
    if (isInitialized && user?.user_id) {
      fetchBounties();
    }
  }, [user, isInitialized, sessionToken]);
  
  // Keep the loading state while waiting for Stytch to initialize
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
          
        </div>

        {/* My Bounties Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Bounties</h2>
          {myBounties ? (
            myBounties.length === 0 ? (
              <p className="text-gray-400">You haven't created any bounties yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myBounties.map((bounty) => (
                  <BountyCardDashboard key={bounty.id} bounty={bounty} />
                ))}
              </div>
            )
          ) : (
            <p className="text-gray-400">Loading bounties...</p>
          )}
        </section>

        {/* Claimed Bounties Section */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Claims</h2>
          {claimedBounties ? (
            claimedBounties.length === 0 ? (
              <p className="text-gray-400">You haven't claimed any bounties yet.</p>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {claimedBounties.map((claim) => (
                claim.bounty ? (
                  <ClaimCardDashboard key={claim.id} bounty={claim.bounty} claim={claim}/>
                ) : (
                  <MMWClaimCard key={claim.id} claim={claim}/>
                )
              ))}
              </div>
            )
          ) : (
            <p className="text-gray-400">Loading bounties...</p>
          )}
        </section>
      </div>
    </div>
  );
} 