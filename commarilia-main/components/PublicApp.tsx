import React, { useState, useMemo, useCallback, useEffect, useRef, Suspense, lazy } from 'react';
import Home from './Home';
import Player from './Player';
const Modal = lazy(() => import('./Modal'));
const Onboarding = lazy(() => import('./Onboarding'));
import { HelmetProvider } from 'react-helmet-async';

// Hooks
import { useStories } from '../hooks/useStories';
import { useOnboarding } from '../hooks/useOnboarding';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

export const PublicApp: React.FC = () => {
  const { stories, loading, error, fetchNextPage, hasNextPage } = useStories();
  const { showOnboarding, markVisited, setShowOnboarding } = useOnboarding();

  const [view, setView] = useState<'home' | 'player'>('home');
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [modalStoryId, setModalStoryId] = useState<string | null>(null);
  const hasSkippedInitialAutoPageview = useRef(false);

  // -- Handlers --

  const handleOpenPlayer = useCallback((id: string) => {
    setActiveStoryId(id);
    setView('player');

    // If onboarding is pending, show it now when player opens
    if (localStorage.getItem('hasVisitedComMarilia') === null) {
      setShowOnboarding(true);
    }
  }, [setShowOnboarding]);

  const handleClosePlayer = useCallback(() => {
    setView('home');
    setActiveStoryId(null);
  }, []);

  const handleDismissOnboarding = useCallback(() => {
    markVisited();
  }, [markVisited]);

  const handleCloseModal = useCallback(() => {
    setModalStoryId(null);
  }, []);

  // -- Deep Linking & URL Management --
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const storySlug = params.get('story');

      if (storySlug) {
        if (stories.length > 0) {
          const story = stories.find(s => s.id === storySlug);
          if (story) {
            setActiveStoryId(story.id);
            setView('player');
          }
        }
      } else {
        setView('home');
        setActiveStoryId(null);
        setModalStoryId(null); // Also close modal if open
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Initial check (Deep linking)
    if (!loading && stories.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const storySlug = params.get('story');
      if (storySlug) {
        const story = stories.find(s => s.id === storySlug);
        if (story) {
          setActiveStoryId(story.id);
          setView('player');
          if (localStorage.getItem('hasVisitedComMarilia') === null) {
            setShowOnboarding(true);
          }
        }
      }
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [loading, stories, setShowOnboarding]);

  // Update URL when active story changes
  useEffect(() => {
    if (loading) return;

    const currentUrlParams = new URLSearchParams(window.location.search);
    const currentStorySlug = currentUrlParams.get('story');

    if (view === 'player' && activeStoryId) {
      if (currentStorySlug !== activeStoryId) {
        const url = new URL(window.location.href);
        url.searchParams.set('story', activeStoryId);

        if (!currentStorySlug) {
          window.history.pushState({ view: 'player', storyId: activeStoryId }, '', url.toString());
        } else {
          window.history.replaceState({ view: 'player', storyId: activeStoryId }, '', url.toString());
        }
      }
    } else if (view === 'home') {
      if (currentStorySlug) {
        const url = new URL(window.location.href);
        url.searchParams.delete('story');
        window.history.replaceState({ view: 'home' }, '', url.toString());
      }
    }
  }, [view, activeStoryId, loading]);

  // -- Keyboard Navigation --

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (modalStoryId) {
        handleCloseModal();
        return;
      }
      if (view === 'player') {
        handleClosePlayer();
      }
    }
  }, [modalStoryId, view, handleCloseModal, handleClosePlayer]);

  useKeyboardNavigation(handleKeyDown);

  // -- Derived State (Memoized) --

  const allCategories = useMemo(() => {
    if (!stories.length) return ['Todas'];
    return ['Todas', ...Array.from(new Set(stories.map(s => s.category)))];
  }, [stories]);

  const playerStories = useMemo(() => {
    if (activeCategory === 'Todas') return stories;
    return stories.filter(s => s.category === activeCategory);
  }, [stories, activeCategory]);

  const activeModalStory = useMemo(() =>
    stories.find(s => s.id === modalStoryId) || null
    , [stories, modalStoryId]);

  // -- Render Helpers --

  if (error) {
    return <div className="p-10 text-center text-red-500">{error}</div>;
  }

  // -- Analytics Tracking (GA4 via gtag) --
  useEffect(() => {
    const gtag = (window as any).gtag as ((...args: any[]) => void) | undefined;
    if (!gtag) return;

    const pagePath = view === 'home'
      ? '/'
      : (activeStoryId ? `/story/${activeStoryId}` : '/story');

    // The initial home pageview is already sent by gtag('config').
    if (!hasSkippedInitialAutoPageview.current && pagePath === '/') {
      hasSkippedInitialAutoPageview.current = true;
      return;
    }

    gtag('event', 'page_view', {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title
    });
  }, [view, activeStoryId]);

  return (
    <HelmetProvider>
      <div className="font-inter text-gray-900 bg-white">
        {/* Home View */}
        {view === 'home' && (
          <Home
            stories={stories}
            isLoading={loading}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            onSelectStory={handleOpenPlayer}
          />
        )}

        {/* Player View Overlay */}
        {view === 'player' && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in p-2 md:p-5"
            style={{
              paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)'
            }}
          >
            {/* Backdrop with blur */}
            <div
              className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
              onClick={handleClosePlayer}
              aria-hidden="true"
            />

            {/* Player Container */}
            <div
              className="w-full max-w-[440px] bg-black relative shadow-2xl overflow-hidden rounded-[1.3rem] border border-gray-800 z-10 transition-all duration-300"
              style={{
                height: 'calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 16px)',
                maxHeight: '900px'
              }}
            >
              <Player
                stories={playerStories}
                allCategories={allCategories}
                initialStoryId={activeStoryId || ''}
                onClose={handleClosePlayer}
                onOpenModal={setModalStoryId}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                isModalOpen={!!modalStoryId}
                onStoryChange={setActiveStoryId}
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
              />

              {showOnboarding && (
                <Suspense fallback={null}>
                  <Onboarding onDismiss={handleDismissOnboarding} />
                </Suspense>
              )}
            </div>
          </div>
        )}

        {/* Read More Modal */}
        <Suspense fallback={null}>
          <Modal
            isOpen={!!modalStoryId}
            onClose={handleCloseModal}
            story={activeModalStory}
          />
        </Suspense>
      </div>
    </HelmetProvider>
  );
};

export default PublicApp;
