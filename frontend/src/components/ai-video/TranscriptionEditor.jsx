import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const TranscriptionEditor = ({ videoId, transcript, onSave, language = 'en' }) => {
  const [segments, setSegments] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [editingSegment, setEditingSegment] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [exportFormat, setExportFormat] = useState('srt');
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    if (transcript && transcript.transcript) {
      setSegments(transcript.transcript);
    }
  }, [transcript]);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const results = segments
      .map((seg, index) => ({
        index,
        ...seg,
        text: seg.text || ''
      }))
      .filter(seg =>
        seg.text.toLowerCase().includes(searchQuery.toLowerCase())
      );

    setSearchResults(results);
    setCurrentSearchIndex(0);
  }, [searchQuery, segments]);

  const formatTimestamp = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleSegmentEdit = (index) => {
    setEditingSegment(index);
    setEditedText(segments[index].text);
  };

  const handleSegmentSave = (index) => {
    const updatedSegments = [...segments];
    updatedSegments[index].text = editedText;
    setSegments(updatedSegments);
    setEditingSegment(null);

    // Auto-save callback
    onSave?.(updatedSegments);
  };

  const handleSegmentCancel = () => {
    setEditingSegment(null);
    setEditedText('');
  };

  const handleTimeAdjust = (index, type, delta) => {
    const updatedSegments = [...segments];
    const segment = updatedSegments[index];

    if (type === 'start') {
      const newStart = Math.max(0, segment.start + delta);
      if (newStart < segment.end - 0.1) {
        segment.start = newStart;
      }
    } else {
      segment.end = Math.max(segment.start + 0.1, segment.end + delta);
    }

    setSegments(updatedSegments);
    onSave?.(updatedSegments);
  };

  const handleSplitSegment = (index, splitTime) => {
    const segment = segments[index];
    const time = splitTime || (segment.start + segment.end) / 2;

    const newSegment = {
      ...segment,
      start: time,
      end: segment.end,
      text: ''
    };

    const updatedSegments = [...segments];
    updatedSegments[index].end = time;
    updatedSegments.splice(index + 1, 0, newSegment);

    setSegments(updatedSegments);
    onSave?.(updatedSegments);
  };

  const handleMergeSegment = (index) => {
    if (index >= segments.length - 1) return;

    const updatedSegments = [...segments];
    const current = updatedSegments[index];
    const next = updatedSegments[index + 1];

    current.text = `${current.text} ${next.text}`;
    current.end = next.end;

    updatedSegments.splice(index + 1, 1);

    setSegments(updatedSegments);
    onSave?.(updatedSegments);
  };

  const handleDeleteSegment = (index) => {
    const updatedSegments = segments.filter((_, i) => i !== index);
    setSegments(updatedSegments);
    onSave?.(updatedSegments);
  };

  const navigateSearch = (direction) => {
    if (searchResults.length === 0) return;

    setCurrentSearchIndex((prev) => {
      let newIndex = prev + direction;
      if (newIndex < 0) newIndex = searchResults.length - 1;
      if (newIndex >= searchResults.length) newIndex = 0;
      return newIndex;
    });
  };

  const highlightSearchText = (text, query) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (part.toLowerCase() === query.toLowerCase()) {
        return <mark key={i} className="bg-yellow-300 text-gray-900 rounded px-0.5">{part}</mark>;
      }
      return part;
    });
  };

  const generateSRT = () => {
    return segments
      .map((seg, i) => {
        const start = formatTimestamp(seg.start).replace('.', ',');
        const end = formatTimestamp(seg.end).replace('.', ',');
        return `${i + 1}\n${start} --> ${end}\n${seg.text}\n`;
      })
      .join('\n');
  };

  const generateVTT = () => {
    return `WEBVTT\n\n` +
      segments
        .map((seg) => {
          const start = formatTimestamp(seg.start);
          const end = formatTimestamp(seg.end);
          return `${start} --> ${end}\n${seg.text}\n`;
        })
        .join('\n');
  };

  const generateTXT = () => {
    return segments.map(seg => seg.text).join('\n\n');
  };

  const handleExport = () => {
    let content = '';
    let mimeType = 'text/plain';
    let extension = 'txt';

    switch (exportFormat) {
      case 'srt':
        content = generateSRT();
        mimeType = 'text/srt';
        extension = 'srt';
        break;
      case 'vtt':
        content = generateVTT();
        mimeType = 'text/vtt';
        extension = 'vtt';
        break;
      case 'txt':
        content = generateTXT();
        extension = 'txt';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript_${videoId}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExport(false);
  };

  const currentResult = searchResults[currentSearchIndex];

  return (
    <div className="glassmorphism-lg rounded-2xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Transcription Editor</h3>
          <p className="text-sm text-gray-500">
            {segments.length} segments • {language === 'en' ? 'English' : language === 'ta' ? 'Tamil' : language}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExport(!showExport)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Export Options */}
      <AnimatePresence>
        {showExport && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-xl p-4"
          >
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Format:</span>
              <div className="flex gap-2">
                {['srt', 'vtt', 'txt'].map((format) => (
                  <button
                    key={format}
                    onClick={() => setExportFormat(format)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      exportFormat === format
                        ? "bg-orange-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    )}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
              <button
                onClick={handleExport}
                className="ml-auto px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Download
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in transcript..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => navigateSearch(-1)}
                className="p-2 hover:bg-gray-200 rounded-md transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <span className="px-2 text-sm font-medium text-gray-700">
                {currentSearchIndex + 1} / {searchResults.length}
              </span>
              <button
                onClick={() => navigateSearch(1)}
                className="p-2 hover:bg-gray-200 rounded-md transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Segments List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
        <AnimatePresence>
          {segments.map((segment, index) => {
            const isEditing = editingSegment === index;
            const isSearchResult = currentResult && currentResult.index === index;

            return (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={cn(
                  "group p-4 rounded-xl border transition-all",
                  isEditing
                    ? "border-orange-500 bg-orange-50/50"
                    : isSearchResult
                    ? "border-yellow-400 bg-yellow-50/50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Timestamp */}
                  <div className="flex-shrink-0 w-24 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <span>{formatTimestamp(segment.start)}</span>
                    </div>
                    <div className="text-gray-400">↓</div>
                    <div className="text-gray-600">{formatTimestamp(segment.end)}</div>
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                        rows={3}
                        autoFocus
                      />
                    ) : (
                      <p className="text-gray-800 leading-relaxed">
                        {highlightSearchText(segment.text, searchQuery)}
                      </p>
                    )}

                    {/* Confidence Score */}
                    {!isEditing && segment.confidence !== undefined && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              segment.confidence > 0.8 ? "bg-green-500" :
                              segment.confidence > 0.6 ? "bg-yellow-500" : "bg-red-500"
                            )}
                            style={{ width: `${segment.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round(segment.confidence * 100)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-1">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSegmentSave(index)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Save"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={handleSegmentCancel}
                          className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSegmentEdit(index)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>

                        {/* Time Adjustment */}
                        <div className="flex items-center border-l border-gray-200 pl-1 ml-1">
                          <button
                            onClick={() => handleTimeAdjust(index, 'start', -0.1)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="-0.1s start"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleTimeAdjust(index, 'start', 0.1)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="+0.1s start"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleTimeAdjust(index, 'end', 0.1)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="+0.1s end"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleTimeAdjust(index, 'end', -0.1)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="-0.1s end"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                        </div>

                        {/* Split/Merge/Delete */}
                        <div className="flex items-center border-l border-gray-200 pl-1 ml-1">
                          <button
                            onClick={() => handleSplitSegment(index)}
                            className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                            title="Split segment"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleMergeSegment(index)}
                            disabled={index >= segments.length - 1}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Merge with next"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteSegment(index)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete segment"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {segments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium">No transcript available</p>
          <p className="text-sm mt-1">Upload a video and wait for transcription to complete</p>
        </div>
      )}
    </div>
  );
};

export default TranscriptionEditor;
