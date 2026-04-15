import React from 'react';
import { cn } from '@/lib/utils';

/**
 * GlassContainer - A glassmorphic container for layout sections
 *
 * @param {Object} props - Component props
 * @param {string} props.variant - Visual variant: 'default' | 'dark' | 'colored'
 * @param {boolean} props.gradient - Enable gradient background
 * @param {number} props.blur - Blur intensity
 * @param {ReactNode} props.children - Container content
 * @param {string} props.className - Additional CSS classes
 */
const GlassContainer = ({
  variant = 'default',
  gradient = false,
  blur = 40,
  children,
  className,
  ...props
}) => {
  const variantStyles = {
    default: {
      bg: gradient
        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)'
        : 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(255, 255, 255, 0.3)',
    },
    dark: {
      bg: gradient
        ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(8, 42, 94, 0.6) 100%)'
        : 'rgba(26, 26, 46, 0.8)',
      border: 'rgba(255, 255, 255, 0.1)',
    },
    colored: {
      bg: gradient
        ? 'linear-gradient(135deg, rgba(244, 145, 26, 0.2) 0%, rgba(102, 126, 234, 0.1) 100%)'
        : 'rgba(244, 145, 26, 0.1)',
      border: 'rgba(244, 145, 26, 0.2)',
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <div
      className={cn('glass-container', className)}
      style={{
        background: currentVariant.bg,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        border: `1px solid ${currentVariant.border}`,
        borderRadius: '24px',
        padding: '32px',
        position: 'relative',
        overflow: 'hidden',
        ...props,
      }}
    >
      {/* Decorative gradient overlay */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at top right, rgba(244, 145, 26, 0.1) 0%, transparent 50%)',
        }}
      />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassContainer;
