import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { fetchStories } from '@/services/api';
import { TransformedStory } from '@/types';

// Define the shape of the context
interface StoryContextType {
  stories: TransformedStory[];
  loading: boolean;
  refreshStories: (force?: boolean) => Promise<void>;
}

// Create the context with a default undefined value
const StoryContext = createContext<StoryContextType | undefined>(undefined);

// Create a custom hook for using the story context
export const useStories = () => {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error('useStories must be used within a StoryProvider');
  }
  return context;
};

// Create the provider component
export const StoryProvider = ({ children }: { children: ReactNode }) => {
  const [stories, setStories] = useState<TransformedStory[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (forceRefresh = false) => {
    // Optimistic check: if we already have data and not forcing refresh, don't set loading to true
    if (stories.length === 0 && !forceRefresh) {
        setLoading(true);
    }
    
    const data = await fetchStories(forceRefresh);
    setStories(data);
    setLoading(false);
  }, [stories.length]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initial load

  const value = {
    stories,
    loading,
    refreshStories: loadData,
  };

  return (
    <StoryContext.Provider value={value}>
      {children}
    </StoryContext.Provider>
  );
};
