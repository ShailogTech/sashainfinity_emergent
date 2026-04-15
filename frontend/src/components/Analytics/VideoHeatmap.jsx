import { useState, useEffect } from "react";

/**
 * Professional Video Heatmap Component
 * Data-driven engagement visualization
 */
const VideoHeatmap = ({
  videoId,
  videoTitle = "",
  videoDuration = 1800,
  onSegmentClick,
  showLabels = true,
  compact = false,
  height = "h-8"
}) => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [viewMode, setViewMode] = useState("engagement");
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [loading, setLoading] = useState(true);

  const segmentSize = 30;
  const totalSegments = Math.ceil(videoDuration / segmentSize);

  useEffect(() => {
    fetchHeatmapData();
  }, [videoId, videoDuration]);

  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));
      setHeatmapData(generateMockHeatmapData());
    } catch (err) {
      console.error("Error fetching heatmap:", err);
      setHeatmapData(generateMockHeatmapData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockHeatmapData = () => {
    const data = [];
    for (let i = 0; i < totalSegments; i++) {
      const startTime = i * segmentSize;
      const endTime = Math.min(startTime + segmentSize, videoDuration);
      const progress = i / totalSegments;

      let engagementLevel = 0.7 + Math.random() * 0.3;
      let dropoffRate = Math.random() * 0.1;
      let rewatchRate = Math.random() * 0.15;

      // Create realistic patterns
      if (progress < 0.2) {
        engagementLevel += 0.15;
        dropoffRate *= 0.5;
      }
      if (progress > 0.7) {
        engagementLevel -= 0.2;
        dropoffRate += 0.15;
      }
      if (progress > 0.3 && progress < 0.5) {
        engagementLevel -= 0.1;
        rewatchRate += 0.1;
      }

      engagementLevel = Math.max(0, Math.min(1, engagementLevel));

      data.push({
        id: i,
        startTime,
        endTime,
        engagement: Math.round(engagementLevel * 100),
        dropoff: Math.round(dropoffRate * 100),
        rewatch: Math.round(rewatchRate * 100),
        views: Math.round(1000 * engagementLevel * (1 - progress * 0.4))
      });
    }
    return data;
  };

  const getSegmentColor = (segment) => {
    if (viewMode === "engagement") {
      const intensity = segment.engagement / 100;
      if (intensity > 0.7) return "#22c55e";
      if (intensity > 0.4) return "#eab308";
      return "#ef4444";
    }
    if (viewMode === "dropoff") {
      const intensity = segment.dropoff / 100;
      if (intensity > 0.12) return "#ef4444";
      if (intensity > 0.06) return "#eab308";
      return "#22c55e";
    }
    const intensity = segment.rewatch / 100;
    if (intensity > 0.1) return "#6366f1";
    if (intensity > 0.05) return "#a5b4fc";
    return "#e5e7eb";
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSegmentClick = (segment) => {
    setSelectedSegment(segment);
    if (onSegmentClick) {
      onSegmentClick(segment);
    }
  };

  const getAverageStats = () => {
    if (heatmapData.length === 0) return { avgEngagement: 0, avgDropoff: 0, avgRewatch: 0 };
    return {
      avgEngagement: Math.round(heatmapData.reduce((a, b) => a + b.engagement, 0) / heatmapData.length),
      avgDropoff: Math.round(heatmapData.reduce((a, b) => a + b.dropoff, 0) / heatmapData.length),
      avgRewatch: Math.round(heatmapData.reduce((a, b) => a + b.rewatch, 0) / heatmapData.length)
    };
  };

  const getCriticalPoints = () => {
    return heatmapData
      .filter(segment => segment.dropoff > 12 || segment.engagement < 40)
      .sort((a, b) => b.dropoff - a.dropoff)
      .slice(0, 5);
  };

  const stats = getAverageStats();
  const criticalPoints = getCriticalPoints();

  if (loading) {
    return (
      <div className="border border-gray-200 rounded p-6">
        <div className="flex items-center justify-center h-16">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const segmentWidth = Math.max(100 / totalSegments, 0.5);

  return (
    <div className="space-y-4">
      {/* View Mode Toggle & Stats */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded">
          {[
            { id: "engagement", label: "Engagement" },
            { id: "dropoff", label: "Drop-off" },
            { id: "rewatch", label: "Rewatch" }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-3 py-1.5 text-sm rounded ${
                viewMode === mode.id
                  ? "bg-white text-gray-900 font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {!compact && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: viewMode === "engagement" ? "#22c55e" : viewMode === "dropoff" ? "#22c55e" : "#6366f1" }} />
              <span className="text-gray-600">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: viewMode === "engagement" ? "#eab308" : viewMode === "dropoff" ? "#eab308" : "#a5b4fc" }} />
              <span className="text-gray-600">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: viewMode === "engagement" ? "#ef4444" : viewMode === "dropoff" ? "#ef4444" : "#e5e7eb" }} />
              <span className="text-gray-600">Low</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {!compact && (
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded p-3">
            <p className="text-xs text-gray-500 mb-1">Avg Engagement</p>
            <p className="text-lg font-semibold text-green-600">{stats.avgEngagement}%</p>
          </div>
          <div className="border border-gray-200 rounded p-3">
            <p className="text-xs text-gray-500 mb-1">Avg Dropoff</p>
            <p className="text-lg font-semibold text-red-600">{stats.avgDropoff}%</p>
          </div>
          <div className="border border-gray-200 rounded p-3">
            <p className="text-xs text-gray-500 mb-1">Rewatch Rate</p>
            <p className="text-lg font-semibold text-indigo-600">{stats.avgRewatch}%</p>
          </div>
        </div>
      )}

      {/* Heatmap Timeline */}
      <div className="relative">
        <div
          className={`rounded overflow-hidden flex bg-gray-100 ${height}`}
        >
          {heatmapData.map((segment) => {
            const isHovered = hoveredSegment?.id === segment.id;
            const isSelected = selectedSegment?.id === segment.id;

            return (
              <button
                key={segment.id}
                className="h-full hover:opacity-80 transition-opacity"
                style={{
                  width: `${segmentWidth}%`,
                  backgroundColor: getSegmentColor(segment),
                  outline: isSelected ? "2px solid #3b82f6" : "none",
                  outlineOffset: isSelected ? "-2px" : "0"
                }}
                onClick={() => handleSegmentClick(segment)}
                onMouseEnter={() => setHoveredSegment(segment)}
                onMouseLeave={() => setHoveredSegment(null)}
                title={`${formatTime(segment.startTime)} - ${segment.engagement}% engagement`}
              />
            );
          })}
        </div>

        {/* Time markers */}
        {showLabels && (
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>0:00</span>
            <span>{formatTime(videoDuration / 4)}</span>
            <span>{formatTime(videoDuration / 2)}</span>
            <span>{formatTime(videoDuration * 3 / 4)}</span>
            <span>{formatTime(videoDuration)}</span>
          </div>
        )}

        {/* Hover Tooltip */}
        {hoveredSegment && !compact && (
          <div
            className="absolute -top-14 bg-gray-900 text-white text-xs rounded px-3 py-2 pointer-events-none transform -translate-x-1/2"
            style={{ left: `${(hoveredSegment.startTime / videoDuration) * 100}%` }}
          >
            <p className="font-semibold mb-1">{formatTime(hoveredSegment.startTime)}</p>
            <div className="flex gap-3 text-gray-300">
              <span>Eng: <span className={`font-medium ${
                hoveredSegment.engagement >= 70 ? "text-green-400" :
                hoveredSegment.engagement >= 40 ? "text-yellow-400" :
                "text-red-400"
              }`}>{hoveredSegment.engagement}%</span></span>
              <span>Drop: <span className="text-red-400">{hoveredSegment.dropoff}%</span></span>
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        )}
      </div>

      {/* Selected Segment Detail */}
      {selectedSegment && (
        <div className="border border-gray-200 rounded p-4 bg-gray-50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                {formatTime(selectedSegment.startTime)} - {formatTime(selectedSegment.endTime)}
              </h4>
              <p className="text-xs text-gray-500">
                Segment {selectedSegment.id + 1} of {totalSegments}
              </p>
            </div>
            <button
              onClick={() => setSelectedSegment(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="text-lg font-semibold text-green-600">{selectedSegment.engagement}%</p>
              <p className="text-xs text-gray-500">Engagement</p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="text-lg font-semibold text-red-600">{selectedSegment.dropoff}%</p>
              <p className="text-xs text-gray-500">Dropoff</p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="text-lg font-semibold text-indigo-600">{selectedSegment.rewatch}%</p>
              <p className="text-xs text-gray-500">Rewatch</p>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="text-lg font-semibold text-blue-600">{selectedSegment.views}</p>
              <p className="text-xs text-gray-500">Views</p>
            </div>
          </div>

          <div className={`p-3 rounded text-sm border ${
            selectedSegment.engagement < 40 ? "bg-red-50 border-red-200 text-red-800" :
            selectedSegment.dropoff > 12 ? "bg-yellow-50 border-yellow-200 text-yellow-800" :
            selectedSegment.rewatch > 10 ? "bg-indigo-50 border-indigo-200 text-indigo-800" :
            "bg-green-50 border-green-200 text-green-800"
          }`}>
            <p>
              <strong>Insight:</strong>{" "}
              {selectedSegment.engagement < 40
                ? "Low engagement detected. Consider breaking this into smaller chunks."
                : selectedSegment.dropoff > 12
                ? "High drop-off point. This might be a good place for a checkpoint."
                : selectedSegment.rewatch > 10
                ? "Students frequently rewatch this section. Consider adding supplementary materials."
                : "Good engagement! Students find this content helpful."}
            </p>
          </div>
        </div>
      )}

      {/* Critical Points */}
      {!compact && criticalPoints.length > 0 && (
        <div className="border border-red-200 rounded p-4 bg-red-50">
          <h4 className="text-sm font-medium text-red-900 mb-3">Critical Drop-off Points</h4>
          <div className="flex flex-wrap gap-2">
            {criticalPoints.map((point) => (
              <button
                key={point.id}
                onClick={() => setSelectedSegment(point)}
                className="flex items-center gap-2 px-3 py-2 bg-white rounded border border-red-200 text-sm hover:bg-red-100"
              >
                <span className="font-mono font-medium text-red-600">{formatTime(point.startTime)}</span>
                <span className="text-red-500">{point.dropoff}%</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoHeatmap;
