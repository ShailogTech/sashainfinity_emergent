import React, { useState, useEffect } from 'react';
import './DragDropChallenge.css';

const DragDropChallenge = ({ challenge, streak = 0, onSubmit, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(45);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [items, setItems] = useState([]);
  const [droppedItems, setDroppedItems] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    if (challenge.items) {
      setItems(challenge.items.map((item, index) => ({ ...item, id: index })));
    }
  }, [challenge]);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const handleDragStart = (item, e) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (category, e) => {
    e.preventDefault();
    if (draggedItem) {
      setDroppedItems(prev => ({
        ...prev,
        [draggedItem.id]: category
      }));
      setItems(prev => prev.filter(item => item.id !== draggedItem.id));
      setDraggedItem(null);
    }
  };

  const handleRemoveFromCategory = (itemId) => {
    const item = challenge.items.find(i => i.id === itemId);
    if (item) {
      setItems(prev => [...prev, { ...item, id: itemId }]);
      setDroppedItems(prev => {
        const newDropped = { ...prev };
        delete newDropped[itemId];
        return newDropped;
      });
    }
  };

  const handleSubmit = async () => {
    if (isSubmitted) return;

    setIsSubmitted(true);
    const timeTaken = 45 - timeLeft;

    let correctCount = 0;
    Object.entries(droppedItems).forEach(([itemId, category]) => {
      const item = challenge.items.find(i => i.id === parseInt(itemId));
      if (item && category === item.correctCategory) {
        correctCount++;
      }
    });

    const isCorrect = correctCount === challenge.items.length;
    const basePoints = challenge.points || 120;
    const pointsEarned = isCorrect ? basePoints : Math.floor((correctCount / challenge.items.length) * basePoints);

    const resultData = {
      is_correct: isCorrect,
      points_earned: pointsEarned,
      base_points: basePoints,
      correct_count: correctCount,
      total_items: challenge.items.length,
      time_taken: timeTaken,
      explanation: challenge.explanation,
      achievement: isCorrect ? {
        name: 'Perfect Sort!',
        icon: 'fa-solid fa-hand-pointer'
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
          challenge_type: 'dragdrop',
          dropped_items: droppedItems,
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
    setItems(challenge.items.map((item, index) => ({ ...item, id: index })));
    setDroppedItems({});
    setIsSubmitted(false);
    setResult(null);
    setTimeLeft(45);
  };

  return (
    <div className="dragdrop-challenge-overlay">
      <div className="dragdrop-challenge-container glassmorphism-lg">
        <div className="dragdrop-challenge-header">
          <div className="dragdrop-challenge-type">
            <i className="fa-solid fa-hand-pointer"></i>
            <span>Drag & Drop</span>
          </div>
          <div className="dragdrop-challenge-timer">
            <div className="timer-bar-container">
              <div
                className="timer-bar"
                style={{
                  width: `${(timeLeft / 45) * 100}%`,
                  backgroundColor: timeLeft <= 10 ? '#ef4444' : '#f4911a'
                }}
              />
            </div>
            <span className={`timer-text ${timeLeft <= 10 ? 'urgent' : ''}`}>
              <i className="fa-solid fa-clock"></i> {timeLeft}s
            </span>
          </div>
          <button className="dragdrop-close" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="dragdrop-challenge-content">
          <div className="dragdrop-points-badge">
            <i className="fa-solid fa-star"></i>
            {challenge.points || 120} points
          </div>

          <h3 className="dragdrop-question">{challenge.question}</h3>

          {challenge.hint && (
            <div className="dragdrop-hint">
              <i className="fa-solid fa-lightbulb"></i>
              <span>Hint: {challenge.hint}</span>
            </div>
          )}

          {/* Items pool */}
          <div className="dragdrop-items-pool">
            <h4>Drag items to the correct category:</h4>
            <div className="dragdrop-items-list">
              {items.map(item => (
                <div
                  key={item.id}
                  className="dragdrop-item"
                  draggable
                  onDragStart={(e) => handleDragStart(item, e)}
                >
                  {item.label || item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Drop zones */}
          <div className="dragdrop-drop-zones">
            {challenge.categories?.map((category, index) => (
              <div
                key={index}
                className={`dragdrop-zone ${Object.values(droppedItems).filter(v => v === category.name).length > 0 ? 'has-items' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(category.name, e)}
              >
                <div className="zone-header">
                  <i className={`fa-solid ${category.icon || 'fa-folder'}`}></i>
                  <span>{category.name}</span>
                  <span className="zone-count">
                    {Object.values(droppedItems).filter(v => v === category.name).length}
                  </span>
                </div>
                <div className="zone-items">
                  {Object.entries(droppedItems)
                    .filter(([_, cat]) => cat === category.name)
                    .map(([itemId, _]) => {
                      const item = challenge.items.find(i => i.id === parseInt(itemId));
                      return (
                        <div
                          key={itemId}
                          className="dropped-item"
                          onClick={() => !isSubmitted && handleRemoveFromCategory(parseInt(itemId))}
                        >
                          <span>{item?.label || item?.text}</span>
                          {!isSubmitted && <i className="fa-solid fa-times"></i>}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          {!isSubmitted && (
            <div className="dragdrop-actions">
              <button className="dragdrop-reset-btn" onClick={handleReset}>
                <i className="fa-solid fa-rotate"></i> Reset
              </button>
              <button
                className="dragdrop-submit-btn"
                onClick={handleSubmit}
                disabled={Object.keys(droppedItems).length === 0}
              >
                <i className="fa-solid fa-paper-plane"></i> Submit Answer
              </button>
            </div>
          )}

          {result && (
            <div className={`dragdrop-feedback ${result.is_correct ? 'success' : 'partial'}`}>
              <div className="feedback-icon">
                <i className={`fa-solid ${result.is_correct ? 'fa-trophy' : 'fa-check-circle'}`}></i>
              </div>
              <h4>
                {result.is_correct ? 'Perfect Match!' : `${result.correct_count}/${result.total_items} Correct`}
              </h4>
              <p>
                {result.is_correct
                  ? `+${result.points_earned} points! All items sorted correctly.`
                  : `+${result.points_earned} points. Some items need to be reclassified.`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DragDropChallenge;
