import React, { useState, useEffect } from 'react';
import BaseVisualizer from './BaseVisualizer';
import { validateVisualizationData } from '../../utils/dataValidation';

/**
 * Heap/Priority Queue Visualizer Component
 * Handles min/max heaps and priority queue operations
 */
const HeapVisualizer = ({ data, stepData, title = "Heap Visualization" }) => {
  const [normalizedData, setNormalizedData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const normalized = normalizeHeapData(data);
      console.log('HeapVisualizer normalized data:', normalized);

      // Validate the normalized data
      const validation = validateVisualizationData(normalized, 'array');
      if (!validation.isValid) {
        console.warn('HeapVisualizer validation warnings:', validation.errors);
        // Don't throw error for validation warnings, just log them
      }

      setNormalizedData(normalized);
      setError(null);
    } catch (err) {
      console.error('HeapVisualizer error:', err);
      setError(err);
      setNormalizedData(null);
    }
  }, [data]);

  if (error) {
    return (
      <BaseVisualizer data={data} stepData={stepData} title={title}>
        <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 text-center">
          <div className="text-red-400 text-lg mb-2">❌</div>
          <h3 className="text-red-300 font-semibold mb-2">Heap Data Error</h3>
          <p className="text-red-200 text-sm">{error.message}</p>
        </div>
      </BaseVisualizer>
    );
  }

  if (!normalizedData) {
    return (
      <BaseVisualizer data={data} stepData={stepData} title={title}>
        <div className="flex justify-center items-center min-h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </BaseVisualizer>
    );
  }

  return (
    <BaseVisualizer data={normalizedData} stepData={stepData} title={title}>
      <div className="p-4">
        <HeapDisplay
          elements={normalizedData.elements}
          heapType={normalizedData.heapType}
          highlights={normalizedData.highlights || {}}
          showArray={true}
        />

        <HeapTreeDisplay
          elements={normalizedData.elements}
          heapType={normalizedData.heapType}
          highlights={normalizedData.highlights || {}}
        />

        {normalizedData.operations && normalizedData.operations.length > 0 && (
          <OperationsDisplay operations={normalizedData.operations} />
        )}
      </div>
    </BaseVisualizer>
  );
};

/**
 * Heap array representation
 */
const HeapDisplay = ({ elements, heapType, highlights, showArray }) => (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-gray-300 font-medium">
        {heapType === 'min' ? 'Min Heap' : heapType === 'max' ? 'Max Heap' : 'Heap'} (Array View)
      </h4>
      <span className="text-sm text-gray-400">Size: {elements.length}</span>
    </div>

    {showArray && (
      <div className="flex flex-wrap gap-1 mb-4">
        {elements.map((element, index) => (
          <div
            key={index}
            className={`
              relative min-w-12 h-12 flex flex-col items-center justify-center text-sm border rounded
              ${highlights[index] ? 'bg-yellow-600 border-yellow-400' : 'bg-gray-700 border-gray-600'}
              ${index === 0 ? 'ring-2 ring-green-400' : ''}
            `}
          >
            <span className="font-mono">{element}</span>
            <span className="absolute -top-3 text-xs text-gray-400">{index}</span>
          </div>
        ))}
      </div>
    )}

    {elements.length === 0 && (
      <div className="text-gray-500 text-center p-8">Heap is empty</div>
    )}
  </div>
);

/**
 * Heap tree representation
 */
const HeapTreeDisplay = ({ elements, heapType, highlights }) => {
  if (elements.length === 0) return null;

  const getTreeLevels = () => {
    const levels = [];
    let level = 0;
    let levelStart = 0;

    while (levelStart < elements.length) {
      const levelSize = Math.pow(2, level);
      const levelEnd = Math.min(levelStart + levelSize, elements.length);
      levels.push(elements.slice(levelStart, levelEnd).map((element, index) => ({
        element,
        globalIndex: levelStart + index
      })));
      levelStart = levelEnd;
      level++;
    }

    return levels;
  };

  const levels = getTreeLevels();

  return (
    <div className="mb-6">
      <h4 className="text-gray-300 font-medium mb-3">Tree View</h4>
      <div className="flex flex-col items-center space-y-4">
        {levels.map((level, levelIndex) => (
          <div key={levelIndex} className="flex justify-center space-x-4">
            {level.map(({ element, globalIndex }) => {
              const parentIndex = Math.floor((globalIndex - 1) / 2);
              const leftChild = 2 * globalIndex + 1;
              const rightChild = 2 * globalIndex + 2;

              return (
                <div key={globalIndex} className="relative flex flex-col items-center">
                  {/* Connection lines to parent */}
                  {globalIndex > 0 && (
                    <div className="absolute -top-6 w-px h-4 bg-gray-600"></div>
                  )}

                  {/* Node */}
                  <div
                    className={`
                      w-10 h-10 flex items-center justify-center text-sm font-mono border-2 rounded-full
                      ${highlights[globalIndex] ? 'bg-yellow-600 border-yellow-400' : 'bg-gray-700 border-gray-500'}
                      ${globalIndex === 0 ? 'ring-2 ring-green-400' : ''}
                    `}
                  >
                    {element}
                  </div>

                  {/* Index label */}
                  <span className="text-xs text-gray-400 mt-1">{globalIndex}</span>

                  {/* Connection lines to children */}
                  {(leftChild < elements.length || rightChild < elements.length) && (
                    <div className="absolute top-10 w-px h-4 bg-gray-600"></div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-400 space-y-1">
        <div>• Root (index 0): {elements[0]}</div>
        <div>• Parent of index i: Math.floor((i-1)/2)</div>
        <div>• Left child of index i: 2*i + 1</div>
        <div>• Right child of index i: 2*i + 2</div>
      </div>
    </div>
  );
};

/**
 * Operations display component
 */
const OperationsDisplay = ({ operations }) => (
  <div className="mt-4 p-3 bg-gray-800 rounded-lg">
    <h5 className="text-gray-300 font-medium mb-2">Operations</h5>
    <div className="space-y-1">
      {operations.map((op, index) => (
        <div key={index} className="text-sm text-gray-400">
          <span className="text-blue-400">{op.type}:</span> {op.description}
          {op.element !== undefined && <span className="text-green-400 ml-2">element: {op.element}</span>}
          {op.index !== undefined && <span className="text-yellow-400 ml-2">index: {op.index}</span>}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Normalize various heap data formats into a consistent structure
 */
function normalizeHeapData(data) {
  console.log('normalizeHeapData input:', data);

  if (!data) {
    return {
      elements: [],
      heapType: 'max',
      highlights: {},
      operations: []
    };
  }

  // If already in the correct format
  if (data.elements && Array.isArray(data.elements)) {
    return {
      elements: data.elements,
      heapType: data.heapType || 'max',
      highlights: data.highlights || {},
      operations: data.operations || []
    };
  }

  // Handle visualization steps format
  if (data.type === 'heap' && data.data) {
    return normalizeHeapData(data.data);
  }

  // Handle array format
  if (Array.isArray(data)) {
    return {
      elements: data,
      heapType: 'max',
      highlights: {},
      operations: []
    };
  }

  // Handle object with heap/array/elements property
  if (typeof data === 'object') {
    const elements = data.heap || data.array || data.elements || data.values;
    if (Array.isArray(elements)) {
      return {
        elements,
        heapType: data.heapType || data.type || 'max',
        highlights: data.highlights || {},
        operations: data.operations || []
      };
    }
  }

  // Fallback with empty heap
  console.warn('Could not normalize heap data, using fallback:', data);
  return {
    elements: [],
    heapType: 'max',
    highlights: {},
    operations: []
  };
}

export default HeapVisualizer;
