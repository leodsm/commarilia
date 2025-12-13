import React, { useEffect, useState, useMemo } from 'react';
import { fetchStories } from './services/api';
import { TransformedStory } from './types';
import Home from './components/Home';
import Player from './components/Player';
import Modal from './components/Modal';
import Onboarding from './components/Onboarding';

const App: React.FC = () => {
  const [stories, setStories] = useState<TransformedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'home' | 'player'>('home');
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [modalStoryId, setModalStoryId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchStories();
      setStories(data);
      setLoading(false);
    };
    loadData();

    // Check onboarding status
    const visited = localStorage.getItem('hasVisitedComMarilia');
    if (!visited) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOpenPlayer = (id: string) => {
    setActiveStoryId(id);
    setView('player');
    
    // If onboarding is pending, show it now when player opens
    const visited = localStorage.getItem('hasVisitedComMarilia');
    if (!visited) {
        setShowOnboarding(true);
    }
  };

  const handleClosePlayer = () => {
    setView('home');
    setActiveStoryId(null);
  };

  const handleDismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasVisitedComMarilia', 'true');
  };

  // Global ESC Key Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Priority 1: Close Modal if open
        if (modalStoryId) {
          setModalStoryId(null);
          return;
        }
        // Priority 2: Close Player if open and Modal is closed
        if (view === 'player') {
          handleClosePlayer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalStoryId, view]);

  // Extract ALL categories from the original dataset, so the menu remains consistent
  const allCategories = useMemo(() => {
      return ['Todas', ...Array.from(new Set(stories.map(s => s.category)))];
  }, [stories]);

  // Filter stories for the player based on the *current* category selected inside player
  const playerStories = useMemo(() => {
      if (activeCategory === 'Todas') return stories;
      return stories.filter(s => s.category === activeCategory);
  }, [stories, activeCategory]);

  const activeModalStory = useMemo(() => 
    stories.find(s => s.id === modalStoryId) || null
  , [stories, modalStoryId]);

  return (
    <div className="font-inter text-gray-900 bg-white">
      {/* Home View */}
      <div style={{ display: view === 'home' ? 'block' : 'none' }}>
        <Home 
          stories={stories} 
          isLoading={loading}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          onSelectStory={handleOpenPlayer}
        />
      </div>

      {/* Player View Overlay */}
      {view === 'player' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
           {/* Backdrop with blur for desktop */}
           <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={handleClosePlayer}></div>

           {/* Desktop Frame Container: 
               Reverted to overflow-hidden and standard layout to match original design.
           */}
           <div className="w-full h-full md:w-auto md:h-full md:aspect-[9/16] bg-black relative shadow-2xl overflow-hidden md:rounded-none border-gray-800 md:border z-10 transition-all duration-300">
              <Player 
                stories={playerStories}
                allCategories={allCategories} // Pass full list of categories
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
        onClose={() => setModalStoryId(null)} 
        story={activeModalStory} 
      />
    </div>
  );
};

export default App;