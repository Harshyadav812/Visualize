import React from 'react';
import ArrayVisualizer from './visualizers/ArrayVisualizer';
import TreeVisualizer from './visualizers/TreeVisualizer';
import GraphVisualizer from './visualizers/GraphVisualizer';
import LinkedListVisualizer from './visualizers/LinkedListVisualizer';
import StackQueueVisualizer from './visualizers/StackQueueVisualizer';
import RecursionVisualizer from './visualizers/RecursionVisualizer';

/**
 * Central visualization engine that routes to appropriate visualizers
 * based on data structure type detected in the analysis
 */
export default function VisualizationEngine({ analysis, currentStep, onStepChange }) {
  // Validate props
  if (!analysis || !analysis.steps || !Array.isArray(analysis.steps)) {
    return (
      <div className="bg-red-900/50 border border-red-600 rounded-lg p-4">
        <p className="text-red-300">❌ Invalid analysis data provided to visualization engine</p>
      </div>
    );
  }

  if (currentStep < 0 || currentStep >= analysis.steps.length) {
    return (
      <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-4">
        <p className="text-yellow-300">⚠️ Invalid step index: {currentStep}</p>
      </div>
    );
  }

  const currentStepData = analysis.steps[currentStep];
  const visualization = currentStepData?.visualization;

  if (!visualization) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
        <p className="text-gray-400">No visualization data available for this step</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Visualization Type Indicator */}
      <div className="flex items-center justify-between bg-gray-900 rounded-lg p-3 border border-gray-600">
        <div className="flex items-center space-x-2">
          <span className="text-blue-400 font-semibold">Visualization Type:</span>
          <span className="bg-blue-600/30 text-blue-300 px-2 py-1 rounded text-sm">
            {visualization.type}
          </span>
        </div>
        <div className="text-sm text-gray-400">
          Step {currentStep + 1} of {analysis.steps.length}
        </div>
      </div>

      {/* Main Visualization */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
        <VisualizationRenderer 
          visualization={visualization}
          stepData={currentStepData}
          onError={(error) => console.error('Visualization error:', error)}
        />
      </div>
    </div>
  );
}

/**
 * Component that renders the appropriate visualizer based on type
 */
function VisualizationRenderer({ visualization, stepData, onError }) {
  const { type } = visualization;
  
  // Extract data - handle both nested and flat structures
  let data;
  if (visualization.data) {
    // Nested structure: { type: "array", data: { arrays: [...] } }
    data = visualization.data;
  } else {
    // Flat structure: { type: "array", arrays: [...], pointers: [...] }
    const { type: _, ...dataWithoutType } = visualization;
    data = dataWithoutType;
  }
  
  // Debug logging
  console.log('VisualizationRenderer - type:', type);
  console.log('VisualizationRenderer - visualization:', visualization);
  console.log('VisualizationRenderer - extracted data:', data);

  try {
    // Route to appropriate visualizer based on data structure type
    switch (type?.toLowerCase()) {
      case 'array':
        return (
          <ArrayVisualizer 
            data={data} 
            stepData={stepData}
            title="Array Visualization"
          />
        );
        
      case 'tree':
        return (
          <TreeVisualizer 
            data={data} 
            stepData={stepData}
            title="Tree Visualization"
          />
        );
        
      case 'graph':
        return (
          <GraphVisualizer 
            data={data} 
            stepData={stepData}
            title="Graph Visualization"
          />
        );
        
      case 'linkedlist':
      case 'linked_list':
        return (
          <LinkedListVisualizer 
            data={data} 
            stepData={stepData}
            title="Linked List Visualization"
          />
        );
        
      case 'stack':
      case 'queue':
        return (
          <StackQueueVisualizer 
            data={data} 
            stepData={stepData}
            type={type}
            title={`${type.charAt(0).toUpperCase() + type.slice(1)} Visualization`}
          />
        );
        
      case 'recursion':
        return (
          <RecursionVisualizer 
            data={data} 
            stepData={stepData}
            title="Recursion Visualization"
          />
        );
        
      // Legacy support for existing visualization types
      case 'window':
        return (
          <ArrayVisualizer 
            data={data} 
            stepData={stepData}
            title="Sliding Window Visualization"
            mode="window"
          />
        );
        
      case 'pointers':
        return (
          <ArrayVisualizer 
            data={data} 
            stepData={stepData}
            title="Two Pointers Visualization"
            mode="pointers"
          />
        );
        
      default:
        return <UnknownVisualizationFallback visualization={visualization} />;
    }
  } catch (error) {
    console.error('Error rendering visualization:', error);
    onError?.(error);
    return <VisualizationErrorFallback error={error} visualization={visualization} />;
  }
}

/**
 * Fallback component for unknown visualization types
 */
function UnknownVisualizationFallback({ visualization }) {
  return (
    <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-yellow-400 text-lg">⚠️</span>
        <h3 className="text-yellow-300 font-semibold">Unknown Visualization Type</h3>
      </div>
      <p className="text-yellow-200 mb-3">
        Visualization type "{visualization.type}" is not supported yet.
      </p>
      <details className="bg-yellow-800/30 rounded p-3">
        <summary className="text-yellow-300 cursor-pointer font-medium">
          Show Raw Data
        </summary>
        <pre className="text-yellow-100 text-sm mt-2 overflow-x-auto">
          {JSON.stringify(visualization, null, 2)}
        </pre>
      </details>
      <div className="mt-3 text-sm text-yellow-200">
        <p>Supported types: array, tree, graph, linkedlist, stack, queue, recursion</p>
      </div>
    </div>
  );
}

/**
 * Error fallback component for visualization rendering errors
 */
function VisualizationErrorFallback({ error, visualization }) {
  return (
    <div className="bg-red-900/50 border border-red-600 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-red-400 text-lg">❌</span>
        <h3 className="text-red-300 font-semibold">Visualization Error</h3>
      </div>
      <p className="text-red-200 mb-3">
        Failed to render {visualization.type} visualization: {error.message}
      </p>
      <details className="bg-red-800/30 rounded p-3">
        <summary className="text-red-300 cursor-pointer font-medium">
          Show Error Details
        </summary>
        <div className="mt-2 space-y-2">
          <div>
            <span className="text-red-200 font-medium">Error:</span>
            <pre className="text-red-100 text-sm mt-1">{error.stack}</pre>
          </div>
          <div>
            <span className="text-red-200 font-medium">Visualization Data:</span>
            <pre className="text-red-100 text-sm mt-1 overflow-x-auto">
              {JSON.stringify(visualization, null, 2)}
            </pre>
          </div>
        </div>
      </details>
    </div>
  );
}

/**
 * Utility function to detect visualization type from analysis data
 * @param {Object} analysis - Analysis data from AI service
 * @returns {string} - Detected primary visualization type
 */
export function detectVisualizationType(analysis) {
  if (!analysis) return 'array';
  
  // Check data structures array for primary type
  if (analysis.dataStructures && Array.isArray(analysis.dataStructures)) {
    const primaryType = analysis.dataStructures[0];
    if (primaryType) return primaryType.toLowerCase();
  }
  
  // Fallback to algorithm type mapping
  const algorithmTypeMap = {
    'sliding_window': 'array',
    'two_pointer': 'array',
    'binary_search': 'array',
    'sorting': 'array',
    'dfs': 'graph',
    'bfs': 'graph',
    'tree_traversal': 'tree',
    'linked_list': 'linkedlist'
  };
  
  const algorithmType = analysis.algorithmType?.toLowerCase();
  return algorithmTypeMap[algorithmType] || 'array';
}

/**
 * Utility function to validate visualization data structure
 * @param {Object} visualization - Visualization object to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export function validateVisualizationData(visualization) {
  const errors = [];
  
  if (!visualization) {
    errors.push('Visualization object is null or undefined');
    return { isValid: false, errors };
  }
  
  if (!visualization.type) {
    errors.push('Visualization type is missing');
  }
  
  if (!visualization.data) {
    errors.push('Visualization data is missing');
  }
  
  // Type-specific validation
  switch (visualization.type?.toLowerCase()) {
    case 'array':
      if (visualization.data && !Array.isArray(visualization.data.array) && !Array.isArray(visualization.data.arrays)) {
        errors.push('Array visualization requires array or arrays data');
      }
      break;
      
    case 'tree':
      if (visualization.data && !Array.isArray(visualization.data.nodes)) {
        errors.push('Tree visualization requires nodes array');
      }
      break;
      
    case 'graph':
      if (visualization.data && (!Array.isArray(visualization.data.vertices) || !Array.isArray(visualization.data.edges))) {
        errors.push('Graph visualization requires vertices and edges arrays');
      }
      break;
      
    case 'linkedlist':
      if (visualization.data && !Array.isArray(visualization.data.nodes)) {
        errors.push('Linked list visualization requires nodes array');
      }
      break;
      
    case 'stack':
    case 'queue':
      if (visualization.data && !Array.isArray(visualization.data.elements)) {
        errors.push(`${visualization.type} visualization requires elements array`);
      }
      break;
      
    case 'recursion':
      if (visualization.data && !Array.isArray(visualization.data.callStack)) {
        errors.push('Recursion visualization requires callStack array');
      }
      break;
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}