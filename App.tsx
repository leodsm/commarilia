import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Home from './components/Home';
import Player from './components/Player';
import Modal from './components/Modal';
import Onboarding from './components/Onboarding';
import { HelmetProvider } from 'react-helmet-async';
import ReactGA from 'react-ga4';

// Hooks
import { useStories } from './hooks/useStories';
import { useOnboarding } from './hooks/useOnboarding';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';

// Initialize GA4 - Replace 'G-XXXXXXXXXX' with actual ID or ENV
const GA_MEASUREMENT_ID = 'G-YWN4G3R9M2'; // Updated with user provided ID
ReactGA.initialize(GA_MEASUREMENT_ID);

const App: React.FC = () => {
  const { stories, loading, error } = useStories();
  const { showOnboarding, markVisited, setShowOnboarding } = useOnboarding();

  const [view, setView] = useState<'home' | 'player'>('home');
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [modalStoryId, setModalStoryId] = useState<string | null>(null);

  // -- Handlers --

  const handleOpenPlayer = useCallback((id: string) => {
    setActiveStoryId(id);
    setView('player');

    // If onboarding is pending, show it now when player opens
    if (localStorage.getItem('hasVisitedComMarilia') === null) {
      // We use direct localStorage check here or need the hook to expose 'hasVisited' state?
      // The hook logic handles 'showOnboarding' on mount, but let's re-trigger if needed.
      // Actually, the original logic was: "If onboarding is pending, show it now when player opens".
      // The hook sets showOnboarding on mount. If user closed it, it's closed.
      // The original code re-checked localStorage. Let's replicate safely.
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
    if (loading || !stories.length) return;

    // Check for story slug in URL
    const params = new URLSearchParams(window.location.search);
    const storySlug = params.get('story');

    if (storySlug) {
      const story = stories.find(s => s.id === storySlug);
      if (story) {
        setActiveStoryId(story.id);
        setView('player');
        // Ensure onboarding logic respects this deep link entry if needed
        if (localStorage.getItem('hasVisitedComMarilia') === null) {
          setShowOnboarding(true);
        }
      }
    }
  }, [loading, stories, setShowOnboarding]);

  // Update URL when active story changes
  useEffect(() => {
    if (view === 'player' && activeStoryId) {
      const url = new URL(window.location.href);
      url.searchParams.set('story', activeStoryId);
      window.history.replaceState({}, '', url.toString());
    } else if (view === 'home') {
      const url = new URL(window.location.href);
      url.searchParams.delete('story');
      window.history.replaceState({}, '', url.toString());
    }
  }, [view, activeStoryId]);

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

  // -- Analytics Tracking --
  useEffect(() => {
    // Send pageview with a custom path
    ReactGA.send({ hitType: "pageview", page: view === 'home' ? '/' : `/story/${activeStoryId || ''}` });
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
          <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
            {/* Backdrop with blur */}
            <div
              className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
              onClick={handleClosePlayer}
              aria-hidden="true"
            />

            {/* Player Container */}
            <div className="w-full h-full md:w-auto md:h-full md:aspect-[9/16] bg-black relative shadow-2xl overflow-hidden md:rounded-none border-gray-800 md:border z-10 transition-all duration-300">
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
              />

              {showOnboarding && (
                <Onboarding onDismiss={handleDismissOnboarding} />
              )}
            </div>
          </div>
        )}

        {/* Read More Modal */}
        <Modal
          isOpen={!!modalStoryId}
          onClose={handleCloseModal}
          story={activeModalStory}
        />
      </div>
    </HelmetProvider>
  );
};

export default App;