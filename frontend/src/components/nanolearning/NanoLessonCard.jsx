import { useState, useEffect, useRef } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import './NanoLessonCard.css';

const NanoLessonCard = ({
  lesson,
  index,
  isCompleted,
  isLocked,
  isCurrent,
  onStart,
  totalDuration = 300,
  progress = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  // Entrance animation
  const entranceAnimation = useSpring({
    from: {
      opacity: 0,
      transform: 'translateY(30px) scale(0.95)'
    },
    to: {
      opacity: 1,
      transform: 'translateY(0) scale(1)'
    },
    config: config.stiff,
    delay: index * 100
  });

  // Hover animation
  const hoverAnimation = useSpring({
    transform: isHovered && !isLocked
      ? 'translateY(-8px) scale(1.02)'
      : 'translateY(0) scale(1)',
    boxShadow: isHovered && !isLocked
      ? '0 20px 40px rgba(102, 126, 234, 0.2)'
      : '0 4px 20px rgba(0, 0, 0, 0.08)',
    config: config.stiff
  });

  // Progress animation
  const progressAnimation = useSpring({
    width: `${progress}%`,
    config: { duration: 1000 }
  });

  // Status icon pulse
  const statusPulse = useSpring({
    from: { scale: 1, opacity: 0.8 },
    to: async (next) => {
      while (true) {
        await next({ scale: 1.1, opacity: 1 });
        await next({ scale: 1, opacity: 0.8 });
      }
    },
    config: { duration: 1500 }
  });

  const formatDuration = (seconds) => {
    const mins = Math.ceil(seconds / 60);
    return mins < 5 ? '5 min' : `${mins} min`;
  };

  const getStatusIcon = () => {
    if (isCompleted) {
      return (
        <animated.div style={statusPulse} className="status-icon completed">
          <i className="fa-solid fa-check-circle"></i>
        </animated.div>
      );
    }
    if (isCurrent) {
      return (
        <animated.div style={statusPulse} className="status-icon current">
          <i className="fa-solid fa-play-circle"></i>
        </animated.div>
      );
    }
    if (isLocked) {
      return (
        <div className="status-icon locked">
          <i className="fa-solid fa-lock"></i>
        </div>
      );
    }
    return (
      <div className="status-icon pending">
        <span>{index + 1}</span>
      </div>
    );
  };

  const getCardClass = () => {
    let classes = 'nano-lesson-card';
    if (isCompleted) classes += ' completed';
    if (isCurrent) classes += ' current';
    if (isLocked) classes += ' locked';
    if (isHovered && !isLocked) classes += ' hovered';
    return classes;
  };

  const getThumbnailUrl = () => {
    if (lesson.thumbnail) return lesson.thumbnail;
    // Generate gradient based on index
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];
    return gradients[index % gradients.length];
  };

  return (
    <animated.div
      ref={cardRef}
      style={{ ...entranceAnimation, ...hoverAnimation }}
      className={getCardClass()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => !isLocked && onStart(lesson)}
    >
      {/* Thumbnail */}
      <div
        className="nano-lesson-thumbnail"
        style={{ background: getThumbnailUrl() }}
      >
        {getStatusIcon()}

        {/* Duration Badge */}
        <div className="nano-duration-badge">
          <i className="fa-regular fa-clock"></i>
          <span>{formatDuration(lesson.duration || totalDuration)}</span>
        </div>

        {/* Play Overlay on Hover */}
        {isHovered && !isLocked && !isCompleted && (
          <div className="nano-play-overlay">
            <div className="nano-play-button">
              <i className="fa-solid fa-play"></i>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {progress > 0 && !isCompleted && (
          <div className="nano-progress-wrapper">
            <animated.div
              className="nano-progress-bar"
              style={progressAnimation}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="nano-lesson-content">
        {/* Lesson Number */}
        <div className="nano-lesson-number">
          Lesson {index + 1}
        </div>

        {/* Title */}
        <h3 className="nano-lesson-title">
          {lesson.title}
        </h3>

        {/* Description */}
        {lesson.description && (
          <p className="nano-lesson-description">
            {lesson.description}
          </p>
        )}

        {/* Meta Info */}
        <div className="nano-lesson-meta">
          {/* 5-Min Indicator */}
          <div className="nano-5min-indicator">
            <i className="fa-solid fa-bolt"></i>
            <span>5-min nano</span>
          </div>

          {/* Points */}
          {lesson.points && (
            <div className="nano-points">
              <i className="fa-solid fa-star"></i>
              <span>{lesson.points} pts</span>
            </div>
          )}

          {/* Difficulty */}
          {lesson.difficulty && (
            <div className={`nano-difficulty ${lesson.difficulty}`}>
              <span>{lesson.difficulty}</span>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="nano-status-badge">
          {isCompleted ? (
            <>
              <i className="fa-solid fa-check-circle"></i>
              Completed
            </>
          ) : isCurrent ? (
            <>
              <i className="fa-solid fa-play-circle"></i>
              In Progress
            </>
          ) : isLocked ? (
            <>
              <i className="fa-solid fa-lock"></i>
              Locked
            </>
          ) : (
            <>
              <i className="fa-regular fa-circle"></i>
              Ready to Start
            </>
          )}
        </div>
      </div>

      {/* Start Button (shown on hover) */}
      {isHovered && !isLocked && !isCompleted && (
        <div className="nano-start-hint">
          <span>Click to start</span>
          <i className="fa-solid fa-arrow-right"></i>
        </div>
      )}
    </animated.div>
  );
};

export default NanoLessonCard;
