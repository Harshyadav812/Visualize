import React, { useState, useRef, useEffect } from 'react';
import { Bars3Icon } from '@heroicons/react/24/solid';

/**
 * Draggable wrapper component that makes any content draggable around the screen
 */
export default function DraggableControls({
  children,
  initialPosition = { x: 20, y: 20 },
  className = '',
  dragHandleClassName = '',
  onPositionChange
}) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dragRef = useRef(null);
  const containerRef = useRef(null);

  // Handle mouse down on drag handle
  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  // Handle mouse move while dragging
  const handleMouseMove = (e) => {
    if (!isDragging) return;

    e.preventDefault();

    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };

    // Keep within viewport bounds
    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      newPosition.x = Math.max(0, Math.min(newPosition.x, viewportWidth - rect.width));
      newPosition.y = Math.max(0, Math.min(newPosition.y, viewportHeight - rect.height));
    }

    setPosition(newPosition);

    if (onPositionChange) {
      onPositionChange(newPosition);
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Prevent text selection while dragging

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, dragStart, position]);

  // Touch event handlers for mobile support
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;

    e.preventDefault();
    const touch = e.touches[0];

    const newPosition = {
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    };

    // Keep within viewport bounds
    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      newPosition.x = Math.max(0, Math.min(newPosition.x, viewportWidth - rect.width));
      newPosition.y = Math.max(0, Math.min(newPosition.y, viewportHeight - rect.height));
    }

    setPosition(newPosition);

    if (onPositionChange) {
      onPositionChange(newPosition);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Toggle collapse state
  const handleToggleCollapse = (e) => {
    e.stopPropagation();
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      ref={containerRef}
      className={`fixed bg-surface-primary border border-surface-tertiary rounded-lg shadow-lg backdrop-blur-sm z-50 transition-all duration-200 ${isDragging ? 'shadow-xl scale-105' : 'shadow-lg'
        } ${isCollapsed ? 'h-auto' : ''} ${className}`}
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'default',
        maxWidth: '90vw',
        maxHeight: '90vh'
      }}
    >
      {/* Drag handle header */}
      <div
        ref={dragRef}
        className={`flex items-center justify-between px-3 py-2 border-b border-surface-tertiary bg-surface-secondary/50 rounded-t-lg cursor-grab active:cursor-grabbing ${dragHandleClassName}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      >
        <div className="flex items-center space-x-2">
          <Bars3Icon className="w-4 h-4 text-text-tertiary" />
          <span className="text-xs font-medium text-text-secondary">Controls</span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleToggleCollapse}
            className="p-1 hover:bg-surface-tertiary rounded text-text-tertiary hover:text-text-primary transition-colors"
            title={isCollapsed ? 'Expand controls' : 'Collapse controls'}
          >
            <svg
              className={`w-3 h-3 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content area */}
      {!isCollapsed && (
        <div className="overflow-hidden">
          {children}
        </div>
      )}

      {/* Resize indicator */}
      <div className="absolute bottom-0 right-0 w-3 h-3 bg-surface-tertiary opacity-50"></div>
    </div>
  );
}
