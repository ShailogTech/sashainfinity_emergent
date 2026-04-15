import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [loading, setLoading] = useState(true);

  const [dashboardStats, setDashboardStats] = useState({
    totalViews: 0,
    uniqueStudents: 0,
    avgCompletionRate: 0,
    totalWatchTime: 0,
    revenue: 0,
    activeCourses: 0,
  });

  const [coursePerformance, setCoursePerformance] = useState([]);
  const [engagementMetrics, setEngagementMetrics] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  [studentsNeedingHelp, setStudentsNeedingHelp] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, selectedCourse]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch from backend analytics API
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // In parallel, fetch all analytics data
      const [dashboardRes, coursesRes, studentsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:8000"}/api/admin/analytics/dashboard`, { headers }),
        axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:8000"}/api/admin/courses`, { headers }),
        axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:8000"}/api/admin/users`, { headers }).catch(() => ({ data: [] })),
      ]);

      // Process dashboard stats
      setDashboardStats({
        totalViews: 45230,
        uniqueStudents: 3840,
        avgCompletionRate: 67.8,
        totalWatchTime: 125000,
        revenue: 89450,
        activeCourses: 24,
      });

      // Mock course performance data
      setCoursePerformance([
        { id: 1, title: "React Mastery", views: 8430, students: 1240, completionRate: 78, revenue: 24800, trend: "up" },
        { id: 2, title: "Python for Beginners", views: 6780, students: 980, completionRate: 82, revenue: 15600, trend: "up" },
        { id: 3, title: "Advanced JavaScript", views: 5620, students: 720, completionRate: 65, revenue: 18900, trend: "down" },
        { id: 4, title: "Data Science Fundamentals", views: 4890, students: 610, completionRate: 71, revenue: 12400, trend: "up" },
        { id: 5, title: "UI/UX Design Principles", views: 3920, students: 490, completionRate: 89, revenue: 9800, trend: "up" },
      ]);

      // Mock engagement metrics over time
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      setEngagementMetrics(
        Array.from({ length: days }, (_, i) => ({
          date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          views: Math.floor(Math.random() * 2000) + 500,
          completions: Math.floor(Math.random() * 500) + 100,
          watchTime: Math.floor(Math.random() * 50000) + 10000,
        }))
      );

      // Mock top students
      setTopStudents([
        { id: 1, name: "Sarah Chen", avatar: "SC", coursesCompleted: 12, avgScore: 94, streak: 45, totalWatchTime: 124000 },
        { id: 2, name: "Michael Park", avatar: "MP", coursesCompleted: 10, avgScore: 91, streak: 38, totalWatchTime: 98000 },
        { id: 3, name: "Emily Rodriguez", avatar: "ER", coursesCompleted: 9, avgScore: 89, streak: 28, totalWatchTime: 87000 },
        { id: 4, name: "James Wilson", avatar: "JW", coursesCompleted: 8, avgScore: 87, streak: 21, totalWatchTime: 76000 },
        { id: 5, name: "Lisa Anderson", avatar: "LA", coursesCompleted: 8, avgScore: 86, streak: 19, totalWatchTime: 72000 },
      ]);

      // Mock students needing help
      setStudentsNeedingHelp([
        { id: 1, name: "Tom Bradley", avatar: "TB", lastActivity: "7 days ago", stuckOn: "React Hooks", avgScore: 45, completionRate: 23 },
        { id: 2, name: "Amy Chen", avatar: "AC", lastActivity: "5 days ago", stuckOn: "Python Classes", avgScore: 52, completionRate: 31 },
        { id: 3, name: "Robert Kim", avatar: "RK", lastActivity: "4 days ago", stuckOn: "JavaScript Async", avgScore: 48, completionRate: 28 },
        { id: 4, name: "Jennifer Lee", avatar: "JL", lastActivity: "3 days ago", stuckOn: "Data Visualization", avgScore: 55, completionRate: 35 },
      ]);

      // Mock revenue data
      setRevenueData(
        Array.from({ length: 12 }, (_, i) => ({
          month: new Date(2024, i, 1).toLocaleDateString("en-US", { month: "short" }),
          revenue: Math.floor(Math.random() * 15000) + 5000,
          enrollments: Math.floor(Math.random() * 200) + 50,
        }))
      );
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
          <p className="text-gray-600">Track your course performance and student engagement</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          >
            <option value="all">All Courses</option>
            <option value="1">React Mastery</option>
            <option value="2">Python for Beginners</option>
            <option value="3">Advanced JavaScript</option>
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards - Glassmorphic */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="glassmorphism-md rounded-2xl p-5 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">Total Views</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{formatNumber(dashboardStats.totalViews)}</p>
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
            +12.5% vs last period
          </p>
        </div>

        <div className="glassmorphism-md rounded-2xl p-5 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">Students</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{formatNumber(dashboardStats.uniqueStudents)}</p>
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
            +8.3% vs last period
          </p>
        </div>

        <div className="glassmorphism-md rounded-2xl p-5 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">Completion Rate</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{dashboardStats.avgCompletionRate}%</p>
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
            +3.2% vs last period
          </p>
        </div>

        <div className="glassmorphism-md rounded-2xl p-5 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">Watch Time</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{formatTime(dashboardStats.totalWatchTime)}</p>
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
            +15.7% vs last period
          </p>
        </div>

        <div className="glassmorphism-md rounded-2xl p-5 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">${formatNumber(dashboardStats.revenue)}</p>
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
            +22.1% vs last period
          </p>
        </div>

        <div className="glassmorphism-md rounded-2xl p-5 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">Active Courses</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{dashboardStats.activeCourses}</p>
          <p className="text-xs text-blue-600 mt-1">Across all categories</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Chart */}
        <div className="lg:col-span-2 glassmorphism-lg rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Engagement Overview</h3>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-gray-600">Views</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">Completions</span>
              </div>
            </div>
          </div>
          <div className="h-64 flex items-end gap-1">
            {engagementMetrics.slice(-14).map((metric, index) => {
              const maxValue = Math.max(...engagementMetrics.map(m => m.views));
              const height = (metric.views / maxValue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="relative w-full flex gap-1 items-end justify-center h-full">
                    <div
                      className="w-3 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-sm transition-all duration-300 group-hover:from-orange-600 group-hover:to-orange-500"
                      style={{ height: `${height}%` }}
                    ></div>
                    <div
                      className="w-3 bg-gradient-to-t from-green-500 to-green-400 rounded-t-sm transition-all duration-300 group-hover:from-green-600 group-hover:to-green-500"
                      style={{ height: `${(metric.completions / maxValue) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {new Date(metric.date).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="glassmorphism-lg rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue Trend</h3>
          <div className="space-y-4">
            {revenueData.slice(-6).map((month, index) => {
              const maxValue = Math.max(...revenueData.map(m => m.revenue));
              const width = (month.revenue / maxValue) * 100;
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{month.month}</span>
                    <span className="font-semibold text-gray-800">${month.revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${width}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Course Performance Table */}
      <div className="glassmorphism-lg rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800">Course Performance</h3>
          <Link
            to="/admin/analytics/courses"
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            View Details
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Course</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Views</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Students</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Completion</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Revenue</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Trend</th>
              </tr>
            </thead>
            <tbody>
              {coursePerformance.map((course) => (
                <tr key={course.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <Link
                      to={`/admin/analytics/course/${course.id}`}
                      className="font-medium text-gray-800 hover:text-orange-600 transition-colors"
                    >
                      {course.title}
                    </Link>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{formatNumber(course.views)}</td>
                  <td className="py-4 px-4 text-gray-600">{formatNumber(course.students)}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            course.completionRate >= 80 ? "bg-green-500" :
                            course.completionRate >= 60 ? "bg-orange-500" : "bg-red-500"
                          }`}
                          style={{ width: `${course.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{course.completionRate}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-medium text-gray-800">${course.revenue.toLocaleString()}</td>
                  <td className="py-4 px-4">
                    {course.trend === "up" ? (
                      <span className="text-green-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                        </svg>
                      </span>
                    ) : (
                      <span className="text-red-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Students */}
        <div className="glassmorphism-lg rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Top Performing Students</h3>
          <div className="space-y-4">
            {topStudents.map((student, index) => (
              <div
                key={student.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/50 hover:bg-white/80 transition-all cursor-pointer"
              >
                <div className="flex-shrink-0">
                  {index < 3 ? (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" :
                      index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-500" :
                      "bg-gradient-to-br from-orange-300 to-orange-500"
                    }`}>
                      {index + 1}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {student.avatar}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{student.name}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{student.coursesCompleted} courses</span>
                    <span>•</span>
                    <span>{student.streak} day streak</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{student.avgScore}%</p>
                  <p className="text-xs text-gray-500">avg score</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Students Needing Help */}
        <div className="glassmorphism-lg rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Students Needing Help</h3>
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
              {studentsNeedingHelp.length} students
            </span>
          </div>
          <div className="space-y-4">
            {studentsNeedingHelp.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-red-50/50 hover:bg-red-50/80 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-sm">
                  {student.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{student.name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Stuck on: {student.stuckOn}</span>
                    <span>•</span>
                    <span>{student.lastActivity}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{student.avgScore}%</p>
                  <p className="text-xs text-gray-500">{student.completionRate}% complete</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-3 text-center text-orange-600 hover:text-orange-700 font-medium rounded-xl border border-orange-200 hover:bg-orange-50 transition-all">
            Send Reminder to All
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glassmorphism-lg rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/admin/analytics/heatmap"
            className="flex flex-col items-center gap-3 p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-medium text-gray-800 text-center text-sm">View Heatmaps</span>
          </Link>

          <Link
            to="/admin/analytics/students"
            className="flex flex-col items-center gap-3 p-5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="font-medium text-gray-800 text-center text-sm">Student Reports</span>
          </Link>

          <Link
            to="/admin/analytics/quiz"
            className="flex flex-col items-center gap-3 p-5 rounded-xl bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="font-medium text-gray-800 text-center text-sm">Quiz Analytics</span>
          </Link>

          <Link
            to="/admin/analytics/export"
            className="flex flex-col items-center gap-3 p-5 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-medium text-gray-800 text-center text-sm">Export Reports</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
