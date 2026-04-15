import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import './SearchBar.css';

const SearchBar = ({
  placeholder = 'Search videos, topics, instructors...',
  autoFocus = false,
  variant = 'navbar',
  onSearch,
  className,
  showVoiceSearch = true,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const navigate = useNavigate();
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const recognitionRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('edusearch_recent');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load recent searches:', e);
    }
  }, []);

  // Load popular searches
  useEffect(() => {
    const popularTerms = [
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
    setPopularSearches(popularTerms);
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSpeechSupported(true);

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        setShowSuggestions(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Global keyboard shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    const handleGlobalShortcut = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalShortcut);
    return () => document.removeEventListener('keydown', handleGlobalShortcut);
  }, []);

  // Debounced search for suggestions
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/search/suggestions/mock?q=${encodeURIComponent(searchQuery)}&limit=8`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce input changes
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (query.trim()) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, fetchSuggestions]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus if enabled
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleSearch = (searchQuery = query) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    // Save to recent searches
    const newRecent = [
      trimmedQuery,
      ...recentSearches.filter((s) => s !== trimmedQuery),
    ].slice(0, 5);

    setRecentSearches(newRecent);
    try {
      localStorage.setItem('edusearch_recent', JSON.stringify(newRecent));
    } catch (e) {
      console.error('Failed to save recent searches:', e);
    }

    setShowSuggestions(false);
    setQuery(trimmedQuery);

    if (onSearch) {
      onSearch(trimmedQuery);
    } else {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  const handleKeyDown = (e) => {
    const items = getSuggestionsList();

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < items.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          handleSearch(items[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const getSuggestionsList = () => {
    if (!query.trim()) {
      return recentSearches;
    }
    return suggestions.map((s) => s.text);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const startVoiceSearch = () => {
    if (!speechSupported || !recognitionRef.current) return;

    try {
      setIsListening(true);
      recognitionRef.current.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setIsListening(false);
    }
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      topic: 'fa-lightbulb',
      course: 'fa-book',
      instructor: 'fa-user',
      phrase: 'fa-quote-left',
    };
    return icons[category] || 'fa-search';
  };

  const getCategoryColor = (category) => {
    const colors = {
      topic: '#f4911a',
      course: '#667eea',
      instructor: '#2dd472',
      phrase: '#f5576c',
    };
    return colors[category] || '#6b7280';
  };

  const formatTimestamp = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={searchRef}
      className={cn(
        'search-container',
        `search-variant-${variant}`,
        className
      )}
    >
      <div className="search-input-wrapper">
        <div className="search-icon">
          <i className="fa-solid fa-search" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="search-input"
          autoComplete="off"
        />
        {variant === 'navbar' && !query && (
          <div className="search-shortcut-hint">
            <kbd>Ctrl</kbd> <kbd>K</kbd>
          </div>
        )}

        {query && (
          <button
            onClick={handleClear}
            className="search-clear"
            aria-label="Clear search"
          >
            <i className="fa-solid fa-times" />
          </button>
        )}

        {showVoiceSearch && speechSupported && !query && (
          <button
            onClick={isListening ? stopVoiceSearch : startVoiceSearch}
            className={cn('search-voice', isListening && 'search-voice-listening')}
            aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
          >
            <i className={cn(
              isListening ? 'fa-solid fa-microphone-slash' : 'fa-solid fa-microphone'
            )} />
          </button>
        )}

        {loading && (
          <div className="search-loading">
            <div className="loading-spinner" />
          </div>
        )}

        {variant === 'page' && (
          <button
            onClick={() => handleSearch()}
            className="search-button"
            aria-label="Search"
          >
            <i className="fa-solid fa-arrow-right" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="search-suggestions">
          {query.trim() && suggestions.length > 0 ? (
            <>
              <div className="suggestions-header">
                <span>Suggestions</span>
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.text}-${index}`}
                  onClick={() => handleSearch(suggestion.text)}
                  className={cn(
                    'suggestion-item',
                    selectedIndex === index && 'suggestion-item-selected'
                  )}
                >
                  <span
                    className="suggestion-icon"
                    style={{ color: getCategoryColor(suggestion.category) }}
                  >
                    <i className={`fa-solid ${getCategoryIcon(suggestion.category)}`} />
                  </span>
                  <span className="suggestion-text">{suggestion.text}</span>
                  <span className="suggestion-category">
                    {suggestion.category}
                  </span>
                </button>
              ))}
            </>
          ) : !query.trim() && recentSearches.length > 0 ? (
            <>
              <div className="suggestions-header">
                <span>Recent Searches</span>
                <button
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem('edusearch_recent');
                  }}
                  className="clear-recent"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={`${search}-${index}`}
                  onClick={() => handleSearch(search)}
                  className={cn(
                    'suggestion-item',
                    selectedIndex === index && 'suggestion-item-selected'
                  )}
                >
                  <span className="suggestion-icon">
                    <i className="fa-solid fa-clock" />
                  </span>
                  <span className="suggestion-text">{search}</span>
                </button>
              ))}
            </>
          ) : !query.trim() ? (
            <>
              <div className="suggestions-header">
                <span>Popular Searches</span>
              </div>
              {popularSearches.slice(0, 5).map((search, index) => (
                <button
                  key={`${search}-${index}`}
                  onClick={() => handleSearch(search)}
                  className={cn(
                    'suggestion-item',
                    selectedIndex === index && 'suggestion-item-selected'
                  )}
                >
                  <span className="suggestion-icon">
                    <i className="fa-solid fa-fire" style={{ color: '#f4911a' }} />
                  </span>
                  <span className="suggestion-text">{search}</span>
                </button>
              ))}
            </>
          ) : (
            <>
              <div className="suggestions-empty">
                <i className="fa-solid fa-search" />
                <span>No suggestions found</span>
              </div>
            </>
          )}

          {/* Search Tips */}
          {!query.trim() && (
            <div className="search-tips">
              <div className="tips-header">
                <i className="fa-solid fa-lightbulb" />
                <span>Search Tips</span>
              </div>
              <div className="tips-list">
                <div className="tip-item">
                  <kbd>react hooks</kbd> finds exact phrase
                </div>
                <div className="tip-item">
                  <kbd>async OR await</kbd> finds either term
                </div>
                <div className="tip-item">
                  <kbd>function -arrow</kbd> excludes arrow functions
                </div>
                <div className="tip-item">
                  <kbd>Ctrl + K</kbd> quick search shortcut
                </div>
              </div>
            </div>
          )}

          {/* Voice Search Status */}
          {isListening && (
            <div className="voice-search-status">
              <div className="voice-indicator">
                <span className="voice-pulse" />
                <i className="fa-solid fa-microphone" />
              </div>
              <span>Listening...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
