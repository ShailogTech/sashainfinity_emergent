import { useState, useEffect } from "react";

export default function QuizChallenge({ quiz, onSubmit, onClose }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(quiz.time_limit || 30);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const handleSubmit = async () => {
    if (selectedAnswer === null || isSubmitted) return;

    setIsSubmitted(true);
    const timeTaken = (quiz.time_limit || 30) - timeLeft;

    try {
      const response = await fetch('/api/nano/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'demo-user', // Replace with actual user ID
          chapter_id: quiz.chapter_id,
          quiz_id: quiz.id,
          selected_answer: selectedAnswer,
          time_taken: timeTaken
        })
      });

      const data = await response.json();
      setResult(data);
      onSubmit(data);
    } catch (error) {
      console.error('Quiz submission error:', error);
      // Fallback to client-side validation
      const isCorrect = selectedAnswer === quiz.correct_answer;
      setResult({
        is_correct: isCorrect,
        points_earned: isCorrect ? quiz.points || 10 : 0,
        correct_answer: quiz.correct_answer,
        selected_answer: selectedAnswer,
        time_taken: timeTaken
      });
      onSubmit(result);
    }
  };

  const getAnswerClass = (index) => {
    if (!isSubmitted) {
      return selectedAnswer === index ? 'selected' : '';
    }
    if (index === quiz.correct_answer) return 'correct';
    if (index === selectedAnswer && !result?.is_correct) return 'incorrect';
    return '';
  };

  const getAnswerIcon = (index) => {
    if (!isSubmitted) return null;
    if (index === quiz.correct_answer) return <i className="fa-solid fa-check"></i>;
    if (index === selectedAnswer && !result?.is_correct) return <i className="fa-solid fa-times"></i>;
    return null;
  };

  return (
    <div className="nano-quiz-overlay">
      <div className="nano-quiz-container">
        <div className="nano-quiz-header">
          <div className="nano-quiz-timer">
            <i className="fa-solid fa-clock"></i>
            <span className={timeLeft <= 10 ? 'urgent' : ''}>{timeLeft}s</span>
          </div>
          <button className="nano-quiz-close" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="nano-quiz-content">
          <div className="nano-quiz-points">
            <i className="fa-solid fa-star"></i> {quiz.points || 10} points
          </div>

          <h3 className="nano-quiz-question">{quiz.question}</h3>

          <div className="nano-quiz-options">
            {quiz.options.map((option, index) => (
              <button
                key={index}
                className={`nano-quiz-option ${getAnswerClass(index)}`}
                onClick={() => !isSubmitted && setSelectedAnswer(index)}
                disabled={isSubmitted}
              >
                <span className="nano-option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="nano-option-text">{option}</span>
                <span className="nano-option-icon">{getAnswerIcon(index)}</span>
              </button>
            ))}
          </div>

          {result && (
            <div className={`nano-quiz-result ${result.is_correct ? 'success' : 'failure'}`}>
              <div className="nano-result-icon">
                <i className={`fa-solid ${result.is_correct ? 'fa-trophy' : 'fa-lightbulb'}`}></i>
              </div>
              <h4>
                {result.is_correct ? 'Excellent!' : 'Good effort!'}
              </h4>
              <p>
                {result.is_correct
                  ? `You earned ${result.points_earned} points!`
                  : `The correct answer was ${String.fromCharCode(65 + result.correct_answer)}`
                }
              </p>
              <div className="nano-result-stats">
                <span><i className="fa-solid fa-clock"></i> {result.time_taken}s</span>
                <span><i className="fa-solid fa-star"></i> +{result.points_earned} pts</span>
              </div>
            </div>
          )}

          {!isSubmitted && (
            <button
              className="nano-quiz-submit"
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
            >
              <i className="fa-solid fa-paper-plane"></i> Submit Answer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
