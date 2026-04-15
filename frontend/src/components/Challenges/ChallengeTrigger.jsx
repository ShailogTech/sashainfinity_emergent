import React, { useState, useEffect } from 'react';
import { ChallengeArena } from './index';
import './ChallengeTrigger.css';

const ChallengeTrigger = ({ module, onComplete }) => {
  const [showChallenge, setShowChallenge] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    // Check if module is completed (from localStorage or API)
    const completedModules = JSON.parse(localStorage.getItem('completedModules') || '[]');
    setHasCompleted(completedModules.includes(module?.id));

    // Check if prerequisites are met
    checkPrerequisites();
  }, [module]);

  const checkPrerequisites = () => {
    // Module is unlocked if:
    // 1. It's the first module, or
    // 2. Previous modules are completed
    if (!module?.prerequisite) {
      setIsUnlocked(true);
      return;
    }

    const completedModules = JSON.parse(localStorage.getItem('completedModules') || '[]');
    setIsUnlocked(completedModules.includes(module.prerequisite));
  };

  const handleChallengeComplete = (result) => {
    setHasCompleted(true);

    // Save to localStorage
    const completedModules = JSON.parse(localStorage.getItem('completedModules') || '[]');
    if (!completedModules.includes(module?.id)) {
      completedModules.push(module?.id);
      localStorage.setItem('completedModules', JSON.stringify(completedModules));
    }

    // Save stats
    const stats = JSON.parse(localStorage.getItem('challengeStats') || '{"totalPoints": 0, "completed": 0}');
    stats.totalPoints += result.points;
    stats.completed += 1;
    localStorage.setItem('challengeStats', JSON.stringify(stats));

    onComplete?.(result);
  };

  if (hasCompleted) {
    return (
      <div className="challenge-trigger completed">
        <div className="trigger-icon">
          <i className="fa-solid fa-check-circle"></i>
        </div>
        <div className="trigger-content">
          <span className="trigger-title">Module Completed!</span>
          <span className="trigger-desc">You've mastered this module.</span>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="challenge-trigger locked">
        <div className="trigger-icon">
          <i className="fa-solid fa-lock"></i>
        </div>
        <div className="trigger-content">
          <span className="trigger-title">Module Locked</span>
          <span className="trigger-desc">Complete the previous module to unlock.</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="challenge-trigger" onClick={() => setShowChallenge(true)}>
        <div className="trigger-icon">
          <i className="fa-solid fa-play"></i>
        </div>
        <div className="trigger-content">
          <span className="trigger-title">Start Challenge</span>
          <span className="trigger-desc">Test your knowledge to unlock the next module.</span>
        </div>
        <div className="trigger-reward">
          <i className="fa-solid fa-star"></i>
          <span>{module?.points || 100} XP</span>
        </div>
      </div>

      {showChallenge && (
        <ChallengeArena
          module={module}
          onComplete={handleChallengeComplete}
          onClose={() => setShowChallenge(false)}
        />
      )}
    </>
  );
};

export default ChallengeTrigger;
