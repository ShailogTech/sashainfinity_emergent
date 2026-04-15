import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import SearchBar from './SearchBar';
import './SearchResults.css';

const SearchResults = ({ initialQuery = '' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get('q') || initialQuery;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    course_id: null,
    instructor: null,
    topic: null,
  });
  const [availableFilters, setAvailableFilters] = useState({
    courses: [],
    instructors: [],
    topics: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  // Load available filters
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const response = await fetch('/api/search/filters/mock');
        if (response.ok) {
          const data = await response.json();
          setAvailableFilters(data);
        }
      } catch (e) {
        console.error('Failed to load filters:', e);
      }
    };
    loadFilters();
  }, []);

  // Search function
  const performSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

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
          max_results: 50,
          filters: Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v != null)
          ),
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (e) {
      console.error('Search error:', e);
      setError('Failed to perform search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Perform search on mount and when query/filters change
  useEffect(() => {
    performSearch();
  }, [query]);

  // Group results by video
  const groupedResults = useMemo(() => {
    const groups = {};
    results.forEach((result) => {
      const key = result.video_id;
      if (!groups[key]) {
        groups[key] = {
          video_id: result.video_id,
          course_id: result.course_id,
          course_title: result.course_title,
          video_title: result.video_title,
          instructor: result.instructor,
          matches: [],
        };
      }
      groups[key].matches.push(result);
    });
    return Object.values(groups).sort((a, b) =>
      a.video_title.localeCompare(b.video_title)
    );
  }, [results]);

  const formatTimestamp = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  const handleResultClick = (result, e) => {
    e.preventDefault();
    // Navigate to video with timestamp
    const videoPath = result.course_id
      ? `/nano/${result.course_id}?t=${Math.floor(result.timestamp)}`
      : `/sandbox/${result.video_id}?t=${Math.floor(result.timestamp)}`;

    navigate(videoPath);
  };

  const handleSearch = (searchQuery) => {
    setSearchParams({ q: searchQuery });
  };

  const toggleFilter = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type] === value ? null : value,
    }));
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      course_id: null,
      instructor: null,
      topic: null,
    });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v != null);

  return (
    <div className="search-results-container">
      {/* Header with Search */}
      <div className="search-results-header">
        <SearchBar
          variant="page"
          placeholder="Search videos, topics, instructors..."
          onSearch={handleSearch}
        />
      </div>

      {/* Filters Toggle */}
      <div className="search-results-controls">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'filter-toggle-btn',
            hasActiveFilters && 'filter-toggle-btn-active'
          )}
        >
          <i className="fa-solid fa-filter" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="filter-badge">
              {Object.values(filters).filter((v) => v != null).length}
            </span>
          )}
          <i
            className={cn(
              'fa-solid fa-chevron-down filter-chevron',
              showFilters && 'filter-chevron-open'
            )}
          />
        </button>

        {hasActiveFilters && (
          <button onClick={clearFilters} className="clear-filters-btn">
            <i className="fa-solid fa-times" />
            <span>Clear Filters</span>
          </button>
        )}

        <div className="results-count">
          {loading ? (
            <span>Searching...</span>
          ) : (
            <span>
              {results.length} {results.length === 1 ? 'result' : 'results'} for "
              {query}"
            </span>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="search-filters-panel">
          <div className="filter-group">
            <h4>Courses</h4>
            <div className="filter-options">
              {availableFilters.courses.slice(0, 10).map((course) => (
                <button
                  key={course}
                  onClick={() => toggleFilter('course_id', course)}
                  className={cn(
                    'filter-option',
                    filters.course_id === course && 'filter-option-active'
                  )}
                >
                  <span>{course}</span>
                  {filters.course_id === course && (
                    <i className="fa-solid fa-check" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Instructors</h4>
            <div className="filter-options">
              {availableFilters.instructors.slice(0, 10).map((instructor) => (
                <button
                  key={instructor}
                  onClick={() => toggleFilter('instructor', instructor)}
                  className={cn(
                    'filter-option',
                    filters.instructor === instructor && 'filter-option-active'
                  )}
                >
                  <span>{instructor}</span>
                  {filters.instructor === instructor && (
                    <i className="fa-solid fa-check" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Topics</h4>
            <div className="filter-options">
              {availableFilters.topics.slice(0, 15).map((topic) => (
                <button
                  key={topic}
                  onClick={() => toggleFilter('topic', topic)}
                  className={cn(
                    'filter-option',
                    filters.topic === topic && 'filter-option-active'
                  )}
                >
                  <span>{topic}</span>
                  {filters.topic === topic && (
                    <i className="fa-solid fa-check" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="search-loading-state">
          <div className="loading-spinner-large" />
          <p>Searching through transcripts...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="search-error-state">
          <i className="fa-solid fa-exclamation-circle" />
          <p>{error}</p>
          <button onClick={() => performSearch()} className="retry-btn">
            <i className="fa-solid fa-redo" />
            Retry
          </button>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && results.length === 0 && query && (
        <div className="search-no-results">
          <div className="no-results-icon">
            <i className="fa-solid fa-search" />
          </div>
          <h3>No results found</h3>
          <p>
            We couldn't find any matches for "<strong>{query}</strong>"
          </p>
          <div className="search-suggestions">
            <p>Try:</p>
            <ul>
              <li>Checking your spelling</li>
              <li>Using different keywords</li>
              <li>Searching for a more general term</li>
              <li>Looking for related topics</li>
            </ul>
          </div>
        </div>
      )}

      {/* Initial State */}
      {!loading && !error && results.length === 0 && !query && (
        <div className="search-initial-state">
          <div className="initial-search-icon">
            <i className="fa-solid fa-video" />
          </div>
          <h3>Search Video Transcripts</h3>
          <p>
            Find exact moments in educational videos. Search for topics,
            phrases, or concepts.
          </p>
          <div className="search-examples">
            <h4>Try searching for:</h4>
            <div className="example-tags">
              {['React hooks', 'async/await', 'CSS Grid', 'Python classes', 'Git commands'].map(
                (example) => (
                  <button
                    key={example}
                    onClick={() => handleSearch(example)}
                    className="example-tag"
                  >
                    {example}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && !error && results.length > 0 && (
        <div className="search-results-list">
          {groupedResults.map((group) => (
            <div key={group.video_id} className="video-result-group">
              <div className="video-result-header">
                <div className="video-thumbnail">
                  <i className="fa-solid fa-play-circle" />
                </div>
                <div className="video-info">
                  <h3>{group.video_title}</h3>
                  <div className="video-meta">
                    <span className="course-badge">
                      <i className="fa-solid fa-book" />
                      {group.course_title}
                    </span>
                    <span className="instructor-badge">
                      <i className="fa-solid fa-user" />
                      {group.instructor}
                    </span>
                    <span className="matches-count">
                      {group.matches.length}{' '}
                      {group.matches.length === 1 ? 'match' : 'matches'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="video-matches-list">
                {group.matches
                  .sort((a, b) => a.timestamp - b.timestamp)
                  .slice(0, 10)
                  .map((match, idx) => (
                    <Link
                      key={`${match.video_id}-${match.timestamp}-${idx}`}
                      to={
                        match.course_id
                          ? `/nano/${match.course_id}?t=${Math.floor(match.timestamp)}`
                          : `/sandbox/${match.video_id}?t=${Math.floor(match.timestamp)}`
                      }
                      onClick={(e) => handleResultClick(match, e)}
                      className="match-result-item"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="match-timestamp">
                        <i className="fa-solid fa-clock" />
                        {formatTimestamp(match.timestamp)}
                      </div>
                      <div className="match-content">
                        {match.context_before && (
                          <span className="match-context-before">
                            {match.context_before}
                          </span>
                        )}
                        <span
                          className="match-text"
                          dangerouslySetInnerHTML={{
                            __html: highlightMatch(match.matched_text, query),
                          }}
                        />
                        {match.context_after && (
                          <span className="match-context-after">
                            {match.context_after}
                          </span>
                        )}
                      </div>
                      <div className="match-confidence">
                        <div
                          className="confidence-bar"
                          style={{
                            width: `${match.confidence_score * 100}%`,
                            opacity: match.confidence_score,
                          }}
                        />
                      </div>
                      <div className="match-action">
                        <i className="fa-solid fa-external-link-alt" />
                      </div>
                    </Link>
                  ))}
                {group.matches.length > 10 && (
                  <div className="more-matches">
                    +{group.matches.length - 10} more matches in this video
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
