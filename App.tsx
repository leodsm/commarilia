import React, { useEffect, useState } from 'react';
import { Routes, Route, useSearchParams, useLocation } from 'react-router-dom';
import { fetchStories } from './services/api';
import { TransformedStory } from './types';
import { Home } from './pages/Home';
import { StoryViewer } from './components/Story/StoryViewer';

// Onboarding Overlay Component (Simple functional component)
const Onboarding = ({ onDismiss }: { onDismiss: () => void }) => (
  <div 
    onClick={onDismiss}
    className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center text-white cursor-pointer animate-in fade-in duration-500"
  >
    <h2 className="text-3xl font-poppins font-bold mb-12">Como Navegar</h2>
    <div className="space-y-10 text-center">
        <div>
            <div className="text-3xl animate-bounce mb-2">↑</div>
            <p className="font-bold">ARRASTE PARA CIMA</p>
            <p className="text-sm opacity-70">Próxima notícia</p>
        </div>
        <div>
            <div className="text-3xl animate-bounce mb-2">← →</div>
            <p className="font-bold">ARRASTE PARA O LADO</p>
            <p className="text-sm opacity-70">Mais detalhes</p>
        </div>
    </div>
    <p className="absolute bottom-10 text-sm opacity-50">Toque para começar</p>
  </div>
);

const App: React.FC = () => {
  const [stories, setStories] = useState<TransformedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [params] = useSearchParams();
  const location = useLocation();

  const loadData = async (forceRefresh = false) => {
    // Optimistic check: if we already have data and not forcing refresh, don't set loading to true
    if (stories.length === 0 && !forceRefresh) setLoading(true);
    
    const data = await fetchStories(forceRefresh);
    setStories(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    await loadData(true);
  };

  // Check for onboarding only when entering player for the first time
  useEffect(() => {
    if (location.pathname === '/player') {
        const hasVisited = localStorage.getItem('hasVisitedComMarilia');
        if (!hasVisited) {
            setShowOnboarding(true);
        }
    }
  }, [location.pathname]);

  const handleDismissOnboarding = () => {
      setShowOnboarding(false);
      localStorage.setItem('hasVisitedComMarilia', 'true');
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Home stories={stories} isLoading={loading} onRefresh={handleRefresh} />} />
        <Route 
            path="/player" 
            element={
                <StoryViewer 
                    stories={stories} 
                    initialStoryId={params.get('story') || undefined}
                    initialSegmentId={params.get('segment') || undefined}
                />
            } 
        />
      </Routes>
      
      {showOnboarding && <Onboarding onDismiss={handleDismissOnboarding} />}
    </>
  );
};

export default App;