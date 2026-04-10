import { useState, useEffect } from 'react';
import { fetchStories } from '../services/api';
import { TransformedStory } from '../types';

export const useStories = (tenantSlug?: string) => {
    const [stories, setStories] = useState<TransformedStory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchStories(tenantSlug);
                setStories(data);
            } catch (err) {
                setError('Falha ao carregar stories. Tente novamente mais tarde.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [tenantSlug]);

    return { stories, loading, error };
};
