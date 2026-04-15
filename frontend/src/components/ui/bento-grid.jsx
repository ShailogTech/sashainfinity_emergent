import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import './bento-grid.css';

/**
 * BentoGrid - Modern CSS Grid layout system for dashboard cards
 *
 * Features:
 * - Flexible 1-6 column layouts
 * - Responsive auto-fit option
 * - Configurable gap and sizing
 * - Support for spanning multiple columns/rows
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Grid items
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.columns - Number of columns (1-6, default: 4)
 * @param {number} props.gap - Gap between items in pixels (default: 24)
 * @param {boolean} props.autoFit - Use auto-fit for responsive columns
 * @param {string} props.minItemWidth - Minimum width for auto-fit items
 * @param {boolean} props.dense - Enable dense packing algorithm
 */
const BentoGrid = forwardRef(({
  children,
  className,
  columns = 4,
  gap = 24,
  autoFit = false,
  minItemWidth = '280px',
  dense = false,
  style,
  ...props
}, ref) => {
  const gridClasses = cn(
    'bento-grid',
    dense && 'bento-grid-dense',
    className
  );

  const gridStyle = {
    '--bento-columns': columns,
    '--bento-gap': `${gap}px`,
    '--bento-min-width': minItemWidth,
    gridTemplateColumns: autoFit
      ? `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`
      : `repeat(${columns}, 1fr)`,
    ...style,
  };

  return (
    <div
      ref={ref}
      className={gridClasses}
      style={gridStyle}
      {...props}
    >
      {children}
    </div>
  );
});

BentoGrid.displayName = 'BentoGrid';

/**
 * BentoItem - Individual grid item with span controls
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Item content
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.colSpan - Number of columns to span (1-6)
 * @param {number} props.rowSpan - Number of rows to span (1-4)
 * @param {number} props.colStart - Column start position
 * @param {number} props.rowStart - Row start position
 * @param {'top' | 'center' | 'bottom' | 'stretch'} props.alignVertical - Vertical alignment
 * @param {boolean} props.noOverflow - Disable overflow hidden
 */
export const BentoItem = forwardRef(({
  children,
  className,
  colSpan = 1,
  rowSpan = 1,
  colStart,
  rowStart,
  alignVertical = 'stretch',
  noOverflow = false,
  style,
  ...props
}, ref) => {
  const itemClasses = cn(
    'bento-item',
    `bento-item-align-${alignVertical}`,
    !noOverflow && 'bento-item-overflow',
    className
  );

  const itemStyle = {
    gridColumn: colStart ? `${colStart} / span ${colSpan}` : `span ${colSpan}`,
    gridRow: rowStart ? `${rowStart} / span ${rowSpan}` : `span ${rowSpan}`,
    ...style,
  };

  return (
    <div
      ref={ref}
      className={itemClasses}
      style={itemStyle}
      {...props}
    >
      <div className="bento-item-inner">
        {children}
      </div>
    </div>
  );
});

BentoItem.displayName = 'BentoItem';

/**
 * BentoGridSection - A section wrapper for bento grids
 */
export const BentoGridSection = ({
  title,
  subtitle,
  actions,
  children,
  className,
}) => (
  <section className={cn('bento-grid-section', className)}>
    {(title || subtitle || actions) && (
      <div className="bento-grid-header">
        <div className="bento-grid-header-content">
          {title && <h2 className="bento-grid-title">{title}</h2>}
          {subtitle && <p className="bento-grid-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="bento-grid-actions">{actions}</div>}
      </div>
    )}
    {children}
  </section>
);

/**
 * Preset bento layouts for common dashboard patterns
 */

/**
 * DashboardLayout - Classic dashboard layout with sidebar and main content
 */
export const DashboardLayout = ({ sidebar, children, className }) => (
  <div className={cn('bento-dashboard-layout', className)}>
    <aside className="bento-dashboard-sidebar">
      {sidebar}
    </aside>
    <main className="bento-dashboard-main">
      {children}
    </main>
  </div>
);

/**
 * StatsLayout - Grid optimized for stat cards
 */
export const StatsLayout = ({ children, columns = 4, className }) => (
  <BentoGrid
    columns={columns}
    gap={20}
    className={cn('bento-stats-layout', className)}
  >
    {children}
  </BentoGrid>
);

/**
 * FeaturedLayout - Layout with one large featured item and smaller supporting items
 */
export const FeaturedLayout = ({ featured, supporting, className }) => (
  <BentoGrid
    columns={4}
    gap={24}
    className={cn('bento-featured-layout', className)}
  >
    <BentoItem colSpan={2} rowSpan={2}>
      {featured}
    </BentoItem>
    {supporting}
  </BentoGrid>
);

export default BentoGrid;
export { BentoGrid };
