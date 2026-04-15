import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  Copy,
  Download,
  Terminal,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  ChevronDown,
  ChevronRight,
  Globe,
  Code
} from 'lucide-react';

const CodeRunner = ({
  code = '',
  language = 'javascript',
  autoRun = false,
  height = '300px',
  className = '',
  onExecutionComplete = null,
  showExecutionTime = true,
  showMemoryUsage = false
}) => {
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [memoryUsage, setMemoryUsage] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('console');
  const [htmlPreview, setHtmlPreview] = useState('');
  const [copied, setCopied] = useState(false);
  const [expandedOutput, setExpandedOutput] = useState(new Set());
  const iframeRef = useRef(null);
  const outputRef = useRef(null);

  // Auto-run on code change
  useEffect(() => {
    if (autoRun && code) {
      runCode();
    }
  }, [code, language, autoRun]);

  // Scroll to bottom on new output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Update HTML preview
  useEffect(() => {
    if (language === 'html') {
      setHtmlPreview(code);
      setSelectedTab('preview');
    } else {
      setSelectedTab('console');
    }
  }, [language, code]);

  const runCode = useCallback(async () => {
    if (!code.trim()) {
      setError('No code to execute');
      return;
    }

    setIsRunning(true);
    setError(null);
    setOutput([]);
    setExecutionTime(null);
    setMemoryUsage(null);

    const startTime = performance.now();
    const startMemory = showMemoryUsage && performance.memory ? performance.memory.usedJSHeapSize : null;

    try {
      let result;

      switch (language) {
        case 'javascript':
          result = await executeJavaScript(code);
          break;
        case 'python':
          result = await executePython(code);
          break;
        case 'html':
          setHtmlPreview(code);
          result = { success: true, output: [] };
          break;
        case 'json':
          result = executeJSON(code);
          break;
        default:
          result = await executeJavaScript(code);
      }

      const endTime = performance.now();
      const endMemory = showMemoryUsage && performance.memory ? performance.memory.usedJSHeapSize : null;

      setExecutionTime((endTime - startTime).toFixed(2));

      if (endMemory && startMemory) {
        const memoryDiff = ((endMemory - startMemory) / 1024 / 1024).toFixed(2);
        setMemoryUsage(`${memoryDiff > 0 ? '+' : ''}${memoryDiff} MB`);
      }

      if (result.success) {
        setOutput(result.output);
      } else {
        setError(result.error);
      }

      onExecutionComplete?.({
        success: result.success,
        time: executionTime,
        output: result.output,
        error: result.error
      });
    } catch (err) {
      const endTime = performance.now();
      setExecutionTime((endTime - startTime).toFixed(2));
      setError(err.message);
      setOutput(prev => [...prev, { type: 'error', message: err.message, timestamp: Date.now() }]);
    } finally {
      setIsRunning(false);
    }
  }, [code, language, showMemoryUsage, onExecutionComplete]);

  const executeJavaScript = async (code) => {
    const logs = [];
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    // Override console methods to capture output
    const createLogMethod = (type) => (...args) => {
      logs.push({
        type,
        message: args.map(arg => formatOutput(arg)).join(' '),
        timestamp: Date.now()
      });
      // Call original method
      const original = type === 'log' ? originalLog : type === 'error' ? originalError : type === 'warn' ? originalWarn : originalInfo;
      original.apply(console, args);
    };

    console.log = createLogMethod('log');
    console.error = createLogMethod('error');
    console.warn = createLogMethod('warn');
    console.info = createLogMethod('info');

    try {
      // Support for top-level await
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const fn = new AsyncFunction(code);

      await fn();

      return { success: true, output: logs };
    } catch (err) {
      return { success: false, error: err.message, output: logs };
    } finally {
      // Restore console methods
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;
    }
  };

  const executePython = async (code) => {
    // For Python, we'll need a backend API
    // For now, provide a simulated response
    setOutput([
      {
        type: 'info',
        message: 'Python execution requires backend support.',
        timestamp: Date.now()
      },
      {
        type: 'log',
        message: 'Code sent to server for execution...',
        timestamp: Date.now()
      }
    ]);

    try {
      const response = await fetch('/api/execute/python', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          output: result.output.map((line, i) => ({
            type: 'log',
            message: line,
            timestamp: Date.now() + i
          }))
        };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      // Fallback to simulated output
      return {
        success: true,
        output: [
          {
            type: 'warn',
            message: 'Backend not available. Showing simulated Python execution:',
            timestamp: Date.now()
          },
          {
            type: 'log',
            message: code.split('\n').map(line => `>>> ${line}`).join('\n'),
            timestamp: Date.now()
          },
          {
            type: 'info',
            message: 'Note: Connect the backend API to execute Python code.',
            timestamp: Date.now()
          }
        ]
      };
    }
  };

  const executeJSON = (code) => {
    try {
      const parsed = JSON.parse(code);
      return {
        success: true,
        output: [
          {
            type: 'success',
            message: 'Valid JSON',
            timestamp: Date.now()
          },
          {
            type: 'log',
            message: JSON.stringify(parsed, null, 2),
            timestamp: Date.now()
          }
        ]
      };
    } catch (err) {
      return {
        success: false,
        error: `Invalid JSON: ${err.message}`
      };
    }
  };

  const formatOutput = (arg) => {
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  };

  const stopExecution = () => {
    setIsRunning(false);
    setOutput(prev => [...prev, {
      type: 'warn',
      message: 'Execution stopped by user',
      timestamp: Date.now()
    }]);
  };

  const clearOutput = () => {
    setOutput([]);
    setError(null);
    setExecutionTime(null);
    setMemoryUsage(null);
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
    a.download = `output-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleExpand = (index) => {
    setExpandedOutput(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const getOutputIcon = (type) => {
    switch (type) {
      case 'error': return <XCircle className="w-4 h-4 flex-shrink-0" />;
      case 'warn': return <AlertCircle className="w-4 h-4 flex-shrink-0" />;
      case 'success': return <CheckCircle className="w-4 h-4 flex-shrink-0" />;
      case 'info': return <InfoIcon className="w-4 h-4 flex-shrink-0" />;
      default: return <Terminal className="w-4 h-4 flex-shrink-0" />;
    }
  };

  const getOutputColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-400 bg-red-900/20 border-red-800/50';
      case 'warn': return 'text-yellow-400 bg-yellow-900/20 border-yellow-800/50';
      case 'success': return 'text-green-400 bg-green-900/20 border-green-800/50';
      case 'info': return 'text-blue-400 bg-blue-900/20 border-blue-800/50';
      default: return 'text-gray-300 bg-gray-800 border-gray-700';
    }
  };

  const InfoIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );

  return (
    <div className={`code-runner ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          {/* Tabs */}
          {language === 'html' && (
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTab('preview')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors text-sm ${
                  selectedTab === 'preview'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Globe className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => setSelectedTab('console')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors text-sm ${
                  selectedTab === 'console'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Terminal className="w-4 h-4" />
                Console
              </button>
            </div>
          )}

          {/* Status */}
          {selectedTab === 'console' && (
            <div className="flex items-center gap-3 text-sm">
              {isRunning ? (
                <span className="flex items-center gap-2 text-yellow-400">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  Running...
                </span>
              ) : error ? (
                <span className="flex items-center gap-1 text-red-400">
                  <XCircle className="w-4 h-4" />
                  Error
                </span>
              ) : output.length > 0 ? (
                <span className="flex items-center gap-1 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  {output.length} output{output.length !== 1 ? 's' : ''}
                </span>
              ) : (
                <span className="text-gray-500">No output</span>
              )}

              {showExecutionTime && executionTime && (
                <span className="flex items-center gap-1 text-gray-400">
                  <Clock className="w-3 h-3" />
                  {executionTime}ms
                </span>
              )}

              {showMemoryUsage && memoryUsage && (
                <span className="flex items-center gap-1 text-gray-400">
                  <Zap className="w-3 h-3" />
                  {memoryUsage}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {selectedTab === 'console' && (
            <>
              <button
                onClick={isRunning ? stopExecution : runCode}
                disabled={!code.trim()}
                className={`flex items-center gap-1 px-3 py-1.5 rounded transition-colors text-sm ${
                  isRunning
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white'
                }`}
                title={isRunning ? 'Stop' : 'Run (Ctrl+Enter)'}
              >
                {isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isRunning ? 'Stop' : 'Run'}
              </button>

              <button
                onClick={clearOutput}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Clear Output"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {output.length > 0 && (
                <>
                  <button
                    onClick={copyOutput}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    title="Copy Output"
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
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
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="overflow-hidden" style={{ height }}>
        {selectedTab === 'preview' && language === 'html' ? (
          <iframe
            ref={iframeRef}
            srcDoc={htmlPreview}
            title="Preview"
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-full bg-white"
          />
        ) : (
          <div
            ref={outputRef}
            className="h-full overflow-auto p-4 space-y-2 bg-gray-900"
          >
            {output.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Terminal className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm">No output yet. Press "Run" to execute your code.</p>
                <p className="text-xs mt-1">Keyboard shortcut: Ctrl + Enter</p>
              </div>
            )}

            {output.map((item, index) => {
              const isExpanded = expandedOutput.has(index);
              const isLong = item.message.length > 200;

              return (
                <div
                  key={index}
                  className={`flex items-start gap-2 p-2 rounded border transition-all ${getOutputColor(item.type)}`}
                >
                  <span className="mt-0.5">{getOutputIcon(item.type)}</span>
                  <div className="flex-1 min-w-0">
                    {isLong && !isExpanded ? (
                      <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                        {item.message.slice(0, 200)}...
                      </pre>
                    ) : (
                      <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                        {item.message}
                      </pre>
                    )}
                    {isLong && (
                      <button
                        onClick={() => toggleExpand(index)}
                        className="flex items-center gap-1 mt-1 text-xs opacity-60 hover:opacity-100"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronDown className="w-3 h-3" /> Show less
                          </>
                        ) : (
                          <>
                            <ChevronRight className="w-3 h-3" /> Show more
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <span className="text-xs opacity-50">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              );
            })}

            {error && (
              <div className="flex items-start gap-2 p-3 rounded bg-red-900/20 border border-red-800/50">
                <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <pre className="flex-1 text-sm text-red-400 whitespace-pre-wrap font-mono">
                  {error}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeRunner;
