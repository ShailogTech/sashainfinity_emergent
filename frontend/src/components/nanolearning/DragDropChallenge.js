import { useState, useEffect } from "react";

export default function DragDropChallenge({ challenge, onSubmit, onClose }) {
  const [timeLeft, setTimeLeft] = useState(challenge.time_limit || 45);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [items, setItems] = useState([]);
  const [droppedItems, setDroppedItems] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    // Initialize items
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

  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (category) => {
    if (draggedItem) {
      setDroppedItems({
        ...droppedItems,
        [draggedItem.id]: category
      });
      setItems(items.filter(item => item.id !== draggedItem.id));
      setDraggedItem(null);
    }
  };

  const handleRemoveFromCategory = (itemId) => {
    const item = Object.keys(droppedItems).find(key => {
      const categoryItem = challenge.items.find(i => i.id === parseInt(itemId));
      return categoryItem;
    });

    if (item) {
      const categoryItem = challenge.items.find(i => i.id === parseInt(itemId));
      setItems([...items, { ...categoryItem, id: parseInt(itemId) }]);

      const newDropped = { ...droppedItems };
      delete newDropped[item];
      setDroppedItems(newDropped);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitted) return;

    setIsSubmitted(true);
    const timeTaken = (challenge.time_limit || 45) - timeLeft;

    // Check correctness
    let correctCount = 0;
    Object.keys(droppedItems).forEach(itemId => {
      const item = challenge.items.find(i => i.id === parseInt(itemId));
      if (item && droppedItems[itemId] === item.correct_category) {
        correctCount++;
      }
    });

    const isCorrect = correctCount === challenge.items.length;
    const points_earned = isCorrect ? challenge.points || 12 : Math.floor((correctCount / challenge.items.length) * challenge.points);

    try {
      const response = await fetch('/api/nano/challenges/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'demo-user',
          chapter_id: challenge.chapter_id,
          challenge_id: challenge.id,
          dropped_items: droppedItems,
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
        correct_count: correctCount,
        total_items: challenge.items.length,
        time_taken: timeTaken
      });
      onSubmit(result);
    }
  };

  const resetChallenge = () => {
    setItems(challenge.items.map((item, index) => ({ ...item, id: index })));
    setDroppedItems({});
    setIsSubmitted(false);
    setResult(null);
    setTimeLeft(challenge.time_limit || 45);
  };

  return (
    <div className="nano-drag-drop-overlay">
      <div className="nano-drag-drop-container">
        <div className="nano-challenge-header">
          <div className="nano-challenge-info">
            <span className="nano-challenge-type">
              <i className="fa-solid fa-hand-pointer"></i> Drag & Drop
            </span>
            <div className="nano-challenge-timer">
              <i className="fa-solid fa-clock"></i>
              <span className={timeLeft <= 10 ? 'urgent' : ''}>{timeLeft}s</span>
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

          {/* Items to drag */}
          <div className="nano-items-pool">
            <h4>Drag items to correct categories:</h4>
            <div className="nano-items-list">
              {items.map(item => (
                <div
                  key={item.id}
                  className="nano-drag-item"
                  draggable
                  onDragStart={() => handleDragStart(item)}
                >
                  {item.label || item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Drop zones */}
          <div className="nano-drop-zones">
            {challenge.categories?.map((category, index) => (
              <div
                key={index}
                className="nano-drop-zone"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(category.name)}
              >
                <div className="nano-zone-header">
                  <i className={`fa-solid ${category.icon || 'fa-folder'}`}></i>
                  <span>{category.name}</span>
                  <span className="nano-zone-count">
                    {Object.values(droppedItems).filter(v => v === category.name).length}
                  </span>
                </div>
                <div className="nano-zone-items">
                  {Object.keys(droppedItems)
                    .filter(itemId => droppedItems[itemId] === category.name)
                    .map(itemId => {
                      const item = challenge.items.find(i => i.id === parseInt(itemId));
                      return (
                        <div
                          key={itemId}
                          className="nano-dropped-item"
                          onClick={() => handleRemoveFromCategory(itemId)}
                        >
                          <span>{item?.label || item?.text}</span>
                          <i className="fa-solid fa-times"></i>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          {result && (
            <div className={`nano-challenge-result ${result.is_correct ? 'success' : 'partial'}`}>
              <div className="nano-result-icon">
                <i className={`fa-solid ${result.is_correct ? 'fa-trophy' : 'fa-check-circle'}`}></i>
              </div>
              <h4>
                {result.is_correct ? 'Perfect Match!' : `${result.correct_count}/${result.total_items} Correct`}
              </h4>
              <p>
                {result.is_correct
                  ? `You earned ${result.points_earned} points! All items sorted correctly.`
                  : `You earned ${result.points_earned} points. Some items need to be reclassified.`
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
            <div className="nano-challenge-actions-footer">
              <button
                className="nano-reset-btn"
                onClick={resetChallenge}
              >
                <i className="fa-solid fa-rotate"></i> Reset
              </button>
              <button
                className="nano-challenge-submit"
                onClick={handleSubmit}
                disabled={Object.keys(droppedItems).length === 0}
              >
                <i className="fa-solid fa-paper-plane"></i> Submit Answer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}