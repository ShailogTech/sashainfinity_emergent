import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const VideoUpload = ({ onUploadComplete, onError, courseId = null }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [autoTranscribe, setAutoTranscribe] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const fileInputRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', flag: '🇮🇳' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
  ];

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file) => {
    // Validate video file
    if (!file.type.startsWith('video/')) {
      onError?.('Please upload a valid video file');
      return;
    }

    // Check file size (max 2GB)
    const maxSize = 2 * 1024 * 1024 * 1024;
    if (file.size > maxSize) {
      onError?.('Video file is too large. Maximum size is 2GB');
      return;
    }

    setUploadedFile(file);

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadVideo = async () => {
    if (!uploadedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', uploadedFile);
      formData.append('course_id', courseId || '');
      formData.append('auto_transcribe', autoTranscribe);
      formData.append('language', selectedLanguage);

      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Simulate upload progress (in production, use actual progress from xhr)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/videos/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }

      const data = await response.json();
      setUploadProgress(100);

      // Notify parent component
      onUploadComplete?.(data);

      // Reset after delay
      setTimeout(() => {
        removeFile();
        setUploading(false);
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      onError?.(error.message || 'Failed to upload video');
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const minutes = Math.floor(video.duration / 60);
        const seconds = Math.floor(video.duration % 60);
        resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      {!uploadedFile ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300",
            isDragging
              ? "border-orange-500 bg-orange-50/50 scale-[1.02]"
              : "border-gray-300 hover:border-orange-400 hover:bg-orange-50/20"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
            id="video-upload"
          />

          <label htmlFor="video-upload" className="cursor-pointer block">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg"
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </motion.div>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Drop your video here
            </h3>
            <p className="text-gray-500 mb-4">
              or click to browse from your computer
            </p>

            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                MP4, WebM, MOV
              </span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>Max 2GB</span>
            </div>
          </label>
        </motion.div>
      ) : (
        /* File Preview */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border border-gray-200 rounded-2xl overflow-hidden bg-white"
        >
          {/* Video Preview */}
          {previewUrl && (
            <div className="relative bg-black aspect-video">
              <video
                src={previewUrl}
                className="w-full h-full object-contain"
                controls
              />
            </div>
          )}

          {/* File Info */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 truncate">{uploadedFile.name}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {formatFileSize(uploadedFile.size)}
                </p>
              </div>
              {!uploading && (
                <button
                  onClick={removeFile}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Options */}
            {!uploading && (
              <div className="space-y-4 mb-4">
                {/* Auto-Transcribe Toggle */}
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Auto-Transcribe</p>
                      <p className="text-sm text-gray-500">Generate subtitles using AI</p>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={autoTranscribe}
                      onChange={(e) => setAutoTranscribe(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-11 h-6 rounded-full transition-colors",
                      autoTranscribe ? "bg-orange-500" : "bg-gray-300"
                    )}>
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
                        autoTranscribe ? "left-6" : "left-1"
                      )} />
                    </div>
                  </div>
                </label>

                {/* Language Selection */}
                {autoTranscribe && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Video Language
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => setSelectedLanguage(lang.code)}
                          className={cn(
                            "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                            selectedLanguage === lang.code
                              ? "bg-orange-500 text-white shadow-md"
                              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                          )}
                        >
                          <span className="mr-1">{lang.flag}</span>
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Uploading...</span>
                  <span className="font-medium text-orange-600">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                  />
                </div>
                {uploadProgress >= 100 && (
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Upload complete! Processing video...
                  </p>
                )}
              </div>
            )}

            {/* Upload Button */}
            {!uploading && (
              <button
                onClick={uploadVideo}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Upload Video
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VideoUpload;
