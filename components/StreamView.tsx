import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
// @ts-expect-error - JSMpeg doesn't have TypeScript definitions
import JSMpeg from '@cycjimmy/jsmpeg-player';
import { useEffect } from 'react';

// Remove Image import since we don't need it anymore

interface StreamViewProps {
  stats?: {
    personCount: number;
    maleCount: number;
    femaleCount: number;
  };
}

const StreamView: React.FC<StreamViewProps> = ({ stats }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const streamContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<any>(null);
  const [streamType, setStreamType] = useState<'rtsp' | 'mjpg'>('rtsp');

  useEffect(() => {
    const wsUrl = 'ws://localhost:9999'; // Change this to switch between streams
    setStreamType(wsUrl.includes('9998') ? 'mjpg' : 'rtsp');

    if (wsUrl.includes('9999') && canvasRef.current) {
      console.log('Attempting to connect to RTSP WebSocket:', wsUrl);
      try {
        playerRef.current = new JSMpeg.Player(wsUrl + '/stream', {
          canvas: canvasRef.current,
          autoplay: true,
          audio: false,
          loop: true,
          onSourceEstablished: () => {
            console.log('Stream source established');
          },
          onSourceCompleted: () => {
            console.log('Stream source completed');
          },
          onError: (error: any) => {
            console.error('JSMpeg error:', error);
          }
        });
      } catch (error) {
        console.error('Error creating JSMpeg player:', error);
      }
    }

    return () => {
      if (playerRef.current) {
        console.log('Destroying player');
        playerRef.current.destroy();
      }
    };
  }, []);

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
      {streamType === 'rtsp' ? (
        <canvas 
          ref={canvasRef}
          className="w-full h-full"
        />
      ) : (
        <Image 
          src="https://webcam.privcom.ch/mjpg/video.mjpg"
          alt="Live Stream"
          className={`w-full h-full ${isFullScreen && window.innerWidth <= 1024 ? 'object-cover' : 'object-contain'}`}
          width={0}
          height={0}
          sizes="100vw"
          priority={true}
          unoptimized={true}
        />
      )}
      
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
      
      {/* Remove Image component since we're using canvas for the stream */}
      
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