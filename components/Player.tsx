import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Mousewheel, FreeMode } from 'swiper/modules';
import { TransformedStory } from '../types';
import { Spinner } from './Loader';
// Import Swiper type for instance typing
import type { Swiper as SwiperType } from 'swiper';
import SEO from './SEO';

interface PlayerProps {
    stories: TransformedStory[];
    allCategories: string[]; // Receives full list regardless of filtering
    initialStoryId: string;
    onClose: () => void;
    onOpenModal: (storyId: string) => void;
    activeCategory: string;
    onCategoryChange: (cat: string) => void;
    isModalOpen: boolean;
    onStoryChange?: (storyId: string) => void;
}

// Helper to extract YouTube ID
const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// Helper to extract Vimeo ID
const getVimeoId = (url: string) => {
    if (!url) return null;
    // Regex to capture numeric ID from various Vimeo URL formats including /manage/videos/
    const regExp = /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|manage\/videos\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/i;
    const match = url.match(regExp);

    // Also try simple numeric check if the URL is just an ID (unlikely but possible)
    if (!match && /^\d+$/.test(url)) return url;

    return (match && match[1]) ? match[1] : null;
};

// Inner Component for individual segment (Media + Text)
const StorySegment = React.memo(({
    segment,
    storyId,
    isActive,
    shouldLoad,
    onOpenModal
}: {
    segment: any,
    storyId: string,
    isActive: boolean,
    shouldLoad: boolean,
    onOpenModal: (id: string) => void
}) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const isVideo = segment?.mediaType?.startsWith('video/') && segment.mediaType !== 'video/youtube' && segment.mediaType !== 'video/vimeo';
    const isYouTube = segment?.mediaType === 'video/youtube';
    const isVimeo = segment?.mediaType === 'video/vimeo';

    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    // Loading state for buffering feedback
    const [isLoading, setIsLoading] = useState(true);
    const [showButtonText, setShowButtonText] = useState(true);

    useEffect(() => {
        if (isActive) {
            setShowButtonText(true);
            const timer = setTimeout(() => {
                setShowButtonText(false);
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            setShowButtonText(true);
        }
    }, [isActive]);

    // Effect to handle Auto-Play, Auto-Pause and Preloading
    useEffect(() => {
        if (isYouTube && iframeRef.current) {
            if (isActive) {
                iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                setIsPlaying(true);
            } else {
                iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                setIsPlaying(false);
            }
        }

        if (isVimeo && iframeRef.current) {
            if (isActive) {
                iframeRef.current.contentWindow?.postMessage('{"method":"play"}', '*');
                setIsPlaying(true);
            } else {
                iframeRef.current.contentWindow?.postMessage('{"method":"pause"}', '*');
                setIsPlaying(false);
            }
        }

        if (!isVideo || !videoRef.current) return;

        if (isActive) {
            // Reset logic
            videoRef.current.currentTime = 0;
            videoRef.current.muted = true;
            // Force browser to load video data immediately
            videoRef.current.preload = "auto";

            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true);
                        setIsMuted(true);
                        // If playing started, we are not loading anymore (mostly)
                        // But we rely on events for accurate spinner control
                    })
                    .catch(error => {
                        // console.warn("Autoplay prevented:", error);
                        setIsPlaying(false);
                    });
            }
        } else {
            // Pause and stop buffering if possible (browser handles this)
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isActive, isVideo, isYouTube, isVimeo]);

    const togglePlay = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();

        if (isYouTube && iframeRef.current) {
            if (isPlaying) {
                iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                setIsPlaying(false);
            } else {
                iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                setIsPlaying(true);
            }
            return;
        }

        if (isVimeo && iframeRef.current) {
            if (isPlaying) {
                iframeRef.current.contentWindow?.postMessage('{"method":"pause"}', '*');
                setIsPlaying(false);
            } else {
                iframeRef.current.contentWindow?.postMessage('{"method":"play"}', '*');
                setIsPlaying(true);
            }
            return;
        }

        if (!videoRef.current) return;

        if (videoRef.current.paused) {
            videoRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(err => console.error("Play failed:", err));
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isYouTube, isVimeo, isPlaying]);

    const toggleMute = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();

        if (isYouTube && iframeRef.current) {
            if (isMuted) {
                iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"unMute","args":""}', '*');
                setIsMuted(false);
            } else {
                iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"mute","args":""}', '*');
                setIsMuted(true);
            }
            return;
        }

        if (isVimeo && iframeRef.current) {
            if (isMuted) {
                iframeRef.current.contentWindow?.postMessage('{"method":"setVolume", "value":1}', '*');
                setIsMuted(false);
            } else {
                iframeRef.current.contentWindow?.postMessage('{"method":"setVolume", "value":0}', '*');
                setIsMuted(true);
            }
            return;
        }

        if (!videoRef.current) return;

        const nextMuteState = !videoRef.current.muted;
        videoRef.current.muted = nextMuteState;
        setIsMuted(nextMuteState);
    }, [isYouTube, isVimeo, isMuted]);

    // Handlers for spinner visibility
    const handleVideoLoad = useCallback(() => setIsLoading(false), []);
    const handleVideoWaiting = useCallback(() => setIsLoading(true), []);

    // Position classes matching the reference logic
    const posClasses = {
        top: 'justify-start',
        center: 'justify-center',
        bottom: 'justify-end'
    };

    const textSizes = {
        small: 'text-xl lg:text-2xl',
        medium: 'text-2xl lg:text-3xl',
        large: 'text-3xl lg:text-4xl'
    };

    const descSizes = {
        small: 'text-xs lg:text-sm',
        medium: 'text-sm lg:text-base',
        large: 'text-base lg:text-lg'
    };

    const youTubeId = isYouTube ? getYouTubeId(segment.mediaUrl) : null;
    const vimeoId = isVimeo ? getVimeoId(segment.mediaUrl) : null;
    const showControls = isVideo || (isYouTube && youTubeId) || (isVimeo && vimeoId);

    return (
        <div className="relative w-full h-full overflow-hidden bg-black select-none">

            {/* Media Layer */}
            {isVideo && segment?.mediaUrl ? (
                shouldLoad ? (
                    <>
                        <video
                            ref={videoRef}
                            src={segment.mediaUrl}
                            className="absolute top-1/2 left-1/2 max-w-full max-h-full w-auto h-auto transform -translate-x-1/2 -translate-y-1/2 z-0 object-cover min-w-full min-h-full cursor-pointer"
                            playsInline
                            muted={true} // Initial state expected by browser for autoplay
                            loop
                            preload="auto" // Optimization: Load immediately
                            onClick={togglePlay}
                            onCanPlay={handleVideoLoad}
                            onWaiting={handleVideoWaiting}
                            onPlaying={handleVideoLoad}
                            aria-label="Video Player"
                        />

                        {/* Buffer Spinner */}
                        {(isLoading) && (
                            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                <Spinner />
                            </div>
                        )}
                    </>
                ) : (
                    /* Placeholder for Video */
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Spinner />
                    </div>
                )
            ) : isYouTube && youTubeId ? (
                <div className="absolute inset-0 w-full h-full bg-black">
                    {/* Overlay to block direct interaction with iframe so clicks go to togglePlay */}
                    <div
                        className="absolute inset-0 z-20 cursor-pointer"
                        onClick={togglePlay}
                    ></div>

                    {shouldLoad ? (
                        <iframe
                            ref={iframeRef}
                            className="w-full h-full absolute inset-0 pointer-events-auto z-10"
                            src={`https://www.youtube.com/embed/${youTubeId}?enablejsapi=1&autoplay=1&mute=1&controls=0&loop=1&playlist=${youTubeId}&playsinline=1&rel=0`}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        /* Placeholder for YouTube when not loaded (e.g. thumbnail) */
                        <div className="absolute inset-0 bg-black flex items-center justify-center">
                            <Spinner />
                        </div>
                    )}

                    {segment?.showOverlay && (
                        <div className="absolute inset-0 bg-black/20 pointer-events-none z-10"></div>
                    )}
                </div>
            ) : isVimeo && vimeoId ? (
                <div className="absolute inset-0 w-full h-full bg-black">
                    {/* Overlay to block direct interaction with iframe so clicks go to togglePlay */}
                    <div
                        className="absolute inset-0 z-20 cursor-pointer"
                        onClick={togglePlay}
                    ></div>

                    {shouldLoad ? (
                        <iframe
                            ref={iframeRef}
                            className="w-full h-full absolute inset-0 pointer-events-auto z-10"
                            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1&controls=0&loop=1&background=1`}
                            title="Vimeo video player"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        /* Placeholder for Vimeo */
                        <div className="absolute inset-0 bg-black flex items-center justify-center">
                            <Spinner />
                        </div>
                    )}

                    {segment?.showOverlay && (
                        <div className="absolute inset-0 bg-black/20 pointer-events-none z-10"></div>
                    )}
                </div>
            ) : segment?.mediaUrl ? (
                <>
                    {/* Background Blur Layer */}
                    <div
                        className="absolute inset-0 w-full h-full bg-cover bg-center blur-md scale-110 opacity-70"
                        style={{ backgroundImage: `url('${segment.mediaUrl}')` }}
                    ></div>

                    {/* Foreground Image Layer - Respects Header Space (top-[54px]) */}
                    <div className="absolute left-0 right-0 bottom-0 top-[54px] z-0">
                        <img
                            src={segment.mediaUrl}
                            alt={segment?.title}
                            className="w-full h-full object-contain"
                            loading="lazy"
                        />
                    </div>
                    {/* Optional Overlay from reference logic */}
                    {segment?.showOverlay && (
                        <div className="absolute left-0 right-0 bottom-0 top-[54px] bg-black/40 z-0"></div>
                    )}
                </>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/50">
                    Mídia indisponível
                </div>
            )}

            {/* Shared Controls Layer */}
            {showControls && (
                <div className="absolute top-[70px] right-4 z-50 flex flex-col gap-4 pointer-events-auto">
                    {/* Play/Pause Toggle */}
                    <button
                        onClick={togglePlay}
                        className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
                        aria-label={isPlaying ? "Pausar vídeo" : "Reproduzir vídeo"}
                    >
                        {!isPlaying ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                            </svg>
                        )}
                    </button>
                    {/* Mute Toggle */}
                    <button
                        onClick={toggleMute}
                        className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
                        aria-label={isMuted ? "Ativar som" : "Mudo"}
                    >
                        {isMuted ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                            </svg>
                        )}
                    </button>
                </div>
            )}

            {/* Content Layer */}
            <div className={`absolute inset-0 z-20 px-6 pt-[70px] pb-6 flex flex-col ${posClasses[segment?.contentPosition as keyof typeof posClasses] || posClasses.bottom} ${segment?.contentPosition === 'bottom' ? 'pb-12' : ''} text-left pointer-events-none`}>
                <div className="flex flex-col gap-3 max-w-2xl mx-auto w-full">
                    <div className="flex flex-col gap-2">
                        {segment?.title && (
                            <h2 className="font-gotham font-bold text-white text-shadow leading-[32px] tracking-[-0.04em] text-[30px]">
                                {segment.title}
                            </h2>
                        )}

                        {segment?.description && (
                            <div
                                className="text-shadow text-white/90 font-gotham font-light leading-normal tracking-[-0.04em] text-[17px]"
                                dangerouslySetInnerHTML={{ __html: segment.description }}
                            />
                        )}
                    </div>

                    {segment?.showButton && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                // Pause video logic
                                if (isYouTube && iframeRef.current) {
                                    iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                                } else if (isVimeo && iframeRef.current) {
                                    iframeRef.current.contentWindow?.postMessage('{"method":"pause"}', '*');
                                } else if (videoRef.current) {
                                    videoRef.current.pause();
                                }
                                setIsPlaying(false);

                                onOpenModal(storyId);
                            }}
                            className={`group/btn flex flex-col items-center justify-center gap-2 cursor-pointer animate-slide-up transition-all duration-300 hover:scale-105 self-center pointer-events-auto ${segment?.contentPosition === 'bottom' ? 'mb-12' : ''}`}
                            role="button"
                            aria-label="Leia Mais"
                        >
                            {/* Circle Icon Container */}
                            <div className={`w-10 h-10 rounded-full border-[1.5px] border-white flex items-center justify-center transition-all duration-500 bg-black/10 backdrop-blur-[2px] shadow-sm group-hover/btn:bg-white/20 group-hover/btn:border-white ${!showButtonText ? 'opacity-80 hover:opacity-100 scale-90 hover:scale-100' : ''}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white translate-y-[1px] group-hover/btn:-translate-y-0.5 transition-transform duration-300">
                                    <path fillRule="evenodd" d="M11.47 7.72a.75.75 0 011.06 0l7.5 7.5a.75.75 0 11-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 01-1.06-1.06l7.5-7.5z" clipRule="evenodd" />
                                </svg>
                            </div>

                            {/* Text with fade out transition */}
                            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showButtonText ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <span className="text-white text-[13px] font-gotham font-medium tracking-wide drop-shadow-md whitespace-nowrap">
                                    Leia Mais
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

const Player: React.FC<PlayerProps> = ({
    stories,
    allCategories,
    initialStoryId,
    onClose,
    onOpenModal,
    activeCategory,
    onCategoryChange,
    isModalOpen,
    onStoryChange
}) => {
    const [swiperReady, setSwiperReady] = useState(false);
    const [verticalSwiper, setVerticalSwiper] = useState<SwiperType | null>(null);

    // Track horizontal swiper instances by story index
    const horizontalSwipersRef = useRef<{ [key: number]: SwiperType }>({});

    const initialIndex = stories.findIndex(s => s.id === initialStoryId);
    const safeInitialIndex = initialIndex >= 0 ? initialIndex : 0;

    const [activeStoryIndex, setActiveStoryIndex] = useState(safeInitialIndex);
    const [activeSegmentIndices, setActiveSegmentIndices] = useState<{ [key: number]: number }>({});

    // Derive current story and segment
    const currentStory = stories[activeStoryIndex];
    // const currentSegmentIndex = activeSegmentIndices[activeStoryIndex] || 0;

    // Sync activeStoryId state with activeIndex
    useEffect(() => {
        if (currentStory && onStoryChange) {
            onStoryChange(currentStory.id);
        }
    }, [currentStory, onStoryChange]);

    // -- SEO --
    // Use currentStory.content (HTML) to extract a snippet? Or just use "Assista agora no ComMarília".
    const seoDescription = currentStory?.title
        ? `Assista "${currentStory.title}" e outras notícias em vídeo no ComMarília.`
        : undefined;

    // Optimized Handlers
    const handleSwiperInit = useCallback((swiper: SwiperType) => {
        setSwiperReady(true);
        setVerticalSwiper(swiper);
    }, []);

    const handleSlideChange = useCallback((swiper: SwiperType) => {
        const newIndex = swiper.activeIndex;
        setActiveStoryIndex(newIndex);

        // Notify parent to update URL for deep linking
        if (stories[newIndex]) {
            // We need a way to call `setActiveStoryId` in App. 
            // Since we didn't add a prop for it, let's just update the URL directly here or add the prop?
            // Adding the prop is cleaner. Let's assume I will add `onStoryChange` to PlayerProps.
            if (onStoryChange) onStoryChange(stories[newIndex].id);
        }
    }, [stories, onStoryChange]);

    const handleHorizontalSwiperInit = useCallback((storyIndex: number) => (swiper: SwiperType) => {
        horizontalSwipersRef.current[storyIndex] = swiper;
    }, []);

    const handleHorizontalSlideChange = useCallback((storyIndex: number) => (swiper: SwiperType) => {
        setActiveSegmentIndices(prev => ({
            ...prev,
            [storyIndex]: swiper.activeIndex
        }));
    }, []);

    // --- Keyboard Navigation Logic ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isModalOpen) return;

            // Vertical Navigation (Stories)
            if (e.key === 'ArrowUp' && verticalSwiper) {
                verticalSwiper.slidePrev();
            }
            else if (e.key === 'ArrowDown' && verticalSwiper) {
                verticalSwiper.slideNext();
            }
            // Horizontal Navigation (Segments inside a story)
            else if (e.key === 'ArrowLeft') {
                const currentHSwiper = horizontalSwipersRef.current[activeStoryIndex];
                if (currentHSwiper) currentHSwiper.slidePrev();
            }
            else if (e.key === 'ArrowRight') {
                const currentHSwiper = horizontalSwipersRef.current[activeStoryIndex];
                if (currentHSwiper) currentHSwiper.slideNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [verticalSwiper, activeStoryIndex, isModalOpen]);

    return (
        <div className="w-full h-full bg-black relative group/player">
            {currentStory && (
                <SEO
                    title={currentStory.title}
                    description={seoDescription}
                    image={currentStory.coverImage}
                    type="article"
                />
            )}

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center gap-4 bg-black/30 h-[54px]">
                {/* Logo Section */}
                {/* Logo & Back Button Section */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 md:w-[30px] md:h-[30px] flex items-center justify-center rounded-full group focus:outline-none z-50 hover:bg-white/10 md:bg-black/20 md:backdrop-blur-sm md:hover:bg-black/40 transition-all duration-300 aspect-square"
                        aria-label="Fechar"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 md:w-4 md:h-4 text-white/80 group-hover:text-white transition-colors">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h1
                        className="text-white text-xl font-poppins font-bold flex-shrink-0 cursor-pointer shadow-sm hover:opacity-80 transition-opacity"
                        onClick={onClose}
                    >
                        Com<span className="text-[#fd572b]">Marília</span>
                    </h1>
                </div>

                {/* Categories Swiper with Mousewheel & Drag */}
                {/* Categories Swiper with Mousewheel & Drag */}
                <div className="flex-grow min-w-0 mask-gradient" style={{ overflow: 'hidden' }}>
                    <Swiper
                        modules={[FreeMode, Mousewheel]}
                        slidesPerView="auto"
                        spaceBetween={10}
                        freeMode={{
                            enabled: true,
                            sticky: true,
                            momentumRatio: 0.25,
                        }}
                        grabCursor={true}
                        simulateTouch={true}
                        mousewheel={{
                            forceToAxis: true,
                            sensitivity: 0.5,
                            releaseOnEdges: true
                        }}
                        className="w-full h-full"
                    >
                        {allCategories.map(cat => (
                            <SwiperSlide key={cat} className="!w-auto flex items-center">
                                <button
                                    onClick={() => onCategoryChange(cat)}
                                    className={`category-link inline-block text-white/80 text-xs py-1 px-3 rounded-full bg-white/10 backdrop-blur-sm transition-all duration-300 cursor-pointer ${activeCategory === cat ? 'active' : ''}`}
                                    aria-label={`Filtrar por categoria: ${cat}`}
                                    aria-pressed={activeCategory === cat}
                                >
                                    {cat}
                                </button>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

            </div>

            {/* Loading State */}
            {
                !swiperReady && (
                    <div className="absolute inset-0 flex items-center justify-center z-40 bg-black">
                        <Spinner />
                    </div>
                )
            }

            {/* Main Vertical Swiper */}
            <Swiper
                modules={[Mousewheel]}
                direction="vertical"
                className="w-full h-full"
                initialSlide={safeInitialIndex}
                onSwiper={handleSwiperInit}
                onSlideChange={handleSlideChange}
                mousewheel={{ enabled: !isModalOpen }}
                threshold={10}
            >
                {stories.map((story, storyIndex) => (
                    <SwiperSlide key={story.id} className="w-full h-full bg-black">
                        {/* Optimization: Only render if close to viewport */}
                        {Math.abs(activeStoryIndex - storyIndex) <= 1 ? (
                            /* Horizontal Swiper for Segments */
                            <Swiper
                                modules={[Pagination]}
                                direction="horizontal"
                                className="w-full h-full"
                                pagination={{
                                    clickable: true,
                                    // dynamicBullets removed to fix visibility issues
                                }}
                                nested={true}
                                onSwiper={handleHorizontalSwiperInit(storyIndex)}
                                onSlideChange={handleHorizontalSlideChange(storyIndex)}
                            >
                                {story.segments.map((segment, segIndex) => {
                                    const isStoryActive = storyIndex === activeStoryIndex;
                                    const currentSegIndex = activeSegmentIndices[storyIndex] || 0;
                                    const isSegmentActive = isStoryActive && segIndex === currentSegIndex;
                                    // Load if active or adjacent (prev/next)
                                    const shouldLoad = Math.abs(currentSegIndex - segIndex) <= 1;

                                    return (
                                        <SwiperSlide key={segment.id}>
                                            <StorySegment
                                                segment={segment}
                                                storyId={story.id}
                                                isActive={isSegmentActive}
                                                shouldLoad={shouldLoad}
                                                onOpenModal={onOpenModal}
                                            />
                                        </SwiperSlide>
                                    );
                                })}
                            </Swiper>
                        ) : null}
                    </SwiperSlide>
                ))}
            </Swiper>
        </div >
    );
};

export default Player;
