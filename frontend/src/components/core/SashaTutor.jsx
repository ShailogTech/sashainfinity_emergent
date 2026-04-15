import { useState, useEffect, useRef } from 'react';
import './SashaTutor.css';

/**
 * Sasha Tutor - Interactive 3D Tutoring System
 * Combines speech bubbles, animations, and gestures
 */
export function SashaTutor({ animator, onTutorialComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const speechTimeout = useRef(null);
  const audioRef = useRef(null);

  // Tutorial script - what Sasha will say and do
  const tutorialScript = [
    {
      id: 'welcome',
      text: "Hi! I'm Sasha, your personal tutor! 👋 Let me show you around our amazing learning platform!",
      emotion: 'happy',
      duration: 4000,
      action: 'welcome'
    },
    {
      id: 'intro',
      text: "We offer incredible AR/VR courses that make learning math and science actually fun! 🚀",
      emotion: 'excited',
      duration: 5000,
      action: 'introduction'
    },
    {
      id: 'features',
      text: "Look at these features! Immersive 3D learning, personalized paths, and expert tutors - all for you! ✨",
      emotion: 'explaining',
      duration: 6000,
      action: 'features'
    },
    {
      id: 'courses',
      text: "Check out our courses! From basic algebra to advanced analytics - we've got everything you need! 📚",
      emotion: 'explaining',
      duration: 5000,
      action: 'courses'
    },
    {
      id: 'success',
      text: "Ready to start your learning journey? Click 'Get Started' and let's learn together! 🎉",
      emotion: 'happy',
      duration: 4000,
      action: 'success'
    }
  ];

  // Start tutorial
  useEffect(() => {
    setTimeout(() => {
      setShowBubble(true);
      playStep(0);
    }, 1000); // Wait 1 second before starting

    return () => cleanup();
  }, []);

  const cleanup = () => {
    if (speechTimeout.current) {
      clearTimeout(speechTimeout.current);
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const playStep = (stepIndex) => {
    if (stepIndex >= tutorialScript.length) {
      // Tutorial complete
      setTimeout(() => {
        setShowBubble(false);
        if (onTutorialComplete) onTutorialComplete();
      }, 2000);
      return;
    }

    const step = tutorialScript[stepIndex];
    setCurrentStep(stepIndex);

    // Trigger animation
    if (animator) {
      animator.startTalking();
      animator.playTutorialAnimation(step.action);
      setTimeout(() => {
        if (animator) animator.stopTalking();
      }, step.duration - 500);
    }

    // Show typing effect
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 500);

    // Play next step
    speechTimeout.current = setTimeout(() => {
      if (!isPaused) {
        playStep(stepIndex + 1);
      }
    }, step.duration);
  };

  const handleNext = () => {
    cleanup();
    playStep(currentStep + 1);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      cleanup();
    } else {
      playStep(currentStep);
    }
  };

  const handleSkip = () => {
    cleanup();
    setShowBubble(false);
    if (onTutorialComplete) onTutorialComplete();
  };

  const currentScript = tutorialScript[currentStep];

  if (!showBubble || !currentScript) return null;

  return (
    <div className="sasha-tutor-container">
      {/* Speech Bubble */}
      <div className={`sasha-speech-bubble ${isTyping ? 'typing' : ''}`}>
        <div className="bubble-header">
          <span className="tutor-name">🤖 Sasha</span>
          <div className="bubble-controls">
            <button onClick={handlePause} className="control-btn" title={isPaused ? "Resume" : "Pause"}>
              {isPaused ? '▶️' : '⏸️'}
            </button>
            <button onClick={handleSkip} className="control-btn" title="Skip tutorial">
              ⏭️
            </button>
          </div>
        </div>
        <div className="bubble-content">
          <p className="speech-text">{currentScript.text}</p>
        </div>
        <div className="bubble-footer">
          <button onClick={handleNext} className="next-btn">
            Next →
          </button>
          <span className="step-indicator">
            {currentStep + 1} / {tutorialScript.length}
          </span>
        </div>
      </div>

      {/* Audio element for text-to-speech (optional) */}
      <audio
        ref={audioRef}
        onEnded={() => {
          // Auto-advance when speech ends
        }}
      />
    </div>
  );
}

/**
 * Advanced Sasha Tutor with AI Integration
 * For when you want to connect to Claude/GPT APIs
 */
export function SashaTutorAI({ animator, userQuestion, context }) {
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getAIResponse = async () => {
    setIsLoading(true);
    try {
      // Call your backend API that connects to Claude/GPT
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQuestion,
          context: context // current page, user progress, etc.
        })
      });

      const data = await response.json();
      setResponse(data.response);

      // Trigger appropriate animation based on sentiment
      if (animator) {
        animator.startTalking();
        const emotion = detectEmotion(data.response);
        animator.showEmotion(emotion);
        setTimeout(() => animator.stopTalking(), 3000);
      }
    } catch (error) {
      console.error('AI Tutor error:', error);
      setResponse("Sorry, I'm having trouble thinking right now. Try again later!");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (userQuestion) {
      getAIResponse();
    }
  }, [userQuestion]);

  if (!response) return null;

  return (
    <div className="sasha-tutor-container">
      <div className="sasha-speech-bubble ai-mode">
        <div className="bubble-header">
          <span className="tutor-name">🧠 Sasha AI</span>
        </div>
        <div className="bubble-content">
          {isLoading ? (
            <div className="thinking-animation">
              <span>🤔</span>
              <span>Sasha is thinking...</span>
            </div>
          ) : (
            <p className="speech-text">{response}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to detect emotion from text
function detectEmotion(text) {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('great') || lowerText.includes('awesome') || lowerText.includes('success')) {
    return 'happy';
  } else if (lowerText.includes('look') || lowerText.includes('check')) {
    return 'pointing';
  } else if (lowerText.includes('think') || lowerText.includes('consider')) {
    return 'thinking';
  }
  return 'explaining';
}