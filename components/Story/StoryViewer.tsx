import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperClass } from 'swiper/types';
import { useNavigate, Link } from 'react-router-dom';
import 'swiper/css';

import { SegmentSlide } from './SegmentSlide';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useStories } from '@/components/contexts/StoryContext';
import { useViewportHeight } from '@/components/hooks/useViewportHeight';

interface StoryViewerProps {
  initialStoryId?: string;
  initialSegmentId?: string;
}

type SwiperRegistry = Record<number, SwiperClass>;

const EDGE_SWIPE_THRESHOLD = 30;

export const StoryViewer: React.FC<StoryViewerProps> = ({ initialStoryId, initialSegmentId }) => {
  const { stories, loading } = useStories();
  const navigate = useNavigate();
  const viewportHeight = useViewportHeight();

  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [activeSegmentIndices, setActiveSegmentIndices] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const verticalSwiperRef = useRef<SwiperClass | null>(null);
  const horizontalSwiperRefs = useRef<SwiperRegistry>({});

  const categories = useMemo(() => {
    const cats = new Set(stories.map((s) => s.category));
    return ['Todas', ...Array.from(cats)];
  }, [stories]);

  const playerStyle = useMemo(
    () => ({
      height: viewportHeight,
      minHeight: '100vh',
    }),
    [viewportHeight]
  );

  // This effect runs once when stories are loaded to set the initial state.
  useEffect(() => {
    if (stories.length > 0 && !isInitialized) {
      const targetStoryIndex = initialStoryId
        ? stories.findIndex((story) => story.id === initialStoryId)
        : 0;
      const safeStoryIndex = Math.max(0, targetStoryIndex);

      let targetSegmentIndex = 0;
      if (initialSegmentId && stories[safeStoryIndex]) {
        const found = stories[safeStoryIndex].segments.findIndex((seg) => seg.id === initialSegmentId);
        if (found >= 0) {
          targetSegmentIndex = found;
        }
      }
      
      setActiveStoryIndex(safeStoryIndex);
      setActiveSegmentIndices(stories.map((_, idx) => (idx === safeStoryIndex ? targetSegmentIndex : 0)));
      setIsInitialized(true);
    }
  }, [stories, initialStoryId, initialSegmentId, isInitialized]);

  // This effect syncs the URL with the current state.
  useEffect(() => {
    // Only update URL if initialization is complete
    if (!isInitialized || !stories[activeStoryIndex]) {
      return;
    }
    
    const story = stories[activeStoryIndex];
    const segmentIndex = activeSegmentIndices[activeStoryIndex] ?? 0;
    const segment = story.segments[segmentIndex];

    if (story && segment) {
      navigate(`/player?story=${story.id}&segment=${segment.id}`, { replace: true });
    }
  }, [activeStoryIndex, activeSegmentIndices, stories, navigate, isInitialized]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isModalOpen) return;

      const activeElement = document.activeElement as HTMLElement | null;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }

      switch (event.key) {
        case 'ArrowUp':
          verticalSwiperRef.current?.slidePrev();
          break;
        case 'ArrowDown':
          verticalSwiperRef.current?.slideNext();
          break;
        case 'ArrowLeft':
          horizontalSwiperRefs.current[activeStoryIndex]?.slidePrev();
          break;
        case 'ArrowRight':
          horizontalSwiperRefs.current[activeStoryIndex]?.slideNext();
          break;
        case 'Escape':
          navigate('/');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStoryIndex, isModalOpen, navigate]);

  const handleVerticalSlideChange = (swiper: SwiperClass) => {
    setActiveStoryIndex(swiper.activeIndex);
    setIsModalOpen(false);
  };

  const handleHorizontalSlideChange = (storyIndex: number, swiper: SwiperClass) => {
    setActiveSegmentIndices((prev) => {
      const next = stories.map((_, idx) => prev[idx] ?? 0);
      next[storyIndex] = swiper.activeIndex;
      return next;
    });
  };

  const handleHorizontalTouchEnd = (swiper: SwiperClass) => {
    const diff = swiper.touches?.diff ?? 0;

    if (swiper.isEnd && diff < -EDGE_SWIPE_THRESHOLD) {
      verticalSwiperRef.current?.slideNext();
    }
    if (swiper.isBeginning && diff > EDGE_SWIPE_THRESHOLD) {
      verticalSwiperRef.current?.slidePrev();
    }
  };

  const goToSegment = (storyIndex: number, segmentIndex: number) => {
    const innerSwiper = horizontalSwiperRefs.current[storyIndex];
    if (innerSwiper) {
      innerSwiper.slideTo(segmentIndex);
    }

    setActiveSegmentIndices((prev) => {
      const next = stories.map((_, idx) => prev[idx] ?? 0);
      next[storyIndex] = segmentIndex;
      return next;
    });
  };

  if (loading && !stories.length) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        Carregando Stories...
      </div>
    );
  }

  if (!stories.length) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        Nenhuma história encontrada.
      </div>
    );
  }

  const activeStory = stories[activeStoryIndex];

  return (
    <div
      className="fixed inset-0 bg-gray-50 flex flex-col items-center justify-center overflow-hidden"
      style={playerStyle}
    >
      <div
        className="relative aspect-[9/16] h-full max-h-[900px] w-auto bg-black shadow-2xl md:rounded-xl overflow-hidden flex flex-col"
      >
        <header className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center gap-3 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm flex-shrink-0">
          <h1 className="flex-shrink-0">
            <Link to="/" className="font-poppins font-bold text-xl text-white tracking-tight leading-none drop-shadow-md">
              Com<span className="text-[#fd572b]">Marilia</span>
            </Link>
          </h1>

          <div className="flex-grow min-w-0 overflow-x-auto no-scrollbar flex items-center gap-2">
            {categories.map((cat) => {
              const isActive = activeStory?.category === cat;
              const activeClass =
                'bg-[#fd572b] text-white font-bold border-[#fd572b] shadow-[0_0_15px_rgba(253,87,43,0.5)]';
              const inactiveClass = 'bg-white/10 text-white/80 border-transparent hover:bg-white/20 backdrop-blur-md';

              return (
                <Link
                  key={cat}
                  to={`/?category=${cat}`}
                  className={`inline-block text-[10px] uppercase tracking-wider py-1 px-3 rounded-full border transition-all duration-300 whitespace-nowrap ${
                    isActive ? activeClass : inactiveClass
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>

          <Link
            to="/"
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-white/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </header>

        <div className="w-full h-full relative overflow-hidden bg-black">
          <Swiper
            direction="vertical"
            className="w-full h-full"
            onSwiper={(swiper) => {
              verticalSwiperRef.current = swiper;
            }}
            onSlideChange={handleVerticalSlideChange}
            initialSlide={activeStoryIndex}
            resistance
            resistanceRatio={0.85}
            speed={400}
          >
            {stories.map((story, sIndex) => {
              const shouldRender = Math.abs(activeStoryIndex - sIndex) <= 1;
              const activeSegmentIndex = activeSegmentIndices[sIndex] ?? 0;

              return (
                <SwiperSlide key={story.id}>
                  {shouldRender ? (
                    <div className="w-full h-full relative">
                      <Swiper
                        direction="horizontal"
                        className="w-full h-full"
                        onSwiper={(swiper) => {
                          horizontalSwiperRefs.current[sIndex] = swiper;
                        }}
                        onSlideChange={(swiper) => handleHorizontalSlideChange(sIndex, swiper)}
                        onTouchEnd={handleHorizontalTouchEnd}
                        initialSlide={activeSegmentIndex}
                        nested
                        resistance
                        resistanceRatio={0.65}
                        touchAngle={45}
                        observer
                        observeParents
                      >
                        {story.segments.map((segment, segIndex) => (
                          <SwiperSlide key={segment.id}>
                            <SegmentSlide
                              segment={segment}
                              isActive={activeStoryIndex === sIndex && activeSegmentIndex === segIndex}
                              onReadMore={() => setIsModalOpen(true)}
                            />
                          </SwiperSlide>
                        ))}
                      </Swiper>

                      <div className="absolute bottom-6 left-0 right-0 z-30 px-6 pointer-events-none">
                        <div className="mx-auto flex max-w-xs items-center justify-center gap-2 rounded-full px-3 py-2 pointer-events-auto">
                          {story.segments.map((segment, segIndex) => {
                            const isActiveSegment = segIndex === activeSegmentIndex;
                            return (
                              <button
                                key={segment.id}
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  goToSegment(sIndex, segIndex);
                                }}
                                className={`h-2 rounded-full transition-all duration-200 ${
                                  isActiveSegment
                                    ? 'w-8 bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.35)]'
                                    : 'w-2.5 bg-white/60 hover:bg-white'
                                }`}
                                aria-label={`Ir para o slide ${segIndex + 1}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
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

        {activeStory && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={activeStory.title}
            image={activeStory.image}
            content={activeStory.fullContent}
          />
        )}
      </div>
    </div>
  );
};
