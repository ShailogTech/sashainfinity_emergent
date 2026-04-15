import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const SEARCH_CACHE_KEY = 'edusearch_cache';
const SEARCH_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const SEARCH_HISTORY_KEY = 'edusearch_history';
const MAX_SEARCH_HISTORY = 10;

/**
 * Custom hook for managing video transcript search with caching and debouncing
 * @param {Object} options - Search options
 * @param {number} options.debounceMs - Debounce delay in milliseconds (default: 300)
 * @param {boolean} options.enableCache - Enable result caching (default: true)
 * @param {boolean} options.autoSearch - Automatically search on query change (default: true)
 * @returns {Object} Search state and functions
 */
export const useSearch = (options = {}) => {
  const {
    debounceMs = 300,
    enableCache = true,
    autoSearch = true,
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);
  const searchCountRef = useRef(0);

  // Load search history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load search history:', e);
    }
  }, []);

  // Save search to history
  const addToHistory = useCallback((searchQuery) => {
    if (!searchQuery.trim()) return;

    setSearchHistory((prev) => {
      const newHistory = [
        { query: searchQuery, timestamp: Date.now() },
        ...prev.filter((item) => item.query.toLowerCase() !== searchQuery.toLowerCase()),
      ].slice(0, MAX_SEARCH_HISTORY);

      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      } catch (e) {
        console.error('Failed to save search history:', e);
      }

      return newHistory;
    });
  }, []);

  // Get cached results
  const getCachedResults = useCallback((searchQuery) => {
    if (!enableCache) return null;

    try {
      const cache = localStorage.getItem(SEARCH_CACHE_KEY);
      if (cache) {
        const parsedCache = JSON.parse(cache);
        const cached = parsedCache[searchQuery.toLowerCase()];
        if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_DURATION) {
          return cached.results;
        }
      }
    } catch (e) {
      console.error('Failed to read cache:', e);
    }
    return null;
  }, [enableCache]);

  // Cache results
  const cacheResults = useCallback((searchQuery, searchResults) => {
    if (!enableCache) return;

    try {
      const cache = JSON.parse(localStorage.getItem(SEARCH_CACHE_KEY) || '{}');
      cache[searchQuery.toLowerCase()] = {
        results: searchResults,
        timestamp: Date.now(),
      };

      // Clean old cache entries
      const now = Date.now();
      Object.keys(cache).forEach((key) => {
        if (now - cache[key].timestamp > SEARCH_CACHE_DURATION) {
          delete cache[key];
        }
      });

      localStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      console.error('Failed to cache results:', e);
    }
  }, [enableCache]);

  // Clear cache
  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(SEARCH_CACHE_KEY);
    } catch (e) {
      console.error('Failed to clear cache:', e);
    }
  }, []);

  // Perform search
  const performSearch = useCallback(async (searchQuery, searchOptions = {}) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return [];
    }

    // Check cache first
    const cached = getCachedResults(searchQuery);
    if (cached) {
      setResults(cached);
      return cached;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    searchCountRef.current += 1;

    const requestId = searchCountRef.current;

    try {
      const response = await fetch('/api/search/videos/mock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          fuzzy_match: true,
          fuzzy_threshold: 0.7,
          context_window: 100,
          max_results: searchOptions.maxResults || 50,
          filters: searchOptions.filters || {},
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Only update if this is the latest request
      if (requestId === searchCountRef.current) {
        setResults(data);
        cacheResults(searchQuery, data);
        addToHistory(searchQuery);
      }

      return data;
    } catch (e) {
      if (e.name === 'AbortError') {
        return []; // Request was cancelled, don't show error
      }

      const errorMsg = e.message || 'Failed to perform search. Please try again.';
      if (requestId === searchCountRef.current) {
        setError(errorMsg);
      }
      console.error('Search error:', e);
      return [];
    } finally {
      if (requestId === searchCountRef.current) {
        setLoading(false);
      }
    }
  }, [getCachedResults, cacheResults, addToHistory]);

  // Debounced search
  const debouncedSearch = useCallback((...args) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    return new Promise((resolve) => {
      debounceRef.current = setTimeout(() => {
        resolve(performSearch(...args));
      }, debounceMs);
    });
  }, [debounceMs, performSearch]);

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return [];
    }

    setSuggestionsLoading(true);

    try {
      const response = await fetch(
        `/api/search/suggestions/mock?q=${encodeURIComponent(searchQuery)}&limit=8`
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        return data;
      }
    } catch (e) {
      console.error('Failed to fetch suggestions:', e);
    } finally {
      setSuggestionsLoading(false);
    }

    return [];
  }, []);

  // Set search query
  const setQuery = useCallback((newQuery) => {
    if (newQuery) {
      setSearchParams({ q: newQuery });
    } else {
      setSearchParams({});
    }
  }, [setSearchParams]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, [setQuery]);

  // Auto-search on query change
  useEffect(() => {
    if (autoSearch && query.trim()) {
      debouncedSearch(query);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, autoSearch, debouncedSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Get trending searches (mock data - could be from API)
  const trendingSearches = [
    'React hooks',
    'JavaScript async',
    'Python classes',
    'CSS Grid',
    'Node.js API',
    'Database indexing',
    'Git commands',
    'Docker containers',
    'TypeScript types',
    'REST API design',
  ];

  return {
    // State
    query,
    results,
    loading,
    error,
    suggestions,
    suggestionsLoading,
    searchHistory,
    trendingSearches,

    // Actions
    setQuery,
    performSearch,
    debouncedSearch,
    fetchSuggestions,
    clearSearch,
    clearCache,
    addToHistory,

    // Computed
    hasResults: results.length > 0,
    resultCount: results.length,
    isSearching: loading,
  };
};

export default useSearch;
