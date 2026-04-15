import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchBar, SearchResults } from '@/components/Search';
import { useSearch } from '@/hooks/useSearch';
import './SearchPage.css';

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [showResults, setShowResults] = useState(false);

  const {
    trendingSearches,
    resultCount,
    isSearching,
  } = useSearch({ autoSearch: false });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Show results section only when there's an active query
    setShowResults(query.trim().length > 0);
  }, [query]);

  const handleSearch = (searchQuery) => {
    // Navigate to results page with query
    window.location.href = `/search/results?q=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="search-page">
      {!showResults ? (
        <>
          <div className="search-page-hero">
            <div className="search-hero-content">
              <div className="search-hero-badge">
                <i className="fa-solid fa-sparkles" />
                <span>AI-Powered Search</span>
              </div>
              <h1>
                Find Exact Moments in
                <span className="gradient-text"> Educational Videos</span>
              </h1>
              <p>
                Search through thousands of video transcripts with fuzzy matching,
                context awareness, and timestamp precision. Jump directly to the
                moment you need.
              </p>
            </div>
          </div>

          <div className="search-page-content">
            <SearchBar variant="page" autoFocus onSearch={handleSearch} />

            {trendingSearches.length > 0 && !query && (
              <div className="trending-searches">
                <h4>
                  <i className="fa-solid fa-fire" />
                  Trending Searches
                </h4>
                <div className="trending-tags">
                  {trendingSearches.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(term)}
                      className="trending-tag"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="search-features">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fa-solid fa-bullseye" />
              </div>
              <h3>Precision Search</h3>
              <p>Find exact moments with timestamp accuracy down to the second</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fa-solid fa-brain" />
              </div>
              <h3>Fuzzy Matching</h3>
              <p>AI-powered search that understands synonyms and technical terms</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fa-solid fa-quote-left" />
              </div>
              <h3>Context Preview</h3>
              <p>See surrounding text to understand the context before jumping</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fa-solid fa-bolt" />
              </div>
              <h3>Instant Jump</h3>
              <p>Click any result to open the video at the exact timestamp</p>
            </div>
          </div>

          <div className="search-stats">
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Videos Indexed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500K+</div>
              <div className="stat-label">Searchable Moments</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Courses Covered</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">&lt;100ms</div>
              <div className="stat-label">Average Response</div>
            </div>
          </div>
        </>
      ) : (
        <div className="search-page-results">
          <SearchResults initialQuery={query} />
        </div>
      )}
    </div>
  );
}

export default SearchPage;
