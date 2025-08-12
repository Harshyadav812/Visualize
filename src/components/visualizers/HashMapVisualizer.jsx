import React, { useState, useEffect } from 'react';
import BaseVisualizer from './BaseVisualizer';
import { validateVisualizationData } from '../../utils/dataValidation';
import { formatValue, VISUALIZATION_SCHEMAS } from '../../utils/visualizationSchemas';

/**
 * HashMap/Map/Dictionary Visualizer Component
 * Handles hash tables, frequency counters, and key-value mappings
 */
const HashMapVisualizer = ({ data, stepData, title = "HashMap Visualization" }) => {
  const [normalizedData, setNormalizedData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const normalized = normalizeHashMapData(data);
      console.log('HashMapVisualizer normalized data:', normalized);

      // Validate the normalized data
      const validation = validateVisualizationData(normalized, 'hashmap');
      if (!validation.isValid) {
        console.warn('HashMapVisualizer validation warnings:', validation.errors);
        // Don't throw error for validation warnings, just log them
      }

      setNormalizedData(normalized);
      setError(null);
    } catch (err) {
      console.error('HashMapVisualizer error:', err);
      setError(err);
      setNormalizedData(null);
    }
  }, [data]);

  if (error) {
    return (
      <BaseVisualizer data={data} stepData={stepData} title={title}>
        <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 text-center">
          <div className="text-red-400 text-lg mb-2">❌</div>
          <h3 className="text-red-300 font-semibold mb-2">HashMap Data Error</h3>
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
        <HashMapDisplay
          entries={normalizedData.entries}
          highlights={normalizedData.highlights || {}}
          buckets={normalizedData.buckets}
        />

        {normalizedData.operations && normalizedData.operations.length > 0 && (
          <OperationsDisplay operations={normalizedData.operations} />
        )}
      </div>
    </BaseVisualizer>
  );
};

/**
 * HashMap display component
 */
const HashMapDisplay = ({ entries, highlights, buckets }) => {
  if (buckets && buckets.length > 0) {
    // Hash table with buckets visualization
    return (
      <div className="space-y-4">
        <h4 className="text-gray-300 font-medium mb-3">Hash Table</h4>
        <div className="grid gap-2" style={{ gridTemplateColumns: 'auto 1fr' }}>
          {buckets.map((bucket, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center justify-center w-12 h-8 bg-gray-700 border border-gray-600 rounded text-sm text-gray-300">
                {index}
              </div>
              <div className="flex gap-1 items-center min-h-8">
                {bucket.length === 0 ? (
                  <span className="text-gray-500 text-sm">empty</span>
                ) : (
                  bucket.map((entry, entryIndex) => (
                    <div
                      key={entryIndex}
                      className={`
                        px-2 py-1 rounded text-sm border
                        ${highlights[entry.key] ? 'bg-yellow-600 border-yellow-400' : 'bg-blue-700 border-blue-600'}
                      `}
                    >
                      {formatValue(entry.key, 'hashmap')}: {formatValue(entry.value, 'hashmap')}
                    </div>
                  ))
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  // Simple key-value display
  return (
    <div className="space-y-4">
      <h4 className="text-gray-300 font-medium mb-3">Key-Value Pairs</h4>
      {entries.length === 0 ? (
        <div className="text-gray-500 text-center p-8">HashMap is empty</div>
      ) : (
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
          {entries.map((entry, index) => (
            <div
              key={index}
              className={`
                p-3 rounded-lg border text-center
                ${highlights[entry.key] ? 'bg-yellow-700 border-yellow-500' : 'bg-gray-700 border-gray-600'}
              `}
            >
              <div className="text-blue-400 font-mono text-sm break-words">{formatValue(entry.key, 'hashmap')}</div>
              <div className="text-gray-300 text-xs mt-1">→</div>
              <div className="text-green-400 font-mono text-sm break-words">{formatValue(entry.value, 'hashmap')}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-400">
        Size: {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
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
          {op.key && <span className="text-yellow-400 ml-2">key: {formatValue(op.key, 'hashmap')}</span>}
          {op.value !== undefined && <span className="text-green-400 ml-2">value: {formatValue(op.value, 'hashmap')}</span>}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Normalize various hashmap data formats into a consistent structure
 */
function normalizeHashMapData(data) {
  console.log('normalizeHashMapData input:', data);

  if (!data) {
    return {
      entries: [],
      highlights: {},
      buckets: null,
      operations: []
    };
  }

  // If already in the correct format
  if (data.entries && Array.isArray(data.entries)) {
    return {
      entries: data.entries,
      highlights: data.highlights || {},
      buckets: data.buckets || null,
      operations: data.operations || []
    };
  }

  // Handle Map object
  if (data instanceof Map) {
    const entries = Array.from(data.entries()).map(([key, value]) => ({ key, value }));
    return {
      entries,
      highlights: {},
      buckets: null,
      operations: []
    };
  }

  // Handle plain object
  if (typeof data === 'object' && !Array.isArray(data)) {
    // Check if it's a visualization step format
    if (data.type === 'hashmap' && data.data) {
      return normalizeHashMapData(data.data);
    }

    // Handle object with map/hash/entries property
    if (data.map || data.hash || data.entries) {
      const source = data.map || data.hash || data.entries;
      if (Array.isArray(source)) {
        return {
          entries: source.map(entry =>
            typeof entry === 'object' && entry.key !== undefined
              ? entry
              : { key: entry[0], value: entry[1] }
          ),
          highlights: data.highlights || {},
          buckets: data.buckets || null,
          operations: data.operations || []
        };
      }
    }

    // Handle frequency counter format (plain object)
    const entries = Object.entries(data)
      .filter(([key]) => !['highlights', 'buckets', 'operations', 'type'].includes(key))
      .map(([key, value]) => ({ key, value }));

    if (entries.length > 0) {
      return {
        entries,
        highlights: data.highlights || {},
        buckets: data.buckets || null,
        operations: data.operations || []
      };
    }
  }

  // Handle array of entries
  if (Array.isArray(data)) {
    return {
      entries: data.map(entry =>
        Array.isArray(entry)
          ? { key: entry[0], value: entry[1] }
          : entry
      ),
      highlights: {},
      buckets: null,
      operations: []
    };
  }

  // Fallback with empty hashmap
  console.warn('Could not normalize hashmap data, using fallback:', data);
  return {
    entries: [],
    highlights: {},
    buckets: null,
    operations: []
  };
}

export default HashMapVisualizer;
