import { useState, useEffect } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import './NanoProgress.css';

const NanoProgress = ({
  totalLessons = 10,
  completedLessons = 0,
  currentStreak = 0,
  longestStreak = 0,
  totalPoints = 0,
  estimatedTimeRemaining = 0,
  showDetails = true
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  // Progress bar animation
  const progressBarAnimation = useSpring({
    width: mounted ? `${progressPercent}%` : '0%',
    config: { duration: 1500, easing: t => t * (2 - t) }
  });

  // Counter animations
  const counterAnimation = useSpring({
    from: { value: 0 },
    to: { value: completedLessons },
    config: { duration: 1000 }
  });

  const streakAnimation = useSpring({
    from: { value: 0 },
    to: { value: currentStreak },
    config: { duration: 1000 }
  });

  const pointsAnimation = useSpring({
    from: { value: 0 },
    to: { value: totalPoints },
    config: { duration: 1200 }
  });

  // Fire animation for streak
  const fireAnimation = useSpring({
    from: {
      transform: 'rotate(0deg) scale(1)',
      opacity: 0.8
    },
    to: async (next) => {
      while (true) {
        await next({
          transform: 'rotate(15deg) scale(1.1)',
          opacity: 1
        });
        await next({
          transform: 'rotate(-15deg) scale(1.05)',
          opacity: 0.9
        });
        await next({
          transform: 'rotate(0deg) scale(1)',
          opacity: 0.8
        });
      }
    },
    config: { duration: 2000 }
  });

  // Glow effect for progress
  const glowAnimation = useSpring({
    from: {
      backgroundPosition: '0% 50%'
    },
    to: async (next) => {
      while (true) {
        await next({
          backgroundPosition: '100% 50%'
        });
        await next({
          backgroundPosition: '0% 50%'
        });
      }
    },
    config: { duration: 3000 }
  });

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s remaining`;
    const mins = Math.ceil(seconds / 60);
    if (mins < 60) return `${mins}m remaining`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h remaining`;
  };

  const getStreakColor = () => {
    if (currentStreak >= 10) return '#8b5cf6';
    if (currentStreak >= 7) return '#ec4899';
    if (currentStreak >= 5) return '#ef4444';
    if (currentStreak >= 3) return '#f59e0b';
    return '#fbbf24';
  };

  const getStreakLabel = () => {
    if (currentStreak >= 10) return 'Legendary!';
    if (currentStreak >= 7) return 'On Fire!';
    if (currentStreak >= 5) return 'Hot Streak!';
    if (currentStreak >= 3) return 'Building Up!';
    if (currentStreak >= 1) return 'Keep Going!';
    return 'Start Your Streak!';
  };

  const getMilestoneReward = (index) => {
    const milestones = [3, 5, 7, 10];
    if (milestones.includes(index)) {
      if (index === 3) return { icon: 'fa-solid fa-fire', color: '#f59e0b', label: 'Streak Starter' };
      if (index === 5) return { icon: 'fa-solid fa-bolt', color: '#ef4444', label: 'Unstoppable' };
      if (index === 7) return { icon: 'fa-solid fa-fire-flame-curved', color: '#ec4899', label: 'On Fire' };
      if (index === 10) return { icon: 'fa-solid fa-crown', color: '#8b5cf6', label: 'Legendary' };
    }
    return null;
  };

  return (
    <div className="nano-progress">
      {/* Main Progress Card */}
      <div className="nano-progress-card glassmorphism-md">
        {/* Header */}
        <div className="nano-progress-header">
          <div className="nano-progress-title">
            <i className="fa-solid fa-chart-line"></i>
            <span>Your Progress</span>
          </div>
          <div className="nano-progress-percentage">
            <animated.span>
              {progressBarAnimation.width.to(width => Math.round(parseFloat(width)))}
            </animated.span>
            <span>%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="nano-progress-bar-container">
          <animated.div
            className="nano-progress-bar-fill"
            style={{
              ...progressBarAnimation,
              background: 'linear-gradient(90deg, #667eea, #764ba2, #667eea)',
              backgroundSize: '200% 100%',
              ...glowAnimation
            }}
          >
            <div className="nano-progress-glow"></div>
          </animated.div>

          {/* Milestone Markers */}
          <div className="nano-progress-milestones">
            {[...Array(totalLessons)].map((_, index) => {
              const lessonNumber = index + 1;
              const isCompleted = lessonNumber <= completedLessons;
              const isCurrent = lessonNumber === completedLessons + 1;
              const milestone = getMilestoneReward(lessonNumber);

              return (
                <div
                  key={index}
                  className={`nano-milestone ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                  style={{ left: `${(index / (totalLessons - 1)) * 100}%` }}
                  title={`Lesson ${lessonNumber}`}
                >
                  {milestone && isCompleted && (
                    <div
                      className="nano-milestone-reward"
                      style={{ backgroundColor: milestone.color }}
                    >
                      <i className={milestone.icon}></i>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Grid */}
        {showDetails && (
          <div className="nano-progress-stats">
            {/* Completed */}
            <div className="nano-stat">
              <div className="nano-stat-icon completed">
                <i className="fa-solid fa-check-circle"></i>
              </div>
              <div className="nano-stat-info">
                <animated.div className="nano-stat-value">
                  {counterAnimation.value.to(value => Math.round(value))}
                </animated.div>
                <div className="nano-stat-label">Completed</div>
              </div>
              <div className="nano-stat-total">/ {totalLessons}</div>
            </div>

            {/* Streak */}
            <div className="nano-stat">
              <animated.div
                className="nano-stat-icon streak"
                style={{ color: getStreakColor() }}
              >
                <animated.i style={fireAnimation} className="fa-solid fa-fire" />
              </animated.div>
              <div className="nano-stat-info">
                <animated.div className="nano-stat-value">
                  {streakAnimation.value.to(value => Math.round(value))}
                </animated.div>
                <div className="nano-stat-label">{getStreakLabel()}</div>
              </div>
              {longestStreak > currentStreak && (
                <div className="nano-stat-best">Best: {longestStreak}</div>
              )}
            </div>

            {/* Points */}
            <div className="nano-stat">
              <div className="nano-stat-icon points">
                <i className="fa-solid fa-star"></i>
              </div>
              <div className="nano-stat-info">
                <animated.div className="nano-stat-value">
                  {pointsAnimation.value.to(value => Math.round(value))}
                </animated.div>
                <div className="nano-stat-label">Points</div>
              </div>
            </div>

            {/* Time Remaining */}
            <div className="nano-stat">
              <div className="nano-stat-icon time">
                <i className="fa-regular fa-clock"></i>
              </div>
              <div className="nano-stat-info">
                <div className="nano-stat-value">
                  {formatTime(estimatedTimeRemaining)}
                </div>
                <div className="nano-stat-label">Est. Remaining</div>
              </div>
            </div>
          </div>
        )}

        {/* Achievement Badges */}
        {showDetails && completedLessons > 0 && (
          <div className="nano-achievements">
            <div className="nano-achievements-title">
              <i className="fa-solid fa-trophy"></i>
              <span>Achievements</span>
            </div>
            <div className="nano-achievements-list">
              {/* First Lesson */}
              {completedLessons >= 1 && (
                <div className="nano-achievement-badge unlocked">
                  <i className="fa-solid fa-play"></i>
                  <span>First Steps</span>
                </div>
              )}
              {/* Streak Starter */}
              {currentStreak >= 3 && (
                <div className="nano-achievement-badge unlocked">
                  <i className="fa-solid fa-fire"></i>
                  <span>Streak Starter</span>
                </div>
              )}
              {/* Halfway */}
              {completedLessons >= totalLessons / 2 && (
                <div className="nano-achievement-badge unlocked">
                  <i className="fa-solid fa-flag-checkered"></i>
                  <span>Halfway There</span>
                </div>
              )}
              {/* Almost Done */}
              {completedLessons >= totalLessons - 1 && (
                <div className="nano-achievement-badge unlocked">
                  <i className="fa-solid fa-medal"></i>
                  <span>Almost There</span>
                </div>
              )}
              {/* Completed */}
              {completedLessons >= totalLessons && (
                <div className="nano-achievement-badge unlocked legendary">
                  <i className="fa-solid fa-crown"></i>
                  <span>Complete!</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Motivational Message */}
        <div className="nano-progress-message">
          {progressPercent === 0 && "Start your learning journey today!"}
          {progressPercent > 0 && progressPercent < 25 && "Great start! Keep the momentum going!"}
          {progressPercent >= 25 && progressPercent < 50 && "You're making progress! Stay focused!"}
          {progressPercent >= 50 && progressPercent < 75 && "Halfway there! You're doing amazing!"}
          {progressPercent >= 75 && progressPercent < 100 && "Almost done! Finish strong!"}
          {progressPercent === 100 && "Congratulations! You've completed the course!"}
        </div>
      </div>

      {/* Mini Progress (compact version) */}
      <div className="nano-progress-mini">
        <div className="nano-mini-bar">
          <animated.div
            className="nano-mini-fill"
            style={progressBarAnimation}
          />
        </div>
        <div className="nano-mini-text">
          <animated.span>
            {counterAnimation.value.to(value => Math.round(value))}
          </animated.span>
          /{totalLessons} lessons
        </div>
      </div>
    </div>
  );
};

export default NanoProgress;
