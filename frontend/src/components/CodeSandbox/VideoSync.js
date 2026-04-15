import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function VideoSync({
  videoId,
  videoUrl,
  onCodeLoad,
  onTimestampSync
}) {
  const [snippets, setSnippets] = useState([]);
  const [currentSnippet, setCurrentSnippet] = useState(null);
  const [videoTime, setVideoTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTimeline, setShowTimeline] = useState(true);
  const videoRef = useRef(null);
  const syncThreshold = 2; // seconds tolerance for sync

  // Fetch code snippets for this video
  useEffect(() => {
    const fetchSnippets = async () => {
      if (!videoId) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('auth_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(
          `${API_BASE}/api/sandbox/snippets?video_id=${videoId}`,
          { headers }
        );

        // Sort snippets by timestamp
        const sorted = response.data.sort((a, b) => a.timestamp - b.timestamp);
        setSnippets(sorted);

        // Load first snippet if available
        if (sorted.length > 0 && onCodeLoad) {
          onCodeLoad(sorted[0]);
          setCurrentSnippet(sorted[0]);
        }
      } catch (err) {
        console.error('Failed to load code snippets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSnippets();
  }, [videoId, onCodeLoad]);

  // Sync code with video timestamp
  useEffect(() => {
    if (!videoTime || snippets.length === 0) return;

    // Find the snippet closest to current time
    const closestSnippet = snippets.find(snippet =>
      Math.abs(snippet.timestamp - videoTime) <= syncThreshold
    );

    if (closestSnippet && currentSnippet?.id !== closestSnippet.id) {
      setCurrentSnippet(closestSnippet);
      if (onCodeLoad) {
        onCodeLoad(closestSnippet);
      }
    }
  }, [videoTime, snippets, currentSnippet, onCodeLoad]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      setVideoTime(currentTime);
    }
  }, []);

  const handleSnippetClick = (snippet) => {
    setCurrentSnippet(snippet);
    if (onCodeLoad) {
      onCodeLoad(snippet);
    }
    // Jump video to snippet timestamp
    if (videoRef.current && snippet.timestamp > 0) {
      videoRef.current.currentTime = snippet.timestamp;
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const addSnippetAtCurrentTime = (code, language) => {
    const newSnippet = {
      title: `Snippet at ${formatTime(videoTime)}`,
      description: `Code at timestamp ${formatTime(videoTime)}`,
      code,
      language,
      timestamp: videoTime,
      video_id: videoId
    };

    setSnippets(prev => [...prev, { ...newSnippet, id: `temp-${Date.now()}` }]);
    setCurrentSnippet(newSnippet);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSnippetPosition = (timestamp, duration) => {
    if (!duration) return 0;
    return (timestamp / duration) * 100;
  };

  if (loading) {
    return (
      <div className="video-sync-loading">
        <div className="spinner"></div>
        <p>Loading code snippets...</p>
      </div>
    );
  }

  return (
    <div className="video-sync-wrapper">
      <div className="video-sync-header">
        <h3>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <line x1="7" y1="2" x2="7" y2="22" />
            <line x1="17" y1="2" x2="17" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="2" y1="7" x2="7" y2="7" />
            <line x1="2" y1="17" x2="7" y2="17" />
            <line x1="17" y1="17" x2="22" y2="17" />
            <line x1="17" y1="7" x2="22" y2="7" />
          </svg>
          Video-Synced Code
        </h3>
        <button
          className="timeline-toggle"
          onClick={() => setShowTimeline(!showTimeline)}
          title={showTimeline ? 'Hide timeline' : 'Show timeline'}
        >
          {showTimeline ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </button>
      </div>

      {videoUrl && (
        <div className="video-player-container">
          <video
            ref={videoRef}
            className="video-player"
            src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            controls
          />
        </div>
      )}

      {showTimeline && snippets.length > 0 && (
        <div className="snippets-timeline">
          <div className="timeline-track">
            {snippets.map((snippet, index) => (
              <button
                key={snippet.id || index}
                className={`timeline-marker ${currentSnippet?.id === snippet.id ? 'active' : ''}`}
                style={{ left: `${getSnippetPosition(snippet.timestamp, videoRef.current?.duration || 100)}%` }}
                onClick={() => handleSnippetClick(snippet)}
                title={`${snippet.title} at ${formatTime(snippet.timestamp)}`}
              >
                <span className="marker-number">{index + 1}</span>
              </button>
            ))}
            <div
              className="timeline-progress"
              style={{ width: `${getSnippetPosition(videoTime, videoRef.current?.duration || 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="snippets-list">
        <div className="snippets-header">
          <span>Code Snippets</span>
          <span className="snippet-count">{snippets.length}</span>
        </div>

        {snippets.length === 0 ? (
          <div className="snippets-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            <p>No code snippets for this video yet</p>
            <p className="hint">Create your first snippet in the editor</p>
          </div>
        ) : (
          <div className="snippets-items">
            {snippets.map((snippet, index) => (
              <button
                key={snippet.id || index}
                className={`snippet-item ${currentSnippet?.id === snippet.id ? 'active' : ''}`}
                onClick={() => handleSnippetClick(snippet)}
              >
                <div className="snippet-item-left">
                  <span className="snippet-number">{index + 1}</span>
                  <div className="snippet-info">
                    <span className="snippet-title">{snippet.title}</span>
                    <span className="snippet-meta">
                      <span className="snippet-timestamp">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {formatTime(snippet.timestamp)}
                      </span>
                      <span className="snippet-lang">{snippet.language}</span>
                    </span>
                  </div>
                </div>
                <svg
                  className="snippet-play-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .video-sync-wrapper {
          display: flex;
          flex-direction: column;
          gap: 16px;
          height: 100%;
        }

        .video-sync-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #858585;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #3c3c3c;
          border-top-color: var(--sasha-primary, #f4911a);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 12px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .video-sync-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #252526;
          border-radius: 12px;
        }

        .video-sync-header h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #cccccc;
        }

        .timeline-toggle {
          padding: 6px;
          background: #3c3c3c;
          border: none;
          border-radius: 6px;
          color: #858585;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .timeline-toggle:hover {
          background: #4c4c4c;
          color: #cccccc;
        }

        .video-player-container {
          border-radius: 12px;
          overflow: hidden;
          background: #000;
        }

        .video-player {
          width: 100%;
          max-height: 300px;
          display: block;
        }

        .snippets-timeline {
          padding: 12px 0;
        }

        .timeline-track {
          position: relative;
          height: 32px;
          background: #1e1e1e;
          border-radius: 16px;
          border: 1px solid #3c3c3c;
        }

        .timeline-progress {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: rgba(244, 145, 26, 0.2);
          border-radius: 16px 0 0 16px;
          pointer-events: none;
        }

        .timeline-marker {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 24px;
          height: 24px;
          background: #3c3c3c;
          border: 2px solid #858585;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .timeline-marker:hover {
          transform: translate(-50%, -50%) scale(1.2);
          border-color: var(--sasha-primary, #f4911a);
        }

        .timeline-marker.active {
          background: var(--sasha-primary, #f4911a);
          border-color: var(--sasha-primary, #f4911a);
          box-shadow: 0 0 0 4px rgba(244, 145, 26, 0.3);
        }

        .marker-number {
          font-size: 10px;
          font-weight: 700;
          color: #cccccc;
        }

        .timeline-marker.active .marker-number {
          color: #ffffff;
        }

        .snippets-list {
          flex: 1;
          background: #1e1e1e;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .snippets-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #252526;
          border-bottom: 1px solid #3c3c3c;
          font-size: 13px;
          font-weight: 600;
          color: #cccccc;
        }

        .snippet-count {
          padding: 2px 8px;
          background: #3c3c3c;
          border-radius: 10px;
          font-size: 11px;
          color: #858585;
        }

        .snippets-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px;
          color: #858585;
          text-align: center;
        }

        .snippets-empty svg {
          opacity: 0.3;
          margin-bottom: 12px;
        }

        .snippets-empty .hint {
          font-size: 12px;
          margin-top: 4px;
        }

        .snippets-items {
          overflow-y: auto;
          padding: 8px;
        }

        .snippet-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #252526;
          border: 1px solid transparent;
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .snippet-item:hover {
          background: #2a2d2e;
          border-color: #3c3c3c;
        }

        .snippet-item.active {
          background: rgba(244, 145, 26, 0.1);
          border-color: rgba(244, 145, 26, 0.3);
        }

        .snippet-item-left {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .snippet-number {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #3c3c3c;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          color: #858585;
        }

        .snippet-item.active .snippet-number {
          background: var(--sasha-primary, #f4911a);
          color: #ffffff;
        }

        .snippet-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .snippet-title {
          font-size: 13px;
          font-weight: 500;
          color: #cccccc;
          text-align: left;
        }

        .snippet-meta {
          display: flex;
          gap: 12px;
          font-size: 11px;
          color: #858585;
        }

        .snippet-timestamp {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .snippet-lang {
          padding: 2px 6px;
          background: #1e1e1e;
          border-radius: 4px;
          font-size: 10px;
          text-transform: uppercase;
        }

        .snippet-play-icon {
          color: #858585;
          transition: all 0.2s ease;
        }

        .snippet-item:hover .snippet-play-icon {
          color: var(--sasha-primary, #f4911a);
        }

        .snippets-items::-webkit-scrollbar {
          width: 6px;
        }

        .snippets-items::-webkit-scrollbar-track {
          background: transparent;
        }

        .snippets-items::-webkit-scrollbar-thumb {
          background: #3c3c3c;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}
