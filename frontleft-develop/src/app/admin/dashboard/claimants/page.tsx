'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type ClaimantStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

type Claimant = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  status: ClaimantStatus;
  bounty: {
    trackTitle: string;
    artist: string;
    reward: number;
  };
};

export default function ClaimantsPage() {
  const [claimants, setClaimants] = useState<Claimant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch claimants from API
  const fetchClaimants = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/claims');
      
      if (!response.ok) {
        throw new Error('Failed to fetch claimants');
      }
      
      const data = await response.json();
      setClaimants(data);
    } catch (err) {
      console.error('Error fetching claimants:', err);
      setError('Failed to load claimants. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchClaimants();
  }, []);

  const getStatusClass = (status: ClaimantStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-900 text-yellow-300';
      case 'APPROVED':
        return 'bg-green-900 text-green-300';
      case 'REJECTED':
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-blue-900 text-blue-300';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Claims Management</h1>
        <button 
          onClick={() => fetchClaimants()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
        >
          Refresh
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-8 bg-gray-900 rounded-lg border border-gray-800">
          <p className="text-gray-400">Loading claimants...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 bg-gray-900 rounded-lg border border-gray-800">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-300">Claimant</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-300">Bounty</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-300">Producer</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-300">Reward</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {claimants.length > 0 ? (
                  claimants.map((claim: Claimant) => (
                    <tr key={claim.id} className="text-gray-300">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-white">{claim.name}</div>
                          <div className="text-sm text-gray-400">{claim.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{claim.bounty.trackTitle}</td>
                      <td className="px-6 py-4">{claim.bounty.artist}</td>
                      <td className="px-6 py-4">${claim.bounty.reward}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(claim.status)}`}>
                          {claim.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/dashboard/claimants/${claim.id}`}
                          className="text-blue-400 hover:text-blue-300 font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      No claims found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}