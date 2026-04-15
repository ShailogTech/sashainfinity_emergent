import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MonacoEditor from '@/components/CodeSandbox/MonacoEditor';
import CodeRunner from '@/components/CodeSandbox/CodeRunner';
import CodeTemplates from '@/components/CodeSandbox/CodeTemplates';
import FileExplorer from '@/components/CodeSandbox/FileExplorer';
import SplitPane, { ResponsiveSplitPane } from '@/components/CodeSandbox/SplitPane';
import {
  Play,
  Save,
  FolderOpen,
  Share2,
  History,
  Settings,
  Maximize2,
  X,
  Check,
  Copy,
  Trash2,
  FileCode,
  Video,
  PanelLeft,
  PanelRight,
  PanelLeftClose,
  PanelRightClose,
  Monitor,
  Type,
  Loader2
} from 'lucide-react';

// Default code snippets for different lessons
const DEFAULT_SNIPPETS = {
  javascript: [
    {
      id: 'js-intro',
      title: 'Introduction to JavaScript',
      description: 'Learn the basics of JavaScript programming',
      videoUrl: '',
      code: `// Welcome to JavaScript!
// JavaScript is a powerful programming language for the web.

// 1. Variables
let message = "Hello, World!";
console.log(message);

// 2. Constants
const PI = 3.14159;
console.log("Pi is approximately:", PI);

// 3. Data Types
let name = "Developer";       // String
let age = 25;                 // Number
let isStudent = true;         // Boolean
let nothing = null;           // Null
let notDefined;               // Undefined

console.log("Name:", name, "Age:", age, "Student:", isStudent);

// 4. Functions
function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("World"));

// 5. Arrow Functions (ES6)
const add = (a, b) => a + b;
console.log("5 + 3 =", add(5, 3));

// 6. Arrays
const fruits = ["apple", "banana", "orange"];
console.log("Fruits:", fruits);
console.log("First fruit:", fruits[0]);

// 7. Objects
const person = {
  name: "John",
  age: 30,
  greet: function() {
    return "Hi, I'm " + this.name;
  }
};
console.log(person.greet());`
    },
    {
      id: 'js-arrays',
      title: 'Working with Arrays',
      description: 'Master array methods and operations',
      code: `// JavaScript Arrays - Powerful data structures

const numbers = [1, 2, 3, 4, 5];

// Add elements
numbers.push(6);           // Add to end
numbers.unshift(0);        // Add to beginning
console.log("After push/unshift:", numbers);

// Remove elements
numbers.pop();             // Remove from end
numbers.shift();           // Remove from beginning
console.log("After pop/shift:", numbers);

// Array Methods
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);

const evens = numbers.filter(n => n % 2 === 0);
console.log("Evens:", evens);

const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log("Sum:", sum);

// Find elements
const found = numbers.find(n => n > 2);
console.log("First > 2:", found);

// Check conditions
const hasEven = numbers.some(n => n % 2 === 0);
const allPositive = numbers.every(n => n > 0);
console.log("Has even?", hasEven);
console.log("All positive?", allPositive);

// Sort
const sorted = [...numbers].sort((a, b) => b - a);
console.log("Descending:", sorted);`
    },
    {
      id: 'js-async',
      title: 'Async JavaScript',
      description: 'Promises, async/await, and callbacks',
      code: `// Asynchronous JavaScript

// Simulating an API call
const fetchData = (url) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ data: "Sample data", url });
    }, 1000);
  });
};

// Using Promises
console.log("1. Starting Promise...");
fetchData("/api/users")
  .then(response => {
    console.log("2. Data received:", response);
    return fetchData("/api/posts");
  })
  .then(response => {
    console.log("3. More data:", response);
  })
  .catch(error => {
    console.error("Error:", error);
  });

// Using async/await
const loadAllData = async () => {
  console.log("4. Starting async/await...");
  try {
    const users = await fetchData("/api/users");
    console.log("5. Users loaded:", users);

    const posts = await fetchData("/api/posts");
    console.log("6. Posts loaded:", posts);

    // Parallel requests
    const [data1, data2, data3] = await Promise.all([
      fetchData("/api/1"),
      fetchData("/api/2"),
      fetchData("/api/3")
    ]);
    console.log("7. All parallel data loaded");
  } catch (error) {
    console.error("Error loading data:", error);
  }
};

loadAllData();`
    },
    {
      id: 'js-dom',
      title: 'DOM Manipulation',
      description: 'Interact with HTML elements',
      code: `// DOM Manipulation
// Note: This code works in browser console or HTML context

// Selecting elements
// const title = document.getElementById('title');
// const headers = document.getElementsByClassName('header');
// const buttons = document.querySelectorAll('button');

// Modifying elements
// title.textContent = 'New Title';
// title.innerHTML = '<span>Styled Title</span>';
// title.style.color = 'blue';

// Creating elements
// const newDiv = document.createElement('div');
// newDiv.textContent = 'Hello!';
// newDiv.className = 'box';
// document.body.appendChild(newDiv);

// Event handling
/*
button.addEventListener('click', function() {
  alert('Button clicked!');
});

// Form handling
form.addEventListener('submit', function(e) {
  e.preventDefault();
  const data = new FormData(form);
  console.log(Object.fromEntries(data));
});
*/

console.log("DOM manipulation works in browser context!");
console.log("Use the HTML template to practice DOM operations.");`
    }
  ],
  python: [
    {
      id: 'py-intro',
      title: 'Introduction to Python',
      description: 'Learn Python fundamentals',
      code: `# Welcome to Python!
# Python is known for its clean and readable syntax.

# 1. Variables and Data Types
name = "Developer"
age = 25
height = 5.9
is_student = True

print(f"Name: {name}, Age: {age}")

# 2. Lists
fruits = ["apple", "banana", "orange"]
print(f"Fruits: {fruits}")
print(f"First fruit: {fruits[0]}")

# 3. Dictionaries
person = {
    "name": "John",
    "age": 30,
    "city": "New York"
}
print(f"Person: {person}")

# 4. Functions
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))

# 5. Loops
for fruit in fruits:
    print(f"I like {fruit}")

# 6. List Comprehensions
numbers = [1, 2, 3, 4, 5]
squared = [n ** 2 for n in numbers]
print(f"Squared: {squared}")

# 7. Classes
class Dog:
    def __init__(self, name):
        self.name = name

    def bark(self):
        return f"{self.name} says Woof!"

dog = Dog("Buddy")
print(dog.bark())`
    }
  ],
  html: [
    {
      id: 'html-intro',
      title: 'HTML Basics',
      description: 'Structure your web pages',
      code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML Basics</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', sans-serif;
            line-height: 1.6;
            padding: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }
        .demo {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background: #5568d3;
        }
        input, textarea {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>HTML Interactive Demo</h1>

        <div class="demo">
            <h2>Button Example</h2>
            <button onclick="showMessage()">Click Me!</button>
            <p id="message"></p>
        </div>

        <div class="demo">
            <h2>Input Example</h2>
            <input type="text" id="nameInput" placeholder="Enter your name">
            <button onclick="greetUser()">Greet</button>
        </div>

        <div class="demo">
            <h2>Counter</h2>
            <p>Count: <span id="count">0</span></p>
            <button onclick="increment()">Increment</button>
            <button onclick="decrement()">Decrement</button>
        </div>
    </div>

    <script>
        function showMessage() {
            document.getElementById('message').textContent =
                'Hello! You clicked the button.';
        }

        function greetUser() {
            const name = document.getElementById('nameInput').value;
            alert('Hello, ' + name + '!');
        }

        let count = 0;
        function increment() {
            count++;
            document.getElementById('count').textContent = count;
        }

        function decrement() {
            count--;
            document.getElementById('count').textContent = count;
        }
    </script>
</body>
</html>`
    }
  ]
};

const CodeSandboxPage = () => {
  const { courseId, lessonId } = useParams();
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(DEFAULT_SNIPPETS.javascript[0].code);
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const [showConsole, setShowConsole] = useState(true);
  const [activeSnippet, setActiveSnippet] = useState(DEFAULT_SNIPPETS.javascript[0]);
  const [snippets] = useState(DEFAULT_SNIPPETS[language] || []);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Files for file explorer
  const [files, setFiles] = useState([
    { id: 1, name: 'script.js', path: '/script.js', type: 'file', language: 'javascript', code: code },
    { id: 2, name: 'styles.css', path: '/styles.css', type: 'file', language: 'css', code: 'body { margin: 0; }' },
    { id: 3, name: 'index.html', path: '/index.html', type: 'file', language: 'html', code: '' }
  ]);
  const [activeFile, setActiveFile] = useState(files[0]);

  // Load lesson from URL params
  useEffect(() => {
    if (courseId && lessonId) {
      // In a real app, fetch lesson data from API
      console.log(`Loading course: ${courseId}, lesson: ${lessonId}`);
    }
  }, [courseId, lessonId]);

  const handleCodeChange = useCallback((newCode, newLanguage) => {
    setCode(newCode);
    setFiles(prev => prev.map(f =>
      f.id === activeFile.id ? { ...f, code: newCode } : f
    ));
  }, [activeFile?.id]);

  const handleRun = useCallback((executedCode, executedLanguage) => {
    setIsRunning(true);
    console.log(`Running ${executedLanguage} code...`);
    // CodeRunner handles the actual execution
    setTimeout(() => setIsRunning(false), 100);
  }, []);

  const handleExecutionComplete = useCallback((result) => {
    setExecutionResult(result);
    setIsRunning(false);
  }, []);

  const handleSave = useCallback((savedCode, savedLanguage) => {
    console.log('Saving code:', { language: savedLanguage, length: savedCode.length });
    // In a real app, save to backend API
    setShowNotification('Code saved successfully!', 'success');
  }, []);

  const handleTemplateSelect = useCallback((template) => {
    setCode(template.code);
    setLanguage(template.language);
    setActiveSnippet({
      id: 'template',
      title: template.name,
      description: `Template: ${template.name}`,
      code: template.code
    });
    setShowTemplates(false);
  }, []);

  const handleFileSelect = useCallback((file) => {
    setActiveFile(file);
    setCode(file.code || '');
    setLanguage(file.language || 'javascript');
  }, []);

  const handleFileCreate = useCallback((newFile) => {
    setFiles(prev => [...prev, newFile]);
    setActiveFile(newFile);
    setCode('');
  }, []);

  const handleFileDelete = useCallback((file) => {
    setFiles(prev => prev.filter(f => f.id !== file.id));
    if (activeFile?.id === file.id && files.length > 1) {
      const nextFile = files.find(f => f.id !== file.id);
      setActiveFile(nextFile);
      setCode(nextFile?.code || '');
    }
  }, [activeFile?.id, files]);

  const handleFileRename = useCallback((file, newName) => {
    setFiles(prev => prev.map(f =>
      f.id === file.id ? { ...f, name: newName } : f
    ));
  }, []);

  const handleSnippetSelect = useCallback((snippet) => {
    setActiveSnippet(snippet);
    setCode(snippet.code);
  }, []);

  const handleLanguageChange = useCallback((newLanguage) => {
    setLanguage(newLanguage);
    const langSnippets = DEFAULT_SNIPPETS[newLanguage];
    if (langSnippets && langSnippets.length > 0) {
      setActiveSnippet(langSnippets[0]);
      setCode(langSnippets[0].code);
    }
  }, []);

  const [notification, setNotification] = useState(null);
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleShare = useCallback(() => {
    const encodedCode = btoa(code);
    const url = new URL(window.location.href);
    url.searchParams.set('code', encodedCode);
    url.searchParams.set('lang', language);
    navigator.clipboard.writeText(url.toString());
    showNotification('Share link copied to clipboard!', 'success');
  }, [code, language]);

  const handleDownload = useCallback(() => {
    const extensions = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      html: 'html',
      css: 'css',
      json: 'json'
    };
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extensions[language] || 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Code downloaded!', 'success');
  }, [code, language]);

  return (
    <div className={`code-sandbox-page min-h-screen bg-gray-950 ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Top Navigation Bar */}
      <div className="top-nav flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileCode className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-bold text-white">Code Sandbox</h1>
          </div>

          {/* Lesson Selector */}
          <div className="hidden md:flex items-center gap-2 ml-6">
            {snippets.map(snippet => (
              <button
                key={snippet.id}
                onClick={() => handleSnippetSelect(snippet)}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  activeSnippet?.id === snippet.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {snippet.title}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className={`p-2 rounded transition-colors ${
              showTemplates ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title="Templates"
          >
            <FolderOpen className="w-5 h-5" />
          </button>

          <button
            onClick={handleShare}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <button
            onClick={handleDownload}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title="Download"
          >
            <Save className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <X className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-60px)]">
        {/* Left Sidebar - Templates */}
        {showTemplates && (
          <div className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col">
            <div className="p-3 border-b border-gray-800">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Templates</h2>
            </div>
            <CodeTemplates
              language={language}
              onTemplateSelect={handleTemplateSelect}
              className="flex-1 overflow-hidden"
            />
          </div>
        )}

        {/* Center - Editor and Console */}
        <div className="flex-1 flex flex-col">
          {/* Editor Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {showFileExplorer ? (
                  <button
                    onClick={() => setShowFileExplorer(false)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded"
                    title="Hide File Explorer"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowFileExplorer(true)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded"
                    title="Show File Explorer"
                  >
                    <PanelLeft className="w-4 h-4" />
                  </button>
                )}
                {showConsole ? (
                  <button
                    onClick={() => setShowConsole(false)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded"
                    title="Hide Console"
                  >
                    <PanelRightClose className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConsole(true)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded"
                    title="Show Console"
                  >
                    <PanelRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Active File Display */}
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded">
                <Type className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">{activeFile?.name || 'untitled.js'}</span>
              </div>

              {/* Execution Status */}
              {isRunning && (
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running...
                </div>
              )}
              {executionResult && !isRunning && (
                <div className={`flex items-center gap-2 text-sm ${
                  executionResult.success ? 'text-green-400' : 'text-red-400'
                }`}>
                  {executionResult.success ? (
                    <><Check className="w-4 h-4" /> Executed successfully</>
                  ) : (
                    <><X className="w-4 h-4" /> Execution failed</>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-gray-800 text-white px-3 py-1.5 rounded border border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="json">JSON</option>
              </select>

              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && window.dispatchEvent) {
                    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true }));
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                title="Run (Ctrl+Enter)"
              >
                <Play className="w-4 h-4" />
                Run
              </button>
            </div>
          </div>

          {/* Editor and Console Split */}
          <div className="flex-1 flex overflow-hidden">
            {/* File Explorer (Collapsible) */}
            {showFileExplorer && (
              <div className="w-56 bg-gray-900 border-r border-gray-800">
                <FileExplorer
                  files={files}
                  activeFile={activeFile}
                  onFileSelect={handleFileSelect}
                  onFileCreate={handleFileCreate}
                  onFileDelete={handleFileDelete}
                  onFileRename={handleFileRename}
                />
              </div>
            )}

            {/* Main Editor */}
            <div className="flex-1 flex flex-col">
              <div className={showConsole ? 'flex-1' : 'flex-1'}>
                <MonacoEditor
                  code={code}
                  language={language}
                  onChange={handleCodeChange}
                  onRun={handleRun}
                  onSave={handleSave}
                  height="100%"
                  className="rounded-none"
                />
              </div>

              {/* Console Output (Collapsible) */}
              {showConsole && (
                <div className="h-64 border-t border-gray-800">
                  <CodeRunner
                    code={code}
                    language={language}
                    onExecutionComplete={handleExecutionComplete}
                    height="100%"
                    className="rounded-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 ${
          notification.type === 'success' ? 'bg-green-600' :
          notification.type === 'error' ? 'bg-red-600' :
          'bg-blue-600'
        }`}>
          {notification.type === 'success' && <Check className="w-5 h-5" />}
          {notification.type === 'error' && <X className="w-5 h-5" />}
          <span className="text-white font-medium">{notification.message}</span>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 left-4 text-xs text-gray-500 bg-gray-900 px-3 py-2 rounded border border-gray-800">
        <div className="flex items-center gap-3">
          <span><kbd className="px-1.5 py-0.5 bg-gray-800 rounded">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 bg-gray-800 rounded">Enter</kbd> Run</span>
          <span><kbd className="px-1.5 py-0.5 bg-gray-800 rounded">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 bg-gray-800 rounded">S</kbd> Save</span>
          <span><kbd className="px-1.5 py-0.5 bg-gray-800 rounded">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 bg-gray-800 rounded">F</kbd> Find</span>
        </div>
      </div>

      <style jsx>{`
        .code-sandbox-page.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
        }

        kbd {
          font-family: monospace;
          font-size: 11px;
        }
      `}</style>
    </div>
  );
};

export default CodeSandboxPage;
