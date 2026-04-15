import { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalBlogPosts: 0,
    activeUsers: 0,
    revenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };

        const response = await fetch(`${API_BASE}/api/admin/dashboard`, { headers });

        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
        }

        const data = await response.json();

        // Set stats from API response
        setStats({
          totalUsers: data.total_users || 0,
          totalCourses: data.total_courses || 0,
          totalBlogPosts: data.total_blog_posts || 0,
          activeUsers: data.active_users || 0,
          revenue: data.revenue || 0,
        });

        // Set recent activity from API response
        setRecentActivity(data.recent_activity || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message);
        // Set default values on error
        setStats({
          totalUsers: 0,
          totalCourses: 0,
          totalBlogPosts: 0,
          activeUsers: 0,
          revenue: 0,
        });
        setRecentActivity([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-800 font-medium mb-2">Error loading dashboard</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
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
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`$${stats.revenue.toLocaleString()}`} change="+18.3%" />
        <StatCard label="Total Users" value={stats.totalUsers.toLocaleString()} change="+12.5%" />
        <StatCard label="Active Users" value={stats.activeUsers.toLocaleString()} change="+5.2%" />
        <StatCard label="Total Courses" value={stats.totalCourses.toString()} change="+3 this month" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="Revenue over time" subtitle="Comparison of revenue across periods">
          <ChartPlaceholder />
        </ChartCard>
        <ChartCard title="Orders over time" subtitle="Comparison of orders across periods">
          <ChartPlaceholder />
        </ChartCard>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="col-span-2 bg-white border border-[#e2e8f0] rounded-sm">
          <div className="px-4 py-3 border-b border-[#e2e8f0]">
            <h2 className="text-[#0f172a] text-sm font-medium">Recent activity</h2>
          </div>
          {recentActivity.length > 0 ? (
            <div className="divide-y divide-[#f1f5f9]">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#f1f5f9] rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#94a3b8] rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0f172a] truncate">
                      {activity.message}
                      {activity.user && <span className="font-medium"> {activity.user}</span>}
                      {activity.item && <span className="font-medium"> "{activity.item}"</span>}
                      {activity.amount && <span className="font-medium"> {activity.amount}</span>}
                    </p>
                    <p className="text-xs text-[#64748b] mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-gray-500">No recent activity</div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-[#e2e8f0] rounded-sm">
          <div className="px-4 py-3 border-b border-[#e2e8f0]">
            <h2 className="text-[#0f172a] text-sm font-medium">Quick actions</h2>
          </div>
          <div className="p-4 space-y-2">
            <QuickActionButton href="/admin/courses">Add new course</QuickActionButton>
            <QuickActionButton href="/admin/users">Add new user</QuickActionButton>
            <QuickActionButton href="/admin/blog">Create blog post</QuickActionButton>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, change }) => (
  <div className="bg-white border border-[#e2e8f0] rounded-sm px-4 py-4">
    <p className="text-xs text-[#64748b] uppercase tracking-wide font-medium">{label}</p>
    <p className="text-2xl text-[#0f172a] font-medium mt-1">{value}</p>
    <p className="text-xs text-[#16a34a] mt-1">{change}</p>
  </div>
);

const ChartCard = ({ title, subtitle, children }) => (
  <div className="bg-white border border-[#e2e8f0] rounded-sm">
    <div className="px-4 py-3 border-b border-[#e2e8f0]">
      <h2 className="text-[#0f172a] text-sm font-medium">{title}</h2>
      <p className="text-xs text-[#64748b] mt-0.5">{subtitle}</p>
    </div>
    {children}
  </div>
);

const ChartPlaceholder = () => (
  <div className="p-6 h-48 flex items-center justify-center bg-[#fafafa]">
    <p className="text-sm text-[#94a3b8]">Chart visualization placeholder</p>
  </div>
);

const QuickActionButton = ({ href, children }) => (
  <a
    href={href}
    className="flex items-center gap-2 px-3 py-2 text-sm text-[#0f172a] border border-[#e2e8f0] rounded-sm hover:bg-[#f8fafc]"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
    {children}
  </a>
);

export default AdminDashboard;
