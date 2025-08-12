import React from 'react';
import { Loader2 } from 'lucide-react';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

/**
 * Simple loading indicators using Lucide icons
 */

/**
 * Minimal spinner for button loading states
 */
export const ButtonSpinner = ({ size = 'sm', className = '' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <Loader2
      className={`${sizeClasses[size]} animate-spin ${className}`}
      aria-label="Loading"
    />
  );
};

/**
 * Inline loader with text
 */
export const InlineLoader = ({ text = "Loading...", showSpinner = true, className = "" }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showSpinner && <ButtonSpinner size="sm" />}
      <span className="text-sm">{text}</span>
    </div>
  );
};

/**
 * Simple dots loader
 */
export const DotsLoader = ({ className = '' }) => (
  <div className={`flex items-center space-x-1 ${className}`} role="status" aria-label="Loading">
    <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
    <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
    <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
  </div>
);

/**
 * Progress bar using shadcn/ui Progress component
 */
export const ProgressBar = ({ progress = 0, className = '' }) => (
  <Progress value={Math.max(0, Math.min(100, progress))} className={className} />
);

/**
 * Status indicator using shadcn/ui Badge component
 */
export const StatusDot = ({ status = 'active', children, className = '' }) => {
  const variantMap = {
    active: 'default',
    inactive: 'secondary',
    warning: 'destructive',
    error: 'destructive'
  };

  return (
    <Badge
      variant={variantMap[status]}
      className={`${status === 'active' ? 'animate-pulse' : ''} ${className}`}
    >
      {children || status}
    </Badge>
  );
};