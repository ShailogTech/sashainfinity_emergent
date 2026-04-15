import React from 'react';
import './BentoGrid.css';

/**
 * BentoGrid - Modern CSS Grid layout for dashboard cards
 *
 * @param {React.ReactNode} children - Grid items
 * @param {string} className - Additional CSS classes
 * @param {number} columns - Number of columns (1-6)
 * @param {number} gap - Gap between items in pixels
 * @param {boolean} autoFit - Use auto-fit for responsive columns
 * @param {string} minItemWidth - Minimum width for auto-fit items
 */
const BentoGrid = ({
  children,
  className = '',
  columns = 4,
  gap = 24,
  autoFit = false,
  minItemWidth = '280px',
  ...props
}) => {
  const gridClasses = [
    'bento-grid',
    className
  ].filter(Boolean).join(' ');

  const gridStyle = {
    '--bento-columns': columns,
    '--bento-gap': `${gap}px`,
    '--bento-min-width': minItemWidth,
    gridTemplateColumns: autoFit
      ? `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`
      : `repeat(${columns}, 1fr)`
  };

  return (
    <div className={gridClasses} style={gridStyle} {...props}>
      {children}
    </div>
  );
};

/**
 * BentoItem - Individual grid item with span controls
 *
 * @param {React.ReactNode} children - Item content
 * @param {string} className - Additional CSS classes
 * @param {number} colSpan - Number of columns to span (1-6)
 * @param {number} rowSpan - Number of rows to span (1-4)
 * @param {number} colStart - Column start position
 * @param {number} rowStart - Row start position
 */
export const BentoItem = ({
  children,
  className = '',
  colSpan = 1,
  rowSpan = 1,
  colStart,
  rowStart,
  ...props
}) => {
  const itemClasses = [
    'bento-item',
    className
  ].filter(Boolean).join(' ');

  const itemStyle = {
    '--bento-col-span': colSpan,
    '--bento-row-span': rowSpan,
    gridColumn: `span ${colSpan}`,
    gridRow: `span ${rowSpan}`,
    ...(colStart && { gridColumnStart: colStart }),
    ...(rowStart && { gridRowStart: rowStart })
  };

  return (
    <div className={itemClasses} style={itemStyle} {...props}>
      {children}
    </div>
  );
};

export default BentoGrid;
