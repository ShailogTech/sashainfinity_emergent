import React, { useState, useEffect, useCallback } from 'react';
import { useSpring, animated } from '@react-spring/web';
import './QuizChallenge.css';

const COMBO_MULTIPLIERS = [1, 1.2, 1.5, 2, 2.5, 3];

const QuizChallenge = ({ challenge, streak = 0, onSubmit, onClose }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const timerProps = useSpring({
    to: {
      width: `${(timeLeft / 30) * 100}%`,
      backgroundColor: timeLeft <= 10 ? '#ef4444' : '#f4911a'
    },
    config: { duration: 1000 }
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
    const multiplier = isCorrect ? COMBO_MULTIPLIERS[Math.min(streak, COMBO_MULTIPLIERS.length - 1)] : 1;
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
      achievement: isCorrect && streak === 4 ? {
        name: 'Hot Streak!',
        icon: 'fa-solid fa-fire-flame-curved'
      } : null
    };

    setResult(resultData);

    try {
      const response = await fetch('/api/challenges/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'demo-user',
          challenge_id: challenge.id,
          challenge_type: 'quiz',
          answer: selectedAnswer,
          time_taken: timeTaken,
          is_correct: isCorrect,
          points_earned: pointsEarned
        })
      });
    } catch (error) {
      console.error('Submission error:', error);
    }

    setTimeout(() => onSubmit(resultData), 1500);
  }, [selectedAnswer, isSubmitted, timeLeft, challenge, streak, onSubmit]);

  const getAnswerClass = (index) => {
    if (!isSubmitted) {
      return selectedAnswer === index ? 'selected' : '';
    }
    if (index === challenge.correctAnswer) return 'correct';
    if (index === selectedAnswer && !result?.is_correct) return 'incorrect';
    return '';
  };

  return (
    <div className="quiz-challenge-overlay">
      <div className="quiz-challenge-container glassmorphism-lg">
        <div className="quiz-challenge-header">
          <div className="quiz-challenge-type">
            <i className="fa-solid fa-brain"></i>
            <span>Quick Quiz</span>
          </div>
          <div className="quiz-challenge-timer">
            <animated.div className="timer-bar" style={timerProps} />
            <span className={`timer-text ${timeLeft <= 10 ? 'urgent' : ''}`}>
              <i className="fa-solid fa-clock"></i> {timeLeft}s
            </span>
          </div>
          <button className="quiz-close" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {streak > 0 && (
          <div className="streak-display">
            <i className="fa-solid fa-fire"></i>
            <span>{streak} answer streak!</span>
            <span className="streak-multiplier">x{COMBO_MULTIPLIERS[Math.min(streak, COMBO_MULTIPLIERS.length - 1)].toFixed(1)}</span>
          </div>
        )}

        <div className="quiz-challenge-content">
          <div className="quiz-points-badge">
            <i className="fa-solid fa-star"></i>
            {challenge.points || 100} points
          </div>

          <h3 className="quiz-question">{challenge.question}</h3>

          <div className="quiz-options">
            {challenge.options.map((option, index) => (
              <button
                key={index}
                className={`quiz-option ${getAnswerClass(index)}`}
                onClick={() => !isSubmitted && setSelectedAnswer(index)}
                disabled={isSubmitted}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="option-text">{option}</span>
                <span className="option-icon">
                  {isSubmitted && index === challenge.correctAnswer && (
                    <i className="fa-solid fa-check"></i>
                  )}
                  {isSubmitted && index === selectedAnswer && !result?.is_correct && (
                    <i className="fa-solid fa-times"></i>
                  )}
                </span>
              </button>
            ))}
          </div>

          {!isSubmitted && (
            <button
              className="quiz-submit-btn"
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
            >
              <i className="fa-solid fa-paper-plane"></i>
              Submit Answer
            </button>
          )}

          {result && (
            <div className={`quiz-feedback ${result.is_correct ? 'success' : 'error'}`}>
              <div className="feedback-icon">
                <i className={`fa-solid ${result.is_correct ? 'fa-trophy' : 'fa-lightbulb'}`}></i>
              </div>
              <h4>{result.is_correct ? 'Correct!' : 'Not quite!'}</h4>
              <p>
                {result.is_correct
                  ? `+${result.points_earned} points!`
                  : `The correct answer was ${String.fromCharCode(65 + result.correct_answer)}`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizChallenge;
