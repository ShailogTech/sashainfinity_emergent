import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Play,
  RotateCcw,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  X,
  Code2,
  Globe,
  AlertCircle,
  Info,
  Download
} from 'lucide-react';

const LivePreview = ({
  code = '',
  language = 'javascript',
  autoRun = false,
  height = '400px',
  showHTMLPreview = true,
  onExecutionComplete
}) => {
  const [output, setOutput] = useState([]);
  const [htmlPreview, setHtmlPreview] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('output');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (autoRun && code) {
      runCode();
    }
  }, [code, language, autoRun]);

  useEffect(() => {
    if (language === 'html' && showHTMLPreview) {
      setHtmlPreview(code);
      setSelectedTab('preview');
    } else {
      setSelectedTab('output');
    }
  }, [language, code, showHTMLPreview]);

  const runCode = async () => {
    setIsRunning(true);
    setError(null);
    setOutput([]);
    setExecutionTime(0);

    const startTime = performance.now();

    try {
      if (language === 'javascript') {
        await executeJavaScript(code);
      } else if (language === 'python') {
        await executePython(code);
      } else if (language === 'html') {
        setHtmlPreview(code);
      } else if (language === 'json') {
        executeJSON(code);
      }

      const endTime = performance.now();
      setExecutionTime((endTime - startTime).toFixed(2));

      if (onExecutionComplete) {
        onExecutionComplete({ success: true, time: executionTime });
      }
    } catch (err) {
      setError(err.message);
      setOutput(prev => [...prev, { type: 'error', message: err.message }]);

      if (onExecutionComplete) {
        onExecutionComplete({ success: false, error: err.message });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const executeJavaScript = async (code) => {
    const logs = [];
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    // Override console methods
    console.log = (...args) => {
      logs.push({ type: 'log', message: args.map(arg => formatOutput(arg)).join(' ') });
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      logs.push({ type: 'error', message: args.map(arg => formatOutput(arg)).join(' ') });
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      logs.push({ type: 'warn', message: args.map(arg => formatOutput(arg)).join(' ') });
      originalWarn.apply(console, args);
    };

    try {
      // Create async function to support await
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const fn = new AsyncFunction(code);

      await fn();

      setOutput(logs);

      // Return logs to original
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    } catch (err) {
      // Return console methods
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      throw err;
    }
  };

  const executePython = async (code) => {
    // For Python execution, we'll use a backend API
    // For now, show a message about backend requirement
    setOutput([
      {
        type: 'info',
        message: 'Python execution requires backend API. Code sent to server for execution.'
      }
    ]);

    try {
      const response = await fetch('/api/execute/python', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const result = await response.json();

      if (result.success) {
        setOutput([
          { type: 'success', message: 'Code executed successfully' },
          ...result.output.map(line => ({ type: 'log', message: line }))
        ]);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      if (err.message.includes('fetch')) {
        // Backend not available
        setOutput([
          { type: 'warn', message: 'Backend not available. Python execution is simulated:' },
          { type: 'log', message: code.split('\n').map(line => `>>> ${line}`).join('\n') }
        ]);
      } else {
        throw err;
      }
    }
  };

  const executeJSON = (code) => {
    try {
      const parsed = JSON.parse(code);
      setOutput([
        { type: 'success', message: 'Valid JSON' },
        { type: 'log', message: JSON.stringify(parsed, null, 2) }
      ]);
    } catch (err) {
      throw new Error(`Invalid JSON: ${err.message}`);
    }
  };

  const formatOutput = (arg) => {
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  };

  const clearOutput = () => {
    setOutput([]);
    setError(null);
    setExecutionTime(0);
  };

  const copyOutput = () => {
    const text = output.map(item => item.message).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadOutput = () => {
    const text = output.map(item => item.message).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getOutputIcon = (type) => {
    switch (type) {
      case 'error':
        return <X className="w-4 h-4" />;
      case 'warn':
        return <AlertCircle className="w-4 h-4" />;
      case 'success':
        return <Check className="w-4 h-4" />;
      case 'info':
        return <Info className="w-4 h-4" />;
      default:
        return <Terminal className="w-4 h-4" />;
    }
  };

  const getOutputColor = (type) => {
    switch (type) {
      case 'error':
        return 'text-red-400 bg-red-900/20';
      case 'warn':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'success':
        return 'text-green-400 bg-green-900/20';
      case 'info':
        return 'text-blue-400 bg-blue-900/20';
      default:
        return 'text-gray-300 bg-gray-800';
    }
  };

  return (
    <div className={`live-preview-container ${isFullscreen ? 'fullscreen' : ''} bg-gray-900 rounded-lg overflow-hidden flex flex-col`}>
      {/* Header */}
      <div className="preview-header flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          {language === 'html' && showHTMLPreview && (
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTab('preview')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${
                  selectedTab === 'preview'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Globe className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => setSelectedTab('output')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${
                  selectedTab === 'output'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Terminal className="w-4 h-4" />
                Console
              </button>
            </div>
          )}

          {selectedTab === 'output' && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {isRunning ? (
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Running...
                </span>
              ) : error ? (
                <span className="text-red-400 flex items-center gap-1">
                  <X className="w-4 h-4" />
                  Error
                </span>
              ) : output.length > 0 ? (
                <span className="text-green-400 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Completed ({executionTime}ms)
                </span>
              ) : (
                <span>No output</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
            title="Run Code"
          >
            <Play className="w-4 h-4" />
            Run
          </button>

          <button
            onClick={clearOutput}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Clear Output"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {selectedTab === 'output' && output.length > 0 && (
            <>
              <button
                onClick={copyOutput}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Copy Output"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={downloadOutput}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Download Output"
              >
                <Download className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden" style={{ height: isFullscreen ? 'calc(100vh - 50px)' : height }}>
        {selectedTab === 'preview' && language === 'html' ? (
          <iframe
            ref={iframeRef}
            srcDoc={htmlPreview}
            title="Preview"
            sandbox="allow-scripts"
            className="w-full h-full bg-white"
          />
        ) : (
          <div className="output-panel h-full overflow-auto p-4 space-y-2">
            {output.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Terminal className="w-12 h-12 mb-2" />
                <p>No output yet. Click "Run" to execute your code.</p>
              </div>
            )}

            {output.map((item, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 p-2 rounded ${getOutputColor(item.type)}`}
              >
                <span className="mt-0.5 flex-shrink-0">{getOutputIcon(item.type)}</span>
                <pre className="flex-1 text-sm whitespace-pre-wrap font-mono break-words">
                  {item.message}
                </pre>
              </div>
            ))}

            {error && (
              <div className="flex items-start gap-2 p-3 rounded bg-red-900/20 border border-red-800">
                <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <pre className="flex-1 text-sm text-red-400 whitespace-pre-wrap font-mono">
                  {error}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .live-preview-container.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          height: 100vh;
        }
      `}</style>
    </div>
  );
};

export default LivePreview;
