import { useEffect, useRef, useState } from 'react';

interface VideoBackgroundOptions {
  videoUrl?: string;
  videoUrlWebm?: string;
  fallbackImage?: string;
  autoplay?: string;
  loop?: string;
  muted?: string;
  playbackRate?: string;
  quality?: string;
  mobileBehavior?: string;
}

interface VideoBackgroundReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  isVideoLoaded: boolean;
  isVideoPlaying: boolean;
  isMobile: boolean;
  showVideo: boolean;
  showFallback: boolean;
  videoError: string | null;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
}

export const useVideoBackground = (options: VideoBackgroundOptions): VideoBackgroundReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Determine what to show based on settings and device
  const showVideo = () => {
    if (!options.videoUrl) return false;
    
    if (isMobile) {
      switch (options.mobileBehavior) {
        case 'video':
          return true;
        case 'fallback':
        case 'poster':
        case 'gradient':
          return false;
        default:
          return false; // Default to fallback on mobile
      }
    }
    
    return true; // Show video on desktop by default
  };

  const showFallback = () => {
    if (!showVideo() && options.fallbackImage) {
      return true;
    }
    if (videoError && options.fallbackImage) {
      return true;
    }
    return false;
  };

  // Video setup and event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !showVideo()) return;

    console.log('🎬 Setting up video background:', options.videoUrl);

    // Reset states
    setIsVideoLoaded(false);
    setIsVideoPlaying(false);
    setVideoError(null);

    // Configure video properties
    video.muted = options.muted !== 'false';
    video.loop = options.loop !== 'false';
    video.autoplay = options.autoplay !== 'false';
    video.playsInline = true; // Important for mobile
    video.preload = 'metadata';

    // Set playback rate
    if (options.playbackRate) {
      const rate = parseFloat(options.playbackRate);
      if (rate >= 0.25 && rate <= 2.0) {
        video.playbackRate = rate;
      }
    }

    // Quality optimization
    if (options.quality === 'low') {
      video.style.filter = 'blur(0.5px)'; // Slight blur for performance
    } else {
      video.style.filter = 'none';
    }

    // Event handlers
    const handleLoadedData = () => {
      console.log('✅ Video loaded successfully:', options.videoUrl);
      setIsVideoLoaded(true);
      setVideoError(null);
      
      // Auto-play logic
      if (options.autoplay !== 'false' && !isMobile || options.autoplay === 'true') {
        video.play().catch((error) => {
          console.warn('Video autoplay failed:', error);
          // Try muted autoplay
          video.muted = true;
          video.play().catch((err) => {
            console.warn('Muted autoplay also failed:', err);
            setVideoError('Autoplay failed - click to play');
          });
        });
      }
    };

    const handlePlay = () => {
      setIsVideoPlaying(true);
    };

    const handlePause = () => {
      setIsVideoPlaying(false);
    };

    const handleError = (e: Event) => {
      const error = (e.target as HTMLVideoElement).error;
      let errorMessage = 'Video failed to load';
      
      if (error) {
        switch (error.code) {
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error - check video URL';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Video format not supported';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Video source not supported - try MP4 format';
            break;
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Video loading aborted';
            break;
          default:
            errorMessage = `Video error: ${error.message}`;
        }
      }
      
      console.error('🎬 Video background error:', {
        url: options.videoUrl,
        error: error,
        message: errorMessage
      });
      
      setVideoError(errorMessage);
      setIsVideoLoaded(false);
    };

    const handleStalled = () => {
      console.warn('Video playback stalled - network issue possible');
    };

    const handleWaiting = () => {
      console.log('Video buffering...');
    };

    // Add event listeners
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('waiting', handleWaiting);

    // Load video sources
    const loadVideoSources = () => {
      // Clear existing sources
      video.innerHTML = '';

      // Add WebM source if available (better compression)
      if (options.videoUrlWebm) {
        const webmSource = document.createElement('source');
        webmSource.src = options.videoUrlWebm;
        webmSource.type = 'video/webm';
        video.appendChild(webmSource);
      }

      // Add MP4 source (broad compatibility)
      if (options.videoUrl) {
        const mp4Source = document.createElement('source');
        mp4Source.src = options.videoUrl;
        mp4Source.type = 'video/mp4';
        video.appendChild(mp4Source);
      }

      // Load the video
      video.load();
    };

    loadVideoSources();

    // Cleanup
    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('waiting', handleWaiting);
    };
  }, [
    options.videoUrl, 
    options.videoUrlWebm, 
    options.autoplay, 
    options.loop, 
    options.muted, 
    options.playbackRate, 
    options.quality,
    isMobile
  ]); // Only re-run when these specific values change

  // Control functions
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isVideoPlaying) {
      video.pause();
    } else {
      video.play().catch((error) => {
        console.warn('Manual play failed:', error);
        setVideoError('Play failed - please try again');
      });
    }
  };

  const setVolume = (volume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = Math.max(0, Math.min(1, volume));
    if (volume > 0) {
      video.muted = false;
    }
  };

  // Performance optimization: pause video when not in viewport
  useEffect(() => {
    const video = videoRef.current;
    const shouldShowVideo = showVideo();
    
    if (!video || !shouldShowVideo) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Video is visible - resume if autoplay is enabled
            if (options.autoplay !== 'false' && !isVideoPlaying) {
              video.play().catch(() => {
                // Ignore autoplay errors when coming back into view
              });
            }
          } else {
            // Video is not visible - pause to save bandwidth
            if (isVideoPlaying) {
              video.pause();
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [options.autoplay, options.videoUrl, isVideoPlaying, isMobile]); // Fixed dependencies

  return {
    videoRef,
    isVideoLoaded,
    isVideoPlaying,
    isMobile,
    showVideo: showVideo(),
    showFallback: showFallback(),
    videoError,
    togglePlayPause,
    setVolume
  };
}; 