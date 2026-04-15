import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import CodeEditor from './CodeEditor';
import LivePreview from './LivePreview';
import VideoSync from './VideoSync';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function CodeSandbox({
  initialCode = '',
  initialLanguage = 'javascript',
  videoId = null,
  videoUrl = null,
  readOnly = false,
  autoRun = false,
  onSave = null,
  layout = 'split' // 'split', 'tabs', 'stack'
}) {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [runTrigger, setRunTrigger] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'output', 'video'
  const [savedSnippets, setSavedSnippets] = useState([]);
  const [currentSnippetId, setCurrentSnippetId] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50);

  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
  }, []);

  const handleRun = useCallback((codeToRun) => {
    setIsRunning(true);
    setRunTrigger(prev => prev + 1);
    setTimeout(() => setIsRunning(false), 500);
  }, []);

  const handleVideoSnippetLoad = useCallback((snippet) => {
    if (snippet) {
      setCode(snippet.code);
      setLanguage(snippet.language);
      setCurrentSnippetId(snippet.id);
      setSnippetTitle(snippet.title);
    }
  }, []);

  const handleSave = async () => {
    if (!code.trim()) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const snippetData = {
        title: snippetTitle || 'Untitled Snippet',
        code,
        language,
        video_id: videoId,
        timestamp: 0
      };

      if (currentSnippetId) {
        // Update existing snippet
        await axios.put(
          `${API_BASE}/api/sandbox/snippets/${currentSnippetId}`,
          {
            title: snippetData.title,
            code: snippetData.code,
            language: snippetData.language
          },
          { headers }
        );
      } else {
        // Create new snippet
        const response = await axios.post(
          `${API_BASE}/api/sandbox/snippets`,
          snippetData,
          { headers }
        );
        setCurrentSnippetId(response.data.id);
      }

      if (onSave) {
        onSave(snippetData);
      }

      setShowSaveModal(false);
    } catch (err) {
      console.error('Failed to save snippet:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleNewSnippet = () => {
    setCurrentSnippetId(null);
    setSnippetTitle('');
    setCode('');
  };

  const handleSplitDrag = useCallback((e) => {
    if (layout !== 'split') return;

    const container = e.currentTarget.parentElement;
    const rect = container.getBoundingClientRect();
    const percentage = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitPosition(Math.max(20, Math.min(80, percentage)));
  }, [layout]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setShowSaveModal(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun(code);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, handleRun]);

  const renderSplitLayout = () => (
    <div className="sandbox-split-layout">
      <div className="editor-pane" style={{ width: `${splitPosition}%` }}>
        <CodeEditor
          code={code}
          language={language}
          onChange={handleCodeChange}
          onRun={handleRun}
          isRunning={isRunning}
          readOnly={readOnly}
        />
      </div>

      <div
        className="split-divider"
        onMouseDown={(e) => {
          e.preventDefault();
          document.addEventListener('mousemove', handleSplitDrag);
          document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', handleSplitDrag);
          }, { once: true });
        }}
      />

      <div className="preview-pane" style={{ width: `${100 - splitPosition}%` }}>
        <LivePreview
          code={code}
          language={language}
          runTrigger={runTrigger}
        />
      </div>
    </div>
  );

  const renderTabsLayout = () => (
    <div className="sandbox-tabs-layout">
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          Code Editor
        </button>
        <button
          className={`tab-btn ${activeTab === 'output' ? 'active' : ''}`}
          onClick={() => setActiveTab('output')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
          Output
        </button>
        {videoId && (
          <button
            className={`tab-btn ${activeTab === 'video' ? 'active' : ''}`}
            onClick={() => setActiveTab('video')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Video Sync
          </button>
        )}
      </div>

      <div className="tabs-content">
        {activeTab === 'editor' && (
          <CodeEditor
            code={code}
            language={language}
            onChange={handleCodeChange}
            onRun={handleRun}
            isRunning={isRunning}
            readOnly={readOnly}
          />
        )}
        {activeTab === 'output' && (
          <LivePreview
            code={code}
            language={language}
            runTrigger={runTrigger}
          />
        )}
        {activeTab === 'video' && videoId && (
          <VideoSync
            videoId={videoId}
            videoUrl={videoUrl}
            onCodeLoad={handleVideoSnippetLoad}
          />
        )}
      </div>
    </div>
  );

  const renderStackLayout = () => (
    <div className="sandbox-stack-layout">
      <div className="stack-pane">
        <CodeEditor
          code={code}
          language={language}
          onChange={handleCodeChange}
          onRun={handleRun}
          isRunning={isRunning}
          readOnly={readOnly}
          height="400px"
        />
      </div>

      <div className="stack-pane">
        <LivePreview
          code={code}
          language={language}
          runTrigger={runTrigger}
        />
      </div>

      {videoId && (
        <div className="stack-pane">
          <VideoSync
            videoId={videoId}
            videoUrl={videoUrl}
            onCodeLoad={handleVideoSnippetLoad}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="code-sandbox-container">
      {/* Toolbar */}
      <div className="sandbox-toolbar">
        <div className="toolbar-left">
          <div className="snippet-info">
            <span className="snippet-label">
              {currentSnippetId ? 'Editing:' : 'New Snippet'}
            </span>
            <span className="snippet-name">
              {snippetTitle || 'Untitled'}
            </span>
          </div>
        </div>

        <div className="toolbar-right">
          <button
            className="toolbar-btn new-btn"
            onClick={handleNewSnippet}
            title="New snippet"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New
          </button>

          {!readOnly && (
            <button
              className="toolbar-btn save-btn"
              onClick={() => setShowSaveModal(true)}
              title="Save snippet (Ctrl+S)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save
            </button>
          )}

          <select
            className="layout-selector"
            value={layout}
            onChange={(e) => {
              window.dispatchEvent(new CustomEvent('sandbox-layout-change', {
                detail: { layout: e.target.value }
              }));
            }}
          >
            <option value="split">Split View</option>
            <option value="tabs">Tabs</option>
            <option value="stack">Stacked</option>
          </select>
        </div>
      </div>

      {/* Main content */}
      <div className="sandbox-content">
        {layout === 'split' && renderSplitLayout()}
        {layout === 'tabs' && renderTabsLayout()}
        {layout === 'stack' && renderStackLayout()}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="save-modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="save-modal" onClick={(e) => e.stopPropagation()}>
            <div className="save-modal-header">
              <h3>Save Code Snippet</h3>
              <button
                className="close-btn"
                onClick={() => setShowSaveModal(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="save-modal-body">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={snippetTitle}
                  onChange={(e) => setSnippetTitle(e.target.value)}
                  placeholder="My Awesome Snippet"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Language</label>
                <div className="language-selector">
                  <button
                    className={`lang-option ${language === 'javascript' ? 'active' : ''}`}
                    onClick={() => setLanguage('javascript')}
                  >
                    JavaScript
                  </button>
                  <button
                    className={`lang-option ${language === 'python' ? 'active' : ''}`}
                    onClick={() => setLanguage('python')}
                  >
                    Python
                  </button>
                </div>
              </div>

              {videoId && (
                <div className="form-group">
                  <label>Video Timestamp</label>
                  <input
                    type="number"
                    value={0}
                    disabled
                    placeholder="Auto-detected from video"
                  />
                </div>
              )}
            </div>

            <div className="save-modal-footer">
              <button
                className="modal-btn cancel-btn"
                onClick={() => setShowSaveModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-btn save-confirm-btn"
                onClick={handleSave}
                disabled={saving || !snippetTitle.trim()}
              >
                {saving ? 'Saving...' : 'Save Snippet'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .code-sandbox-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #1e1e1e;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #3c3c3c;
        }

        .sandbox-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #252526;
          border-bottom: 1px solid #3c3c3c;
        }

        .toolbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .snippet-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .snippet-label {
          font-size: 11px;
          color: #858585;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .snippet-name {
          font-size: 13px;
          font-weight: 600;
          color: #cccccc;
        }

        .toolbar-right {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .toolbar-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #3c3c3c;
          border: none;
          border-radius: 8px;
          color: #cccccc;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toolbar-btn:hover {
          background: #4c4c4c;
        }

        .save-btn {
          background: var(--sasha-primary, #f4911a);
          color: #ffffff;
        }

        .save-btn:hover {
          background: var(--sasha-primary-light, #ffaa44);
        }

        .layout-selector {
          padding: 8px 12px;
          background: #1e1e1e;
          border: 1px solid #3c3c3c;
          border-radius: 8px;
          color: #cccccc;
          font-size: 13px;
          cursor: pointer;
        }

        .sandbox-content {
          flex: 1;
          overflow: hidden;
        }

        /* Split Layout */
        .sandbox-split-layout {
          display: flex;
          height: 100%;
        }

        .editor-pane,
        .preview-pane {
          overflow: hidden;
        }

        .split-divider {
          width: 4px;
          background: #3c3c3c;
          cursor: col-resize;
          transition: background 0.2s ease;
        }

        .split-divider:hover {
          background: var(--sasha-primary, #f4911a);
        }

        /* Tabs Layout */
        .sandbox-tabs-layout {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .tabs-header {
          display: flex;
          background: #252526;
          border-bottom: 1px solid #3c3c3c;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: #858585;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-btn:hover {
          color: #cccccc;
        }

        .tab-btn.active {
          color: #ffffff;
          border-bottom-color: var(--sasha-primary, #f4911a);
        }

        .tabs-content {
          flex: 1;
          overflow: hidden;
        }

        /* Stack Layout */
        .sandbox-stack-layout {
          display: flex;
          flex-direction: column;
          height: 100%;
          gap: 1px;
          background: #3c3c3c;
        }

        .stack-pane {
          flex: 1;
          overflow: hidden;
          background: #1e1e1e;
        }

        /* Save Modal */
        .save-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .save-modal {
          width: 90%;
          max-width: 480px;
          background: #252526;
          border: 1px solid #3c3c3c;
          border-radius: 16px;
          overflow: hidden;
        }

        .save-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #3c3c3c;
        }

        .save-modal-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
        }

        .close-btn {
          padding: 6px;
          background: transparent;
          border: none;
          color: #858585;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: #3c3c3c;
          color: #cccccc;
        }

        .save-modal-body {
          padding: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #cccccc;
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          background: #1e1e1e;
          border: 1px solid #3c3c3c;
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--sasha-primary, #f4911a);
        }

        .form-group input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .language-selector {
          display: flex;
          background: #1e1e1e;
          border-radius: 8px;
          padding: 4px;
          gap: 4px;
        }

        .lang-option {
          flex: 1;
          padding: 10px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: #858585;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .lang-option.active {
          background: #0e639c;
          color: #ffffff;
        }

        .save-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 20px;
          background: #1e1e1e;
          border-top: 1px solid #3c3c3c;
        }

        .modal-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn {
          background: #3c3c3c;
          color: #cccccc;
        }

        .cancel-btn:hover {
          background: #4c4c4c;
        }

        .save-confirm-btn {
          background: var(--sasha-primary, #f4911a);
          color: #ffffff;
        }

        .save-confirm-btn:hover:not(:disabled) {
          background: var(--sasha-primary-light, #ffaa44);
        }

        .save-confirm-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
