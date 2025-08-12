import React from 'react';

/**
 * Base visualizer component that provides common functionality
 * and interface for all specific visualizers
 */
export default function BaseVisualizer({
  data,
  stepData,
  title,
  children,
  className = '',
  onError
}) {
  // Error boundary for visualization errors
  const handleError = (error) => {
    console.error(`${title} Error:`, error);
    onError?.(error);
  };

  return (
    <div className={`${className}`}>
      {/* Compact Visualizer Header */}
      {title && (
        <div className="flex items-center justify-between p-3 border-b border-gray-600">
          <h4 className="text-green-400 font-medium">{title}</h4>
        </div>
      )}

      {/* Main Visualization Content */}
      <div className="p-4">
        {children}
      </div>

      {/* Compact Step Information */}
      {stepData && (stepData.edgeCases?.length > 0 || stepData.pitfalls?.length > 0 || stepData.validationWarnings?.length > 0) && (
        <div className="border-t border-gray-600 p-3 bg-gray-800/50">
          <VisualizationStepInfo stepData={stepData} />
        </div>
      )}
    </div>
  );
}

/**
 * Component to display step-related information
 */
function VisualizationStepInfo({ stepData }) {
  const hasEdgeCases = stepData.edgeCases && stepData.edgeCases.length > 0;
  const hasPitfalls = stepData.pitfalls && stepData.pitfalls.length > 0;
  const hasWarnings = stepData.validationWarnings && stepData.validationWarnings.length > 0;

  // Determine grid layout based on number of sections
  const sectionCount = [hasEdgeCases, hasPitfalls, hasWarnings].filter(Boolean).length;
  const gridClass = sectionCount === 1 ? 'grid-cols-1' :
    sectionCount === 2 ? 'grid-cols-1 md:grid-cols-2' :
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid ${gridClass} gap-3`}>
      {/* Edge Cases */}
      {hasEdgeCases && (
        <div className="bg-blue-900/20 border border-blue-600/50 rounded p-2">
          <h5 className="text-blue-300 font-medium mb-1 flex items-center text-sm">
            <span className="mr-1">🔍</span>
            Edge Cases
            <span className="ml-auto text-xs bg-blue-600/30 px-1.5 py-0.5 rounded">
              {stepData.edgeCases.length}
            </span>
          </h5>
          <ul className="text-blue-200 text-xs space-y-0.5">
            {stepData.edgeCases.slice(0, 3).map((edgeCase, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-1 text-blue-400 flex-shrink-0">•</span>
                <span className="leading-tight">{edgeCase}</span>
              </li>
            ))}
            {stepData.edgeCases.length > 3 && (
              <li className="text-blue-300 text-xs italic">
                +{stepData.edgeCases.length - 3} more edge cases
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Common Pitfalls */}
      {hasPitfalls && (
        <div className="bg-yellow-900/20 border border-yellow-600/50 rounded p-2">
          <h5 className="text-yellow-300 font-medium mb-1 flex items-center text-sm">
            <span className="mr-1">⚠️</span>
            Pitfalls
            <span className="ml-auto text-xs bg-yellow-600/30 px-1.5 py-0.5 rounded">
              {stepData.pitfalls.length}
            </span>
          </h5>
          <ul className="text-yellow-200 text-xs space-y-0.5">
            {stepData.pitfalls.slice(0, 3).map((pitfall, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-1 text-yellow-400 flex-shrink-0">•</span>
                <span className="leading-tight">{pitfall}</span>
              </li>
            ))}
            {stepData.pitfalls.length > 3 && (
              <li className="text-yellow-300 text-xs italic">
                +{stepData.pitfalls.length - 3} more potential pitfalls
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Validation Warnings */}
      {hasWarnings && (
        <div className="bg-orange-900/20 border border-orange-600/50 rounded p-2">
          <h5 className="text-orange-300 font-medium mb-1 flex items-center text-sm">
            <span className="mr-1">🚨</span>
            Warnings
            <span className="ml-auto text-xs bg-orange-600/30 px-1.5 py-0.5 rounded">
              {stepData.validationWarnings.length}
            </span>
          </h5>
          <ul className="text-orange-200 text-xs space-y-0.5">
            {stepData.validationWarnings.slice(0, 3).map((warning, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-1 text-orange-400 flex-shrink-0">•</span>
                <span className="leading-tight">{warning}</span>
              </li>
            ))}
            {stepData.validationWarnings.length > 3 && (
              <li className="text-orange-300 text-xs italic">
                +{stepData.validationWarnings.length - 3} more warnings
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// PropTypes removed for simplicity - using TypeScript would be better for type checking

/**
 * Higher-order component to add error boundary to visualizers
 */
export function withErrorBoundary(VisualizerComponent) {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.error('Visualizer Error Boundary:', error, errorInfo);
      this.props.onError?.(error);
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="bg-red-900/50 border border-red-600 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-red-400 text-lg">❌</span>
              <h3 className="text-red-300 font-semibold">Visualization Error</h3>
            </div>
            <p className="text-red-200 mb-3">
              Something went wrong while rendering the visualization.
            </p>
            <details className="bg-red-800/30 rounded p-3">
              <summary className="text-red-300 cursor-pointer font-medium">
                Show Error Details
              </summary>
              <pre className="text-red-100 text-sm mt-2 overflow-x-auto">
                {this.state.error?.stack || this.state.error?.message}
              </pre>
            </details>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        );
      }

      return <VisualizerComponent {...this.props} />;
    }
  };
}

/**
 * Common utility functions for visualizers
 */
export const VisualizerUtils = {
  /**
   * Generate color based on state
   */
  getStateColor: (state) => {
    const colorMap = {
      'normal': 'bg-gray-600 border-gray-500 text-gray-300',
      'current': 'bg-yellow-500 border-yellow-300 text-black',
      'visited': 'bg-green-600 border-green-400 text-white',
      'target': 'bg-red-600 border-red-400 text-white',
      'highlighted': 'bg-blue-600 border-blue-400 text-white',
      'active': 'bg-purple-600 border-purple-400 text-white',
      'processing': 'bg-orange-600 border-orange-400 text-white'
    };
    return colorMap[state] || colorMap['normal'];
  },

  /**
   * Validate required data properties
   */
  validateData: (data, requiredProps) => {
    const missing = requiredProps.filter(prop => !(prop in data));
    if (missing.length > 0) {
      throw new Error(`Missing required data properties: ${missing.join(', ')}`);
    }
  },

  /**
   * Safe array access with fallback
   */
  safeArrayAccess: (array, index, fallback = null) => {
    return Array.isArray(array) && index >= 0 && index < array.length
      ? array[index]
      : fallback;
  },

  /**
   * Format value for display
   */
  formatValue: (value) => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'string') {
      // Check if it's a JSON string that should be parsed
      if (value.startsWith('{') && value.endsWith('}')) {
        try {
          const parsed = JSON.parse(value);
          // If it's a simple key-value object, show it more cleanly
          if (typeof parsed === 'object' && Object.keys(parsed).length <= 3) {
            return Object.entries(parsed)
              .map(([k, v]) => `${k}:${v}`)
              .join(',');
          }
          return 'Map{}';
        } catch {
          return value.length > 10 ? value.substring(0, 10) + '...' : value;
        }
      }
      return `"${value}"`;
    }
    if (typeof value === 'object') {
      // Handle objects more gracefully
      if (Array.isArray(value)) {
        return `[${value.length}]`;
      }
      const keys = Object.keys(value);
      if (keys.length === 0) return '{}';
      if (keys.length <= 2) {
        return Object.entries(value)
          .map(([k, v]) => `${k}:${v}`)
          .join(',');
      }
      return `{${keys.length} keys}`;
    }
    return String(value);
  }
};