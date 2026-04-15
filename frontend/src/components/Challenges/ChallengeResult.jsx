import React, { useEffect, useState } from 'react';
import Confetti from './Confetti';
import './ChallengeResult.css';

const COMBO_MULTIPLIERS = [1, 1.2, 1.5, 2, 2.5, 3];

const ChallengeResult = ({ result, onClose, onNext, onRetry, streak, isLastChallenge }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animateScore, setAnimateScore] = useState(0);

  useEffect(() => {
    if (result?.is_correct) {
      setShowConfetti(true);
      const duration = 2000;
      const steps = 30;
      const increment = result.points_earned / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= result.points_earned) {
          setAnimateScore(result.points_earned);
          clearInterval(timer);
        } else {
          setAnimateScore(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [result]);

  if (!result) return null;

  const multiplier = COMBO_MULTIPLIERS[Math.min(streak, COMBO_MULTIPLIERS.length - 1)];
  const bonusPoints = Math.floor(result.base_points * (multiplier - 1));
  const timeBonus = result.time_taken < 10 ? Math.floor((10 - result.time_taken) * 2) : 0;
  const totalPoints = result.base_points + bonusPoints + timeBonus;

  return (
    <>
      {showConfetti && <Confetti />}
      <div className="challenge-result-overlay">
        <div className={`challenge-result-container ${result.is_correct ? 'success' : 'failure'}`}>
          <button className="result-close" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>

          <div className="result-header">
            <div className={`result-icon ${result.is_correct ? 'pulse' : 'shake'}`}>
              {result.is_correct ? (
                <i className="fa-solid fa-trophy"></i>
              ) : (
                <i className="fa-solid fa-brain"></i>
              )}
            </div>
            <h2 className={`result-title ${result.is_correct ? 'success' : 'failure'}`}>
              {result.is_correct ? 'Challenge Complete!' : 'Not Quite!'}
            </h2>
          </div>

          <div className="result-body">
            {result.is_correct && (
              <>
                <div className="score-display">
                  <div className="score-circle">
                    <span className="score-number">{animateScore}</span>
                    <span className="score-label">POINTS</span>
                  </div>
                </div>

                <div className="points-breakdown">
                  <div className="breakdown-item">
                    <span className="breakdown-label">Base Score</span>
                    <span className="breakdown-value">+{result.base_points}</span>
                  </div>

                  {streak > 0 && (
                    <div className="breakdown-item bonus">
                      <span className="breakdown-label">
                        <i className="fa-solid fa-fire"></i> Streak Bonus (x{streak})
                      </span>
                      <span className="breakdown-value">+{bonusPoints}</span>
                    </div>
                  )}

                  {timeBonus > 0 && (
                    <div className="breakdown-item bonus">
                      <span className="breakdown-label">
                        <i className="fa-solid fa-bolt"></i> Speed Bonus
                      </span>
                      <span className="breakdown-value">+{timeBonus}</span>
                    </div>
                  )}

                  <div className="breakdown-item total">
                    <span className="breakdown-label">Total</span>
                    <span className="breakdown-value">{totalPoints}</span>
                  </div>
                </div>
              </>
            )}

            {!result.is_correct && (
              <div className="correct-answer">
                <h3>
                  <i className="fa-solid fa-lightbulb"></i> Correct Answer
                </h3>
                <div className="answer-content">
                  {result.correct_answer}
                </div>
                {result.explanation && (
                  <div className="explanation">
                    <h4>
                      <i className="fa-solid fa-book-open"></i> Explanation
                    </h4>
                    <p>{result.explanation}</p>
                  </div>
                )}
              </div>
            )}

            <div className="result-stats">
              <div className="stat-item">
                <i className="fa-solid fa-clock"></i>
                <span>{result.time_taken}s</span>
              </div>
              {streak > 0 && result.is_correct && (
                <div className="stat-item streak">
                  <i className="fa-solid fa-fire"></i>
                  <span>{streak} streak</span>
                </div>
              )}
              <div className="stat-item">
                <i className="fa-solid fa-star"></i>
                <span>{result.accuracy || 100}% accuracy</span>
              </div>
            </div>

            {result.is_correct && result.achievement && (
              <div className="achievement-unlocked">
                <div className="achievement-icon">
                  <i className={result.achievement.icon}></i>
                </div>
                <div className="achievement-info">
                  <span className="achievement-title">Achievement Unlocked!</span>
                  <span className="achievement-name">{result.achievement.name}</span>
                </div>
              </div>
            )}
          </div>

          <div className="result-actions">
            {!result.is_correct && (
              <button className="result-btn retry" onClick={onRetry}>
                <i className="fa-solid fa-rotate"></i> Try Again
              </button>
            )}
            {result.is_correct && !isLastChallenge && (
              <button className="result-btn next" onClick={onNext}>
                <i className="fa-solid fa-arrow-right"></i> Next Challenge
              </button>
            )}
            {result.is_correct && isLastChallenge && (
              <button className="result-btn complete" onClick={onClose}>
                <i className="fa-solid fa-flag-checkered"></i> Complete Module
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChallengeResult;
