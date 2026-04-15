import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function LivePreview({
  code = '',
  language = 'javascript',
  autoRun = false,
  runTrigger = null
}) {
  const [output, setOutput] = useState([]);
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const outputRef = useRef(null);

  const executeCode = async () => {
    if (!code.trim()) {
      setError('No code to execute');
      return;
    }

    setIsRunning(true);
    setError(null);
    setOutput([]);

    const startTime = performance.now();

    try {
      const response = await axios.post(`${API_BASE}/api/sandbox/execute`, {
        code,
        language,
        timeout: 5
      });

      const endTime = performance.now();
      setExecutionTime((endTime - startTime).toFixed(2));

      if (response.data.success) {
        setOutput(response.data.output);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      const endTime = performance.now();
      setExecutionTime((endTime - startTime).toFixed(2));

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to execute code. Please try again.');
      }
    } finally {
      setIsRunning(false);
    }
  };

  // Auto-run when code changes (debounced)
  useEffect(() => {
    if (!autoRun) return;

    const timeoutId = setTimeout(() => {
      executeCode();
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [code, language, autoRun]);

  // Run when triggered externally
  useEffect(() => {
    if (runTrigger) {
      executeCode();
    }
  }, [runTrigger]);

  // Scroll to bottom when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, error]);

  const clearOutput = () => {
    setOutput([]);
    setError(null);
    setExecutionTime(0);
  };

  const hasContent = output.length > 0 || error;

  return (
    <div className={`live-preview-wrapper ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="preview-header">
        <div className="header-left">
          <div className="preview-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            Console Output
          </div>
          {executionTime > 0 && (
            <div className="execution-time">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {executionTime}ms
            </div>
          )}
        </div>

        <div className="header-right">
          <button
            className="header-btn clear-btn"
            onClick={clearOutput}
            disabled={!hasContent}
            title="Clear output"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
          <button
            className="header-btn collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="preview-content" ref={outputRef}>
          {isRunning && (
            <div className="output-line running-line">
              <div className="running-indicator">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
              <span className="running-text">Executing code...</span>
            </div>
          )}

          {!isRunning && !hasContent && !code && (
            <div className="output-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              <p>Run your code to see output here</p>
              <p className="hint">Press Ctrl/Cmd + Enter or click Run</p>
            </div>
          )}

          {!isRunning && output.map((line, index) => (
            <div key={index} className="output-line">
              <span className="line-number">{index + 1}</span>
              <span className="line-content">{line}</span>
            </div>
          ))}

          {error && (
            <div className="output-line error-line">
              <span className="error-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </span>
              <span className="error-content">{error}</span>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .live-preview-wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #1e1e1e;
          border-radius: 12px;
          overflow: hidden;
        }

        .live-preview-wrapper.collapsed {
          height: auto;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #252526;
          border-bottom: 1px solid #3c3c3c;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .preview-title {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #cccccc;
          font-size: 13px;
          font-weight: 600;
        }

        .execution-time {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: #1e1e1e;
          border-radius: 12px;
          color: #4ec9b0;
          font-size: 12px;
          font-weight: 500;
        }

        .header-right {
          display: flex;
          gap: 8px;
        }

        .header-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: #858585;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .header-btn:hover:not(:disabled) {
          background: #3c3c3c;
          color: #cccccc;
        }

        .header-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .preview-content {
          flex: 1;
          overflow-y: auto;
          padding: 12px 16px;
          font-family: 'Fira Code', 'Consolas', monospace;
          font-size: 13px;
          line-height: 1.6;
          min-height: 120px;
        }

        .output-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #858585;
          text-align: center;
          padding: 32px;
        }

        .output-placeholder svg {
          opacity: 0.3;
          margin-bottom: 16px;
        }

        .output-placeholder p {
          margin: 4px 0;
        }

        .output-placeholder .hint {
          font-size: 12px;
          opacity: 0.6;
        }

        .output-line {
          display: flex;
          gap: 12px;
          padding: 4px 0;
          color: #cccccc;
        }

        .line-number {
          color: #858585;
          font-size: 11px;
          min-width: 24px;
          text-align: right;
          user-select: none;
        }

        .line-content {
          flex: 1;
          word-break: break-all;
        }

        .running-line {
          color: var(--sasha-primary, #f4911a);
        }

        .running-indicator {
          display: flex;
          gap: 4px;
        }

        .running-indicator .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--sasha-primary, #f4911a);
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .running-indicator .dot:nth-child(1) { animation-delay: -0.32s; }
        .running-indicator .dot:nth-child(2) { animation-delay: -0.16s; }
        .running-indicator .dot:nth-child(3) { animation-delay: 0s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .running-text {
          margin-left: 8px;
        }

        .error-line {
          color: #f14c4c;
          background: rgba(241, 76, 76, 0.1);
          border-radius: 4px;
          padding: 8px 12px;
          margin-top: 8px;
        }

        .error-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .error-content {
          flex: 1;
          word-break: break-word;
        }

        /* Scrollbar styling */
        .preview-content::-webkit-scrollbar {
          width: 8px;
        }

        .preview-content::-webkit-scrollbar-track {
          background: #1e1e1e;
        }

        .preview-content::-webkit-scrollbar-thumb {
          background: #3c3c3c;
          border-radius: 4px;
        }

        .preview-content::-webkit-scrollbar-thumb:hover {
          background: #4c4c4c;
        }
      `}</style>
    </div>
  );
}
