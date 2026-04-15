import React, { useState, useEffect } from 'react';
import BentoBox from './BentoBox';
import GlassCard from './GlassCard';
import ParallaxContainer from './ParallaxContainer';
import GlassModal from './GlassModal';
import { Link } from 'react-router-dom';

/**
 * DashboardDemo - A beautiful glassmorphic bento-box dashboard
 * demonstrating the complete UI system with parallax effects
 */
const DashboardDemo = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [streak, setStreak] = useState(7);
  const [currentVideo, setCurrentVideo] = useState({
    title: 'Introduction to Complex Numbers',
    progress: 65,
    duration: '24:30',
    completed: '15:55',
  });

  const upcomingSessions = [
    { id: 1, title: 'Advanced Calculus', time: '10:00 AM', instructor: 'Dr. Smith', color: 'primary' },
    { id: 2, title: 'Linear Algebra', time: '2:00 PM', instructor: 'Prof. Johnson', color: 'secondary' },
    { id: 3, title: 'Statistics Workshop', time: '4:30 PM', instructor: 'Dr. Williams', color: 'accent' },
  ];

  const quickStats = [
    { label: 'Courses Completed', value: '12', icon: '📚', change: '+2 this month' },
    { label: 'Hours Learned', value: '48', icon: '⏱️', change: '+8h this week' },
    { label: 'Quizzes Passed', value: '28', icon: '✅', change: '95% pass rate' },
    { label: 'Achievements', value: '15', icon: '🏆', change: '3 new unlocked' },
  ];

  const recentActivity = [
    { action: 'Completed lesson', item: 'Complex Numbers Basics', time: '2 hours ago', icon: '✓' },
    { action: 'Started course', item: 'Advanced Calculus', time: '5 hours ago', icon: '▶️' },
    { action: 'Earned badge', item: 'Quick Learner', time: 'Yesterday', icon: '🏅' },
    { action: 'Submitted assignment', item: 'Linear Algebra Quiz', time: '2 days ago', icon: '📝' },
  ];

  const coursesInProgress = [
    { title: 'Complex Numbers', progress: 75, color: '#f4911a' },
    { title: 'Linear Algebra', progress: 45, color: '#667eea' },
    { title: 'Calculus II', progress: 30, color: '#2dd472' },
  ];

  return (
    <div className="dashboard-demo" style={{ padding: '60px 0', background: '#fafafa' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 48px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{
            fontSize: '42px',
            fontWeight: 800,
            color: '#1a1a2e',
            marginBottom: '16px',
            letterSpacing: '-1.5px'
          }}>
            Your Learning Dashboard
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            lineHeight: '1.7'
          }}>
            Track your progress, continue learning, and achieve your goals
          </p>
        </div>

        {/* Bento Grid Layout */}
        <BentoBox gap={24}>
          {/* Current Video - Large Card */}
          <BentoBox.Item span="2" rowSpan="2">
            <ParallaxContainer.Tilt className="bento-item">
              <GlassCard
                variant="primary"
                size="lg"
                hoverable
                gradient
                style={{ height: '100%', minHeight: '400px' }}
              >
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    background: 'rgba(244, 145, 26, 0.15)',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#f4911a',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '16px'
                  }}>
                    Continue Learning
                  </div>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#1a1a2e',
                    marginBottom: '12px',
                    lineHeight: '1.3'
                  }}>
                    {currentVideo.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '24px'
                  }}>
                    {currentVideo.completed} of {currentVideo.duration} completed
                  </p>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 600
                  }}>
                    <span style={{ color: '#1a1a2e' }}>Progress</span>
                    <span style={{ color: '#f4911a' }}>{currentVideo.progress}%</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'rgba(244, 145, 26, 0.1)',
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${currentVideo.progress}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #f4911a 0%, #ffaa44 100%)',
                      borderRadius: '10px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>

                {/* Play Button */}
                <button
                  onClick={() => setModalOpen(true)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #f4911a 0%, #ffaa44 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(244, 145, 26, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span style={{ fontSize: '20px' }}>▶</span>
                  Resume Lesson
                </button>
              </GlassCard>
            </ParallaxContainer.Tilt>
          </BentoBox.Item>

          {/* Daily Streak */}
          <BentoBox.Item>
            <ParallaxContainer.Tilt className="bento-item">
              <GlassCard
                variant="warning"
                size="lg"
                hoverable
                gradient
                style={{ height: '100%', minHeight: '180px' }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto 20px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(245, 87, 108, 0.15) 0%, rgba(245, 87, 108, 0.05) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '36px'
                  }}>
                    🔥
                  </div>
                  <h3 style={{
                    fontSize: '48px',
                    fontWeight: 900,
                    color: '#f5576c',
                    lineHeight: '1',
                    marginBottom: '8px',
                    fontFamily: "'Lexend Deca', sans-serif"
                  }}>
                    {streak}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Day Streak
                  </p>
                </div>
              </GlassCard>
            </ParallaxContainer.Tilt>
          </BentoBox.Item>

          {/* Quick Stats */}
          <BentoBox.Item>
            <ParallaxContainer.Tilt className="bento-item">
              <GlassCard
                variant="success"
                size="lg"
                hoverable
                gradient
                style={{ height: '100%', minHeight: '180px' }}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px'
                }}>
                  {quickStats.slice(0, 4).map((stat, index) => (
                    <div
                      key={index}
                      style={{
                        textAlign: 'center',
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.5)',
                        borderRadius: '12px'
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '4px' }}>{stat.icon}</div>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: 800,
                        color: '#2dd472',
                        fontFamily: "'Lexend Deca', sans-serif"
                      }}>
                        {stat.value}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        color: '#6b7280',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        marginTop: '4px'
                      }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </ParallaxContainer.Tilt>
          </BentoBox.Item>

          {/* Upcoming Sessions */}
          <BentoBox.Item span="2">
            <ParallaxContainer.Tilt className="bento-item">
              <GlassCard
                variant="secondary"
                size="lg"
                hoverable
                gradient
                style={{ height: '100%', minHeight: '200px' }}
              >
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#1a1a2e',
                  marginBottom: '20px'
                }}>
                  Upcoming Sessions
                </h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {upcomingSessions.map((session) => (
                    <div
                      key={session.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.6)',
                        borderRadius: '12px',
                        border: '1px solid rgba(8, 42, 94, 0.1)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(4px)';
                        e.currentTarget.style.borderColor = 'rgba(8, 42, 94, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.borderColor = 'rgba(8, 42, 94, 0.1)';
                      }}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: session.color === 'primary'
                          ? 'rgba(244, 145, 26, 0.1)'
                          : session.color === 'secondary'
                          ? 'rgba(8, 42, 94, 0.1)'
                          : 'rgba(102, 126, 234, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        flexShrink: 0
                      }}>
                        📅
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#1a1a2e',
                          marginBottom: '4px'
                        }}>
                          {session.title}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>
                          {session.time} • {session.instructor}
                        </div>
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        background: session.color === 'primary'
                          ? 'rgba(244, 145, 26, 0.1)'
                          : session.color === 'secondary'
                          ? 'rgba(8, 42, 94, 0.1)'
                          : 'rgba(102, 126, 234, 0.1)',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: session.color === 'primary'
                          ? '#f4911a'
                          : session.color === 'secondary'
                          ? '#082A5E'
                          : '#667eea',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Join
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </ParallaxContainer.Tilt>
          </BentoBox.Item>

          {/* Courses in Progress */}
          <BentoBox.Item span="2">
            <ParallaxContainer.Tilt className="bento-item">
              <GlassCard
                variant="accent"
                size="lg"
                hoverable
                gradient
                style={{ height: '100%', minHeight: '200px' }}
              >
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#1a1a2e',
                  marginBottom: '20px'
                }}>
                  Courses in Progress
                </h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {coursesInProgress.map((course, index) => (
                    <div key={index}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: 600
                      }}>
                        <span style={{ color: '#1a1a2e' }}>{course.title}</span>
                        <span style={{ color: course.color }}>{course.progress}%</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '6px',
                        background: 'rgba(0, 0, 0, 0.05)',
                        borderRadius: '6px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${course.progress}%`,
                          height: '100%',
                          background: course.color,
                          borderRadius: '6px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </ParallaxContainer.Tilt>
          </BentoBox.Item>

          {/* Recent Activity */}
          <BentoBox.Item>
            <ParallaxContainer.Tilt className="bento-item">
              <GlassCard
                variant="default"
                size="lg"
                hoverable
                style={{ height: '100%', minHeight: '250px' }}
              >
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#1a1a2e',
                  marginBottom: '16px'
                }}>
                  Recent Activity
                </h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        padding: '10px',
                        borderRadius: '8px',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'rgba(244, 145, 26, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        flexShrink: 0
                      }}>
                        {activity.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '13px',
                          color: '#1a1a2e',
                          marginBottom: '2px'
                        }}>
                          <span style={{ fontWeight: 600 }}>{activity.action}</span> {activity.item}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: '#6b7280'
                        }}>
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </ParallaxContainer.Tilt>
          </BentoBox.Item>

          {/* Quick Actions */}
          <BentoBox.Item>
            <ParallaxContainer.Tilt className="bento-item">
              <GlassCard
                variant="primary"
                size="lg"
                hoverable
                gradient
                style={{ height: '100%', minHeight: '250px' }}
              >
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#1a1a2e',
                  marginBottom: '16px'
                }}>
                  Quick Actions
                </h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <Link
                    to="/courses"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.6)',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      color: '#1a1a2e',
                      fontSize: '14px',
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      border: '1px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(244, 145, 26, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(244, 145, 26, 0.3)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>📚</span>
                    Browse Courses
                  </Link>
                  <Link
                    to="/blog"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.6)',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      color: '#1a1a2e',
                      fontSize: '14px',
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      border: '1px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>📝</span>
                    Read Articles
                  </Link>
                  <Link
                    to="/contact"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.6)',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      color: '#1a1a2e',
                      fontSize: '14px',
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      border: '1px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(67, 233, 123, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(67, 233, 123, 0.3)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>💬</span>
                    Get Support
                  </Link>
                </div>
              </GlassCard>
            </ParallaxContainer.Tilt>
          </BentoBox.Item>
        </BentoBox>

        {/* Video Modal */}
        <GlassModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          size="xl"
        >
          <GlassModal.Body>
            <div style={{
              width: '100%',
              aspectRatio: '16/9',
              background: '#1a1a2e',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '18px'
            }}>
              Video Player Placeholder
            </div>
          </GlassModal.Body>
        </GlassModal>
      </div>
    </div>
  );
};

export default DashboardDemo;
