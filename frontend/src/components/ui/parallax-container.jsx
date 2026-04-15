import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import './parallax-container.css';

/**
 * ParallaxContainer - Creates smooth parallax scrolling effects
 *
 * Very subtle parallax disabled by default to prevent flickering.
 * Use speed=0 for static, speed=0.05 for very subtle effect only.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to apply parallax to
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.speed - Parallax speed multiplier (default: 0 - disabled, max 0.05 for subtle)
 * @param {number} props.maxOffset - Maximum offset in pixels (default: 100)
 * @param {'scroll' | 'mouse' | 'both'} props.trigger - What triggers the parallax
 * @param {boolean} props.disabled - Disable parallax effect
 * @param {boolean} props.preserve3d - Use 3D transforms
 * @param {'ease' | 'linear' | 'smooth'} props.easing - Easing function
 * @param {number} props.threshold - Distance from viewport to trigger (px)
 */
const ParallaxContainer = ({
  children,
  className,
  speed = 0,
  maxOffset = 50,
  trigger = 'scroll',
  disabled = false,
  preserve3d = false,
  easing = 'smooth',
  threshold = 200,
  ...props
}) => {
  const containerRef = useRef(null);
  const [transform, setTransform] = useState('');
  const [mouseTransform, setMouseTransform] = useState('');

  // Scroll parallax effect
  useEffect(() => {
    if (disabled || (trigger !== 'scroll' && trigger !== 'both')) return;

    let rafId = null;
    let currentY = 0;
    let targetY = 0;

    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scrolled = window.scrollY;
      const elementTop = rect.top + scrolled;
      const viewportHeight = window.innerHeight;

      // Calculate distance from viewport center
      const distanceFromCenter = (viewportHeight / 2) - (rect.top + rect.height / 2);
      const normalizedDistance = distanceFromCenter / viewportHeight;

      // Calculate target offset
      targetY = Math.max(-maxOffset, Math.min(maxOffset, normalizedDistance * maxOffset * speed));
    };

    const animate = () => {
      // Smooth easing
      if (easing === 'smooth') {
        currentY += (targetY - currentY) * 0.1;
      } else if (easing === 'ease') {
        currentY += (targetY - currentY) * 0.15;
      } else {
        currentY = targetY;
      }

      const transformValue = preserve3d
        ? `translate3d(0, ${currentY}px, 0)`
        : `translateY(${currentY}px)`;

      setTransform(transformValue);

      // Continue animation if not at target
      if (Math.abs(targetY - currentY) > 0.1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    const onScroll = () => {
      handleScroll();
      if (!rafId) {
        rafId = requestAnimationFrame(animate);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll(); // Initial calculation
    animate();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [speed, maxOffset, trigger, disabled, preserve3d, easing, threshold]);

  // Mouse parallax effect
  useEffect(() => {
    if (disabled || (trigger !== 'mouse' && trigger !== 'both')) return;

    let rafId = null;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
      const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);

      targetX = deltaX * maxOffset * speed * 0.5;
      targetY = deltaY * maxOffset * speed * 0.5;
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      const transformValue = preserve3d
        ? `translate3d(${currentX}px, ${currentY}px, 0)`
        : `translate(${currentX}px, ${currentY}px)`;

      setMouseTransform(transformValue);

      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = null;
      }
    };

    const onMouseMove = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(animate);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousemove', onMouseMove);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [speed, maxOffset, trigger, disabled, preserve3d]);

  const containerStyle = {
    transform: trigger === 'mouse' ? mouseTransform : transform,
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'parallax-container',
        preserve3d && 'parallax-preserve-3d',
        className
      )}
      style={containerStyle}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * ParallaxLayer - Individual layer within a parallax container
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Layer content
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.depth - Depth factor (-2 to 2, default: 0)
 * @param {boolean} props.float - Enable floating animation
 * @param {number} props.floatDuration - Float animation duration in seconds
 * @param {number} props.floatDistance - Float distance in pixels
 */
export const ParallaxLayer = ({
  children,
  className,
  depth = 0,
  float = false,
  ...props
}) => {
  const layerRef = useRef(null);
  const [transform, setTransform] = useState('');

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || depth === 0) return;

    let rafId = null;
    let currentY = 0;
    let targetY = 0;

    const handleScroll = () => {
      const rect = layer.getBoundingClientRect();
      const scrolled = window.scrollY;
      const elementTop = rect.top + scrolled;

      // Depth-based parallax
      const rate = (elementTop - scrolled) * (depth * 0.05);
      targetY = rate;
    };

    const animate = () => {
      currentY += (targetY - currentY) * 0.1;
      setTransform(`translateY(${currentY}px)`);

      if (Math.abs(targetY - currentY) > 0.1) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = null;
      }
    };

    const onScroll = () => {
      handleScroll();
      if (!rafId) {
        rafId = requestAnimationFrame(animate);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();
    animate();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [depth]);

  const layerClasses = cn(
    'parallax-layer',
    className
  );

  const layerStyle = {
    transform,
  };

  return (
    <div
      ref={layerRef}
      className={layerClasses}
      style={layerStyle}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * ParallaxTilt - Card with 3D tilt effect on mouse movement
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.maxRotate - Maximum rotation in degrees (default: 10)
 * @param {number} props.scale - Scale on hover (default: 1.02)
 * @param {boolean} props.glare - Enable glare effect
 * @param {string} props.glareColor - Glare color (default: rgba(255,255,255,0.3))
 */
export const ParallaxTilt = ({
  children,
  className,
  maxRotate = 1,
  scale = 1,
  glare = false,
  glareColor = 'rgba(255, 255, 255, 0.3)',
  ...props
}) => {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('');
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 });

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxRotate;
    const rotateY = ((x - centerX) / centerX) * maxRotate;

    const transformValue = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, 1)`;
    setTransform(transformValue);

    if (glare) {
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      setGlareStyle({
        opacity: 1,
        background: `radial-gradient(circle at ${glareX}% ${glareY}%, ${glareColor}, transparent 60%)`,
      });
    }
  }, [maxRotate, scale, glare]);

  const handleMouseLeave = useCallback(() => {
    setTransform('perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)');
    setGlareStyle({ opacity: 0 });
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return (
    <div
      ref={cardRef}
      className={cn('parallax-tilt', className)}
      style={{ transform }}
      {...props}
    >
      {glare && (
        <div
          className="parallax-tilt-glare"
          style={glareStyle}
        />
      )}
      {children}
    </div>
  );
};

/**
 * ParallaxScrollTrigger - Section that animates when scrolled into view
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {string} props.className - Additional CSS classes
 * @param {'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'flip'} props.animation - Animation type
 * @param {number} props.threshold - Percentage of element visible to trigger (0-1)
 * @param {number} props.duration - Animation duration in ms
 * @param {number} props.delay - Delay before animation in ms
 */
export const ParallaxScrollTrigger = ({
  children,
  className,
  animation = 'fade-up',
  threshold = 0.2,
  duration = 300,
  delay = 0,
  ...props
}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, delay]);

  const animationClasses = {
    'fade-up': 'animate-fade-up',
    'fade-down': 'animate-fade-down',
    'fade-left': 'animate-fade-left',
    'fade-right': 'animate-fade-right',
    'zoom-in': 'animate-zoom-in',
    'flip': 'animate-flip',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'parallax-scroll-trigger',
        animationClasses[animation],
        isVisible && 'is-visible',
        className
      )}
      style={{ '--animation-duration': `${duration}ms` }}
      {...props}
    >
      {children}
    </div>
  );
};

export default ParallaxContainer;
export { ParallaxContainer };
