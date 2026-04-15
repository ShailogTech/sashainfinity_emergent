import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Enhanced GlassModal - Premium glassmorphic modal dialog
 *
 * @param {Object} props - Component props
 * @param {boolean} props.open - Modal open state
 * @param {Function} props.onClose - Modal close handler
 * @param {string} props.size - Modal size: 'sm' | 'md' | 'lg' | 'xl' | 'full'
 * @param {string} props.variant - Visual variant: 'default' | 'primary' | 'dark' | 'neon'
 * @param {boolean} props.closeOnOverlay - Close on overlay click
 * @param {boolean} props.closeOnEscape - Close on Escape key
 * @param {boolean} props.showCloseButton - Show close button
 * @param {boolean} props.animated - Enable animations
 * @param {ReactNode} props.children - Modal content
 * @param {string} props.className - Additional CSS classes
 */
const GlassModal = ({
  open,
  onClose,
  size = 'md',
  variant = 'default',
  closeOnOverlay = true,
  closeOnEscape = true,
  showCloseButton = true,
  animated = true,
  children,
  className,
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  const variantStyles = {
    default: {
      bg: 'rgba(255, 255, 255, 0.85)',
      border: 'rgba(255, 255, 255, 0.4)',
    },
    primary: {
      bg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(244, 145, 26, 0.05) 100%)',
      border: 'rgba(244, 145, 26, 0.3)',
    },
    dark: {
      bg: 'rgba(26, 26, 46, 0.9)',
      border: 'rgba(255, 255, 255, 0.15)',
    },
    neon: {
      bg: 'linear-gradient(135deg, rgba(244, 145, 26, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)',
      border: 'rgba(244, 145, 26, 0.4)',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;

  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement;
      if (modalRef.current) {
        modalRef.current.focus();
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (closeOnEscape && e.key === 'Escape' && open) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, onClose]);

  const handleOverlayClick = (e) => {
    if (closeOnOverlay && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      {/* Animated Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          'relative w-full',
          sizeStyles[size],
          'rounded-3xl shadow-2xl',
          'max-h-[90vh] overflow-hidden',
          'transition-all duration-300',
          animated && 'animate-modal-slide-in',
          className
        )}
        style={{
          background: currentVariant.bg,
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: `1px solid ${currentVariant.border}`,
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 pointer-events-none" />

        {/* Decorative glow */}
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 pointer-events-none blur-3xl"
          style={{
            background: variant === 'neon' ? 'rgba(244, 145, 26, 0.4)' : 'rgba(244, 145, 26, 0.2)',
          }}
        />

        {/* Close button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-white/30 transition-all hover:scale-110 group"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Content */}
        <div className="relative z-10 overflow-y-auto max-h-[90vh]">
          {children}
        </div>
      </div>

      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-slide-in {
          animation: modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

/**
 * GlassModalHeader - Modal header component
 */
const GlassModalHeader = ({ children, className, ...props }) => (
  <div className={cn('px-8 pt-8 pb-6 border-b border-gray-200/30', className)} {...props}>
    {children}
  </div>
);

/**
 * GlassModalTitle - Modal title component
 */
const GlassModalTitle = ({ children, className, ...props }) => (
  <h2 className={cn('text-2xl font-bold text-gray-800 font-["Lexend_Deca"]', className)} {...props}>
    {children}
  </h2>
);

/**
 * GlassModalBody - Modal body component
 */
const GlassModalBody = ({ children, className, ...props }) => (
  <div className={cn('px-8 py-6', className)} {...props}>
    {children}
  </div>
);

/**
 * GlassModalFooter - Modal footer component
 */
const GlassModalFooter = ({ children, className, ...props }) => (
  <div className={cn('px-8 py-6 border-t border-gray-200/30 flex items-center justify-end gap-3', className)} {...props}>
    {children}
  </div>
);

/**
 * GlassModalClose - Close button component
 */
const GlassModalClose = ({ onClose, children = 'Close', className, ...props }) => (
  <button
    onClick={onClose}
    className={cn(
      'px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all hover:scale-105',
      className
    )}
    {...props}
  >
    {children}
  </button>
);

/**
 * GlassModalAction - Primary action button component
 */
const GlassModalAction = ({ onClick, children = 'Confirm', variant = 'primary', className, ...props }) => {
  const variantStyles = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white',
    secondary: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white',
    success: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'px-6 py-2.5 rounded-xl font-medium transition-all hover:scale-105 shadow-lg hover:shadow-xl',
        variantStyles[variant] || variantStyles.primary,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

// Attach sub-components
GlassModal.Header = GlassModalHeader;
GlassModal.Title = GlassModalTitle;
GlassModal.Body = GlassModalBody;
GlassModal.Footer = GlassModalFooter;
GlassModal.Close = GlassModalClose;
GlassModal.Action = GlassModalAction;

export default GlassModal;
