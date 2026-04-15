import React, { useState } from 'react';
import {
  File,
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  Edit2,
  FileCode,
  FileJson,
  FileType,
  X
} from 'lucide-react';

const FILE_ICONS = {
  js: { icon: <FileCode className="w-4 h-4" />, color: 'text-yellow-400' },
  jsx: { icon: <FileCode className="w-4 h-4" />, color: 'text-yellow-400' },
  ts: { icon: <FileCode className="w-4 h-4" />, color: 'text-blue-400' },
  tsx: { icon: <FileCode className="w-4 h-4" />, color: 'text-blue-400' },
  py: { icon: <FileCode className="w-4 h-4" />, color: 'text-green-400' },
  html: { icon: <FileType className="w-4 h-4" />, color: 'text-orange-400' },
  css: { icon: <FileType className="w-4 h-4" />, color: 'text-blue-400' },
  json: { icon: <FileJson className="w-4 h-4" />, color: 'text-yellow-400' },
  md: { icon: <File className="w-4 h-4" />, color: 'text-gray-400' },
  txt: { icon: <File className="w-4 h-4" />, color: 'text-gray-400' }
};

const FileExplorer = ({
  files = [],
  activeFile = null,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename,
  className = ''
}) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['/src']));
  const [editingFile, setEditingFile] = useState(null);
  const [newFileName, setNewFileName] = useState('');
  const [showNewFile, setShowNewFile] = useState(false);

  // Default files if none provided
  const defaultFiles = [
    { id: 1, name: 'index.html', path: '/index.html', type: 'file', language: 'html' },
    { id: 2, name: 'styles.css', path: '/styles.css', type: 'file', language: 'css' },
    { id: 3, name: 'app.js', path: '/app.js', type: 'file', language: 'javascript' },
    { id: 4, name: 'data.json', path: '/data.json', type: 'file', language: 'json' },
  ];

  const fileList = files.length > 0 ? files : defaultFiles;

  const toggleFolder = (path) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const getFileExtension = (fileName) => {
    return fileName.split('.').pop().toLowerCase();
  };

  const handleFileClick = (file) => {
    if (file.type === 'folder') {
      toggleFolder(file.path);
    } else {
      onFileSelect?.(file);
    }
  };

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      const newFile = {
        id: Date.now(),
        name: newFileName,
        path: `/${newFileName}`,
        type: 'file',
        language: getLanguageFromExtension(newFileName)
      };
      onFileCreate?.(newFile);
      setNewFileName('');
      setShowNewFile(false);
    }
  };

  const handleDeleteFile = (file, e) => {
    e.stopPropagation();
    onFileDelete?.(file);
  };

  const handleStartRename = (file, e) => {
    e.stopPropagation();
    setEditingFile(file.id);
    setNewFileName(file.name);
  };

  const handleFinishRename = (file) => {
    if (newFileName.trim() && newFileName !== file.name) {
      onFileRename?.(file, newFileName);
    }
    setEditingFile(null);
    setNewFileName('');
  };

  const getLanguageFromExtension = (fileName) => {
    const ext = getFileExtension(fileName);
    const langMap = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      html: 'html',
      css: 'css',
      json: 'json'
    };
    return langMap[ext] || 'javascript';
  };

  return (
    <div className={`file-explorer bg-gray-900 border-r border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Explorer</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowNewFile(!showNewFile)}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="New File"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* New File Input */}
      {showNewFile && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700">
          <FileCode className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFile();
              if (e.key === 'Escape') {
                setShowNewFile(false);
                setNewFileName('');
              }
            }}
            onBlur={handleCreateFile}
            placeholder="filename.js"
            className="flex-1 bg-gray-800 text-white text-sm px-2 py-1 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <button
            onClick={() => {
              setShowNewFile(false);
              setNewFileName('');
            }}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* File List */}
      <div className="py-1">
        {fileList.map((file) => {
          const ext = getFileExtension(file.name);
          const iconInfo = FILE_ICONS[ext] || { icon: <File className="w-4 h-4" />, color: 'text-gray-400' };
          const isEditing = editingFile === file.id;
          const isActive = activeFile?.id === file.id;

          return (
            <div
              key={file.id}
              onClick={() => handleFileClick(file)}
              className={`group flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-400'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleFinishRename(file);
                      if (e.key === 'Escape') setEditingFile(null);
                    }}
                    onBlur={() => handleFinishRename(file)}
                    className="flex-1 bg-gray-800 text-white text-sm px-2 py-0.5 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                </>
              ) : (
                <>
                  <span className={iconInfo.color}>{iconInfo.icon}</span>
                  <span className="flex-1 text-sm truncate">{file.name}</span>
                  <div className="hidden group-hover:flex items-center gap-1">
                    <button
                      onClick={(e) => handleStartRename(file, e)}
                      className="p-0.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteFile(file, e)}
                      className="p-0.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="px-3 py-2 border-t border-gray-700 text-xs text-gray-500">
        {fileList.length} file{fileList.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default FileExplorer;
