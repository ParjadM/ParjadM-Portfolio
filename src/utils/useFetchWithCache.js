import { useState, useEffect } from 'react';

// Global cache object to persist across component mounts
export const apiCache = new Map();

export const useFetchWithCache = (url) => {
    // Initialize data from cache if available to prevent any layout shift
    const [data, setData] = useState(apiCache.get(url) || null);
    // Only load if we don't have it in cache
    const [isLoading, setIsLoading] = useState(!apiCache.has(url));
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!url) return;

        let isMounted = true;

        const fetchData = async () => {
            try {
                // If it's not in cache, ensure loading is true
                if (!apiCache.has(url)) {
                    setIsLoading(true);
                }
                
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                const result = await response.json();
                
                if (isMounted) {
                    apiCache.set(url, result);
                    setData(result);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        // Always fetch behind the scenes to keep data fresh (stale-while-revalidate pattern)
        fetchData();

        return () => {
            isMounted = false;
        };
    }, [url]);

    return { data, isLoading, error };
};
