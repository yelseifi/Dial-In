import React from 'react';

export function BountyCardSkeleton() {
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 relative">
      <div className="p-6">
        {/* Title and reward */}
        <div className="flex justify-between items-start mb-3">
          <div className="h-6 bg-gray-800 rounded w-3/4 skeleton-shimmer"></div>
          <div className="h-6 bg-gray-800 rounded-full w-16 skeleton-shimmer"></div>
        </div>
        
        {/* Producer line */}
        <div className="h-5 bg-gray-800 rounded w-2/3 mb-4 skeleton-shimmer"></div>
        
        {/* Description */}
        <div className="h-4 bg-gray-800 rounded w-full mb-2 skeleton-shimmer"></div>
        <div className="h-4 bg-gray-800 rounded w-5/6 mb-4 skeleton-shimmer"></div>
        
        {/* Supporting artists */}
        <div className="mb-4">
          <div className="h-4 bg-gray-800 rounded w-1/3 mb-2 skeleton-shimmer"></div>
          <div className="flex flex-wrap gap-1">
            <div className="h-6 bg-gray-800 rounded-full w-16 skeleton-shimmer"></div>
            <div className="h-6 bg-gray-800 rounded-full w-20 skeleton-shimmer"></div>
            <div className="h-6 bg-gray-800 rounded-full w-14 skeleton-shimmer"></div>
          </div>
        </div>
        
        {/* Date and button */}
        <div className="flex justify-between items-center mt-4">
          <div className="h-4 bg-gray-800 rounded w-24 skeleton-shimmer"></div>
          <div className="h-9 bg-gray-800 rounded-lg w-28 skeleton-shimmer"></div>
        </div>
      </div>
      
      {/* Shimmer overlay */}
      <div className="absolute inset-0 skeleton-shimmer-effect"></div>
    </div>
  );
}

export function BountyCardSkeletonGrid() {
  return (
    <>
      {/* Add the shimmer effect CSS */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .skeleton-shimmer {
          position: relative;
          overflow: hidden;
        }
        
        .skeleton-shimmer-effect {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.05) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 1.5s infinite;
          pointer-events: none;
        }
      `}</style>
      
      {/* Grid of skeleton cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <BountyCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    </>
  );
}