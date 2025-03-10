import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
interface StreamViewProps {
  streamUrl: string;
  stats?: {
    personCount: number;
    maleCount: number;
    femaleCount: number;
  };
}

const StreamView: React.FC<StreamViewProps> = ({ streamUrl, stats }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const streamContainerRef = useRef<HTMLDivElement>(null);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      streamContainerRef.current?.requestFullscreen().then(() => {
        setIsFullScreen(true);
        
        // Force landscape orientation on mobile devices
        if (window.screen.orientation && window.innerWidth <= 1024) {
          try {
            // Cast to any to handle the lock method
            (window.screen.orientation as any).lock('landscape').catch((err: Error) => {
              console.error(`Error attempting to lock orientation: ${err.message}`);
            });
          } catch (err) {
            console.error(`Orientation API not supported: ${err}`);
          }
        }
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      // Exit fullscreen
      document.exitFullscreen().then(() => {
        setIsFullScreen(false);
        
        // Release orientation lock when exiting fullscreen
        if (window.screen.orientation && window.innerWidth <= 1024) {
          try {
            window.screen.orientation.unlock();
          } catch (err) {
            console.error(`Error unlocking orientation: ${err}`);
          }
        }
      }).catch(err => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };

  // Listen for fullscreen change events (e.g., when user presses Esc)
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const isInFullScreen = !!document.fullscreenElement;
      setIsFullScreen(isInFullScreen);
      
      // Handle orientation when fullscreen is exited unexpectedly (e.g., by pressing Esc)
      if (!isInFullScreen && window.screen.orientation && window.innerWidth <= 1024) {
        try {
          window.screen.orientation.unlock();
        } catch (err) {
          console.error(`Error unlocking orientation: ${err}`);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div 
      ref={streamContainerRef}
      className="w-full h-full rounded-lg overflow-hidden bg-black relative shadow-modern border border-accent/20 hover-scale"
    >
      <div className="absolute top-0 left-0 w-full p-3 glass-effect z-10 flex justify-between items-center">
        <h3 className="text-green-500 font-medium">Live Stream</h3>
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
      </div>
      
      {/* Stats overlay in fullscreen mode */}
      {isFullScreen && stats && (
        <div className="absolute top-16 right-4 z-20 bg-background/80 p-4 rounded-lg shadow-modern border border-primary/20 max-w-xs">
          <h3 className="text-lg font-bold text-primary mb-2">Statistics</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-sm font-medium text-secondary">Person Count:</p>
              <p className="text-sm font-bold text-white">{stats.personCount}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm font-medium text-secondary">Male Count:</p>
              <p className="text-sm font-bold text-white">{stats.maleCount}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm font-medium text-secondary">Female Count:</p>
              <p className="text-sm font-bold text-white">{stats.femaleCount}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* <img 
        src={streamUrl} 
        alt="Live Stream"
        className={`w-full h-full ${isFullScreen && window.innerWidth <= 1024 ? 'object-cover' : 'object-contain'}`}
      /> */}
      <Image 
        src="http://localhost:8000/video-feed" 
        alt="Live Stream"
        className={`w-full h-full ${isFullScreen && window.innerWidth <= 1024 ? 'object-cover' : 'object-contain'}`}
        width={0}  // Allows width to be controlled by CSS
        height={0} // Allows height to be controlled by CSS
        sizes="100vw" // Ensures responsive scaling
        priority={true} // Preload for live stream
        unoptimized={true} // Important for MJPG streams
      />
      
      {/* Fullscreen button */}
      <div className="absolute bottom-4 right-4 z-10">
        <Button 
          onClick={toggleFullScreen} 
          variant="secondary" 
          size="icon"
          className="bg-background/60 hover:bg-background/80 text-white rounded-full h-10 w-10 flex items-center justify-center shadow-lg"
        >
          {isFullScreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          )}
        </Button>
      </div>
    </div>
  );
};

export default StreamView;