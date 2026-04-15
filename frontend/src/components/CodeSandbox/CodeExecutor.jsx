import React, { useState, useEffect, useCallback } from 'react';
import { Play, RotateCcw, Trash2, Copy, Check, Download, Upload, Terminal } from 'lucide-react';
import './CodeSandbox.css';

const CodeExecutor = ({
  code = '',
  language = 'javascript',
  onExecute,
  autoRun = false,
  height = '300px',
  apiEndpoint = '/api/sandbox/execute'
}) => {
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (autoRun && code) {
      executeCode();
    }
  }, [code, language, autoRun]);

  const executeCode = useCallback(async () => {
    if (!code.trim()) {
      setOutput([{ type: 'warn', message: 'No code to execute' }]);
      return;
    }

    setIsRunning(true);
    setError(null);
    setOutput([]);
    setExecutionTime(0);

    const startTime = performance.now();

    try {
      if (language === 'javascript') {
        // Try backend first, fallback to client-side
        try {
          const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language, timeout: 5 })
          });

          if (response.ok) {
            const result = await response.json();
            const endTime = performance.now();

            if (result.success) {
              setOutput(result.output.map(line => ({ type: 'log', message: line })));
              setExecutionTime((endTime - startTime).toFixed(2));
              if (onExecute) onExecute({ success: true, output: result.output, time: endTime - startTime });
            } else {
              throw new Error(result.error || 'Execution failed');
            }
          } else {
            throw new Error('API not available');
          }
        } catch (apiError) {
          // Fallback to client-side execution
          await executeClientSide(code);
        }
      } else if (language === 'python') {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, language, timeout: 5 })
        });

        const result = await response.json();
        const endTime = performance.now();

        if (result.success) {
          setOutput(result.output.map(line => ({ type: 'log', message: line })));
          setExecutionTime((endTime - startTime).toFixed(2));
          if (onExecute) onExecute({ success: true, output: result.output, time: endTime - startTime });
        } else {
          throw new Error(result.error || 'Execution failed');
        }
      } else {
        await executeClientSide(code);
      }
    } catch (err) {
      setError(err.message);
      setOutput([{ type: 'error', message: err.message }]);
      if (onExecute) onExecute({ success: false, error: err.message });
    } finally {
      setIsRunning(false);
    }
  }, [code, language, apiEndpoint, onExecute]);

  const executeClientSide = async (jsCode) => {
    const logs = [];
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalTable = console.table;
    const originalDir = console.dir;

    const captureLog = (type, args) => {
      const formatted = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');
      logs.push({ type, message: formatted });
    };

    console.log = (...args) => captureLog('log', args);
    console.error = (...args) => captureLog('error', args);
    console.warn = (...args) => captureLog('warn', args);
    console.table = (...args) => {
      if (args[0] && typeof args[0] === 'object') {
        captureLog('table', [JSON.stringify(args[0], null, 2)]);
      }
    };
    console.dir = (...args) => {
      if (args[0] && typeof args[0] === 'object') {
        captureLog('dir', [JSON.stringify(args[0], null, 2)]);
      }
    };

    try {
      const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
      const fn = new AsyncFunction(jsCode);
      await fn();

      const endTime = performance.now();
      setOutput(logs);
      setExecutionTime((endTime - performance.now()).toFixed(2));
      if (onExecute) onExecute({ success: true, output: logs, time: endTime - performance.now() });
    } catch (err) {
      throw err;
    } finally {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      console.table = originalTable;
      console.dir = originalDir;
    }
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
    a.download = `output-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getOutputColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-400 bg-red-900/20 border-red-800';
      case 'warn': return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
      case 'table': case 'dir': return 'text-cyan-400 bg-cyan-900/20 border-cyan-800';
      default: return 'text-gray-300 bg-gray-800/50 border-gray-700';
    }
  };

  return (
    <div className="code-executor-container" style={{ height }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/80 backdrop-blur border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-gray-300">Console Output</span>

          {isRunning && (
            <span className="flex items-center gap-2 text-green-400 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Running...
            </span>
          )}

          {!isRunning && output.length > 0 && !error && (
            <span className="text-green-400 text-sm">
              Completed ({executionTime}ms)
            </span>
          )}

          {error && (
            <span className="text-red-400 text-sm">Error</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={executeCode}
            disabled={isRunning}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm transition-all"
            title="Run Code (Ctrl+Enter)"
          >
            <Play className="w-3 h-3" />
            Run
          </button>

          <button
            onClick={clearOutput}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Clear Console"
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
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
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
        </div>
      </div>

      {/* Output */}
      <div className="output-panel flex-1 overflow-auto" style={{ height: 'calc(100% - 44px)' }}>
        {output.length === 0 && !error && !isRunning && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Terminal className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">No output yet</p>
            <p className="text-xs mt-1">Click Run to execute your code</p>
          </div>
        )}

        {output.map((item, index) => (
          <div key={index} className={`flex items-start gap-2 p-2 mb-1 rounded border ${getOutputColor(item.type)}`}>
            <span className="text-xs mt-0.5 opacity-50">{index + 1}</span>
            <pre className="flex-1 text-sm whitespace-pre-wrap font-mono break-words m-0">
              {item.message}
            </pre>
          </div>
        ))}

        {error && (
          <div className="p-3 mb-1 rounded bg-red-900/20 border border-red-800">
            <pre className="text-sm text-red-400 whitespace-pre-wrap font-mono m-0">
              {error}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeExecutor;
