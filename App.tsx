import React, { useState, useMemo, useCallback } from 'react';
import Home from './components/Home';
import Player from './components/Player';
import Modal from './components/Modal';
import Onboarding from './components/Onboarding';

// Hooks
import { useStories } from './hooks/useStories';
import { useOnboarding } from './hooks/useOnboarding';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';

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

  return (
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
  );
};

export default App;