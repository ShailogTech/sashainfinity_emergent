import { useState, useRef, useEffect } from "react";
import GlassCard from "@/components/ui/GlassCard";

export default function NanoVideoPlayer({
  chapter,
  markers = [],
  onProgressUpdate,
  onComplete,
  autoPlay = true
}) {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(chapter.duration || 300);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [showMarkers, setShowMarkers] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [skipIntro, setSkipIntro] = useState(true);
  const [activeChunk, setActiveChunk] = useState(0);

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Calculate 5-minute chunks
  const totalChunks = Math.ceil(duration / 300);
  const chunks = Array.from({ length: totalChunks }, (_, i) => ({
    index: i,
    start: i * 300,
    end: Math.min((i + 1) * 300, duration),
    title: i === 0 ? "Part 1: Introduction" :
           i === totalChunks - 1 ? "Conclusion" :
           `Part ${i + 1}: Key Concepts`
  }));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentProgress = (video.currentTime / video.duration) * 100;
      setProgress(currentProgress);
      setCurrentTime(video.currentTime);

      // Determine active chunk
      const chunkIndex = Math.floor(video.currentTime / 300);
      setActiveChunk(chunkIndex);

      // Update progress every 5 seconds
      if (Math.floor(video.currentTime) % 5 === 0) {
        onProgressUpdate?.({
          video_progress: Math.round(currentProgress),
          last_position: Math.round(video.currentTime),
          video_completed: currentProgress >= 95
        });
      }

      // Auto-complete threshold
      if (currentProgress >= 95) {
        onComplete?.();
      }

      // Show marker when approaching
      const currentMarker = markers.find(m =>
        Math.abs(m.timestamp - video.currentTime) < 2
      );
      if (currentMarker && showMarkers) {
        setTimeout(() => setShowMarkers(false), 3000);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferPercent = (bufferedEnd / video.duration) * 100;
        setBufferProgress(bufferPercent);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [onProgressUpdate, onComplete, markers, showMarkers]);

  // Auto-play next chunk
  useEffect(() => {
    if (autoPlay && isPlaying) {
      const currentChunkEnd = chunks[activeChunk]?.end;
      if (currentTime >= currentChunkEnd && activeChunk < chunks.length - 1) {
        // Smooth transition to next chunk
      }
    }
  }, [currentTime, activeChunk, chunks, autoPlay, isPlaying]);

  // Hide controls after inactivity
  useEffect(() => {
    const resetControlsTimeout = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    if (isPlaying) {
      resetControlsTimeout();
    }

    const container = containerRef.current;
    container?.addEventListener('mousemove', resetControlsTimeout);
    container?.addEventListener('click', resetControlsTimeout);

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      container?.removeEventListener('mousemove', resetControlsTimeout);
      container?.removeEventListener('click', resetControlsTimeout);
    };
  }, [isPlaying]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
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

  const skipToChunk = (chunkIndex) => {
    const video = videoRef.current;
    if (video && chunks[chunkIndex]) {
      video.currentTime = chunks[chunkIndex].start;
      if (!isPlaying) {
        video.play();
      }
    }
  };

  const handleSkipIntro = () => {
    const video = videoRef.current;
    if (video && video.duration > 15) {
      video.currentTime = 15;
    }
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
  const progressPercent = Math.round(progress);

  return (
    <div className="nano-video-player" ref={containerRef}>
      <GlassCard variant="default" className="nano-video-card">
        <div className="nano-video-container">
          <video
            ref={videoRef}
            className="nano-video-element"
            src={chapter.video_url}
            poster={chapter.thumbnail || ""}
            onClick={togglePlayPause}
          />

          {/* Skip Intro Button */}
          {skipIntro && currentTime < 15 && (
            <button className="nano-skip-intro" onClick={handleSkipIntro}>
              Skip Intro <i className="fa-solid fa-forward"></i>
            </button>
          )}

          {/* Chapter Marker Display */}
          {currentMarker && (
            <div className="nano-marker-display">
              <div className="nano-marker-content">
                <h4>{currentMarker.title}</h4>
                {currentMarker.description && (
                  <p>{currentMarker.description}</p>
                )}
              </div>
            </div>
          )}

          {/* Controls Overlay */}
          <div className={`nano-controls-overlay ${showControls ? 'visible' : ''}`}>
            {/* Progress Bar with Markers and Chunks */}
            <div className="nano-progress-section">
              {/* Chunk indicators */}
              <div className="nano-chunk-indicators">
                {chunks.map((chunk, i) => (
                  <div
                    key={i}
                    className={`nano-chunk-indicator ${activeChunk === i ? 'active' : ''} ${currentTime >= chunk.end ? 'completed' : ''}`}
                    style={{
                      left: `${(chunk.start / duration) * 100}%`,
                      width: `${((chunk.end - chunk.start) / duration) * 100}%`
                    }}
                    onClick={() => skipToChunk(i)}
                    title={chunk.title}
                  />
                ))}
              </div>

              <div className="nano-progress-bar">
                <div
                  className="nano-progress-buffered"
                  style={{ width: `${bufferProgress}%` }}
                ></div>
                <div
                  className="nano-progress-filled"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="nano-progress-glow"></div>
                </div>

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
                  value={progressPercent}
                  onChange={handleSeek}
                />
              </div>
            </div>

            {/* Control Buttons */}
            <div className="nano-control-buttons">
              <button
                className="nano-control-btn nano-play-btn"
                onClick={togglePlayPause}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                <i className={`fa-solid ${isPlaying ? "fa-pause" : "fa-play"}`}></i>
              </button>

              {/* Volume Control */}
              <div className="nano-volume-control">
                <button
                  className="nano-control-btn"
                  onClick={() => setVolume(volume > 0 ? 0 : 1)}
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

              {/* Time Display */}
              <div className="nano-time-display">
                <span>{formatTime(currentTime)}</span>
                <span className="nano-time-divider">/</span>
                <span>{formatTime(duration)}</span>
                <span className="nano-chunk-time">
                  (Chunk {activeChunk + 1}/{totalChunks})
                </span>
              </div>

              {/* Playback Speed */}
              <div className="nano-speed-control">
                {['0.5', '0.75', '1', '1.25', '1.5', '2'].map(speed => (
                  <button
                    key={speed}
                    className={`nano-speed-btn ${playbackSpeed === parseFloat(speed) ? 'active' : ''}`}
                    onClick={() => handleSpeedChange(parseFloat(speed))}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              {/* Skip Controls */}
              <div className="nano-skip-controls">
                <button
                  className="nano-control-btn"
                  onClick={() => {
                    const video = videoRef.current;
                    if (video) video.currentTime -= 10;
                  }}
                  title="Back 10s"
                >
                  <i className="fa-solid fa-backward"></i> 10
                </button>
                <button
                  className="nano-control-btn"
                  onClick={() => {
                    const video = videoRef.current;
                    if (video) video.currentTime += 10;
                  }}
                  title="Forward 10s"
                >
                  <i className="fa-solid fa-forward"></i> 10
                </button>
              </div>

              {/* Bookmark Button */}
              <button
                className="nano-control-btn"
                onClick={addBookmark}
                title="Add bookmark"
              >
                <i className="fa-solid fa-bookmark"></i>
              </button>

              {/* Markers Toggle */}
              <button
                className="nano-control-btn"
                onClick={() => setShowMarkers(!showMarkers)}
                title="Toggle markers"
              >
                <i className="fa-solid fa-list"></i>
              </button>

              {/* Fullscreen Button */}
              <button
                className="nano-control-btn"
                onClick={toggleFullscreen}
                title="Toggle fullscreen"
              >
                <i className={`fa-solid ${isFullscreen ? "fa-compress" : "fa-expand"}`}></i>
              </button>
            </div>
          </div>

          {/* Chapter Markers Bar */}
          {showMarkers && markers.length > 0 && (
            <div className="nano-markers-bar">
              <div className="nano-markers-header">
                <h4>Chapter Markers</h4>
              </div>
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
            </div>
          )}
        </div>

        {/* Chapter Info Card */}
        <div className="nano-chapter-info">
          <h3 className="nano-chapter-title">{chapter.title}</h3>
          <p className="nano-chapter-description">{chapter.description}</p>

          <div className="nano-chunk-navigation">
            <span className="nano-chunk-label">5-Minute Chunks:</span>
            <div className="nano-chunk-buttons">
              {chunks.map((chunk, i) => (
                <button
                  key={i}
                  className={`nano-chunk-btn ${activeChunk === i ? 'active' : ''} ${currentTime >= chunk.end ? 'completed' : ''}`}
                  onClick={() => skipToChunk(i)}
                  title={chunk.title}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="nano-chapter-meta">
            <span className="nano-progress-badge">
              <i className="fa-solid fa-chart-line"></i> {progressPercent}%
            </span>
            {progressPercent >= 95 && (
              <span className="nano-completed-badge">
                <i className="fa-solid fa-check-circle"></i> Completed!
              </span>
            )}
            <span className="nano-points-badge">
              <i className="fa-solid fa-star"></i> +{chapter.points || 50} pts
            </span>
          </div>
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
      </GlassCard>
    </div>
  );
}
