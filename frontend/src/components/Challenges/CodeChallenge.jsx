import React, { useState, useEffect } from 'react';
import './CodeChallenge.css';

const CodeChallenge = ({ challenge, streak = 0, onSubmit, onClose }) => {
  const [code, setCode] = useState(challenge.starterCode || '// Write your code here\n');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isSubmitted]);

  const handleRun = () => {
    try {
      const logs = [];
      const originalLog = console.log;
      console.log = (...args) => logs.push(args.join(' '));

      try {
        const result = eval(code);
        console.log = originalLog;

        const outputText = logs.length > 0 ? logs.join('\n') : String(result ?? 'undefined');
        setOutput(outputText);
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
    const timeTaken = 60 - timeLeft;

    const isCorrect = output.trim() === String(challenge.expectedOutput).trim();
    const basePoints = challenge.points || 150;
    const pointsEarned = isCorrect ? basePoints : 0;

    const resultData = {
      is_correct: isCorrect,
      points_earned: pointsEarned,
      base_points: basePoints,
      time_taken: timeTaken,
      code: code,
      output: output,
      expected_output: challenge.expectedOutput,
      explanation: challenge.explanation,
      achievement: isCorrect ? {
        name: 'Code Master!',
        icon: 'fa-solid fa-code'
      } : null
    };

    setResult(resultData);

    try {
      await fetch('/api/challenges/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'demo-user',
          challenge_id: challenge.id,
          challenge_type: 'code',
          code: code,
          output: output,
          time_taken: timeTaken,
          is_correct: isCorrect,
          points_earned: pointsEarned
        })
      });
    } catch (error) {
      console.error('Submission error:', error);
    }

    setTimeout(() => onSubmit(resultData), 1500);
  };

  const handleReset = () => {
    setCode(challenge.starterCode || '// Write your code here\n');
    setOutput('');
    setIsRunning(false);
    setTimeLeft(60);
  };

  return (
    <div className="code-challenge-overlay">
      <div className="code-challenge-container glassmorphism-lg">
        <div className="code-challenge-header">
          <div className="code-challenge-type">
            <i className="fa-solid fa-code"></i>
            <span>Code Challenge</span>
          </div>
          <div className="code-challenge-timer">
            <div className="timer-ring">
              <svg width="60" height="60">
                <circle
                  cx="30"
                  cy="30"
                  r="26"
                  fill="none"
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="4"
                />
                <circle
                  cx="30"
                  cy="30"
                  r="26"
                  fill="none"
                  stroke={timeLeft <= 15 ? '#ef4444' : '#f4911a'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={163.36}
                  strokeDashoffset={163.36 * (1 - timeLeft / 60)}
                  transform="rotate(-90 30 30)"
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
                />
              </svg>
              <span className="timer-text">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
          <button className="code-close" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="code-challenge-content">
          <div className="code-points-badge">
            <i className="fa-solid fa-star"></i>
            {challenge.points || 150} points
          </div>

          <h3 className="code-question">{challenge.question}</h3>

          {challenge.hint && (
            <div className="code-hint">
              <i className="fa-solid fa-lightbulb"></i>
              <span>Hint: {challenge.hint}</span>
            </div>
          )}

          <div className="code-editor">
            <div className="code-editor-header">
              <span>JavaScript</span>
              <div className="code-actions">
                <button className="code-action-btn run" onClick={handleRun}>
                  <i className="fa-solid fa-play"></i> Run
                </button>
                <button className="code-action-btn reset" onClick={handleReset} disabled={isSubmitted}>
                  <i className="fa-solid fa-rotate"></i> Reset
                </button>
              </div>
            </div>
            <textarea
              className="code-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              disabled={isSubmitted}
              placeholder="// Write your solution here"
            />
          </div>

          {output && (
            <div className="code-output">
              <div className="output-header">
                <i className="fa-solid fa-terminal"></i>
                <span>Output</span>
              </div>
              <pre className={`output-content ${output.includes('Error') ? 'error' : 'success'}`}>
                {output}
              </pre>
            </div>
          )}

          {challenge.expectedOutput && (
            <div className="code-expected">
              <span className="expected-label">Expected output:</span>
              <code>{challenge.expectedOutput}</code>
            </div>
          )}

          {!isSubmitted && (
            <button
              className="code-submit-btn"
              onClick={handleSubmit}
              disabled={!output || !isRunning}
            >
              <i className="fa-solid fa-paper-plane"></i>
              Submit Solution
            </button>
          )}

          {result && (
            <div className={`code-feedback ${result.is_correct ? 'success' : 'error'}`}>
              <div className="feedback-icon">
                <i className={`fa-solid ${result.is_correct ? 'fa-trophy' : 'fa-bug'}`}></i>
              </div>
              <h4>{result.is_correct ? 'Perfect!' : 'Almost there!'}</h4>
              <p>
                {result.is_correct
                  ? `+${result.points_earned} points! Your code works perfectly.`
                  : `Expected: "${result.expected_output}"\nGot: "${result.output}"`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeChallenge;
