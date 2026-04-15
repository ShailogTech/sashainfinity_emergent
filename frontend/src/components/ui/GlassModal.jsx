import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * GlassModal - A beautiful glassmorphic modal dialog
 *
 * @param {Object} props - Component props
 * @param {boolean} props.open - Modal open state
 * @param {Function} props.onClose - Modal close handler
 * @param {string} props.size - Modal size: 'sm' | 'md' | 'lg' | 'xl' | 'full'
 * @param {boolean} props.closeOnOverlay - Close on overlay click
 * @param {boolean} props.closeOnEscape - Close on Escape key
 * @param {boolean} props.showCloseButton - Show close button
 * @param {ReactNode} props.children - Modal content
 * @param {string} props.className - Additional CSS classes
 */
const GlassModal = ({
  open,
  onClose,
  size = 'md',
  closeOnOverlay = true,
  closeOnEscape = true,
  showCloseButton = true,
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

  useEffect(() => {
    if (open) {
      // Store previous active element
      previousActiveElement.current = document.activeElement;

      // Focus modal
      if (modalRef.current) {
        modalRef.current.focus();
      }

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';

      // Restore focus
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        style={{
          animation: 'fadeIn 0.2s ease-out',
        }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          'relative w-full',
          'bg-white/80 backdrop-blur-xl',
          'border border-white/30',
          'rounded-2xl shadow-2xl',
          'transition-all duration-300 ease-out',
          'max-h-[90vh] overflow-hidden',
          sizeStyles[size],
          className
        )}
        style={{
          animation: 'modalSlideIn 0.3s ease-out',
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20 pointer-events-none" />

        {/* Close button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-white/30 transition-all hover:scale-110"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Content */}
        <div className="relative z-10 overflow-y-auto max-h-[90vh]">
          {children}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

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
      `}</style>
    </div>
  );
};

/**
 * GlassModalHeader - Modal header component
 */
const GlassModalHeader = ({ children, className }) => (
  <div className={cn('px-6 pt-6 pb-4 border-b border-gray-200/30', className)}>
    {children}
  </div>
);

/**
 * GlassModalBody - Modal body component
 */
const GlassModalBody = ({ children, className }) => (
  <div className={cn('px-6 py-4', className)}>
    {children}
  </div>
);

/**
 * GlassModalFooter - Modal footer component
 */
const GlassModalFooter = ({ children, className }) => (
  <div className={cn('px-6 py-4 border-t border-gray-200/30 flex items-center justify-end gap-3', className)}>
    {children}
  </div>
);

// Attach sub-components
GlassModal.Header = GlassModalHeader;
GlassModal.Body = GlassModalBody;
GlassModal.Footer = GlassModalFooter;

export default GlassModal;
