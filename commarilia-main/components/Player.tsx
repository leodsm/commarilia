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
    fetchNextPage?: () => void;
    hasNextPage?: boolean;
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
    onOpenModal,
    isFirstCard
}: {
    segment: any,
    storyId: string,
    isActive: boolean,
    shouldLoad: boolean,
    onOpenModal: (id: string) => void,
    isFirstCard?: boolean
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
    const [showButtonText, setShowButtonText] = useState(false);

    useEffect(() => {
        if (isActive && isFirstCard) {
            setShowButtonText(true);
            const timer = setTimeout(() => {
                setShowButtonText(false);
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            setShowButtonText(false);
        }
    }, [isActive, isFirstCard]);

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

                </div>
            ) : segment?.mediaUrl ? (
                <>
                    {/* Foreground Image Layer - Full Canvas Setup (No more safe areas from top) */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src={segment.mediaUrl}
                            alt="Story Image"
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>
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

            {/* CTA Button Layer */}
            <div className={`absolute bottom-4 left-0 right-0 z-30 flex justify-center pointer-events-none pb-[env(safe-area-inset-bottom,0px)] transition-all duration-500`}>
                <div className="flex flex-col w-full items-center">
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

                                if (segment.slideLink) {
                                    window.open(segment.slideLink, '_blank');
                                } else {
                                    onOpenModal(storyId);
                                }
                            }}
                            className={`group/btn pointer-events-auto flex items-center justify-center cursor-pointer transition-[max-width,padding,gap,opacity] duration-500 ease-in-out bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full border border-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.6)] animate-slide-up overflow-hidden h-10 active:scale-95 ${showButtonText ? 'px-6 gap-2 max-w-[250px] opacity-100' : 'px-0 gap-0 max-w-[40px] opacity-80 hover:opacity-100 hover:max-w-[250px] hover:px-6 hover:gap-2'}`}
                            role="button"
                            aria-label={segment.slideLink ? "Abrir Link" : "Leia Mais"}
                        >
                            <span className={`text-white/90 group-hover/btn:text-white text-[11px] font-poppins font-bold uppercase tracking-[0.15em] leading-[14px] drop-shadow-md transition-all duration-500 ease-in-out whitespace-nowrap overflow-hidden origin-left ${showButtonText ? 'max-w-[150px] opacity-100' : 'max-w-0 opacity-0 group-hover/btn:max-w-[150px] group-hover/btn:opacity-100'}`}>
                                {segment.slideLink ? 'Acessar' : 'Leia Mais'}
                            </span>
                            <div className={`flex items-center justify-center min-w-[40px] animate-bounce transition-all duration-500 ease-in-out ${showButtonText ? '-mt-0.5' : 'mt-1 group-hover/btn:-mt-0.5'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor" className="w-3.5 h-3.5 text-[#fd572b] drop-shadow-sm">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                </svg>
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
    onStoryChange,
    fetchNextPage,
    hasNextPage
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
        
        // Fetch more if getting close to end
        if (fetchNextPage && hasNextPage && newIndex >= stories.length - 3) {
            fetchNextPage();
        }
    }, [stories, onStoryChange, fetchNextPage, hasNextPage]);

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
        <div className="w-full h-full bg-black relative group/player overflow-hidden">
            {currentStory && (
                <SEO
                    title={currentStory.title}
                    description={seoDescription}
                    image={currentStory.coverImage}
                    type="article"
                />
            )}

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center gap-4 bg-black/30 backdrop-blur-md border-b border-white/10 h-[54px] shadow-sm">
                {/* Logo & Back Button Section */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="h-8 flex flex-shrink-0 px-2 justify-center hover:px-3 hover:pr-4 items-center gap-0 hover:gap-1.5 rounded-full bg-white/10 hover:bg-[#fd572b] border border-white/10 hover:border-transparent transition-all duration-[400ms] active:scale-95 text-white/80 hover:text-white group overflow-hidden shadow-sm z-50 focus:outline-none"
                        aria-label="Voltar"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 md:w-3.5 md:h-3.5 flex-shrink-0 group-hover:-translate-x-0.5 transition-transform duration-[400ms]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                        <span className="text-[11px] font-poppins font-bold uppercase tracking-wider mt-[1px] max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:opacity-100 transition-all duration-[400ms] ease-in-out whitespace-nowrap">Voltar</span>
                    </button>
                    <h1
                        className="text-white text-xl font-poppins font-bold flex-shrink-0 cursor-pointer drop-shadow-sm hover:opacity-80 transition-opacity"
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
                                                isFirstCard={segIndex === 0}
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
