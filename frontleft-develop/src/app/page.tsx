'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BountyCard } from './components/BountyCard';
import { BountyCardSkeletonGrid } from './components/skeletons/BountyCardSkeleton';
import { useStytchUser } from '@stytch/nextjs';

type Bounty = {
  id: string;
  artist: string;
  trackTitle: string;
  description: string | null;
  supportingArtists: string[];
  reward: number;
  proofImageUrls: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
  claimants: {
    id: string;
    name: string;
    status: string;
  }[];
};

export default function Home() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Function to fetch bounties from API
  const fetchBounties = async (search?: string) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('status', 'APPROVED');
      if (search) {
        queryParams.append('search', search);
      }

      const response = await fetch(`/api/bounties?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bounties');
      }
      
      const data = await response.json();
      
      // Convert date strings back to Date objects
      const formattedBounties = data.map((bounty: any) => ({
        ...bounty,
        createdAt: new Date(bounty.createdAt),
        updatedAt: new Date(bounty.updatedAt)
      }));
      
      setBounties(formattedBounties);
    } catch (err) {
      console.error('Error fetching bounties:', err);
      setError('Failed to load bounties. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchBounties();
  }, []);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBounties(searchTerm);
  };

  const { user } = useStytchUser();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-black font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* Hero section */}
        <section className="bg-gradient-to-r from-blue-950 to-purple-950 text-white rounded-2xl p-12 mb-12 border border-blue-800/30 shadow-xl shadow-blue-900/10">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Track Bounty Platform
            </h1>

            <p className="text-xl mb-8 text-blue-100 leading-relaxed">
              Get rewarded for capturing DJs playing tracks. Connect up-and-coming producers with fans.
            </p>
            <div className="flex flex-wrap gap-5 text-sm">
              <Link href="/bounties/new" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-blue-600/20 transform hover:-translate-y-0.5">
                Post Bounty
              </Link>
              <Link href="/about" className="bg-transparent text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 border border-blue-400/30 backdrop-blur-sm transform hover:-translate-y-0.5">
                Learn More
              </Link>
              {user && (
                <Link href="/dashboard" className="bg-transparent text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 border border-blue-400/30 backdrop-blur-sm transform hover:-translate-y-0.5">
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </section>
        
        {/* Search functionality (commented out but improved) */}
        {/* <div className="mb-10">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <input
                type="text"
                placeholder="Search artists or tracks..."
                className="w-full px-6 py-3 bg-gray-900/70 text-white border border-blue-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 shadow-inner"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <button 
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-blue-600/20 font-medium"
            >
              Search
            </button>
          </form>
        </div> */}
        
        {/* Bounties feed */}
        <div className="flex items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Active Bounties</h2>
          <div className="h-px flex-grow bg-gradient-to-r from-blue-500/30 to-transparent ml-6"></div>
        </div>
        
        {loading ? (
          <BountyCardSkeletonGrid />
        ) : error ? (
          <div className="text-center py-12 bg-red-900/20 rounded-xl border border-red-800/30">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bounties.length > 0 ? (
              bounties.map((bounty: Bounty) => (
                <BountyCard key={bounty.id} bounty={bounty} />
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-blue-900/10 rounded-xl border border-blue-800/20">
                <p className="text-blue-300 text-lg">
                  No active bounties at the moment. Be the first to post one!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}