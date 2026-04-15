import React, { useState, useEffect } from 'react';
import './ChallengeStats.css';

const ChallengeStats = ({ userId }) => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/challenges/stats?user_id=${userId || 'demo-user'}`);
      const data = await response.json();
      setStats(data.stats || defaultStats);
      setHistory(data.history || []);
    } catch (error) {
      setStats(defaultStats);
    }
    setLoading(false);
  };

  const defaultStats = {
    totalCompleted: 0,
    totalPoints: 0,
    currentStreak: 0,
    maxStreak: 0,
    accuracy: 0,
    fastestTime: null,
    challengesByType: {
      quiz: { completed: 0, bestScore: 0 },
      code: { completed: 0, bestScore: 0 },
      dragdrop: { completed: 0, bestScore: 0 }
    },
    achievements: []
  };

  const getAchievementIcon = (achievementId) => {
    const icons = {
      first_win: 'fa-medal',
      streak_3: 'fa-fire',
      streak_5: 'fa-fire-flame-curved',
      speed_demon: 'fa-bolt',
      perfectionist: 'fa-crown',
      scholar: 'fa-graduation-cap'
    };
    return icons[achievementId] || 'fa-trophy';
  };

  const getLevelInfo = (points) => {
    const levels = [
      { name: 'Novice', minPoints: 0, color: '#9ca3af' },
      { name: 'Apprentice', minPoints: 500, color: '#43e97b' },
      { name: 'Skilled', minPoints: 1500, color: '#3b82f6' },
      { name: 'Expert', minPoints: 3000, color: '#8b5cf6' },
      { name: 'Master', minPoints: 5000, color: '#f4911a' },
      { name: 'Legend', minPoints: 10000, color: '#ef4444' }
    ];

    let currentLevel = levels[0];
    let nextLevel = levels[1];
    let progress = 0;

    for (let i = 0; i < levels.length; i++) {
      if (points >= levels[i].minPoints) {
        currentLevel = levels[i];
        nextLevel = levels[i + 1] || null;
        if (nextLevel) {
          const range = nextLevel.minPoints - currentLevel.minPoints;
          const current = points - currentLevel.minPoints;
          progress = (current / range) * 100;
        } else {
          progress = 100;
        }
      }
    }

    return { level: currentLevel, nextLevel, progress };
  };

  if (loading) {
    return (
      <div className="challenge-stats-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const { level, nextLevel, progress } = getLevelInfo(stats?.totalPoints || 0);

  return (
    <div className="challenge-stats glassmorphism-md">
      <div className="stats-header">
        <h2>
          <i className="fa-solid fa-chart-line"></i>
          Challenge Stats
        </h2>
      </div>

      <div className="stats-tabs">
        <button
          className={`stats-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="fa-solid fa-home"></i> Overview
        </button>
        <button
          className={`stats-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <i className="fa-solid fa-history"></i> History
        </button>
        <button
          className={`stats-tab ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <i className="fa-solid fa-trophy"></i> Achievements
        </button>
      </div>

      <div className="stats-content">
        {activeTab === 'overview' && (
          <>
            <div className="level-banner" style={{ background: `linear-gradient(135deg, ${level.color}22 0%, ${level.color}11 100%)` }}>
              <div className="level-info">
                <span className="level-label">Current Level</span>
                <span className="level-name" style={{ color: level.color }}>{level.name}</span>
              </div>
              <div className="level-progress">
                <div className="level-bar">
                  <div
                    className="level-fill"
                    style={{ width: `${progress}%`, backgroundColor: level.color }}
                  />
                </div>
                <span className="level-points">{stats?.totalPoints || 0} / {nextLevel?.minPoints || 'MAX'} XP</span>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(244, 145, 26, 0.15)' }}>
                  <i className="fa-solid fa-check-circle" style={{ color: '#f4911a' }}></i>
                </div>
                <span className="stat-value">{stats?.totalCompleted || 0}</span>
                <span className="stat-label">Completed</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(255, 215, 0, 0.15)' }}>
                  <i className="fa-solid fa-star" style={{ color: '#ffd700' }}></i>
                </div>
                <span className="stat-value">{stats?.totalPoints || 0}</span>
                <span className="stat-label">Total Points</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(255, 100, 100, 0.15)' }}>
                  <i className="fa-solid fa-fire" style={{ color: '#ff6464' }}></i>
                </div>
                <span className="stat-value">{stats?.currentStreak || 0}</span>
                <span className="stat-label">Current Streak</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(67, 233, 123, 0.15)' }}>
                  <i className="fa-solid fa-bullseye" style={{ color: '#43e97b' }}></i>
                </div>
                <span className="stat-value">{stats?.accuracy || 0}%</span>
                <span className="stat-label">Accuracy</span>
              </div>
            </div>

            <div className="stats-by-type">
              <h3>Performance by Type</h3>
              <div className="type-stats">
                {Object.entries(stats?.challengesByType || {}).map(([type, data]) => (
                  <div key={type} className="type-stat-card">
                    <div className="type-header">
                      <i className={`fa-solid ${
                        type === 'quiz' ? 'fa-brain' :
                        type === 'code' ? 'fa-code' :
                        'fa-hand-pointer'
                      }`}></i>
                      <span className="type-name">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                    </div>
                    <div className="type-stats-row">
                      <span>{data.completed} completed</span>
                      <span className="type-best">Best: {data.bestScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <div className="history-list">
            {history.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-clock-rotate-left"></i>
                <p>No challenges completed yet. Start learning!</p>
              </div>
            ) : (
              history.map((entry, index) => (
                <div key={index} className={`history-item ${entry.is_correct ? 'correct' : 'incorrect'}`}>
                  <div className="history-icon">
                    <i className={`fa-solid ${entry.is_correct ? 'fa-check' : 'fa-times'}`}></i>
                  </div>
                  <div className="history-info">
                    <span className="history-challenge">{entry.challenge_title}</span>
                    <span className="history-time">
                      {new Date(entry.completed_at).toLocaleDateString()} • {entry.time_taken}s
                    </span>
                  </div>
                  <div className="history-points">
                    {entry.is_correct ? `+${entry.points_earned}` : '0'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="achievements-grid">
            {Object.entries({
              first_win: { name: 'First Victory!', description: 'Complete your first challenge' },
              streak_3: { name: 'On Fire!', description: 'Reach a 3-challenge streak' },
              streak_5: { name: 'Unstoppable!', description: 'Reach a 5-challenge streak' },
              speed_demon: { name: 'Speed Demon', description: 'Complete a challenge in under 10 seconds' },
              perfectionist: { name: 'Perfectionist', description: 'Achieve 100% accuracy' },
              scholar: { name: 'Code Scholar', description: 'Complete 10 challenges' }
            }).map(([id, achievement]) => {
              const isUnlocked = (stats?.achievements || []).includes(id);
              return (
                <div
                  key={id}
                  className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                >
                  <div className="achievement-icon">
                    <i className={`fa-solid ${getAchievementIcon(id)}`}></i>
                  </div>
                  <div className="achievement-info">
                    <span className="achievement-name">{achievement.name}</span>
                    <span className="achievement-desc">{achievement.description}</span>
                  </div>
                  {isUnlocked && (
                    <div className="achievement-status">
                      <i className="fa-solid fa-check-circle"></i>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeStats;
