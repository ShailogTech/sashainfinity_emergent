import React from 'react';
import { cn } from '@/lib/utils';

/**
 * GlassCard - A beautiful glassmorphic card component with blur effects
 *
 * @param {Object} props - Component props
 * @param {string} props.variant - Visual variant: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'
 * @param {string} props.size - Size variant: 'sm' | 'md' | 'lg' | 'xl'
 * @param {number} props.blur - Blur intensity in pixels (default: 20)
 * @param {number} props.opacity - Background opacity (0-1)
 * @param {boolean} props.bordered - Show border
 * @param {boolean} props.shadow - Enable shadow
 * @param {boolean} props.hoverable - Add hover effects
 * @param {boolean} props.gradient - Enable gradient background
 * @param {ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 */
const GlassCard = React.forwardRef(({
  variant = 'default',
  size = 'md',
  blur = 20,
  opacity = 0.7,
  bordered = true,
  shadow = true,
  hoverable = false,
  gradient = false,
  children,
  className,
  style,
  ...props
}, ref) => {
  const variantStyles = {
    default: {
      bg: gradient ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(255, 255, 255, 0.3)',
      gradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      hoverShadow: '0 12px 48px rgba(0, 0, 0, 0.12)',
    },
    primary: {
      bg: gradient ? 'rgba(244, 145, 26, 0.15)' : 'rgba(244, 145, 26, 0.08)',
      border: 'rgba(244, 145, 26, 0.3)',
      gradient: 'linear-gradient(135deg, rgba(244, 145, 26, 0.15) 0%, rgba(244, 145, 26, 0.05) 100%)',
      shadow: '0 8px 32px rgba(244, 145, 26, 0.15)',
      hoverShadow: '0 12px 48px rgba(244, 145, 26, 0.25)',
    },
    secondary: {
      bg: gradient ? 'rgba(8, 42, 94, 0.15)' : 'rgba(8, 42, 94, 0.08)',
      border: 'rgba(8, 42, 94, 0.3)',
      gradient: 'linear-gradient(135deg, rgba(8, 42, 94, 0.15) 0%, rgba(8, 42, 94, 0.05) 100%)',
      shadow: '0 8px 32px rgba(8, 42, 94, 0.15)',
      hoverShadow: '0 12px 48px rgba(8, 42, 94, 0.25)',
    },
    accent: {
      bg: gradient ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.08)',
      border: 'rgba(102, 126, 234, 0.3)',
      gradient: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(102, 126, 234, 0.05) 100%)',
      shadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
      hoverShadow: '0 12px 48px rgba(102, 126, 234, 0.25)',
    },
    success: {
      bg: gradient ? 'rgba(67, 233, 123, 0.15)' : 'rgba(67, 233, 123, 0.08)',
      border: 'rgba(67, 233, 123, 0.3)',
      gradient: 'linear-gradient(135deg, rgba(67, 233, 123, 0.15) 0%, rgba(67, 233, 123, 0.05) 100%)',
      shadow: '0 8px 32px rgba(67, 233, 123, 0.15)',
      hoverShadow: '0 12px 48px rgba(67, 233, 123, 0.25)',
    },
    warning: {
      bg: gradient ? 'rgba(245, 87, 108, 0.15)' : 'rgba(245, 87, 108, 0.08)',
      border: 'rgba(245, 87, 108, 0.3)',
      gradient: 'linear-gradient(135deg, rgba(245, 87, 108, 0.15) 0%, rgba(245, 87, 108, 0.05) 100%)',
      shadow: '0 8px 32px rgba(245, 87, 108, 0.15)',
      hoverShadow: '0 12px 48px rgba(245, 87, 108, 0.25)',
    },
    error: {
      bg: gradient ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)',
      border: 'rgba(239, 68, 68, 0.3)',
      gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
      shadow: '0 8px 32px rgba(239, 68, 68, 0.15)',
      hoverShadow: '0 12px 48px rgba(239, 68, 68, 0.25)',
    },
  };

  const sizeStyles = {
    sm: { padding: '16px', borderRadius: '12px' },
    md: { padding: '24px', borderRadius: '16px' },
    lg: { padding: '32px', borderRadius: '20px' },
    xl: { padding: '40px', borderRadius: '24px' },
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;
  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div
      ref={ref}
      className={cn(
        'glass-card',
        'transition-all duration-300 ease-out',
        hoverable && 'hover:scale-[1.02] hover:-translate-y-1 cursor-pointer',
        className
      )}
      style={{
        background: gradient ? currentVariant.gradient : currentVariant.bg.replace('0.7', opacity.toString()),
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        border: bordered ? `1px solid ${currentVariant.border}` : 'none',
        boxShadow: shadow ? currentVariant.shadow : 'none',
        ...currentSize,
        position: 'relative',
        overflow: 'hidden',
        ...(hoverable && {
          ':hover': {
            boxShadow: currentVariant.hoverShadow,
          }
        }),
        ...style,
      }}
      {...props}
    >
      {/* Shimmer effect on hover */}
      {hoverable && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:animate-shimmer" />
        </div>
      )}

      {children}
    </div>
  );
});

GlassCard.displayName = 'GlassCard';

export default GlassCard;
