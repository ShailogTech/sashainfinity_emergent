import React, { useState, useEffect, useCallback } from 'react';
import QuizChallenge from './QuizChallenge';
import CodeChallenge from './CodeChallenge';
import DragDropChallenge from './DragDropChallenge';
import ChallengeResult from './ChallengeResult';
import Confetti from './Confetti';
import './ChallengeArena.css';

const CHALLENGE_TEMPLATES = {
  quiz: [
    {
      id: 'quiz-1',
      type: 'quiz',
      question: 'What does the "async" keyword do in JavaScript?',
      options: [
        'Makes the function run faster',
        'Marks a function for asynchronous execution',
        'Creates a new thread',
        'Prevents the function from being called'
      ],
      correctAnswer: 1,
      points: 100,
      timeLimit: 30,
      explanation: 'The async keyword declares an asynchronous function, which returns a Promise and can use the await keyword.'
    },
    {
      id: 'quiz-2',
      type: 'quiz',
      question: 'Which method is used to parse JSON in JavaScript?',
      options: [
        'JSON.parse()',
        'JSON.read()',
        'JSON.convert()',
        'JSON.toObject()'
      ],
      correctAnswer: 0,
      points: 100,
      timeLimit: 30,
      explanation: 'JSON.parse() converts a JSON string into a JavaScript object.'
    },
    {
      id: 'quiz-3',
      type: 'quiz',
      question: 'What is the purpose of the "useEffect" hook in React?',
      options: [
        'To manage component state',
        'To handle side effects in functional components',
        'To create custom hooks',
        'To optimize rendering performance'
      ],
      correctAnswer: 1,
      points: 100,
      timeLimit: 30,
      explanation: 'useEffect is used to perform side effects in functional components, like data fetching, subscriptions, or DOM manipulation.'
    }
  ],
  code: [
    {
      id: 'code-1',
      type: 'code',
      question: 'Write a function that returns the sum of two numbers.',
      starterCode: '// Write your solution below\n\nfunction sum(a, b) {\n  // Your code here\n  \n}',
      expectedOutput: '5',
      points: 150,
      timeLimit: 60,
      hint: 'Use the return keyword with the addition operator (+).',
      explanation: 'The function should return a + b to add the two parameters together.'
    },
    {
      id: 'code-2',
      type: 'code',
      question: 'Write a function that doubles a number.',
      starterCode: '// Complete the function\n\nfunction double(num) {\n  return num \n}',
      expectedOutput: '10',
      points: 150,
      timeLimit: 60,
      hint: 'Multiply the number by 2.',
      explanation: 'Multiplying by 2 is the same as doubling a number: return num * 2;'
    }
  ],
  dragdrop: [
    {
      id: 'dd-1',
      type: 'dragdrop',
      question: 'Drag each technology to its correct category:',
      items: [
        { id: 0, label: 'React', text: 'React', correctCategory: 'Frontend' },
        { id: 1, label: 'Node.js', text: 'Node.js', correctCategory: 'Backend' },
        { id: 2, label: 'MongoDB', text: 'MongoDB', correctCategory: 'Database' },
        { id: 3, label: 'Vue.js', text: 'Vue.js', correctCategory: 'Frontend' },
        { id: 4, label: 'PostgreSQL', text: 'PostgreSQL', correctCategory: 'Database' },
        { id: 5, label: 'Express', text: 'Express', correctCategory: 'Backend' }
      ],
      categories: [
        { name: 'Frontend', icon: 'fa-desktop' },
        { name: 'Backend', icon: 'fa-server' },
        { name: 'Database', icon: 'fa-database' }
      ],
      points: 120,
      timeLimit: 45,
      hint: 'Frontend frameworks run in browsers, backend runs on servers, databases store data.',
      explanation: 'React and Vue.js are frontend frameworks. Node.js and Express are backend technologies. MongoDB and PostgreSQL are databases.'
    }
  ]
};

const ACHIEVEMENTS = {
  first_win: { name: 'First Victory!', icon: 'fa-solid fa-medal', condition: (stats) => stats.completed === 1 },
  streak_3: { name: 'On Fire!', icon: 'fa-solid fa-fire', condition: (stats) => stats.maxStreak >= 3 },
  streak_5: { name: 'Unstoppable!', icon: 'fa-solid fa-fire-flame-curved', condition: (stats) => stats.maxStreak >= 5 },
  speed_demon: { name: 'Speed Demon', icon: 'fa-solid fa-bolt', condition: (stats) => stats.fastestTime < 10 },
  perfectionist: { name: 'Perfectionist', icon: 'fa-solid fa-crown', condition: (stats) => stats.accuracy === 100 },
  scholar: { name: 'Code Scholar', icon: 'fa-solid fa-graduation-cap', condition: (stats) => stats.completed >= 10 }
};

const ChallengeArena = ({ module, onComplete, onClose }) => {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [moduleComplete, setModuleComplete] = useState(false);

  const challenges = module?.challenges || CHALLENGE_TEMPLATES.quiz;
  const currentChallenge = challenges[currentChallengeIndex];

  const getChallengeComponent = (challenge) => {
    switch (challenge.type) {
      case 'quiz':
        return QuizChallenge;
      case 'code':
        return CodeChallenge;
      case 'dragdrop':
        return DragDropChallenge;
      default:
        return QuizChallenge;
    }
  };

  const handleChallengeSubmit = useCallback((result) => {
    const newStreak = result.is_correct ? streak + 1 : 0;
    setStreak(newStreak);
    setMaxStreak(prev => Math.max(prev, newStreak));

    const pointsEarned = result.points_earned || 0;
    setTotalPoints(prev => prev + pointsEarned);

    if (result.is_correct) {
      setCompletedChallenges(prev => [...prev, currentChallenge.id]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }

    setCurrentResult({
      ...result,
      streak: newStreak,
      total_points: totalPoints + pointsEarned,
      challenge_number: currentChallengeIndex + 1,
      total_challenges: challenges.length
    });
    setShowResult(true);
  }, [currentChallenge, currentChallengeIndex, streak, totalPoints, challenges.length]);

  const handleNext = () => {
    setShowResult(false);
    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex(prev => prev + 1);
    } else {
      setModuleComplete(true);
    }
  };

  const handleRetry = () => {
    setShowResult(false);
    setStreak(0);
  };

  const handleComplete = () => {
    onComplete({
      points: totalPoints,
      completed: completedChallenges.length,
      maxStreak,
      accuracy: Math.round((completedChallenges.length / challenges.length) * 100)
    });
  };

  const getChallengeTypeLabel = (type) => {
    switch (type) {
      case 'quiz': return 'Quick Quiz';
      case 'code': return 'Code Challenge';
      case 'dragdrop': return 'Drag & Drop';
      default: return 'Challenge';
    }
  };

  if (moduleComplete) {
    return (
      <div className="challenge-arena-overlay">
        <div className="module-complete-container glassmorphism-lg">
          {showConfetti && <Confetti duration={4000} />}
          <div className="module-complete-header">
            <div className="module-complete-icon">
              <i className="fa-solid fa-trophy"></i>
            </div>
            <h2>Module Complete!</h2>
            <p>Great job! You've mastered this module.</p>
          </div>

          <div className="module-complete-stats">
            <div className="stat-card">
              <i className="fa-solid fa-star"></i>
              <span className="stat-value">{totalPoints}</span>
              <span className="stat-label">Total Points</span>
            </div>
            <div className="stat-card">
              <i className="fa-solid fa-check-circle"></i>
              <span className="stat-value">{completedChallenges.length}/{challenges.length}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-card">
              <i className="fa-solid fa-fire"></i>
              <span className="stat-value">{maxStreak}</span>
              <span className="stat-label">Best Streak</span>
            </div>
            <div className="stat-card">
              <i className="fa-solid fa-bullseye"></i>
              <span className="stat-value">{Math.round((completedChallenges.length / challenges.length) * 100)}%</span>
              <span className="stat-label">Accuracy</span>
            </div>
          </div>

          <div className="module-complete-actions">
            <button className="module-complete-btn retry" onClick={handleRetry}>
              <i className="fa-solid fa-rotate"></i> Retry Module
            </button>
            <button className="module-complete-btn next" onClick={handleComplete}>
              <i className="fa-solid fa-arrow-right"></i> Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ChallengeComponent = getChallengeComponent(currentChallenge);

  return (
    <>
      {showConfetti && <Confetti />}
      {showResult && (
        <ChallengeResult
          result={currentResult}
          onClose={() => setShowResult(false)}
          onNext={handleNext}
          onRetry={handleRetry}
          streak={streak}
          isLastChallenge={currentChallengeIndex === challenges.length - 1}
        />
      )}
      <ChallengeComponent
        challenge={currentChallenge}
        streak={streak}
        onSubmit={handleChallengeSubmit}
        onClose={onClose}
      />

      <div className="challenge-hud">
        <div className="challenge-progress">
          {challenges.map((_, index) => (
            <div
              key={index}
              className={`progress-dot ${
                index === currentChallengeIndex ? 'current' : ''
              } ${
                completedChallenges.includes(challenges[index]?.id) ? 'completed' : ''
              } ${
                index > currentChallengeIndex ? 'locked' : ''
              }`}
            />
          ))}
        </div>
        <div className="challenge-stats">
          <div className="hud-stat">
            <i className="fa-solid fa-fire"></i>
            <span>{streak}</span>
          </div>
          <div className="hud-stat">
            <i className="fa-solid fa-star"></i>
            <span>{totalPoints}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChallengeArena;
