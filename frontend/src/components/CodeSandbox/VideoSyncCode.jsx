import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Code,
  Clock,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Volume2,
  VolumeX,
  Maximize2,
  Settings,
  X
} from 'lucide-react';
import './CodeSandbox.css';

const VideoSyncCode = ({
  videoUrl = '',
  videoId = '',
  codeSnippets = [],
  onSnippetLoad,
  onTimeUpdate,
  onPlay,
  onPause,
  onSeek,
  autoLoadSnippet = true,
  height = '200px'
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentSnippet, setCurrentSnippet] = useState(null);
  const [showTimeline, setShowTimeline] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [snippetsTimeline, setSnippetsTimeline] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);

  // Process snippets into timeline
  useEffect(() => {
    const timeline = codeSnippets
      .map((snippet, index) => ({
        ...snippet,
        index,
        timestamp: snippet.timestamp || 0,
        title: snippet.title || `Code Snippet ${index + 1}`,
        code: snippet.code || '',
        language: snippet.language || 'javascript'
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    setSnippetsTimeline(timeline);
  }, [codeSnippets]);

  // Find current snippet based on time
  useEffect(() => {
    const activeSnippet = snippetsTimeline.find(
      snippet => currentTime >= snippet.timestamp && currentTime < snippet.timestamp + 15
    );

    if (activeSnippet && activeSnippet !== currentSnippet) {
      setCurrentSnippet(activeSnippet);
      const index = snippetsTimeline.indexOf(activeSnippet);
      setActiveIndex(index);

      // Auto-load snippet code
      if (autoLoadSnippet && onSnippetLoad) {
        onSnippetLoad(activeSnippet);
      }
    }

    if (onTimeUpdate) {
      onTimeUpdate(currentTime);
    }
  }, [currentTime, snippetsTimeline, currentSnippet, autoLoadSnippet, onSnippetLoad, onTimeUpdate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      if (onPause) onPause();
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      if (onPlay) onPlay();
    }
  }, [isPlaying, onPlay, onPause]);

  const handleSkip = useCallback((direction) => {
    const newIndex = direction === 'forward'
      ? Math.min(activeIndex + 1, snippetsTimeline.length - 1)
      : Math.max(activeIndex - 1, 0);

    if (snippetsTimeline[newIndex]) {
      const snippet = snippetsTimeline[newIndex];
      const time = snippet.timestamp;

      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
      setCurrentTime(time);
      setActiveIndex(newIndex);

      if (onSeek) onSeek(time);
      if (onSnippetLoad) onSnippetLoad(snippet);
    }
  }, [activeIndex, snippetsTimeline, onSeek, onSnippetLoad]);

  const handleSeek = useCallback((e) => {
    if (!progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const time = pos * duration;

    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    setCurrentTime(time);

    if (onSeek) onSeek(time);
  }, [duration, onSeek]);

  const handleSnippetClick = useCallback((snippet) => {
    const time = snippet.timestamp;

    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    setCurrentTime(time);
    setActiveIndex(snippet.index);

    if (onSeek) onSeek(time);
    if (onSnippetLoad) onSnippetLoad(snippet);
  }, [onSeek, onSnippetLoad]);

  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);

    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (videoRef.current) {
        videoRef.current.muted = newMuted;
      }
      return newMuted;
    });
  }, []);

  const handleSpeedChange = useCallback((speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, []);

  const handleFullscreenToggle = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`video-sync-code-container ${isFullscreen ? 'fullscreen' : ''}`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* Video Element (hidden but functional) */}
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          className="hidden"
          onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          onEnded={() => {
            setIsPlaying(false);
            if (onPause) onPause();
          }}
          onPlay={() => {
            setIsPlaying(true);
            if (onPlay) onPlay();
          }}
          onPause={() => {
            setIsPlaying(false);
            if (onPause) onPause();
          }}
        />
      )}

      {/* Main Header */}
      <div className="sync-header">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-blue-400">
            <Code className="w-5 h-5" />
            <span className="font-semibold">Video Code Sync</span>
          </div>

          {currentSnippet && (
            <div className="flex items-center gap-2 text-sm">
              <Code className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{currentSnippet.title}</span>
              <span className="text-gray-500">at</span>
              <span className="text-blue-400 font-mono">{formatTime(currentSnippet.timestamp)}</span>
              {currentSnippet.language && (
                <span className="px-2 py-0.5 rounded text-xs bg-blue-600 text-white">
                  {currentSnippet.language}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSkip('backward')}
            disabled={activeIndex <= 0}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
            title="Previous snippet"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={handlePlayPause}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={() => handleSkip('forward')}
            disabled={activeIndex >= snippetsTimeline.length - 1}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
            title="Next snippet"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-700 mx-1" />

          <button
            onClick={handleMuteToggle}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20"
            title="Volume"
          />

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Toggle timeline"
          >
            <Clock className="w-4 h-4" />
          </button>

          <button
            onClick={handleFullscreenToggle}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Playback Speed:</span>
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={`px-2 py-1 rounded text-sm ${
                  playbackSpeed === speed
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-mono w-12">{formatTime(currentTime)}</span>

          <div
            ref={progressRef}
            className="relative flex-1 h-2 bg-gray-700 rounded-full cursor-pointer group"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-100"
              style={{ width: `${progressPercentage}%` }}
            />

            {/* Snippet markers */}
            {snippetsTimeline.map((snippet, index) => {
              const position = duration > 0 ? (snippet.timestamp / duration) * 100 : 0;
              const isActive = index === activeIndex;

              return (
                <button
                  key={snippet.index}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSnippetClick(snippet);
                  }}
                  className={`absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 top-1/2 transition-all ${
                    isActive
                      ? 'bg-blue-500 scale-125 shadow-lg shadow-blue-500/50'
                      : 'bg-gray-600 hover:bg-gray-500 hover:scale-110'
                  }`}
                  style={{ left: `${position}%` }}
                  title={`${snippet.title} at ${formatTime(snippet.timestamp)}`}
                />
              );
            })}

            {/* Hover indicator */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 rounded-full transition-opacity pointer-events-none" />
          </div>

          <span className="text-xs text-gray-400 font-mono w-12 text-right">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Timeline Panel */}
      {showTimeline && (
        <div className="timeline-panel">
          {snippetsTimeline.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No code snippets synced yet</p>
              <p className="text-xs mt-1">Add snippets to code along with the video</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {snippetsTimeline.map((snippet, index) => {
                const isActive = index === activeIndex;
                const isPast = index < activeIndex;

                return (
                  <button
                    key={snippet.index}
                    onClick={() => handleSnippetClick(snippet)}
                    className={`p-3 rounded-lg border transition-all text-left ${
                      isActive
                        ? 'bg-blue-600/20 border-blue-500'
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {isPast ? (
                        <BookmarkCheck className="w-4 h-4 text-green-400" />
                      ) : isActive ? (
                        <Bookmark className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Code className="w-4 h-4 text-gray-500" />
                      )}

                      <span className={`font-medium text-sm ${isActive ? 'text-white' : 'text-gray-300'}`}>
                        {snippet.title}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className={`font-mono text-xs ${isActive ? 'text-blue-400' : 'text-gray-500'}`}>
                        {formatTime(snippet.timestamp)}
                      </span>

                      {snippet.language && (
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {snippet.language}
                        </span>
                      )}
                    </div>

                    {snippet.description && (
                      <p className={`text-xs mt-2 line-clamp-2 ${isActive ? 'text-blue-200' : 'text-gray-500'}`}>
                        {snippet.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .video-sync-code-container {
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .video-sync-code-container.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          border-radius: 0;
        }

        .timeline-panel {
          padding: 12px 16px;
          background: rgba(31, 41, 55, 0.6);
          backdrop-filter: blur(4px);
          border-top: 1px solid var(--glass-border);
          max-height: 300px;
          overflow-y: auto;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default VideoSyncCode;
