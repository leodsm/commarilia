import { useState, useEffect } from 'react';
import { fetchStories } from '../services/api';
import { TransformedStory } from '../types';

export const useStories = () => {
    const [stories, setStories] = useState<TransformedStory[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [endCursor, setEndCursor] = useState<string | null>(null);

    const loadData = async (isLoadMore = false) => {
        if (!isLoadMore) setLoading(true);
        else setLoadingMore(true);

        try {
            const data = await fetchStories(10, isLoadMore ? endCursor : null);
            setStories(prev => isLoadMore ? [...prev, ...data.stories] : data.stories);
            setHasNextPage(data.pageInfo.hasNextPage);
            setEndCursor(data.pageInfo.endCursor);
        } catch (err) {
            setError('Falha ao carregar stories. Tente novamente mais tarde.');
            console.error(err);
        } finally {
            if (!isLoadMore) setLoading(false);
            else setLoadingMore(false);
        }
    };

    useEffect(() => {
        loadData(false);
    }, []);

    const fetchNextPage = () => {
        if (hasNextPage && !loading && !loadingMore) {
            loadData(true);
        }
    };

    return { stories, loading, loadingMore, error, fetchNextPage, hasNextPage };
};
