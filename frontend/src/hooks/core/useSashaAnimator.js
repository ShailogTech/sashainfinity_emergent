import { useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';

/**
 * Hook to control Sasha's animations during tutoring
 * Handles gesture triggers, speech animation, and emotion states
 */
export function useSashaAnimator(model, mixer) {
  const animationActions = useRef({});
  const currentAction = useRef(null);
  const isAnimating = useRef(false);

  // Initialize animation actions from model
  useEffect(() => {
    if (!model || !model.userData.animations || !mixer) return;

    // Create actions for all animations
    model.userData.animations.forEach(clip => {
      animationActions.current[clip.name] = mixer.clipAction(clip, model);
    });

    console.log('🎭 Sasha animations loaded:', Object.keys(animationActions.current));
  }, [model, mixer]);

  /**
   * Play a specific animation by name
   */
  const playAnimation = useCallback((animationName, fadeDuration = 0.3) => {
    if (!model || !mixer || !animationActions.current[animationName]) {
      console.warn(`Animation "${animationName}" not found`);
      return;
    }

    const newAction = animationActions.current[animationName];

    // Fade out current action
    if (currentAction.current && currentAction.current !== newAction) {
      currentAction.current.fadeOut(fadeDuration);
    }

    // Fade in new action
    newAction.reset();
    newAction.fadeIn(fadeDuration);
    newAction.play();

    currentAction.current = newAction;
    console.log(`🎬 Playing: ${animationName}`);
  }, [model, mixer]);

  /**
   * Play a gesture animation (short, one-time)
   */
  const playGesture = useCallback((gestureName) => {
    if (!model || !mixer || !animationActions.current[gestureName]) return;

    const gestureAction = animationActions.current[gestureName];
    gestureAction.reset();
    gestureAction.setLoop(THREE.LoopOnce);
    gestureAction.clampWhenFinished = true;
    gestureAction.play();

    console.log(`✋ Gesture: ${gestureName}`);

    // Clean up after gesture completes
    gestureAction.getMixer().addEventListener('finished', (e) => {
      if (e.action === gestureAction) {
        // Return to idle animation
        playAnimation('idle', 0.5);
      }
    }, { once: true });
  }, [model, mixer, playAnimation]);

  /**
   * Set talking animation (for when Sasha is speaking)
   */
  const startTalking = useCallback(() => {
    playAnimation('talking', 0.2);
    isAnimating.current = true;
  }, [playAnimation]);

  const stopTalking = useCallback(() => {
    if (currentAction.current && currentAction.current._clip.name === 'talking') {
      playAnimation('idle', 0.3);
    }
    isAnimating.current = false;
  }, [playAnimation]);

  /**
   * Show emotion with animation
   */
  const showEmotion = useCallback((emotion) => {
    const emotionAnimations = {
      happy: 'wave',
      excited: 'jump',
      thinking: 'thinking',
      confused: 'confused',
      pointing: 'point',
      explaining: 'explain',
    };

    const animationName = emotionAnimations[emotion];
    if (animationName) {
      playGesture(animationName);
    }
  }, [playGesture]);

  /**
   * Tutorial-specific animation sequence
   */
  const playTutorialAnimation = useCallback((tutorialStep) => {
    const animations = {
      welcome: 'wave',
      introduction: 'explain',
      features: 'point',
      courses: 'explain',
      success: 'jump',
      thinking: 'thinking',
    };

    const animationName = animations[tutorialStep];
    if (animationName) {
      playGesture(animationName);
    }
  }, [playGesture]);

  return {
    playAnimation,
    playGesture,
    startTalking,
    stopTalking,
    showEmotion,
    playTutorialAnimation,
    availableAnimations: Object.keys(animationActions.current),
    isTalking: isAnimating.current,
  };
}