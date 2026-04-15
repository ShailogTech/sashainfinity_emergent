import { useState, useEffect } from "react";

export default function CodeChallenge({ challenge, onSubmit, onClose }) {
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(challenge.time_limit || 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted && isRunning) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted && isRunning) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted, isRunning]);

  const handleRun = async () => {
    try {
      // Simple JavaScript execution (in production, use a sandboxed environment)
      const capturedOutput = [];
      const originalLog = console.log;

      console.log = (...args) => {
        capturedOutput.push(args.join(" "));
      };

      try {
        // eslint-disable-next-line no-eval
        const evalResult = eval(code);
        console.log = originalLog;

        setOutput(capturedOutput.join("\n") || String(evalResult));
        setIsRunning(true);
      } catch (error) {
        console.log = originalLog;
        setOutput(`Error: ${error.message}`);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitted) return;

    setIsSubmitted(true);
    const timeTaken = (challenge.time_limit || 60) - timeLeft;

    // Check if code matches expected output (simplified)
    const isCorrect = output.includes(challenge.expected_output || "");
    const points_earned = isCorrect ? challenge.points || 15 : 0;

    try {
      const response = await fetch('/api/nano/challenges/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'demo-user',
          chapter_id: challenge.chapter_id,
          challenge_id: challenge.id,
          code: code,
          output: output,
          time_taken: timeTaken
        })
      });

      const data = await response.json();
      setResult(data);
      onSubmit(data);
    } catch (error) {
      console.error('Challenge submission error:', error);
      setResult({
        is_correct: isCorrect,
        points_earned: points_earned,
        expected_output: challenge.expected_output,
        actual_output: output,
        time_taken: timeTaken
      });
      onSubmit(result);
    }
  };

  const resetChallenge = () => {
    setCode(challenge.starter_code || "");
    setOutput("");
    setIsRunning(false);
    setIsSubmitted(false);
    setResult(null);
    setTimeLeft(challenge.time_limit || 60);
  };

  return (
    <div className="nano-code-challenge-overlay">
      <div className="nano-code-challenge-container">
        <div className="nano-challenge-header">
          <div className="nano-challenge-info">
            <span className="nano-challenge-type">
              <i className="fa-solid fa-code"></i> Code Challenge
            </span>
            <div className="nano-challenge-timer">
              <i className="fa-solid fa-clock"></i>
              <span className={timeLeft <= 15 ? 'urgent' : ''}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
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

        <div className="nano-challenge-content">
          <div className="nano-challenge-description">
            <h3>{challenge.question}</h3>
            {challenge.hint && (
              <div className="nano-challenge-hint">
                <i className="fa-solid fa-lightbulb"></i>
                <span>Hint: {challenge.hint}</span>
              </div>
            )}
          </div>

          <div className="nano-code-editor">
            <div className="nano-code-header">
              <span>JavaScript</span>
              <div className="nano-code-actions">
                <button
                  className="nano-run-btn"
                  onClick={handleRun}
                  disabled={!code.trim()}
                >
                  <i className="fa-solid fa-play"></i> Run
                </button>
                <button
                  className="nano-reset-btn"
                  onClick={resetChallenge}
                  disabled={isSubmitted}
                >
                  <i className="fa-solid fa-rotate"></i> Reset
                </button>
              </div>
            </div>
            <textarea
              className="nano-code-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Write your code here..."
              disabled={isSubmitted}
              spellCheck={false}
            />
          </div>

          {output && (
            <div className="nano-code-output">
              <div className="nano-output-header">
                <i className="fa-solid fa-terminal"></i>
                <span>Output</span>
              </div>
              <pre className="nano-output-content">{output}</pre>
            </div>
          )}

          {result && (
            <div className={`nano-challenge-result ${result.is_correct ? 'success' : 'failure'}`}>
              <div className="nano-result-icon">
                <i className={`fa-solid ${result.is_correct ? 'fa-trophy' : 'fa-bug'}`}></i>
              </div>
              <h4>
                {result.is_correct ? 'Perfect!' : 'Almost there!'}
              </h4>
              <p>
                {result.is_correct
                  ? `You earned ${result.points_earned} points! Your code works perfectly.`
                  : `Expected: ${result.expected_output}\nGot: ${result.actual_output}`
                }
              </p>
              <div className="nano-result-stats">
                <span><i className="fa-solid fa-clock"></i> {result.time_taken}s</span>
                <span><i className="fa-solid fa-star"></i> +{result.points_earned} pts</span>
              </div>
              {challenge.explanation && (
                <div className="nano-result-explanation">
                  <h5>Explanation:</h5>
                  <p>{challenge.explanation}</p>
                </div>
              )}
            </div>
          )}

          {!isSubmitted && (
            <button
              className="nano-challenge-submit"
              onClick={handleSubmit}
              disabled={!output || !isRunning}
            >
              <i className="fa-solid fa-paper-plane"></i> Submit Solution
            </button>
          )}
        </div>
      </div>
    </div>
  );
}