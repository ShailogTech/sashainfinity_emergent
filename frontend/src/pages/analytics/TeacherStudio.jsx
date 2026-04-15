import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VideoUpload, TranscriptionEditor, ChapterEditor, ResourceExtractor } from "@/components/ai-video";
import { cn } from "@/lib/utils";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * TeacherStudio Component
 * Enhanced teacher dashboard with AI-powered video processing
 * Includes video upload, transcription, chaptering, and resource extraction
 */
const TeacherStudio = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Dashboard Stats
  const [dashboardStats, setDashboardStats] = useState({
    totalViews: 0,
    uniqueStudents: 0,
    avgCompletionRate: 0,
    totalWatchTime: 0,
    revenue: 0,
    activeCourses: 0,
    quizPassRate: 0,
    avgQuizScore: 0
  });

  // Recent Uploads
  const [recentUploads, setRecentUploads] = useState([]);

  // Video Analysis Data
  const [videoTranscript, setVideoTranscript] = useState(null);
  const [videoChapters, setVideoChapters] = useState([]);
  const [videoResources, setVideoResources] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
    fetchRecentUploads();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };

      const response = await fetch(`${API_BASE}/api/analytics/dashboard?time_range=${timeRange}`, { headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      const data = await response.json();
      setDashboardStats({
        totalViews: data.total_views || 0,
        uniqueStudents: data.unique_students || 0,
        avgCompletionRate: data.avg_completion_rate || 0,
        totalWatchTime: data.total_watch_time || 0,
        revenue: data.revenue || 0,
        activeCourses: data.active_courses || 0,
        quizPassRate: data.quiz_pass_rate || 0,
        avgQuizScore: data.avg_quiz_score || 0
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError(error.message);
      // Set default values on error
      setDashboardStats({
        totalViews: 0,
        uniqueStudents: 0,
        avgCompletionRate: 0,
        totalWatchTime: 0,
        revenue: 0,
        activeCourses: 0,
        quizPassRate: 0,
        avgQuizScore: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentUploads = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`${API_BASE}/api/videos/uploads`, { headers });

      if (response.ok) {
        const data = await response.json();
        setRecentUploads(data.uploads || data || []);
      }
    } catch (error) {
      console.error("Error fetching uploads:", error);
      setRecentUploads([]);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(num);
  };

  const formatDistanceToNow = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const handleVideoSelect = async (video) => {
    setSelectedVideo(video);

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch transcript
      const transcriptRes = await fetch(`${API_BASE}/api/videos/${video.id}/transcript`, { headers });
      if (transcriptRes.ok) {
        const transcript = await transcriptRes.json();
        setVideoTranscript(transcript);
      } else {
        setVideoTranscript(null);
      }

      // Fetch chapters
      const chaptersRes = await fetch(`${API_BASE}/api/videos/${video.id}/chapters`, { headers });
      if (chaptersRes.ok) {
        const chapters = await chaptersRes.json();
        setVideoChapters(chapters);
      } else {
        setVideoChapters([]);
      }

      // Fetch resources
      const resourcesRes = await fetch(`${API_BASE}/api/videos/${video.id}/resources`, { headers });
      if (resourcesRes.ok) {
        const resources = await resourcesRes.json();
        setVideoResources(resources);
      } else {
        setVideoResources([]);
      }
    } catch (error) {
      console.error("Error fetching video data:", error);
    }
  };

  const handleTranscriptSave = async (updatedSegments) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/api/videos/${selectedVideo.id}/transcript`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ transcript: updatedSegments })
      });
      setVideoTranscript({ ...videoTranscript, transcript: updatedSegments });
    } catch (error) {
      console.error("Error saving transcript:", error);
      alert("Failed to save transcript");
    }
  };

  const handleChapterChange = async (updatedChapters) => {
    setVideoChapters(updatedChapters);
  };

  const handleAddChapter = async (chapter) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/videos/${selectedVideo.id}/chapters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(chapter)
      });
      if (response.ok) {
        const newChapter = await response.json();
        setVideoChapters([...videoChapters, newChapter]);
      }
    } catch (error) {
      console.error("Error adding chapter:", error);
      alert("Failed to add chapter");
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/api/videos/${selectedVideo.id}/chapters/${chapterId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setVideoChapters(videoChapters.filter(c => c.id !== chapterId));
    } catch (error) {
      console.error("Error deleting chapter:", error);
      alert("Failed to delete chapter");
    }
  };

  const handleAddResource = async (resource) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/videos/${selectedVideo.id}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(resource)
      });
      if (response.ok) {
        const newResource = await response.json();
        setVideoResources([...videoResources, newResource]);
      }
    } catch (error) {
      console.error("Error adding resource:", error);
      alert("Failed to add resource");
    }
  };

  const handleDeleteResource = async (resourceId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/api/videos/${selectedVideo.id}/resources/${resourceId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setVideoResources(videoResources.filter(r => r.id !== resourceId));
    } catch (error) {
      console.error("Error deleting resource:", error);
      alert("Failed to delete resource");
    }
  };

  const handleUploadComplete = (data) => {
    setRecentUploads([{
      id: data.video_id,
      title: data.title || "Untitled Video",
      thumbnail: "🎬",
      duration: data.duration || 0,
      uploadDate: new Date().toISOString(),
      status: "processing",
      transcriptionStatus: "pending",
      chaptersCount: 0,
      resourcesCount: 0
    }, ...recentUploads]);
  };

  const triggerTranscription = async (videoId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/api/videos/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          video_id: videoId,
          audio_url: `/videos/${videoId}/audio`,
          language: 'en'
        })
      });

      // Update local state
      setRecentUploads(recentUploads.map(u =>
        u.id === videoId ? { ...u, transcriptionStatus: "processing" } : u
      ));
    } catch (error) {
      console.error("Error starting transcription:", error);
      alert("Failed to start transcription");
    }
  };

  const triggerChapterGeneration = async (videoId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/api/videos/chapter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ video_id: videoId })
      });
    } catch (error) {
      console.error("Error generating chapters:", error);
      alert("Failed to generate chapters");
    }
  };

  const triggerResourceExtraction = async (videoId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/api/videos/extract-resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ video_id: videoId })
      });
    } catch (error) {
      console.error("Error extracting resources:", error);
      alert("Failed to extract resources");
    }
  };

  const getStatusBadge = (status, transcriptionStatus) => {
    if (transcriptionStatus === "processing") {
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing
        </span>
      );
    }
    if (transcriptionStatus === "completed") {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          Ready
        </span>
      );
    }
    if (transcriptionStatus === "failed") {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
          Failed
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
        Pending
      </span>
    );
  };

  const glassCard = "glassmorphism-lg rounded-3xl p-6 backdrop-blur-xl border border-white/20 shadow-xl";
  const statCard = "glassmorphism-md rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-800 font-medium mb-2">Error loading analytics</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => {
                fetchAnalyticsData();
                fetchRecentUploads();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-blue-50/20 p-6">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
              Teacher Studio
            </h1>
            <p className="text-gray-600 mt-1">AI-Powered Video Content Management</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="365d">Last Year</option>
            </select>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 bg-white/40 backdrop-blur-sm rounded-2xl p-2 shadow-lg overflow-x-auto">
          {["overview", "uploads", "transcription", "chapters", "resources"].map(tab => (
            <button
              key={tab}
              onClick={() => {
                setSelectedTab(tab);
                if (tab !== "transcription" && tab !== "chapters" && tab !== "resources") {
                  setSelectedVideo(null);
                }
              }}
              className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                selectedTab === tab
                  ? "bg-white shadow-md text-orange-600"
                  : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
              }`}
            >
              {tab === "overview" ? "Overview" :
               tab === "uploads" ? "Uploads" :
               tab === "transcription" ? "Transcription" :
               tab === "chapters" ? "Chapters" : "Resources"}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {selectedTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              <div className={statCard}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500 font-medium">Total Views</span>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">{formatNumber(dashboardStats.totalViews)}</p>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                  Views
                </p>
              </div>

              <div className={statCard}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500 font-medium">Students</span>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">{formatNumber(dashboardStats.uniqueStudents)}</p>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                  Students
                </p>
              </div>

              <div className={statCard}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500 font-medium">Completion Rate</span>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">{dashboardStats.avgCompletionRate}%</p>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                  Rate
                </p>
              </div>

              <div className={statCard}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500 font-medium">Revenue</span>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">{formatCurrency(dashboardStats.revenue)}</p>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                  Revenue
                </p>
              </div>
            </motion.div>

            {/* Recent Uploads Quick View */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={glassCard}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Recent Uploads</h3>
                <button
                  onClick={() => setSelectedTab("uploads")}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                >
                  View All
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentUploads.length > 0 ? recentUploads.slice(0, 4).map((upload) => (
                  <motion.div
                    key={upload.id}
                    whileHover={{ scale: 1.02 }}
                    className="relative bg-white/50 rounded-xl p-4 hover:bg-white/80 transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedVideo(upload);
                      if (upload.transcriptionStatus === "completed") {
                        setSelectedTab("transcription");
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-2xl">
                        {upload.thumbnail}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 truncate">{upload.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(upload.uploadDate)}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      {getStatusBadge(upload.status, upload.transcriptionStatus)}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{upload.chaptersCount} chapters</span>
                        <span>•</span>
                        <span>{upload.resourcesCount} resources</span>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <p className="text-sm text-gray-500 col-span-full text-center py-8">No uploads yet. Upload your first video to get started!</p>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Uploads Tab */}
        {selectedTab === "uploads" && (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={glassCard}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">Upload New Video</h3>
              <VideoUpload
                onUploadComplete={handleUploadComplete}
                onError={(error) => console.error("Upload error:", error)}
              />
            </motion.div>

            {/* Recent Uploads List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={glassCard}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">Video Library</h3>

              <div className="space-y-3">
                <AnimatePresence>
                  {recentUploads.map((upload) => (
                    <motion.div
                      key={upload.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className={cn(
                        "p-4 rounded-xl border transition-all cursor-pointer",
                        selectedVideo?.id === upload.id
                          ? "border-orange-500 bg-orange-50/50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-white/50"
                      )}
                      onClick={() => handleVideoSelect(upload)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-2xl">
                          {upload.thumbnail}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 truncate">{upload.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatTime(upload.duration)} • {formatDistanceToNow(upload.uploadDate)}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          {getStatusBadge(upload.status, upload.transcriptionStatus)}

                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <p className="text-lg font-semibold text-gray-800">{upload.chaptersCount}</p>
                              <p className="text-xs text-gray-500">Chapters</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-semibold text-gray-800">{upload.resourcesCount}</p>
                              <p className="text-xs text-gray-500">Resources</p>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-1">
                            {upload.transcriptionStatus === "pending" && (
                              <button
                                onClick={(e) => { e.stopPropagation(); triggerTranscription(upload.id); }}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Start Transcription"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0v4m0-4a3 3 0 016 0v6a3 3 0 01-3 3z" />
                                </svg>
                              </button>
                            )}
                            {upload.transcriptionStatus === "completed" && upload.chaptersCount === 0 && (
                              <button
                                onClick={(e) => { e.stopPropagation(); triggerChapterGeneration(upload.id); }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Generate Chapters"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedVideo(upload); setSelectedTab("transcription"); }}
                              className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {recentUploads.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No videos uploaded yet</p>
              )}
            </motion.div>
          </div>
        )}

        {/* Transcription Tab */}
        {selectedTab === "transcription" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {selectedVideo ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedTab("uploads")}
                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Uploads
                  </button>
                  <h3 className="text-lg font-semibold text-gray-800">{selectedVideo.title}</h3>
                </div>
                <TranscriptionEditor
                  videoId={selectedVideo.id}
                  transcript={videoTranscript}
                  onSave={handleTranscriptSave}
                />
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Select a video from the uploads tab to edit its transcription</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Chapters Tab */}
        {selectedTab === "chapters" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {selectedVideo ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedTab("uploads")}
                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Uploads
                  </button>
                  <h3 className="text-lg font-semibold text-gray-800">{selectedVideo.title}</h3>
                </div>
                <ChapterEditor
                  videoId={selectedVideo.id}
                  chapters={videoChapters}
                  videoDuration={selectedVideo.duration}
                  onChapterChange={handleChapterChange}
                  onAddChapter={handleAddChapter}
                  onDeleteChapter={handleDeleteChapter}
                />
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Select a video from the uploads tab to manage its chapters</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Resources Tab */}
        {selectedTab === "resources" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {selectedVideo ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedTab("uploads")}
                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Uploads
                  </button>
                  <h3 className="text-lg font-semibold text-gray-800">{selectedVideo.title}</h3>
                </div>
                <ResourceExtractor
                  videoId={selectedVideo.id}
                  resources={videoResources}
                  onAddResource={handleAddResource}
                  onDeleteResource={handleDeleteResource}
                />
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Select a video from the uploads tab to manage its resources</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TeacherStudio;
