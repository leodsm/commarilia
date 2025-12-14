import React, { useRef, useEffect, useState } from 'react';
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
const StorySegment = ({
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
    const isVideo = segment.mediaType.startsWith('video/');

    useEffect(() => {
        if (isVideo && videoRef.current) {
            if (isActive) {
                videoRef.current.currentTime = 0;
                videoRef.current.play().catch(e => console.log('Autoplay prevented', e));
            } else {
                videoRef.current.pause();
            }
        }
    }, [isActive, isVideo]);

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
                <video
                    ref={videoRef}
                    src={segment.mediaUrl}
                    className="absolute top-1/2 left-1/2 max-w-full max-h-full w-auto h-auto transform -translate-x-1/2 -translate-y-1/2 z-0 object-cover min-w-full min-h-full"
                    playsInline
                    muted // Always muted as per original design
                    loop
                />
            ) : (
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
                            alt={segment.title}
                            className="w-full h-full object-contain"
                            loading="lazy"
                        />
                    </div>
                    {/* Optional Overlay from reference logic */}
                    {segment.showOverlay && (
                        <div className="absolute left-0 right-0 bottom-0 top-[54px] bg-black/40 z-0"></div>
                    )}
                </>
            )}

            {/* Content Layer */}
            <div className={`absolute inset-0 z-20 px-6 pt-[70px] pb-6 flex flex-col ${posClasses[segment.contentPosition as keyof typeof posClasses] || posClasses.bottom} ${segment.contentPosition === 'bottom' ? 'pb-12' : ''} text-left pointer-events-none`}>
                <div className="flex flex-col gap-3 max-w-2xl mx-auto w-full">
                    <div className="flex flex-col gap-2">
                        {segment.title && (
                            <h2 className={`font-poppins font-bold text-white text-shadow leading-tight ${textSizes[segment.textSize as keyof typeof textSizes]}`}>
                                {segment.title}
                            </h2>
                        )}

                        {segment.description && (
                            <div
                                className={`text-shadow text-white/90 font-medium leading-relaxed ${descSizes[segment.textSize as keyof typeof textSizes] || descSizes.medium}`}
                                dangerouslySetInnerHTML={{ __html: segment.description }}
                            />
                        )}
                    </div>

                    {segment.showButton && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenModal(storyId);
                            }}
                            className={`btn-glass self-start hover:scale-105 pointer-events-auto ${segment.contentPosition === 'bottom' ? 'mb-[50px]' : ''}`}
                        >
                            Leia Mais
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

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
                onSwiper={(swiper) => {
                    setSwiperReady(true);
                    setVerticalSwiper(swiper);
                }}
                onSlideChange={(swiper) => setActiveStoryIndex(swiper.activeIndex)}
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
                                onSwiper={(swiper) => {
                                    // Save instance reference for keyboard control
                                    horizontalSwipersRef.current[storyIndex] = swiper;
                                }}
                                onSlideChange={(swiper) => {
                                    setActiveSegmentIndices(prev => ({
                                        ...prev,
                                        [storyIndex]: swiper.activeIndex
                                    }));
                                }}
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