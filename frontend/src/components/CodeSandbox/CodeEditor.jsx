import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play,
  RotateCcw,
  Download,
  Upload,
  Settings,
  Maximize2,
  Minimize2,
  Code,
  FileJson,
  FileCode,
  Lightbulb,
  AlertCircle
} from 'lucide-react';

const SUPPORTED_LANGUAGES = {
  javascript: {
    label: 'JavaScript',
    icon: <FileCode className="w-4 h-4" />,
    defaultCode: `// Welcome to the Code Sandbox!
// Write your JavaScript code here

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));

// Try running this code!
const result = greet("Developer");
console.log(result);`
  },
  python: {
    label: 'Python',
    icon: <Code className="w-4 h-4" />,
    defaultCode: `# Welcome to the Code Sandbox!
# Write your Python code here

def greet(name):
    return f"Hello, {name}!"

print(greet("World"))

# Try running this code!
result = greet("Developer")
print(result)`
  },
  html: {
    label: 'HTML',
    icon: <FileCode className="w-4 h-4" />,
    defaultCode: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            margin: 0;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello from Code Sandbox!</h1>
        <p>Edit this code and see the results in real-time.</p>
        <button onclick="alert('Hello!')">Click Me</button>
    </div>
</body>
</html>`
  },
  json: {
    label: 'JSON',
    icon: <FileJson className="w-4 h-4" />,
    defaultCode: `{
  "project": "Code Sandbox",
  "version": "1.0.0",
  "features": [
    "Syntax highlighting",
    "Auto-completion",
    "Error detection",
    "Live preview"
  ],
  "supported_languages": {
    "javascript": true,
    "python": true,
    "html": true
  }
}`
  }
};

const THEMES = {
  'vs-dark': 'Dark',
  'vs-light': 'Light',
  'hc-black': 'High Contrast'
};

const CodeEditor = ({
  code = '',
  language = 'javascript',
  theme = 'vs-dark',
  onChange,
  onRun,
  readOnly = false,
  height = '100%',
  options = {},
  showLineNumbers = true,
  showMinimap = true,
  fontSize = 14,
  tabSize = 2
}) => {
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [editorCode, setEditorCode] = useState(code || SUPPORTED_LANGUAGES[language].defaultCode);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [errors, setErrors] = useState([]);
  const editorRef = useRef(null);

  useEffect(() => {
    if (code) {
      setEditorCode(code);
    }
  }, [code]);

  const handleEditorChange = (value) => {
    setEditorCode(value);
    if (onChange) {
      onChange(value, currentLanguage);
    }
    // Basic error detection
    detectErrors(value);
  };

  const detectErrors = (code) => {
    const newErrors = [];

    if (currentLanguage === 'javascript') {
      // Basic JavaScript syntax error detection
      if (code.includes('function') && !code.includes('{')) {
        newErrors.push({ line: 1, message: 'Missing opening brace for function' });
      }
      // Check for unmatched brackets
      const openBrackets = (code.match(/\{/g) || []).length;
      const closeBrackets = (code.match(/\}/g) || []).length;
      if (openBrackets !== closeBrackets) {
        newErrors.push({ line: 1, message: 'Unmatched curly braces' });
      }
      // Check for unmatched parentheses
      const openParens = (code.match(/\(/g) || []).length;
      const closeParens = (code.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        newErrors.push({ line: 1, message: 'Unmatched parentheses' });
      }
    }

    setErrors(newErrors);
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Configure auto-completion
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: () => {
        const suggestions = [
          {
            label: 'console.log',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'console.log(${1:value});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Log output to console'
          },
          {
            label: 'function',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'function ${1:functionName}(${2:params}) {',
              '\t${3:// body}',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Function declaration'
          },
          {
            label: 'const',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'const ${1:name} = ${2:value};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Const declaration'
          }
        ];
        return { suggestions };
      }
    });

    // Configure JavaScript language features
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      allowJs: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowUmdGlobalAccess: true
    });
  };

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    setEditorCode(SUPPORTED_LANGUAGES[newLanguage].defaultCode);
    if (onChange) {
      onChange(SUPPORTED_LANGUAGES[newLanguage].defaultCode, newLanguage);
    }
  };

  const handleRun = () => {
    if (onRun) {
      onRun(editorCode, currentLanguage);
    }
  };

  const handleReset = () => {
    setEditorCode(SUPPORTED_LANGUAGES[currentLanguage].defaultCode);
    setErrors([]);
    if (onChange) {
      onChange(SUPPORTED_LANGUAGES[currentLanguage].defaultCode, currentLanguage);
    }
  };

  const handleDownload = () => {
    const extensions = {
      javascript: 'js',
      python: 'py',
      html: 'html',
      json: 'json'
    };

    const blob = new Blob([editorCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extensions[currentLanguage]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.js,.py,.html,.json,.txt';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditorCode(event.target.result);
        if (onChange) {
          onChange(event.target.result, currentLanguage);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const editorOptions = {
    minimap: { enabled: showMinimap },
    fontSize: fontSize,
    tabSize: tabSize,
    lineNumbers: showLineNumbers ? 'on' : 'off',
    readOnly: readOnly,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    formatOnPaste: true,
    formatOnType: true,
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    parameterHints: { enabled: true },
    acceptSuggestionOnEnter: 'on',
    tabCompletion: 'on',
    ...options
  };

  return (
    <div className={`code-editor-container ${isFullscreen ? 'fullscreen' : ''} bg-gray-900 rounded-lg overflow-hidden`}>
      {/* Editor Header */}
      <div className="editor-header flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-400" />
          <select
            value={currentLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1.5 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(SUPPORTED_LANGUAGES).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {errors.length > 0 && (
            <div className="flex items-center gap-1 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.length} error(s)</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            title="Run Code (Ctrl+Enter)"
          >
            <Play className="w-4 h-4" />
            Run
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Reset Code"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Download Code"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleUpload}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Upload Code"
          >
            <Upload className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel px-4 py-3 bg-gray-800 border-b border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Theme</label>
              <select
                value={currentTheme}
                onChange={(e) => setCurrentTheme(e.target.value)}
                className="w-full bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 text-sm"
              >
                {Object.entries(THEMES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Font Size</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                min="10"
                max="24"
                className="w-full bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Tab Size</label>
              <input
                type="number"
                value={tabSize}
                onChange={(e) => setTabSize(Number(e.target.value))}
                min="2"
                max="8"
                className="w-full bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 text-sm"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={showLineNumbers}
                  onChange={(e) => setShowLineNumbers(e.target.checked)}
                  className="rounded"
                />
                Line Numbers
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={showMinimap}
                  onChange={(e) => setShowMinimap(e.target.checked)}
                  className="rounded"
                />
                Minimap
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="editor-wrapper" style={{ height: isFullscreen ? 'calc(100vh - 60px)' : height }}>
        <Editor
          height="100%"
          language={currentLanguage}
          theme={currentTheme}
          value={editorCode}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={editorOptions}
        />
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="error-panel px-4 py-2 bg-red-900/20 border-t border-red-800">
          {errors.map((error, index) => (
            <div key={index} className="flex items-start gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Line {error.line}: {error.message}</span>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .code-editor-container.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          height: 100vh;
        }

        .editor-wrapper :global(.monaco-editor) {
          padding-top: 0;
        }
      `}</style>
    </div>
  );
};

export default CodeEditor;
