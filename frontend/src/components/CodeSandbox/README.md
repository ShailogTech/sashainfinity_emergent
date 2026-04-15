# CodeSandbox Component System

A complete in-platform code sandbox system with Monaco Editor integration, live code execution, and video synchronization.

## Components

### 1. CodeSandbox (Main)
**File:** `CodeSandbox.jsx` / `CodeSandbox.js`

The main container component that integrates all sandbox features.

**Features:**
- Split-panel layout with resizable panels
- Code editor with live preview
- Video timeline synchronization
- Save/load code snippets
- Code sharing via URL
- Execution history tracking
- Fullscreen mode

**Props:**
```jsx
<CodeSandbox
  initialCode={code}
  initialLanguage="javascript"
  videoUrl=""
  codeSnippets={[]}
  onSave={(snippet) => {}}
  onShare={() => {}}
  onLoad={(snippet) => {}}
  autoRun={false}
  showVideoSync={true}
  showSaveLoad={true}
  readOnly={false}
  height="600px"
/>
```

### 2. CodeEditor
**File:** `CodeEditor.jsx` / `CodeEditor.js`

Monaco Editor integration with VS Code-like features.

**Features:**
- Syntax highlighting (JavaScript, Python, HTML, JSON)
- Auto-completion with snippets
- Error detection
- Minimap
- Line numbers
- Multiple themes (vs-dark, vs-light, hc-black)
- Fullscreen mode
- Download/upload code files

**Props:**
```jsx
<CodeEditor
  code={code}
  language="javascript"
  onChange={(code, language) => {}}
  onRun={() => {}}
  readOnly={false}
  height="100%"
  options={{}}
/>
```

### 3. CodeExecutor
**File:** `CodeExecutor.jsx`

Real-time code execution with console output.

**Features:**
- JavaScript execution (client-side with backend fallback)
- Python execution (backend via subprocess)
- Console output capture
- Error handling and display
- Execution time tracking
- Copy/download output
- Clear console

**Props:**
```jsx
<CodeExecutor
  code={code}
  language="javascript"
  onExecute={(result) => {}}
  autoRun={false}
  height="300px"
  apiEndpoint="/api/sandbox/execute"
/>
```

### 4. VideoSyncCode
**File:** `VideoSyncCode.jsx`

Video timeline synchronization with code snippets.

**Features:**
- Timeline with snippet markers
- Auto-load code at timestamps
- Skip between snippets
- Playback speed control
- Volume control
- Fullscreen video mode
- Visual timeline panel

**Props:**
```jsx
<VideoSyncCode
  videoUrl=""
  videoId=""
  codeSnippets={[]}
  onSnippetLoad={(snippet) => {}}
  onTimeUpdate={(time) => {}}
  onPlay={() => {}}
  onPause={() => {}}
  onSeek={(time) => {}}
  autoLoadSnippet={true}
  height="200px"
/>
```

### 5. LivePreview
**File:** `LivePreview.jsx` / `LivePreview.js`

Live output preview with HTML rendering and console.

**Features:**
- Console output display
- HTML preview in iframe
- Tab switching (preview/console)
- Output capture (log, error, warn)
- Copy/download output
- Fullscreen mode

## Backend API

### Execute Code
**Endpoint:** `POST /api/sandbox/execute`

**Request:**
```json
{
  "code": "console.log('Hello');",
  "language": "javascript",
  "timeout": 5
}
```

**Response:**
```json
{
  "success": true,
  "output": ["Hello"],
  "error": null,
  "execution_time": 1.23
}
```

### Code Snippets CRUD
**Endpoints:**
- `POST /api/sandbox/snippets` - Create snippet
- `GET /api/sandbox/snippets?video_id=&language=` - List snippets
- `GET /api/sandbox/snippets/{id}` - Get snippet
- `PUT /api/sandbox/snippets/{id}` - Update snippet
- `DELETE /api/sandbox/snippets/{id}` - Delete snippet

## Styling

All components use glassmorphic design with:
- Backdrop blur effects
- Semi-transparent backgrounds
- Neon accent colors (blue, green, red, purple)
- Smooth transitions
- Dark theme optimized

**CSS File:** `CodeSandbox.css`

## Usage Example

```jsx
import { CodeSandbox } from '@/components/CodeSandbox';

function MyPage() {
  const snippets = [
    {
      id: '1',
      title: 'Hello World',
      timestamp: 0,
      code: 'console.log("Hello, World!");',
      language: 'javascript'
    }
  ];

  return (
    <CodeSandbox
      initialCode="// Write your code here"
      initialLanguage="javascript"
      codeSnippets={snippets}
      height="700px"
    />
  );
}
```

## Dependencies

- `@monaco-editor/react` - Monaco Editor integration
- `monaco-editor` - VS Code editor core
- `react-resizable-panels` - Resizable split panels
- `lucide-react` - Icons

## Features

1. **Code Execution**
   - JavaScript runs in browser (fallback)
   - JavaScript/Python runs on backend (Node.js/Python subprocess)
   - Captures console output
   - Shows execution time
   - Error handling

2. **Video Synchronization**
   - Timeline markers for code snippets
   - Auto-load code when video reaches timestamp
   - Skip between snippets
   - Progress tracking

3. **Code Management**
   - Save snippets to localStorage
   - Load saved snippets
   - Share via URL encoding
   - Download code files
   - Upload code files

4. **Editor Features**
   - VS Code-like editor
   - Multiple languages
   - Auto-completion
   - Error detection
   - Multiple themes
   - Minimap
   - Line numbers
