
import Link from 'next/link'

type Bounty = {
  id: string
  artist: string
  trackTitle: string
  description: string | null
  supportingArtists: string[]
  reward: number
  proofImageUrls: string[]
  status: string
  createdAt: Date
  songUrl: string | null
  updatedAt: Date
  claimants: {
    id: string
    name: string
    status: string
  }[]
}

type Claim = {
  id: string;
  name: string;
  status: string;
};

export function ClaimCardDashboard({ bounty, claim }: { bounty: Bounty, claim: Claim }) {
  const formattedDate = new Date(bounty.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-900 text-green-300'
      case 'pending':
        return 'bg-yellow-900 text-yellow-300'
      case 'rejected':
        return 'bg-red-900 text-red-300'
      default:
        return 'bg-gray-900 text-gray-300'
    }
  }

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden hover:shadow-lg transition-shadow border border-gray-800">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-white">{bounty.trackTitle}</h3>
          <div className="flex gap-2">
            <span className={`${getStatusColor(bounty.status)} text-xs px-2 py-1 rounded-full font-medium`}>
              {bounty.status}
            </span>
            <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded-full font-medium">
              ${bounty.reward}
            </span>
          </div>
        </div>
        <p className="text-gray-300 mb-4">
          <span className="font-medium">Producer: </span>{bounty.artist}
        </p>
        
        {bounty.description && (
          <p className="text-gray-400 mb-4 line-clamp-2">{bounty.description}</p>
        )}
        
        {bounty.supportingArtists.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-1">Supported by:</p>
            <div className="flex flex-wrap gap-1">
              {bounty.supportingArtists.map((artist, index) => (
                <span 
                  key={index}
                  className="bg-blue-900 text-blue-300 text-xs px-2 py-1 rounded-full"
                >
                  {artist}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-400">{formattedDate}</span>
          <div className="flex gap-2">
            
            <Link 
              href={`/dashboard/claim/${claim.id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-500 transition"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}