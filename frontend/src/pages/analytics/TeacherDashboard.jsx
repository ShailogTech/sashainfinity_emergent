import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const COLORS = {
  blue: "#3b82f6",
  green: "#16a34a",
  yellow: "#ca8a04",
  red: "#dc2626",
  indigo: "#6366f1"
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded p-2 shadow-sm">
      {label && <p className="text-xs text-gray-600 mb-1">{label}</p>}
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium text-gray-900">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const TeacherDashboard = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dashboardStats, setDashboardStats] = useState({
    totalViews: 0,
    avgWatchTime: 0,
    completionRate: 0,
    revenue: 0
  });

  const [viewsData, setViewsData] = useState([]);
  const [topVideos, setTopVideos] = useState([]);
  const [completionData, setCompletionData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, selectedCourse]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(
        `${API_BASE}/api/analytics/dashboard?timeRange=${timeRange}&course=${selectedCourse}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      const data = await response.json();

      setDashboardStats({
        totalViews: data.total_views || 0,
        avgWatchTime: data.avg_watch_time || 0,
        completionRate: data.completion_rate || 0,
        revenue: data.revenue || 0
      });

      setViewsData(data.views_over_time || []);
      setTopVideos(data.top_videos || []);
      setCompletionData(data.completion_data || [
        { name: "Completed", value: 0, color: COLORS.green },
        { name: "In Progress", value: 0, color: COLORS.yellow },
        { name: "Not Started", value: 0, color: COLORS.red }
      ]);
      setRecentActivity(data.recent_activity || []);

    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError(error.message);
      // Set empty defaults on error
      setViewsData([]);
      setTopVideos([]);
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(num);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "videos", label: "Videos" },
    { id: "students", label: "Students" },
    { id: "revenue", label: "Revenue" },
    { id: "settings", label: "Settings" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-800 font-medium mb-2">Error loading analytics</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={fetchAnalyticsData}
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded bg-white text-gray-700"
              >
                <option value="all">All Courses</option>
                {topVideos.map((course, i) => (
                  <option key={i} value={course.id || course.name}>{course.name}</option>
                ))}
              </select>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded bg-white text-gray-700"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button className="px-4 py-2 text-sm border border-gray-200 rounded bg-white text-gray-700 hover:bg-gray-50">
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 border-r border-gray-200 min-h-[calc(100vh-65px)] p-4">
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-3 py-2 text-sm rounded ${
                  activeTab === item.id
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <MetricCard
              title="Total Views"
              value={formatNumber(dashboardStats.totalViews)}
              color="blue"
            />
            <MetricCard
              title="Average Watch Time"
              value={formatTime(dashboardStats.avgWatchTime)}
              color="green"
            />
            <MetricCard
              title="Completion Rate"
              value={`${dashboardStats.completionRate}%`}
              color="yellow"
            />
            <MetricCard
              title="Revenue"
              value={formatCurrency(dashboardStats.revenue)}
              color="indigo"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Views Over Time */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Views Over Time</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={viewsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#9ca3af" tick={{fontSize: 12}} />
                  <YAxis stroke="#9ca3af" tick={{fontSize: 12}} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="views" stroke={COLORS.blue} strokeWidth={2} dot={{fill: COLORS.blue}} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Completion Distribution */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Completion Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Videos */}
          <div className="border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Top Performing Videos</h3>
            {topVideos.length > 0 ? (
              <div className="space-y-3">
                {topVideos.map((video, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                      <span className="text-sm font-medium text-gray-900">{video.name}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-gray-600">{formatNumber(video.views)} views</span>
                      <span className="text-gray-600">{video.completionRate}% completion</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No video data available</p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Recent Activity</h3>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{activity.student}</span>
                      <span className="text-sm text-gray-600 mx-2">{activity.action}</span>
                      <span className="text-sm text-gray-700">{activity.video}</span>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    indigo: "bg-indigo-50 text-indigo-700"
  };

  return (
    <div className={`p-4 rounded-lg border border-gray-200 ${colorClasses[color]}`}>
      <p className="text-xs uppercase tracking-wide font-medium mb-1">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default TeacherDashboard;
