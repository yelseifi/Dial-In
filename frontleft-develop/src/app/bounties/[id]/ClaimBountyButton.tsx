'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStytchUser } from '@stytch/nextjs';
import { useStytchToken } from '@/app/lib/useStytchToken';

type ClaimBountyButtonProps = {
  bountyId: string;
  artists: string[];
  creatorUserId: string | null;
};

export function ClaimBountyButton({ bountyId, artists, creatorUserId }: ClaimBountyButtonProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [artistSeen, setArtistSeen] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [hasClaimed, setHasClaimed] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const {user, isInitialized} = useStytchUser();
  const router = useRouter();
  const sessionToken = useStytchToken();

  useEffect(() => {
    const checkClaimStatus = async () => {
      if (!user?.user_id || !isInitialized) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/claims?userId=${user.user_id}&bountyId=${bountyId}`);
        setIsCreator(creatorUserId === user?.user_id);
        
        const data = await response.json();
        setHasClaimed(data.hasClaimed);
        
      } catch (error) {
        console.error('Error checking claim status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkClaimStatus();
  }, [user?.user_id, bountyId, isInitialized, creatorUserId]);

  if (isLoading) {
    return (
      <div className="w-full py-3 px-4 bg-gray-800 text-gray-300 font-medium rounded-xl text-center flex items-center justify-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      </div>
    );
  }

  if (hasClaimed) {
    return (
      <div className="w-full py-3 px-4 bg-gray-800 text-gray-300 font-medium rounded-xl text-center border border-gray-700">
        Bounty Already Claimed
      </div>
    );
  }

  if (isCreator) {
    return (
      <div className="w-full py-3 px-4 bg-gray-800 text-gray-300 font-medium rounded-xl text-center border border-gray-700">
        Check your dashboard for information on this bounty
      </div>
    );
  }

  const handleClaimClick = () => {
    if (!user) {
      router.push(`/auth`);
      return;
    }
    setIsDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          bountyId,
          name: "Ruben",
          email: "rcuevas@alumni.stanford.edu",
          phoneNumber: "+16072422761",
          artists: [artistSeen],
          dateSeeing: eventDate,
          userId: user?.user_id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to claim bounty');
      }

      // Close drawer and refresh to show updated claim status
      setIsDrawerOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error claiming bounty:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to claim bounty');
      // We're keeping the drawer open so the user can see the error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClaimClick}
        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-md transform hover:-translate-y-0.5"
      >
        Claim Bounty
      </button>

      {/* Modal/Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800/70 rounded-xl w-full max-w-md p-8 relative shadow-2xl">
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <h3 className="text-xl font-bold text-blue-400 mb-6">Claim Bounty</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="artistSeen" className="block text-sm font-medium text-gray-300 mb-2">
                  Which artist will you be seeing?
                </label>
                <select
                  id="artistSeen"
                  value={artistSeen}
                  onChange={(e) => setArtistSeen(e.target.value)}
                  className="block w-full rounded-xl border border-gray-700 bg-gray-800 text-white py-3 px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 shadow-sm"
                  required
                >
                  <option value="" disabled>Select an artist</option>
                  {artists.map((artist) => (
                    <option key={artist} value={artist}>
                      {artist}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="eventDate" className="block text-sm font-medium text-gray-300 mb-2">
                  When will you be seeing them?
                </label>
                <input
                  type="date"
                  id="eventDate"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="block w-full rounded-xl border border-gray-700 bg-gray-800 text-white py-3 px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 shadow-sm"
                  required
                />
              </div>
              
              {submitError && (
                <div className="p-3 bg-red-900/40 border border-red-800/50 rounded-lg text-red-300 text-sm">
                  {submitError}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-6 ${
                  isSubmitting 
                    ? 'bg-gray-700 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500 transform hover:-translate-y-0.5'
                } text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Submit Claim'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}