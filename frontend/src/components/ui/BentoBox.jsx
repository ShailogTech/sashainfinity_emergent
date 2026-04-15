import React from 'react';
import { cn } from '@/lib/utils';

/**
 * BentoBox - A responsive bento-grid layout system
 *
 * @param {Object} props - Component props
 * @param {string} props.columns - Grid columns: '1' | '2' | '3' | '4' | 'auto'
 * @param {number} props.gap - Gap between items in pixels
 * @param {boolean} props.autoResize - Auto-resize items based on content
 * @param {ReactNode} props.children - Grid items
 * @param {string} props.className - Additional CSS classes
 */
const BentoBox = ({
  columns = 'auto',
  gap = 20,
  autoResize = true,
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
      {children}
    </div>
  );
};

/**
 * BentoItem - Individual bento grid item
 *
 * @param {Object} props - Component props
 * @param {string} props.span - Column span: '1' | '2' | '3' | '4'
 * @param {string} props.rowSpan - Row span: '1' | '2' | '3'
 * @param {boolean} props.tall - Make item taller (2 rows)
 * @param {boolean} props.wide - Make item wider (2 columns)
 * @param {ReactNode} props.children - Item content
 * @param {string} props.className - Additional CSS classes
 */
const BentoItem = ({
  span = '1',
  rowSpan = '1',
  tall = false,
  wide = false,
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
 * BentoCard - Pre-styled card for bento grids
 *
 * @param {Object} props - Component props
 * @param {string} props.variant - Card variant: 'default' | 'primary' | 'secondary' | 'accent' | 'gradient'
 * @param {boolean} props.interactive - Enable interactive hover effects
 * @param {ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 */
const BentoCard = ({
  variant = 'default',
  interactive = true,
  children,
  className,
  ...props
}) => {
  const variantStyles = {
    default: 'from-white/80 to-white/60 border-white/30',
    primary: 'from-orange-100/80 to-orange-50/60 border-orange-200/50',
    secondary: 'from-blue-100/80 to-blue-50/60 border-blue-200/50',
    accent: 'from-purple-100/80 to-purple-50/60 border-purple-200/50',
    gradient: 'from-gradient-start/80 to-gradient-end/60 border-white/30',
  };

  return (
    <div
      className={cn(
        'bento-card',
        'relative overflow-hidden',
        'bg-gradient-to-br',
        variantStyles[variant] || variantStyles.default,
        'backdrop-blur-xl',
        'border rounded-2xl',
        'shadow-lg',
        interactive && 'hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer',
        'p-6',
        className
      )}
      {...props}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full hover:animate-shimmer" />
      </div>

      {/* Decorative gradient blob */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, currentColor 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Attach sub-components
BentoBox.Item = BentoItem;
BentoBox.Card = BentoCard;

export default BentoBox;
