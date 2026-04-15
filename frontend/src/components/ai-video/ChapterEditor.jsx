import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const ChapterEditor = ({ videoId, chapters, onChapterChange, onAddChapter, onDeleteChapter, videoDuration = 0 }) => {
  const [localChapters, setLocalChapters] = useState([]);
  const [editingChapter, setEditingChapter] = useState(null);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChapterStart, setNewChapterStart] = useState(0);
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [previewTime, setPreviewTime] = useState(0);

  useEffect(() => {
    if (chapters) {
      setLocalChapters(chapters);
    }
  }, [chapters]);

  const formatTimestamp = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const parseTimestamp = (timestamp) => {
    const parts = timestamp.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return parts[0] * 60 + parts[1];
  };

  const handleChapterUpdate = (index, field, value) => {
    const updatedChapters = [...localChapters];
    updatedChapters[index][field] = value;
    setLocalChapters(updatedChapters);
    onChapterChange?.(updatedChapters);
  };

  const handleChapterEdit = (chapter) => {
    setEditingChapter(chapter.id);
  };

  const handleChapterSave = (index) => {
    setEditingChapter(null);
    onChapterChange?.(localChapters);
  };

  const handleChapterDelete = (chapterId) => {
    const updatedChapters = localChapters.filter(c => c.id !== chapterId);
    setLocalChapters(updatedChapters);
    onDeleteChapter?.(chapterId);
  };

  const handleAddChapter = () => {
    if (!newChapterTitle.trim()) return;

    const newChapter = {
      id: `temp-${Date.now()}`,
      title: newChapterTitle,
      description: '',
      start_time: newChapterStart,
      end_time: videoDuration || newChapterStart + 60,
      confidence_score: 1.0,
      topics: [],
      thumbnail: selectedThumbnail
    };

    const updatedChapters = [...localChapters, newChapter].sort((a, b) => a.start_time - b.start_time);
    setLocalChapters(updatedChapters);
    onAddChapter?.(newChapter);

    // Reset form
    setNewChapterTitle('');
    setNewChapterStart(0);
    setSelectedThumbnail(null);
    setShowAddForm(false);
  };

  const handleTimeSeek = (time) => {
    setPreviewTime(time);
    // Emit event for video player to seek
    window.dispatchEvent(new CustomEvent('video-seek', { detail: { time } }));
  };

  const generateChapterThumbnail = (startTime) => {
    // In a real implementation, this would capture a frame from the video
    // For now, return a placeholder gradient based on time
    const hue = (startTime * 10) % 360;
    return `linear-gradient(135deg, hsl(${hue}, 70%, 50%), hsl(${hue + 40}, 70%, 40%))`;
  };

  const getChapterWidth = (chapter, totalDuration) => {
    if (!totalDuration) return 10;
    const duration = chapter.end_time - chapter.start_time;
    return Math.max(5, (duration / totalDuration) * 100);
  };

  const getChapterLeft = (chapter, totalDuration) => {
    if (!totalDuration) return 0;
    return (chapter.start_time / totalDuration) * 100;
  };

  return (
    <div className="glassmorphism-lg rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Chapter Editor</h3>
          <p className="text-sm text-gray-500">
            {localChapters.length} chapters • {videoDuration > 0 ? formatTimestamp(videoDuration) : 'Unknown duration'}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Chapter
        </button>
      </div>

      {/* Add Chapter Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-xl p-4 space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Chapter Title</label>
              <input
                type="text"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                placeholder="e.g., Introduction to React Hooks"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Start Time</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formatTimestamp(newChapterStart)}
                  onChange={(e) => setNewChapterStart(parseTimestamp(e.target.value))}
                  placeholder="0:00"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
                <input
                  type="range"
                  min="0"
                  max={videoDuration || 600}
                  value={newChapterStart}
                  onChange={(e) => setNewChapterStart(Number(e.target.value))}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddChapter}
                disabled={!newChapterTitle.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Chapter
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline View */}
      {localChapters.length > 0 && (
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Timeline</span>
            <span className="text-xs text-gray-500">Click to seek video</span>
          </div>

          <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
            {/* Time markers */}
            <div className="absolute inset-0 flex justify-between px-2 text-xs text-gray-400">
              <span>0:00</span>
              {videoDuration > 0 && <span>{formatTimestamp(videoDuration / 2)}</span>}
              {videoDuration > 0 && <span>{formatTimestamp(videoDuration)}</span>}
            </div>

            {/* Chapter blocks */}
            <div className="absolute inset-0 flex">
              {localChapters.map((chapter, index) => (
                <motion.button
                  key={chapter.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => handleTimeSeek(chapter.start_time)}
                  className={cn(
                    "h-full relative group border-r border-white/50 first:rounded-l-lg last:rounded-r-lg transition-all hover:opacity-90",
                    index % 2 === 0 ? "bg-orange-400" : "bg-blue-400"
                  )}
                  style={{
                    left: `${getChapterLeft(chapter, videoDuration)}%`,
                    width: `${getChapterWidth(chapter, videoDuration)}%`,
                    position: 'absolute'
                  }}
                >
                  {/* Chapter label */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-xs font-medium truncate px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {chapter.title}
                    </span>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {chapter.title} ({formatTimestamp(chapter.start_time)})
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chapter List */}
      <div className="space-y-3">
        <AnimatePresence>
          {localChapters.map((chapter, index) => {
            const isEditing = editingChapter === chapter.id;

            return (
              <motion.div
                key={chapter.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={cn(
                  "group relative p-4 rounded-xl border transition-all",
                  isEditing
                    ? "border-orange-500 bg-orange-50/50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-white/50"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div
                    className="flex-shrink-0 w-24 h-16 rounded-lg bg-cover bg-center shadow-md"
                    style={{
                      backgroundImage: generateChapterThumbnail(chapter.start_time)
                    }}
                  >
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-xs rounded">
                      {formatTimestamp(chapter.start_time)}
                    </div>
                  </div>

                  {/* Chapter Info */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={chapter.title}
                          onChange={(e) => handleChapterUpdate(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                          placeholder="Chapter title"
                        />
                        <textarea
                          value={chapter.description || ''}
                          onChange={(e) => handleChapterUpdate(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                          rows={2}
                          placeholder="Chapter description"
                        />
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">Start:</label>
                          <input
                            type="text"
                            value={formatTimestamp(chapter.start_time)}
                            onChange={(e) => handleChapterUpdate(index, 'start_time', parseTimestamp(e.target.value))}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <label className="text-sm text-gray-600">End:</label>
                          <input
                            type="text"
                            value={formatTimestamp(chapter.end_time)}
                            onChange={(e) => handleChapterUpdate(index, 'end_time', parseTimestamp(e.target.value))}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4 className="font-semibold text-gray-800">{chapter.title}</h4>
                        {chapter.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{chapter.description}</p>
                        )}

                        {/* Topics */}
                        {chapter.topics && chapter.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {chapter.topics.slice(0, 3).map((topic, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* AI Confidence */}
                        {chapter.confidence_score !== undefined && (
                          <div className="flex items-center gap-2 mt-2">
                            <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                            </svg>
                            <span className="text-xs text-gray-500">
                              AI Generated • {Math.round(chapter.confidence_score * 100)}% confidence
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-1">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleChapterSave(index)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Save"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setEditingChapter(null)}
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
                          onClick={() => handleTimeSeek(chapter.start_time)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Play from here"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleChapterEdit(chapter)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleChapterDelete(chapter.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
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
      {localChapters.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <p className="text-lg font-medium">No chapters yet</p>
          <p className="text-sm mt-1">Add chapters manually or generate them automatically from the transcript</p>
          <button
            onClick={() => {/* Trigger auto-generation */}}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Auto-Generate Chapters
          </button>
        </div>
      )}
    </div>
  );
};

export default ChapterEditor;
