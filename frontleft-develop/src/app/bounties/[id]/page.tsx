import { getBountyById, getUserById } from '@/app/lib/db'
import { notFound, redirect } from 'next/navigation'
import { ClaimBountyButton } from './ClaimBountyButton'
import Link from 'next/link'

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function BountyPage({ params }: PageProps) {
  // Await the params Promise to get the ID
  const resolvedParams = await params;
  const bounty = await getBountyById(resolvedParams.id);
  
  if (!bounty) {
    notFound();
  }
  
  // Format the date to be more readable
  const formattedDate = new Date(bounty.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Bounty Details Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-8 mb-8 border border-blue-900/20 shadow-lg">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-3xl font-bold text-white">{bounty.trackTitle}</h1>
              <span className="bg-gradient-to-r from-blue-900/80 to-blue-900/60 text-blue-300 px-5 py-2 rounded-xl text-xl font-semibold shadow-sm border border-blue-800/30">
                ${bounty.reward}
              </span>
            </div>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2 text-blue-400">Producer</h2>
                <div className="text-white">{bounty.artist}</div>
              </div>
              
              {bounty.description && (
                <div>
                  <h2 className="text-xl font-semibold mb-2 text-blue-400">Description</h2>
                  <p className="text-gray-300">{bounty.description}</p>
                </div>
              )}
              
              {bounty.supportingArtists.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-2 text-blue-400">Supporting Artists</h2>
                  <div className="flex flex-wrap gap-3">
                    {bounty.supportingArtists.map((artist: string, index: number) => (
                      <span
                        key={index}
                        className="bg-blue-900/40 text-blue-300 px-4 py-2 rounded-full text-center border border-blue-800/30"
                      >
                        {artist}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h2 className="text-xl font-semibold mb-2 text-blue-400">Posted On</h2>
                <p className="text-gray-300">{formattedDate}</p>
              </div>
            </div>
          </div>
          
          {/* Claim Bounty Section */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-8 border border-blue-900/20 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-white">Get Paid</h2>
            <p className="text-gray-300 mb-6">Claim this bounty to access the track and get paid for uploading a video.</p>
            <ClaimBountyButton
              bountyId={bounty.id}
              artists={bounty.supportingArtists}
              creatorUserId={bounty.userId}
            />
          </div>
        </div>
      </div>
    </main>
  );
}