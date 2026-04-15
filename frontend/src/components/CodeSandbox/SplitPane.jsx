import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GripHorizontal, GripVertical } from 'lucide-react';

const SplitPane = ({
  direction = 'horizontal',
  firstChild,
  secondChild,
  defaultSplit = 50,
  minSize = 10,
  maxSize = 90,
  className = '',
  onResize = null,
  resizerClassName = '',
  firstPaneClassName = '',
  secondPaneClassName = ''
}) => {
  const [split, setSplit] = useState(defaultSplit);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const resizerRef = useRef(null);

  const isHorizontal = direction === 'horizontal';

  // Handle mouse move during drag
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current || !isDragging) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    let newSize;

    if (isHorizontal) {
      const containerWidth = containerRect.width;
      const newSplit = ((e.clientX - containerRect.left) / containerWidth) * 100;
      newSize = Math.max(minSize, Math.min(maxSize, newSplit));
    } else {
      const containerHeight = containerRect.height;
      const newSplit = ((e.clientY - containerRect.top) / containerHeight) * 100;
      newSize = Math.max(minSize, Math.min(maxSize, newSplit));
    }

    setSplit(newSize);
    onResize?.(newSize);
  }, [isDragging, isHorizontal, minSize, maxSize, onResize]);

  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle mouse down on resizer to start dragging
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Add/remove event listeners for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, isHorizontal]);

  // Handle touch events for mobile
  const handleTouchMove = useCallback((e) => {
    if (!containerRef.current || !isDragging) return;

    const touch = e.touches[0];
    const containerRect = containerRef.current.getBoundingClientRect();
    let newSize;

    if (isHorizontal) {
      const containerWidth = containerRect.width;
      const newSplit = ((touch.clientX - containerRect.left) / containerWidth) * 100;
      newSize = Math.max(minSize, Math.min(maxSize, newSplit));
    } else {
      const containerHeight = containerRect.height;
      const newSplit = ((touch.clientY - containerRect.top) / containerHeight) * 100;
      newSize = Math.max(minSize, Math.min(maxSize, newSplit));
    }

    setSplit(newSize);
    onResize?.(newSize);
  }, [isDragging, isHorizontal, minSize, maxSize, onResize]);

  const handleTouchStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
    } else {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleTouchMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className={`split-pane-container ${isHorizontal ? 'flex flex-row' : 'flex flex-col'} ${className}`}
      style={{ height: '100%', width: '100%', overflow: 'hidden' }}
    >
      {/* First Pane */}
      <div
        className={`split-pane-first ${firstPaneClassName}`}
        style={{
          [isHorizontal ? 'width' : 'height']: `${split}%`,
          overflow: 'hidden'
        }}
      >
        {firstChild}
      </div>

      {/* Resizer */}
      <div
        ref={resizerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`split-pane-resizer ${resizerClassName} ${
          isDragging ? 'dragging' : ''
        } flex items-center justify-center ${
          isHorizontal
            ? 'w-1 cursor-col-resize hover:bg-blue-500'
            : 'h-1 cursor-row-resize hover:bg-blue-500'
        } transition-colors`}
      >
        <div className={`p-1 ${isHorizontal ? 'rotate-0' : 'rotate-90'}`}>
          {isHorizontal ? (
            <GripVertical className="w-4 h-4 text-gray-400 opacity-50 hover:opacity-100" />
          ) : (
            <GripHorizontal className="w-4 h-4 text-gray-400 opacity-50 hover:opacity-100" />
          )}
        </div>
      </div>

      {/* Second Pane */}
      <div
        className={`split-pane-second ${secondPaneClassName}`}
        style={{
          [isHorizontal ? 'width' : 'height']: `${100 - split}%`,
          overflow: 'hidden'
        }}
      >
        {secondChild}
      </div>

      <style jsx>{`
        .split-pane-resizer.dragging {
          background: #3b82f6 !important;
        }

        .split-pane-resizer:active {
          background: #3b82f6 !important;
        }
      `}</style>
    </div>
  );
};

// Responsive SplitPane component that stacks on mobile
export const ResponsiveSplitPane = ({
  mobileDirection = 'vertical', // Stack direction on mobile
  desktopDirection = 'horizontal',
  breakpoint = 768,
  ...props
}) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  if (isMobile) {
    // On mobile, stack without resizer
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1" style={{ minHeight: mobileDirection === 'vertical' ? '50%' : 'auto' }}>
          {props.firstChild}
        </div>
        <div className="border-t border-gray-700" />
        <div className="flex-1" style={{ minHeight: mobileDirection === 'vertical' ? '50%' : 'auto' }}>
          {props.secondChild}
        </div>
      </div>
    );
  }

  return <SplitPane direction={desktopDirection} {...props} />;
};

export default SplitPane;
