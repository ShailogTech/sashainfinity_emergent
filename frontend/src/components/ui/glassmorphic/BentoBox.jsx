import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Enhanced BentoBox - Premium responsive bento-grid layout system
 *
 * @param {Object} props - Component props
 * @param {string} props.columns - Grid columns: '1' | '2' | '3' | '4' | 'auto'
 * @param {number} props.gap - Gap between items in pixels
 * @param {boolean} props.autoResize - Auto-resize items based on content
 * @param {string} props.variant - Visual variant for all cards
 * @param {ReactNode} props.children - Grid items
 * @param {string} props.className - Additional CSS classes
 */
const BentoBox = ({
  columns = 'auto',
  gap = 20,
  autoResize = true,
  variant,
  children,
  className,
  ...props
}) => {
  const columnStyles = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 md:grid-cols-2',
    '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    'auto': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-auto',
  };

  return (
    <div
      className={cn(
        'bento-grid',
        'grid',
        columnStyles[columns] || columnStyles.auto,
        className
      )}
      style={{
        gap: `${gap}px`,
        ...props,
      }}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && variant) {
          return React.cloneElement(child, { variant: child.props.variant || variant });
        }
        return child;
      })}
    </div>
  );
};

/**
 * BentoItem - Individual bento grid item with span control
 *
 * @param {Object} props - Component props
 * @param {string} props.span - Column span: '1' | '2' | '3' | '4'
 * @param {string} props.rowSpan - Row span: '1' | '2' | '3'
 * @param {boolean} props.tall - Make item taller (2 rows)
 * @param {boolean} props.wide - Make item wider (2 columns)
 * @param {boolean} props.square - Make item square (2x2)
 * @param {ReactNode} props.children - Item content
 * @param {string} props.className - Additional CSS classes
 */
const BentoItem = ({
  span = '1',
  rowSpan = '1',
  tall = false,
  wide = false,
  square = false,
  children,
  className,
  ...props
}) => {
  const spanStyles = {
    '1': 'col-span-1',
    '2': 'col-span-1 md:col-span-2',
    '3': 'col-span-1 lg:col-span-3',
    '4': 'col-span-1 xl:col-span-4',
  };

  const rowSpanStyles = {
    '1': 'row-span-1',
    '2': 'row-span-2',
    '3': 'row-span-3',
  };

  return (
    <div
      className={cn(
        'bento-item',
        spanStyles[span] || spanStyles['1'],
        rowSpanStyles[rowSpan] || rowSpanStyles['1'],
        tall && 'row-span-2',
        wide && 'md:col-span-2',
        square && 'md:col-span-2 row-span-2',
        'transition-all duration-300 ease-out',
        'hover:scale-[1.02]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * BentoCard - Pre-styled glassmorphic card for bento grids
 *
 * @param {Object} props - Component props
 * @param {string} props.variant - Card variant: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'dark' | 'neon'
 * @param {boolean} props.interactive - Enable interactive hover effects
 * @param {boolean} props.gradient - Enable gradient background
 * @param {boolean} props.glowing - Add glowing effect
 * @param {string} props.size - Card padding size
 * @param {ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler
 */
const BentoCard = ({
  variant = 'default',
  interactive = true,
  gradient = false,
  glowing = false,
  size = 'md',
  children,
  className,
  onClick,
  ...props
}) => {
  const variantStyles = {
    default: {
      from: 'rgba(255, 255, 255, 0.9)',
      to: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(255, 255, 255, 0.4)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    },
    primary: {
      from: 'rgba(244, 145, 26, 0.2)',
      to: 'rgba(244, 145, 26, 0.05)',
      border: 'rgba(244, 145, 26, 0.4)',
      shadow: '0 8px 32px rgba(244, 145, 26, 0.2)',
    },
    secondary: {
      from: 'rgba(8, 42, 94, 0.2)',
      to: 'rgba(8, 42, 94, 0.05)',
      border: 'rgba(8, 42, 94, 0.4)',
      shadow: '0 8px 32px rgba(8, 42, 94, 0.2)',
    },
    accent: {
      from: 'rgba(102, 126, 234, 0.2)',
      to: 'rgba(102, 126, 234, 0.05)',
      border: 'rgba(102, 126, 234, 0.4)',
      shadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
    },
    success: {
      from: 'rgba(67, 233, 123, 0.2)',
      to: 'rgba(67, 233, 123, 0.05)',
      border: 'rgba(67, 233, 123, 0.4)',
      shadow: '0 8px 32px rgba(67, 233, 123, 0.2)',
    },
    dark: {
      from: 'rgba(26, 26, 46, 0.9)',
      to: 'rgba(8, 42, 94, 0.7)',
      border: 'rgba(255, 255, 255, 0.15)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    },
    neon: {
      from: 'rgba(244, 145, 26, 0.15)',
      to: 'rgba(102, 126, 234, 0.1)',
      border: 'rgba(244, 145, 26, 0.5)',
      shadow: '0 0 30px rgba(244, 145, 26, 0.3)',
    },
  };

  const sizeStyles = {
    sm: 'p-5',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={cn(
        'bento-card',
        'relative overflow-hidden',
        'backdrop-blur-xl',
        'border rounded-2xl',
        'transition-all duration-300',
        interactive && 'hover:shadow-2xl hover:scale-[1.02] cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        background: gradient
          ? `linear-gradient(135deg, ${currentVariant.from} 0%, ${currentVariant.to} 100%)`
          : currentVariant.from,
        borderColor: currentVariant.border,
        boxShadow: currentVariant.shadow,
        ...props.style,
      }}
      onClick={onClick}
      {...props}
    >
      {/* Shimmer effect */}
      {interactive && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
        </div>
      )}

      {/* Glowing effect */}
      {glowing && (
        <div
          className="absolute -inset-1 opacity-30 blur-xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${currentVariant.border}, transparent 70%)`,
          }}
        />
      )}

      {/* Decorative gradient blob */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle, currentColor 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

/**
 * BentoCardHeader - Header section for BentoCard
 */
const BentoCardHeader = ({ children, className, ...props }) => (
  <div className={cn('bento-card-header', 'mb-4 flex items-start justify-between', className)} {...props}>
    {children}
  </div>
);

/**
 * BentoCardTitle - Title component for BentoCard
 */
const BentoCardTitle = ({ children, className, ...props }) => (
  <h3
    className={cn(
      'bento-card-title',
      'text-lg font-semibold',
      'font-["Lexend_Deca",sans-serif]',
      className
    )}
    {...props}
  >
    {children}
  </h3>
);

/**
 * BentoCardValue - Large value display for stats
 */
const BentoCardValue = ({ children, className, ...props }) => (
  <div
    className={cn(
      'bento-card-value',
      'text-4xl font-bold',
      'font-["Lexend_Deca",sans-serif]',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

/**
 * BentoCardLabel - Label for values
 */
const BentoCardLabel = ({ children, className, ...props }) => (
  <p className={cn('bento-card-label', 'text-sm text-gray-500 mt-1', className)} {...props}>
    {children}
  </p>
);

/**
 * BentoCardIcon - Icon container
 */
const BentoCardIcon = ({ children, variant = 'default', className, ...props }) => {
  const variantStyles = {
    default: 'bg-white/50 text-gray-600',
    primary: 'bg-orange-100/50 text-orange-500',
    secondary: 'bg-blue-100/50 text-blue-500',
    accent: 'bg-purple-100/50 text-purple-500',
    success: 'bg-green-100/50 text-green-500',
    dark: 'bg-gray-800/50 text-white',
  };

  return (
    <div
      className={cn(
        'bento-card-icon',
        'w-12 h-12 rounded-xl flex items-center justify-center',
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
 * BentoCardProgress - Progress bar component
 */
const BentoCardProgress = ({ value, max = 100, variant = 'primary', className, ...props }) => {
  const variantColors = {
    primary: 'bg-orange-500',
    secondary: 'bg-blue-500',
    accent: 'bg-purple-500',
    success: 'bg-green-500',
  };

  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn('bento-card-progress', 'mt-4', className)} {...props}>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-500">Progress</span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <div className="h-2 bg-gray-200/50 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', variantColors[variant] || variantColors.primary)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

/**
 * BentoCardList - List component for bento cards
 */
const BentoCardList = ({ items, className, ...props }) => (
  <ul className={cn('bento-card-list', 'space-y-3 mt-4', className)} {...props}>
    {items.map((item, index) => (
      <li key={index} className="flex items-center gap-3 text-sm">
        <span className={cn(
          'w-2 h-2 rounded-full',
          item.completed ? 'bg-green-500' : 'bg-gray-300'
        )} />
        <span className={cn(item.completed ? 'text-gray-800' : 'text-gray-500')}>
          {item.label}
        </span>
      </li>
    ))}
  </ul>
);

// Attach sub-components
BentoBox.Item = BentoItem;
BentoBox.Card = BentoCard;
BentoCard.Header = BentoCardHeader;
BentoCard.Title = BentoCardTitle;
BentoCard.Value = BentoCardValue;
BentoCard.Label = BentoCardLabel;
BentoCard.Icon = BentoCardIcon;
BentoCard.Progress = BentoCardProgress;
BentoCard.List = BentoCardList;

export default BentoBox;
