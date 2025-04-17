import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

type BountyProps = {
  bounty: {
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
};

export const BountyCard = ({ bounty }: BountyProps) => {
  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <Link href={`/bounties/${bounty.id}`}>
      <div className="group h-full bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-6 border border-blue-900/20 hover:border-blue-600/40 transition-all duration-300 shadow-lg hover:shadow-blue-900/20 transform hover:-translate-y-1 overflow-hidden relative">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Track title */}
          <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors duration-300">{bounty.trackTitle}</h3>
          
          {/* Producer */}
          <p className="text-lg text-gray-300 mb-3 flex items-center">
            <span className="text-sm text-gray-500 mr-2">Producer:</span> 
            <span className="font-medium">{bounty.artist}</span>
          </p>
          
          {/* Description (if available) */}
          {bounty.description && (
            <p className="text-gray-400 mb-5 line-clamp-2">{bounty.description}</p>
          )}
          
          {/* Supporting artists */}
          {bounty.supportingArtists && bounty.supportingArtists.length > 0 && (
            <div className="mb-5">
              <p className="text-sm text-gray-500 mb-1">Supported by:</p>
              <div className="flex flex-wrap gap-2">
                {bounty.supportingArtists.map((artist, index) => (
                  <span 
                    key={index} 
                    className="text-xs bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full border border-blue-800/40"
                  >
                    {artist}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Bottom section with reward and date */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center">
              <span className="bg-emerald-600/20 text-emerald-400 px-3 py-1 rounded-lg font-medium border border-emerald-600/30">
                ${bounty.reward}
              </span>
            </div>
            <div className="text-gray-500 text-sm">
              {formatDate(bounty.createdAt)}
            </div>
          </div>
          
          {/* CTA button */}
          <div className="mt-5 flex justify-end">
            <button className="bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white px-4 py-2 rounded-lg transition-colors duration-300 text-sm font-medium border border-blue-600/30">
              Get Paid
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};