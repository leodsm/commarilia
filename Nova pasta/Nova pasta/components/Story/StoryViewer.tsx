import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper/types';
import { useNavigate, Link } from 'react-router-dom';

import { SegmentSlide } from './SegmentSlide';
import { Modal } from '../ui/Modal';
import { useStories } from '../contexts/StoryContext';
import { useViewportHeight } from '../hooks/useViewportHeight';

interface StoryViewerProps {
  initialStoryId?: string;
  initialSegmentId?: string;
}

type SwiperRegistry = Record<number, SwiperClass>;

const PLAYER_ASPECT_RATIO = '9 / 16';

export const StoryViewer: React.FC<StoryViewerProps> = ({ initialStoryId, initialSegmentId }) => {
  const { stories, loading } = useStories();
  const navigate = useNavigate();
  const viewportHeight = useViewportHeight();

  // State
  const [playerCategory, setPlayerCategory] = useState('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoize filtered stories based on the selected category
  const filteredStories = useMemo(() => {
    if (playerCategory === 'Todas') {
      return stories;
    }
    return stories.filter((s) => s.category === playerCategory);
  }, [stories, playerCategory]);
  
  // Derive initial indices ONCE, based on the filtered stories.
  // This avoids complex useEffects for initialization.
  const initialStoryIndex = useMemo(() => {
    if (filteredStories.length === 0) return 0;
    const index = filteredStories.findIndex((s) => s.id === initialStoryId);
    return Math.max(0, index);
  }, [filteredStories, initialStoryId]);

  const initialSegmentIndices = useMemo(() => {
      const indices = new Array(filteredStories.length).fill(0);
      if (filteredStories[initialStoryIndex]) {
          const segmentIndex = filteredStories[initialStoryIndex].segments.findIndex(seg => seg.id === initialSegmentId);
          if (segmentIndex >= 0) {
            indices[initialStoryIndex] = segmentIndex;
          }
      }
      return indices;
  }, [filteredStories, initialStoryIndex, initialSegmentId]);

  const [activeStoryIndex, setActiveStoryIndex] = useState(initialStoryIndex);
  const [activeSegmentIndices, setActiveSegmentIndices] = useState(initialSegmentIndices);

  // Refs for Swiper instances
  const verticalSwiperRef = useRef<SwiperClass | null>(null);
  const horizontalSwiperRefs = useRef<SwiperRegistry>({});

  // Memoize categories for the header
  const categories = useMemo(() => {
    const cats = new Set(stories.map((s) => s.category));
    return ['Todas', ...Array.from(cats)];
  }, [stories]);
  
  const playerStyle = useMemo(() => ({ height: viewportHeight }), [viewportHeight]);
  const frameStyle = useMemo<React.CSSProperties>(
    () => ({
      aspectRatio: PLAYER_ASPECT_RATIO,
    }),
    [],
  );

  // Prevent body scroll when player is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Update URL when state changes
  useEffect(() => {
    const story = filteredStories[activeStoryIndex];
    if (story) {
      const segmentIndex = activeSegmentIndices[activeStoryIndex] ?? 0;
      const segment = story.segments[segmentIndex];
      if (segment) {
        navigate(`/player?story=${story.id}&segment=${segment.id}`, { replace: true });
      }
    }
  }, [activeStoryIndex, activeSegmentIndices, filteredStories, navigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isModalOpen) return;
      const activeEl = document.activeElement as HTMLElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;

      switch (event.key) {
        case 'ArrowUp': verticalSwiperRef.current?.slidePrev(); break;
        case 'ArrowDown': verticalSwiperRef.current?.slideNext(); break;
        case 'ArrowLeft': horizontalSwiperRefs.current[activeStoryIndex]?.slidePrev(); break;
        case 'ArrowRight': horizontalSwiperRefs.current[activeStoryIndex]?.slideNext(); break;
        case 'Escape': navigate('/'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStoryIndex, isModalOpen, navigate]);

  const handleVerticalSlideChange = (swiper: SwiperClass) => {
    setActiveStoryIndex(swiper.realIndex); // Use realIndex for loop mode
  };

  const handleHorizontalSlideChange = (storyIndex: number, swiper: SwiperClass) => {
    setActiveSegmentIndices((prev) => {
      const next = [...prev];
      next[storyIndex] = swiper.activeIndex;
      return next;
    });
  };

  const goToSegment = (storyIndex: number, segmentIndex: number) => {
    horizontalSwiperRefs.current[storyIndex]?.slideTo(segmentIndex);
  };
  
  if (loading && filteredStories.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        Carregando Stories...
      </div>
    );
  }
  
  const activeStory = filteredStories[activeStoryIndex];

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col items-center justify-center overflow-hidden" style={playerStyle}>
      <div
        className="relative h-full w-auto max-w-full bg-black shadow-2xl md:rounded-xl overflow-hidden flex flex-col"
        style={frameStyle}
      >
        <header className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center gap-3 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm flex-shrink-0">
          <h1 className="flex-shrink-0">
            <Link to="/" className="font-poppins font-bold text-xl text-white tracking-tight leading-none drop-shadow-md">
              Com<span className="text-[#fd572b]">Marilia</span>
            </Link>
          </h1>
          <div className="flex-grow min-w-0 overflow-x-auto no-scrollbar flex items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setPlayerCategory(cat)}
                className={`inline-block text-[10px] uppercase tracking-wider py-1 px-3 rounded-full border transition-all duration-300 whitespace-nowrap ${
                  playerCategory === cat
                    ? 'bg-[#fd572b] text-white font-bold border-[#fd572b] shadow-[0_0_15px_rgba(253,87,43,0.5)]'
                    : 'bg-white/10 text-white/80 border-transparent hover:bg-white/20 backdrop-blur-md'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <Link to="/" className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-white/20 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </header>

        <div className="w-full h-full relative overflow-hidden bg-black">
          {filteredStories.length > 0 ? (
            <Swiper
              key={playerCategory} // Force re-mount on category change
              direction="vertical"
              className="w-full h-full"
              onSwiper={(swiper) => { verticalSwiperRef.current = swiper; }}
              onSlideChange={handleVerticalSlideChange}
              initialSlide={initialStoryIndex}
              resistance
              resistanceRatio={0.85}
              speed={400}
              loop={true}
              allowTouchMove={!isModalOpen}
            >
              {filteredStories.map((story, sIndex) => {
                const activeSegmentIndex = activeSegmentIndices[sIndex] ?? 0;
                const storyHasContent = Boolean(story.fullContent?.trim());
                return (
                  <SwiperSlide key={story.id}>
                    <div className="w-full h-full relative">
                      <Swiper
                        direction="horizontal"
                        className="w-full h-full"
                        onSwiper={(swiper) => { horizontalSwiperRefs.current[sIndex] = swiper; }}
                        onSlideChange={(swiper) => handleHorizontalSlideChange(sIndex, swiper)}
                        initialSlide={activeSegmentIndex}
                        nested
                        resistance
                        resistanceRatio={0.65}
                        touchAngle={45}
                        observer
                        observeParents
                        allowTouchMove={!isModalOpen}
                      >
                        {story.segments.map((segment, segIndex) => (
                          <SwiperSlide key={segment.id}>
                            <SegmentSlide
                              segment={segment}
                              isActive={activeStoryIndex === sIndex && activeSegmentIndex === segIndex}
                              onReadMore={() => storyHasContent && setIsModalOpen(true)}
                              hasStoryContent={storyHasContent}
                            />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                      <div className="absolute bottom-6 left-0 right-0 z-30 px-6 pointer-events-none">
                        <div className="mx-auto flex max-w-xs items-center justify-center gap-2 rounded-full px-3 py-2 pointer-events-auto">
                          {story.segments.map((segment, segIndex) => (
                            <button
                              key={segment.id}
                              type="button"
                              onClick={() => goToSegment(sIndex, segIndex)}
                              className={`h-2 rounded-full transition-all duration-200 ${
                                segIndex === activeSegmentIndex
                                  ? 'w-8 bg-[#fd572b] shadow-[0_0_0_1px_rgba(253,87,43,0.35)]'
                                  : 'w-2.5 bg-white/60 hover:bg-white'
                              }`}
                              aria-label={`Ir para o slide ${segIndex + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          ) : (
             <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
                Nenhuma historia encontrada nesta categoria.
             </div>
          )}
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
