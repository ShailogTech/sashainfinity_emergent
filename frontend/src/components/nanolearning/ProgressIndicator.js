export default function ProgressIndicator({ progress, currentChapter, totalChapters }) {
  const percentage = Math.round((currentChapter / totalChapters) * 100);

  return (
    <div className="nano-progress-indicator">
      <div className="nano-progress-header">
        <div className="nano-progress-info">
          <span className="nano-progress-label">Your Progress</span>
          <span className="nano-progress-percentage">{percentage}%</span>
        </div>
        <div className="nano-progress-chapters">
          <span className="nano-current-chapter">{currentChapter}</span>
          <span className="nano-progress-divider">/</span>
          <span className="nano-total-chapters">{totalChapters}</span>
          <span className="nano-chapters-label">chapters</span>
        </div>
      </div>

      <div className="nano-progress-bar-container">
        <div className="nano-progress-bar">
          <div
            className="nano-progress-fill"
            style={{ width: `${percentage}%` }}
          >
            <div className="nano-progress-glow"></div>
          </div>
        </div>
      </div>

      <div className="nano-progress-achievements">
        <div className="nano-achievement">
          <i className="fa-solid fa-fire"></i>
          <span>{progress.current_streak || 0} day streak</span>
        </div>
        <div className="nano-achievement">
          <i className="fa-solid fa-star"></i>
          <span>{progress.total_points || 0} points</span>
        </div>
      </div>

      {progress.achievements && progress.achievements.length > 0 && (
        <div className="nano-achievements-list">
          {progress.achievements.map((achievement, index) => (
            <span key={index} className="nano-achievement-badge">
              <i className="fa-solid fa-medal"></i> {achievement}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
