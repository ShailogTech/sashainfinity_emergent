import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Icons as simple SVG components
const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const FireIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0 6 8 10 8 10z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

/**
 * Video Engagement Heatmap Page
 * Fetches all data from API endpoints
 */
const HeatmapPage = () => {
  const { videoId } = useParams();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedSegment, setSelectedSegment] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, [timeRange]);

  useEffect(() => {
    if (videoId && videos.length > 0) {
      const video = videos.find(v => v.id === videoId);
      if (video) setSelectedVideo(video);
    }
  }, [videoId, videos]);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };

      const response = await fetch(`${API_BASE}/api/analytics/videos?timeRange=${timeRange}`, { headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch videos: ${response.statusText}`);
      }

      const data = await response.json();
      const videoList = data.videos || data || [];

      setVideos(videoList);

      // Set initial video if none selected
      if (!selectedVideo && videoList.length > 0) {
        setSelectedVideo(videoList[0]);
      }
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError(err.message);
      setVideos([]);
      setSelectedVideo(null);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  const formatTimeDetailed = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading heatmap analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-800 font-medium mb-2">Error loading video analytics</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={fetchVideos}
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
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/teacher/analytics"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                <ArrowLeftIcon />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Video Engagement Heatmaps</h1>
                <p className="text-sm text-gray-500">Analyze viewer behavior and engagement patterns</p>
              </div>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Video List Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Videos</h3>
          <div className="space-y-2">
            {videos.length > 0 ? videos.map((video) => (
              <button
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className={cn(
                  "w-full p-3 rounded-lg text-left transition-all border",
                  selectedVideo?.id === video.id
                    ? "bg-blue-50 border-blue-200"
                    : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                )}
              >
                <div className="flex gap-3">
                  <div
                    className="w-20 h-12 rounded bg-gray-200 bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url(${video.thumbnail})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium text-sm truncate",
                      selectedVideo?.id === video.id ? "text-blue-900" : "text-gray-900"
                    )}>
                      {video.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <ClockIcon />
                        {formatTime(video.duration)}
                      </span>
                      <span className="flex items-center gap-1">
                        <EyeIcon />
                        {formatNumber(video.views)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    video.avgEngagement >= 75 ? "bg-emerald-100 text-emerald-700" :
                    video.avgEngagement >= 50 ? "bg-blue-100 text-blue-700" :
                    "bg-amber-100 text-amber-700"
                  )}>
                    {video.avgEngagement}% engagement
                  </span>
                  {selectedVideo?.id === video.id && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
              </button>
            )) : (
              <p className="text-sm text-gray-500 text-center py-4">No videos available</p>
            )}
          </div>

          {/* Quick Stats */}
          {videos.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Videos</span>
                  <span className="text-sm font-medium text-gray-900">{videos.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Views</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatNumber(videos.reduce((a, b) => a + b.views, 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Engagement</span>
                  <span className="text-sm font-medium text-emerald-600">
                    {Math.round(videos.reduce((a, b) => a + b.avgEngagement, 0) / videos.length)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Completion</span>
                  <span className="text-sm font-medium text-blue-600">
                    {Math.round(videos.reduce((a, b) => a + b.completionRate, 0) / videos.length)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {selectedVideo ? (
            <div className="space-y-6">
              {/* Video Info Header */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex gap-6">
                  <div
                    className="w-48 h-28 rounded-lg bg-gray-200 bg-cover bg-center flex-shrink-0 relative overflow-hidden"
                    style={{ backgroundImage: `url(${selectedVideo.thumbnail})` }}
                  >
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                        <PlayIcon />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">{selectedVideo.title}</h2>
                    <p className="text-sm text-gray-500 mb-4">{selectedVideo.instructor} · {selectedVideo.course}</p>

                    <div className="grid grid-cols-4 gap-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Duration</p>
                        <p className="text-sm font-medium text-gray-900">{formatTime(selectedVideo.duration)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Views</p>
                        <p className="text-sm font-medium text-gray-900">{formatNumber(selectedVideo.views)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Engagement</p>
                        <p className={cn(
                          "text-sm font-medium",
                          selectedVideo.avgEngagement >= 75 ? "text-emerald-600" :
                          selectedVideo.avgEngagement >= 50 ? "text-blue-600" :
                          "text-amber-600"
                        )}>
                          {selectedVideo.avgEngagement}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Completion</p>
                        <p className={cn(
                          "text-sm font-medium",
                          selectedVideo.completionRate >= 75 ? "text-emerald-600" :
                          selectedVideo.completionRate >= 50 ? "text-blue-600" :
                          "text-amber-600"
                        )}>
                          {selectedVideo.completionRate}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Heatmap Visualization */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Engagement Heatmap</h3>
                    <p className="text-sm text-gray-500">Click on segments to view detailed analytics</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-emerald-500" />
                      <span className="text-gray-600">High</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-blue-500" />
                      <span className="text-gray-600">Medium</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-amber-500" />
                      <span className="text-gray-600">Low</span>
                    </div>
                  </div>
                </div>

                <VideoHeatmap
                  videoId={selectedVideo.id}
                  videoDuration={selectedVideo.duration}
                  onSegmentClick={setSelectedSegment}
                />
              </div>

              {/* Engagement Metrics */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <EngagementMetrics
                  videoId={selectedVideo.id}
                  timeRange={timeRange}
                />
              </div>

              {/* Actionable Insights */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights & Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FireIcon />
                      <h4 className="font-medium text-emerald-900">What's Working</h4>
                    </div>
                    <p className="text-sm text-emerald-800">
                      High engagement detected in early segments. Keep the momentum going!
                    </p>
                  </div>
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangleIcon />
                      <h4 className="font-medium text-amber-900">Areas to Improve</h4>
                    </div>
                    <p className="text-sm text-amber-800">
                      Some sections show lower engagement. Consider adding interactive elements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Select a video to view analytics</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Video Heatmap Component - fetches data from API
const VideoHeatmap = ({ videoId, videoDuration, onSegmentClick }) => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [viewMode, setViewMode] = useState("engagement");

  const segmentSize = 30;

  useEffect(() => {
    fetchHeatmapData();
  }, [videoId, videoDuration]);

  const fetchHeatmapData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`${API_BASE}/api/videos/${videoId}/heatmap`, { headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch heatmap: ${response.statusText}`);
      }

      const data = await response.json();
      setHeatmapData(data.segments || data || []);
    } catch (error) {
      console.error("Error fetching heatmap:", error);
      setHeatmapData([]);
    } finally {
      setLoading(false);
    }
  };

  const getSegmentColor = (segment) => {
    if (viewMode === "engagement") {
      const intensity = segment.engagement / 100;
      if (intensity > 0.7) return "bg-emerald-500";
      if (intensity > 0.4) return "bg-blue-500";
      return "bg-amber-500";
    }
    if (viewMode === "dropoff") {
      const intensity = segment.dropoff / 100;
      if (intensity > 0.1) return "bg-red-500";
      if (intensity > 0.05) return "bg-amber-500";
      return "bg-emerald-500";
    }
    const intensity = segment.rewatch / 100;
    if (intensity > 0.1) return "bg-purple-500";
    if (intensity > 0.05) return "bg-blue-400";
    return "bg-gray-300";
  };

  const formatTimeDetailed = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSegmentClick = (segment) => {
    if (onSegmentClick) {
      onSegmentClick(segment);
    }
  };

  const viewModes = [
    { id: "engagement", label: "Engagement" },
    { id: "dropoff", label: "Drop-off" },
    { id: "rewatch", label: "Rewatch" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (heatmapData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No heatmap data available</div>
    );
  }

  const totalSegments = heatmapData.length;

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {viewModes.map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                viewMode === mode.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Timeline */}
      <div className="relative">
        <div className="relative bg-gray-100 rounded-lg overflow-hidden p-1 h-16">
          <div className="flex h-full gap-px">
            {heatmapData.map((segment) => {
              const width = Math.max(100 / totalSegments, 0.5);
              const isHovered = hoveredSegment?.id === segment.id;

              return (
                <button
                  key={segment.id}
                  className={cn(
                    "h-full transition-all duration-100 rounded-sm",
                    getSegmentColor(segment),
                    isHovered && "brightness-110"
                  )}
                  style={{ width: `${width}%` }}
                  onClick={() => handleSegmentClick(segment)}
                  onMouseEnter={() => setHoveredSegment(segment)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  title={`${formatTimeDetailed(segment.startTime)} - ${segment.engagement}% engagement`}
                />
              );
            })}
          </div>

          {/* Time markers */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-3 text-xs text-gray-400 pointer-events-none">
            <span>0:00</span>
            <span>{formatTimeDetailed(videoDuration / 4)}</span>
            <span>{formatTimeDetailed(videoDuration / 2)}</span>
            <span>{formatTimeDetailed(videoDuration * 3 / 4)}</span>
            <span>{formatTimeDetailed(videoDuration)}</span>
          </div>

          {/* Hover Tooltip */}
          {hoveredSegment && (
            <div
              className="absolute -top-12 bg-gray-900 text-white text-xs rounded px-2 py-1.5 shadow-lg pointer-events-none transform -translate-x-1/2"
              style={{ left: `${(hoveredSegment.startTime / videoDuration) * 100}%` }}
            >
              <p className="font-medium">{formatTimeDetailed(hoveredSegment.startTime)}</p>
              <div className="flex gap-3 mt-1">
                <span>Eng: {hoveredSegment.engagement}%</span>
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-900 rotate-45" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Engagement Metrics Component - fetches from API
const EngagementMetrics = ({ videoId, timeRange }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [videoId, timeRange]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`${API_BASE}/api/videos/${videoId}/metrics?timeRange=${timeRange}`, { headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`);
      }

      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      setMetrics({
        overview: {
          averageWatchTime: 0,
          completionRate: 0,
          totalViews: 0,
          retentionRate: 0
        },
        dropoffPoints: []
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!metrics) {
    return <div className="text-center py-8 text-gray-500">No metrics available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Avg Watch Time</p>
          <p className="text-xl font-semibold text-gray-900">{formatTime(metrics.overview.averageWatchTime)}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Completion Rate</p>
          <p className="text-xl font-semibold text-gray-900">{metrics.overview.completionRate}%</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Total Views</p>
          <p className="text-xl font-semibold text-gray-900">{formatNumber(metrics.overview.totalViews)}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Retention Rate</p>
          <p className="text-xl font-semibold text-gray-900">{metrics.overview.retentionRate}%</p>
        </div>
      </div>

      {/* Drop-off Points */}
      {metrics.dropoffPoints && metrics.dropoffPoints.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Drop-off Points</h4>
          <div className="space-y-2">
            {metrics.dropoffPoints.map((point, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-sm font-mono text-gray-700 w-16">{formatTime(point.timestamp)}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{point.reason}</span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      point.severity === "high" ? "bg-red-100 text-red-700" :
                      point.severity === "medium" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-700"
                    )}>
                      {point.severity}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${point.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-red-600 w-12 text-right">{point.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeatmapPage;
