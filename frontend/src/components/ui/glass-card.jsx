import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import './glass-card.css';

/**
 * GlassCard - Production-ready glassmorphic card component
 *
 * Features:
 * - Frosted glass effect with backdrop blur
 * - Multiple visual variants (default, primary, secondary, dark, gradient)
 * - Subtle hover opacity effect only (no movement)
 * - Responsive sizing
 * - Optional gradient backgrounds and borders
 *
 * @param {Object} props
 * @param {'default' | 'primary' | 'secondary' | 'dark' | 'gradient' | 'success' | 'accent'} props.variant - Visual variant
 * @param {'sm' | 'md' | 'lg' | 'xl' | 'full'} props.size - Size variant
 * @param {number} props.blur - Blur intensity in pixels (default: 20)
 * @param {number} props.opacity - Background opacity (0-1, default: 0.7)
 * @param {boolean} props.bordered - Show border (default: true)
 * @param {boolean} props.shadow - Enable shadow (default: true)
 * @param {boolean} props.hoverable - Add hover effects (default: false)
 * @param {boolean} props.gradient - Use gradient background (default: false)
 * @param {boolean} props.noise - Add noise texture overlay (default: false)
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 */
const GlassCard = forwardRef(({
  variant = 'default',
  size = 'md',
  blur = 20,
  opacity = 0.7,
  bordered = true,
  shadow = true,
  hoverable = false,
  gradient = false,
  noise = false,
  children,
  className,
  style,
  onClick,
  ...props
}, ref) => {
  const variantClasses = {
    default: 'glass-card-default',
    primary: 'glass-card-primary',
    secondary: 'glass-card-secondary',
    dark: 'glass-card-dark',
    gradient: 'glass-card-gradient',
    success: 'glass-card-success',
    accent: 'glass-card-accent',
    warning: 'glass-card-warning',
    error: 'glass-card-error',
  };

  const sizeClasses = {
    sm: 'glass-card-sm',
    md: 'glass-card-md',
    lg: 'glass-card-lg',
    xl: 'glass-card-xl',
    full: 'glass-card-full',
  };

  const cardClasses = cn(
    'glass-card',
    variantClasses[variant] || variantClasses.default,
    sizeClasses[size] || sizeClasses.md,
    bordered && 'glass-card-bordered',
    shadow && 'glass-card-shadow',
    hoverable && 'glass-card-hoverable',
    noise && 'glass-card-noise',
    onClick && 'glass-card-clickable',
    className
  );

  const cardStyle = {
    '--glass-blur': `${blur}px`,
    '--glass-opacity': opacity,
    ...style,
  };

  return (
    <div
      ref={ref}
      className={cardClasses}
      style={cardStyle}
      onClick={onClick}
      {...props}
    >
      {/* Noise texture overlay */}
      {noise && (
        <div className="glass-card-noise-overlay" aria-hidden="true" />
      )}

      {children}
    </div>
  );
});

GlassCard.displayName = 'GlassCard';

/**
 * GlassCardHeader - Header section for GlassCard
 */
export const GlassCardHeader = ({ title, subtitle, icon, action, className }) => (
  <div className={cn('glass-card-header', className)}>
    <div className="glass-card-header-content">
      {icon && <div className="glass-card-icon">{icon}</div>}
      <div className="glass-card-header-text">
        {title && <h3 className="glass-card-title">{title}</h3>}
        {subtitle && <p className="glass-card-subtitle">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="glass-card-action">{action}</div>}
  </div>
);

/**
 * GlassCardBody - Main content section for GlassCard
 */
export const GlassCardBody = ({ children, className }) => (
  <div className={cn('glass-card-body', className)}>
    {children}
  </div>
);

/**
 * GlassCardFooter - Footer section for GlassCard
 */
export const GlassCardFooter = ({ children, className }) => (
  <div className={cn('glass-card-footer', className)}>
    {children}
  </div>
);

/**
 * GlassStatCard - Specialized card for displaying statistics
 */
export const GlassStatCard = ({
  value,
  label,
  change,
  changeType = 'positive',
  icon,
  variant = 'default',
  size = 'md',
  trend = 'up',
  className
}) => {
  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <GlassCard variant={variant} size={size} hoverable className={cn('glass-stat-card', className)}>
      <div className="glass-stat-header">
        {icon && <div className="glass-stat-icon">{icon}</div>}
        <div className="glass-stat-change-container">
          {change && (
            <div className={cn(
              'glass-stat-change',
              changeType === 'positive' && 'glass-stat-positive',
              changeType === 'negative' && 'glass-stat-negative',
              changeType === 'neutral' && 'glass-stat-neutral'
            )}>
              <span className="glass-stat-trend">{trendIcons[trend]}</span>
              <span>{change}</span>
            </div>
          )}
        </div>
      </div>
      <div className="glass-stat-value">{value}</div>
      <div className="glass-stat-label">{label}</div>
    </GlassCard>
  );
};

/**
 * GlassProgressCard - Card with circular or linear progress indicator
 */
export const GlassProgressCard = ({
  title,
  progress,
  total,
  size = 'md',
  type = 'circular',
  variant = 'primary',
  className
}) => {
  const percentage = Math.round((progress / total) * 100);
  const circumference = 2 * Math.PI * 54; // radius = 54
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <GlassCard variant={variant} size={size} className={cn('glass-progress-card', className)}>
      {title && <div className="glass-progress-title">{title}</div>}
      {type === 'circular' ? (
        <div className="glass-progress-circular">
          <svg className="glass-progress-ring" width="120" height="120">
            <circle
              className="glass-progress-ring-bg"
              cx="60"
              cy="60"
              r="54"
            />
            <circle
              className="glass-progress-ring-fill"
              cx="60"
              cy="60"
              r="54"
              style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
            />
          </svg>
          <div className="glass-progress-text">
            <span className="glass-progress-percentage">{percentage}%</span>
          </div>
        </div>
      ) : (
        <div className="glass-progress-linear">
          <div className="glass-progress-bar">
            <div className="glass-progress-fill" style={{ width: `${percentage}%` }} />
          </div>
          <div className="glass-progress-labels">
            <span>{progress}</span>
            <span>{total}</span>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export default GlassCard;
export { GlassCard };
