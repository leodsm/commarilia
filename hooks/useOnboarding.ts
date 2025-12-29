import { useState, useEffect } from 'react';

const STORAGE_KEY = 'hasVisitedComMarilia';

export const useOnboarding = () => {
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        const visited = localStorage.getItem(STORAGE_KEY);
        if (!visited) {
            setShowOnboarding(true);
        }
    }, []);

    const markVisited = () => {
        setShowOnboarding(false);
        localStorage.setItem(STORAGE_KEY, 'true');
    };

    const resetOnboarding = () => {
        localStorage.removeItem(STORAGE_KEY);
        setShowOnboarding(true);
    };

    return {
        showOnboarding,
        setShowOnboarding, // Allow manual control if needed
        markVisited,
        resetOnboarding
    };
};
