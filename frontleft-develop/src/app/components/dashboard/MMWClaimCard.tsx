import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

type Claim = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  artists?: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

type MMWClaimCardProps = {
  claim: Claim;
};

export function MMWClaimCard({ claim }: MMWClaimCardProps) {
  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Map status to appropriate colors
  const getStatusStyles = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; border: string }> = {
      pending: { bg: "bg-yellow-600/20", text: "text-yellow-400", border: "border-yellow-600/30" },
      approved: { bg: "bg-emerald-600/20", text: "text-emerald-400", border: "border-emerald-600/30" },
      rejected: { bg: "bg-red-600/20", text: "text-red-400", border: "border-red-600/30" },
      claimed: { bg: "bg-blue-600/20", text: "text-blue-400", border: "border-blue-600/30" },
    };

    return statusMap[status.toLowerCase()] || { bg: "bg-gray-600/20", text: "text-gray-400", border: "border-gray-600/30" };
  };

  const statusStyles = getStatusStyles(claim.status);

  return (
  
      <div className="group h-full bg-gray-900 rounded-2xl p-6 border border-indigo-900/20 hover:border-indigo-600/40 transition-all duration-300 shadow-lg hover:shadow-indigo-900/20 transform hover:-translate-y-1 overflow-hidden relative">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-violet-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Claim name/title */}
          <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-indigo-400 transition-colors duration-300">
            {claim.name}
          </h3>
          
          {/* Email */}
          <p className="text-gray-300 mb-3 flex items-center">
            <span className="text-sm text-gray-500 mr-2">Email:</span>
            <span className="font-medium">{claim.email}</span>
          </p>
          
          {/* Phone Number */}
          <p className="text-gray-300 mb-3 flex items-center">
            <span className="text-sm text-gray-500 mr-2">Phone:</span>
            <span className="font-medium">{claim.phoneNumber}</span>
          </p>

          <p className="text-gray-300 mb-3 flex items-center">
            <span className="text-sm text-gray-500 mr-2">Artist:</span>
            <span className="font-medium">{claim.artists?.at(0)}</span>
          </p>
          
          
          {/* Bottom section with status and date */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center">
              <span className={`${statusStyles.bg} ${statusStyles.text} px-3 py-1 rounded-lg font-medium border ${statusStyles.border}`}>
                {claim.status}
              </span>
            </div>
            {claim.createdAt && (
              <div className="text-gray-500 text-sm">
                {formatDate(claim.createdAt)}
              </div>
            )}
          </div>
          
         
        </div>
      </div>
  );
}