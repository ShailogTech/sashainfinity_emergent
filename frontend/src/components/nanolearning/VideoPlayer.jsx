import { useState, useRef, useEffect, useCallback } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import './VideoPlayer.css';

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const VideoPlayer = ({
  src,
  poster,
  autoPlay = false,
  onProgress,
  onComplete,
  onTimeUpdate,
  markers = [],
  duration: propDuration,
  showControls = true,
  chunkDuration = 300 // 5 minutes in seconds
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(propDuration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControlsState] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [activeChunk, setActiveChunk] = useState(0);
  const [bookmarks, setBookmarks] = useState([]);

  // Calculate chunks
  const totalChunks = duration ? Math.ceil(duration / chunkDuration) : 0;
  const chunks = Array.from({ length: totalChunks }, (_, i) => ({
    index: i,
    start: i * chunkDuration,
    end: Math.min((i + 1) * chunkDuration, duration),
    title: i === 0 ? 'Introduction' : i === totalChunks - 1 ? 'Conclusion' : `Part ${i + 1}`
  }));

  // Fade animation for controls
  const controlsAnimation = useSpring({
    opacity: showControls ? 1 : 0,
    config: { duration: 300 }
  });

  // Reset controls timeout
  const resetControlsTimeout = useCallback(() => {
    setShowControlsState(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControlsState(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Setup video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);

      // Update active chunk
      const chunkIndex = Math.min(Math.floor(time / chunkDuration), totalChunks - 1);
      setActiveChunk(chunkIndex);

      // Call onProgress callback
      if (onProgress && Math.floor(time) % 5 === 0) {
        onProgress({
          currentTime: time,
          duration: video.duration,
          percent: (time / video.duration) * 100
        });
      }

      // Call onTimeUpdate callback
      if (onTimeUpdate) {
        onTimeUpdate(time);
      }

      // Check for completion
      if (time >= video.duration - 0.5 && onComplete) {
        onComplete();
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBufferProgress((bufferedEnd / video.duration) * 100);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onComplete) onComplete();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('ended', handleEnded);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [chunkDuration, totalChunks, onProgress, onTimeUpdate, onComplete]);

  // Auto-play
  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  }, [autoPlay]);

  // Handle mouse movement for controls visibility
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = () => resetControlsTimeout();
    const handleClick = () => resetControlsTimeout();

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
    };
  }, [resetControlsTimeout]);

  // Control functions
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    resetControlsTimeout();
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * video.duration;

    video.currentTime = newTime;
    setCurrentTime(newTime);
    resetControlsTimeout();
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    video.muted = false;
    setVolume(newVolume);
    setIsMuted(false);
    resetControlsTimeout();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
    resetControlsTimeout();
  };

  const handleSpeedChange = (speed) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    resetControlsTimeout();
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.currentTime + 10, video.duration);
    resetControlsTimeout();
  };

  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(video.currentTime - 10, 0);
    resetControlsTimeout();
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
    resetControlsTimeout();
  };

  const jumpToChunk = (chunkIndex) => {
    const video = videoRef.current;
    if (!video || !chunks[chunkIndex]) return;

    video.currentTime = chunks[chunkIndex].start;
    if (!isPlaying) {
      video.play();
    }
    resetControlsTimeout();
  };

  const jumpToMarker = (timestamp) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = timestamp;
    resetControlsTimeout();
  };

  const addBookmark = () => {
    const video = videoRef.current;
    if (!video) return;

    const newBookmark = {
      time: video.currentTime,
      label: `Bookmark at ${formatTime(video.currentTime)}`
    };

    setBookmarks([...bookmarks, newBookmark]);
    resetControlsTimeout();
  };

  const formatTime = (seconds) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`video-player-container ${isFullscreen ? 'fullscreen' : ''}`}
    >
      <div className="video-player-wrapper">
        {/* Video Element */}
        <video
          ref={videoRef}
          className="video-element"
          src={src}
          poster={poster}
          onClick={togglePlayPause}
        />

        {/* Controls Overlay */}
        {showControls && (
          <animated.div
            style={controlsAnimation}
            className="video-controls-overlay"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress Bar */}
            <div className="video-progress-bar" onClick={handleSeek}>
              {/* Buffer Progress */}
              <div
                className="video-progress-buffer"
                style={{ width: `${bufferProgress}%` }}
              />

              {/* Played Progress */}
              <div
                className="video-progress-played"
                style={{ width: `${progressPercent}%` }}
              />

              {/* Chunk Indicators */}
              {chunks.map((chunk, i) => {
                const startPercent = (chunk.start / duration) * 100;
                const widthPercent = ((chunk.end - chunk.start) / duration) * 100;

                return (
                  <div
                    key={i}
                    className={`video-chunk-indicator ${
                      activeChunk === i ? 'active' : ''
                    } ${currentTime >= chunk.end ? 'completed' : ''}`}
                    style={{
                      left: `${startPercent}%`,
                      width: `${widthPercent}%`
                    }}
                    title={chunk.title}
                    onClick={(e) => {
                      e.stopPropagation();
                      jumpToChunk(i);
                    }}
                  >
                    <span className="chunk-number">{i + 1}</span>
                  </div>
                );
              })}

              {/* Markers */}
              {markers.map((marker, i) => {
                const markerPercent = (marker.time / duration) * 100;
                return (
                  <button
                    key={i}
                    className="video-marker"
                    style={{ left: `${markerPercent}%` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      jumpToMarker(marker.time);
                    }}
                    title={marker.label || `Marker at ${formatTime(marker.time)}`}
                  >
                    <i className="fa-solid fa-circle"></i>
                  </button>
                );
              })}

              {/* Scrubber Handle */}
              <div
                className="video-progress-handle"
                style={{ left: `${progressPercent}%` }}
              >
                <div className="handle-knob"></div>
              </div>

              {/* Time Tooltip */}
              <div
                className="video-time-tooltip"
                style={{ left: `${progressPercent}%` }}
              >
                {formatTime(currentTime)}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="video-controls-buttons">
              {/* Play/Pause */}
              <button
                className="video-control-btn video-play-btn"
                onClick={togglePlayPause}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
              </button>

              {/* Skip Backward */}
              <button
                className="video-control-btn"
                onClick={skipBackward}
                title="Skip backward 10s"
              >
                <i className="fa-solid fa-backward"></i>
                <span>10</span>
              </button>

              {/* Skip Forward */}
              <button
                className="video-control-btn"
                onClick={skipForward}
                title="Skip forward 10s"
              >
                <i className="fa-solid fa-forward"></i>
                <span>10</span>
              </button>

              {/* Volume */}
              <div className="video-volume-control">
                <button
                  className="video-control-btn"
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  <i
                    className={`fa-solid ${
                      isMuted || volume === 0
                        ? 'fa-volume-mute'
                        : volume < 0.5
                        ? 'fa-volume-low'
                        : 'fa-volume-high'
                    }`}
                  ></i>
                </button>
                <input
                  type="range"
                  className="video-volume-slider"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                />
              </div>

              {/* Time Display */}
              <div className="video-time-display">
                <span className="current-time">{formatTime(currentTime)}</span>
                <span className="time-divider">/</span>
                <span className="total-time">{formatTime(duration)}</span>
              </div>

              {/* Chunk Indicator */}
              {totalChunks > 1 && (
                <div className="video-chunk-display">
                  <span className="chunk-current">{activeChunk + 1}</span>
                  <span className="chunk-divider">/</span>
                  <span className="chunk-total">{totalChunks}</span>
                  <span className="chunk-label">parts</span>
                </div>
              )}

              {/* Playback Speed */}
              <div className="video-speed-control">
                {SPEED_OPTIONS.map((speed) => (
                  <button
                    key={speed}
                    className={`video-speed-btn ${
                      playbackSpeed === speed ? 'active' : ''
                    }`}
                    onClick={() => handleSpeedChange(speed)}
                    title={`${speed}x speed`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              {/* Bookmark */}
              <button
                className="video-control-btn"
                onClick={addBookmark}
                title="Add bookmark"
              >
                <i className="fa-solid fa-bookmark"></i>
              </button>

              {/* Fullscreen */}
              <button
                className="video-control-btn"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                <i
                  className={`fa-solid ${
                    isFullscreen ? 'fa-compress' : 'fa-expand'
                  }`}
                ></i>
              </button>
            </div>
          </animated.div>
        )}

        {/* Play Button Overlay (when paused and not seeking) */}
        {!isPlaying && (
          <div className="video-play-overlay" onClick={togglePlayPause}>
            <div className="video-play-button">
              <i className="fa-solid fa-play"></i>
            </div>
          </div>
        )}
      </div>

      {/* Bookmarks Panel */}
      {bookmarks.length > 0 && (
        <div className="video-bookmarks-panel">
          <h4>
            <i className="fa-solid fa-bookmark"></i>
            Bookmarks
          </h4>
          <div className="video-bookmarks-list">
            {bookmarks.map((bookmark, i) => (
              <button
                key={i}
                className="video-bookmark-item"
                onClick={() => jumpToMarker(bookmark.time)}
              >
                <span className="bookmark-time">
                  {formatTime(bookmark.time)}
                </span>
                <span className="bookmark-label">{bookmark.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chunk Navigation Panel */}
      {totalChunks > 1 && (
        <div className="video-chunk-nav">
          <h4>
            <i className="fa-solid fa-layer-group"></i>
            5-Minute Chunks
          </h4>
          <div className="video-chunk-buttons">
            {chunks.map((chunk, i) => (
              <button
                key={i}
                className={`video-chunk-btn ${
                  activeChunk === i ? 'active' : ''
                } ${currentTime >= chunk.end ? 'completed' : ''}`}
                onClick={() => jumpToChunk(i)}
                title={chunk.title}
              >
                <span className="chunk-btn-number">{i + 1}</span>
                <span className="chunk-btn-label">{chunk.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
