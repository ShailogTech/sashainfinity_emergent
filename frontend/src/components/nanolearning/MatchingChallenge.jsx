import { useState, useEffect } from "react";
import GlassCard from "@/components/ui/GlassCard";

export default function MatchingChallenge({ challenge, onSubmit, onClose }) {
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matches, setMatches] = useState([]);
  const [timeLeft, setTimeLeft] = useState(challenge.time_limit || 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [shuffledRight, setShuffledRight] = useState([]);

  const pairs = challenge.pairs || [];

  useEffect(() => {
    // Shuffle right side items
    const rightItems = [...pairs].sort(() => Math.random() - 0.5);
    setShuffledRight(rightItems);
  }, [pairs]);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const handleLeftClick = (itemId) => {
    if (matches.some(m => m.left === itemId)) return; // Already matched
    setSelectedLeft(selectedLeft === itemId ? null : itemId);

    // Check for match
    if (selectedRight !== null) {
      createMatch(itemId, selectedRight);
    }
  };

  const handleRightClick = (itemId) => {
    if (matches.some(m => m.right === itemId)) return; // Already matched
    setSelectedRight(selectedRight === itemId ? null : itemId);

    // Check for match
    if (selectedLeft !== null) {
      createMatch(selectedLeft, itemId);
    }
  };

  const createMatch = (leftId, rightId) => {
    setMatches([...matches, { left: leftId, right: rightId }]);
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  const removeMatch = (index) => {
    const newMatches = matches.filter((_, i) => i !== index);
    setMatches(newMatches);
  };

  const handleSubmit = async () => {
    if (isSubmitted) return;

    setIsSubmitted(true);
    const timeTaken = (challenge.time_limit || 60) - timeLeft;

    // Check matches
    let correctCount = 0;
    matches.forEach(match => {
      const pair = pairs.find(p => p.id === match.left);
      if (pair && pair.matchId === match.right) {
        correctCount++;
      }
    });

    const isPerfect = correctCount === pairs.length;
    const pointsPerMatch = (challenge.points || 20) / pairs.length;
    const pointsEarned = Math.floor(correctCount * pointsPerMatch);

    try {
      const response = await fetch('/api/nano/challenges/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'demo-user',
          chapter_id: challenge.chapter_id,
          challenge_id: challenge.id,
          matches: matches,
          correct_count: correctCount,
          time_taken: timeTaken
        })
      });

      const data = await response.json();
      setResult({ ...data, correctCount, totalPairs: pairs.length });
      onSubmit(data);
    } catch (error) {
      console.error('Challenge submission error:', error);
      setResult({
        is_correct: isPerfect,
        points_earned: pointsEarned,
        correct_count: correctCount,
        total_pairs: pairs.length,
        time_taken: timeTaken
      });
      onSubmit(result);
    }
  };

  const resetChallenge = () => {
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatches([]);
    setIsSubmitted(false);
    setResult(null);
    setTimeLeft(challenge.time_limit || 60);
    setShuffledRight([...pairs].sort(() => Math.random() - 0.5));
  };

  const getMatchStatus = (leftId, rightId) => {
    const match = matches.find(m => m.left === leftId);
    if (!match) return null;

    const pair = pairs.find(p => p.id === leftId);
    const isCorrect = pair && pair.matchId === rightId;
    return isCorrect ? 'correct' : 'incorrect';
  };

  const getLeftStatus = (leftId) => {
    const match = matches.find(m => m.left === leftId);
    if (!match) {
      return selectedLeft === leftId ? 'selected' : '';
    }

    const pair = pairs.find(p => p.id === leftId);
    const isCorrect = pair && pair.matchId === match.right;
    return isCorrect ? 'correct' : 'incorrect';
  };

  const getRightStatus = (rightId) => {
    const match = matches.find(m => m.right === rightId);
    if (!match) {
      return selectedRight === rightId ? 'selected' : '';
    }
    return 'matched';
  };

  const getMatchedPairLabel = (rightId) => {
    const pair = pairs.find(p => p.matchId === rightId);
    return pair?.label || '';
  };

  const progressPercent = pairs.length > 0 ? (matches.length / pairs.length) * 100 : 0;

  return (
    <div className="nano-challenge-overlay">
      <GlassCard variant="secondary" className="nano-matching-container">
        <div className="nano-challenge-header">
          <div className="nano-challenge-info">
            <span className="nano-challenge-type">
              <i className="fa-solid fa-link"></i> Match the Pairs
            </span>
            <div className="nano-challenge-timer">
              <i className="fa-solid fa-clock"></i>
              <span className={timeLeft <= 20 ? 'urgent' : ''}>{timeLeft}s</span>
            </div>
          </div>
          <div className="nano-challenge-actions">
            <span className="nano-challenge-points">
              <i className="fa-solid fa-star"></i> {challenge.points || 20} points
            </span>
            <button className="nano-challenge-close" onClick={onClose}>
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        </div>

        {!isSubmitted ? (
          <div className="nano-challenge-content">
            <div className="nano-challenge-description">
              <h3>{challenge.question || "Match the items on the left with their corresponding items on the right:"}</h3>
              {challenge.hint && (
                <div className="nano-challenge-hint">
                  <i className="fa-solid fa-lightbulb"></i>
                  <span>Hint: {challenge.hint}</span>
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="nano-progress-indicator-mini">
              <div className="nano-progress-bar-mini">
                <div
                  className="nano-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <span>{matches.length} / {pairs.length} matched</span>
            </div>

            {/* Matching Area */}
            <div className="nano-matching-area">
              {/* Left Column */}
              <div className="nano-matching-column nano-left-column">
                <h4>Items</h4>
                <div className="nano-matching-items">
                  {pairs.map((pair) => {
                    const status = getLeftStatus(pair.id);
                    const matchedRight = matches.find(m => m.left === pair.id)?.right;
                    const matchedLabel = matchedRight ? getMatchedPairLabel(matchedRight) : '';

                    return (
                      <button
                        key={pair.id}
                        className={`nano-matching-item ${status}`}
                        onClick={() => handleLeftClick(pair.id)}
                        disabled={matches.some(m => m.left === pair.id)}
                      >
                        <span className="nano-item-label">{pair.label}</span>
                        {matchedLabel && (
                          <span className="nano-matched-with">→ {matchedLabel}</span>
                        )}
                        {status === 'correct' && (
                          <i className="fa-solid fa-check nano-status-icon"></i>
                        )}
                        {status === 'incorrect' && (
                          <i className="fa-solid fa-times nano-status-icon"></i>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Connection Lines (Visual Only) */}
              <div className="nano-connection-lines">
                {matches.map((match, index) => {
                  const isCorrect = pairs.find(p => p.id === match.left)?.matchId === match.right;
                  return (
                    <div
                      key={index}
                      className={`nano-connection-line ${isCorrect ? 'correct' : 'incorrect'}`}
                    />
                  );
                })}
              </div>

              {/* Right Column */}
              <div className="nano-matching-column nano-right-column">
                <h4>Matches</h4>
                <div className="nano-matching-items">
                  {shuffledRight.map((pair) => {
                    const status = getRightStatus(pair.matchId);
                    return (
                      <button
                        key={pair.matchId}
                        className={`nano-matching-item ${status}`}
                        onClick={() => handleRightClick(pair.matchId)}
                        disabled={matches.some(m => m.right === pair.matchId)}
                      >
                        <span className="nano-item-label">{pair.matchLabel}</span>
                        {status === 'matched' && (
                          <i className="fa-solid fa-link nano-status-icon"></i>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Current Selection Display */}
            {(selectedLeft || selectedRight) && (
              <div className="nano-selection-display">
                <span>Selected: </span>
                {selectedLeft && (
                  <span className="nano-selection-tag">
                    {pairs.find(p => p.id === selectedLeft)?.label}
                  </span>
                )}
                {selectedRight && (
                  <span className="nano-selection-tag">
                    {shuffledRight.find(p => p.matchId === selectedRight)?.matchLabel}
                  </span>
                )}
                <span> - Click matching item to pair</span>
              </div>
            )}

            {/* Matched Items Review */}
            {matches.length > 0 && (
              <div className="nano-matched-review">
                <h5>Matched Pairs:</h5>
                <div className="nano-matched-list">
                  {matches.map((match, index) => {
                    const leftItem = pairs.find(p => p.id === match.left);
                    const rightItem = shuffledRight.find(p => p.matchId === match.right);
                    const isCorrect = leftItem?.matchId === match.right;

                    return (
                      <div key={index} className={`nano-matched-pair ${isCorrect ? 'correct' : 'incorrect'}`}>
                        <span>{leftItem?.label}</span>
                        <i className={`fa-solid ${isCorrect ? 'fa-check' : 'fa-times'}`}></i>
                        <span>{rightItem?.matchLabel}</span>
                        {!isSubmitted && (
                          <button
                            className="nano-unmatch-btn"
                            onClick={() => removeMatch(index)}
                          >
                            <i className="fa-solid fa-times"></i>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="nano-challenge-footer">
              <button
                className="nano-reset-btn"
                onClick={resetChallenge}
              >
                <i className="fa-solid fa-rotate"></i> Reset
              </button>
              <button
                className="nano-submit-btn"
                onClick={handleSubmit}
                disabled={matches.length === 0 || matches.length < pairs.length}
              >
                <i className="fa-solid fa-paper-plane"></i> Check Matches
              </button>
            </div>
          </div>
        ) : (
          /* Results */
          <div className={`nano-challenge-result ${result?.is_correct ? 'success' : 'partial'}`}>
            <div className="nano-result-icon">
              <i className={`fa-solid ${result?.is_correct ? 'fa-trophy' : 'fa-medal'}`}></i>
            </div>
            <h4>
              {result?.is_correct ? 'Perfect Match!' : `${result?.correct_count}/${result?.total_pairs} Correct`}
            </h4>
            <p>
              {result?.is_correct
                ? `You earned ${result?.points_earned} points! All pairs matched correctly.`
                : `You earned ${result?.points_earned} points. Some matches need correction.`
              }
            </p>
            <div className="nano-result-stats">
              <span><i className="fa-solid fa-check"></i> Correct: {result?.correct_count}</span>
              <span><i className="fa-solid fa-clock"></i> {result?.time_taken}s</span>
              <span><i className="fa-solid fa-star"></i> +{result?.points_earned} pts</span>
            </div>

            {/* Show Correct Matches */}
            {!result?.is_correct && (
              <div className="nano-correct-matches">
                <h5>Correct Matches:</h5>
                <div className="nano-correct-list">
                  {pairs.map((pair) => {
                    const rightItem = shuffledRight.find(p => p.matchId === pair.matchId);
                    const userMatch = matches.find(m => m.left === pair.id);
                    const wasCorrect = userMatch?.right === pair.matchId;

                    return (
                      <div key={pair.id} className={`nano-correct-item ${wasCorrect ? 'user-correct' : 'user-wrong'}`}>
                        <span className="nano-left-item">{pair.label}</span>
                        <i className="fa-solid fa-arrow-right"></i>
                        <span className="nano-right-item">{rightItem?.matchLabel}</span>
                        {wasCorrect ? (
                          <i className="fa-solid fa-check nano-result-icon"></i>
                        ) : (
                          <i className="fa-solid fa-times nano-result-icon"></i>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {challenge.explanation && (
              <div className="nano-result-explanation">
                <h5>Explanation:</h5>
                <p>{challenge.explanation}</p>
              </div>
            )}

            <div className="nano-result-actions">
              <button className="nano-reset-btn" onClick={resetChallenge}>
                <i className="fa-solid fa-redo"></i> Try Again
              </button>
              <button className="nano-continue-btn" onClick={onClose}>
                <i className="fa-solid fa-arrow-right"></i> Continue
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
