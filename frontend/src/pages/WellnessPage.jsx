import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import BentoBox from '@/components/ui/BentoBox';
import { useAuth } from '@/contexts/AuthContext';
import './WellnessPage.css';

const WellnessPage = () => {
  const { user, API_BASE } = useAuth();
  const [wellnessData, setWellnessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const WELLNESS_TIPS = [
    { icon: '💧', title: 'Stay Hydrated', text: 'Drink water regularly. Your brain needs hydration for optimal focus.' },
    { icon: '🌿', title: '20-20-20 Rule', text: 'Every 20 minutes, look at something 20 feet away for 20 seconds.' },
    { icon: '🧘', title: 'Mindful Breathing', text: 'Take 3 deep breaths. It activates your parasympathetic nervous system.' },
    { icon: '🚶', title: 'Movement Breaks', text: 'Stand and stretch every hour. Blood flow boosts cognitive function.' },
    { icon: '😴', title: 'Quality Sleep', text: 'Aim for 7-9 hours. Sleep consolidates what you learned during the day.' },
    { icon: '📵', title: 'Digital Detox', text: 'Step away from screens during breaks. Your eyes will thank you.' }
  ];

  const INSIGHT_MESSAGES = {
    high_performance: "You're performing best after breaks. Keep up the balanced schedule!",
    morning_person: "Your peak focus is in the morning. Schedule challenging topics then.",
    evening_learner: "You tend to focus well in evenings. Plan your day accordingly.",
    needs_rest: "Consider more frequent breaks. Small pauses improve long-term retention.",
    streak_hero: "Your consistency is impressive. Consistency beats intensity every time."
  };

  useEffect(() => {
    fetchWellnessData();
  }, [selectedPeriod, API_BASE]);

  const fetchWellnessData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE}/wellness/dashboard?period=${selectedPeriod}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWellnessData(data);
      } else {
        setWellnessData(getMockWellnessData());
      }
    } catch (err) {
      setWellnessData(getMockWellnessData());
    } finally {
      setLoading(false);
    }
  };

  const getMockWellnessData = () => ({
    studyStreak: { current: 12, best: 18 },
    todayStudyTime: 95,
    totalStudyTime: 2475,
    optimalStudyTimes: ['09:00-11:00', '14:00-16:00', '19:00-21:00'],
    performanceVsRest: [
      { day: 'Mon', study: 45, rest: 15, performance: 85 },
      { day: 'Tue', study: 60, rest: 20, performance: 92 },
      { day: 'Wed', study: 90, rest: 10, performance: 78 },
      { day: 'Thu', study: 50, rest: 25, performance: 95 },
      { day: 'Fri', study: 75, rest: 15, performance: 88 },
      { day: 'Sat', study: 30, rest: 30, performance: 82 },
      { day: 'Sun', study: 40, rest: 40, performance: 90 }
    ],
    weeklyStats: {
      totalSessions: 28,
      avgSessionDuration: 35,
      breaksTaken: 15,
      avgQuizScore: 81
    },
    insight: 'high_performance',
    recentBreaks: [
      { date: 'Today', duration: 15, completed: true },
      { date: 'Today', duration: 5, completed: true },
      { date: 'Yesterday', duration: 20, completed: true }
    ]
  });

  const formatMinutes = (mins) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getStreakColor = (streak) => {
    if (streak >= 14) return '#f59e0b';
    if (streak >= 7) return '#10b981';
    return '#6366f1';
  };

  const renderPerformanceChart = () => {
    if (!wellnessData?.performanceVsRest) return null;

    const maxPerformance = 100;
    const maxStudy = Math.max(...wellnessData.performanceVsRest.map(d => d.study));

    return (
      <div className="performance-chart">
        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-dot performance"></span>
            Performance
          </span>
          <span className="legend-item">
            <span className="legend-dot study"></span>
            Study Time
          </span>
          <span className="legend-item">
            <span className="legend-dot rest"></span>
            Break Time
          </span>
        </div>
        <div className="chart-bars">
          {wellnessData.performanceVsRest.map((day, i) => (
            <div key={i} className="chart-day">
              <div className="day-bars">
                <div
                  className="bar performance-bar"
                  style={{ height: `${(day.performance / maxPerformance) * 100}%` }}
                  title={`Performance: ${day.performance}%`}
                />
                <div className="bars-stack">
                  <div
                    className="bar study-bar"
                    style={{ height: `${(day.study / maxStudy) * 60}%` }}
                    title={`Study: ${day.study}m`}
                  />
                  <div
                    className="bar rest-bar"
                    style={{ height: `${(day.rest / maxStudy) * 60}%` }}
                    title={`Rest: ${day.rest}m`}
                  />
                </div>
              </div>
              <span className="day-label">{day.day}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="wellness-page">
        <div className="wellness-loading">
          <div className="loading-spinner"></div>
          <p>Loading your wellness insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wellness-page">
      <div className="wellness-header">
        <div className="header-content">
          <h1>
            <span className="header-icon">🌿</span>
            Silent Sense
          </h1>
          <p className="header-subtitle">Your personal wellness companion</p>
        </div>
        <div className="period-selector">
          {['day', 'week', 'month'].map(period => (
            <button
              key={period}
              className={`period-btn ${selectedPeriod === period ? 'active' : ''}`}
              onClick={() => setSelectedPeriod(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <BentoBox gap={20}>
        {/* Study Streak */}
        <BentoBox.Item span={1} rowSpan={1}>
          <GlassCard variant="accent" className="streak-card">
            <div className="streak-flame" style={{ color: getStreakColor(wellnessData?.studyStreak?.current) }}>
              🔥
            </div>
            <div className="streak-number">{wellnessData?.studyStreak?.current || 0}</div>
            <div className="streak-label">Day Streak</div>
            <div className="streak-best">
              Best: {wellnessData?.studyStreak?.best || 0} days
            </div>
          </GlassCard>
        </BentoBox.Item>

        {/* Today's Study Time */}
        <BentoBox.Item span={1} rowSpan={1}>
          <GlassCard variant="primary" className="study-time-card">
            <div className="study-time-icon">⏱️</div>
            <div className="study-time-value">
              {formatMinutes(wellnessData?.todayStudyTime || 0)}
            </div>
            <div className="study-time-label">Today</div>
            <div className="study-time-total">
              Total: {formatMinutes(wellnessData?.totalStudyTime || 0)}
            </div>
          </GlassCard>
        </BentoBox.Item>

        {/* Optimal Study Times */}
        <BentoBox.Item span={2} rowSpan={1}>
          <GlassCard className="optimal-times-card">
            <h3>
              <span>🕐</span>
              Your Peak Focus Hours
            </h3>
            <div className="optimal-times-list">
              {wellnessData?.optimalStudyTimes?.map((time, i) => (
                <div key={i} className="optimal-time-item">
                  <span className="time-badge">{time}</span>
                  <span className="time-label">
                    {i === 0 ? 'Highest focus' : i === 1 ? 'Good retention' : 'Consistent'}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </BentoBox.Item>

        {/* Performance vs Rest Chart */}
        <BentoBox.Item span={2} rowSpan={2}>
          <GlassCard className="performance-rest-card">
            <h3>
              <span>📊</span>
              Performance vs Rest Balance
            </h3>
            {renderPerformanceChart()}
          </GlassCard>
        </BentoBox.Item>

        {/* Weekly Stats */}
        <BentoBox.Item span={1} rowSpan={1}>
          <GlassCard variant="secondary" className="weekly-stats-card">
            <h3>This Week</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{wellnessData?.weeklyStats?.totalSessions || 0}</span>
                <span className="stat-label">Sessions</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{wellnessData?.weeklyStats?.avgSessionDuration || 0}m</span>
                <span className="stat-label">Avg Session</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{wellnessData?.weeklyStats?.breaksTaken || 0}</span>
                <span className="stat-label">Breaks Taken</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{wellnessData?.weeklyStats?.avgQuizScore || 0}%</span>
                <span className="stat-label">Avg Score</span>
              </div>
            </div>
          </GlassCard>
        </BentoBox.Item>

        {/* Personalized Insight */}
        <BentoBox.Item span={1} rowSpan={1}>
          <GlassCard variant="success" className="insight-card">
            <div className="insight-icon">💡</div>
            <p className="insight-text">
              {INSIGHT_MESSAGES[wellnessData?.insight] || INSIGHT_MESSAGES.high_performance}
            </p>
          </GlassCard>
        </BentoBox.Item>

        {/* Wellness Tips */}
        <BentoBox.Item span={3} rowSpan={1}>
          <GlassCard className="tips-card">
            <h3>
              <span>🌱</span>
              Wellness Tips
            </h3>
            <div className="tips-carousel">
              {WELLNESS_TIPS.slice(0, 3).map((tip, i) => (
                <div key={i} className="tip-item">
                  <span className="tip-icon">{tip.icon}</span>
                  <div className="tip-content">
                    <span className="tip-title">{tip.title}</span>
                    <span className="tip-text">{tip.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </BentoBox.Item>

        {/* Recent Breaks */}
        <BentoBox.Item span={2} rowSpan={1}>
          <GlassCard className="breaks-history-card">
            <h3>
              <span>🧘</span>
              Recent Breaks
            </h3>
            <div className="breaks-list">
              {wellnessData?.recentBreaks?.map((breakItem, i) => (
                <div key={i} className={`break-history-item ${breakItem.completed ? 'completed' : ''}`}>
                  <span className="break-time">{breakItem.date}</span>
                  <span className="break-duration">{breakItem.duration} minutes</span>
                  <span className="break-status">
                    {breakItem.completed ? '✓ Completed' : 'Skipped'}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </BentoBox.Item>

        {/* More Tips */}
        <BentoBox.Item span={1} rowSpan={1}>
          <GlassCard className="more-tips-card">
            <h3>
              <span>📚</span>
              More Tips
            </h3>
            <div className="tips-compact">
              {WELLNESS_TIPS.slice(3).map((tip, i) => (
                <div key={i} className="compact-tip">
                  <span>{tip.icon}</span>
                  <span>{tip.title}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </BentoBox.Item>
      </BentoBox>

      <div className="wellness-footer">
        <p>
          Remember: Taking care of yourself is part of learning success. Listen to your body and mind.
        </p>
      </div>
    </div>
  );
};

export default WellnessPage;
