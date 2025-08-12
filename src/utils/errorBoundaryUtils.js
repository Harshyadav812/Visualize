import React from 'react';
import VisualizationErrorBoundary from '../components/ErrorBoundary';

/**
 * Higher-order component to wrap components with error boundary
 */
export function withVisualizationErrorBoundary(Component, options = {}) {
  const WrappedComponent = React.forwardRef((props, ref) => (
    <VisualizationErrorBoundary
      onError={options.onError}
      onReset={options.onReset}
      onReportError={options.onReportError}
      fallback={options.fallback}
      showDetails={options.showDetails}
      maxRetries={options.maxRetries}
    >
      <Component {...props} ref={ref} />
    </VisualizationErrorBoundary>
  ));

  WrappedComponent.displayName = `withVisualizationErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Hook for error reporting within components
 */
export function useErrorReporting() {
  const reportError = React.useCallback((error, context = {}) => {
    console.error('Component Error:', error, context);

    // Report to error tracking service if available
    if (window.errorTracker) {
      window.errorTracker.captureException(error, { extra: context });
    }
  }, []);

  return { reportError };
}
