import React, { useState } from 'react';
import {
  FileCode,
  FileJson,
  Globe,
  Cpu,
  Zap,
  BookOpen,
  Code,
  Palette,
  Database,
  ChevronDown,
  Search,
  Folder
} from 'lucide-react';

const TEMPLATES = {
  javascript: [
    {
      id: 'js-hello',
      name: 'Hello World',
      category: 'Basics',
      icon: <Code className="w-4 h-4" />,
      code: `// Hello World in JavaScript
console.log("Hello, World!");

// Variables
let greeting = "Welcome to Code Sandbox!";
console.log(greeting);

// Functions
function sayHello(name) {
  return \`Hello, \${name}!\`;
}

console.log(sayHello("Developer"));`
    },
    {
      id: 'js-functions',
      name: 'Functions & Arrow Functions',
      category: 'Basics',
      icon: <Code className="w-4 h-4" />,
      code: `// Traditional Function
function add(a, b) {
  return a + b;
}

// Arrow Function
const multiply = (a, b) => a * b;

// Arrow Function with Block Body
const divide = (a, b) => {
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }
  return a / b;
};

console.log("Add:", add(5, 3));
console.log("Multiply:", multiply(5, 3));
console.log("Divide:", divide(10, 2));`
    },
    {
      id: 'js-arrays',
      name: 'Array Methods',
      category: 'Intermediate',
      icon: <FileCode className="w-4 h-4" />,
      code: `// Array Methods Demo
const numbers = [1, 2, 3, 4, 5];

// map - Transform each element
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);

// filter - Keep elements that match
const evens = numbers.filter(n => n % 2 === 0);
console.log("Evens:", evens);

// reduce - Accumulate values
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log("Sum:", sum);

// find - Find first match
const found = numbers.find(n => n > 3);
console.log("Found:", found);

// forEach - Execute for each element
console.log("ForEach:");
numbers.forEach(n => console.log("  Item:", n));`
    },
    {
      id: 'js-async',
      name: 'Async/Await',
      category: 'Advanced',
      icon: <Zap className="w-4 h-4" />,
      code: `// Async/Await Demo

// Simulate API call
const fetchData = async (url) => {
  console.log(\`Fetching \${url}...\`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: "Sample Data", timestamp: Date.now() });
    }, 1000);
  });
};

// Using async/await
const loadData = async () => {
  try {
    console.log("Starting data load...");
    const result = await fetchData("https://api.example.com/data");
    console.log("Data received:", result);
  } catch (error) {
    console.error("Error:", error);
  }
};

// Parallel requests with Promise.all
const loadMultiple = async () => {
  const [data1, data2, data3] = await Promise.all([
    fetchData("/api/1"),
    fetchData("/api/2"),
    fetchData("/api/3")
  ]);
  console.log("All data loaded:", { data1, data2, data3 });
};

loadData();
loadMultiple();`
    },
    {
      id: 'js-classes',
      name: 'Classes & OOP',
      category: 'Intermediate',
      icon: <FileCode className="w-4 h-4" />,
      code: `// Classes and Object-Oriented Programming

class Animal {
  constructor(name, species) {
    this.name = name;
    this.species = species;
  }

  speak() {
    console.log(\`\${this.name} makes a sound.\`);
  }

  info() {
    return \`This is \${this.name}, a \${this.species}.\`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name, "Canine");
    this.breed = breed;
  }

  speak() {
    console.log(\`\${this.name} barks: Woof! Woof!\`);
  }

  fetch() {
    console.log(\`\${this.name} fetches the ball!\`);
  }
}

const dog = new Dog("Buddy", "Golden Retriever");
console.log(dog.info());
dog.speak();
dog.fetch();`
    }
  ],
  python: [
    {
      id: 'py-hello',
      name: 'Hello World',
      category: 'Basics',
      icon: <Code className="w-4 h-4" />,
      code: `# Hello World in Python
print("Hello, World!")

# Variables
name = "Developer"
greeting = f"Welcome, {name}!"
print(greeting)

# Functions
def say_hello(name):
    return f"Hello, {name}!"

print(say_hello("World"))`
    },
    {
      id: 'py-lists',
      name: 'Lists & Comprehensions',
      category: 'Basics',
      icon: <FileCode className="w-4 h-4" />,
      code: `# Lists and List Comprehensions

numbers = [1, 2, 3, 4, 5]

# List comprehension
doubled = [n * 2 for n in numbers]
print(f"Doubled: {doubled}")

# Filter with comprehension
evens = [n for n in numbers if n % 2 == 0]
print(f"Evens: {evens}")

# Nested comprehension
matrix = [[i * j for j in range(3)] for i in range(3)]
print(f"Matrix: {matrix}")

# Common operations
fruits = ["apple", "banana", "cherry"]
fruits.append("date")
fruits.insert(1, "blueberry")
print(f"Fruits: {fruits}")

# Slicing
print(f"First two: {fruits[:2]}")
print(f"Last two: {fruits[-2:]}")`
    },
    {
      id: 'py-dicts',
      name: 'Dictionaries',
      category: 'Intermediate',
      icon: <FileJson className="w-4 h-4" />,
      code: `# Dictionaries in Python

# Creating dictionaries
person = {
    "name": "Alice",
    "age": 30,
    "city": "New York",
    "skills": ["Python", "JavaScript", "SQL"]
}

# Accessing values
print(f"Name: {person['name']}")
print(f"Age: {person.get('age', 'Unknown')}")

# Adding/updating
person["email"] = "alice@example.com"
person["age"] = 31

# Dictionary methods
print(f"Keys: {list(person.keys())}")
print(f"Values: {list(person.values())}")
print(f"Items: {list(person.items())}")

# Dictionary comprehension
squares = {x: x**2 for x in range(6)}
print(f"Squares: {squares}")`
    },
    {
      id: 'py-classes',
      name: 'Classes & OOP',
      category: 'Advanced',
      icon: <Zap className="w-4 h-4" />,
      code: `# Classes and Object-Oriented Programming

class Animal:
    def __init__(self, name, species):
        self.name = name
        self.species = species

    def speak(self):
        print(f"{self.name} makes a sound.")

    def info(self):
        return f"This is {self.name}, a {self.species}."

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name, "Canine")
        self.breed = breed

    def speak(self):
        print(f"{self.name} barks: Woof! Woof!")

    def fetch(self):
        print(f"{self.name} fetches the ball!")

dog = Dog("Buddy", "Golden Retriever")
print(dog.info())
dog.speak()
dog.fetch()`
    }
  ],
  html: [
    {
      id: 'html-basic',
      name: 'Basic HTML Template',
      category: 'Basics',
      icon: <Globe className="w-4 h-4" />,
      code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Page</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            line-height: 1.6;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        p {
            color: #666;
            margin-bottom: 15px;
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
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to HTML!</h1>
        <p>This is a basic HTML template with inline styles.</p>
        <button onclick="alert('Hello!')">Click Me</button>
    </div>
</body>
</html>`
    },
    {
      id: 'html-forms',
      name: 'HTML Forms',
      category: 'Intermediate',
      icon: <Globe className="w-4 h-4" />,
      code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML Forms</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input, select, textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button {
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background: #45a049;
        }
    </style>
</head>
<body>
    <h2>Contact Form</h2>
    <form onsubmit="event.preventDefault(); alert('Form submitted!');">
        <div class="form-group">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required>
        </div>
        <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
        </div>
        <div class="form-group">
            <label for="message">Message:</label>
            <textarea id="message" name="message" rows="4"></textarea>
        </div>
        <button type="submit">Submit</button>
    </form>
</body>
</html>`
    }
  ],
  css: [
    {
      id: 'css-flexbox',
      name: 'Flexbox Layout',
      category: 'Layouts',
      icon: <Palette className="w-4 h-4" />,
      code: `/* Flexbox Layout */
.container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    padding: 20px;
}

.item {
    flex: 1;
    padding: 30px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border-radius: 8px;
    text-align: center;
}

/* Center content */
.centered {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

/* Responsive */
@media (max-width: 768px) {
    .container {
        flex-direction: column;
    }
}

/* HTML to use with this CSS:
<div class="container">
    <div class="item">Item 1</div>
    <div class="item">Item 2</div>
    <div class="item">Item 3</div>
</div>
*/`
    },
    {
      id: 'css-grid',
      name: 'CSS Grid Layout',
      category: 'Layouts',
      icon: <Palette className="w-4 h-4" />,
      code: `/* CSS Grid Layout */
.grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto;
    gap: 20px;
    padding: 20px;
}

.grid-item {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 40px;
    border-radius: 8px;
    text-align: center;
}

/* Spanning rows and columns */
.grid-item.featured {
    grid-column: span 2;
    grid-row: span 2;
}

/* Responsive grid */
@media (max-width: 768px) {
    .grid-container {
        grid-template-columns: 1fr;
    }
    .grid-item.featured {
        grid-column: span 1;
        grid-row: span 1;
    }
}

/* HTML to use with this CSS:
<div class="grid-container">
    <div class="grid-item featured">Featured</div>
    <div class="grid-item">Item 2</div>
    <div class="grid-item">Item 3</div>
    <div class="grid-item">Item 4</div>
    <div class="grid-item">Item 5</div>
</div>
*/`
    }
  ],
  json: [
    {
      id: 'json-basic',
      name: 'Basic JSON',
      category: 'Basics',
      icon: <FileJson className="w-4 h-4" />,
      code: `{
  "project": "Code Sandbox",
  "version": "1.0.0",
  "description": "Interactive code editor",
  "features": [
    "Syntax highlighting",
    "Auto-completion",
    "Live preview",
    "Multiple languages"
  ],
  "supportedLanguages": {
    "javascript": true,
    "python": true,
    "html": true,
    "css": true,
    "json": true
  },
  "settings": {
    "theme": "dark",
    "fontSize": 14,
    "lineNumbers": true,
    "minimap": true
  }
}`
    },
    {
      id: 'json-api',
      name: 'API Response',
      category: 'Intermediate',
      icon: <Database className="w-4 h-4" />,
      code: `{
  "data": {
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "admin",
        "active": true
      },
      {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "role": "user",
        "active": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "status": "success"
  }
}`
    }
  ]
};

const CATEGORIES = {
  'Basics': { icon: <BookOpen className="w-4 h-4" />, color: 'text-blue-400' },
  'Intermediate': { icon: <FileCode className="w-4 h-4" />, color: 'text-yellow-400' },
  'Advanced': { icon: <Zap className="w-4 h-4" />, color: 'text-purple-400' },
  'Layouts': { icon: <Palette className="w-4 h-4" />, color: 'text-green-400' }
};

const LANGUAGE_CONFIG = {
  javascript: { label: 'JavaScript', icon: <FileCode className="w-4 h-4" />, color: 'text-yellow-400' },
  python: { label: 'Python', icon: <Cpu className="w-4 h-4" />, color: 'text-green-400' },
  html: { label: 'HTML', icon: <Globe className="w-4 h-4" />, color: 'text-orange-400' },
  css: { label: 'CSS', icon: <Palette className="w-4 h-4" />, color: 'text-blue-400' },
  json: { label: 'JSON', icon: <FileJson className="w-4 h-4" />, color: 'text-yellow-400' }
};

const CodeTemplates = ({
  language = 'javascript',
  onTemplateSelect,
  className = ''
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set(['Basics']));

  const templates = TEMPLATES[selectedLanguage] || [];

  // Get unique categories
  const categories = ['All', ...new Set(templates.map(t => t.category))];

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleCategory = (category) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleTemplateClick = (template) => {
    onTemplateSelect?.({
      code: template.code,
      language: selectedLanguage,
      name: template.name
    });
  };

  return (
    <div className={`code-templates ${className}`}>
      {/* Language Selector */}
      <div className="flex flex-wrap gap-2 p-3 border-b border-gray-700">
        {Object.entries(LANGUAGE_CONFIG).map(([key, config]) => (
          <button
            key={key}
            onClick={() => {
              setSelectedLanguage(key);
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
              selectedLanguage === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {config.icon}
            {config.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 p-3 border-b border-gray-700 overflow-x-auto">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded text-sm whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Templates List */}
      <div className="overflow-y-auto max-h-[400px] p-3">
        {filteredTemplates.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <FileCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No templates found</p>
          </div>
        ) : selectedCategory === 'All' ? (
          // Group by category
          Object.entries(
            filteredTemplates.reduce((acc, t) => {
              if (!acc[t.category]) acc[t.category] = [];
              acc[t.category].push(t);
              return acc;
            }, {})
          ).map(([category, categoryTemplates]) => {
            const catConfig = CATEGORIES[category];
            const isExpanded = expandedCategories.has(category);

            return (
              <div key={category} className="mb-4">
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-gray-800 rounded"
                >
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                  />
                  <span className={catConfig?.color}>{catConfig?.icon}</span>
                  <span className="text-sm font-medium text-gray-300">{category}</span>
                  <span className="ml-auto text-xs text-gray-500">{categoryTemplates.length}</span>
                </button>

                {isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {categoryTemplates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateClick(template)}
                        className="flex items-center gap-2 w-full text-left px-2 py-2 hover:bg-gray-800 rounded group"
                      >
                        <span className="text-gray-400 group-hover:text-blue-400">
                          {template.icon}
                        </span>
                        <span className="text-sm text-gray-300 group-hover:text-white">
                          {template.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // Flat list
          <div className="space-y-1">
            {filteredTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => handleTemplateClick(template)}
                className="flex items-center gap-2 w-full text-left px-2 py-2 hover:bg-gray-800 rounded group"
              >
                <span className="text-gray-400 group-hover:text-blue-400">
                  {template.icon}
                </span>
                <span className="text-sm text-gray-300 group-hover:text-white">
                  {template.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeTemplates;
export { TEMPLATES, CATEGORIES, LANGUAGE_CONFIG };
