import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const AdminStudentInsights = () => {
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("performing"); // performing, needs-help, all
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("score"); // score, completion, streak, watch-time

  const [students, setStudents] = useState([]);
  const [quizStats, setQuizStats] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      // In a real app, fetch from API
      // const token = localStorage.getItem("token");
      // const response = await axios.get(`${API_URL}/api/admin/analytics/students`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });

      // Mock student data
      setStudents([
        {
          id: 1,
          name: "Sarah Chen",
          email: "sarah.chen@example.com",
          avatar: "SC",
          coursesEnrolled: 5,
          coursesCompleted: 3,
          avgScore: 94.2,
          completionRate: 78,
          streak: 45,
          totalWatchTime: 124500,
          lastActive: "2 hours ago",
          status: "active",
          quizScores: { "React Basics": 95, "JavaScript": 92, "CSS": 96 },
          weakTopics: ["State Management", "Redux"],
          strongTopics: ["Components", "Hooks"],
        },
        {
          id: 2,
          name: "Michael Park",
          email: "michael.park@example.com",
          avatar: "MP",
          coursesEnrolled: 4,
          coursesCompleted: 2,
          avgScore: 91.5,
          completionRate: 65,
          streak: 38,
          totalWatchTime: 98000,
          lastActive: "5 hours ago",
          status: "active",
          quizScores: { "React Basics": 88, "JavaScript": 94, "Python": 91 },
          weakTopics: ["TypeScript"],
          strongTopics: ["JavaScript", "Python"],
        },
        {
          id: 3,
          name: "Emily Rodriguez",
          email: "emily.r@example.com",
          avatar: "ER",
          coursesEnrolled: 3,
          coursesCompleted: 3,
          avgScore: 89.8,
          completionRate: 92,
          streak: 28,
          totalWatchTime: 87000,
          lastActive: "1 day ago",
          status: "active",
          quizScores: { "UI Design": 92, "CSS": 88, "Figma": 89 },
          weakTopics: ["Prototyping"],
          strongTopics: ["Color Theory", "Typography"],
        },
        {
          id: 4,
          name: "James Wilson",
          email: "j.wilson@example.com",
          avatar: "JW",
          coursesEnrolled: 4,
          coursesCompleted: 1,
          avgScore: 87.3,
          completionRate: 45,
          streak: 21,
          totalWatchTime: 76000,
          lastActive: "3 days ago",
          status: "at-risk",
          quizScores: { "React Basics": 82, "JavaScript": 78, "Node.js": 90 },
          weakTopics: ["React Hooks", "Async JavaScript"],
          strongTopics: ["Node.js", "APIs"],
        },
        {
          id: 5,
          name: "Lisa Anderson",
          email: "lisa.a@example.com",
          avatar: "LA",
          coursesEnrolled: 3,
          coursesCompleted: 2,
          avgScore: 86.7,
          completionRate: 70,
          streak: 19,
          totalWatchTime: 72000,
          lastActive: "4 hours ago",
          status: "active",
          quizScores: { "Data Science": 88, "Python": 85, "Statistics": 87 },
          weakTopics: ["Machine Learning"],
          strongTopics: ["Data Visualization", "Pandas"],
        },
        {
          id: 6,
          name: "Tom Bradley",
          email: "t.bradley@example.com",
          avatar: "TB",
          coursesEnrolled: 2,
          coursesCompleted: 0,
          avgScore: 45.2,
          completionRate: 23,
          streak: 0,
          totalWatchTime: 12000,
          lastActive: "7 days ago",
          status: "critical",
          quizScores: { "React Basics": 42, "JavaScript": 48 },
          weakTopics: ["React Hooks", "Components", "State"],
          strongTopics: [],
        },
        {
          id: 7,
          name: "Amy Chen",
          email: "amy.chen@example.com",
          avatar: "AC",
          coursesEnrolled: 2,
          coursesCompleted: 0,
          avgScore: 52.1,
          completionRate: 31,
          streak: 3,
          totalWatchTime: 18000,
          lastActive: "5 days ago",
          status: "at-risk",
          quizScores: { "Python Basics": 55, "Data Structures": 49 },
          weakTopics: ["Classes", "OOP", "Algorithms"],
          strongTopics: ["Variables", "Loops"],
        },
        {
          id: 8,
          name: "Robert Kim",
          email: "r.kim@example.com",
          avatar: "RK",
          coursesEnrolled: 3,
          coursesCompleted: 1,
          avgScore: 48.5,
          completionRate: 28,
          streak: 5,
          totalWatchTime: 24000,
          lastActive: "4 days ago",
          status: "at-risk",
          quizScores: { "JavaScript": 52, "Async": 45 },
          weakTopics: ["Promises", "Async/Await", "Fetch API"],
          strongTopics: ["DOM Manipulation"],
        },
      ]);

      // Quiz performance by topic
      setQuizStats([
        { topic: "React Components", avgScore: 85, totalAttempts: 234, improvement: 12 },
        { topic: "JavaScript Basics", avgScore: 78, totalAttempts: 312, improvement: 8 },
        { topic: "React Hooks", avgScore: 72, totalAttempts: 189, improvement: -5 },
        { topic: "State Management", avgScore: 68, totalAttempts: 145, improvement: -3 },
        { topic: "Async JavaScript", avgScore: 65, totalAttempts: 167, improvement: 2 },
        { topic: "CSS & Styling", avgScore: 82, totalAttempts: 289, improvement: 15 },
        { topic: "API Integration", avgScore: 75, totalAttempts: 198, improvement: 10 },
        { topic: "Testing", avgScore: 58, totalAttempts: 87, improvement: -8 },
      ]);

      // Attendance/Activity data
      setAttendanceData([
        { date: "Jan 1", active: 45, inactive: 12 },
        { date: "Jan 8", active: 52, inactive: 8 },
        { date: "Jan 15", active: 48, inactive: 15 },
        { date: "Jan 22", active: 58, inactive: 5 },
        { date: "Jan 29", active: 62, inactive: 3 },
        { date: "Feb 5", active: 55, inactive: 10 },
        { date: "Feb 12", active: 68, inactive: 2 },
      ]);
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students
    .filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());

      if (selectedTab === "performing") {
        return matchesSearch && student.avgScore >= 85 && student.status !== "critical";
      } else if (selectedTab === "needs-help") {
        return matchesSearch && (student.status === "at-risk" || student.status === "critical");
      }
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.avgScore - a.avgScore;
      if (sortBy === "completion") return b.completionRate - a.completionRate;
      if (sortBy === "streak") return b.streak - a.streak;
      if (sortBy === "watch-time") return b.totalWatchTime - a.totalWatchTime;
      return 0;
    });

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "at-risk":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "critical":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student insights...</p>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const topPerformers = students.filter((s) => s.avgScore >= 85).length;
  const needHelp = students.filter((s) => s.status === "at-risk" || s.status === "critical").length;
  const avgClassScore = students.reduce((sum, s) => sum + s.avgScore, 0) / students.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Student Insights</h2>
          <p className="text-gray-600">Track student performance, engagement, and provide support</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glassmorphism-md rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Students</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{students.length}</p>
          <p className="text-xs text-gray-500 mt-1">Active enrolled</p>
        </div>

        <div className="glassmorphism-md rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Top Performers</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">{topPerformers}</p>
          <p className="text-xs text-gray-500 mt-1">85%+ avg score</p>
        </div>

        <div className="glassmorphism-md rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Needs Help</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600">{needHelp}</p>
          <p className="text-xs text-gray-500 mt-1">Require attention</p>
        </div>

        <div className="glassmorphism-md rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Class Average</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-600">{avgClassScore.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">Across all quizzes</p>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="glassmorphism-lg rounded-2xl p-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab("performing")}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedTab === "performing"
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                  : "bg-white/70 text-gray-600 hover:bg-white"
              }`}
            >
              Top Performers
            </button>
            <button
              onClick={() => setSelectedTab("needs-help")}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedTab === "needs-help"
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                  : "bg-white/70 text-gray-600 hover:bg-white"
              }`}
            >
              Needs Help
              {needHelp > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white/30 rounded-full text-xs">
                  {needHelp}
                </span>
              )}
            </button>
            <button
              onClick={() => setSelectedTab("all")}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedTab === "all"
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                  : "bg-white/70 text-gray-600 hover:bg-white"
              }`}
            >
              All Students
            </button>
          </div>

          <div className="flex gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-initial">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full lg:w-64 pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              <option value="score">Sort by Score</option>
              <option value="completion">Sort by Completion</option>
              <option value="streak">Sort by Streak</option>
              <option value="watch-time">Sort by Watch Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="glassmorphism-lg rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Student</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Courses</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Avg Score</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Completion</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Streak</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Last Active</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {student.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}>
                      {student.status === "active" ? "Active" : student.status === "at-risk" ? "At Risk" : "Critical"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {student.coursesCompleted}/{student.coursesEnrolled}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`font-semibold ${student.avgScore >= 85 ? "text-green-600" : student.avgScore >= 70 ? "text-yellow-600" : "text-red-600"}`}>
                      {student.avgScore.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            student.completionRate >= 80 ? "bg-green-500" :
                            student.completionRate >= 50 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${student.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{student.completionRate}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1 text-gray-600">
                      <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                      </svg>
                      <span>{student.streak} days</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{student.lastActive}</td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/analytics/student/${student.id}`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <button
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Send Message"
                      >
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quiz Performance by Topic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glassmorphism-lg rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Quiz Performance by Topic</h3>
          <div className="space-y-4">
            {quizStats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">{stat.topic}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${stat.improvement >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {stat.improvement >= 0 ? "+" : ""}{stat.improvement}%
                    </span>
                    <span className="text-sm text-gray-500">({stat.totalAttempts} attempts)</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        stat.avgScore >= 80 ? "bg-gradient-to-r from-green-400 to-green-600" :
                        stat.avgScore >= 60 ? "bg-gradient-to-r from-yellow-400 to-yellow-600" :
                        "bg-gradient-to-r from-red-400 to-red-600"
                      }`}
                      style={{ width: `${stat.avgScore}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-12 text-right">{stat.avgScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Trends */}
        <div className="glassmorphism-lg rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Activity Trends</h3>
          <div className="h-64 flex items-end justify-around gap-2">
            {attendanceData.map((data, index) => {
              const maxValue = Math.max(...attendanceData.map(d => d.active));
              const height = (data.active / maxValue) * 100;
              return (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-full flex gap-1 items-end justify-center h-full">
                    <div
                      className="w-full max-w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500"
                      style={{ height: `${height}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{data.date}</span>
                  <span className="text-sm font-semibold text-blue-600">{data.active}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Individual Student Cards for At-Risk Students */}
      {selectedTab === "needs-help" && (
        <div className="glassmorphism-lg rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Intervention Recommendations</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {filteredStudents.slice(0, 4).map((student) => (
              <div key={student.id} className="p-4 bg-red-50/50 rounded-xl border border-red-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {student.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{student.name}</p>
                        <p className="text-sm text-gray-500">Last active: {student.lastActive}</p>
                      </div>
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        Critical
                      </span>
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Struggling with:</span>{" "}
                        {student.weakTopics.join(", ")}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Suggested action:</span>{" "}
                        Send personalized review materials for {student.weakTopics[0]}
                      </p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                        Send Message
                      </button>
                      <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        Schedule Call
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentInsights;
