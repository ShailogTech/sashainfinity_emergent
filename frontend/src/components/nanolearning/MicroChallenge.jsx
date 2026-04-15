import { useState, useEffect, useCallback } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import './MicroChallenge.css';

const STREAK_MULTIPLIERS = [1, 1.2, 1.5, 2, 2.5, 3];
const STREAK_FIRE_COLORS = ['#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#6366f1'];

const MicroChallenge = ({
  challenge,
  streak = 0,
  onSubmit,
  onClose,
  onNextLesson,
  isLastChallenge = false
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  // Timer animation
  const timerProps = useSpring({
    to: {
      width: `${(timeLeft / 30) * 100}%`,
      backgroundColor: timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? '#f59e0b' : '#10b981'
    },
    config: { duration: 1000 }
  });

  // Card entrance animation
  const cardAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(50px) scale(0.9)' },
    to: { opacity: 1, transform: 'translateY(0) scale(1)' },
    config: config.stiff
  });

  // Result animation
  const resultAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.8)' },
    to: { opacity: result ? 1 : 0, transform: result ? 'scale(1)' : 'scale(0.8)' },
    config: config.wobbly
  });

  // Streak fire animation
  const streakAnimation = useSpring({
    from: { transform: 'rotate(0deg) scale(1)' },
    to: { transform: 'rotate(10deg) scale(1.1)' },
    config: { duration: 500 },
    loop: { reverse: true }
  });

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const handleSubmit = useCallback(async () => {
    if (selectedAnswer === null || isSubmitted) return;

    setIsSubmitted(true);
    const timeTaken = 30 - timeLeft;
    const isCorrect = selectedAnswer === challenge.correctAnswer;
    const multiplier = isCorrect ? STREAK_MULTIPLIERS[Math.min(streak, STREAK_MULTIPLIERS.length - 1)] : 1;
    const basePoints = challenge.points || 100;
    const pointsEarned = Math.floor(basePoints * multiplier);

    const resultData = {
      is_correct: isCorrect,
      points_earned: isCorrect ? pointsEarned : 0,
      base_points: basePoints,
      correct_answer: challenge.correctAnswer,
      selected_answer: selectedAnswer,
      time_taken: timeTaken,
      explanation: challenge.explanation,
      streak: isCorrect ? streak + 1 : 0,
      achievement: isCorrect ? getAchievement(streak + 1) : null
    };

    setResult(resultData);

    if (isCorrect) {
      setConfettiActive(true);
      setTimeout(() => setConfettiActive(false), 2000);
    }

    // Auto-show explanation after a delay
    setTimeout(() => setShowExplanation(true), 1500);

    try {
      await fetch('/api/nano/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'demo-user',
          challenge_id: challenge.id,
          challenge_type: 'micro-challenge',
          answer: selectedAnswer,
          time_taken: timeTaken,
          is_correct: isCorrect,
          points_earned: pointsEarned
        })
      });
    } catch (error) {
      console.error('Submission error:', error);
    }

    setTimeout(() => onSubmit(resultData), 3000);
  }, [selectedAnswer, isSubmitted, timeLeft, challenge, streak, onSubmit]);

  const getAchievement = (currentStreak) => {
    if (currentStreak === 3) {
      return { name: 'On Fire!', icon: 'fa-solid fa-fire', color: '#ef4444' };
    } else if (currentStreak === 5) {
      return { name: 'Unstoppable!', icon: 'fa-solid fa-bolt', color: '#f59e0b' };
    } else if (currentStreak === 10) {
      return { name: 'Legendary!', icon: 'fa-solid fa-crown', color: '#8b5cf6' };
    }
    return null;
  };

  const getAnswerClass = (index) => {
    if (!isSubmitted) {
      return selectedAnswer === index ? 'selected' : '';
    }
    if (index === challenge.correctAnswer) return 'correct';
    if (index === selectedAnswer && !result?.is_correct) return 'incorrect';
    return '';
  };

  const getAnswerIcon = (index) => {
    if (!isSubmitted) return null;
    if (index === challenge.correctAnswer) return <i className="fa-solid fa-check-circle"></i>;
    if (index === selectedAnswer && !result?.is_correct) return <i className="fa-solid fa-times-circle"></i>;
    return null;
  };

  const getStreakColor = () => {
    const level = Math.min(Math.floor(streak / 2), STREAK_FIRE_COLORS.length - 1);
    return STREAK_FIRE_COLORS[level];
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="micro-challenge-overlay">
      <animated.div style={cardAnimation} className="micro-challenge-container glassmorphism-lg">
        {/* Header */}
        <div className="micro-challenge-header">
          <div className="micro-challenge-type">
            <i className="fa-solid fa-bolt"></i>
            <span>Quick Challenge</span>
          </div>
          <div className="micro-challenge-timer">
            <animated.div className="timer-bar" style={timerProps} />
            <span className={`timer-text ${timeLeft <= 10 ? 'urgent' : ''}`}>
              <i className="fa-regular fa-clock"></i> {formatTime(timeLeft)}
            </span>
          </div>
          <button className="micro-close-btn" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {/* Streak Display */}
        {streak > 0 && (
          <div className="micro-streak-display">
            <animated.div style={streakAnimation}>
              <i className="fa-solid fa-fire" style={{ color: getStreakColor() }}></i>
            </animated.div>
            <div className="streak-info">
              <span className="streak-count">{streak} streak!</span>
              <span className="streak-multiplier">
                x{STREAK_MULTIPLIERS[Math.min(streak, STREAK_MULTIPLIERS.length - 1)].toFixed(1)} bonus
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="micro-challenge-content">
          {/* Points Badge */}
          <div className="micro-points-badge">
            <i className="fa-solid fa-star"></i>
            <span>{challenge.points || 100}</span>
            <span className="points-label">points</span>
          </div>

          {/* Question */}
          <h3 className="micro-question">{challenge.question}</h3>

          {/* Difficulty Indicator */}
          {challenge.difficulty && (
            <div className="micro-difficulty">
              <span className={`difficulty-badge ${challenge.difficulty}`}>
                {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
              </span>
              <span className="difficulty-label">Difficulty</span>
            </div>
          )}

          {/* Options */}
          <div className="micro-options">
            {challenge.options.map((option, index) => (
              <button
                key={index}
                className={`micro-option ${getAnswerClass(index)}`}
                onClick={() => !isSubmitted && setSelectedAnswer(index)}
                disabled={isSubmitted}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="option-text">{option}</span>
                <span className="option-icon">{getAnswerIcon(index)}</span>
                {getAnswerClass(index) === 'selected' && (
                  <div className="option-glow"></div>
                )}
              </button>
            ))}
          </div>

          {/* Submit Button */}
          {!isSubmitted && (
            <button
              className="micro-submit-btn"
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
            >
              <i className="fa-solid fa-paper-plane"></i>
              Submit Answer
            </button>
          )}

          {/* Result */}
          {result && (
            <animated.div style={resultAnimation} className={`micro-feedback ${result.is_correct ? 'success' : 'error'}`}>
              <div className="feedback-icon">
                <i className={`fa-solid ${result.is_correct ? 'fa-trophy' : 'fa-lightbulb'}`}></i>
              </div>
              <h4>{result.is_correct ? 'Excellent!' : 'Good effort!'}</h4>
              <p className="feedback-points">
                {result.is_correct
                  ? `+${result.points_earned} points earned!`
                  : `The correct answer was ${String.fromCharCode(65 + result.correct_answer)}`
                }
              </p>
              {result.achievement && (
                <div className="feedback-achievement" style={{ '--achievement-color': result.achievement.color }}>
                  <i className={result.achievement.icon}></i>
                  <span>{result.achievement.name}</span>
                </div>
              )}
              <div className="feedback-stats">
                <span><i className="fa-regular fa-clock"></i> {result.time_taken}s</span>
                <span><i className="fa-solid fa-fire"></i> Streak: {result.streak}</span>
              </div>
            </animated.div>
          )}

          {/* Explanation */}
          {showExplanation && challenge.explanation && (
            <div className={`micro-explanation ${showExplanation ? 'visible' : ''}`}>
              <h5>
                <i className="fa-solid fa-lightbulb"></i>
                Explanation
              </h5>
              <p>{challenge.explanation}</p>
            </div>
          )}

          {/* Next Button (when not last challenge) */}
          {isSubmitted && !isLastChallenge && (
            <button className="micro-next-btn" onClick={onNextLesson}>
              <span>Next Nano Lesson</span>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          )}

          {/* Complete Button (when last challenge) */}
          {isSubmitted && isLastChallenge && (
            <button className="micro-complete-btn" onClick={onClose}>
              <i className="fa-solid fa-check-circle"></i>
              <span>Complete Module</span>
            </button>
          )}
        </div>
      </animated.div>

      {/* Confetti Effect */}
      {confettiActive && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ['#f4911a', '#667eea', '#10b981', '#f59e0b', '#ec4899'][Math.floor(Math.random() * 5)]
              }}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MicroChallenge;
