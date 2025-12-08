import React, { useEffect, useState } from 'react';
import { Routes, Route, useSearchParams, useLocation } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { StoryViewer } from '@/components/Story/StoryViewer';
import { safeGetItem, safeSetItem } from '@/services/storage';
import { StoryProvider } from '@/components/contexts/StoryContext';
import { Onboarding } from '@/components/ui/Onboarding';

const App: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [params] = useSearchParams();
  const location = useLocation();

  // Check for onboarding only when entering player for the first time
  useEffect(() => {
    if (location.pathname === '/player') {
        const hasVisited = safeGetItem('hasVisitedComMarilia');
        if (!hasVisited) {
            setShowOnboarding(true);
        }
    }
  }, [location.pathname]);

  const handleDismissOnboarding = () => {
      setShowOnboarding(false);
      safeSetItem('hasVisitedComMarilia', 'true');
  };

  return (
    <StoryProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
            path="/player" 
            element={
                <StoryViewer 
                    initialStoryId={params.get('story') || undefined}
                    initialSegmentId={params.get('segment') || undefined}
                />
            } 
        />
      </Routes>
      
      {showOnboarding && <Onboarding onDismiss={handleDismissOnboarding} />}
    </StoryProvider>
  );
};

export default App;
