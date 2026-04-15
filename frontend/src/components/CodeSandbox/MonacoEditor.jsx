import React, { useState, useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play,
  RotateCcw,
  Settings,
  Maximize2,
  Minimize2,
  Code2,
  FileJson,
  FileType,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  FolderOpen,
  Save,
  Download,
  Upload,
  X,
  Search
} from 'lucide-react';

const LANGUAGE_CONFIG = {
  javascript: {
    label: 'JavaScript',
    extension: 'js',
    icon: <Code2 className="w-4 h-4" />,
    theme: 'vs-dark',
    defaultCode: `// Welcome to Monaco Editor!
// This is a powerful code editor with syntax highlighting,
// auto-completion, and error detection.

// Try typing code here and press Ctrl+Space for suggestions
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));

// Press the Run button or Ctrl+Enter to execute
const result = greet("Developer");
console.log(result);`
  },
  typescript: {
    label: 'TypeScript',
    extension: 'ts',
    icon: <Code2 className="w-4 h-4" />,
    theme: 'vs-dark',
    defaultCode: `// TypeScript Editor
// Type-safe JavaScript with enhanced tooling

interface Person {
  name: string;
  age: number;
  email?: string;
}

function greet(person: Person): string {
  return \`Hello, \${person.name}!\`;
}

const developer: Person = {
  name: "Developer",
  age: 25
};

console.log(greet(developer));`
  },
  python: {
    label: 'Python',
    extension: 'py',
    icon: <Code2 className="w-4 h-4" />,
    theme: 'vs-dark',
    defaultCode: `# Python Editor
# Write Python code with syntax highlighting

def greet(name):
    return f"Hello, {name}!"

print(greet("World"))

# Lists and comprehensions
numbers = [1, 2, 3, 4, 5]
squared = [n ** 2 for n in numbers]
print(f"Squared: {squared}")`
  },
  html: {
    label: 'HTML',
    extension: 'html',
    icon: <FileType className="w-4 h-4" />,
    theme: 'vs-dark',
    defaultCode: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea, #764ba2);
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello from Monaco!</h1>
        <p>Edit this HTML and see the preview.</p>
    </div>
</body>
</html>`
  },
  css: {
    label: 'CSS',
    extension: 'css',
    icon: <FileType className="w-4 h-4" />,
    theme: 'vs-dark',
    defaultCode: `/* CSS Editor */
/* Modern CSS with flexbox and grid */

body {
    margin: 0;
    font-family: 'Segoe UI', sans-serif;
    background: linear-gradient(135deg, #667eea, #764ba2);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.card {
    background: white;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    max-width: 400px;
}

.card h1 {
    color: #333;
    margin: 0 0 10px 0;
}

.card p {
    color: #666;
    line-height: 1.6;
}`
  },
  json: {
    label: 'JSON',
    extension: 'json',
    icon: <FileJson className="w-4 h-4" />,
    theme: 'vs-dark',
    defaultCode: `{
  "project": "Monaco Editor",
  "version": "1.0.0",
  "features": [
    "Syntax highlighting",
    "Auto-completion",
    "Error detection",
    "Code formatting",
    "Multiple cursors",
    "Find and replace"
  ],
  "settings": {
    "theme": "dark",
    "fontSize": 14,
    "tabSize": 2
  }
}`
  },
  xml: {
    label: 'XML',
    extension: 'xml',
    icon: <Code2 className="w-4 h-4" />,
    theme: 'vs-dark',
    defaultCode: `<?xml version="1.0" encoding="UTF-8"?>
<root>
    <project name="Monaco Editor">
        <version>1.0.0</version>
        <features>
            <feature>Syntax highlighting</feature>
            <feature>Auto-completion</feature>
            <feature>Error detection</feature>
        </features>
    </project>
</root>`
  }
};

const THEMES = {
  'vs-dark': 'Dark',
  'vs-light': 'Light',
  'hc-black': 'High Contrast'
};

const MonacoEditor = ({
  code = '',
  language = 'javascript',
  theme = 'vs-dark',
  onChange,
  onRun,
  onSave,
  readOnly = false,
  height = '100%',
  options = {},
  showLineNumbers = true,
  showMinimap = true,
  fontSize = 14,
  tabSize = 2,
  wordWrap = 'on',
  autoClosingBrackets = 'always',
  formatOnPaste = true,
  formatOnType = true,
  className = '',
  defaultValue = ''
}) => {
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [editorCode, setEditorCode] = useState(code || defaultValue || LANGUAGE_CONFIG[language]?.defaultCode || '');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showFind, setShowFind] = useState(false);
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [saved, setSaved] = useState(true);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  // Update code when prop changes
  useEffect(() => {
    if (code !== undefined && code !== editorCode) {
      setEditorCode(code);
    }
  }, [code]);

  // Track if code has unsaved changes
  useEffect(() => {
    setSaved(!editorCode || editorCode === (code || defaultValue || ''));
  }, [editorCode, code, defaultValue]);

  const handleEditorChange = useCallback((value) => {
    setEditorCode(value);
    setSaved(false);
    if (onChange) {
      onChange(value, currentLanguage);
    }
    validateCode(value);
  }, [currentLanguage, onChange]);

  const handleEditorDidMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure TypeScript/JavaScript defaults
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
      allowUmdGlobalAccess: true,
      typeRoots: ['node_modules/@types']
    });

    // Add custom key bindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRun();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      setShowFind(!showFind);
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Shift | monaco.KeyCode.KeyP, () => {
      setShowCommandPalette(!showCommandPalette);
    });

    // Configure code folding
    editor.updateOptions({
      folding: true,
      foldingStrategy: 'indentation',
      foldingHighlight: true
    });

    // Configure bracket pair colorization
    editor.updateOptions({
      bracketPairColorization: {
        enabled: true
      }
    });

    // Configure auto-indentation
    editor.updateOptions({
      autoIndent: 'full',
      formatOnPaste: formatOnPaste,
      formatOnType: formatOnType
    });

    // Configure sticky scroll
    editor.updateOptions({
      stickyScroll: {
        enabled: true
      }
    });

    // Set up error markers
    const changeMarker = () => {
      const model = editor.getModel();
      if (model) {
        const markers = monaco.editor.getModelMarkers({ resource: model.uri });
        const errorMarkers = markers.filter(m => m.severity === monaco.MarkerSeverity.Error);
        const warningMarkers = markers.filter(m => m.severity === monaco.MarkerSeverity.Warning);
        setErrors(errorMarkers);
        setWarnings(warningMarkers);
      }
    };

    model?.onDidChangeContent(() => changeMarker());
    editor.onDidChangeModelDecorations(() => changeMarker());

    // Register custom completion provider
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const suggestions = [
          {
            label: 'console.log',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'console.log(${1:value});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Log output to console',
            range,
            detail: 'Console log'
          },
          {
            label: 'console.table',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'console.table(${1:data});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Display data as a table',
            range,
            detail: 'Console table'
          },
          {
            label: 'function',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'function ${1:functionName}(${2:params}) {',
              '\t${0}',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Function declaration',
            range,
            detail: 'Function'
          },
          {
            label: 'arrow',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'const ${1:name} = (${2:params}) => {',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Arrow function',
            range,
            detail: 'Arrow function'
          },
          {
            label: 'for-loop',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'for (let ${1:i} = 0; ${1:i} < ${2:array}.length; ${1:i}++) {',
              '\t${0}',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'For loop',
            range,
            detail: 'For loop'
          },
          {
            label: 'forEach',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '${1:array}.forEach((${2:item}) => {',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Array forEach',
            range,
            detail: 'forEach'
          }
        ];

        return { suggestions };
      }
    });
  }, [formatOnPaste, formatOnType, showFind, showCommandPalette]);

  const validateCode = (code) => {
    // Basic validation that will be enhanced by Monaco's built-in diagnostics
    if (currentLanguage === 'json') {
      try {
        JSON.parse(code);
        setErrors([]);
      } catch (err) {
        setErrors([{ message: err.message }]);
      }
    }
  };

  const handleLanguageChange = (newLanguage) => {
    const config = LANGUAGE_CONFIG[newLanguage];
    if (config) {
      setCurrentLanguage(newLanguage);
      const newCode = config.defaultCode;
      setEditorCode(newCode);
      if (onChange) {
        onChange(newCode, newLanguage);
      }
    }
  };

  const handleRun = () => {
    if (onRun) {
      onRun(editorCode, currentLanguage);
    }
  };

  const handleSave = () => {
    setSaved(true);
    if (onSave) {
      onSave(editorCode, currentLanguage);
    }
  };

  const handleReset = () => {
    const defaultCode = LANGUAGE_CONFIG[currentLanguage]?.defaultCode || '';
    setEditorCode(defaultCode);
    setErrors([]);
    setWarnings([]);
    if (onChange) {
      onChange(defaultCode, currentLanguage);
    }
  };

  const handleDownload = () => {
    const config = LANGUAGE_CONFIG[currentLanguage];
    const blob = new Blob([editorCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${config?.extension || 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.js,.ts,.jsx,.tsx,.py,.html,.css,.json,.xml,.txt';
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

  const handleFormatDocument = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  const toggleFind = () => {
    if (editorRef.current) {
      editorRef.current.getAction('actions.find')?.run();
      setShowFind(!showFind);
    }
  };

  const toggleCommandPalette = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.quickCommand')?.run();
    }
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
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
    wordWrap: wordWrap,
    formatOnPaste: formatOnPaste,
    formatOnType: formatOnType,
    autoClosingBrackets: autoClosingBrackets,
    autoClosingQuotes: 'always',
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    parameterHints: { enabled: true },
    acceptSuggestionOnEnter: 'on',
    tabCompletion: 'on',
    folding: true,
    foldingStrategy: 'indentation',
    bracketPairColorization: { enabled: true },
    stickyScroll: { enabled: true },
    renderWhitespace: 'selection',
    guides: {
      bracketPairs: true,
      indentation: true
    },
    ...options
  };

  return (
    <div className={`monaco-editor-wrapper ${isFullscreen ? 'fullscreen' : ''} ${className}`}>
      {/* Editor Header */}
      <div className="editor-header flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Code2 className="w-5 h-5 text-blue-400" />

          {/* Language Selector */}
          <select
            value={currentLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1.5 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {Object.entries(LANGUAGE_CONFIG).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* Error/Warning Count */}
          <div className="flex items-center gap-2">
            {errors.length > 0 && (
              <div className="flex items-center gap-1 text-red-400 text-sm" title={`${errors.length} error(s)`}>
                <AlertCircle className="w-4 h-4" />
                <span>{errors.length}</span>
              </div>
            )}
            {warnings.length > 0 && (
              <div className="flex items-center gap-1 text-yellow-400 text-sm" title={`${warnings.length} warning(s)`}>
                <Lightbulb className="w-4 h-4" />
                <span>{warnings.length}</span>
              </div>
            )}
          </div>

          {/* Unsaved indicator */}
          {!saved && (
            <div className="text-xs text-gray-400" title="Unaved changes">
              <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-sm"
            title="Run Code (Ctrl+Enter)"
          >
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">Run</span>
          </button>

          <button
            onClick={handleSave}
            className={`p-1.5 rounded transition-colors text-sm ${
              saved
                ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'
                : 'text-yellow-400 hover:text-yellow-300 hover:bg-gray-700'
            }`}
            title="Save (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
          </button>

          <button
            onClick={handleFormatDocument}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Format Document (Shift+Alt+F)"
          >
            <Lightbulb className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFind}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Find (Ctrl+F)"
          >
            <Search className="w-4 h-4" />
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
            onClick={toggleSettings}
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
            <div>
              <label className="block text-gray-400 mb-1">Theme</label>
              <select
                value={currentTheme}
                onChange={(e) => setCurrentTheme(e.target.value)}
                className="w-full bg-gray-700 text-white px-2 py-1 rounded border border-gray-600"
              >
                {Object.entries(THEMES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Font Size</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => editorRef.current?.updateOptions({ fontSize: Number(e.target.value) })}
                min="10"
                max="24"
                className="w-full bg-gray-700 text-white px-2 py-1 rounded border border-gray-600"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Tab Size</label>
              <input
                type="number"
                value={tabSize}
                onChange={(e) => editorRef.current?.updateOptions({ tabSize: Number(e.target.value) })}
                min="2"
                max="8"
                className="w-full bg-gray-700 text-white px-2 py-1 rounded border border-gray-600"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Word Wrap</label>
              <select
                value={wordWrap}
                onChange={(e) => editorRef.current?.updateOptions({ wordWrap: e.target.value })}
                className="w-full bg-gray-700 text-white px-2 py-1 rounded border border-gray-600"
              >
                <option value="on">On</option>
                <option value="off">Off</option>
                <option value="wordWrapColumn">Column</option>
                <option value="bounded">Bounded</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={showLineNumbers}
                  onChange={(e) => editorRef.current?.updateOptions({ lineNumbers: e.target.checked ? 'on' : 'off' })}
                  className="rounded"
                />
                Line Numbers
              </label>

              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={showMinimap}
                  onChange={(e) => editorRef.current?.updateOptions({ minimap: { enabled: e.target.checked } })}
                  className="rounded"
                />
                Minimap
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Monaco Editor */}
      <div className="editor-wrapper" style={{ height: isFullscreen ? 'calc(100vh - 52px)' : height }}>
        <Editor
          height="100%"
          language={currentLanguage}
          theme={currentTheme}
          value={editorCode}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={editorOptions}
          loading={
            <div className="flex items-center justify-center h-full bg-gray-900 text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span>Loading editor...</span>
              </div>
            </div>
          }
        />
      </div>

      <style jsx>{`
        .monaco-editor-wrapper {
          display: flex;
          flex-direction: column;
          background: #1e1e1e;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .monaco-editor-wrapper.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          height: 100vh;
          border-radius: 0;
        }

        .editor-wrapper :global(.monaco-editor) {
          padding-top: 0;
        }

        .editor-wrapper :global(.monaco-editor .margin) {
          background-color: #1e1e1e;
        }
      `}</style>
    </div>
  );
};

export default MonacoEditor;
