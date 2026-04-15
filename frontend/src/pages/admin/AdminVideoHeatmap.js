import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const AdminVideoHeatmap = () => {
  const { courseId, videoId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [videoStats, setVideoStats] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [viewMode, setViewMode] = useState("engagement"); // engagement, dropoff, rewatch

  useEffect(() => {
    fetchHeatmapData();
  }, [courseId, videoId]);

  const fetchHeatmapData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      if (videoId) {
        const response = await axios.get(
          `${API_BASE}/api/videos/${videoId}/analytics`,
          { headers }
        );
        setHeatmapData(response.data.heatmap);
        setVideoStats(response.data.statistics);
      } else {
        throw new Error("Video ID is required");
      }
    } catch (error) {
      console.error("Error fetching heatmap data:", error);
      setError(error.message || "Failed to load heatmap data");
      setHeatmapData(null);
      setVideoStats(null);
    } finally {
      setLoading(false);
    }
  };

  const getSegmentColor = (segment) => {
    if (viewMode === "engagement") {
      const intensity = segment.engagement;
      if (intensity >= 0.8) return "bg-green-500";
      if (intensity >= 0.6) return "bg-green-400";
      if (intensity >= 0.4) return "bg-yellow-400";
      if (intensity >= 0.2) return "bg-orange-400";
      return "bg-red-400";
    } else if (viewMode === "dropoff") {
      const intensity = segment.dropoffs / 10;
      if (intensity >= 0.8) return "bg-red-500";
      if (intensity >= 0.6) return "bg-orange-500";
      if (intensity >= 0.4) return "bg-yellow-500";
      if (intensity >= 0.2) return "bg-yellow-400";
      return "bg-green-400";
    } else if (viewMode === "rewatch") {
      if (segment.rewatchCount >= 4) return "bg-purple-600";
      if (segment.rewatchCount >= 3) return "bg-purple-500";
      if (segment.rewatchCount >= 2) return "bg-purple-400";
      if (segment.rewatchCount >= 1) return "bg-purple-300";
      return "bg-gray-200";
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSegmentClick = (segment) => {
    setSelectedSegment(segment);
  };

  const getChapterAtPosition = (position) => {
    if (!heatmapData?.chapters) return null;
    return heatmapData.chapters.find(
      (ch) => position >= ch.start && position < ch.end
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading heatmap data...</p>
        </div>
      </div>
    );
  }

  if (error || !heatmapData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-800 font-medium mb-2">Error Loading Heatmap</p>
            <p className="text-red-600 text-sm mb-4">{error || "No heatmap data available"}</p>
            <button
              onClick={fetchHeatmapData}
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              to={`/admin${courseId ? `/analytics/course/${courseId}` : "/analytics"}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h2 className="text-2xl font-bold text-gray-800">Video Engagement Heatmap</h2>
          </div>
          <p className="text-gray-600 mt-1">{heatmapData?.videoTitle || "Course Video Analytics"}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("engagement")}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              viewMode === "engagement"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                : "bg-white/70 text-gray-600 hover:bg-white"
            }`}
          >
            Engagement
          </button>
          <button
            onClick={() => setViewMode("dropoff")}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              viewMode === "dropoff"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                : "bg-white/70 text-gray-600 hover:bg-white"
            }`}
          >
            Drop-off
          </button>
          <button
            onClick={() => setViewMode("rewatch")}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              viewMode === "rewatch"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                : "bg-white/70 text-gray-600 hover:bg-white"
            }`}
          >
            Re-watch
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glassmorphism-md rounded-2xl p-5">
          <p className="text-sm text-gray-500 mb-1">Total Views</p>
          <p className="text-2xl font-bold text-gray-800">
            {videoStats?.totalViews?.toLocaleString() || "0"}
          </p>
        </div>
        <div className="glassmorphism-md rounded-2xl p-5">
          <p className="text-sm text-gray-500 mb-1">Unique Viewers</p>
          <p className="text-2xl font-bold text-gray-800">
            {videoStats?.uniqueViewers?.toLocaleString() || "0"}
          </p>
        </div>
        <div className="glassmorphism-md rounded-2xl p-5">
          <p className="text-sm text-gray-500 mb-1">Avg Watch Time</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatTime(videoStats?.avgWatchTime || 0)}
          </p>
        </div>
        <div className="glassmorphism-md rounded-2xl p-5">
          <p className="text-sm text-gray-500 mb-1">Completion Rate</p>
          <p className="text-2xl font-bold text-green-600">
            {videoStats?.completionRate || 0}%
          </p>
        </div>
        <div className="glassmorphism-md rounded-2xl p-5">
          <p className="text-sm text-gray-500 mb-1">Avg Engagement</p>
          <p className="text-2xl font-bold text-blue-600">
            {videoStats?.avgEngagement || 0}%
          </p>
        </div>
      </div>

      {/* Main Heatmap */}
      <div className="glassmorphism-lg rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Engagement Timeline</h3>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-gray-600">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-400"></div>
              <span className="text-gray-600">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-400"></div>
              <span className="text-gray-600">Low</span>
            </div>
            {viewMode === "rewatch" && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-purple-600"></div>
                  <span className="text-gray-600">Re-watched</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Chapter markers */}
          {heatmapData?.chapters && (
            <div className="flex mb-2 text-xs text-gray-500">
              {heatmapData.chapters.map((chapter, idx) => (
                <div
                  key={idx}
                  className="border-l border-gray-200 px-2"
                  style={{ width: `${((chapter.end - chapter.start) / heatmapData.duration) * 100}%` }}
                >
                  <span className="truncate block">{chapter.title}</span>
                </div>
              ))}
            </div>
          )}

          {/* Heatmap bars */}
          <div className="flex gap-px h-12 rounded-lg overflow-hidden">
            {heatmapData?.segments?.map((segment, idx) => (
              <div
                key={idx}
                className={`flex-1 cursor-pointer transition-all hover:opacity-80 ${getSegmentColor(segment)}`}
                onClick={() => handleSegmentClick(segment)}
                title={`${formatTime(segment.position)} - ${Math.round(segment.engagement * 100)}% engagement`}
              />
            ))}
          </div>

          {/* Time markers */}
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>0:00</span>
            <span>{formatTime(heatmapData?.duration / 4 || 0)}</span>
            <span>{formatTime(heatmapData?.duration / 2 || 0)}</span>
            <span>{formatTime(heatmapData?.duration * 3 / 4 || 0)}</span>
            <span>{formatTime(heatmapData?.duration || 0)}</span>
          </div>
        </div>
      </div>

      {/* Segment Details */}
      {selectedSegment && (
        <div className="glassmorphism-lg rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Segment Details</h3>
            <button
              onClick={() => setSelectedSegment(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Timestamp</p>
              <p className="text-lg font-bold text-gray-800">{formatTime(selectedSegment.position)}</p>
            </div>
            <div className="bg-white/50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Engagement</p>
              <p className="text-lg font-bold text-green-600">{Math.round(selectedSegment.engagement * 100)}%</p>
            </div>
            <div className="bg-white/50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Viewers</p>
              <p className="text-lg font-bold text-blue-600">{selectedSegment.viewers}</p>
            </div>
            <div className="bg-white/50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Re-watches</p>
              <p className="text-lg font-bold text-purple-600">{selectedSegment.rewatchCount}</p>
            </div>
          </div>
          {getChapterAtPosition(selectedSegment.position) && (
            <div className="mt-4 p-4 bg-orange-50 rounded-xl">
              <p className="text-sm text-gray-600">Chapter: <span className="font-semibold text-orange-700">{getChapterAtPosition(selectedSegment.position).title}</span></p>
            </div>
          )}
        </div>
      )}

      {/* Chapter Breakdown */}
      <div className="glassmorphism-lg rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Chapter Performance</h3>
        <div className="space-y-4">
          {heatmapData?.chapters?.map((chapter, idx) => {
            const chapterSegments = heatmapData.segments.filter(
              (s) => s.position >= chapter.start && s.position < chapter.end
            );
            const avgEngagement = chapterSegments.length > 0
              ? chapterSegments.reduce((sum, s) => sum + s.engagement, 0) / chapterSegments.length
              : 0;
            const totalRewatches = chapterSegments.reduce((sum, s) => sum + s.rewatchCount, 0);
            const dropoffRate = chapterSegments.length > 0
              ? chapterSegments[chapterSegments.length - 1]?.dropoffs / 10 || 0
              : 0;

            return (
              <div key={idx} className="p-4 bg-white/50 rounded-xl hover:bg-white/80 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{chapter.title}</p>
                      <p className="text-sm text-gray-500">
                        {formatTime(chapter.start)} - {formatTime(chapter.end)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Engagement</p>
                      <p className="font-bold text-green-600">{Math.round(avgEngagement * 100)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Re-watches</p>
                      <p className="font-bold text-purple-600">{totalRewatches}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Drop-off</p>
                      <p className="font-bold text-red-600">{Math.round(dropoffRate * 100)}%</p>
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                  {chapterSegments.map((seg, sIdx) => (
                    <div
                      key={sIdx}
                      className={`h-full ${getSegmentColor(seg)}`}
                      style={{ flex: 1 }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="glassmorphism-lg rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6">AI-Generated Insights</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-green-800">Strong Performance</p>
                <p className="text-sm text-green-700 mt-1">
                  High engagement detected in the first sections. Students find this content valuable.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-yellow-800">Needs Attention</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Some sections show lower engagement. Consider breaking complex topics into shorter segments.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-blue-800">Recommendation</p>
                <p className="text-sm text-blue-700 mt-1">
                  Add summary checkpoints at key transitions to reinforce learning objectives.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-purple-800">Pro Tip</p>
                <p className="text-sm text-purple-700 mt-1">
                  Students frequently re-watch certain sections. Consider creating quick-reference summaries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVideoHeatmap;
