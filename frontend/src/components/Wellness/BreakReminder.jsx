import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import './BreakReminder.css';

const BreakReminder = ({ wellnessStatus, sessionDuration, onBreakTaken }) => {
  const { user, API_BASE } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [breakDuration, setBreakDuration] = useState(5);
  const [isBreaking, setIsBreaking] = useState(false);
  const [breakRemaining, setBreakRemaining] = useState(0);
  const [dismissedToday, setDismissedToday] = useState(new Set());
  const [breaksTaken, setBreaksTaken] = useState([]);

  const BREAK_MESSAGES = {
    critical: [
      "You've worked hard today. Take a 15-minute break.",
      "Your dedication is inspiring. Time to recharge for 15 minutes.",
      "You've earned this break. Rest for 15 minutes.",
      "A 15-minute pause will boost your learning retention."
    ],
    warning: [
      "You've been focusing well. A 5-minute stretch break?",
      "Quick 5-minute break to refresh your mind?",
      "Time to stand up and stretch for 5 minutes.",
      "A brief pause will help you stay sharp."
    ],
    suggestion: [
      "Hydration break! Water helps your brain work better.",
      "Eye rest time! Look at something far away for a minute.",
      "Breathing moment. Three deep breaths can reset your focus.",
      "Posture check! Stretch your shoulders gently."
    ]
  };

  const POST_BREAK_MESSAGES = [
    "Welcome back! You're refreshed and ready.",
    "Hope you had a nice break! Let's continue learning.",
    "You're recharged and ready to go!",
    "Great! Let's pick up where we left off."
  ];

  const shouldShowReminder = useCallback(() => {
    const now = new Date();
    const todayKey = `${now.getDate()}-${now.getMonth()}-${now.getFullYear()}`;
    return !dismissedToday.has(todayKey);
  }, [dismissedToday]);

  const showReminder = useCallback((msg, duration) => {
    if (shouldShowReminder() && !isBreaking) {
      setMessage(msg);
      setBreakDuration(duration);
      setIsVisible(true);
    }
  }, [shouldShowReminder, isBreaking]);

  const handleStartBreak = async () => {
    setIsBreaking(true);
    setIsVisible(false);
    setBreakRemaining(breakDuration * 60);

    const breakRecord = {
      startTime: new Date().toISOString(),
      duration: breakDuration,
      trigger: wellnessStatus,
      sessionDuration: sessionDuration
    };

    try {
      if (user) {
        await fetch(`${API_BASE}/wellness/breaks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            user_id: user.id,
            duration_minutes: breakDuration,
            trigger_reason: wellnessStatus,
            session_duration: sessionDuration
          })
        });
      }
    } catch (err) {
      console.log('Break tracking:', err.message);
    }

    const interval = setInterval(() => {
      setBreakRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          endBreak(breakRecord);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setBreaksTaken(prev => [...prev, { ...breakRecord, id: Date.now() }]);
  };

  const endBreak = async (breakRecord) => {
    setIsBreaking(false);
    const returnMessage = POST_BREAK_MESSAGES[Math.floor(Math.random() * POST_BREAK_MESSAGES.length)];

    try {
      if (user) {
        await fetch(`${API_BASE}/wellness/breaks/end`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            user_id: user.id,
            break_id: breakRecord.id || Date.now(),
            completed: true
          })
        });
      }
    } catch (err) {
      console.log('Break end tracking:', err.message);
    }

    if (onBreakTaken) {
      onBreakTaken(returnMessage);
    }
  };

  const handleDismiss = () => {
    const now = new Date();
    const todayKey = `${now.getDate()}-${now.getMonth()}-${now.getFullYear()}`;
    setDismissedToday(prev => new Set([...prev, todayKey]));
    setIsVisible(false);
  };

  const handleSnooze = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (shouldShowReminder()) {
        setIsVisible(true);
      }
    }, 10 * 60 * 1000);
  };

  const formatBreakTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (wellnessStatus === 'critical' && shouldShowReminder()) {
      const messages = BREAK_MESSAGES.critical;
      showReminder(messages[Math.floor(Math.random() * messages.length)], 15);
    }
  }, [wellnessStatus, shouldShowReminder, showReminder]);

  useEffect(() => {
    const checkSuggestionBreak = () => {
      const hours = new Date().getHours();
      if (hours === 10 || hours === 14 || hours === 16) {
        if (shouldShowReminder() && !isBreaking) {
          const messages = BREAK_MESSAGES.suggestion;
          setMessage(messages[Math.floor(Math.random() * messages.length)]);
          setBreakDuration(2);
          setIsVisible(true);
        }
      }
    };

    const suggestionInterval = setInterval(checkSuggestionBreak, 60 * 60 * 1000);
    return () => clearInterval(suggestionInterval);
  }, [shouldShowReminder, isBreaking]);

  return (
    <>
      {isVisible && (
        <div className={`break-reminder-overlay ${wellnessStatus}`}>
          <div className="break-reminder-card glass-effect">
            <div className="break-icon-container">
              <span className="break-icon">
                {wellnessStatus === 'critical' ? '🌿' : wellnessStatus === 'warning' ? '☕' : '💧'}
              </span>
            </div>

            <h3 className="break-title">
              {wellnessStatus === 'critical' ? 'Time for a Proper Break' :
               wellnessStatus === 'warning' ? 'Quick Break Suggestion' :
               'Gentle Reminder'}
            </h3>

            <p className="break-message">{message}</p>

            <div className="break-duration-info">
              <span className="duration-badge">{breakDuration} minutes</span>
              <span className="duration-hint">Recommended</span>
            </div>

            <div className="break-actions">
              <button
                className="break-btn primary"
                onClick={handleStartBreak}
              >
                Start Break
              </button>
              <button
                className="break-btn secondary"
                onClick={handleSnooze}
              >
                Remind Later
              </button>
              <button
                className="break-btn tertiary"
                onClick={handleDismiss}
              >
                Skip
              </button>
            </div>

            <div className="break-footer">
              <span className="break-tip">
                {wellnessStatus === 'critical' ? 'Step away from your screen. You deserve this rest.' :
                 wellnessStatus === 'warning' ? 'A short break improves focus and retention.' :
                 'Small pauses lead to better learning outcomes.'}
              </span>
            </div>
          </div>
        </div>
      )}

      {isBreaking && (
        <div className="break-in-progress">
          <div className="break-timer-card glass-effect">
            <div className="break-status-icon">🧘</div>
            <h3>Break Time</h3>
            <div className="break-countdown">{formatBreakTime(breakRemaining)}</div>
            <p className="break-instruction">
              {breakRemaining > 60 ? 'Relax and clear your mind.' :
               breakRemaining > 30 ? 'Start thinking about returning.' :
               'Almost ready to continue!'}
            </p>
            <div className="break-progress">
              <div
                className="break-progress-bar"
                style={{
                  width: `${((breakDuration * 60 - breakRemaining) / (breakDuration * 60)) * 100}%`
                }}
              />
            </div>
            <button
              className="end-break-btn"
              onClick={() => endBreak({ id: Date.now() })}
            >
              I'm Ready
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BreakReminder;
