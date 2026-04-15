import { useState, useEffect } from "react";
import GlassCard from "@/components/ui/GlassCard";

export default function FillBlankChallenge({ challenge, onSubmit, onClose }) {
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(challenge.time_limit || 45);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);

  const blanks = challenge.blanks || [];
  const maxHints = blanks.length;

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const handleAnswerChange = (blankId, value) => {
    setAnswers({ ...answers, [blankId]: value });
  };

  const handleShowHint = (blankId) => {
    const blank = blanks.find(b => b.id === blankId);
    if (blank && !blank.hint_shown) {
      blank.hint_shown = true;
      setHintsUsed(hintsUsed + 1);
      setAnswers({ ...answers, [blankId]: blank.hint || "" });
    }
  };

  const handleSubmit = async () => {
    if (isSubmitted) return;

    setIsSubmitted(true);
    const timeTaken = (challenge.time_limit || 45) - timeLeft;

    // Check answers
    let correctCount = 0;
    blanks.forEach(blank => {
      const userAnswer = (answers[blank.id] || "").toLowerCase().trim();
      const correctAnswer = blank.answer.toLowerCase().trim();
      if (userAnswer === correctAnswer || blank.accepted_answers?.some(a => a.toLowerCase() === userAnswer)) {
        correctCount++;
      }
    });

    const isPerfect = correctCount === blanks.length;
    const pointsPerBlank = (challenge.points || 12) / blanks.length;
    const pointsEarned = Math.floor(correctCount * pointsPerBlank * (1 - (hintsUsed * 0.1)));

    try {
      const response = await fetch('/api/nano/challenges/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'demo-user',
          chapter_id: challenge.chapter_id,
          challenge_id: challenge.id,
          answers: answers,
          correct_count: correctCount,
          time_taken: timeTaken
        })
      });

      const data = await response.json();
      setResult({ ...data, correctCount, totalBlanks: blanks.length });
      onSubmit(data);
    } catch (error) {
      console.error('Challenge submission error:', error);
      setResult({
        is_correct: isPerfect,
        points_earned: Math.max(0, pointsEarned),
        correct_count: correctCount,
        total_blanks: blanks.length,
        time_taken: timeTaken,
        hints_used: hintsUsed
      });
      onSubmit(result);
    }
  };

  const resetChallenge = () => {
    setAnswers({});
    setIsSubmitted(false);
    setResult(null);
    setHintsUsed(0);
    setTimeLeft(challenge.time_limit || 45);
    blanks.forEach(b => b.hint_shown = false);
  };

  const getBlankStatus = (blank) => {
    if (!isSubmitted) return '';
    const userAnswer = (answers[blank.id] || "").toLowerCase().trim();
    const correctAnswer = blank.answer.toLowerCase().trim();
    const isCorrect = userAnswer === correctAnswer ||
      blank.accepted_answers?.some(a => a.toLowerCase() === userAnswer);
    return isCorrect ? 'correct' : 'incorrect';
  };

  const getCorrectAnswer = (blank) => {
    return blank.answer;
  };

  const progressPercent = blanks.length > 0
    ? (Object.keys(answers).filter(k => answers[k]).length / blanks.length) * 100
    : 0;

  return (
    <div className="nano-challenge-overlay">
      <GlassCard variant="accent" className="nano-fillblank-container">
        <div className="nano-challenge-header">
          <div className="nano-challenge-info">
            <span className="nano-challenge-type">
              <i className="fa-solid fa-pen"></i> Fill in the Blank
            </span>
            <div className="nano-challenge-timer">
              <i className="fa-solid fa-clock"></i>
              <span className={timeLeft <= 15 ? 'urgent' : ''}>{timeLeft}s</span>
            </div>
          </div>
          <div className="nano-challenge-actions">
            <span className="nano-challenge-points">
              <i className="fa-solid fa-star"></i> {challenge.points || 12} points
            </span>
            <button className="nano-challenge-close" onClick={onClose}>
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        </div>

        {!isSubmitted ? (
          <div className="nano-challenge-content">
            <div className="nano-challenge-description">
              <h3>{challenge.question || "Fill in the missing words:"}</h3>
              {challenge.hint && (
                <div className="nano-challenge-hint">
                  <i className="fa-solid fa-lightbulb"></i>
                  <span>Tip: {challenge.hint}</span>
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
              <span>{Object.keys(answers).filter(k => answers[k]).length} / {blanks.length} answered</span>
            </div>

            {/* Fill in the Blanks */}
            <div className="nano-fillblank-content">
              {challenge.context && (
                <div className="nano-context-text">
                  {challenge.context}
                </div>
              )}

              <div className="nano-blanks-list">
                {blanks.map((blank, index) => {
                  const status = getBlankStatus(blank);
                  return (
                    <div key={blank.id} className={`nano-blank-item ${status}`}>
                      <div className="nano-blank-number">{index + 1}</div>
                      <div className="nano-blank-content">
                        {blank.before && <span className="nano-blank-before">{blank.before}</span>}
                        <div className="nano-blank-input-wrapper">
                          <input
                            type="text"
                            className={`nano-blank-input ${status}`}
                            value={answers[blank.id] || ""}
                            onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
                            placeholder="Type answer..."
                            disabled={isSubmitted}
                            autoComplete="off"
                          />
                          {!isSubmitted && blank.hint && (
                            <button
                              className="nano-hint-btn"
                              onClick={() => handleShowHint(blank.id)}
                              title="Show hint"
                            >
                              <i className="fa-solid fa-lightbulb"></i>
                            </button>
                          )}
                          {isSubmitted && status === 'incorrect' && (
                            <div className="nano-correct-answer">
                              <i className="fa-solid fa-check"></i> {getCorrectAnswer(blank)}
                            </div>
                          )}
                        </div>
                        {blank.after && <span className="nano-blank-after">{blank.after}</span>}
                      </div>
                      {isSubmitted && status === 'correct' && (
                        <div className="nano-blank-status correct">
                          <i className="fa-solid fa-check"></i>
                        </div>
                      )}
                      {isSubmitted && status === 'incorrect' && (
                        <div className="nano-blank-status incorrect">
                          <i className="fa-solid fa-times"></i>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="nano-challenge-footer">
              <button
                className="nano-reset-btn"
                onClick={resetChallenge}
                disabled={isSubmitted}
              >
                <i className="fa-solid fa-rotate"></i> Reset
              </button>
              <button
                className="nano-submit-btn"
                onClick={handleSubmit}
                disabled={Object.keys(answers).filter(k => answers[k]).length === 0 || isSubmitted}
              >
                <i className="fa-solid fa-paper-plane"></i> Check Answers
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
              {result?.is_correct ? 'Perfect!' : `${result?.correct_count}/${result?.total_blanks} Correct`}
            </h4>
            <p>
              {result?.is_correct
                ? `You earned ${result?.points_earned} points! All answers correct.`
                : `You earned ${result?.points_earned} points. Some answers need review.`
              }
            </p>
            <div className="nano-result-stats">
              <span><i className="fa-solid fa-check"></i> Correct: {result?.correct_count}</span>
              <span><i className="fa-solid fa-clock"></i> {result?.time_taken}s</span>
              {result?.hints_used > 0 && (
                <span><i className="fa-solid fa-lightbulb"></i> {result?.hints_used} hints</span>
              )}
              <span><i className="fa-solid fa-star"></i> +{result?.points_earned} pts</span>
            </div>
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
