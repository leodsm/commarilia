import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Virtual } from 'swiper/modules';
import { Swiper as SwiperClass } from 'swiper/types';
import { useNavigate, Link } from 'react-router-dom';

import { TransformedStory } from '../../types';
import { SegmentSlide } from './SegmentSlide';
import { Modal } from '../ui/Modal';
import { Skeleton } from '../ui/Skeleton';

interface StoryViewerProps {
  stories: TransformedStory[];
  initialStoryId?: string;
  initialSegmentId?: string;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ stories, initialStoryId, initialSegmentId }) => {
  const navigate = useNavigate();
  
  // Find initial indices
  const startStoryIndex = Math.max(0, stories.findIndex(s => s.id === initialStoryId));
  
  // State
  const [activeStoryIndex, setActiveStoryIndex] = useState(startStoryIndex);
  const [activeSegmentIndices, setActiveSegmentIndices] = useState<number[]>(new Array(stories.length).fill(0));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(null);
  const horizontalSwiperRefs = useRef<{ [key: number]: SwiperClass }>({});

  // Derive categories for header
  const categories = useMemo(() => {
    const cats = new Set(stories.map(s => s.category));
    return ['Todas', ...Array.from(cats)];
  }, [stories]);

  // Initialize specific segment if provided (Only on mount)
  useEffect(() => {
    if (initialStoryId && initialSegmentId) {
        const sIndex = stories.findIndex(s => s.id === initialStoryId);
        if (sIndex !== -1) {
             const segIndex = stories[sIndex].segments.findIndex(seg => seg.id === initialSegmentId);
             if (segIndex !== -1) {
                 const newIndices = [...activeSegmentIndices];
                 newIndices[sIndex] = segIndex;
                 setActiveSegmentIndices(newIndices);
             }
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once

  // Update URL on change
  useEffect(() => {
    if (!stories[activeStoryIndex]) return;
    
    const story = stories[activeStoryIndex];
    const segmentIndex = activeSegmentIndices[activeStoryIndex];
    const segment = story.segments[segmentIndex];
    
    if (story && segment) {
        // Replace current history entry to allow "Back" to go to Home, not previous slide
        navigate(`/player?story=${story.id}&segment=${segment.id}`, { replace: true });
    }
  }, [activeStoryIndex, activeSegmentIndices, stories, navigate]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (isModalOpen) return;
        
        // Ignore if active element is input/textarea
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            return;
        }

        switch (e.key) {
            case 'ArrowUp':
                swiperInstance?.slidePrev();
                break;
            case 'ArrowDown':
                swiperInstance?.slideNext();
                break;
            case 'ArrowLeft':
                if (horizontalSwiperRefs.current[activeStoryIndex]) {
                    horizontalSwiperRefs.current[activeStoryIndex].slidePrev();
                }
                break;
            case 'ArrowRight':
                if (horizontalSwiperRefs.current[activeStoryIndex]) {
                    horizontalSwiperRefs.current[activeStoryIndex].slideNext();
                }
                break;
            case 'Escape':
                navigate('/');
                break;
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [swiperInstance, activeStoryIndex, isModalOpen, navigate]);

  const handleVerticalSlideChange = (swiper: SwiperClass) => {
    setActiveStoryIndex(swiper.activeIndex);
  };

  const handleHorizontalSlideChange = (storyIndex: number, swiper: SwiperClass) => {
    const newIndices = [...activeSegmentIndices];
    newIndices[storyIndex] = swiper.activeIndex;
    setActiveSegmentIndices(newIndices);
  };

  const handleHorizontalTouchEnd = (swiper: SwiperClass) => {
    if (!swiperInstance) return;
    // Reduced threshold for easier navigation between stories
    const SWIPE_THRESHOLD = 30; 
    const { diff } = swiper.touches;

    if (swiper.isEnd && diff < -SWIPE_THRESHOLD) {
        swiperInstance.slideNext();
    }
    if (swiper.isBeginning && diff > SWIPE_THRESHOLD) {
        swiperInstance.slidePrev();
    }
  };

  const activeStory = stories[activeStoryIndex];
  const modalImage = activeStory?.image;

  if (!stories.length) return <div className="h-screen bg-black flex items-center justify-center text-white">Carregando Stories...</div>;

  return (
    <div className="w-full h-[100dvh] bg-gray-50 flex flex-col items-center justify-center overflow-hidden">
        
        {/* Player Frame: 
            Desktop: Centered, fixed aspect ratio 9/16, max height
            Mobile: Full width, full height (100dvh), no rounding
        */}
        <div className="relative w-full h-full md:w-auto md:aspect-[9/16] md:h-[calc(100vh-2rem)] md:max-h-[900px] bg-black shadow-2xl md:rounded-xl overflow-hidden flex flex-col">
            
            {/* Player Header */}
            <header className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center gap-3 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm flex-shrink-0">
                <h1 className="flex-shrink-0">
                    <Link to="/" className="font-poppins font-bold text-xl text-white tracking-tight leading-none drop-shadow-md">
                        Com<span className="text-[#fd572b]">Marília</span>
                    </Link>
                </h1>
                
                {/* Scrollable Categories (Inline) */}
                <div className="flex-grow min-w-0 overflow-x-auto no-scrollbar flex items-center gap-2">
                    {categories.map(cat => {
                        const isActive = activeStory?.category === cat; 
                        const activeClass = "bg-[#fd572b] text-white font-bold border-[#fd572b] shadow-[0_0_15px_rgba(253,87,43,0.5)]";
                        const inactiveClass = "bg-white/10 text-white/80 border-transparent hover:bg-white/20 backdrop-blur-md";
                        
                        return (
                            <Link
                                key={cat}
                                to={`/?category=${cat}`} 
                                className={`inline-block text-[10px] uppercase tracking-wider py-1 px-3 rounded-full border transition-all duration-300 whitespace-nowrap ${isActive ? activeClass : inactiveClass}`}
                            >
                                {cat}
                            </Link>
                        )
                    })}
                </div>

                {/* Close Button */}
                <Link to="/" className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-white/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </header>

            {/* Main Vertical Swiper */}
            <div className="w-full h-full relative overflow-hidden bg-black">
                <Swiper
                    direction="vertical"
                    className="w-full h-full"
                    onSwiper={setSwiperInstance}
                    onSlideChange={handleVerticalSlideChange}
                    initialSlide={startStoryIndex}
                    modules={[Virtual]}
                    virtual
                    resistance={true}
                    resistanceRatio={0.85}
                    speed={400}
                >
                    {stories.map((story, sIndex) => {
                        const shouldRender = Math.abs(activeStoryIndex - sIndex) <= 1;

                        return (
                            <SwiperSlide key={story.id} virtualIndex={sIndex}>
                                {shouldRender ? (
                                    <Swiper
                                        direction="horizontal"
                                        className="w-full h-full"
                                        onSwiper={(swiper) => {
                                            horizontalSwiperRefs.current[sIndex] = swiper;
                                        }}
                                        onSlideChange={(swiper) => handleHorizontalSlideChange(sIndex, swiper)}
                                        onTouchEnd={handleHorizontalTouchEnd}
                                        initialSlide={activeSegmentIndices[sIndex] || 0}
                                        modules={[Pagination]}
                                        nested={true} 
                                        resistance={true}
                                        resistanceRatio={0.65}
                                        touchAngle={45}
                                        observer={true}
                                        observeParents={true}
                                        pagination={{ 
                                            clickable: true,
                                            el: `.custom-pagination-${sIndex}`,
                                            type: 'bullets',
                                            // Using default bulletClass names to avoid querySelectorAll errors
                                        }}
                                    >
                                        {story.segments.map((segment, segIndex) => (
                                            <SwiperSlide key={segment.id}>
                                                <SegmentSlide 
                                                    segment={segment}
                                                    isActive={activeStoryIndex === sIndex && activeSegmentIndices[sIndex] === segIndex}
                                                    onReadMore={() => setIsModalOpen(true)}
                                                />
                                            </SwiperSlide>
                                        ))}
                                        {/* Pagination Overlay */}
                                        <div className={`custom-pagination-${sIndex} absolute bottom-[25px] left-0 w-full flex justify-center z-30 pointer-events-none`} />
                                    </Swiper>
                                ) : (
                                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                        <Skeleton className="w-full h-full opacity-10" />
                                    </div>
                                )}
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </div>

            {/* Read More Modal */}
            {activeStory && (
                <Modal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={activeStory.title}
                    image={modalImage}
                    content={activeStory.fullContent}
                />
            )}
        </div>
    </div>
  );
};