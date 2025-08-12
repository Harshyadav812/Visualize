import React, { useState, useRef, useEffect } from 'react';
import { GripVertical, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Enhanced draggable wrapper component with better UX and positioning
 */
export default function DraggableControls({
  children,
  initialPosition = { x: 20, y: 100 }, // Start lower to avoid header overlap
  className = '',
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

  // Touch events for mobile
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const newPosition = {
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    };

    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const margin = 20;

      newPosition.x = Math.max(margin, Math.min(newPosition.x, viewportWidth - rect.width - margin));
      newPosition.y = Math.max(margin, Math.min(newPosition.y, viewportHeight - rect.height - margin));
    }

    setPosition(newPosition);

    if (onPositionChange) {
      onPositionChange(newPosition);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Add event listeners for mouse move and up
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMoveEffect = (e) => {
      e.preventDefault();

      const newPosition = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };

      // Keep within viewport bounds with better margins
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const margin = 20; // Safe margin from edges

        newPosition.x = Math.max(margin, Math.min(newPosition.x, viewportWidth - rect.width - margin));
        newPosition.y = Math.max(margin, Math.min(newPosition.y, viewportHeight - rect.height - margin));
      }

      setPosition(newPosition);

      if (onPositionChange) {
        onPositionChange(newPosition);
      }
    };

    const handleMouseUpEffect = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMoveEffect);
    document.addEventListener('mouseup', handleMouseUpEffect);

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveEffect);
      document.removeEventListener('mouseup', handleMouseUpEffect);
    };
  }, [isDragging, dragStart, onPositionChange]);

  // Toggle collapse state
  const handleToggleCollapse = (e) => {
    e.stopPropagation();
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Card
      ref={containerRef}
      className={`fixed backdrop-blur-sm transition-all duration-200 ${isDragging ? 'shadow-2xl scale-[1.02] ring-2 ring-primary/20' : 'shadow-lg'
        } ${isCollapsed ? 'h-auto' : ''} ${className}`}
      style={{
        left: position.x,
        top: position.y,
        zIndex: 40, // Lower z-index to avoid overlapping important UI
        cursor: isDragging ? 'grabbing' : 'default',
        maxWidth: 'min(400px, 90vw)',
        maxHeight: '80vh'
      }}
    >
      {/* Drag handle header */}
      <div
        ref={dragRef}
        className={`flex items-center justify-between px-3 py-2 border-b bg-muted/50 rounded-t-lg cursor-grab active:cursor-grabbing select-none ${isDragging ? 'bg-primary/10' : ''
          }`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      >
        <div className="flex items-center space-x-2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Controls</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleCollapse}
          className="h-6 w-6 p-0"
          title={isCollapsed ? 'Expand controls' : 'Collapse controls'}
        >
          {isCollapsed ? (
            <Maximize2 className="w-3 h-3" />
          ) : (
            <Minimize2 className="w-3 h-3" />
          )}
        </Button>
      </div>

      {/* Content area */}
      {!isCollapsed && (
        <div className="overflow-auto max-h-[60vh]">
          {children}
        </div>
      )}

      {/* Visual drag indicator when dragging */}
      {isDragging && (
        <div className="absolute inset-0 rounded-lg ring-2 ring-primary/30 pointer-events-none" />
      )}
    </Card>
  );
}
