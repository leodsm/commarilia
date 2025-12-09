import React, { useRef, useEffect, useState, useMemo } from 'react';
import { TransformedSegment } from '../../types';

interface SegmentSlideProps {
  segment: TransformedSegment;
  isActive: boolean; // Is this the active segment in the active story?
  onReadMore: () => void;
  hasStoryContent?: boolean;
}

export const SegmentSlide: React.FC<SegmentSlideProps> = ({ segment, isActive, onReadMore, hasStoryContent }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasReadableContent = useMemo(() => {
    const description = segment.descriptionHTML?.trim();
    return Boolean(description && description.length > 0) || Boolean(hasStoryContent);
  }, [segment.descriptionHTML, hasStoryContent]);

  // Reset loading state whenever the media changes
  useEffect(() => {
    setIsLoaded(false);
    if (segment.mediaType === 'video' && videoRef.current) {
      videoRef.current.load();
    }
  }, [segment.mediaType, segment.mediaUrl]);

  // Smart Video Handling: Only play when active to save resources
  useEffect(() => {
    if (segment.mediaType === 'video' && videoRef.current) {
      if (isActive) {
        // Reset time if coming back to it? Optional.
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Auto-play might be blocked
          });
        }
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive, segment.mediaType]);

  // Content Positioning Classes
  const positionClasses = {
    top: 'justify-start pt-20',
    center: 'justify-center',
    bottom: 'justify-end pb-16',
  };

  const textSizeClasses = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-3xl',
  };

  const getButtonPositionClasses = (position?: string) => {
    switch (position) {
      case 'top-left': return 'top-6 left-6';
      case 'top-center': return 'top-6 left-1/2 -translate-x-1/2';
      case 'top-right': return 'top-6 right-6';
      case 'center-left': return 'top-1/2 left-6 -translate-y-1/2';
      case 'center': return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      case 'center-right': return 'top-1/2 right-6 -translate-y-1/2';
      case 'bottom-left': return 'bottom-6 left-6';
      case 'bottom-center': return 'bottom-6 left-1/2 -translate-x-1/2';
      case 'bottom-right': return 'bottom-6 right-6';
      default: return 'bottom-6 right-6';
    }
  };

  const handleLoad = () => setIsLoaded(true);

  return (
    <div className="relative w-full h-full flex flex-col bg-black overflow-hidden">
      {/* Background Media */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        {!isLoaded && (
            <div className="absolute inset-0 bg-gray-900 animate-pulse flex items-center justify-center">
                {/* Optional Brand Loader Icon here */}
            </div>
        )}
        
        {segment.mediaType === 'video' ? (
          <video
            ref={videoRef}
            src={segment.mediaUrl}
            className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            muted
            loop
            playsInline
            autoPlay={isActive}
            preload="auto"
            onLoadedData={handleLoad}
          />
        ) : (
          <img
            src={segment.mediaUrl}
            alt={segment.title}
            className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={handleLoad}
          />
        )}
        
        {segment.showOverlay && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none" />
        )}
      </div>

      {/* Content Layer */}
      <div className={`relative z-10 w-full h-full flex flex-col px-6 ${positionClasses[segment.contentPosition]}`}>
        <div className="max-w-xl mx-auto w-full">
            {segment.title && (
            <h2 className={`font-poppins font-bold text-white mb-3 shadow-black drop-shadow-lg leading-tight ${textSizeClasses[segment.textSize]}`}>
                {segment.title}
            </h2>
            )}
            
            {segment.descriptionHTML && (
            <div 
                className="text-white/90 text-sm md:text-base font-inter drop-shadow-md mb-6 line-clamp-4 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: segment.descriptionHTML }}
            />
            )}
        </div>
      </div>

      {segment.showButton && hasReadableContent && (
        <div className={`absolute z-20 pointer-events-none ${getButtonPositionClasses(segment.buttonPosition)}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReadMore();
            }}
            className="flex items-center gap-3 rounded-full bg-white/15 text-white border border-white/40 px-4 py-2 backdrop-blur-md shadow-lg hover:bg-white/25 transition-all duration-200 pointer-events-auto"
          >
            <span className="text-base font-semibold">Leia Mais</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25 border border-white/40">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
