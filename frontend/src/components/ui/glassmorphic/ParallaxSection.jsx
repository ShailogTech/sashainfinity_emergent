import React, { useRef, useEffect, useState } from 'react';
import './ParallaxSection.css';

/**
 * ParallaxSection - Creates depth effects during scrolling
 *
 * @param {React.ReactNode} children - Section content
 * @param {string} className - Additional CSS classes
 * @param {number} speed - Parallax speed multiplier (0.1-0.5)
 * @param {string} background - Background image or color
 * @param {boolean} disabled - Disable parallax effect
 * @param {number} offset - Vertical offset in pixels
 */
const ParallaxSection = ({
  children,
  className = '',
  speed = 0.3,
  background,
  disabled = false,
  offset = 0,
  ...props
}) => {
  const sectionRef = useRef(null);
  const [transform, setTransform] = useState(`translateY(${offset}px)`);

  useEffect(() => {
    if (disabled) return;

    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const scrolled = window.scrollY;
      const rate = (rect.top - scrolled) * speed;

      requestAnimationFrame(() => {
        setTransform(`translateY(${rate + offset}px)`);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed, offset, disabled]);

  const sectionStyle = {
    transform,
    ...(background && {
      backgroundImage: typeof background === 'string' && background.startsWith('http')
        ? `url(${background})`
        : background,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: disabled ? 'scroll' : 'fixed'
    }),
    ...props.style
  };

  return (
    <div
      ref={sectionRef}
      className={`parallax-section ${className}`}
      style={sectionStyle}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * ParallaxLayer - Individual layer within a parallax section
 *
 * @param {React.ReactNode} children - Layer content
 * @param {string} className - Additional CSS classes
 * @param {number} depth - Depth factor (-2 to 2, where 2 is closest)
 * @param {boolean} float - Enable floating animation
 */
export const ParallaxLayer = ({
  children,
  className = '',
  depth = 0,
  float = false,
  ...props
}) => {
  const layerRef = useRef(null);
  const [transform, setTransform] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      if (!layerRef.current) return;

      const rect = layerRef.current.getBoundingClientRect();
      const scrolled = window.scrollY;
      const rate = (rect.top + scrolled) * (depth * 0.1);

      requestAnimationFrame(() => {
        setTransform(`translateY(${rate}px)`);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [depth]);

  const layerClasses = [
    'parallax-layer',
    float && 'parallax-float',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={layerRef}
      className={layerClasses}
      style={{ transform }}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * ParallaxCard - Card with parallax depth effect
 */
export const ParallaxCard = ({
  children,
  depth = 0.5,
  rotateIntensity = 5,
  className = '',
  ...props
}) => {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('');

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * rotateIntensity;
      const rotateY = ((centerX - x) / centerX) * rotateIntensity;

      requestAnimationFrame(() => {
        setTransform(
          `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
        );
      });
    };

    const handleMouseLeave = () => {
      setTransform('perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)');
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [rotateIntensity]);

  return (
    <div
      ref={cardRef}
      className={`parallax-card ${className}`}
      style={{ transform }}
      {...props}
    >
      {children}
    </div>
  );
};

export default ParallaxSection;
