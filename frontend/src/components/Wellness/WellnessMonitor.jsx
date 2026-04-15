import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import './WellnessMonitor.css';

export const WellnessContext = createContext(null);
export const useWellness = () => useContext(WellnessContext);

const WellnessMonitor = ({ onBreakRecommended, children }) => {
  const { user, API_BASE } = useAuth();
  const [sessionStartTime] = useState(Date.now());
  const [sessionDuration, setSessionDuration] = useState(0);
  const [quizScores, setQuizScores] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [wellnessStatus, setWellnessStatus] = useState('optimal');
  const sessionDataRef = useRef({
    quizAttempts: [],
    activityEvents: [],
    startTime: Date.now()
  });

  const WellnessStatus = {
    OPTIMAL: 'optimal',
    WARNING: 'warning',
    CRITICAL: 'critical'
  };

  const BREAK_THRESHOLDS = {
    SESSION_DURATION_LONG: 45 * 60 * 1000,
    SESSION_DURATION_VERY_LONG: 60 * 60 * 1000,
    CONSECUTIVE_FAILURES: 3,
    LOW_SCORE_THRESHOLD: 50,
    AVG_SCORE_THRESHOLD: 60,
    TIME_BETWEEN_QUIZZES_SHORT: 5 * 60 * 1000
  };

  const ENCOURAGING_MESSAGES = {
    optimal: [
      "You're doing great! Keep up the wonderful progress.",
      "Your focus is amazing today!",
      "You're on fire! Learning at your best."
    ],
    warning: [
      "You've been working hard. A short break might refresh your mind.",
      "Consider stretching your legs for a moment.",
      "Your dedication is admirable. Remember to breathe."
    ],
    critical: [
      "You've put in excellent effort. A 15-minute break will help you retain more.",
      "Time to recharge! Your brain will thank you.",
      "You've earned a rest. Step away for a bit."
    ]
  };

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m ${seconds % 60}s`;
  };

  const analyzePatterns = useCallback((recentScores) => {
    const patterns = {
      consecutiveFailures: 0,
      averageScore: 0,
      trendingDown: false,
      rapidAttempts: false,
      lastAttemptTime: 0
    };

    if (recentScores.length === 0) return patterns;

    let consecutiveLow = 0;
    let totalScore = 0;
    let previousScore = null;
    let decreasingCount = 0;
    const now = Date.now();

    recentScores.slice(-5).forEach((score, index) => {
      totalScore += score;

      if (score < BREAK_THRESHOLDS.LOW_SCORE_THRESHOLD) {
        consecutiveLow++;
      } else {
        consecutiveLow = 0;
      }

      if (previousScore !== null && score < previousScore) {
        decreasingCount++;
      }
      previousScore = score;

      if (index > 0) {
        const timeDiff = score.timestamp - recentScores[index - 1].timestamp;
        if (timeDiff < BREAK_THRESHOLDS.TIME_BETWEEN_QUIZZES_SHORT) {
          patterns.rapidAttempts = true;
        }
      }
    });

    patterns.consecutiveFailures = consecutiveLow;
    patterns.averageScore = totalScore / recentScores.length;
    patterns.trendingDown = decreasingCount >= 3;

    return patterns;
  }, []);

  const assessWellness = useCallback(() => {
    const now = Date.now();
    const elapsed = now - sessionStartTime;
    const patterns = analyzePatterns(quizScores);

    let status = WellnessStatus.OPTIMAL;
    let reasons = [];

    if (elapsed > BREAK_THRESHOLDS.SESSION_DURATION_VERY_LONG) {
      status = WellnessStatus.CRITICAL;
      reasons.push('extended_session');
    } else if (elapsed > BREAK_THRESHOLDS.SESSION_DURATION_LONG) {
      if (status !== WellnessStatus.CRITICAL) {
        status = WellnessStatus.WARNING;
        reasons.push('long_session');
      }
    }

    if (patterns.consecutiveFailures >= BREAK_THRESHOLDS.CONSECUTIVE_FAILURES) {
      status = WellnessStatus.CRITICAL;
      reasons.push('consecutive_failures');
    } else if (patterns.consecutiveFailures >= 2) {
      if (status !== WellnessStatus.CRITICAL) {
        status = WellnessStatus.WARNING;
        reasons.push('some_struggles');
      }
    }

    if (patterns.averageScore < BREAK_THRESHOLDS.AVG_SCORE_THRESHOLD && quizScores.length >= 3) {
      if (status !== WellnessStatus.CRITICAL) {
        status = WellnessStatus.WARNING;
        reasons.push('lower_performance');
      }
    }

    if (patterns.trendingDown && quizScores.length >= 4) {
      if (status !== WellnessStatus.CRITICAL) {
        status = WellnessStatus.WARNING;
        reasons.push('declining_trend');
      }
    }

    if (patterns.rapidAttempts) {
      if (status !== WellnessStatus.CRITICAL) {
        status = WellnessStatus.WARNING;
        reasons.push('rapid_pacing');
      }
    }

    return { status, reasons, patterns };
  }, [sessionStartTime, quizScores, analyzePatterns, WellnessStatus]);

  const syncWellnessStatus = useCallback(async () => {
    const { status, patterns } = assessWellness();

    setWellnessStatus(status);

    if (user && isMonitoring) {
      try {
        await fetch(`${API_BASE}/wellness/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            user_id: user.id,
            session_duration: Date.now() - sessionStartTime,
            quiz_scores: quizScores,
            wellness_status: status,
            activity_events: sessionDataRef.current.activityEvents,
            patterns: {
              consecutive_failures: patterns.consecutiveFailures,
              average_score: patterns.averageScore,
              trending_down: patterns.trendingDown
            }
          })
        });
      } catch (err) {
        console.log('Wellness sync:', err.message);
      }
    }

    if (status === WellnessStatus.CRITICAL && onBreakRecommended) {
      const messages = ENCOURAGING_MESSAGES.critical;
      const message = messages[Math.floor(Math.random() * messages.length)];
      onBreakRecommended(message, 15);
    } else if (status === WellnessStatus.WARNING && onBreakRecommended) {
      const messages = ENCOURAGING_MESSAGES.warning;
      const message = messages[Math.floor(Math.random() * messages.length)];
      onBreakRecommended(message, 5);
    }
  }, [assessWellness, user, API_BASE, sessionStartTime, quizScores, isMonitoring, onBreakRecommended, WellnessStatus]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isMonitoring) {
        const elapsed = Date.now() - sessionStartTime;
        setSessionDuration(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime, isMonitoring]);

  useEffect(() => {
    const wellnessInterval = setInterval(() => {
      if (isMonitoring) {
        syncWellnessStatus();
      }
    }, 30000);

    return () => clearInterval(wellnessInterval);
  }, [isMonitoring, syncWellnessStatus]);

  const trackQuizAttempt = useCallback((score, totalQuestions, topic = 'general') => {
    const percentage = (score / totalQuestions) * 100;
    const attempt = {
      score: percentage,
      timestamp: Date.now(),
      topic,
      passed: percentage >= 70
    };

    setQuizScores(prev => [...prev, attempt]);
    sessionDataRef.current.quizAttempts.push(attempt);

    syncWellnessStatus();

    return attempt;
  }, [syncWellnessStatus]);

  const trackActivity = useCallback((activityType, metadata = {}) => {
    const event = {
      type: activityType,
      timestamp: Date.now(),
      ...metadata
    };
    sessionDataRef.current.activityEvents.push(event);
  }, []);

  const getSessionSummary = useCallback(() => {
    const { patterns } = assessWellness();
    return {
      duration: sessionDuration,
      quizAttempts: sessionDataRef.current.quizAttempts.length,
      averageScore: patterns.averageScore || 0,
      wellnessStatus,
      activities: sessionDataRef.current.activityEvents.length
    };
  }, [sessionDuration, assessWellness, wellnessStatus]);

  const resetSession = useCallback(() => {
    sessionDataRef.current = {
      quizAttempts: [],
      activityEvents: [],
      startTime: Date.now()
    };
    setQuizScores([]);
    setSessionDuration(0);
    setWellnessStatus('optimal');
  }, []);

  const contextValue = {
    trackQuizAttempt,
    trackActivity,
    getSessionSummary,
    resetSession,
    sessionDuration,
    wellnessStatus,
    isMonitoring,
    setIsMonitoring,
    formatDuration
  };

  return (
    <WellnessContext.Provider value={contextValue}>
      {children({
        sessionDuration,
        wellnessStatus,
        formattedDuration: formatDuration(sessionDuration)
      })}
    </WellnessContext.Provider>
  );
};

export default WellnessMonitor;
