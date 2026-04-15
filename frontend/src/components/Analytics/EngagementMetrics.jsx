import { useState, useEffect } from "react";

/**
 * Professional Engagement Metrics Component
 * Clean, data-focused layout for video/course engagement analytics
 */
const EngagementMetrics = ({ videoId, courseId, timeRange = "30d" }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");

  useEffect(() => {
    fetchMetrics();
  }, [videoId, courseId, timeRange]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      setMetrics(generateMockMetrics());
    } catch (err) {
      console.error("Error fetching metrics:", err);
      setMetrics(generateMockMetrics());
    } finally {
      setLoading(false);
    }
  };

  const generateMockMetrics = () => ({
    overview: {
      averageWatchTime: 847,
      totalWatchTime: 125000,
      completionRate: 67.8,
      totalViews: 4523,
      uniqueViewers: 3840,
      repeatViewers: 683,
      retentionRate: 78.5
    },
    dropoffPoints: [
      { timestamp: 245, percentage: 23.4, reason: "Complex explanation", severity: "high", studentsAffected: 1059 },
      { timestamp: 487, percentage: 18.2, reason: "Lengthy code example", severity: "medium", studentsAffected: 824 },
      { timestamp: 723, percentage: 14.8, reason: "Topic transition", severity: "medium", studentsAffected: 669 },
      { timestamp: 1056, percentage: 12.1, reason: "Technical issue", severity: "low", studentsAffected: 547 }
    ],
    rewatchData: {
      totalRewatches: 1892,
      averageRewatchesPerViewer: 0.49,
      mostRewatchedSegments: [
        { startTime: 120, endTime: 180, rewatchCount: 342, percentage: 18.1 },
        { startTime: 450, endTime: 510, rewatchCount: 287, percentage: 15.2 },
        { startTime: 680, endTime: 740, rewatchCount: 234, percentage: 12.4 }
      ]
    },
    pauseData: {
      totalPauses: 5634,
      averagePausesPerViewer: 1.47,
      pauseFrequency: [
        { timeRange: "0-2m", count: 847, percentage: 15.0 },
        { timeRange: "2-5m", count: 1234, percentage: 21.9 },
        { timeRange: "5-10m", count: 1567, percentage: 27.8 },
        { timeRange: "10-15m", count: 1123, percentage: 19.9 },
        { timeRange: "15-20m", count: 687, percentage: 12.2 }
      ]
    },
    engagementByDevice: {
      desktop: { views: 2847, avgWatchTime: 923, completionRate: 71.2 },
      mobile: { views: 1234, avgWatchTime: 654, completionRate: 58.3 },
      tablet: { views: 342, avgWatchTime: 789, completionRate: 65.8 }
    }
  });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
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
      <div className="border border-gray-200 rounded p-6">
        <div className="flex items-center justify-center h-24">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "dropoff", label: "Drop-offs" },
    { id: "rewatch", label: "Rewatches" },
    { id: "pause", label: "Pauses" }
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-4 py-2 text-sm rounded ${
              selectedTab === tab.id
                ? "bg-white text-gray-900 font-medium"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedTab === "overview" && metrics?.overview && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-4 gap-4">
            <MetricCard
              label="Avg Watch Time"
              value={formatTime(metrics.overview.averageWatchTime)}
              trend="+12%"
              trendUp={true}
            />
            <MetricCard
              label="Completion Rate"
              value={`${metrics.overview.completionRate}%`}
              trend="+5%"
              trendUp={true}
            />
            <MetricCard
              label="Total Views"
              value={formatNumber(metrics.overview.totalViews)}
              trend="+18%"
              trendUp={true}
            />
            <MetricCard
              label="Retention Rate"
              value={`${metrics.overview.retentionRate}%`}
              trend="-2%"
              trendUp={false}
            />
          </div>

          {/* Device Breakdown */}
          {metrics.engagementByDevice && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Engagement by Device</h4>
              <div className="border border-gray-200 rounded">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Device</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Views</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Avg Time</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(metrics.engagementByDevice).map(([device, data], index) => (
                      <tr
                        key={device}
                        className="border-b border-gray-200 last:border-b-0 hover:bg-blue-50/50"
                      >
                        <td className="px-4 py-2 text-sm text-gray-900 capitalize">{device}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{formatNumber(data.views)}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{formatTime(data.avgWatchTime)}</td>
                        <td className="px-4 py-2">
                          <span className={`text-sm font-medium ${
                            data.completionRate >= 70 ? "text-green-600" :
                            data.completionRate >= 50 ? "text-yellow-600" :
                            "text-red-600"
                          }`}>
                            {data.completionRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Drop-off Points Tab */}
      {selectedTab === "dropoff" && metrics?.dropoffPoints && (
        <div className="space-y-4">
          {/* Alert Banner */}
          <div className="border border-red-200 rounded bg-red-50 p-4">
            <p className="text-sm text-red-900 font-medium mb-1">Critical Drop-off Alert</p>
            <p className="text-sm text-red-700">
              {metrics.dropoffPoints[0]?.studentsAffected || 0} students dropped off at the highest drop-off point.
              Consider adding a checkpoint or interactive element here.
            </p>
          </div>

          {/* Drop-off Table */}
          <div className="border border-gray-200 rounded">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Severity</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Drop-off</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Affected</th>
                </tr>
              </thead>
              <tbody>
                {metrics.dropoffPoints.map((point) => (
                  <tr
                    key={point.timestamp}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-blue-50/50"
                  >
                    <td className="px-4 py-2 text-sm font-mono text-gray-700">{formatTimeDetailed(point.timestamp)}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{point.reason}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        point.severity === "high" ? "bg-red-100 text-red-700" :
                        point.severity === "medium" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {point.severity}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${point.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-red-600">{point.percentage}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">{formatNumber(point.studentsAffected)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rewatch Tab */}
      {selectedTab === "rewatch" && metrics?.rewatchData && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded p-4">
              <p className="text-xs text-gray-500 mb-1">Total Rewatches</p>
              <p className="text-2xl font-semibold text-indigo-600">{formatNumber(metrics.rewatchData.totalRewatches)}</p>
            </div>
            <div className="border border-gray-200 rounded p-4">
              <p className="text-xs text-gray-500 mb-1">Avg per Viewer</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.rewatchData.averageRewatchesPerViewer.toFixed(2)}</p>
            </div>
            <div className="border border-gray-200 rounded p-4">
              <p className="text-xs text-gray-500 mb-1">Rewatch Rate</p>
              <p className="text-2xl font-semibold text-indigo-600">
                {((metrics.rewatchData.totalRewatches / metrics.overview.totalViews) * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Most Rewatched Segments */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Most Rewatched Segments</h4>
            <div className="border border-gray-200 rounded">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Segment</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Rewatches</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.rewatchData.mostRewatchedSegments.map((segment, index) => (
                    <tr
                      key={segment.startTime}
                      className="border-b border-gray-200 last:border-b-0 hover:bg-blue-50/50"
                    >
                      <td className="px-4 py-2">
                        <span className="text-sm text-gray-900">
                          {formatTimeDetailed(segment.startTime)} - {formatTimeDetailed(segment.endTime)}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">{segment.rewatchCount}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-gray-200 rounded overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${segment.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-indigo-600">{segment.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insight */}
          <div className="border border-blue-200 rounded bg-blue-50 p-4">
            <p className="text-sm text-blue-900 font-medium mb-1">Insight</p>
            <p className="text-sm text-blue-800">
              Students are rewatching complex explanations. Consider creating supplementary
              materials or practice exercises for these topics.
            </p>
          </div>
        </div>
      )}

      {/* Pause Tab */}
      {selectedTab === "pause" && metrics?.pauseData && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded p-4">
              <p className="text-xs text-gray-500 mb-1">Total Pauses</p>
              <p className="text-2xl font-semibold text-gray-900">{formatNumber(metrics.pauseData.totalPauses)}</p>
            </div>
            <div className="border border-gray-200 rounded p-4">
              <p className="text-xs text-gray-500 mb-1">Avg per Viewer</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.pauseData.averagePausesPerViewer.toFixed(2)}</p>
            </div>
          </div>

          {/* Pause Distribution */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Pause Distribution</h4>
            <div className="border border-gray-200 rounded">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Time Range</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Count</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.pauseData.pauseFrequency.map((item) => (
                    <tr
                      key={item.timeRange}
                      className="border-b border-gray-200 last:border-b-0 hover:bg-blue-50/50"
                    >
                      <td className="px-4 py-2 text-sm text-gray-900">{item.timeRange}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{item.count}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-gray-200 rounded overflow-hidden">
                            <div
                              className="h-full bg-yellow-600 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{item.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insight */}
          <div className="border border-green-200 rounded bg-green-50 p-4">
            <p className="text-sm text-green-900 font-medium mb-1">Insight</p>
            <p className="text-sm text-green-800">
              Peak pausing occurs during the 5-10 minute mark. This might indicate
              students need time to process new information. Consider adding natural break points or checkpoints here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Metric Card Sub-component
const MetricCard = ({ label, value, trend, trendUp }) => {
  return (
    <div className="border border-gray-200 rounded p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className={`text-xs mt-2 font-medium flex items-center gap-1 ${
        trendUp ? "text-green-600" : "text-red-600"
      }`}>
        {trendUp ? "+" : ""}{trend} vs last period
      </p>
    </div>
  );
};

export default EngagementMetrics;
