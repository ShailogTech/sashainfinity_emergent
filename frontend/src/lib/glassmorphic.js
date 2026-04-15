/**
 * Glassmorphic UI System Utilities
 *
 * Helper functions and utilities for glassmorphic components
 */

/**
 * Generate a random gradient for glass cards
 * @param {string} type - Gradient type: 'warm' | 'cool' | 'vibrant' | 'subtle'
 * @returns {string} CSS gradient string
 */
export const generateGradient = (type = 'subtle') => {
  const gradients = {
    warm: [
      'linear-gradient(135deg, rgba(244, 145, 26, 0.15) 0%, rgba(244, 145, 26, 0.05) 100%)',
      'linear-gradient(135deg, rgba(255, 170, 68, 0.15) 0%, rgba(255, 170, 68, 0.05) 100%)',
      'linear-gradient(135deg, rgba(245, 87, 108, 0.15) 0%, rgba(245, 87, 108, 0.05) 100%)',
    ],
    cool: [
      'linear-gradient(135deg, rgba(8, 42, 94, 0.15) 0%, rgba(8, 42, 94, 0.05) 100%)',
      'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(102, 126, 234, 0.05) 100%)',
      'linear-gradient(135deg, rgba(136, 187, 255, 0.15) 0%, rgba(136, 187, 255, 0.05) 100%)',
    ],
    vibrant: [
      'linear-gradient(135deg, rgba(244, 145, 26, 0.2) 0%, rgba(102, 126, 234, 0.15) 100%)',
      'linear-gradient(135deg, rgba(67, 233, 123, 0.2) 0%, rgba(102, 126, 234, 0.15) 100%)',
      'linear-gradient(135deg, rgba(245, 87, 108, 0.2) 0%, rgba(244, 145, 26, 0.15) 100%)',
    ],
    subtle: [
      'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)',
      'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(248, 250, 252, 0.4) 100%)',
      'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.3) 100%)',
    ],
  };

  const options = gradients[type] || gradients.subtle;
  return options[Math.floor(Math.random() * options.length)];
};

/**
 * Generate glassmorphic shadow
 * @param {number} intensity - Shadow intensity (0-1)
 * @returns {string} CSS shadow string
 */
export const generateGlassShadow = (intensity = 0.5) => {
  const opacity = Math.round(intensity * 255);
  return `0 8px 32px rgba(0, 0, 0, ${opacity / 255})`;
};

/**
 * Generate backdrop blur value
 * @param {number} intensity - Blur intensity (0-100)
 * @returns {string} CSS backdrop-filter string
 */
export const generateBlur = (intensity = 20) => {
  return `blur(${intensity}px)`;
};

/**
 * Check if user prefers reduced motion
 * @returns {boolean} True if reduced motion is preferred
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Add shimmer effect to element
 * @param {HTMLElement} element - Target element
 * @param {number} duration - Animation duration in ms
 */
export const addShimmerEffect = (element, duration = 2000) => {
  if (!element || prefersReducedMotion()) return;

  const shimmer = document.createElement('div');
  shimmer.style.cssText = `
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transform: translateX(-100%);
    animation: shimmer ${duration}ms infinite;
    pointer-events: none;
  `;

  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(shimmer);

  return () => shimmer.remove();
};

/**
 * Create glassmorphic modal overlay
 * @param {Object} options - Modal options
 * @returns {HTMLElement} Modal element
 */
export const createGlassModal = (options = {}) => {
  const {
    title = '',
    content = '',
    size = 'md',
    onClose = () => {},
  } = options;

  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  `;

  const modal = document.createElement('div');
  const sizeStyles = {
    sm: 'max-width: 400px',
    md: 'max-width: 600px',
    lg: 'max-width: 800px',
    xl: 'max-width: 1200px',
  };

  modal.style.cssText = `
    ${sizeStyles[size] || sizeStyles.md};
    width: 100%;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 24px;
    padding: 32px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    position: relative;
    max-height: 90vh;
    overflow-y: auto;
  `;

  if (title) {
    const titleEl = document.createElement('h2');
    titleEl.textContent = title;
    titleEl.style.cssText = `
      margin: 0 0 16px 0;
      font-size: 24px;
      font-weight: 700;
      color: #1a1a2e;
    `;
    modal.appendChild(titleEl);
  }

  if (content) {
    const contentEl = document.createElement('div');
    contentEl.innerHTML = content;
    modal.appendChild(contentEl);
  }

  overlay.appendChild(modal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) onClose();
  });

  return overlay;
};

/**
 * Apply glassmorphic styles to any element
 * @param {HTMLElement} element - Target element
 * @param {Object} options - Style options
 */
export const applyGlassStyles = (element, options = {}) => {
  if (!element) return;

  const {
    blur = 20,
    opacity = 0.7,
    border = true,
    shadow = true,
    gradient = false,
  } = options;

  element.style.cssText += `
    background: ${gradient ? generateGradient('subtle') : `rgba(255, 255, 255, ${opacity})`};
    backdrop-filter: blur(${blur}px);
    -webkit-backdrop-filter: blur(${blur}px);
    ${border ? 'border: 1px solid rgba(255, 255, 255, 0.3);' : ''}
    ${shadow ? 'box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);' : ''}
  `;
};

/**
 * Create bento grid layout
 * @param {Array} items - Grid items
 * @param {Object} options - Layout options
 * @returns {HTMLElement} Grid element
 */
export const createBentoGrid = (items, options = {}) => {
  const {
    columns = 'auto',
    gap = 20,
  } = options;

  const grid = document.createElement('div');
  grid.style.cssText = `
    display: grid;
    grid-template-columns: ${columns === 'auto' ? 'repeat(auto-fit, minmax(300px, 1fr))' : `repeat(${columns}, 1fr)`};
    gap: ${gap}px;
    width: 100%;
  `;

  items.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.style.cssText = `
      ${item.span ? `grid-column: span ${item.span};` : ''}
      ${item.rowSpan ? `grid-row: span ${item.rowSpan};` : ''}
    `;
    itemEl.innerHTML = item.content;
    grid.appendChild(itemEl);
  });

  return grid;
};

/**
 * Animate glass card entrance
 * @param {HTMLElement} element - Target element
 * @param {string} animation - Animation type
 * @param {number} delay - Delay in seconds
 */
export const animateGlassCard = (element, animation = 'fadeUp', delay = 0) => {
  if (!element || prefersReducedMotion()) return;

  const animations = {
    fadeUp: {
      from: { opacity: 0, transform: 'translateY(30px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    scale: {
      from: { opacity: 0, transform: 'scale(0.9)' },
      to: { opacity: 1, transform: 'scale(1)' },
    },
  };

  const anim = animations[animation] || animations.fadeUp;

  element.style.cssText += `
    opacity: ${anim.from.opacity};
    transform: ${anim.from.transform || 'none'};
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    transition-delay: ${delay}s;
  `;

  // Trigger reflow
  element.offsetHeight;

  // Apply final state
  element.style.opacity = anim.to.opacity;
  element.style.transform = anim.to.transform || 'none';
};

/**
 * Create responsive glassmorphic container
 * @param {Object} options - Container options
 * @returns {HTMLElement} Container element
 */
export const createGlassContainer = (options = {}) => {
  const {
    children = '',
    padding = '32px',
    borderRadius = '24px',
    variant = 'default',
  } = options;

  const container = document.createElement('div');
  const variants = {
    default: 'rgba(255, 255, 255, 0.7)',
    dark: 'rgba(26, 26, 46, 0.8)',
    primary: 'rgba(244, 145, 26, 0.1)',
  };

  container.style.cssText = `
    background: ${variants[variant] || variants.default};
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: ${borderRadius};
    padding: ${padding};
    position: relative;
    overflow: hidden;
  `;

  if (children) {
    container.innerHTML = children;
  }

  return container;
};

/**
 * Export all utilities as default
 */
export default {
  generateGradient,
  generateGlassShadow,
  generateBlur,
  prefersReducedMotion,
  addShimmerEffect,
  createGlassModal,
  applyGlassStyles,
  createBentoGrid,
  animateGlassCard,
  createGlassContainer,
};
