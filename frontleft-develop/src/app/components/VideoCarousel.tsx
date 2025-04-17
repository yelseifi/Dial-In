'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { ChevronLeft, ChevronRight, Award, Check, X } from 'lucide-react';

// Import ReactPlayer dynamically to avoid SSR issues
const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });

type VideoCarouselProps = {
  videos: string[];
  bountyId: string;
  claimIds: string[];
  sessionToken: string;
};

const VideoCarousel = ({ videos, bountyId, claimIds, sessionToken }: VideoCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirmingWinner, setConfirmingWinner] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  if (!videos || videos.length === 0) {
    return null;
  }

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? videos.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === videos.length - 1 ? 0 : prevIndex + 1));
  };

  const handleDeclareWinner = async (videoIndex: number) => {
    if (confirmingWinner === videoIndex) {
      setIsSubmitting(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/bounties/declare-winner`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`
          },
          body: JSON.stringify({
            bountyId,
            videoUrl: videos[videoIndex],
            claimId: claimIds[videoIndex]
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to declare winner');
        }
        
        setSuccess(`Winner successfully declared!`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to declare winner');
      } finally {
        setIsSubmitting(false);
        setConfirmingWinner(null);
      }
    } else {
      setConfirmingWinner(videoIndex);
    }
  };

  const cancelConfirmation = () => {
    setConfirmingWinner(null);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-8 border border-gray-800" ref={carouselRef}>
      
      {/* Error and Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-900/50 border border-green-700 rounded text-green-200">
          {success}
        </div>
      )}
      
      {/* Video Counter */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-400">
          Video {currentIndex + 1} of {videos.length}
        </p>
      </div>
      
      {/* Video Player */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-4">
        <ReactPlayer
          url={videos[currentIndex]}
          width="100%"
          height="100%"
          controls
          playsinline
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
                className: 'rounded-lg'
              },
              forceVideo: true
            }
          }}
          style={{ borderRadius: '0.5rem' }}
          onError={(e) => console.error("Video playback error:", e)}
        />
      </div>
      
      {/* Navigation Controls */}
      <div className="flex justify-between items-center mt-4">
        <button 
          className="bg-indigo-800 hover:bg-indigo-700 text-white rounded-full p-2"
          onClick={handlePrevious}
          aria-label="Previous video"
        >
          <ChevronLeft size={24} />
        </button>
        
        {confirmingWinner === currentIndex ? (
          <div className="flex space-x-2">
            <button
              className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
              onClick={() => handleDeclareWinner(currentIndex)}
              disabled={isSubmitting}
            >
              <Check size={16} className="mr-1" />
              {isSubmitting ? 'Confirming...' : 'Confirm Winner'}
            </button>
            <button
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center"
              onClick={cancelConfirmation}
              disabled={isSubmitting}
            >
              <X size={16} className="mr-1" />
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="bg-indigo-800 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
            onClick={() => handleDeclareWinner(currentIndex)}
            disabled={isSubmitting || success !== null}
          >
            <Award size={16} className="mr-2" />
            Choose this video
          </button>
        )}
        
        <button 
          className="bg-indigo-800 hover:bg-indigo-700 text-white rounded-full p-2"
          onClick={handleNext}
          aria-label="Next video"
        >
          <ChevronRight size={24} />
        </button>
      </div>
      
      {/* Dots Navigation */}
      {videos.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentIndex ? 'bg-indigo-600' : 'bg-gray-600'
              }`}
              aria-label={`Go to video ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoCarousel;