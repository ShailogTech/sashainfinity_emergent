import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Enhanced GlassCard - Premium glassmorphic card component
 *
 * @param {Object} props - Component props
 * @param {string} props.variant - Visual variant: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'dark' | 'neon'
 * @param {string} props.size - Size variant: 'sm' | 'md' | 'lg' | 'xl'
 * @param {number} props.blur - Blur intensity in pixels (default: 20)
 * @param {number} props.opacity - Background opacity (0-1)
 * @param {boolean} props.bordered - Show border
 * @param {boolean} props.shadow - Enable shadow
 * @param {boolean} props.hoverable - Add hover effects
 * @param {boolean} props.gradient - Enable gradient background
 * @param {boolean} props.glowing - Add glowing effect
 * @param {boolean} props.animated - Add subtle animation
 * @param {ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 * @param {Function} props.onClick - Click handler
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
  glowing = false,
  animated = false,
  children,
  className,
  style,
  onClick,
  ...props
}, ref) => {
  const cardRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const variantStyles = {
    default: {
      bg: gradient ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.5) 100%)' : `rgba(255, 255, 255, ${opacity})`,
      border: 'rgba(255, 255, 255, 0.4)',
      shadow: shadow ? '0 8px 32px rgba(0, 0, 0, 0.08)' : 'none',
      hoverShadow: '0 16px 48px rgba(0, 0, 0, 0.15)',
      glow: 'rgba(255, 255, 255, 0.3)',
    },
    primary: {
      bg: gradient ? 'linear-gradient(135deg, rgba(244, 145, 26, 0.2) 0%, rgba(244, 145, 26, 0.05) 100%)' : `rgba(244, 145, 26, ${opacity * 0.15})`,
      border: 'rgba(244, 145, 26, 0.4)',
      shadow: shadow ? '0 8px 32px rgba(244, 145, 26, 0.2)' : 'none',
      hoverShadow: '0 16px 48px rgba(244, 145, 26, 0.35)',
      glow: 'rgba(244, 145, 26, 0.4)',
    },
    secondary: {
      bg: gradient ? 'linear-gradient(135deg, rgba(8, 42, 94, 0.2) 0%, rgba(8, 42, 94, 0.05) 100%)' : `rgba(8, 42, 94, ${opacity * 0.15})`,
      border: 'rgba(8, 42, 94, 0.4)',
      shadow: shadow ? '0 8px 32px rgba(8, 42, 94, 0.2)' : 'none',
      hoverShadow: '0 16px 48px rgba(8, 42, 94, 0.35)',
      glow: 'rgba(8, 42, 94, 0.4)',
    },
    accent: {
      bg: gradient ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(102, 126, 234, 0.05) 100%)' : `rgba(102, 126, 234, ${opacity * 0.15})`,
      border: 'rgba(102, 126, 234, 0.4)',
      shadow: shadow ? '0 8px 32px rgba(102, 126, 234, 0.2)' : 'none',
      hoverShadow: '0 16px 48px rgba(102, 126, 234, 0.35)',
      glow: 'rgba(102, 126, 234, 0.4)',
    },
    success: {
      bg: gradient ? 'linear-gradient(135deg, rgba(67, 233, 123, 0.2) 0%, rgba(67, 233, 123, 0.05) 100%)' : `rgba(67, 233, 123, ${opacity * 0.15})`,
      border: 'rgba(67, 233, 123, 0.4)',
      shadow: shadow ? '0 8px 32px rgba(67, 233, 123, 0.2)' : 'none',
      hoverShadow: '0 16px 48px rgba(67, 233, 123, 0.35)',
      glow: 'rgba(67, 233, 123, 0.4)',
    },
    warning: {
      bg: gradient ? 'linear-gradient(135deg, rgba(245, 87, 108, 0.2) 0%, rgba(245, 87, 108, 0.05) 100%)' : `rgba(245, 87, 108, ${opacity * 0.15})`,
      border: 'rgba(245, 87, 108, 0.4)',
      shadow: shadow ? '0 8px 32px rgba(245, 87, 108, 0.2)' : 'none',
      hoverShadow: '0 16px 48px rgba(245, 87, 108, 0.35)',
      glow: 'rgba(245, 87, 108, 0.4)',
    },
    error: {
      bg: gradient ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%)' : `rgba(239, 68, 68, ${opacity * 0.15})`,
      border: 'rgba(239, 68, 68, 0.4)',
      shadow: shadow ? '0 8px 32px rgba(239, 68, 68, 0.2)' : 'none',
      hoverShadow: '0 16px 48px rgba(239, 68, 68, 0.35)',
      glow: 'rgba(239, 68, 68, 0.4)',
    },
    dark: {
      bg: gradient ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(8, 42, 94, 0.7) 100%)' : `rgba(26, 26, 46, ${opacity + 0.2})`,
      border: 'rgba(255, 255, 255, 0.15)',
      shadow: shadow ? '0 8px 32px rgba(0, 0, 0, 0.3)' : 'none',
      hoverShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
      glow: 'rgba(244, 145, 26, 0.3)',
    },
    neon: {
      bg: gradient ? 'linear-gradient(135deg, rgba(244, 145, 26, 0.15) 0%, rgba(102, 126, 234, 0.15) 50%, rgba(67, 233, 123, 0.15) 100%)' : `rgba(244, 145, 26, ${opacity * 0.1})`,
      border: 'rgba(244, 145, 26, 0.5)',
      shadow: shadow ? '0 0 30px rgba(244, 145, 26, 0.3), 0 8px 32px rgba(0, 0, 0, 0.1)' : 'none',
      hoverShadow: '0 0 50px rgba(244, 145, 26, 0.5), 0 16px 48px rgba(0, 0, 0, 0.2)',
      glow: 'rgba(244, 145, 26, 0.6)',
    },
  };

  const sizeStyles = {
    sm: { padding: '12px 16px', borderRadius: '12px' },
    md: { padding: '20px 24px', borderRadius: '16px' },
    lg: { padding: '28px 32px', borderRadius: '20px' },
    xl: { padding: '36px 40px', borderRadius: '24px' },
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;
  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div
      ref={(node) => {
        cardRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn(
        'glass-card',
        'transition-all duration-500',
        hoverable && 'hover:scale-[1.02] hover:-translate-y-1 cursor-pointer',
        animated && 'glass-card-animated',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        background: currentVariant.bg,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        border: bordered ? `1px solid ${currentVariant.border}` : 'none',
        boxShadow: isHovered && hoverable ? currentVariant.hoverShadow : currentVariant.shadow,
        ...currentSize,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      onMouseMove={hoverable ? handleMouseMove : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      {...props}
    >
      {/* Mouse-following glow effect */}
      {hoverable && isHovered && (
        <div
          className="absolute inset-0 opacity-50 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 150px at ${mousePosition.x}% ${mousePosition.y}%, ${currentVariant.glow}, transparent 100%)`,
          }}
        />
      )}

      {/* Persistent glow effect */}
      {glowing && (
        <div
          className="absolute -inset-1 opacity-30 blur-xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${currentVariant.glow}, transparent 70%)`,
          }}
        />
      )}

      {/* Shimmer effect */}
      {hoverable && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
        </div>
      )}

      {/* Animated border gradient */}
      {animated && bordered && (
        <div
          className="absolute inset-0 rounded-inherit opacity-30 pointer-events-none"
          style={{
            background: 'linear-gradient(45deg, transparent, rgba(244, 145, 26, 0.3), transparent)',
            backgroundSize: '200% 200%',
            animation: 'borderGradient 3s ease infinite',
          }}
        />
      )}

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
});

GlassCard.displayName = 'GlassCard';

/**
 * GlassCardHeader - Header section for GlassCard
 */
const GlassCardHeader = ({ children, className, ...props }) => (
  <div className={cn('glass-card-header', 'mb-4', className)} {...props}>
    {children}
  </div>
);

/**
 * GlassCardTitle - Title component for GlassCard
 */
const GlassCardTitle = ({ children, className, ...props }) => (
  <h3
    className={cn(
      'glass-card-title',
      'text-lg font-semibold text-gray-800',
      'font-["Lexend_Deca",sans-serif]',
      className
    )}
    {...props}
  >
    {children}
  </h3>
);

/**
 * GlassCardDescription - Description text for GlassCard
 */
const GlassCardDescription = ({ children, className, ...props }) => (
  <p className={cn('glass-card-description', 'text-sm text-gray-500 mt-1', className)} {...props}>
    {children}
  </p>
);

/**
 * GlassCardContent - Main content area for GlassCard
 */
const GlassCardContent = ({ children, className, ...props }) => (
  <div className={cn('glass-card-content', className)} {...props}>
    {children}
  </div>
);

/**
 * GlassCardFooter - Footer section for GlassCard
 */
const GlassCardFooter = ({ children, className, ...props }) => (
  <div className={cn('glass-card-footer', 'mt-4 pt-4 border-t border-gray-200/30 flex items-center', className)} {...props}>
    {children}
  </div>
);

/**
 * GlassCardIcon - Icon container for GlassCard
 */
const GlassCardIcon = ({ children, variant = 'default', className, ...props }) => {
  const variantStyles = {
    default: 'bg-white/50 text-gray-600',
    primary: 'bg-orange-100/50 text-orange-500',
    secondary: 'bg-blue-100/50 text-blue-500',
    accent: 'bg-purple-100/50 text-purple-500',
    success: 'bg-green-100/50 text-green-500',
    warning: 'bg-red-100/50 text-red-500',
  };

  return (
    <div
      className={cn(
        'glass-card-icon',
        'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
        'backdrop-blur-sm border border-white/30',
        variantStyles[variant] || variantStyles.default,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * GlassStatCard - Specialized card for statistics/metrics
 */
const GlassStatCard = ({
  value,
  label,
  change,
  changeType = 'positive',
  icon,
  variant = 'default',
  className,
  ...props
}) => {
  const changeColors = {
    positive: 'text-green-500',
    negative: 'text-red-500',
    neutral: 'text-gray-500',
  };

  return (
    <GlassCard variant={variant} hoverable className={className} {...props}>
      {icon && <GlassCardIcon variant={variant}>{icon}</GlassCardIcon>}
      <div className="glass-stat-value text-3xl font-bold text-gray-800 font-['Lexend_Deca']">
        {value}
      </div>
      <div className="glass-stat-label text-sm text-gray-500 mt-1">{label}</div>
      {change && (
        <div className={cn('glass-stat-change', 'text-sm mt-2 flex items-center gap-1', changeColors[changeType])}>
          {changeType === 'positive' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>}
          {changeType === 'negative' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>}
          <span>{change}</span>
        </div>
      )}
    </GlassCard>
  );
};

// Attach sub-components
GlassCard.Header = GlassCardHeader;
GlassCard.Title = GlassCardTitle;
GlassCard.Description = GlassCardDescription;
GlassCard.Content = GlassCardContent;
GlassCard.Footer = GlassCardFooter;
GlassCard.Icon = GlassCardIcon;
GlassCard.StatCard = GlassStatCard;

export default GlassCard;
