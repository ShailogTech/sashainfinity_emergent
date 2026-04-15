import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Code,
  Clock,
  Save,
  Share2,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

const VideoSync = ({
  videoUrl = '',
  codeSnippets = [],
  onSnippetLoad,
  onTimeUpdate,
  currentTime = 0,
  isPlaying = false,
  onPlay,
  onPause,
  onSeek
}) => {
  const [currentSnippet, setCurrentSnippet] = useState(null);
  const [snippetsTimeline, setSnippetsTimeline] = useState([]);
  const [showTimeline, setShowTimeline] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const videoRef = useRef(null);

  useEffect(() => {
    // Process snippets into timeline format
    const timeline = codeSnippets
      .map((snippet, index) => ({
        ...snippet,
        index,
        timestamp: snippet.timestamp || 0,
        title: snippet.title || `Code Snippet ${index + 1}`
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    setSnippetsTimeline(timeline);

    // Find current snippet based on time
    const activeSnippet = timeline.find(
      snippet => currentTime >= snippet.timestamp && currentTime < snippet.timestamp + 10
    );
    setCurrentSnippet(activeSnippet || null);

    // Update active index
    const index = timeline.findIndex(
      snippet => snippet === activeSnippet
    );
    setActiveIndex(index);

  }, [codeSnippets, currentTime]);

  const handleSnippetClick = (snippet) => {
    if (onSeek) {
      onSeek(snippet.timestamp);
    }
    if (onSnippetLoad) {
      onSnippetLoad(snippet);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      if (onPause) onPause();
    } else {
      if (onPlay) onPlay();
    }
  };

  const handleSkip = (direction) => {
    const newIndex = direction === 'forward'
      ? Math.min(activeIndex + 1, snippetsTimeline.length - 1)
      : Math.max(activeIndex - 1, 0);

    if (snippetsTimeline[newIndex]) {
      handleSnippetClick(snippetsTimeline[newIndex]);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const shareCurrentTimestamp = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('t', Math.floor(currentTime).toString());

    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const progressPercentage = snippetsTimeline.length > 0
    ? (activeIndex + 1) / snippetsTimeline.length * 100
    : 0;

  return (
    <div className="video-sync-container bg-gray-900 rounded-lg overflow-hidden">
      {/* Sync Header */}
      <div className="sync-header flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-blue-400">
            <Code className="w-5 h-5" />
            <span className="font-semibold">Code Sync</span>
          </div>

          {currentSnippet && (
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{currentSnippet.title}</span>
              <span className="text-gray-500">at</span>
              <span className="text-blue-400 font-mono">{formatTime(currentSnippet.timestamp)}</span>
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
            onClick={shareCurrentTimestamp}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Share current timestamp"
          >
            {copiedLink ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Toggle timeline"
          >
            <Clock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar px-4 py-2 bg-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-mono w-12">{formatTime(currentTime)}</span>

          <div className="flex-1 relative">
            {/* Background track */}
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              {/* Progress */}
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Snippet markers */}
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex items-center">
              {snippetsTimeline.map((snippet, index) => {
                const position = (snippet.timestamp / Math.max(300, snippetsTimeline[snippetsTimeline.length - 1]?.timestamp || 300)) * 100;
                const isActive = index === activeIndex;

                return (
                  <button
                    key={snippet.index}
                    onClick={() => handleSnippetClick(snippet)}
                    className={`absolute w-3 h-3 rounded-full transform -translate-x-1/2 transition-all ${
                      isActive
                        ? 'bg-blue-500 scale-125 shadow-lg shadow-blue-500/50'
                        : 'bg-gray-600 hover:bg-gray-500 hover:scale-110'
                    }`}
                    style={{ left: `${position}%` }}
                    title={`${snippet.title} at ${formatTime(snippet.timestamp)}`}
                  />
                );
              })}
            </div>
          </div>

          <span className="text-xs text-gray-400 font-mono w-12 text-right">
            {snippetsTimeline.length > 0 ? formatTime(snippetsTimeline[snippetsTimeline.length - 1].timestamp) : '5:00'}
          </span>
        </div>
      </div>

      {/* Timeline Panel */}
      {showTimeline && (
        <div className="timeline-panel px-4 py-3 bg-gray-800 border-t border-gray-700 max-h-64 overflow-y-auto">
          {snippetsTimeline.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No code snippets synced yet</p>
              <p className="text-xs mt-1">Add snippets to code along with the video</p>
            </div>
          ) : (
            <div className="space-y-2">
              {snippetsTimeline.map((snippet, index) => {
                const isActive = index === activeIndex;
                const isPast = index < activeIndex;
                const isFuture = index > activeIndex;

                return (
                  <button
                    key={snippet.index}
                    onClick={() => handleSnippetClick(snippet)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600/20 border border-blue-500'
                        : 'bg-gray-800/50 hover:bg-gray-700/50 border border-transparent hover:border-gray-600'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isPast
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {isPast ? <Check className="w-4 h-4" /> : <Code className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 text-left">
                      <div className={`font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                        {snippet.title}
                      </div>
                      {snippet.description && (
                        <div className={`text-sm mt-0.5 ${isActive ? 'text-blue-200' : 'text-gray-500'}`}>
                          {snippet.description}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-sm ${isActive ? 'text-blue-400' : 'text-gray-500'}`}>
                        {formatTime(snippet.timestamp)}
                      </span>

                      {snippet.language && (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {snippet.language}
                        </span>
                      )}

                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoSync;
