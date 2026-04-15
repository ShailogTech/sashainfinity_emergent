import { useState, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';

const LANGUAGE_CONFIG = {
  javascript: {
    default: `// Welcome to the Code Sandbox!
// Start coding in JavaScript

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));

// Try some array operations
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);

// Filter even numbers
const evens = numbers.filter(n => n % 2 === 0);
console.log("Even numbers:", evens);`,
    theme: 'vs-dark'
  },
  python: {
    default: `# Welcome to the Code Sandbox!
# Start coding in Python

def greet(name):
    return f"Hello, {name}!"

print(greet("World"))

# Try some list operations
numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
print("Doubled:", doubled)

# Filter even numbers
evens = [n for n in numbers if n % 2 == 0]
print("Even numbers:", evens)`,
    theme: 'vs'
  }
};

export default function CodeEditor({
  code = '',
  language = 'javascript',
  onChange,
  onRun,
  isRunning = false,
  height = '100%',
  readOnly = false,
  autoRun = false
}) {
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [editorCode, setEditorCode] = useState(code || LANGUAGE_CONFIG[currentLanguage].default);
  const editorRef = useRef(null);

  const handleEditorChange = useCallback((value) => {
    setEditorCode(value);
    if (onChange) {
      onChange(value);
    }
  }, [onChange]);

  const handleEditorMount = useCallback((editor) => {
    editorRef.current = editor;

    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
      fontLigatures: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: 'on',
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      padding: { top: 16, bottom: 16 },
      suggest: {
        snippetsPreventQuickSuggestions: false,
      },
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false
      },
      parameterHints: {
        enabled: true
      },
      folding: true,
      foldingStrategy: 'auto',
      showFoldingControls: 'always',
      formatOnPaste: true,
      formatOnType: true
    });

    // Add keyboard shortcut for running code (Ctrl/Cmd + Enter)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRun) {
        onRun(editor.getValue());
      }
    });
  }, [onRun]);

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    const newCode = LANGUAGE_CONFIG[newLanguage].default;
    setEditorCode(newCode);
    if (onChange) {
      onChange(newCode);
    }
  };

  const handleRunClick = () => {
    if (onRun) {
      onRun(editorCode);
    }
  };

  const handleResetClick = () => {
    const defaultCode = LANGUAGE_CONFIG[currentLanguage].default;
    setEditorCode(defaultCode);
    if (onChange) {
      onChange(defaultCode);
    }
  };

  const getEditorTheme = () => {
    return LANGUAGE_CONFIG[currentLanguage].theme;
  };

  return (
    <div className="code-editor-wrapper">
      <div className="code-editor-header">
        <div className="editor-left-controls">
          <div className="language-selector">
            <button
              className={`lang-btn ${currentLanguage === 'javascript' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('javascript')}
              disabled={readOnly}
            >
              <span className="lang-icon">JS</span>
              <span className="lang-label">JavaScript</span>
            </button>
            <button
              className={`lang-btn ${currentLanguage === 'python' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('python')}
              disabled={readOnly}
            >
              <span className="lang-icon">PY</span>
              <span className="lang-label">Python</span>
            </button>
          </div>
        </div>

        <div className="editor-right-controls">
          {!readOnly && (
            <>
              <button
                className="editor-btn reset-btn"
                onClick={handleResetClick}
                title="Reset to default code"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                Reset
              </button>
              <button
                className={`editor-btn run-btn ${isRunning ? 'running' : ''}`}
                onClick={handleRunClick}
                disabled={isRunning}
                title="Run code (Ctrl/Cmd + Enter)"
              >
                {isRunning ? (
                  <>
                    <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="32" />
                    </svg>
                    Running...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Run
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="monaco-editor-container" style={{ height }}>
        <Editor
          value={editorCode}
          language={currentLanguage}
          theme={getEditorTheme()}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          options={{
            readOnly,
            domReadOnly: readOnly,
          }}
          loading={
            <div className="editor-loading">
              <div className="spinner"></div>
              <p>Loading editor...</p>
            </div>
          }
        />
      </div>

      <style jsx>{`
        .code-editor-wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #1e1e1e;
          border-radius: 12px;
          overflow: hidden;
        }

        .code-editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #252526;
          border-bottom: 1px solid #3c3c3c;
        }

        .editor-left-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .language-selector {
          display: flex;
          background: #1e1e1e;
          border-radius: 8px;
          padding: 4px;
          gap: 4px;
        }

        .lang-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border: none;
          background: transparent;
          color: #858585;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .lang-btn:hover:not(:disabled) {
          color: #cccccc;
          background: #2a2d2e;
        }

        .lang-btn.active {
          background: #0e639c;
          color: #ffffff;
        }

        .lang-btn:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .lang-icon {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(255,255,255,0.1);
        }

        .editor-right-controls {
          display: flex;
          gap: 8px;
        }

        .editor-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .reset-btn {
          background: #3c3c3c;
          color: #cccccc;
        }

        .reset-btn:hover {
          background: #4c4c4c;
        }

        .run-btn {
          background: var(--sasha-primary, #f4911a);
          color: #ffffff;
        }

        .run-btn:hover:not(:disabled) {
          background: var(--sasha-primary-light, #ffaa44);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(244, 145, 26, 0.4);
        }

        .run-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .run-btn.running {
          background: #2ea043;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        .monaco-editor-container {
          flex: 1;
          overflow: hidden;
        }

        .editor-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #858585;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #3c3c3c;
          border-top-color: var(--sasha-primary, #f4911a);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 12px;
        }
      `}</style>
    </div>
  );
}
