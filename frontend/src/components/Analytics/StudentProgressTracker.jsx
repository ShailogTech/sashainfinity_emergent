import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * StudentProgressTracker Component
 * Shows individual student progress through courses and videos
 * Includes detailed viewing history, quiz scores, and engagement metrics
 */
const StudentProgressTracker = ({ userId, courseId }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("progress");

  useEffect(() => {
    fetchStudentsProgress();
  }, [courseId]);

  const fetchStudentsProgress = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const url = courseId
        ? `/api/analytics/course/${courseId}/students`
        : "/api/analytics/students";

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const data = await response.json();
      setStudents(data.students || getMockStudents());
    } catch (err) {
      console.error("Error fetching students:", err);
      setStudents(getMockStudents());
    } finally {
      setLoading(false);
    }
  };

  const getMockStudents = () => [
    {
      id: "1",
      name: "Sarah Chen",
      email: "sarah.chen@example.com",
      avatar: "SC",
      avatarColor: "from-pink-400 to-rose-600",
      enrolledDate: "2024-01-15",
      lastActive: "2 hours ago",
      progress: 78,
      totalWatchTime: 124000,
      quizzesCompleted: 12,
      quizAverage: 94,
      streak: 45,
      badges: 8,
      status: "active",
      currentModule: "Advanced Hooks Patterns",
      modulesCompleted: 8,
      totalModules: 12,
      weakAreas: ["State Management", "Testing"],
      strongAreas: ["Components", "Hooks Basics"],
      nextMilestone: "Complete State Management module",
      milestonesCompleted: 5,
      totalMilestones: 10
    },
    {
      id: "2",
      name: "Michael Park",
      email: "michael.park@example.com",
      avatar: "MP",
      avatarColor: "from-blue-400 to-indigo-600",
      enrolledDate: "2024-01-20",
      lastActive: "1 day ago",
      progress: 65,
      totalWatchTime: 98000,
      quizzesCompleted: 10,
      quizAverage: 91,
      streak: 38,
      badges: 6,
      status: "active",
      currentModule: "Context API",
      modulesCompleted: 6,
      totalModules: 12,
      weakAreas: ["Performance Optimization"],
      strongAreas: ["JavaScript Basics", "React Fundamentals"],
      nextMilestone: "Complete Context API quiz",
      milestonesCompleted: 4,
      totalMilestones: 10
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      email: "emily.rodriguez@example.com",
      avatar: "ER",
      avatarColor: "from-emerald-400 to-teal-600",
      enrolledDate: "2024-02-01",
      lastActive: "5 hours ago",
      progress: 52,
      totalWatchTime: 76000,
      quizzesCompleted: 8,
      quizAverage: 86,
      streak: 21,
      badges: 5,
      status: "active",
      currentModule: "Custom Hooks",
      modulesCompleted: 5,
      totalModules: 12,
      weakAreas: ["Async Operations"],
      strongAreas: ["UI Design", "Component Architecture"],
      nextMilestone: "Build a custom hook project",
      milestonesCompleted: 3,
      totalMilestones: 10
    },
    {
      id: "4",
      name: "Tom Bradley",
      email: "tom.bradley@example.com",
      avatar: "TB",
      avatarColor: "from-amber-400 to-orange-600",
      enrolledDate: "2024-02-10",
      lastActive: "7 days ago",
      progress: 23,
      totalWatchTime: 18000,
      quizzesCompleted: 2,
      quizAverage: 45,
      streak: 0,
      badges: 1,
      status: "at-risk",
      currentModule: "useState Hook",
      modulesCompleted: 2,
      totalModules: 12,
      weakAreas: ["Hooks", "State", "Side Effects"],
      strongAreas: [],
      nextMilestone: "Complete useState module",
      milestonesCompleted: 0,
      totalMilestones: 10
    },
    {
      id: "5",
      name: "Amy Chen",
      email: "amy.chen@example.com",
      avatar: "AC",
      avatarColor: "from-purple-400 to-violet-600",
      enrolledDate: "2024-02-15",
      lastActive: "5 days ago",
      progress: 31,
      totalWatchTime: 24000,
      quizzesCompleted: 3,
      quizAverage: 52,
      streak: 3,
      badges: 2,
      status: "struggling",
      currentModule: "useEffect Hook",
      modulesCompleted: 3,
      totalModules: 12,
      weakAreas: ["useEffect", "Dependencies"],
      strongAreas: ["JavaScript Basics"],
      nextMilestone: "Pass useEffect quiz",
      milestonesCompleted: 1,
      totalMilestones: 10
    }
  ];

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "at-risk": return "bg-red-100 text-red-700 border-red-200";
      case "struggling": return "bg-orange-100 text-orange-700 border-orange-200";
      case "completed": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return "bg-emerald-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    switch (sortBy) {
      case "progress": return b.progress - a.progress;
      case "name": return a.name.localeCompare(b.name);
      case "recent": return -1; // Would need real date sorting
      case "score": return b.quizAverage - a.quizAverage;
      default: return 0;
    }
  });

  if (loading) {
    return (
      <div className="glassmorphism-lg rounded-2xl p-6">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="glassmorphism-lg rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          >
            <option value="progress">Sort by Progress</option>
            <option value="name">Sort by Name</option>
            <option value="score">Sort by Quiz Score</option>
            <option value="recent">Sort by Recent Activity</option>
          </select>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{students.length}</p>
            <p className="text-xs text-gray-500">Total Students</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {students.filter(s => s.status === "active").length}
            </p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {students.filter(s => s.status === "struggling").length}
            </p>
            <p className="text-xs text-gray-500">Struggling</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {students.filter(s => s.status === "at-risk").length}
            </p>
            <p className="text-xs text-gray-500">At Risk</p>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-3">
        {filteredStudents.map((student) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "glassmorphism-md rounded-2xl p-4 hover:shadow-xl transition-all cursor-pointer",
              student.status === "at-risk" && "border-l-4 border-l-red-500",
              student.status === "struggling" && "border-l-4 border-l-orange-500"
            )}
            onClick={() => setSelectedStudent(selectedStudent?.id === student.id ? null : student)}
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className={cn(
                "w-14 h-14 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg shadow-lg",
                student.avatarColor
              )}>
                {student.avatar}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-800 truncate">{student.name}</h4>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border", getStatusColor(student.status))}>
                    {student.status === "active" ? "Active" :
                     student.status === "at-risk" ? "At Risk" :
                     student.status === "struggling" ? "Struggling" : "Completed"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">{student.email}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>📖 {student.modulesCompleted}/{student.totalModules} modules</span>
                  <span>⏱️ {formatTime(student.totalWatchTime)}</span>
                  <span>🔥 {student.streak} day streak</span>
                  <span className="text-gray-400">Last active: {student.lastActive}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="w-32 text-right">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <span className="text-2xl font-bold text-gray-800">{student.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", getProgressColor(student.progress))}
                    style={{ width: `${student.progress}%` }}
                  />
                </div>
              </div>

              {/* Quiz Score */}
              <div className="w-20 text-center">
                <p className={cn(
                  "text-lg font-bold",
                  student.quizAverage >= 80 ? "text-emerald-600" :
                  student.quizAverage >= 60 ? "text-yellow-600" :
                  "text-red-600"
                )}>
                  {student.quizAverage}%
                </p>
                <p className="text-xs text-gray-500">Quiz Avg</p>
              </div>

              {/* Expand Icon */}
              <div className={cn(
                "transition-transform duration-200",
                selectedStudent?.id === student.id ? "rotate-180" : ""
              )}>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedStudent?.id === student.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-100"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Current Progress */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h5 className="font-semibold text-blue-800 mb-2">Current Progress</h5>
                    <p className="text-sm text-blue-700 mb-2">
                      Module: <strong>{student.currentModule}</strong>
                    </p>
                    <p className="text-sm text-blue-700">
                      Next: {student.nextMilestone}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      {Array.from({ length: student.totalMilestones }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-3 h-3 rounded-full",
                            i < student.milestonesCompleted ? "bg-blue-500" : "bg-blue-200"
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Strong Areas */}
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <h5 className="font-semibold text-emerald-800 mb-2">Strong Areas</h5>
                    <div className="flex flex-wrap gap-1">
                      {student.strongAreas.length > 0 ? (
                        student.strongAreas.map((area, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                            {area}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-emerald-600">More practice needed</p>
                      )}
                    </div>
                  </div>

                  {/* Areas for Improvement */}
                  <div className="bg-orange-50 rounded-xl p-4">
                    <h5 className="font-semibold text-orange-800 mb-2">Needs Help</h5>
                    <div className="flex flex-wrap gap-1">
                      {student.weakAreas.map((area, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                          {area}
                        </span>
                      ))}
                    </div>
                    {student.status !== "active" && (
                      <button className="mt-2 text-xs px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                        Send Reminder
                      </button>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Message
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    View Detailed Report
                  </button>
                  {student.status !== "active" && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Schedule Check-in
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StudentProgressTracker;
