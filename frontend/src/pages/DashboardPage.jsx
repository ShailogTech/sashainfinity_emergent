import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GlassCard, {
  GlassCardHeader,
  GlassCardBody,
  GlassCardFooter,
  GlassStatCard,
  GlassProgressCard,
} from '@/components/ui/glass-card';
import { BentoGrid, BentoItem } from '@/components/ui/bento-grid';
import {
  ParallaxContainer,
  ParallaxLayer,
  ParallaxTilt,
  ParallaxScrollTrigger,
} from '@/components/ui/parallax-container';
import './DashboardPage.css';

const DashboardPage = () => {
  // User state - fetched from auth context
  const [user, setUser] = useState({
    name: 'Student',
    avatar: '👨‍💻',
    level: 'Learner',
  });

  // Learning progress state - fetched from API
  const [streak, setStreak] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(4);
  const [totalPoints, setTotalPoints] = useState(0);

  // Current course state - fetched from API
  const [currentCourse, setCurrentCourse] = useState(null);

  // Upcoming live sessions - fetched from API
  const [upcomingSessions, setUpcomingSessions] = useState([]);

  // Recommended courses - fetched from API
  const [recommendedCourses, setRecommendedCourses] = useState([]);

  // Recent activity - fetched from API
  const [recentActivity, setRecentActivity] = useState([]);

  // Weekly progress data - fetched from API
  const [weeklyProgress, setWeeklyProgress] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch user profile
      const userResponse = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/auth/me`,
        { headers }
      );

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser({
          name: userData.name || 'Student',
          avatar: '👨‍💻',
          level: userData.role === 'instructor' ? 'Instructor' : 'Learner',
        });
      }

      // Fetch user progress and stats
      const progressResponse = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/user/progress`,
        { headers }
      );

      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        setStreak(progressData.streak || 0);
        setCompletedToday(progressData.completed_today || 0);
        setDailyGoal(progressData.daily_goal || 4);
        setTotalPoints(progressData.total_points || 0);
        setCurrentCourse(progressData.current_course);
        setWeeklyProgress(progressData.weekly_progress || getDefaultWeeklyProgress());
      } else {
        // Set default values if endpoint doesn't exist
        setStreak(0);
        setCompletedToday(0);
        setTotalPoints(0);
        setWeeklyProgress(getDefaultWeeklyProgress());
      }

      // Fetch recommended courses
      const coursesResponse = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/courses?recommended=true&limit=3`,
        { headers }
      );

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setRecommendedCourses(coursesData.courses || coursesData || []);
      } else {
        setRecommendedCourses([]);
      }

      // Fetch upcoming sessions
      const sessionsResponse = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/sessions/upcoming?limit=2`,
        { headers }
      );

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setUpcomingSessions(sessionsData.sessions || sessionsData || []);
      } else {
        setUpcomingSessions([]);
      }

      // Fetch recent activity
      const activityResponse = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/user/activity?limit=5`,
        { headers }
      );

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.activities || activityData || []);
      } else {
        setRecentActivity([]);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(error.message);

      // Set default values on error
      setWeeklyProgress(getDefaultWeeklyProgress());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultWeeklyProgress = () => [
    { day: 'Mon', completed: 0, total: 4 },
    { day: 'Tue', completed: 0, total: 4 },
    { day: 'Wed', completed: 0, total: 4 },
    { day: 'Thu', completed: 0, total: 4 },
    { day: 'Fri', completed: 0, total: 4 },
    { day: 'Sat', completed: 0, total: 4 },
    { day: 'Sun', completed: 0, total: 4 },
  ];

  // Activity type icon
  const getActivityIcon = (type) => {
    const icons = {
      completed: '✅',
      started: '▶️',
      achievement: '🏆',
      certificate: '🎓',
      enrollment: '📝',
    };
    return icons[type] || '📌';
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Ambient background blobs */}
      <div className="dashboard-ambient-blob blob-1" />
      <div className="dashboard-ambient-blob blob-2" />
      <div className="dashboard-ambient-blob blob-3" />

      {/* Dashboard Header */}
      <ParallaxScrollTrigger animation="fade-down" delay={0}>
        <header className="dashboard-header">
          <div className="dashboard-header-content">
            <div className="dashboard-welcome">
              <div className="dashboard-avatar">
                {user.avatar}
              </div>
              <div>
                <h1>Welcome back, {user.name}! 👋</h1>
                <p className="dashboard-subtitle">Continue your learning journey</p>
              </div>
            </div>
            <div className="dashboard-header-actions">
              <button className="dashboard-icon-btn">
                <span>🔔</span>
                <span className="notification-badge">3</span>
              </button>
              <button className="dashboard-icon-btn">
                <span>⚙️</span>
              </button>
            </div>
          </div>
        </header>
      </ParallaxScrollTrigger>

      {/* Stats Row */}
      <BentoGrid columns={4} gap={20} className="dashboard-stats-row">
        <ParallaxScrollTrigger animation="fade-up" delay={100}>
          <BentoItem>
            <GlassStatCard
              value={`${streak} days`}
              label="Current Streak"
              change={streak > 0 ? "Keep it up!" : "Start your streak"}
              changeType={streak > 0 ? "positive" : "neutral"}
              icon="🔥"
              variant="primary"
            />
          </BentoItem>
        </ParallaxScrollTrigger>

        <ParallaxScrollTrigger animation="fade-up" delay={150}>
          <BentoItem>
            <GlassStatCard
              value={totalPoints.toLocaleString()}
              label="Total Points"
              change="+150 today"
              changeType="positive"
              icon="⭐"
              variant="accent"
            />
          </BentoItem>
        </ParallaxScrollTrigger>

        <ParallaxScrollTrigger animation="fade-up" delay={200}>
          <BentoItem>
            <GlassStatCard
              value={`${completedToday}/${dailyGoal}`}
              label="Today's Goal"
              change={completedToday >= dailyGoal ? "Goal met!" : "Keep going"}
              changeType={completedToday >= dailyGoal ? "positive" : "neutral"}
              icon="📚"
              variant="default"
            />
          </BentoItem>
        </ParallaxScrollTrigger>

        <ParallaxScrollTrigger animation="fade-up" delay={250}>
          <BentoItem>
            <GlassStatCard
              value="4.9"
              label="Average Score"
              change="+0.3"
              changeType="positive"
              icon="🎯"
              variant="success"
            />
          </BentoItem>
        </ParallaxScrollTrigger>
      </BentoGrid>

      {/* Main Bento Grid */}
      <BentoGrid columns={4} gap={24} className="dashboard-main-grid">

        {/* Current Course - Large Featured Card */}
        {currentCourse ? (
          <ParallaxScrollTrigger animation="fade-up" delay={300}>
            <BentoItem colSpan={2} rowSpan={2}>
                <GlassCard
                  variant="primary"
                  size="lg"
                  hoverable
                  className="current-course-card"
                  onClick={() => window.location.href = `/courses/${currentCourse.id}`}
                >
                  <div className="course-thumbnail" style={{ background: `${currentCourse.color || '#61DAFB'}15` }}>
                    <span className="course-emoji">{currentCourse.thumbnail || '📚'}</span>
                    <div className="course-tag">In Progress</div>
                  </div>

                  <GlassCardHeader
                    title="Continue Learning"
                    subtitle={currentCourse.instructor || 'Instructor'}
                    icon={<div className="course-progress-ring">
                      <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="white"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 45}`}
                          strokeDashoffset={`${2 * Math.PI * 45 * (1 - (currentCourse.progress || 0) / 100)}`}
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <span>{currentCourse.progress || 0}%</span>
                    </div>}
                  />

                  <GlassCardBody>
                    <h2 className="course-title">{currentCourse.title}</h2>

                    <div className="course-next-module">
                      <div className="next-module-label">Next up:</div>
                      <div className="next-module-name">{currentCourse.next_module || 'Continue Learning'}</div>
                      <div className="next-module-duration">
                        <span>⏱️</span> {currentCourse.next_module_duration || '10 min'}
                      </div>
                    </div>

                    <div className="course-progress-bar">
                      <div className="progress-fill" style={{ width: `${currentCourse.progress || 0}%` }} />
                    </div>
                  </GlassCardBody>

                  <GlassCardFooter>
                    <div className="course-stats">
                      <span>{currentCourse.completed_modules || 0} of {currentCourse.total_modules || 0} modules</span>
                      <span>~{currentCourse.remaining_time || '4h'} left</span>
                    </div>
                    <button className="continue-btn">
                      <span>Resume</span>
                      <span>→</span>
                    </button>
                  </GlassCardFooter>
                </GlassCard>
            </BentoItem>
          </ParallaxScrollTrigger>
        ) : (
          <ParallaxScrollTrigger animation="fade-up" delay={300}>
            <BentoItem colSpan={2} rowSpan={2}>
              <GlassCard variant="default" size="lg" className="current-course-card">
                <GlassCardBody>
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No active courses</p>
                    <Link
                      to="/courses"
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                    >
                      Browse Courses
                    </Link>
                  </div>
                </GlassCardBody>
              </GlassCard>
            </BentoItem>
          </ParallaxScrollTrigger>
        )}

        {/* Today's Progress */}
        <ParallaxScrollTrigger animation="fade-up" delay={350}>
          <BentoItem rowSpan={2}>
            <GlassProgressCard
              title="Today's Goal"
              progress={completedToday}
              total={dailyGoal}
              type="circular"
              variant="default"
              size="lg"
              className="today-progress-card"
            >
              <div className="today-progress-message">
                {completedToday >= dailyGoal ? (
                  <p className="success-message">🎉 Goal achieved! Amazing work!</p>
                ) : (
                  <p>{dailyGoal - completedToday} more to reach your daily goal</p>
                )}
              </div>

              <div className="daily-modules">
                {Array.from({ length: dailyGoal }).map((_, i) => (
                  <div
                    key={i}
                    className={`module-dot ${i < completedToday ? 'completed' : ''}`}
                  />
                ))}
              </div>
            </GlassProgressCard>
          </BentoItem>
        </ParallaxScrollTrigger>

        {/* Weekly Activity Chart */}
        <ParallaxScrollTrigger animation="fade-up" delay={400}>
          <BentoItem rowSpan={1}>
            <GlassCard variant="default" size="md" className="weekly-activity-card">
              <GlassCardHeader title="This Week" subtitle="Your learning pattern" />

              <GlassCardBody>
                <div className="weekly-chart">
                  {weeklyProgress.map((day, i) => {
                    const percentage = day.total > 0 ? (day.completed / day.total) * 100 : 0;
                    return (
                      <div key={i} className="chart-bar">
                        <div
                          className={`bar-fill ${percentage >= 100 ? 'complete' : ''}`}
                          style={{ height: `${Math.max(percentage, 15)}%` }}
                        />
                        <span className="bar-label">{day.day.slice(0, 2)}</span>
                      </div>
                    );
                  })}
                </div>
              </GlassCardBody>
            </GlassCard>
          </BentoItem>
        </ParallaxScrollTrigger>

        {/* Quick Actions */}
        <ParallaxScrollTrigger animation="fade-up" delay={450}>
          <BentoItem>
            <GlassCard variant="gradient" size="md" className="quick-actions-card">
              <GlassCardHeader title="Quick Actions" />

              <GlassCardBody>
                <div className="quick-actions-grid">
                  <Link to="/courses" className="quick-action-btn">
                    <span>📚</span>
                    <span>Browse</span>
                  </Link>
                  <Link to="/sandbox" className="quick-action-btn">
                    <span>💻</span>
                    <span>Code</span>
                  </Link>
                  <Link to="/ar-gallery" className="quick-action-btn">
                    <span>🥽</span>
                    <span>AR View</span>
                  </Link>
                  <Link to="/wellness" className="quick-action-btn">
                    <span>🧘</span>
                    <span>Wellness</span>
                  </Link>
                </div>
              </GlassCardBody>
            </GlassCard>
          </BentoItem>
        </ParallaxScrollTrigger>

        {/* Upcoming Live Sessions */}
        {upcomingSessions.length > 0 && (
          <ParallaxScrollTrigger animation="fade-up" delay={500}>
            <BentoItem colSpan={2}>
              <GlassCard variant="secondary" size="md" className="sessions-card">
                <GlassCardHeader
                  title="Live Sessions"
                  subtitle="Don't miss out"
                  action={<Link to="/sessions" className="view-all-link">View all</Link>}
                />

                <GlassCardBody>
                  <div className="sessions-list">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className={`session-item ${session.status}`}>
                        {session.status === 'live' && (
                          <div className="live-badge">
                            <span className="live-dot" />
                            LIVE
                          </div>
                        )}

                        <div className="session-time">
                          <span className="session-date">{session.date}</span>
                          <span className="session-hour">{session.time}</span>
                        </div>

                        <div className="session-info">
                          <h4 className="session-title">{session.title}</h4>
                          <p className="session-instructor">by {session.instructor}</p>
                        </div>

                        <div className="session-meta">
                          <span>⏱️ {session.duration}</span>
                          <span>👥 {session.attendees}</span>
                        </div>

                        <button className={`join-btn ${session.status === 'live' ? 'live' : ''}`}>
                          {session.status === 'live' ? 'Join Now' : 'Remind Me'}
                        </button>
                      </div>
                    ))}
                  </div>
                </GlassCardBody>
              </GlassCard>
            </BentoItem>
          </ParallaxScrollTrigger>
        )}

        {/* Recent Activity Feed */}
        <ParallaxScrollTrigger animation="fade-up" delay={550}>
          <BentoItem colSpan={1} rowSpan={2}>
            <GlassCard variant="default" size="md" className="activity-card">
              <GlassCardHeader
                title="Activity"
                subtitle="Your recent progress"
                action={<Link to="/activity" className="view-all-link">See all</Link>}
              />

              <GlassCardBody>
                <div className="activity-list">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className={`activity-item activity-${activity.type}`}>
                        <div className="activity-icon">{getActivityIcon(activity.type)}</div>
                        <div className="activity-content">
                          <div className="activity-title">{activity.title}</div>
                          {activity.course && (
                            <div className="activity-course">{activity.course}</div>
                          )}
                          {activity.description && (
                            <div className="activity-description">{activity.description}</div>
                          )}
                          <div className="activity-time">{activity.time}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </GlassCardBody>
            </GlassCard>
          </BentoItem>
        </ParallaxScrollTrigger>

        {/* Recommended Courses */}
        {recommendedCourses.length > 0 && (
          <ParallaxScrollTrigger animation="fade-up" delay={600}>
            <BentoItem colSpan={2}>
              <GlassCard variant="default" size="md" className="recommended-card">
                <GlassCardHeader
                  title="Recommended For You"
                  subtitle="Based on your interests"
                  action={<Link to="/courses" className="view-all-link">Browse all</Link>}
                />

                <GlassCardBody>
                  <div className="recommended-list">
                    {recommendedCourses.map((course) => (
                      <Link
                        key={course.id}
                        to={`/courses/${course.id}`}
                        className="recommended-item"
                      >
                        <div
                          className="recommended-thumbnail"
                          style={{ background: `${course.color || '#61DAFB'}15` }}
                        >
                          {course.thumbnail || '📚'}
                        </div>

                        <div className="recommended-info">
                          <h4 className="recommended-title">{course.title}</h4>
                          <p className="recommended-instructor">{course.instructor}</p>

                          <div className="recommended-meta">
                            <span className="recommended-level">{course.level || 'All Levels'}</span>
                            <span>⏱️ {course.duration || 'Self-paced'}</span>
                          </div>
                        </div>

                        <div className="recommended-rating">
                          <span>⭐ {course.rating || 'New'}</span>
                          <span>{course.students || 0} students</span>
                        </div>

                        <button className="recommended-btn">Enroll</button>
                      </Link>
                    ))}
                  </div>
                </GlassCardBody>
              </GlassCard>
            </BentoItem>
          </ParallaxScrollTrigger>
        )}

        {/* Achievement Banner */}
        <ParallaxScrollTrigger animation="fade-up" delay={650}>
          <BentoItem colSpan={2}>
            <GlassCard
              variant="gradient"
              size="md"
              hoverable
              className="achievement-banner"
            >
              <div className="achievement-content">
                <div className="achievement-icon">🏆</div>
                <div className="achievement-text">
                  <h3>Start Your Learning Journey!</h3>
                  <p>Enroll in a course and start learning today.</p>
                </div>
                <div className="achievement-reward">
                  <span>+0 XP</span>
                  <span>🎁</span>
                </div>
              </div>
            </GlassCard>
          </BentoItem>
        </ParallaxScrollTrigger>

      </BentoGrid>
    </div>
  );
};

export default DashboardPage;
