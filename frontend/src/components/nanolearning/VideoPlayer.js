import { useState, useRef, useEffect } from "react";

export default function VideoPlayer({ chapter, onProgressUpdate, onComplete, markers = [] }) {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(chapter.duration || 300);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [showMarkers, setShowMarkers] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentProgress = (video.currentTime / video.duration) * 100;
      setProgress(currentProgress);
      setCurrentTime(video.currentTime);

      // Update progress every 5 seconds
      if (Math.floor(video.currentTime) % 5 === 0) {
        onProgressUpdate({
          video_progress: Math.round(currentProgress),
          last_position: Math.round(video.currentTime),
          video_completed: currentProgress >= 95
        });
      }

      // Auto-complete threshold
      if (currentProgress >= 95 && !chapter.completed) {
        onComplete();
      }

      // Check if we're at a marker
      const currentMarker = markers.find(m =>
        Math.abs(m.timestamp - video.currentTime) < 2
      );
      if (currentMarker) {
        setShowMarkers(true);
        setTimeout(() => setShowMarkers(false), 3000);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [onProgressUpdate, onComplete, chapter.completed, markers]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (video) {
      const seekTime = (e.target.value / 100) * video.duration;
      video.currentTime = seekTime;
      setProgress(e.target.value);
    }
  };

  const handleMarkerClick = (timestamp) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = timestamp;
      setCurrentTime(timestamp);
      const newProgress = (timestamp / video.duration) * 100;
      setProgress(newProgress);
    }
  };

  const handleSpeedChange = (speed) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    if (video) {
      video.volume = e.target.value;
      setVolume(e.target.value);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const addBookmark = () => {
    const video = videoRef.current;
    if (video) {
      const newBookmark = {
        timestamp: video.currentTime,
        note: `Bookmark at ${formatTime(video.currentTime)}`
      };
      setBookmarks([...bookmarks, newBookmark]);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentMarker = () => {
    return markers.find(m =>
      currentTime >= m.timestamp && currentTime < m.timestamp + 30
    );
  };

  const currentMarker = getCurrentMarker();

  return (
    <div className="nano-video-player" ref={containerRef}>
      <div className="nano-video-container">
        <video
          ref={videoRef}
          className="nano-video-element"
          src={chapter.video_url}
          poster={chapter.thumbnail || ""}
          controls={false}
        />

        {/* Chapter Marker Display */}
        {currentMarker && showMarkers && (
          <div className="nano-marker-display">
            <div className="nano-marker-content">
              <h4>{currentMarker.title}</h4>
              {currentMarker.description && (
                <p>{currentMarker.description}</p>
              )}
              <button
                className="nano-marker-close"
                onClick={() => setShowMarkers(false)}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
          </div>
        )}

        {/* Custom Controls */}
        <div className="nano-video-controls">
          {/* Progress Bar with Markers */}
          <div className="nano-progress-bar">
            <div
              className="nano-progress-filled"
              style={{ width: `${progress}%` }}
            ></div>

            {/* Chapter Markers */}
            {markers.map((marker, index) => {
              const markerPosition = (marker.timestamp / duration) * 100;
              return (
                <button
                  key={index}
                  className="nano-progress-marker"
                  style={{ left: `${markerPosition}%` }}
                  onClick={() => handleMarkerClick(marker.timestamp)}
                  title={marker.title}
                >
                  <i className="fa-solid fa-circle"></i>
                </button>
              );
            })}

            <input
              type="range"
              className="nano-progress-slider"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
            />
          </div>

          <div className="nano-control-buttons">
            <button
              className="nano-play-btn"
              onClick={togglePlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              <i className={`fa-solid ${isPlaying ? "fa-pause" : "fa-play"}`}></i>
            </button>

            {/* Volume Control */}
            <div className="nano-volume-control">
              <button
                className="nano-volume-btn"
                onClick={() => handleVolumeChange({ target: { value: volume > 0 ? 0 : 1 } })}
              >
                <i className={`fa-solid ${volume > 0 ? "fa-volume-up" : "fa-volume-mute"}`}></i>
              </button>
              <input
                type="range"
                className="nano-volume-slider"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
              />
            </div>

            <div className="nano-time-display">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Playback Speed */}
            <div className="nano-speed-control">
              <button
                className="nano-speed-btn"
                onClick={() => {
                  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
                  const currentIndex = speeds.indexOf(playbackSpeed);
                  const nextIndex = (currentIndex + 1) % speeds.length;
                  handleSpeedChange(speeds[nextIndex]);
                }}
              >
                {playbackSpeed}x
              </button>
            </div>

            {/* Bookmark Button */}
            <button
              className="nano-bookmark-btn"
              onClick={addBookmark}
              title="Add bookmark"
            >
              <i className="fa-solid fa-bookmark"></i>
            </button>

            {/* Fullscreen Button */}
            <button
              className="nano-fullscreen-btn"
              onClick={toggleFullscreen}
              title="Toggle fullscreen"
            >
              <i className={`fa-solid ${isFullscreen ? "fa-compress" : "fa-expand"}`}></i>
            </button>

            <div className="nano-chapter-info">
              <span className="nano-chapter-title">{chapter.title}</span>
              <span className="nano-chapter-duration">
                <i className="fa-solid fa-clock"></i> {Math.ceil(duration / 60)} min target
              </span>
            </div>
          </div>
        </div>

        {/* Chapter Markers Bar */}
        {markers.length > 0 && (
          <div className="nano-markers-bar">
            <div className="nano-markers-header">
              <h4>Chapter Markers</h4>
              <button
                className="nano-markers-toggle"
                onClick={() => setShowMarkers(!showMarkers)}
              >
                <i className={`fa-solid ${showMarkers ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
              </button>
            </div>
            {showMarkers && (
              <div className="nano-markers-list">
                {markers.map((marker, index) => (
                  <button
                    key={index}
                    className={`nano-marker-item ${currentTime >= marker.timestamp && currentTime < marker.timestamp + 30 ? 'active' : ''}`}
                    onClick={() => handleMarkerClick(marker.timestamp)}
                  >
                    <div className="nano-marker-time">{formatTime(marker.timestamp)}</div>
                    <div className="nano-marker-info">
                      <div className="nano-marker-title">{marker.title}</div>
                      {marker.description && (
                        <div className="nano-marker-desc">{marker.description}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chapter Info Card */}
      <div className="nano-chapter-card">
        <h3 className="nano-chapter-title-text">{chapter.title}</h3>
        <p className="nano-chapter-description">{chapter.description}</p>
        <div className="nano-chapter-meta">
          <span className="nano-progress-badge">
            <i className="fa-solid fa-chart-line"></i> {Math.round(progress)}% Complete
          </span>
          {progress >= 95 && (
            <span className="nano-completed-badge">
              <i className="fa-solid fa-check-circle"></i> Completed!
            </span>
          )}
        </div>

        {/* Bookmarks */}
        {bookmarks.length > 0 && (
          <div className="nano-bookmarks-section">
            <h4>Your Bookmarks</h4>
            <div className="nano-bookmarks-list">
              {bookmarks.map((bookmark, index) => (
                <button
                  key={index}
                  className="nano-bookmark-item"
                  onClick={() => handleMarkerClick(bookmark.timestamp)}
                >
                  <i className="fa-solid fa-bookmark"></i>
                  {formatTime(bookmark.timestamp)} - {bookmark.note}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
