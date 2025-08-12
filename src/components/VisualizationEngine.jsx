import React, { memo, useMemo, useRef } from 'react';
import LazyVisualizationLoader from './LazyVisualizationLoader';
import { VisualizationErrorBoundary } from './ErrorBoundary';
import { validateVisualizationData as coreValidateVisualizationData, generateFallbackData } from '../utils/dataValidation';
import { 
  GenericFallbackVisualizer,
  ArrayFallbackVisualizer,
  TreeFallbackVisualizer,
  GraphFallbackVisualizer,
  LoadingFallbackVisualizer,
  EmptyStateFallbackVisualizer
} from './visualizers/FallbackVisualizer';

/**
 * Central visualization engine that routes to appropriate visualizers
 * based on data structure type detected in the analysis
 * Optimized with React.memo and lazy loading for performance
 */

/**
 * Enhance step data with validation results (edge cases and pitfalls)
 */
function enhanceStepDataWithValidation(stepData, validationResult) {
  if (!stepData) return stepData;
  // Ensure arrays exist to avoid iteration errors if validator returns minimal object
  const safeValidation = validationResult || {};
  const edgeCases = Array.isArray(safeValidation.edgeCases) ? safeValidation.edgeCases : [];
  const pitfalls = Array.isArray(safeValidation.pitfalls) ? safeValidation.pitfalls : [];
  const warnings = Array.isArray(safeValidation.warnings) ? safeValidation.warnings : (safeValidation.warnings ? [safeValidation.warnings] : []);
  
  return {
    ...stepData,
    edgeCases: [
      ...(stepData.edgeCases || []),
      ...edgeCases
    ],
    pitfalls: [
      ...(stepData.pitfalls || []),
      ...pitfalls
    ],
    validationWarnings: warnings
  };
}

const VisualizationEngine = memo(function VisualizationEngine({ analysis, currentStep, onStepChange }) {
  // Debug flag (enable in console via window.__VIZ_DEBUG = true)
  const debug = (typeof window !== 'undefined') && window.__VIZ_DEBUG && process.env.NODE_ENV !== 'production';
  // Cache for validation + sanitized data per step index
  const cacheRef = useRef(new Map());

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

  // Memoize current step data for performance
  const currentStepData = useMemo(() => analysis.steps[currentStep], [analysis.steps, currentStep]);

  // Retrieve or compute cached validation for this step
  let cached = cacheRef.current.get(currentStep);
  if (!cached) {
    const visualization = currentStepData?.visualization;
    if (visualization && visualization.type) {
      const canonicalType = mapToCanonicalType(visualization.type);
      
      // Enhanced type detection - use AI-specified type or auto-detect
      const detectedType = detectPrimaryVisualizationType(visualization.data, visualization.type);
      const finalCanonicalType = mapToCanonicalType(detectedType);
      
      // Some AI responses may embed fields directly on visualization instead of nested data
      // Fallback: if visualization.data missing, use visualization itself (excluding type)
      const rawData = visualization.data ?? (() => {
        const { type, ...rest } = visualization; // exclude type field
        return Object.keys(rest).length > 0 ? rest : null;
      })();
      
      const validationResult = coreValidateVisualizationData(rawData, finalCanonicalType);
      const enhancedStep = enhanceStepDataWithValidation(currentStepData, validationResult);
      const slimData = deriveSlimData(finalCanonicalType, validationResult.sanitizedData);
      
      // Store canonicalType on visualization for consistent downstream rendering
      cached = { 
        visualization: { ...visualization, canonicalType: finalCanonicalType, detectedType }, 
        validationResult, 
        enhancedStep, 
        slimData, 
        canonicalType: finalCanonicalType 
      };
      cacheRef.current.set(currentStep, cached);
    }
  }
  
  const visualization = cached?.visualization || currentStepData?.visualization;

  if (!visualization) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
        <p className="text-gray-400">No visualization data available for this step</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Compact Visualization Type Indicator */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-blue-400 font-medium">Type:</span>
          <span className="bg-blue-600/30 text-blue-300 px-2 py-1 rounded text-xs">
            {visualization.type}
          </span>
        </div>
      </div>

      {/* Main Visualization - Streamlined */}
      <div className="bg-gray-900 rounded-lg border border-gray-600 min-h-[400px]">
        <VisualizationRenderer 
          visualization={visualization}
          cached={cached}
          stepData={cached?.enhancedStep || currentStepData}
          debug={debug}
          onError={(error) => console.error('Visualization error:', error)}
          onRetry={() => onStepChange?.(currentStep)}
          onReset={() => onStepChange?.(0)}
        />
      </div>
    </div>
  );
});

export default VisualizationEngine;
// Re-export validation utility for backward compatibility with existing tests
// Legacy wrapper to maintain test expectations (accepts visualization object rather than raw data & type)
export function validateVisualizationData(visualization) {
  const errors = [];
  if (!visualization) {
    return { isValid: false, errors: ['Visualization object is null or undefined'] };
  }
  if (!visualization.type) {
    errors.push('Visualization type is missing');
  }
  if (!visualization.data) {
    errors.push('Visualization data is missing');
  }
  const type = visualization.type;
  const data = visualization.data;
  if (type) {
    switch (type.toLowerCase()) {
      case 'array':
      case 'window':
      case 'pointers':
        if (data && !Array.isArray(data.array) && !Array.isArray(data.arrays)) {
          errors.push('Array visualization requires array or arrays data');
        }
        break;
      case 'tree':
        if (data && !Array.isArray(data.nodes)) {
          errors.push('Tree visualization requires nodes array');
        }
        break;
      case 'graph':
        if (data && (!Array.isArray(data.vertices) || !Array.isArray(data.edges))) {
          errors.push('Graph visualization requires vertices and edges arrays');
        }
        break;
      case 'linkedlist':
      case 'linked_list':
        if (data && !Array.isArray(data.nodes)) {
          errors.push('Linked list visualization requires nodes array');
        }
        break;
      case 'stack':
      case 'queue':
        if (data && !Array.isArray(data.elements)) {
          errors.push(`${type} visualization requires elements array`);
        }
        break;
      case 'recursion':
        if (data && !Array.isArray(data.callStack)) {
          errors.push('Recursion visualization requires callStack array');
        }
        break;
      default:
        break;
    }
  }
  return { isValid: errors.length === 0, errors };
}

// Internal use will rely on new validator
// Provide internal alias expected elsewhere (legacy signature not used internally)
const legacyValidateVisualizationData = validateVisualizationData;

/**
 * Component that renders the appropriate visualizer based on type
 * Optimized with React.memo and lazy loading for performance
 */
const VisualizationRenderer = memo(function VisualizationRenderer({ visualization, cached, stepData, onError, onRetry, onReset, debug }) {
  const { type, canonicalType } = visualization;
  const effectiveType = canonicalType || type;
  
  // Use cached validation/sanitized data if present
  let validationResult = cached?.validationResult || { isValid: true, warnings: [], edgeCases: [], pitfalls: [], sanitizedData: visualization.data || visualization };
  let sanitizedData = cached?.slimData || validationResult.sanitizedData || visualization.data || visualization;

  // Salvage path: legacy alias types sometimes provide { array: [...] } only; if validator failed but raw data is convertible, synthesize minimal structure
  if (!validationResult.isValid && ['array','window','pointers'].includes(effectiveType?.toLowerCase())) {
    const raw = visualization.data || {};
    if (Array.isArray(raw.array)) {
      const salvage = { arrays: [{ name: raw.name || 'Array', values: raw.array, highlights: raw.highlights || {} }], pointers: raw.pointers || [], operations: raw.operations || [] };
      sanitizedData = salvage;
      validationResult = { ...validationResult, isValid: true, errors: [] };
    }
  }

  if (debug) {
    // Lightweight debug info only
    // eslint-disable-next-line no-console
    console.log('[VizDbg]', { step: stepData?.stepNumber, type, warnings: validationResult.warnings.length, edgeCases: validationResult.edgeCases.length });
  }

  // If validation failed completely, show appropriate fallback
  if (!validationResult.isValid) {
    const error = new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
    const t = effectiveType?.toLowerCase();
    if (['array', 'window', 'pointers'].includes(t)) {
      // Attempt to provide a minimal illustrative dataset so user still sees something useful
      const sampleData = sanitizedData && sanitizedData.arrays ? sanitizedData : {
        arrays: [
          { name: 'Sample', values: [1, 2, 3, 4, 5], highlights: { current: [0] } }
        ],
        pointers: [ { name: 'start', position: 0, color: '#60a5fa' } ],
        operations: []
      };
      return <ArrayFallbackVisualizer data={sampleData} stepData={stepData} error={error} onRetry={onRetry} onReset={onReset} />;
    }
    if (['hashmap', 'hash_map', 'map'].includes(t)) {
      return <GenericFallbackVisualizer data={sanitizedData} stepData={stepData} error={error} onRetry={onRetry} onReset={onReset} title="HashMap Visualization Error" />;
    }
    if (t === 'tree') {
      return <TreeFallbackVisualizer data={sanitizedData} stepData={stepData} error={error} onRetry={onRetry} onReset={onReset} />;
    }
    if (t === 'graph') {
      return <GraphFallbackVisualizer data={sanitizedData} stepData={stepData} error={error} onRetry={onRetry} onReset={onReset} />;
    }
    if (t === 'linkedlist' || t === 'linked_list') {
      // Treat linked list data errors generically for now
      return <GenericFallbackVisualizer data={sanitizedData} stepData={stepData} error={error} onRetry={onRetry} onReset={onReset} title="Linked List Visualization Error" />;
    }
    return <GenericFallbackVisualizer data={sanitizedData} stepData={stepData} error={error} onRetry={onRetry} onReset={onReset} />;
  }

  try {
    // Use lazy loading for all visualizers to improve performance
    return (
      <VisualizationErrorBoundary
        onError={onError}
        fallback={(error, errorInfo, retry, reset) => {
          // Use type-specific fallback based on visualization type
          switch (effectiveType?.toLowerCase()) {
            case 'array':
            case 'window':
            case 'pointers':
              return (
                <ArrayFallbackVisualizer 
                  data={sanitizedData}
                  stepData={stepData}
                  error={error}
                  onRetry={retry}
                  onReset={reset}
                />
              );
            case 'hashmap':
            case 'hash_map':
            case 'map':
              return (
                <GenericFallbackVisualizer 
                  data={sanitizedData}
                  stepData={stepData}
                  error={error}
                  title="HashMap Visualization Error"
                  onRetry={retry}
                  onReset={reset}
                />
              );
            case 'tree':
              return (
                <TreeFallbackVisualizer 
                  data={sanitizedData}
                  stepData={stepData}
                  error={error}
                  onRetry={retry}
                  onReset={reset}
                />
              );
            case 'graph':
              return (
                <GraphFallbackVisualizer 
                  data={sanitizedData}
                  stepData={stepData}
                  error={error}
                  onRetry={retry}
                  onReset={reset}
                />
              );
            default:
              return (
                <GenericFallbackVisualizer 
                  data={sanitizedData}
                  stepData={stepData}
                  error={error}
                  title={`${type || 'Unknown'} Visualization Error`}
                  onRetry={retry}
                  onReset={reset}
                />
              );
          }
        }}
      >
        <LazyVisualizationLoader
          type={type}
          data={sanitizedData}
          stepData={stepData}
                  title={getVisualizationTitle(effectiveType)}
                  mode={getVisualizationMode(effectiveType)}
        />
      </VisualizationErrorBoundary>
    );
  } catch (error) {
    console.error('Error rendering visualization:', error);
    onError?.(error);
    return <VisualizationErrorFallback error={error} visualization={visualization} onRetry={onRetry} onReset={onReset} />;
  }
});

/**
 * Produce a lightweight data object for the visualizer to reduce prop churn.
 */
function deriveSlimData(type, data) {
  if (!data || typeof data !== 'object') return data;
  const t = type?.toLowerCase();
  switch (t) {
    case 'array':
    case 'window':
    case 'pointers': {
      const { arrays = [], pointers = [], operations = [], highlights, window: win, hashMap, subarrays, calculations, results, ...rest } = data;
      return { 
        arrays, 
        pointers, 
        operations, 
        highlights: highlights || rest?.highlights, 
        window: win || rest?.window,
        hashMap: hashMap || rest?.hashMap,
        subarrays: subarrays || rest?.subarrays,
        calculations: calculations || rest?.calculations,
        results: results || rest?.results
      };
    }
    case 'string':
    case 'strings':
    case 'substring':
    case 'text': {
      const { string, text, input, pointers = [], hashMap, highlights, calculations, results, subarrays, operations = [], ...rest } = data;
      return {
        string: string || text || input || '',
        pointers,
        hashMap: hashMap || rest?.hashMap,
        highlights: highlights || rest?.highlights,
        calculations: calculations || rest?.calculations,
        results: results || rest?.results,
        subarrays: subarrays || rest?.subarrays,
        operations
      };
    }
    case 'hashmap':
    case 'hash_map':
    case 'map': {
      const { hashMap, map, dictionary, highlights, operations, ...rest } = data;
      return { 
        hashMap: hashMap || map || dictionary || data,
        highlights: highlights || rest?.highlights,
        operations: operations || rest?.operations
      };
    }
    case 'tree': {
      const { nodes = [], edges = [], traversalPath, currentNode } = data;
      return { nodes, edges, traversalPath, currentNode };
    }
    case 'graph': {
      const { vertices = [], edges = [], algorithm, directed } = data;
      return { vertices, edges, algorithm, directed };
    }
    case 'linkedlist':
    case 'linked_list': {
      const { nodes = [], head, tail } = data;
      return { nodes, head, tail };
    }
    case 'stack':
    case 'queue': {
      const { elements = [] } = data;
      return { elements };
    }
    case 'dp':
    case 'dp_table':
    case 'dynamic_programming': {
      if (Array.isArray(data.matrix)) return { matrix: data.matrix };
      if (Array.isArray(data.table)) return { matrix: data.table };
      if (Array.isArray(data.dp)) return { matrix: data.dp };
      return data;
    }
    case 'results':
    case 'summary': {
      const { results, supportingData, statistics, ...rest } = data;
      return { 
        results: results || rest,
        supportingData: supportingData || rest?.supportingData,
        statistics: statistics || rest?.statistics
      };
    }
    case 'hybrid': {
      // For hybrid visualizations, preserve all data
      return data;
    }
    default:
      return data; // Fallback: return original
  }
}

/**
 * Enhanced type detection for AI-generated visualizations
 * This enables the AI to specify the primary data structure focus for each step
 */
function detectPrimaryVisualizationType(data, explicitType) {
  // If AI explicitly specified type, prioritize it
  if (explicitType) {
    return explicitType.toLowerCase();
  }

  if (!data || typeof data !== 'object') {
    return 'array'; // fallback
  }

  // Count the "weight" of different data structure types
  const hasArray = (data.arrays && data.arrays.length > 0) || (data.array && Array.isArray(data.array));
  const hasString = data.string || data.text || (typeof data.input === 'string');
  const hasHashMap = data.hashMap && Object.keys(data.hashMap).length > 0;
  const hasTree = data.tree || data.root || (data.nodes && data.nodes.some(n => n.parent !== undefined));
  const hasGraph = data.graph || (data.vertices && data.edges);
  const hasResults = data.results && Object.keys(data.results).length > 0;
  const hasPointers = data.pointers && data.pointers.length > 0;

  // Priority detection based on educational focus
  if (hasResults && !hasArray && !hasHashMap && !hasString) {
    return 'results';
  }
  
  if (hasString && (!hasArray || hasPointers)) {
    // String problems often use pointers/sliding window
    return 'string';
  }
  
  if (hasHashMap && (!hasArray || Object.keys(data.hashMap).length > 3)) {
    // HashMap is primary if it has significant data or no competing arrays
    return 'hashmap';
  }
  
  if (hasTree) {
    return 'tree';
  }
  
  if (hasGraph) {
    return 'graph';
  }
  
  if (hasArray) {
    return 'array';
  }

  return 'array'; // ultimate fallback
}

/**
 * Helper function to get appropriate title for visualization type
 */
function getVisualizationTitle(type) {
  switch (type?.toLowerCase()) {
    case 'array':
      return 'Array Visualization';
    case 'string':
    case 'strings':
    case 'substring':
    case 'text':
      return 'String Visualization';
    case 'hashmap':
    case 'hash_map':
    case 'map':
      return 'HashMap Visualization';
    case 'dp':
    case 'dp_table':
    case 'dynamic_programming':
      return 'DP Table Visualization';
    case 'tree':
      return 'Tree Visualization';
    case 'graph':
      return 'Graph Visualization';
    case 'linkedlist':
    case 'linked_list':
      return 'Linked List Visualization';
    case 'stack':
      return 'Stack Visualization';
    case 'queue':
      return 'Queue Visualization';
    case 'recursion':
      return 'Recursion Visualization';
    case 'window':
      return 'Sliding Window Visualization';
    case 'pointers':
      return 'Two Pointers Visualization';
    case 'hybrid':
      return 'Hybrid Visualization';
    case 'results':
      return 'Algorithm Results';
    default:
      return `${type || 'Unknown'} Visualization`;
  }
}

/**
 * Helper function to get appropriate mode for visualization type
 */
function getVisualizationMode(type) {
  switch (type?.toLowerCase()) {
    case 'window':
      return 'window';
    case 'pointers':
      return 'pointers';
    case 'dp':
    case 'dp_table':
    case 'dynamic_programming':
      return 'dp';
    default:
      return 'default';
  }
}

/**
 * Fallback component for unknown visualization types
 */
function UnknownVisualizationFallback({ visualization, onRetry, onReset }) {
  return (
    <GenericFallbackVisualizer
      data={visualization}
      error={new Error(`Unknown visualization type: ${visualization?.type || 'undefined'}`)}
      title="Unknown Visualization Type"
      onRetry={onRetry}
      onReset={onReset}
    />
  );
}

/**
 * Error fallback component for visualization rendering errors
 */
function VisualizationErrorFallback({ error, visualization, onRetry, onReset }) {
  const visualizationType = visualization?.type || 'unknown';
  
  // Use type-specific fallback if available
  switch (visualizationType.toLowerCase()) {
    case 'array':
      return (
        <ArrayFallbackVisualizer
          data={visualization}
          error={error}
          onRetry={onRetry}
          onReset={onReset}
        />
      );
    case 'tree':
      return (
        <TreeFallbackVisualizer
          data={visualization}
          error={error}
          onRetry={onRetry}
          onReset={onReset}
        />
      );
    case 'graph':
      return (
        <GraphFallbackVisualizer
          data={visualization}
          error={error}
          onRetry={onRetry}
          onReset={onReset}
        />
      );
    default:
      return (
        <GenericFallbackVisualizer
          data={visualization}
          error={error}
          title="Visualization Rendering Error"
          onRetry={onRetry}
          onReset={onReset}
        />
      );
  }
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
  'linked_list': 'linkedlist',
  'dp': 'dp',
  'dp_matrix': 'dp',
  'dp_knapsack': 'dp',
  'dp_lcs': 'dp',
  'dp_bitmask': 'dp'
  };
  
  const algorithmType = analysis.algorithmType?.toLowerCase();
  return algorithmTypeMap[algorithmType] || 'array';
}

// Helper to map legacy/alias visualization types to canonical ones for validation/rendering
function mapToCanonicalType(type) {
  if (!type) return type;
  const t = type.toLowerCase();
  switch (t) {
    case 'window':
    case 'pointers':
      return 'array';
    case 'linked_list':
      return 'linkedlist';
    case 'string':
    case 'strings':
    case 'char_array':
    case 'substring':
    case 'text':
      return 'string'; // Keep string as its own type
    case 'hash_map':
    case 'hash-map':
    case 'map':
    case 'dictionary':
    case 'frequency':
    case 'counter':
      return 'hashmap';
    case 'dp_table':
    case 'dynamic_programming':
      return 'dp';
    case 'results':
    case 'summary':
      return 'results';
    case 'hybrid':
    case 'mixed':
      return 'hybrid';
    default:
      return t;
  }
}

/**
 * Utility function to validate visualization data structure
 * @param {Object} visualization - Visualization object to validate
 * @returns {Object} - Validation result with isValid and errors
 */
// export function validateVisualizationData(visualization) {
//   const errors = [];
  
//   if (!visualization) {
//     errors.push('Visualization object is null or undefined');
//     return { isValid: false, errors };
//   }
  
//   if (!visualization.type) {
//     errors.push('Visualization type is missing');
//   }
  
//   if (!visualization.data) {
//     errors.push('Visualization data is missing');
//   }
  
//   // Type-specific validation
//   switch (visualization.type?.toLowerCase()) {
//     case 'array':
//       if (visualization.data && !Array.isArray(visualization.data.array) && !Array.isArray(visualization.data.arrays)) {
//         errors.push('Array visualization requires array or arrays data');
//       }
//       break;
      
//     case 'tree':
//       if (visualization.data && !Array.isArray(visualization.data.nodes)) {
//         errors.push('Tree visualization requires nodes array');
//       }
//       break;
      
//     case 'graph':
//       if (visualization.data && (!Array.isArray(visualization.data.vertices) || !Array.isArray(visualization.data.edges))) {
//         errors.push('Graph visualization requires vertices and edges arrays');
//       }
//       break;
      
//     case 'linkedlist':
//       if (visualization.data && !Array.isArray(visualization.data.nodes)) {
//         errors.push('Linked list visualization requires nodes array');
//       }
//       break;
      
//     case 'stack':
//     case 'queue':
//       if (visualization.data && !Array.isArray(visualization.data.elements)) {
//         errors.push(`${visualization.type} visualization requires elements array`);
//       }
//       break;
      
//     case 'recursion':
//       if (visualization.data && !Array.isArray(visualization.data.callStack)) {
//         errors.push('Recursion visualization requires callStack array');
//       }
//       break;
//   }
  
//   return {
//     isValid: errors.length === 0,
//     errors
//   };
// }