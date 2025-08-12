import React from 'react';

/**
 * Elegant loading and progress indicators for the modern dark theme
 * Task 6.2: Replace existing loading animations with minimal, professional indicators
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
    <div 
      className={`${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <svg 
        className="animate-spin text-current" 
        fill="none" 
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

/**
 * Elegant dots loading indicator
 */
export const DotsLoader = ({ className = '' }) => (
  <div className={`flex items-center space-x-1 ${className}`} role="status" aria-label="Loading">
    <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
    <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
    <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
  </div>
);

/**
 * Smooth progress bar with percentage
 */
export const ProgressBar = ({ 
  progress = 0, 
  showPercentage = false, 
  className = '',
  size = 'md',
  variant = 'primary'
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const variantClasses = {
    primary: 'bg-accent-primary',
    secondary: 'bg-accent-secondary',
    warning: 'bg-accent-warning',
    error: 'bg-accent-error'
  };

  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`w-full ${className}`} role="progressbar" aria-valuenow={clampedProgress} aria-valuemin="0" aria-valuemax="100">
      {showPercentage && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-text-tertiary">Progress</span>
          <span className="text-xs text-text-secondary font-medium">{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div className={`w-full bg-surface-secondary rounded-full ${sizeClasses[size]} overflow-hidden`}>
        <div
          className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Circular progress indicator
 */
export const CircularProgress = ({ 
  progress = 0, 
  size = 'md', 
  strokeWidth = 2,
  showPercentage = false,
  className = '',
  variant = 'primary'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const variantColors = {
    primary: 'stroke-accent-primary',
    secondary: 'stroke-accent-secondary',
    warning: 'stroke-accent-warning',
    error: 'stroke-accent-error'
  };

  const clampedProgress = Math.max(0, Math.min(100, progress));
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`} role="progressbar" aria-valuenow={clampedProgress} aria-valuemin="0" aria-valuemax="100">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
        {/* Background circle */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-surface-tertiary"
        />
        {/* Progress circle */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`${variantColors[variant]} transition-all duration-300 ease-out`}
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-text-secondary">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Skeleton loader for content placeholders
 */
export const SkeletonLoader = ({ 
  lines = 3, 
  className = '',
  animated = true 
}) => (
  <div className={`space-y-2 ${className}`} role="status" aria-label="Loading content">
    {Array.from({ length: lines }).map((_, index) => (
      <div
        key={index}
        className={`h-4 bg-surface-secondary rounded ${
          animated ? 'animate-pulse' : ''
        }`}
        style={{
          width: `${Math.random() * 40 + 60}%`
        }}
      />
    ))}
  </div>
);

/**
 * Pulsing dot indicator for real-time status
 */
export const StatusDot = ({ 
  status = 'active', 
  size = 'sm',
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const statusClasses = {
    active: 'bg-accent-secondary animate-pulse',
    inactive: 'bg-surface-tertiary',
    warning: 'bg-accent-warning animate-pulse',
    error: 'bg-accent-error animate-pulse'
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${statusClasses[status]} rounded-full ${className}`}
      role="status"
      aria-label={`Status: ${status}`}
    />
  );
};

/**
 * Loading overlay for full-screen loading states
 */
export const LoadingOverlay = ({ 
  message = 'Loading...', 
  showSpinner = true,
  className = '' 
}) => (
  <div 
    className={`fixed inset-0 bg-background-primary/80 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}
    role="status"
    aria-label={message}
  >
    <div className="bg-surface-primary border border-surface-tertiary rounded-lg p-6 shadow-xl">
      <div className="flex flex-col items-center space-y-4">
        {showSpinner && <ButtonSpinner size="lg" className="text-accent-primary" />}
        <p className="text-text-secondary text-sm font-medium">{message}</p>
      </div>
    </div>
  </div>
);

/**
 * Inline loading state for buttons and small components
 */
export const InlineLoader = ({ 
  text = 'Loading...', 
  showSpinner = true,
  className = '' 
}) => (
  <div className={`flex items-center space-x-2 ${className}`} role="status" aria-label={text}>
    {showSpinner && <ButtonSpinner size="sm" />}
    <span className="text-text-secondary text-sm">{text}</span>
  </div>
);

/**
 * Step progress indicator for multi-step processes
 */
export const StepProgress = ({ 
  currentStep = 0, 
  totalSteps = 1, 
  className = '',
  showLabels = false,
  steps = []
}) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className={`w-full ${className}`} role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin="1" aria-valuemax={totalSteps}>
      {showLabels && steps.length > 0 && (
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <span
              key={index}
              className={`text-xs ${
                index <= currentStep ? 'text-accent-primary font-medium' : 'text-text-tertiary'
              }`}
            >
              {step}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-surface-secondary rounded-full h-2 overflow-hidden">
          <div
            className="h-2 bg-accent-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-text-secondary font-mono min-w-0">
          {currentStep + 1}/{totalSteps}
        </span>
      </div>
    </div>
  );
};

/**
 * Breathing animation for subtle loading states
 */
export const BreathingLoader = ({ 
  className = '',
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div className="w-full h-full bg-accent-primary rounded-full animate-ping opacity-75" />
      <div className="w-full h-full bg-accent-primary rounded-full animate-pulse" />
    </div>
  );
};

// Export all components as default for easy importing
export default {
  ButtonSpinner,
  DotsLoader,
  ProgressBar,
  CircularProgress,
  SkeletonLoader,
  StatusDot,
  LoadingOverlay,
  InlineLoader,
  StepProgress,
  BreathingLoader
};