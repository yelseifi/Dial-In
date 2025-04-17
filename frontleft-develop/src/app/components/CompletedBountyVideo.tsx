import { useState, useEffect } from "react";
import ReactPlayer from "react-player/lazy";
import { useStytchToken } from "../lib/useStytchToken";

export default function CompletedBountyVideo({ bountyId }: { bountyId: string }) {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const sessionToken = useStytchToken();
    useEffect(() => {
        const fetchWinningVideo = async () => {
            const response = await fetch(`/api/bounties/${bountyId}/winning-video`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionToken}`
                    }
                }
            );
            const data = await response.json();
            setVideoUrl(data.winningVideo.videoUrl);
        }
        fetchWinningVideo();
    }, [bountyId]); 
    
    return (
        <div>
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-4">
        <ReactPlayer
          url={videoUrl || ''}
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
        </div>
    )
}