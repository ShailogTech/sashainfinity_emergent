import React, { useState, useEffect, useCallback } from 'react';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle
} from 'react-resizable-panels';
import CodeEditor from './CodeEditor';
import LivePreview from './LivePreview';
import VideoSync from './VideoSync';
import {
  Save,
  FolderOpen,
  Share2,
  History,
  BookMarked,
  Settings,
  Download,
  Upload,
  Maximize2,
  X,
  Check,
  Copy,
  Trash2
} from 'lucide-react';

const CodeSandbox = ({
  initialCode = '',
  initialLanguage = 'javascript',
  videoUrl = '',
  codeSnippets = [],
  onSave,
  onShare,
  onLoad,
  autoRun = false,
  showVideoSync = true,
  showSaveLoad = true,
  readOnly = false,
  height = '600px'
}) => {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedSnippets, setSavedSnippets] = useState([]);
  const [currentSnippet, setCurrentSnippet] = useState(null);
  const [showSavedSnippets, setShowSavedSnippets] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [notification, setNotification] = useState(null);
  const [editorSize, setEditorSize] = useState(50);
  const [previewSize, setPreviewSize] = useState(50);
  const [syncPanelSize, setSyncPanelSize] = useState(30);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Load saved snippets from localStorage
    const loadSavedSnippets = () => {
      try {
        const saved = localStorage.getItem('codesandbox_snippets');
        if (saved) {
          setSavedSnippets(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Failed to load saved snippets:', error);
      }
    };

    loadSavedSnippets();

    // Load history
    const loadHistory = () => {
      try {
        const savedHistory = localStorage.getItem('codesandbox_history');
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    };

    loadHistory();

    // Check URL for shared code or timestamp
    const urlParams = new URLSearchParams(window.location.search);
    const sharedCode = urlParams.get('code');
    const sharedLanguage = urlParams.get('lang');
    const timestamp = urlParams.get('t');

    if (sharedCode) {
      try {
        const decodedCode = atob(sharedCode);
        setCode(decodedCode);
        if (sharedLanguage) {
          setLanguage(sharedLanguage);
        }
        showNotification('Shared code loaded successfully!', 'success');
      } catch (error) {
        showNotification('Failed to load shared code', 'error');
      }
    }

    if (timestamp && showVideoSync) {
      const time = parseInt(timestamp);
      setCurrentTime(time);
      // Find snippet at this timestamp
      const snippet = codeSnippets.find(s => Math.abs(s.timestamp - time) < 5);
      if (snippet) {
        handleSnippetLoad(snippet);
      }
    }
  }, []);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCodeChange = useCallback((newCode, newLanguage) => {
    setCode(newCode);
    setLanguage(newLanguage);

    // Add to history
    const historyEntry = {
      id: Date.now(),
      code: newCode,
      language: newLanguage,
      timestamp: new Date().toISOString()
    };

    setHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10 entries

    try {
      localStorage.setItem('codesandbox_history', JSON.stringify([historyEntry, ...history.slice(0, 9)]));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }, [history]);

  const handleRun = useCallback((executedCode, executedLanguage) => {
    console.log('Executing code:', executedLanguage);
    // LivePreview component handles execution
  }, []);

  const handleSnippetLoad = useCallback((snippet) => {
    if (snippet.code) {
      setCode(snippet.code);
    }
    if (snippet.language) {
      setLanguage(snippet.language);
    }
    setCurrentSnippet(snippet);
    showNotification(`Loaded: ${snippet.title}`, 'success');
  }, []);

  const handleTimeUpdate = useCallback((time) => {
    setCurrentTime(time);
  }, []);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleSeek = useCallback((time) => {
    setCurrentTime(time);
  }, []);

  const handleSave = useCallback(() => {
    const snippet = {
      id: Date.now(),
      title: `Code Snippet ${savedSnippets.length + 1}`,
      code,
      language,
      timestamp: currentTime,
      createdAt: new Date().toISOString()
    };

    const newSnippets = [...savedSnippets, snippet];
    setSavedSnippets(newSnippets);

    try {
      localStorage.setItem('codesandbox_snippets', JSON.stringify(newSnippets));
      showNotification('Code snippet saved!', 'success');

      if (onSave) {
        onSave(snippet);
      }
    } catch (error) {
      showNotification('Failed to save snippet', 'error');
    }
  }, [code, language, currentTime, savedSnippets, onSave]);

  const handleShare = useCallback(() => {
    // Encode code for sharing
    const encodedCode = btoa(code);
    const url = new URL(window.location.href);
    url.searchParams.set('code', encodedCode);
    url.searchParams.set('lang', language);

    if (currentTime > 0) {
      url.searchParams.set('t', Math.floor(currentTime).toString());
    }

    navigator.clipboard.writeText(url.toString());
    showNotification('Share link copied to clipboard!', 'success');

    if (onShare) {
      onShare({ code, language, timestamp: currentTime });
    }
  }, [code, language, currentTime, onShare]);

  const handleLoadSnippet = useCallback((snippet) => {
    setCode(snippet.code);
    setLanguage(snippet.language);
    setCurrentSnippet(snippet);
    setShowSavedSnippets(false);
    showNotification(`Loaded: ${snippet.title}`, 'success');

    if (onLoad) {
      onLoad(snippet);
    }
  }, [onLoad]);

  const handleDeleteSnippet = useCallback((snippetId) => {
    const newSnippets = savedSnippets.filter(s => s.id !== snippetId);
    setSavedSnippets(newSnippets);

    try {
      localStorage.setItem('codesandbox_snippets', JSON.stringify(newSnippets));
      showNotification('Snippet deleted', 'info');
    } catch (error) {
      showNotification('Failed to delete snippet', 'error');
    }
  }, [savedSnippets]);

  const handleDownload = useCallback(() => {
    const extensions = {
      javascript: 'js',
      python: 'py',
      html: 'html',
      json: 'json'
    };

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extensions[language]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Code downloaded!', 'success');
  }, [code, language]);

  const handleUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.js,.py,.html,.json,.txt';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setCode(event.target.result);
        showNotification('Code uploaded successfully!', 'success');
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  return (
    <div className={`code-sandbox-wrapper ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Toolbar */}
      <div className="toolbar flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">Code Sandbox</h2>

          {showSaveLoad && (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Save code snippet"
              >
                <Save className="w-4 h-4" />
                Save
              </button>

              <button
                onClick={() => setShowSavedSnippets(!showSavedSnippets)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Load saved snippet"
              >
                <FolderOpen className="w-4 h-4" />
                Load ({savedSnippets.length})
              </button>

              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="View history"
              >
                <History className="w-4 h-4" />
                History
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Share code"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Download code"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleUpload}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Upload code"
          >
            <Upload className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <PanelGroup direction="vertical" className="h-full">
        {/* Video Sync Panel */}
        {showVideoSync && (
          <>
            <Panel defaultSize={syncPanelSize} minSize={10} maxSize={40}>
              <VideoSync
                videoUrl={videoUrl}
                codeSnippets={codeSnippets}
                onSnippetLoad={handleSnippetLoad}
                onTimeUpdate={handleTimeUpdate}
                currentTime={currentTime}
                isPlaying={isPlaying}
                onPlay={handlePlay}
                onPause={handlePause}
                onSeek={handleSeek}
              />
            </Panel>
            <PanelResizeHandle className="panel-resize-handle" />
          </>
        )}

        {/* Editor and Preview */}
        <Panel defaultSize={showVideoSync ? 100 - syncPanelSize : 100}>
          <PanelGroup direction="horizontal">
            <Panel defaultSize={editorSize} minSize={20}>
              <CodeEditor
                code={code}
                language={language}
                onChange={handleCodeChange}
                onRun={handleRun}
                readOnly={readOnly}
                height="100%"
              />
            </Panel>

            <PanelResizeHandle className="panel-resize-handle" />

            <Panel defaultSize={previewSize} minSize={20}>
              <LivePreview
                code={code}
                language={language}
                autoRun={autoRun}
                height="100%"
              />
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>

      {/* Saved Snippets Panel */}
      {showSavedSnippets && (
        <div className="saved-snippets-panel fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Saved Code Snippets</h3>
              <button
                onClick={() => setShowSavedSnippets(false)}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {savedSnippets.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <BookMarked className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No saved snippets yet</p>
                  <p className="text-sm mt-1">Save your code to access it later</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedSnippets.map(snippet => (
                    <div
                      key={snippet.id}
                      className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <button
                        onClick={() => handleLoadSnippet(snippet)}
                        className="flex-1 text-left"
                      >
                        <div className="font-medium text-white">{snippet.title}</div>
                        <div className="text-sm text-gray-400 mt-1">
                          {snippet.language} • {new Date(snippet.createdAt).toLocaleString()}
                        </div>
                      </button>

                      <button
                        onClick={() => handleDeleteSnippet(snippet.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                        title="Delete snippet"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className="history-panel fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Code History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {history.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No history yet</p>
                  <p className="text-sm mt-1">Your code changes will appear here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((entry, index) => (
                    <button
                      key={entry.id}
                      onClick={() => {
                        setCode(entry.code);
                        setLanguage(entry.language);
                        setShowHistory(false);
                        showNotification('Code restored from history', 'success');
                      }}
                      className="w-full flex items-center gap-3 p-3 bg-gray-900 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors text-left"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-white">
                          {entry.language} - {index === 0 ? 'Current' : `${index} ago`}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          {new Date(entry.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`notification fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 ${
          notification.type === 'success' ? 'bg-green-600' :
          notification.type === 'error' ? 'bg-red-600' :
          'bg-blue-600'
        }`}>
          {notification.type === 'success' && <Check className="w-5 h-5" />}
          {notification.type === 'error' && <X className="w-5 h-5" />}
          <span className="text-white font-medium">{notification.message}</span>
        </div>
      )}

      <style jsx>{`
        .code-sandbox-wrapper {
          height: ${height};
          display: flex;
          flex-direction: column;
          background: #111827;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .code-sandbox-wrapper.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          height: 100vh;
          border-radius: 0;
        }

        .panel-resize-handle {
          background: #374151;
          transition: background 0.2s;
        }

        .panel-resize-handle:hover,
        .panel-resize-handle:active {
          background: #4B5563;
        }

        .panel-resize-handle:active {
          background: #6B7280;
        }
      `}</style>
    </div>
  );
};

export default CodeSandbox;
