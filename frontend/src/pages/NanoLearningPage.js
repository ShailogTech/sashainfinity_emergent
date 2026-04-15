import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSpring, animated, config } from '@react-spring/web';
import "./NanoLearningPage.css";
import {
  VideoPlayer,
  MicroChallenge,
  NanoLessonCard,
  NanoProgress,
  ModuleNavigation,
  ProgressIndicator
} from "@/components/nanolearning";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function NanoLearningPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Course data
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [challenge, setChallenge] = useState(null);
  const [showChallenge, setShowChallenge] = useState(false);
  const [progress, setProgress] = useState({
    totalLessons: 0,
    completedLessons: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalPoints: 0,
    estimatedTimeRemaining: 0
  });
  const [lessonProgress, setLessonProgress] = useState({});
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('player'); // 'player' or 'grid'

  const userId = localStorage.getItem('userId') || 'demo-user';

  // Page entrance animation
  const pageAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: config.stiff
  });

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  useEffect(() => {
    if (currentLesson) {
      loadLessonMarkers(currentLesson.id);
    }
  }, [currentLesson]);

  const loadLessonMarkers = async (lessonId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`${API_BASE}/api/nano/lessons/${lessonId}/markers`, { headers });
      if (response.ok) {
        const markersData = await response.json();
        setMarkers(markersData);
      } else {
        // Generate 5-minute chunk markers if API fails
        if (currentLesson) {
          const chunkCount = Math.ceil(currentLesson.duration / 300);
          const generatedMarkers = Array.from({ length: chunkCount }, (_, i) => ({
            time: i * 300,
            label: i === 0 ? 'Introduction' : i === chunkCount - 1 ? 'Conclusion' : `Part ${i + 1}`
          }));
          setMarkers(generatedMarkers);
        }
      }
    } catch (error) {
      console.error('Error loading markers:', error);
      // Generate fallback markers
      if (currentLesson) {
        const chunkCount = Math.ceil(currentLesson.duration / 300);
        const generatedMarkers = Array.from({ length: chunkCount }, (_, i) => ({
          time: i * 300,
          label: i === 0 ? 'Introduction' : i === chunkCount - 1 ? 'Conclusion' : `Part ${i + 1}`
        }));
        setMarkers(generatedMarkers);
      }
    }
  };

  const loadCourseData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Load course
      const courseResponse = await fetch(`${API_BASE}/api/nano/courses/${courseId}`, { headers });
      if (!courseResponse.ok) throw new Error('Failed to load course');
      const courseData = await courseResponse.json();
      setCourse(courseData);

      // Load lessons
      const lessonsResponse = await fetch(`${API_BASE}/api/nano/courses/${courseId}/lessons`, { headers });
      if (!lessonsResponse.ok) throw new Error('Failed to load lessons');
      const lessonsData = await lessonsResponse.json();
      setLessons(lessonsData);

      // Load progress
      try {
        const progressResponse = await fetch(`${API_BASE}/api/nano/progress/${userId}/courses/${courseId}`, { headers });
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          setProgress({
            totalLessons: progressData.total_lessons || lessonsData.length,
            completedLessons: progressData.completed_lessons || 0,
            currentStreak: progressData.current_streak || 0,
            longestStreak: progressData.longest_streak || 0,
            totalPoints: progressData.total_points || 0,
            estimatedTimeRemaining: progressData.estimated_time_remaining || 0
          });
        }
      } catch (progressError) {
        console.error('Error loading progress:', progressError);
        // Set default progress
        setProgress({
          totalLessons: lessonsData.length,
          completedLessons: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalPoints: 0,
          estimatedTimeRemaining: lessonsData.reduce((sum, l) => sum + (l.duration || 0), 0)
        });
      }

      // Load lesson progress
      try {
        const lessonProgressResponse = await fetch(`${API_BASE}/api/nano/progress/${userId}/courses/${courseId}/lessons`, { headers });
        if (lessonProgressResponse.ok) {
          const lessonProgressData = await lessonProgressResponse.json();
          const progressMap = {};
          lessonProgressData.forEach(lp => {
            progressMap[lp.lesson_id] = lp;
          });
          setLessonProgress(progressMap);
        }
      } catch (lessonProgressError) {
        console.error('Error loading lesson progress:', lessonProgressError);
        setLessonProgress({});
      }

      // Set current lesson
      const nextLessonId = progress.nextLessonId;
      if (nextLessonId) {
        const nextLesson = lessonsData.find(l => l.id === nextLessonId);
        if (nextLesson) {
          const index = lessonsData.findIndex(l => l.id === nextLesson.id);
          setCurrentLesson(nextLesson);
          setCurrentLessonIndex(index);
        } else {
          setCurrentLesson(lessonsData[0]);
          setCurrentLessonIndex(0);
        }
      } else {
        setCurrentLesson(lessonsData[0]);
        setCurrentLessonIndex(0);
      }

    } catch (error) {
      console.error('Error loading course data:', error);
      setError(error.message || 'Failed to load course');
      setCourse(null);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSelect = (lesson) => {
    const index = lessons.findIndex(l => l.id === lesson.id);
    setCurrentLesson(lesson);
    setCurrentLessonIndex(index);
    setShowChallenge(false);
    setChallenge(null);
    setViewMode('player');
  };

  const handleVideoProgress = async (progressData) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };

      await fetch(`${API_BASE}/api/nano/progress`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: userId,
          course_id: courseId,
          lesson_id: currentLesson.id,
          ...progressData
        })
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleVideoComplete = async () => {
    try {
      await handleVideoProgress({
        video_progress: 100,
        video_completed: true,
        last_position: currentLesson.duration
      });

      // Load challenge
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const challengeResponse = await fetch(`${API_BASE}/api/nano/lessons/${currentLesson.id}/challenge`, { headers });
        if (challengeResponse.ok) {
          const challengeData = await challengeResponse.json();
          setChallenge(challengeData);
          setShowChallenge(true);
        } else {
          // Create fallback challenge
          setChallenge({
            id: 'c1',
            lesson_id: currentLesson.id,
            question: `What is the primary purpose of ${currentLesson.title}?`,
            options: [
              'To manage database connections',
              'To handle React component logic',
              'To perform API authentication',
              'To style React components'
            ],
            correct_answer: 1,
            time_limit: 30,
            points: currentLesson.points || 100,
            difficulty: currentLesson.difficulty || 'medium',
            explanation: 'This lesson focuses on understanding and implementing the core concept effectively.'
          });
          setShowChallenge(true);
        }
      } catch (challengeError) {
        console.error('Error loading challenge:', challengeError);
        // Use fallback challenge
        setChallenge({
          id: 'c1',
          lesson_id: currentLesson.id,
          question: `What is the primary purpose of ${currentLesson.title}?`,
          options: [
            'To manage database connections',
            'To handle React component logic',
            'To perform API authentication',
            'To style React components'
          ],
          correct_answer: 1,
          time_limit: 30,
          points: currentLesson.points || 100,
          difficulty: currentLesson.difficulty || 'medium',
          explanation: 'This lesson focuses on understanding and implementing the core concept effectively.'
        });
        setShowChallenge(true);
      }

    } catch (error) {
      console.error('Error handling video complete:', error);
    }
  };

  const handleChallengeSubmit = async (result) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };

      await fetch(`${API_BASE}/api/nano/progress`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: userId,
          course_id: courseId,
          lesson_id: currentLesson.id,
          video_progress: 100,
          video_completed: true,
          challenge_completed: true,
          challenge_score: result.points_earned,
          last_position: currentLesson.duration,
          completed_at: new Date().toISOString()
        })
      });

      // Update local progress
      setProgress(prev => ({
        ...prev,
        completedLessons: prev.completedLessons + 1,
        currentStreak: result.is_correct ? result.streak : 0,
        longestStreak: Math.max(prev.longestStreak, result.streak),
        totalPoints: prev.totalPoints + result.points_earned,
        estimatedTimeRemaining: Math.max(0, prev.estimatedTimeRemaining - currentLesson.duration)
      }));

      setLessonProgress(prev => ({
        ...prev,
        [currentLesson.id]: { completed: true, score: result.points_earned }
      }));

      // Auto-advance to next lesson
      setTimeout(() => {
        if (currentLessonIndex < lessons.length - 1) {
          handleLessonSelect(lessons[currentLessonIndex + 1]);
        } else {
          // Course completed!
          setViewMode('grid');
        }
      }, 3000);

    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  };

  const handleChallengeClose = () => {
    setShowChallenge(false);
    if (currentLessonIndex < lessons.length - 1) {
      handleLessonSelect(lessons[currentLessonIndex + 1]);
    } else {
      setViewMode('grid');
    }
  };

  if (loading) {
    return (
      <div className="nano-learning-page">
        <div className="nano-loading">
          <div className="nano-loading-spinner"></div>
          <p>Preparing your learning experience...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nano-learning-page">
        <div className="nano-error">
          <i className="fa-solid fa-exclamation-circle"></i>
          <h2>{error}</h2>
          <button onClick={() => navigate('/courses')} className="nano-back-btn">
            <i className="fa-solid fa-arrow-left"></i> Back to Courses
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="nano-learning-page">
        <div className="nano-error">
          <i className="fa-solid fa-exclamation-circle"></i>
          <h2>Course not found</h2>
          <button onClick={() => navigate('/courses')} className="nano-back-btn">
            <i className="fa-solid fa-arrow-left"></i> Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <animated.div style={pageAnimation} className="nano-learning-page">
      {/* Header */}
      <div className="nano-header">
        <div className="nano-container">
          <button
            onClick={() => navigate('/courses')}
            className="nano-back-button"
          >
            <i className="fa-solid fa-arrow-left"></i> Back to Courses
          </button>
          <div className="nano-header-content">
            <div className="nano-header-badge">
              <i className="fa-solid fa-bolt"></i>
              <span>Nano Learning</span>
            </div>
            <h1>{course.title}</h1>
            <p>{course.description}</p>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="nano-container nano-progress-overview">
        <NanoProgress
          totalLessons={progress.totalLessons || lessons.length}
          completedLessons={progress.completedLessons}
          currentStreak={progress.currentStreak}
          longestStreak={progress.longestStreak}
          totalPoints={progress.totalPoints}
          estimatedTimeRemaining={progress.estimatedTimeRemaining}
          showDetails={true}
        />
      </div>

      {/* Main Content */}
      <div className="nano-container nano-content">
        {viewMode === 'player' && currentLesson ? (
          <div className="nano-grid">
            {/* Main Content */}
            <div className="nano-main">
              {/* Video Player */}
              <div className="nano-video-section">
                <VideoPlayer
                  src={currentLesson.video_url}
                  poster={currentLesson.thumbnail}
                  autoPlay={false}
                  onProgress={handleVideoProgress}
                  onComplete={handleVideoComplete}
                  markers={markers}
                  duration={currentLesson.duration}
                  chunkDuration={300}
                />
              </div>

              {/* Lesson Info */}
              <div className="nano-lesson-info">
                <h2>{currentLesson.title}</h2>
                <p>{currentLesson.description}</p>
                <div className="nano-lesson-meta">
                  <span className="nano-meta-item">
                    <i className="fa-regular fa-clock"></i>
                    {Math.ceil(currentLesson.duration / 60)} min
                  </span>
                  <span className="nano-meta-item">
                    <i className="fa-solid fa-bolt"></i>
                    {currentLesson.points} points
                  </span>
                  <span className={`nano-meta-item difficulty ${currentLesson.difficulty}`}>
                    {currentLesson.difficulty}
                  </span>
                </div>
              </div>

              {/* Micro Challenge Overlay */}
              {showChallenge && challenge && (
                <MicroChallenge
                  challenge={challenge}
                  streak={progress.currentStreak}
                  onSubmit={handleChallengeSubmit}
                  onClose={handleChallengeClose}
                  onNextLesson={() => {
                    if (currentLessonIndex < lessons.length - 1) {
                      handleLessonSelect(lessons[currentLessonIndex + 1]);
                    }
                  }}
                  isLastChallenge={currentLessonIndex >= lessons.length - 1}
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="nano-sidebar">
              <ModuleNavigation
                chapters={lessons}
                currentChapter={currentLesson}
                onSelectChapter={handleLessonSelect}
                progress={progress}
              />
            </div>
          </div>
        ) : (
          /* Lesson Grid View */
          <div className="nano-lessons-grid">
            <div className="nano-grid-header">
              <h2>All Lessons</h2>
              <button
                className="nano-view-player-btn"
                onClick={() => {
                  const nextLesson = lessons.find((l, i) => !lessonProgress[l.id]?.completed);
                  if (nextLesson) {
                    handleLessonSelect(nextLesson);
                  } else {
                    handleLessonSelect(lessons[0]);
                  }
                  setViewMode('player');
                }}
              >
                <i className="fa-solid fa-play"></i>
                Continue Learning
              </button>
            </div>
            <div className="nano-lessons-list">
              {lessons.map((lesson, index) => (
                <NanoLessonCard
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  isCompleted={!!lessonProgress[lesson.id]?.completed}
                  isLocked={index > 0 && !lessonProgress[lessons[index - 1].id]?.completed}
                  isCurrent={currentLesson?.id === lesson.id}
                  onStart={handleLessonSelect}
                  progress={lessonProgress[lesson.id]?.progress || 0}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </animated.div>
  );
}
