import React, { useState } from 'react';
import { CodeSandbox } from './CodeSandbox';
import { Card } from '@/components/ui/card';

const CodeSandboxExample = () => {
  const [codeSnippets] = useState([
    {
      id: 1,
      title: 'Introduction to Functions',
      description: 'Learn how to create and use functions in JavaScript',
      timestamp: 0,
      language: 'javascript',
      code: `// Introduction to Functions
// Functions are reusable blocks of code

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
console.log(greet("Developer"));`
    },
    {
      id: 2,
      title: 'Arrow Functions',
      description: 'Modern ES6 arrow function syntax',
      timestamp: 30,
      language: 'javascript',
      code: `// Arrow Functions (ES6)
// A more concise way to write functions

const greet = (name) => \`Hello, \${name}!\`;
const add = (a, b) => a + b;

console.log(greet("World"));
console.log(add(5, 3));`
    },
    {
      id: 3,
      title: 'Array Methods',
      description: 'Working with arrays using built-in methods',
      timestamp: 60,
      language: 'javascript',
      code: `// Array Methods
// Powerful methods for working with arrays

const numbers = [1, 2, 3, 4, 5];

// Map - transform each element
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);

// Filter - keep elements that pass a test
const evens = numbers.filter(n => n % 2 === 0);
console.log("Evens:", evens);

// Reduce - combine all elements
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log("Sum:", sum);`
    },
    {
      id: 4,
      title: 'Async/Await',
      description: 'Handling asynchronous operations',
      timestamp: 120,
      language: 'javascript',
      code: `// Async/Await
// Modern way to handle async operations

async function fetchData() {
  try {
    // Simulate API call
    const response = await new Promise(resolve =>
      setTimeout(() => resolve({ data: "Hello from API!" }), 1000)
    );
    console.log(response.data);
  } catch (error) {
    console.error("Error:", error);
  }
}

fetchData();`
    },
    {
      id: 5,
      title: 'Building a Web Page',
      description: 'Create your first HTML page',
      timestamp: 0,
      language: 'html',
      code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Page</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .card {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background: #5568d3;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>Welcome to Web Development!</h1>
        <p>This is your first HTML page with inline styles.</p>
        <button onclick="alert('Hello!')">Click Me!</button>
    </div>
</body>
</html>`
    }
  ]);

  const handleSave = (snippet) => {
    console.log('Saved snippet:', snippet);
    // Here you would typically save to your backend
  };

  const handleShare = (data) => {
    console.log('Shared data:', data);
    // Share link is automatically copied to clipboard
  };

  const handleLoad = (snippet) => {
    console.log('Loaded snippet:', snippet);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Interactive Code Sandbox</h1>
        <p className="text-gray-400">
          Code along with video lessons, save your work, and share with others.
        </p>
      </div>

      <Card className="p-4 bg-gray-800 border-gray-700">
        <CodeSandbox
          initialCode={codeSnippets[0].code}
          initialLanguage="javascript"
          videoUrl=""
          codeSnippets={codeSnippets}
          onSave={handleSave}
          onShare={handleShare}
          onLoad={handleLoad}
          autoRun={false}
          showVideoSync={true}
          showSaveLoad={true}
          readOnly={false}
          height="800px"
        />
      </Card>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-3">Features</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>Real-time code execution with live output</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>Multi-language support (JavaScript, Python, HTML)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>Video timeline synchronization</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>Save and load code snippets</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>Share code with timestamp links</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>Code history and version tracking</span>
            </li>
          </ul>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-3">How to Use</h3>
          <ol className="space-y-2 text-gray-300 list-decimal list-inside">
            <li>Select a code snippet from the timeline</li>
            <li>Edit the code in the editor</li>
            <li>Click "Run" to see the output</li>
            <li>Save your snippets for later use</li>
            <li>Share your work with others</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default CodeSandboxExample;
