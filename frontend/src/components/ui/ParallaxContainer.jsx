import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/**
 * ParallaxContainer - Container with parallax scroll effects
 *
 * @param {Object} props - Component props
 * @param {number} props.speed - Parallax speed multiplier (default: 0.5)
 * @param {string} props.direction - Direction: 'vertical' | 'horizontal' | 'both'
 * @param {boolean} props.disabled - Disable parallax effect
 * @param {ReactNode} props.children - Container content
 * @param {string} props.className - Additional CSS classes
 */
const ParallaxContainer = ({
  speed = 0.5,
  direction = 'vertical',
  disabled = false,
  children,
  className,
  ...props
}) => {
  const containerRef = useRef(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = () => setIsReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (disabled || isReducedMotion || !containerRef.current) return;

    const container = containerRef.current;

    // Create parallax animation
    const animation = gsap.to(container, {
      yPercent: direction === 'vertical' || direction === 'both' ? -50 * speed : 0,
      xPercent: direction === 'horizontal' || direction === 'both' ? -50 * speed : 0,
      ease: 'none',
      scrollTrigger: {
        trigger: container.parentElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === container.parentElement) {
          trigger.kill();
        }
      });
    };
  }, [speed, direction, disabled, isReducedMotion]);

  return (
    <div
      ref={containerRef}
      className={cn('parallax-container', 'will-change-transform', className)}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * ParallaxLayer - Individual parallax layer
 *
 * @param {Object} props - Component props
 * @param {number} props.depth - Depth for parallax (0-1, higher = more movement)
 * @param {boolean} props.disabled - Disable parallax for this layer
 * @param {ReactNode} props.children - Layer content
 * @param {string} props.className - Additional CSS classes
 */
const ParallaxLayer = ({
  depth = 0.5,
  disabled = false,
  children,
  className,
  ...props
}) => {
  const layerRef = useRef(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = () => setIsReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (disabled || isReducedMotion || !layerRef.current) return;

    const layer = layerRef.current;

    const animation = gsap.to(layer, {
      yPercent: -30 * depth,
      ease: 'none',
      scrollTrigger: {
        trigger: layer,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      animation.kill();
    };
  }, [depth, disabled, isReducedMotion]);

  return (
    <div
      ref={layerRef}
      className={cn('parallax-layer', 'will-change-transform', className)}
      style={{ transformStyle: 'preserve-3d' }}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * ParallaxTilt - Card with 3D tilt effect on mouse move
 *
 * @param {Object} props - Component props
 * @param {number} props.maxTilt - Maximum tilt in degrees (default: 15)
 * @param {boolean} props.disabled - Disable tilt effect
 * @param {ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 */
const ParallaxTilt = ({
  maxTilt = 15,
  disabled = false,
  children,
  className,
  ...props
}) => {
  const cardRef = useRef(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = () => setIsReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleMouseMove = (e) => {
    if (disabled || isReducedMotion || !cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  return (
    <div
      ref={cardRef}
      className={cn('parallax-tilt', 'transition-transform duration-200 ease-out', className)}
      style={{ transform }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * ScrollReveal - Component with scroll-triggered reveal animation
 *
 * @param {Object} props - Component props
 * @param {string} props.animation - Animation type: 'fadeUp' | 'fadeDown' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scale'
 * @param {number} props.delay - Animation delay in seconds
 * @param {number} props.duration - Animation duration in seconds
 * @param {ReactNode} props.children - Content to reveal
 * @param {string} props.className - Additional CSS classes
 */
const ScrollReveal = ({
  animation = 'fadeUp',
  delay = 0,
  duration = 0.8,
  children,
  className,
  ...props
}) => {
  const ref = useRef(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = () => setIsReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (isReducedMotion || !ref.current) return;

    const element = ref.current;

    const animations = {
      fadeUp: { from: { opacity: 0, y: 60 }, to: { opacity: 1, y: 0 } },
      fadeDown: { from: { opacity: 0, y: -60 }, to: { opacity: 1, y: 0 } },
      fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
      slideLeft: { from: { opacity: 0, x: 60 }, to: { opacity: 1, x: 0 } },
      slideRight: { from: { opacity: 0, x: -60 }, to: { opacity: 1, x: 0 } },
      scale: { from: { opacity: 0, scale: 0.8 }, to: { opacity: 1, scale: 1 } },
    };

    const selectedAnimation = animations[animation] || animations.fadeUp;

    // Set initial state
    gsap.set(element, selectedAnimation.from);

    // Create animation
    const anim = gsap.to(element, {
      ...selectedAnimation.to,
      duration,
      delay,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    return () => {
      anim.kill();
    };
  }, [animation, delay, duration, isReducedMotion]);

  return (
    <div ref={ref} className={cn('scroll-reveal', className)} {...props}>
      {children}
    </div>
  );
};

// Attach sub-components
ParallaxContainer.Layer = ParallaxLayer;
ParallaxContainer.Tilt = ParallaxTilt;
ParallaxContainer.Reveal = ScrollReveal;

export default ParallaxContainer;
