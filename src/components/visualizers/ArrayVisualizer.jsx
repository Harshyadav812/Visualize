import React, { memo } from 'react';
import BaseVisualizer, { withErrorBoundary, VisualizerUtils } from './BaseVisualizer';
import { formatValue, VISUALIZATION_SCHEMAS } from '../../utils/visualizationSchemas';
import './ArrayVisualizer.css';

/**
 * Enhanced Array Visualizer with support for multiple arrays,
 * advanced highlighting, and various array operations
 * Optimized with React.memo for performance
 */
function ArrayVisualizer({ data, stepData, title = "Array Visualization", mode = "default" }) {
  // Handle completely undefined/null data early
  if (!data) {
    console.warn('ArrayVisualizer: No data provided, using default empty array');
    return (
      <BaseVisualizer data={data} stepData={stepData} title={title}>
        <div className="text-center p-8">
          <div className="text-gray-400 mb-4">No array data to visualize</div>
          <div className="flex justify-center">
            <div className="bg-gray-700 rounded p-4 text-sm">
              Example Array Structure
              <div className="mt-2 font-mono text-xs">
                [1, 2, 3, 4, 5]
              </div>
            </div>
          </div>
        </div>
      </BaseVisualizer>
    );
  }

  // Handle legacy data formats
  let normalizedData = normalizeArrayData(data, mode);

  // Validate required data - with graceful error handling
  try {
    // Extra safety checks
    if (!normalizedData) {
      throw new Error('normalizeArrayData returned null/undefined');
    }
    if (!normalizedData.arrays) {
      console.warn('arrays property is missing, using fallback');
      normalizedData.arrays = [{ name: 'Array', values: [1, 2, 3, 4, 5], highlights: {} }];
    }
    if (!Array.isArray(normalizedData.arrays)) {
      console.warn('arrays property is not an array, converting');
      normalizedData.arrays = [normalizedData.arrays];
    }
    if (normalizedData.arrays.length === 0) {
      console.warn('Arrays is empty, adding fallback array');
      normalizedData.arrays = [{ name: 'Array', values: [1, 2, 3, 4, 5], highlights: {} }];
    }

    // Try validation but don't fail on it
    try {
      VisualizerUtils.validateData(normalizedData, ['arrays']);
    } catch (validationError) {
      console.warn('ArrayVisualizer validation warning:', validationError.message);
      // Clean up problematic data
      if (normalizedData.operations && !Array.isArray(normalizedData.operations)) {
        normalizedData.operations = [];
      }
      if (normalizedData.operations) {
        normalizedData.operations = normalizedData.operations.filter(op =>
          typeof op === 'object' && op !== null
        ).map(op => ({
          type: op.type || 'action',
          description: op.description || 'Operation',
          indices: Array.isArray(op.indices) ? op.indices : []
        }));
      }
    }
  } catch (error) {
    console.error('ArrayVisualizer critical error:', error);
    // Provide completely safe fallback
    normalizedData = {
      arrays: [{ name: 'Array', values: [1, 2, 3, 4, 5], highlights: {} }],
      pointers: [],
      operations: [],
      subarrays: [],
      hashMap: null,
      calculations: [],
      results: null
    };
  }

  return (
    <BaseVisualizer data={data} stepData={stepData} title={title}>
      <div data-testid="array-visualizer" className="hidden" />
      <div className="space-y-6">
        {/* Render each array with auto-scaling layout container */}
        {normalizedData.arrays.map((arrayData, arrayIndex) => (
          <div key={arrayIndex} className="w-full overflow-x-auto">
            <ArrayDisplay
              arrayData={arrayData}
              pointers={normalizedData.pointers}
              operations={normalizedData.operations}
            />
          </div>
        ))}

        {/* Subarray Highlights Display */}
        {normalizedData.subarrays && normalizedData.subarrays.length > 0 && (
          <SubarraysDisplay subarrays={normalizedData.subarrays} />
        )}

        {/* HashMap Display for prefix sum problems */}
        {normalizedData.hashMap && (
          <HashMapDisplay hashMap={normalizedData.hashMap} />
        )}

        {/* Mathematical Operations Display */}
        {normalizedData.calculations && normalizedData.calculations.length > 0 && (
          <CalculationsDisplay calculations={normalizedData.calculations} />
        )}

        {/* Operations Display */}
        {normalizedData.operations && normalizedData.operations.length > 0 && (
          <OperationsDisplay operations={normalizedData.operations} />
        )}

        {/* Results Summary */}
        {normalizedData.results && (
          <ResultsDisplay results={normalizedData.results} />
        )}

        {/* Pointers Legend */}
        {normalizedData.pointers && normalizedData.pointers.length > 0 && (
          <PointersLegend pointers={normalizedData.pointers} />
        )}
      </div>
    </BaseVisualizer>
  );
};

ArrayVisualizer.displayName = 'ArrayVisualizer';

/**
 * Display component for a single array with highlights and pointers
 * Optimized with React.memo for performance
 */
const ArrayDisplay = memo(function ArrayDisplay({ arrayData, pointers = [], operations = [] }) {
  const { name, values, highlights = {} } = arrayData;

  return (
    <div className="space-y-4">
      {/* Array Name */}
      {name && (
        <div className="text-blue-300 font-semibold text-lg">
          {name} {values && values.length > 0 && `(length: ${values.length})`}
        </div>
      )}

      {/* Array Elements */}
      <div className="flex flex-row flex-wrap md:flex-nowrap md:justify-start justify-center gap-2 p-4 bg-gray-800 rounded-lg relative w-full min-w-min">
        {values && values.length > 0 ? (
          values.map((value, index) => (
            <ArrayElement
              key={`${index}-${value}`} // Include value in key for better animation tracking
              value={value}
              index={index}
              highlights={highlights}
              pointers={pointers}
              operations={operations}
            />
          ))
        ) : (
          <div className="text-gray-400 text-center py-4">
            No array elements to display
            <br />
            <small>Values: {JSON.stringify(values)}</small>
          </div>
        )}

        {/* Array transformation indicators */}
        {highlights.transformation && (
          <ArrayTransformationIndicator transformation={highlights.transformation} />
        )}
      </div>

      {/* Array Statistics */}
      <ArrayStatistics arrayData={arrayData} />
    </div>
  );
});

/**
 * Individual array element with clear, descriptive visualization
 * Optimized with React.memo for performance
 */
const ArrayElement = memo(function ArrayElement({ value, index, highlights, pointers, operations }) {
  // Determine element state and styling
  const elementState = getElementState(index, highlights);
  const elementClass = getElementClass(elementState);
  const relevantPointers = pointers.filter(p => p.position === index);

  // Check if this element is involved in current operations
  const currentOperation = operations.find(op => op.indices && op.indices.includes(index));

  // Handle overlapping pointers intelligently
  const renderPointers = () => {
    if (relevantPointers.length === 0) return null;

    if (relevantPointers.length === 1) {
      const pointer = relevantPointers[0];
      return (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <div className="text-center">
            <div
              className="text-xs font-bold px-2 py-1 rounded"
              style={{
                backgroundColor: pointer.color || '#3b82f6',
                color: 'white'
              }}
            >
              {pointer.name}
            </div>
          </div>
        </div>
      );
    }

    // Handle multiple pointers at same position
    return (
      <div className="absolute -top-14 left-1/2 transform -translate-x-1/2">
        <div className="text-center">
          <div className="bg-gray-800 border border-gray-600 rounded px-2 py-1">
            {relevantPointers.map((pointer, pIndex) => (
              <div key={pIndex} className="text-xs font-bold" style={{ color: pointer.color || '#3b82f6' }}>
                {pointer.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Pointer indicators - no animations, clear positioning */}
      {renderPointers()}

      {/* Array element - clean and simple */}
      <div className={`array-element w-16 h-16 border-2 rounded-lg flex flex-col items-center justify-center font-bold ${elementClass}`}>
        <span className="text-lg">{formatValue(value, 'array')}</span>
        <span className="text-xs opacity-75">{index}</span>

        {/* Simple operation indicator */}
        {currentOperation && (
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-purple-500 flex items-center justify-center">
            <span className="text-xs text-white">•</span>
          </div>
        )}
      </div>

      {/* Window boundary indicators - clearer and more descriptive */}
      {highlights.window && (
        <>
          {index === highlights.window.start && index === highlights.window.end && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                WINDOW
              </div>
            </div>
          )}
          {index === highlights.window.start && index !== highlights.window.end && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                START
              </div>
            </div>
          )}
          {index === highlights.window.end && index !== highlights.window.start && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                END
              </div>
            </div>
          )}
        </>
      )}

      {/* Window range indicator */}
      {highlights.window && index > highlights.window.start && index < highlights.window.end && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-500/50 text-blue-200 text-xs font-bold px-1 py-0.5 rounded">
            IN
          </div>
        </div>
      )}
      {/* Subarray indicator when not using window */}
      {(!highlights.window) && highlights.subarray && highlights.subarray.includes(index) && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded">SUB</div>
        </div>
      )}
    </div>
  );
});

/**
 * Display meaningful array statistics and algorithm information
 * Optimized with React.memo for performance
 */
const ArrayStatistics = memo(function ArrayStatistics({ arrayData }) {
  const { highlights = {}, values = [] } = arrayData;
  const stats = [];

  // Basic array information
  stats.push(
    { label: 'Array Length', value: values.length, color: 'gray', icon: '📏' }
  );

  // Window information - more descriptive
  if (highlights.window) {
    const { start, end } = highlights.window;
    const windowSize = end - start + 1;

    // Calculate window sum if not provided
    let windowSum = highlights.windowSum;
    if (windowSum === undefined && values.length > 0) {
      windowSum = 0;
      for (let i = start; i <= end && i < values.length; i++) {
        windowSum += values[i];
      }
    }

    stats.push(
      { label: 'Window Start', value: start, color: 'blue', icon: '⬅️' },
      { label: 'Window End', value: end, color: 'blue', icon: '➡️' },
      { label: 'Window Size', value: windowSize, color: 'green', icon: '📐' }
    );

    if (windowSum !== undefined) {
      stats.push({ label: 'Window Sum', value: windowSum, color: 'yellow', icon: '➕' });
    }

    // Show window elements
    if (values.length > 0) {
      const windowElements = [];
      for (let i = start; i <= end && i < values.length; i++) {
        windowElements.push(values[i]);
      }
      if (windowElements.length > 0) {
        stats.push({
          label: 'Window Elements',
          value: `[${windowElements.join(', ')}]`,
          color: 'purple',
          icon: '🔢'
        });
      }
    }
  }

  // Current element
  if (highlights.current && highlights.current.length > 0) {
    const currentIndex = highlights.current[0];
    const currentValue = values[currentIndex];
    stats.push({
      label: 'Current',
      value: `${currentValue} (i=${currentIndex})`,
      color: 'yellow',
      icon: '👆'
    });
  }

  // Target element
  if (highlights.target && highlights.target.length > 0) {
    const targetIndex = highlights.target[0];
    const targetValue = values[targetIndex];
    stats.push({
      label: 'Target',
      value: `${targetValue} (i=${targetIndex})`,
      color: 'red',
      icon: '🎯'
    });
  }

  // Sorting / algorithm metrics
  if (Array.isArray(highlights.sorted) && highlights.sorted.length > 0) {
    stats.push({ label: 'Sorted Elements', value: highlights.sorted.length, color: 'purple', icon: '✅' });
  }
  if (typeof highlights.comparisons === 'number') {
    stats.push({ label: 'Comparisons', value: highlights.comparisons, color: 'yellow', icon: '⚖️' });
  }
  if (typeof highlights.swaps === 'number') {
    stats.push({ label: 'Swaps', value: highlights.swaps, color: 'orange', icon: '⇄' });
  }

  if (stats.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {stats.map((stat, index) => (
        <div key={index} className="bg-gray-800 rounded-lg p-3 border border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{stat.icon}</span>
              <div className={`text-${stat.color}-400 text-sm font-semibold`}>
                {stat.label}
              </div>
            </div>
            <div className={`text-${stat.color}-300 font-bold text-right`}>
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

/**
 * Display current operations being performed with enhanced visual indicators
 * Optimized with React.memo for performance
 */
const OperationsDisplay = memo(function OperationsDisplay({ operations }) {
  if (!operations || operations.length === 0) return null;

  const getOperationIcon = (type) => {
    switch (type) {
      case 'swap': return '⇄';
      case 'compare': return '⚖️';
      case 'access': return '👁️';
      case 'insert': return '➕';
      case 'delete': return '➖';
      case 'move': return '➡️';
      default: return '⚡';
    }
  };

  const getOperationColor = (type) => {
    switch (type) {
      case 'swap': return 'bg-red-600 border-red-400';
      case 'compare': return 'bg-blue-600 border-blue-400';
      case 'access': return 'bg-green-600 border-green-400';
      case 'insert': return 'bg-yellow-600 border-yellow-400';
      case 'delete': return 'bg-orange-600 border-orange-400';
      case 'move': return 'bg-purple-600 border-purple-400';
      default: return 'bg-gray-600 border-gray-400';
    }
  };

  return (
    <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4 animate-fadeIn">
      <h4 className="text-purple-300 font-semibold mb-3 flex items-center">
        <span className="mr-2 animate-spin">⚡</span>
        Current Operations
      </h4>
      <div className="space-y-3">
        {operations.map((operation, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getOperationColor(operation.type)} animate-pulse`}>
              {getOperationIcon(operation.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="bg-purple-600 text-white px-2 py-1 rounded text-sm font-medium">
                  {operation.type.toUpperCase()}
                </span>
                {operation.indices && operation.indices.length > 0 && (
                  <span className="text-purple-200 text-sm">
                    Indices: [{operation.indices.join(', ')}]
                  </span>
                )}
              </div>
              {operation.description && (
                <div className="text-purple-300 text-sm mt-1">
                  {operation.description}
                </div>
              )}
              {operation.values && (
                <div className="text-purple-200 text-xs mt-1">
                  Values: [{operation.values.join(', ')}]
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

/**
 * Display array transformation indicators for sorting animations
 */
function ArrayTransformationIndicator({ transformation }) {
  if (!transformation) return null;

  return (
    <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
      {transformation.type === 'sort' && '🔄 Sorting'}
      {transformation.type === 'reverse' && '↩️ Reversing'}
      {transformation.type === 'rotate' && '🔄 Rotating'}
      {transformation.type === 'partition' && '📊 Partitioning'}
    </div>
  );
}

/**
 * Display legend for pointers with clear, descriptive information
 * Optimized with React.memo for performance
 */
const PointersLegend = memo(function PointersLegend({ pointers }) {
  if (!pointers || pointers.length === 0) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
      <h4 className="text-gray-300 font-semibold mb-3 flex items-center">
        <span className="mr-2">🎯</span>
        Pointers Legend
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pointers.map((pointer, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: pointer.color || '#3b82f6' }}
              />
              <div className="text-gray-300 font-medium">
                {pointer.name}
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-300 font-bold">
                {pointer.position}
              </div>
              <div className="text-gray-400 text-xs">
                Position: {pointer.position}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

/**
 * Normalize operations to ensure they're in the correct format
 */
function normalizeOperations(operations) {
  if (!operations) return [];

  if (!Array.isArray(operations)) {
    console.warn('Operations is not an array, converting:', operations);
    return [];
  }

  return operations.map((op, index) => {
    if (typeof op === 'string') {
      return {
        type: 'action',
        description: op,
        indices: []
      };
    }

    if (typeof op === 'object' && op !== null) {
      return {
        type: op.type || 'action',
        description: op.description || `Operation ${index + 1}`,
        indices: Array.isArray(op.indices) ? op.indices : [],
        values: Array.isArray(op.values) ? op.values : []
      };
    }

    // Fallback for invalid operations
    return {
      type: 'unknown',
      description: `Step ${index + 1}`,
      indices: []
    };
  });
}

/**
 * Helper function to detect and extract HashMap data from array values
 */
function extractHashMapFromArrays(arrays) {
  let extractedHashMap = null;
  const cleanedArrays = arrays.map(arr => {
    const cleanedValues = arr.values.map(value => {
      // Check if this value looks like a JSON object string
      if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
        try {
          const parsed = JSON.parse(value);
          if (typeof parsed === 'object' && !Array.isArray(parsed)) {
            // This looks like HashMap data, extract it
            if (!extractedHashMap) {
              extractedHashMap = parsed;
            } else {
              // Merge with existing HashMap
              extractedHashMap = { ...extractedHashMap, ...parsed };
            }
            // Return a placeholder for the array
            return 'Map{}';
          }
        } catch {
          // Not valid JSON, keep as is
        }
      }
      return value;
    });

    return {
      ...arr,
      values: cleanedValues
    };
  });

  return { cleanedArrays, extractedHashMap };
}

/**
 * Normalize different array data formats to a consistent structure
 */
function normalizeArrayData(data, mode) {
  // Create a safe fallback structure
  const createFallback = (reason = 'no data provided') => {
    console.warn(`normalizeArrayData - ${reason}, using fallback`);
    return {
      arrays: [{
        name: 'Array',
        values: [],
        highlights: {}
      }],
      pointers: [],
      operations: normalizeOperations(null),
      subarrays: [],
      hashMap: null,
      calculations: [],
      results: null
    };
  };

  if (!data) {
    return createFallback('no data provided');
  }

  try {
    // Legacy window mode support
    if (mode === 'window' && Array.isArray(data.array)) {
      const windowStart = data.windowStart ?? data.window?.start;
      const windowEnd = data.windowEnd ?? data.window?.end;
      const windowSum = data.windowSum;
      const highlights = data.highlights ? { ...data.highlights } : {};
      if (typeof windowStart === 'number' && typeof windowEnd === 'number') {
        highlights.window = { start: windowStart, end: windowEnd };
        if (windowSum !== undefined) highlights.windowSum = windowSum;
      }
      return {
        arrays: [{ name: data.name || 'Array', values: data.array, highlights }],
        pointers: data.pointers || [],
        operations: data.operations || [],
        subarrays: data.subarrays || [],
        hashMap: data.hashMap || data.map || null,
        calculations: data.calculations || [],
        results: data.results || null
      };
    }

    // Legacy pointers mode support
    if (mode === 'pointers' && Array.isArray(data.array)) {
      return {
        arrays: [{ name: data.name || 'Array', values: data.array, highlights: data.highlights || {} }],
        pointers: data.pointers || [],
        operations: normalizeOperations(data.operations),
        subarrays: data.subarrays || [],
        hashMap: data.hashMap || data.map || null,
        calculations: data.calculations || [],
        results: data.results || null
      };
    }

    // Handle structured format with arrays property (most common from AI)
    if (data.arrays && Array.isArray(data.arrays)) {
      const { cleanedArrays, extractedHashMap } = extractHashMapFromArrays(data.arrays);
      return {
        arrays: cleanedArrays,
        pointers: data.pointers || [],
        operations: normalizeOperations(data.operations),
        subarrays: data.subarrays || [],
        hashMap: extractedHashMap || data.hashMap || data.map || null,
        calculations: data.calculations || [],
        results: data.results || null
      };
    }

    // Handle case where data has type property and arrays at same level
    if (data.type === 'array' && data.arrays) {
      return {
        arrays: data.arrays,
        pointers: data.pointers || [],
        operations: normalizeOperations(data.operations),
        subarrays: data.subarrays || [],
        hashMap: data.hashMap || data.map || null,
        calculations: data.calculations || [],
        results: data.results || null
      };
    }

    // Handle single array with array property
    if (data.array && Array.isArray(data.array)) {
      console.log('normalizeArrayData - using array property');
      const arrayData = [{
        name: data.name || 'Array',
        values: data.array,
        highlights: data.highlights || {}
      }];
      const { cleanedArrays, extractedHashMap } = extractHashMapFromArrays(arrayData);
      return {
        arrays: cleanedArrays,
        pointers: data.pointers || [],
        operations: normalizeOperations(data.operations),
        subarrays: data.subarrays || [],
        hashMap: extractedHashMap || data.hashMap || data.map || null,
        calculations: data.calculations || [],
        results: data.results || null
      };
    }

    // Handle direct array
    if (Array.isArray(data)) {
      console.log('normalizeArrayData - data is direct array');
      return {
        arrays: [{
          name: 'Array',
          values: data,
          highlights: {}
        }],
        pointers: [],
        operations: [],
        subarrays: [],
        hashMap: null,
        calculations: [],
        results: null
      };
    }

    // Handle simple object with values property
    if (data.values && Array.isArray(data.values)) {
      console.log('normalizeArrayData - using values property');
      return {
        arrays: [{
          name: data.name || 'Array',
          values: data.values,
          highlights: data.highlights || {}
        }],
        pointers: data.pointers || [],
        operations: normalizeOperations(data.operations),
        subarrays: data.subarrays || [],
        hashMap: data.hashMap || data.map || null,
        calculations: data.calculations || [],
        results: data.results || null
      };
    }

    // Search for any array-like property
    if (typeof data === 'object') {
      const keys = Object.keys(data);
      console.log('normalizeArrayData - searching in object keys:', keys);

      for (const key of keys) {
        if (Array.isArray(data[key])) {
          console.log(`normalizeArrayData - found array in ${key}:`, data[key]);
          return {
            arrays: [{
              name: key.charAt(0).toUpperCase() + key.slice(1),
              values: data[key],
              highlights: data.highlights || {}
            }],
            pointers: data.pointers || [],
            operations: normalizeOperations(data.operations),
            subarrays: data.subarrays || [],
            hashMap: data.hashMap || data.map || null,
            calculations: data.calculations || [],
            results: data.results || null
          };
        }
      }
    }

    // If data is a string, try to create a character array
    if (typeof data === 'string') {
      console.log('normalizeArrayData - converting string to character array');
      return {
        arrays: [{
          name: 'String',
          values: data.split(''),
          highlights: {}
        }],
        pointers: [],
        operations: [],
        subarrays: [],
        hashMap: null,
        calculations: [],
        results: null
      };
    }

    // Fallback - create an informative empty state
    return createFallback('no array data found');

  } catch (error) {
    console.error('normalizeArrayData - error during processing:', error);
    return createFallback('error during processing');
  }
}

/**
 * Determine element state based on highlights with priority order
 */
function getElementState(index, highlights) {
  // Priority order: current > target > processing > sorted > highlighted > normal
  if (highlights.current && highlights.current.includes(index)) {
    return 'current';
  }
  if (highlights.target && highlights.target.includes(index)) {
    return 'target';
  }
  if (highlights.comparison && highlights.comparison.includes(index)) {
    return 'processing';
  }
  if (highlights.sorted && highlights.sorted.includes(index)) {
    return 'sorted';
  }
  if (highlights.visited && highlights.visited.includes(index)) {
    return 'visited';
  }
  if (highlights.window && index >= highlights.window.start && index <= highlights.window.end) {
    return 'highlighted';
  }
  if (highlights.subarray && highlights.subarray.includes(index)) {
    return 'highlighted';
  }
  return 'normal';
}

/**
 * Display subarrays with highlighting and ranges
 */
const SubarraysDisplay = memo(function SubarraysDisplay({ subarrays }) {
  if (!subarrays || subarrays.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 p-4 rounded-lg border border-green-600">
      <h4 className="text-green-300 font-semibold mb-3 flex items-center">
        <span className="mr-2">🎯</span>
        Found Subarrays
      </h4>
      <div className="space-y-2">
        {subarrays.map((subarray, index) => (
          <div key={index} className="flex items-center space-x-3 p-2 bg-green-800/20 rounded border border-green-700">
            <div className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">
              #{index + 1}
            </div>
            <div className="flex-1">
              <div className="text-green-200">
                Range: [{subarray.start}, {subarray.end}]
                {subarray.values && ` → [${subarray.values.join(', ')}]`}
              </div>
              {subarray.sum !== undefined && (
                <div className="text-green-300 text-sm">
                  Sum: {subarray.sum}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

/**
 * Display HashMap state for prefix sum algorithms
 */
const HashMapDisplay = memo(function HashMapDisplay({ hashMap }) {
  if (!hashMap || Object.keys(hashMap).length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 p-4 rounded-lg border border-purple-600">
      <h4 className="text-purple-300 font-semibold mb-3 flex items-center">
        <span className="mr-2">🗃️</span>
        HashMap State
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {Object.entries(hashMap).map(([key, value]) => {
          const displayValue = formatValue(value, 'hashmap');
          return (
            <div key={key} className="bg-purple-800/30 p-2 rounded border border-purple-700">
              <div className="text-purple-200 text-sm font-mono break-words">
                {formatValue(key, 'hashmap')} → {displayValue}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

/**
 * Display mathematical calculations step by step
 */
const CalculationsDisplay = memo(function CalculationsDisplay({ calculations }) {
  if (!calculations || calculations.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 p-4 rounded-lg border border-blue-600">
      <h4 className="text-blue-300 font-semibold mb-3 flex items-center">
        <span className="mr-2">🧮</span>
        Calculations
      </h4>
      <div className="space-y-2">
        {calculations.map((calc, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-blue-800/20 rounded border border-blue-700">
            <div className="text-blue-200 font-mono">
              {calc.expression}
            </div>
            <div className="text-blue-300 font-bold">
              = {calc.result}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

/**
 * Display final results and statistics
 */
const ResultsDisplay = memo(function ResultsDisplay({ results }) {
  if (!results) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-900/30 to-indigo-800/30 p-4 rounded-lg border border-indigo-600">
      <h4 className="text-indigo-300 font-semibold mb-3 flex items-center">
        <span className="mr-2">📊</span>
        Results
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(results).map(([key, value]) => {
          const displayValue = formatValue(value, 'display');
          return (
            <div key={key} className="text-center">
              <div className="text-2xl font-bold text-indigo-400 break-words">{displayValue}</div>
              <div className="text-sm text-indigo-300 capitalize">
                {key.replace(/([A-Z])/g, ' $1')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

/**
 * Get CSS classes for element based on state - clean and descriptive
 */
function getElementClass(state) {
  const baseClass = 'transition-colors duration-200 relative';

  switch (state) {
    case 'current':
      return `${baseClass} bg-yellow-500 border-yellow-400 text-black`;
    case 'target':
      return `${baseClass} bg-red-600 border-red-500 text-white`;
    case 'processing':
      return `${baseClass} bg-orange-600 border-orange-500 text-white`;
    case 'visited':
      return `${baseClass} bg-green-600 border-green-500 text-white`;
    case 'highlighted':
      return `${baseClass} bg-blue-600 border-blue-500 text-white`;
    case 'sorted':
      return `${baseClass} bg-purple-600 border-purple-500 text-white`;
    default:
      return `${baseClass} bg-gray-700 border-gray-600 text-gray-300`;
  }
}

const ArrayVisualizerMemo = memo(ArrayVisualizer);

const ArrayVisualizerWithErrorBoundary = withErrorBoundary(ArrayVisualizerMemo);
ArrayVisualizerWithErrorBoundary.displayName = 'ArrayVisualizerWithErrorBoundary';

export default ArrayVisualizerWithErrorBoundary;