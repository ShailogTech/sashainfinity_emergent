import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Enhanced GlassContainer - Premium glassmorphic container for layout sections
 *
 * @param {Object} props - Component props
 * @param {string} props.variant - Visual variant: 'default' | 'primary' | 'secondary' | 'dark' | 'neon' | 'rainbow'
 * @param {boolean} props.gradient - Enable gradient background
 * @param {number} props.blur - Blur intensity
 * @param {boolean} props.animated - Add subtle animation
 * @param {boolean} props.glowing - Add glowing border effect
 * @param {string} props.size - Container size: 'sm' | 'md' | 'lg' | 'xl' | 'full'
 * @param {ReactNode} props.children - Container content
 * @param {string} props.className - Additional CSS classes
 */
const GlassContainer = ({
  variant = 'default',
  gradient = false,
  blur = 40,
  animated = false,
  glowing = false,
  size = 'md',
  children,
  className,
  ...props
}) => {
  const variantStyles = {
    default: {
      bg: gradient
        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)'
        : 'rgba(255, 255, 255, 0.75)',
      border: 'rgba(255, 255, 255, 0.4)',
      glow: 'rgba(255, 255, 255, 0.5)',
    },
    primary: {
      bg: gradient
        ? 'linear-gradient(135deg, rgba(244, 145, 26, 0.2) 0%, rgba(244, 145, 26, 0.05) 100%)'
        : 'rgba(244, 145, 26, 0.12)',
      border: 'rgba(244, 145, 26, 0.4)',
      glow: 'rgba(244, 145, 26, 0.5)',
    },
    secondary: {
      bg: gradient
        ? 'linear-gradient(135deg, rgba(8, 42, 94, 0.2) 0%, rgba(8, 42, 94, 0.05) 100%)'
        : 'rgba(8, 42, 94, 0.12)',
      border: 'rgba(8, 42, 94, 0.4)',
      glow: 'rgba(8, 42, 94, 0.5)',
    },
    dark: {
      bg: gradient
        ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(8, 42, 94, 0.8) 100%)'
        : 'rgba(26, 26, 46, 0.85)',
      border: 'rgba(255, 255, 255, 0.15)',
      glow: 'rgba(244, 145, 26, 0.4)',
    },
    neon: {
      bg: gradient
        ? 'linear-gradient(135deg, rgba(244, 145, 26, 0.15) 0%, rgba(102, 126, 234, 0.1) 50%, rgba(67, 233, 123, 0.1) 100%)'
        : 'rgba(244, 145, 26, 0.1)',
      border: 'rgba(244, 145, 26, 0.5)',
      glow: 'rgba(244, 145, 26, 0.6)',
    },
    rainbow: {
      bg: gradient
        ? 'linear-gradient(135deg, rgba(244, 145, 26, 0.15) 0%, rgba(102, 126, 234, 0.15) 33%, rgba(67, 233, 123, 0.15) 66%, rgba(245, 87, 108, 0.15) 100%)'
        : 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(244, 145, 26, 0.3)',
      glow: 'rgba(244, 145, 26, 0.4)',
    },
  };

  const sizeStyles = {
    sm: { padding: '16px 20px', borderRadius: '16px' },
    md: { padding: '24px 32px', borderRadius: '20px' },
    lg: { padding: '32px 40px', borderRadius: '24px' },
    xl: { padding: '40px 48px', borderRadius: '28px' },
    full: { padding: '48px 56px', borderRadius: '32px' },
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;
  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div
      className={cn(
        'glass-container',
        'relative overflow-hidden',
        animated && 'glass-container-animated',
        className
      )}
      style={{
        background: currentVariant.bg,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        border: `1px solid ${currentVariant.border}`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        ...currentSize,
        ...props.style,
      }}
      {...props}
    >
      {/* Decorative gradient overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at top right, rgba(244, 145, 26, 0.15) 0%, transparent 50%), radialial-gradient(circle at bottom left, rgba(102, 126, 234, 0.1) 0%, transparent 50%)',
        }}
      />

      {/* Glowing border effect */}
      {glowing && (
        <>
          <div
            className="absolute -inset-0.5 rounded-inherit opacity-30 blur-xl pointer-events-none"
            style={{
              background: `linear-gradient(45deg, ${currentVariant.glow}, transparent, ${currentVariant.glow})`,
              animation: 'glowRotate 3s linear infinite',
            }}
          />
        </>
      )}

      {/* Animated mesh gradient for rainbow variant */}
      {variant === 'rainbow' && gradient && (
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: 'linear-gradient(45deg, rgba(244, 145, 26, 0.2), rgba(102, 126, 234, 0.2), rgba(67, 233, 123, 0.2), rgba(245, 87, 108, 0.2))',
            backgroundSize: '400% 400%',
            animation: 'meshGradient 8s ease infinite',
          }}
        />
      )}

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10">
        {children}
      </div>

      <style>{`
        @keyframes glowRotate {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(180deg); }
        }
        @keyframes meshGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .glass-container-animated {
          animation: containerFloat 6s ease-in-out infinite;
        }
        @keyframes containerFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

/**
 * GlassContainerHeader - Header section for GlassContainer
 */
const GlassContainerHeader = ({ children, className, ...props }) => (
  <div className={cn('glass-container-header', 'mb-6', className)} {...props}>
    {children}
  </div>
);

/**
 * GlassContainerTitle - Title component for GlassContainer
 */
const GlassContainerTitle = ({ children, className, ...props }) => (
  <h2
    className={cn(
      'glass-container-title',
      'text-2xl font-bold text-gray-800',
      'font-["Lexend_Deca",sans-serif]',
      className
    )}
    {...props}
  >
    {children}
  </h2>
);

/**
 * GlassContainerSubtitle - Subtitle component for GlassContainer
 */
const GlassContainerSubtitle = ({ children, className, ...props }) => (
  <p className={cn('glass-container-subtitle', 'text-gray-500 mt-2', className)} {...props}>
    {children}
  </p>
);

/**
 * GlassContainerBody - Body section for GlassContainer
 */
const GlassContainerBody = ({ children, className, ...props }) => (
  <div className={cn('glass-container-body', className)} {...props}>
    {children}
  </div>
);

/**
 * GlassContainerFooter - Footer section for GlassContainer
 */
const GlassContainerFooter = ({ children, className, ...props }) => (
  <div className={cn('glass-container-footer', 'mt-6 pt-6 border-t border-gray-200/30', className)} {...props}>
    {children}
  </div>
);

// Attach sub-components
GlassContainer.Header = GlassContainerHeader;
GlassContainer.Title = GlassContainerTitle;
GlassContainer.Subtitle = GlassContainerSubtitle;
GlassContainer.Body = GlassContainerBody;
GlassContainer.Footer = GlassContainerFooter;

export default GlassContainer;
