export default function ModuleNavigation({ chapters, currentChapter, onSelectChapter, progress }) {
  return (
    <div className="nano-module-navigation">
      <div className="nano-nav-header">
        <h3>Course Modules</h3>
        <span className="nano-nav-count">{chapters.length} modules</span>
      </div>

      <div className="nano-nav-list">
        {chapters.map((chapter, index) => {
          const chapterNumber = index + 1;
          const isCurrent = chapter.id === currentChapter.id;
          const isCompleted = progress?.completed_chapters >= chapterNumber;
          const isLocked = chapterNumber > (progress?.completed_chapters || 0) + 1;

          return (
            <button
              key={chapter.id}
              className={`nano-nav-item ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
              onClick={() => !isLocked && onSelectChapter(chapter)}
              disabled={isLocked}
            >
              <div className="nano-nav-item-left">
                <div className="nano-nav-icon">
                  {isLocked ? (
                    <i className="fa-solid fa-lock"></i>
                  ) : isCompleted ? (
                    <i className="fa-solid fa-check-circle"></i>
                  ) : (
                    <span className="nano-nav-number">{chapterNumber}</span>
                  )}
                </div>
                <div className="nano-nav-content">
                  <span className="nano-nav-title">{chapter.title}</span>
                  <span className="nano-nav-duration">
                    <i className="fa-solid fa-clock"></i> {Math.ceil(chapter.duration / 60)} min
                  </span>
                </div>
              </div>
              <div className="nano-nav-item-right">
                {isCurrent && (
                  <span className="nano-nav-current">
                    <i className="fa-solid fa-play"></i> Current
                  </span>
                )}
                {isCompleted && (
                  <span className="nano-nav-completed">
                    <i className="fa-solid fa-check"></i> Done
                  </span>
                )}
                {isLocked && (
                  <span className="nano-nav-locked">
                    <i className="fa-solid fa-lock"></i> Locked
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="nano-nav-footer">
        <div className="nano-nav-progress">
          <div className="nano-nav-progress-bar">
            <div
              className="nano-nav-progress-fill"
              style={{
                width: `${((progress?.completed_chapters || 0) / chapters.length) * 100}%`
              }}
            ></div>
          </div>
          <span className="nano-nav-progress-text">
            {progress?.completed_chapters || 0} of {chapters.length} completed
          </span>
        </div>
      </div>
    </div>
  );
}
