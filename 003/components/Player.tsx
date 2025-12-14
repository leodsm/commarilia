import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Mousewheel, FreeMode } from 'swiper/modules';
import { TransformedStory } from '../types';
import { Spinner } from './Loader';
// Import Swiper type for instance typing
import type { Swiper as SwiperType } from 'swiper';

interface PlayerProps {
    stories: TransformedStory[];
    allCategories: string[]; // Receives full list regardless of filtering
    initialStoryId: string;
    onClose: () => void;
    onOpenModal: (storyId: string) => void;
    activeCategory: string;
    onCategoryChange: (cat: string) => void;
    isModalOpen: boolean;
}

// Inner Component for individual segment (Media + Text)
const StorySegment = React.memo(({
    segment,
    storyId,
    isActive,
    onOpenModal
}: {
    segment: any,
    storyId: string,
    isActive: boolean,
    onOpenModal: (id: string) => void
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const isVideo = segment?.mediaType?.startsWith('video/');

    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);

    // Effect to handle Auto-Play and Auto-Pause based on slide activity
    useEffect(() => {
        if (!isVideo || !videoRef.current) return;

        if (isActive) {
            // When taking focus: Reset to beginning, mute, and play
            videoRef.current.currentTime = 0;
            videoRef.current.muted = true;

            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true);
                        setIsMuted(true);
                    })
                    .catch(error => {
                        // console.warn("Autoplay prevented:", error);
                        setIsPlaying(false);
                    });
            }
        } else {
            // When losing focus: Pause
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isActive, isVideo]);

    const togglePlay = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (!videoRef.current) return;

        if (videoRef.current.paused) {
            videoRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(err => console.error("Play failed:", err));
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, []);

    const toggleMute = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (!videoRef.current) return;

        const nextMuteState = !videoRef.current.muted;
        videoRef.current.muted = nextMuteState;
        setIsMuted(nextMuteState);
    }, []);

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

    return (
        <div className="relative w-full h-full overflow-hidden bg-black select-none">

            {/* Media Layer */}
            {isVideo ? (
                <>
                    <video
                        ref={videoRef}
                        src={segment?.mediaUrl}
                        className="absolute top-1/2 left-1/2 max-w-full max-h-full w-auto h-auto transform -translate-x-1/2 -translate-y-1/2 z-0 object-cover min-w-full min-h-full cursor-pointer"
                        playsInline
                        muted={true} // Initial state expected by browser for autoplay
                        loop
                        onClick={togglePlay}
                        aria-label="Video Player"
                    />

                    {/* Controls Layer */}
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
                </>
            ) : (
                <>
                    {/* Background Blur Layer */}
                    <div
                        className="absolute inset-0 w-full h-full bg-cover bg-center blur-md scale-110 opacity-70"
                        style={{ backgroundImage: `url('${segment?.mediaUrl}')` }}
                    ></div>

                    {/* Foreground Image Layer - Respects Header Space (top-[54px]) */}
                    <div className="absolute left-0 right-0 bottom-0 top-[54px] z-0">
                        <img
                            src={segment?.mediaUrl}
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
            )}

            {/* Content Layer */}
            <div className={`absolute inset-0 z-20 px-6 pt-[70px] pb-6 flex flex-col ${posClasses[segment?.contentPosition as keyof typeof posClasses] || posClasses.bottom} ${segment?.contentPosition === 'bottom' ? 'pb-12' : ''} text-left pointer-events-none`}>
                <div className="flex flex-col gap-3 max-w-2xl mx-auto w-full">
                    <div className="flex flex-col gap-2">
                        {segment?.title && (
                            <h2 className={`font-poppins font-bold text-white text-shadow leading-tight ${textSizes[segment?.textSize as keyof typeof textSizes]}`}>
                                {segment.title}
                            </h2>
                        )}

                        {segment?.description && (
                            <div
                                className={`text-shadow text-white/90 font-medium leading-relaxed ${descSizes[segment?.textSize as keyof typeof textSizes] || descSizes.medium}`}
                                dangerouslySetInnerHTML={{ __html: segment.description }}
                            />
                        )}
                    </div>

                    {segment?.showButton && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenModal(storyId);
                            }}
                            className={`btn-glass self-start hover:scale-105 pointer-events-auto ${segment?.contentPosition === 'bottom' ? 'mb-[50px]' : ''}`}
                            aria-label="Leia Mais"
                        >
                            Leia Mais
                        </button>
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
    isModalOpen
}) => {
    const [swiperReady, setSwiperReady] = useState(false);
    const [verticalSwiper, setVerticalSwiper] = useState<SwiperType | null>(null);

    // Track horizontal swiper instances by story index
    const horizontalSwipersRef = useRef<{ [key: number]: SwiperType }>({});

    const initialIndex = stories.findIndex(s => s.id === initialStoryId);
    const safeInitialIndex = initialIndex >= 0 ? initialIndex : 0;

    const [activeStoryIndex, setActiveStoryIndex] = useState(safeInitialIndex);
    const [activeSegmentIndices, setActiveSegmentIndices] = useState<{ [key: number]: number }>({});

    // Optimized Handlers
    const handleSwiperInit = useCallback((swiper: SwiperType) => {
        setSwiperReady(true);
        setVerticalSwiper(swiper);
    }, []);

    const handleSlideChange = useCallback((swiper: SwiperType) => {
        setActiveStoryIndex(swiper.activeIndex);
    }, []);

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

                                    return (
                                        <SwiperSlide key={segment.id}>
                                            <StorySegment
                                                segment={segment}
                                                storyId={story.id}
                                                isActive={isSegmentActive}
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