import React from 'react';
import BaseVisualizer from './BaseVisualizer';

/**
 * Fallback visualizer components for handling malformed or missing data
 */

/**
 * Generic fallback visualizer for unknown or malformed data
 */
export function GenericFallbackVisualizer({
  data,
  stepData,
  error,
  title = "Visualization Unavailable",
  onRetry,
  onReset
}) {
  const errorType = categorizeDataError(data, error);

  return (
    <BaseVisualizer data={data} stepData={stepData} title={title}>
      <div className="flex flex-col items-center justify-center min-h-64 p-8 text-center">
        {/* Error Icon and Title */}
        <div className="text-6xl mb-4">
          {errorType.icon}
        </div>

        <h3 className="text-xl font-semibold text-gray-300 mb-2">
          {errorType.title}
        </h3>

        <p className="text-gray-400 mb-3 max-w-md">
          {errorType.description}
        </p>
        {error?.message && !errorType.description.includes(error.message) && (
          <p className="text-gray-500 text-sm mb-4 max-w-md" data-testid="raw-error-message">
            {error.message}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 mb-6">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              🔄 Try Again
            </button>
          )}

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              🔄 Reset
            </button>
          )}
        </div>

        {/* Troubleshooting Tips */}
        <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4 max-w-lg">
          <h4 className="text-yellow-300 font-medium mb-2">💡 Troubleshooting Tips</h4>
          <ul className="text-yellow-200 text-sm space-y-1 text-left">
            {errorType.tips.map((tip, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2 text-yellow-400">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Raw Data Display (for debugging) */}
        {data && (
          <details className="mt-6 w-full max-w-2xl">
            <summary className="text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
              🔍 Show Raw Data (Debug)
            </summary>
            <div className="mt-2 bg-gray-800 rounded p-3 text-left">
              <pre className="text-xs text-gray-300 overflow-x-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </details>
        )}
      </div>
    </BaseVisualizer>
  );
}

/**
 * Array-specific fallback visualizer
 */
export function ArrayFallbackVisualizer({
  data,
  stepData,
  error,
  onRetry,
  onReset
}) {
  return (
    <BaseVisualizer data={data} stepData={stepData} title="Array Visualization Error">
      <div className="space-y-6">
        {/* Error Message */}
        <div className="p-0" data-testid="array-error-container">
          <div className="flex items-center space-x-3 bg-red-900/30 border-red-600/50 rounded-lg p-4">
            <span className="text-red-400 text-2xl">📊</span>
            <div className="bg-red-900/30 border-red-600/50">
              <h3 className="text-red-300 font-semibold">Array Data Error</h3>
              <p className="text-red-200 text-sm mt-1">
                {error?.message || 'Invalid or missing array data'}
              </p>
            </div>
          </div>
        </div>

        {/* Fallback Array Visualization */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-gray-300 font-medium mb-4 text-center">
            Example Array Structure
          </h4>

          {/* Show what a proper array should look like */}
          <div className="flex justify-center space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((value, index) => (
              <div
                key={index}
                className="w-12 h-12 bg-gray-600 border-2 border-gray-500 rounded flex flex-col items-center justify-center"
              >
                <span className="text-sm font-bold text-gray-300">{value}</span>
                <span className="text-xs text-gray-400" aria-label={`index-${index}`}>[{index}]</span>
              </div>
            ))}
          </div>

          <div className="text-center text-gray-400 text-sm">
            This is how your array visualization should appear
          </div>
        </div>

        {/* Expected Data Format */}
        <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-4">
          <h4 className="text-blue-300 font-medium mb-3">Expected Data Format</h4>
          <pre className="text-blue-200 text-xs overflow-x-auto bg-blue-900/30 p-3 rounded">
            {`{
  "arrays": [
    {
      "name": "Array Name",
      "values": [1, 2, 3, 4, 5],
      "highlights": {
        "current": [0],
        "window": { "start": 1, "end": 3 }
      }
    }
  ],
  "pointers": [
    {
      "name": "left",
      "position": 0,
      "color": "#ff0000"
    }
  ],
  "operations": [
    {
      "type": "swap",
      "indices": [0, 4],
      "description": "Swapping elements"
    }
  ]
}`}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              🔄 Retry Visualization
            </button>
          )}

          {onReset && (
            <button
              onClick={onReset}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              🔄 Reset Data
            </button>
          )}
        </div>
      </div>
    </BaseVisualizer>
  );
}

/**
 * Tree-specific fallback visualizer
 */
export function TreeFallbackVisualizer({
  data,
  stepData,
  error,
  onRetry,
  onReset
}) {
  return (
    <BaseVisualizer data={data} stepData={stepData} title="Tree Visualization Error">
      <div className="space-y-6">
        {/* Error Message */}
        <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <span className="text-red-400 text-2xl">🌳</span>
            <div>
              <h3 className="text-red-300 font-semibold">Tree Data Error</h3>
              <p className="text-red-200 text-sm mt-1">
                {error?.message || 'Invalid or missing tree data'}
              </p>
            </div>
          </div>
        </div>

        {/* Fallback Tree Visualization */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-gray-300 font-medium mb-4 text-center">
            Example Tree Structure
          </h4>

          {/* Simple tree diagram */}
          <div className="flex flex-col items-center space-y-4">
            {/* Root */}
            <div className="w-10 h-10 bg-gray-600 border-2 border-gray-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-gray-300">1</span>
            </div>

            {/* Connections */}
            <div className="flex space-x-8">
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-4 bg-gray-500"></div>
                <div className="w-10 h-10 bg-gray-600 border-2 border-gray-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-300">2</span>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-0.5 h-4 bg-gray-500"></div>
                <div className="w-10 h-10 bg-gray-600 border-2 border-gray-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-300">3</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-gray-400 text-sm mt-4">
            This is how your tree visualization should appear
          </div>
        </div>

        {/* Expected Data Format */}
        <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-4">
          <h4 className="text-blue-300 font-medium mb-3">Expected Data Format</h4>
          <pre className="text-blue-200 text-xs overflow-x-auto bg-blue-900/30 p-3 rounded">
            {`{
  "nodes": [
    {
      "id": "1",
      "value": 1,
      "x": 500,
      "y": 50,
      "state": "normal"
    },
    {
      "id": "2",
      "value": 2,
      "x": 400,
      "y": 150,
      "state": "visited"
    }
  ],
  "edges": [
    {
      "from": "1",
      "to": "2",
      "state": "normal"
    }
  ],
  "traversalPath": ["1", "2"],
  "currentNode": "2",
  "treeType": "binary"
}`}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              🔄 Retry Visualization
            </button>
          )}

          {onReset && (
            <button
              onClick={onReset}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              🔄 Reset Data
            </button>
          )}
        </div>
      </div>
    </BaseVisualizer>
  );
}

/**
 * Graph-specific fallback visualizer
 */
export function GraphFallbackVisualizer({
  data,
  stepData,
  error,
  onRetry,
  onReset
}) {
  return (
    <BaseVisualizer data={data} stepData={stepData} title="Graph Visualization Error">
      <div className="space-y-6">
        {/* Error Message */}
        <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <span className="text-red-400 text-2xl">🕸️</span>
            <div>
              <h3 className="text-red-300 font-semibold">Graph Data Error</h3>
              <p className="text-red-200 text-sm mt-1">
                {error?.message || 'Invalid or missing graph data'}
              </p>
            </div>
          </div>
        </div>

        {/* Fallback Graph Visualization */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-gray-300 font-medium mb-4 text-center">
            Example Graph Structure
          </h4>

          {/* Simple graph diagram */}
          <div className="flex justify-center items-center space-x-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-10 h-10 bg-gray-600 border-2 border-gray-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-300">A</span>
              </div>
              <div className="w-10 h-10 bg-gray-600 border-2 border-gray-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-300">C</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-600 border-2 border-gray-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-300">B</span>
              </div>
              <div className="h-8 w-0.5 bg-gray-500"></div>
              <div className="w-10 h-10 bg-gray-600 border-2 border-gray-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-300">D</span>
              </div>
            </div>
          </div>

          <div className="text-center text-gray-400 text-sm mt-4">
            This is how your graph visualization should appear
          </div>
        </div>

        {/* Expected Data Format */}
        <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-4">
          <h4 className="text-blue-300 font-medium mb-3">Expected Data Format</h4>
          <pre className="text-blue-200 text-xs overflow-x-auto bg-blue-900/30 p-3 rounded">
            {`{
  "vertices": [
    {
      "id": "A",
      "label": "A",
      "x": 100,
      "y": 100,
      "state": "unvisited"
    },
    {
      "id": "B",
      "label": "B",
      "x": 200,
      "y": 100,
      "state": "visited"
    }
  ],
  "edges": [
    {
      "from": "A",
      "to": "B",
      "weight": 1,
      "state": "normal"
    }
  ],
  "algorithm": "dfs",
  "directed": false
}`}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              🔄 Retry Visualization
            </button>
          )}

          {onReset && (
            <button
              onClick={onReset}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              🔄 Reset Data
            </button>
          )}
        </div>
      </div>
    </BaseVisualizer>
  );
}

/**
 * Loading state fallback visualizer
 */
export function LoadingFallbackVisualizer({
  title = "Loading Visualization...",
  message = "Please wait while we prepare your visualization"
}) {
  // Avoid duplicate h3: BaseVisualizer renders a header when title provided.
  return (
    <BaseVisualizer title={title}>
      <div className="flex flex-col items-center justify-center min-h-64 p-8">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🧠</span>
          </div>
        </div>
        <p className="text-gray-400 text-center max-w-md mb-4">
          {message}
        </p>
        <div className="mt-2 space-y-2 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Analyzing algorithm structure</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Preparing visualization data</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span>Rendering components...</span>
          </div>
        </div>
      </div>
    </BaseVisualizer>
  );
}

/**
 * Empty state fallback visualizer
 */
export function EmptyStateFallbackVisualizer({
  type = "visualization",
  title = "No Data Available",
  message = "There's no data to visualize at the moment",
  onAction,
  actionLabel = "Load Data"
}) {
  const getEmptyStateIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'array': return '📊';
      case 'tree': return '🌳';
      case 'graph': return '🕸️';
      case 'linkedlist': return '🔗';
      case 'stack': return '📚';
      case 'queue': return '🚶‍♂️';
      default: return '📋';
    }
  };

  return (
    <BaseVisualizer title={title}>
      <div className="flex flex-col items-center justify-center min-h-64 p-8 text-center">
        <div className="text-6xl mb-4 opacity-50">
          {getEmptyStateIcon(type)}
        </div>
        <p className="text-gray-400 mb-6 max-w-md">
          {message}
        </p>

        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            {actionLabel}
          </button>
        )}

        {/* Helpful Tips */}
        <div className="mt-8 bg-gray-800 rounded-lg p-4 max-w-lg">
          <h4 className="text-gray-300 font-medium mb-2">💡 Getting Started</h4>
          <ul className="text-gray-400 text-sm space-y-1 text-left">
            <li>• Enter your algorithm problem and solution code</li>
            <li>• Click "Analyze & Visualize" to generate visualization</li>
            <li>• Use the controls to step through the algorithm</li>
            <li>• Explore different data structures and algorithms</li>
          </ul>
        </div>
      </div>
    </BaseVisualizer>
  );
}

/**
 * Categorize data errors for better user experience
 */
function categorizeDataError(data, error) {
  const errorMessageRaw = error?.message || '';
  const errorMessage = errorMessageRaw.toLowerCase();

  if (errorMessage) {
    // Rendering error patterns first (null property access etc.)
    if (/(cannot read property|undefined is not a function|failed to render|reading.*undefined)/.test(errorMessage)) {
      return {
        icon: '🎨',
        title: 'Rendering Error',
        description: 'Check that all data properties exist before accessing them and components handle optional fields.',
        tips: [
          'Guard property access with optional chaining',
          'Validate data shape before rendering',
          'Add defensive null checks',
          'Inspect console for stack trace details'
        ]
      };
    }

    // Network related
    if (errorMessage.includes('network') || errorMessage.includes('failed to fetch') || errorMessage.includes('timeout')) {
      return {
        icon: '🌐',
        title: 'Network Error',
        description: 'Network connectivity or API service issue detected.',
        tips: [
          'Check your internet connection',
          'Verify API credentials and endpoint',
          'Retry the request',
          'Inspect browser network tab for details'
        ]
      };
    }

    // Performance (after network so plain timeouts classify as network first)
    if (errorMessage.includes('maximum call stack') || (errorMessage.includes('performance') && !errorMessage.includes('network'))) {
      return {
        icon: '⚡',
        title: 'Performance Error',
        description: 'Check for infinite loops in rendering logic or excessive re-renders.',
        tips: [
          'Ensure state updates converge',
          'Memoize expensive computations',
          'Avoid deeply nested reactive loops',
          'Profile with React DevTools'
        ]
      };
    }

    // Data validation (explicit validation messages)
    if (errorMessage.includes('missing required property') || errorMessage.includes('validation')) {
      return {
        icon: '📊',
        title: 'Data Validation Error',
        description: 'Some required data properties are missing or misnamed.',
        tips: [
          'Check that all required data properties are present',
          'Verify nested objects contain expected fields',
          'Ensure arrays contain valid elements',
          'Regenerate the analysis if data seems incomplete'
        ]
      };
    }

    // Invalid structure
    if (errorMessage.includes('invalid') || errorMessage.includes('malformed')) {
      return {
        icon: '⚠️',
        title: 'Invalid Data Structure',
        description: 'The visualization data has an invalid or unexpected structure.',
        tips: [
          'Check that all required fields are present',
          'Verify data types match expected formats',
          'Ensure arrays contain valid elements',
          'Check for missing or null values'
        ]
      };
    }

    // Missing fields
    if (errorMessage.includes('missing') || errorMessage.includes('required')) {
      return {
        icon: '🔍',
        title: 'Missing Required Data',
        description: 'Some required data fields are missing from the visualization.',
        tips: [
          'Ensure all required properties are included',
          'Check the expected data format for this visualization type',
          'Verify the AI analysis completed successfully',
          'Try regenerating the analysis'
        ]
      };
    }

    // Type mismatch
    if (errorMessage.includes('type') || errorMessage.includes('expected')) {
      return {
        icon: '🔄',
        title: 'Data Type Mismatch',
        description: 'The data types don\'t match what\'s expected for this visualization.',
        tips: [
          'Check that arrays are actually arrays',
          'Verify numeric values are numbers, not strings',
          'Ensure object properties have correct types',
          'Review the data format requirements'
        ]
      };
    }
  }

  // Show No Data Provided only when explicitly null AND no error; undefined implies we can show generic visualization error for clearer context
  if (!error && data === null) {
    return {
      icon: '📋',
      title: 'No Data Provided',
      description: 'No visualization data was provided to render.',
      tips: [
        'Ensure your algorithm analysis completed successfully',
        'Check that the AI service returned valid data',
        'Try re-running the analysis',
        'Verify your input problem and code are valid'
      ]
    };
  }

  // Generic error fallback
  return {
    icon: '❌',
    title: 'Visualization Error',
    description: 'An error occurred while processing the visualization data.',
    tips: [
      'Try refreshing the page and re-running the analysis',
      'Check the browser console for more detailed error information',
      'Verify your input data is valid and complete',
      'Contact support if the issue persists'
    ]
  };
}

export default {
  GenericFallbackVisualizer,
  ArrayFallbackVisualizer,
  TreeFallbackVisualizer,
  GraphFallbackVisualizer,
  LoadingFallbackVisualizer,
  EmptyStateFallbackVisualizer
};