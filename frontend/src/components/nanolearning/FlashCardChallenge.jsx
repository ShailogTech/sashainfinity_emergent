import { useState, useEffect } from "react";
import GlassCard from "@/components/ui/GlassCard";

export default function FlashCardChallenge({ challenge, onSubmit, onClose }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState([]);
  const [unknownCards, setUnknownCards] = useState([]);
  const [timeLeft, setTimeLeft] = useState(challenge.time_limit || 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const cards = challenge.cards || [];

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMarkKnown = () => {
    setKnownCards([...knownCards, currentCard]);
    nextCard();
  };

  const handleMarkUnknown = () => {
    setUnknownCards([...unknownCards, currentCard]);
    nextCard();
  };

  const nextCard = () => {
    setIsFlipped(false);
    if (currentCard < cards.length - 1) {
      setCurrentCard(currentCard + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (isSubmitted) return;

    setIsSubmitted(true);
    const timeTaken = (challenge.time_limit || 60) - timeLeft;
    const score = Math.round((knownCards.length / cards.length) * 100);
    const pointsEarned = Math.round((knownCards.length / cards.length) * (challenge.points || 15));

    try {
      const response = await fetch('/api/nano/challenges/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'demo-user',
          chapter_id: challenge.chapter_id,
          challenge_id: challenge.id,
          known_count: knownCards.length,
          unknown_count: unknownCards.length,
          time_taken: timeTaken
        })
      });

      const data = await response.json();
      setResult({ ...data, score, knownCards, unknownCards });
      onSubmit(data);
    } catch (error) {
      console.error('Challenge submission error:', error);
      setResult({
        is_correct: score >= 70,
        points_earned: pointsEarned,
        score,
        known_count: knownCards.length,
        unknown_count: unknownCards.length,
        time_taken: timeTaken
      });
      onSubmit(result);
    }
  };

  const resetChallenge = () => {
    setCurrentCard(0);
    setIsFlipped(false);
    setKnownCards([]);
    setUnknownCards([]);
    setIsSubmitted(false);
    setResult(null);
    setTimeLeft(challenge.time_limit || 60);
  };

  const currentCardData = cards[currentCard];
  const progressPercent = ((currentCard + 1) / cards.length) * 100;

  return (
    <div className="nano-challenge-overlay">
      <GlassCard variant="primary" className="nano-flashcard-container">
        <div className="nano-challenge-header">
          <div className="nano-challenge-info">
            <span className="nano-challenge-type">
              <i className="fa-solid fa-layer-group"></i> Flash Cards
            </span>
            <div className="nano-challenge-timer">
              <i className="fa-solid fa-clock"></i>
              <span className={timeLeft <= 15 ? 'urgent' : ''}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
          <div className="nano-challenge-actions">
            <span className="nano-challenge-points">
              <i className="fa-solid fa-star"></i> {challenge.points || 15} points
            </span>
            <button className="nano-challenge-close" onClick={onClose}>
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        </div>

        {!isSubmitted ? (
          <div className="nano-challenge-content">
            <div className="nano-challenge-description">
              <h3>{challenge.question || "Test your knowledge!"}</h3>
              <p>Click the card to flip. Mark cards you know or need to review.</p>
            </div>

            {/* Progress */}
            <div className="nano-flashcard-progress">
              <div className="nano-progress-bar">
                <div
                  className="nano-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <span className="nano-progress-text">
                Card {currentCard + 1} of {cards.length}
              </span>
            </div>

            {/* Flash Card */}
            <div className={`nano-flashcard ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
              <div className="nano-flashcard-inner">
                <div className="nano-flashcard-front">
                  <div className="nano-flashcard-label">Question</div>
                  <div className="nano-flashcard-content">
                    {currentCardData?.front || currentCardData?.question}
                  </div>
                  <div className="nano-flashcard-hint">
                    <i className="fa-solid fa-hand-pointer"></i> Click to flip
                  </div>
                </div>
                <div className="nano-flashcard-back">
                  <div className="nano-flashcard-label">Answer</div>
                  <div className="nano-flashcard-content">
                    {currentCardData?.back || currentCardData?.answer}
                  </div>
                  {currentCardData?.explanation && (
                    <div className="nano-flashcard-explanation">
                      <i className="fa-solid fa-lightbulb"></i>
                      {currentCardData.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="nano-flashcard-actions">
              <button
                className="nano-flashcard-btn nano-unknown-btn"
                onClick={handleMarkUnknown}
              >
                <i className="fa-solid fa-times"></i>
                Still Learning
              </button>
              <button
                className="nano-flashcard-btn nano-known-btn"
                onClick={handleMarkKnown}
              >
                <i className="fa-solid fa-check"></i>
                Got It!
              </button>
            </div>

            {/* Card Navigation */}
            <div className="nano-flashcard-nav">
              <button
                className="nano-nav-btn"
                onClick={() => {
                  setIsFlipped(false);
                  if (currentCard > 0) setCurrentCard(currentCard - 1);
                }}
                disabled={currentCard === 0}
              >
                <i className="fa-solid fa-chevron-left"></i> Previous
              </button>
              <div className="nano-card-indicators">
                {cards.map((_, i) => (
                  <div
                    key={i}
                    className={`nano-card-dot ${i === currentCard ? 'active' : ''} ${i < currentCard || knownCards.includes(i) || unknownCards.includes(i) ? 'seen' : ''}`}
                  />
                ))}
              </div>
              <button
                className="nano-nav-btn"
                onClick={() => {
                  setIsFlipped(false);
                  if (currentCard < cards.length - 1) setCurrentCard(currentCard + 1);
                }}
                disabled={currentCard === cards.length - 1}
              >
                Next <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
        ) : (
          /* Results */
          <div className={`nano-challenge-result ${result?.is_correct ? 'success' : 'partial'}`}>
            <div className="nano-result-icon">
              <i className={`fa-solid ${result?.score >= 70 ? 'fa-trophy' : 'fa-medal'}`}></i>
            </div>
            <h4>
              {result?.score >= 70 ? 'Excellent!' : 'Good effort!'}
            </h4>
            <p>
              You knew {result?.known_count || 0} out of {cards.length} cards ({result?.score || 0}%)
            </p>
            <p className="nano-result-points">
              You earned <strong>{result?.points_earned || 0} points</strong>!
            </p>
            <div className="nano-result-stats">
              <span><i className="fa-solid fa-check"></i> Known: {result?.known_count || 0}</span>
              <span><i className="fa-solid fa-times"></i> Review: {result?.unknown_count || 0}</span>
              <span><i className="fa-solid fa-clock"></i> {result?.time_taken || 0}s</span>
            </div>
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
