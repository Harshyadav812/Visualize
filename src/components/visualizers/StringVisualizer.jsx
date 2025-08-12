import React, { useState, useEffect } from 'react';
import BaseVisualizer from './BaseVisualizer';
import { validateVisualizationData } from '../../utils/dataValidation';
import { formatValue, validateAgainstSchema, normalizeVisualizationData } from '../../utils/visualizationSchemas';

/**
 * String Visualizer Component
 * Handles string pattern matching, substring operations, and string transformations
 */
const StringVisualizer = ({ data, stepData, title = "String Visualization" }) => {
  const [normalizedData, setNormalizedData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      console.log('StringVisualizer received data:', data);
      console.log('StringVisualizer data type:', typeof data);
      console.log('StringVisualizer data keys:', data ? Object.keys(data) : 'null');

      const normalized = normalizeStringData(data);
      console.log('StringVisualizer normalized data:', normalized);

      // Validate the normalized data
      const validation = validateVisualizationData(normalized, 'string');
      if (!validation.isValid) {
        console.warn('StringVisualizer validation warnings:', validation.errors);
        // Don't throw error for validation warnings, just log them
      }

      setNormalizedData(normalized);
      setError(null);
    } catch (err) {
      console.error('StringVisualizer error:', err);
      setError(err);
      setNormalizedData(null);
    }
  }, [data]);

  if (error) {
    return (
      <BaseVisualizer data={data} stepData={stepData} title={title}>
        <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 text-center">
          <div className="text-red-400 text-lg mb-2">❌</div>
          <h3 className="text-red-300 font-semibold mb-2">String Data Error</h3>
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
        <StringDisplay
          stringData={normalizedData}
          pointers={normalizedData.pointers || []}
          hashMap={normalizedData.hashMap || {}}
        />

        {normalizedData.calculations && normalizedData.calculations.length > 0 && (
          <CalculationsDisplay calculations={normalizedData.calculations} />
        )}

        {normalizedData.hashMap && Object.keys(normalizedData.hashMap).length > 0 && (
          <HashMapDisplay hashMap={normalizedData.hashMap} />
        )}

        {normalizedData.results && (
          <ResultsDisplay results={normalizedData.results} />
        )}
      </div>
    </BaseVisualizer>
  );
};

/**
 * String display component
 */
const StringDisplay = ({ stringData, pointers, hashMap }) => {
  const value = stringData.string || '';
  const chars = Array.from(value);

  return (
    <div className="mb-6">
      <h4 className="text-gray-300 font-medium mb-3">String ({chars.length} chars)</h4>

      <div className="flex flex-wrap gap-1 mb-4">
        {chars.map((char, index) => {
          const hasPointer = pointers.some(p => p.position === index);
          const pointer = pointers.find(p => p.position === index);

          return (
            <div
              key={index}
              className={`
                relative min-w-8 h-8 flex items-center justify-center text-sm font-mono border
                ${hasPointer ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-300'}
                rounded
              `}
            >
              {char === ' ' ? '·' : char}
              <span className="absolute -top-3 text-xs text-gray-400">{index}</span>
              {hasPointer && (
                <div className="absolute -bottom-6 text-xs text-blue-400">
                  {pointer?.name || '↑'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Calculations display component
 */
const CalculationsDisplay = ({ calculations }) => (
  <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-600">
    <h5 className="text-blue-300 font-medium mb-2">🧮 Calculations</h5>
    <div className="space-y-1">
      {calculations.map((calc, index) => (
        <div key={index} className="text-sm flex justify-between">
          <span className="text-blue-200">{calc.expression}</span>
          <span className="text-blue-400 font-bold">= {calc.result}</span>
        </div>
      ))}
    </div>
  </div>
);

/**
 * HashMap display component with enhanced object rendering
 */
const HashMapDisplay = ({ hashMap }) => (
  <div className="mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-600">
    <h5 className="text-purple-300 font-medium mb-2">🗃️ HashMap</h5>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {Object.entries(hashMap).map(([key, value]) => {
        const displayValue = formatValue(value, 'hashmap');

        return (
          <div key={key} className="bg-purple-800/30 p-2 rounded border border-purple-700">
            <div className="text-purple-200 text-sm font-mono">
              <span className="text-purple-300 font-semibold">{key}</span>
              <span className="text-purple-400 mx-1">→</span>
              <span className="text-purple-100">{displayValue}</span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);/**
 * Results display component with enhanced object rendering
 */
const ResultsDisplay = ({ results }) => (
  <div className="mt-4 p-3 bg-green-900/30 rounded-lg border border-green-600">
    <h5 className="text-green-300 font-medium mb-2">📊 Results</h5>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Object.entries(results).map(([key, value]) => {
        const displayValue = formatValue(value, 'display');

        return (
          <div key={key} className="text-center">
            <div className="text-2xl font-bold text-green-400 break-words">{displayValue}</div>
            <div className="text-sm text-green-300 capitalize">
              {key.replace(/([A-Z])/g, ' $1')}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/**
 * Normalize various string data formats into a consistent structure
 */
function normalizeStringData(data) {
  console.log('normalizeStringData input:', data);

  if (!data) {
    return {
      string: '',
      pointers: [],
      hashMap: {},
      results: null,
      calculations: [],
      subarrays: []
    };
  }

  // Comprehensive string property detection
  let stringValue = '';

  // Check common string property names
  const stringProps = ['string', 'text', 'input', 's', 'str', 'inputString', 'source', 'content', 'value'];
  for (const prop of stringProps) {
    if (data[prop] && typeof data[prop] === 'string') {
      stringValue = data[prop];
      break;
    }
  }

  // If no string found but we have other data, try to extract from context
  if (!stringValue && data) {
    // Check if there's a direct string value anywhere in the object
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && value.length > 0 &&
        !['type', 'description', 'operation', 'name'].includes(key)) {
        console.log(`Found string in property '${key}':`, value);
        stringValue = value;
        break;
      }
    }
  }

  // For substring problems, sometimes the string is passed as the problem context
  if (!stringValue && typeof data === 'object') {
    // Look for nested data structures
    if (data.problem && typeof data.problem === 'string') {
      stringValue = data.problem;
    } else if (data.context && typeof data.context === 'string') {
      stringValue = data.context;
    }
  }

  // If we have valid string data, return normalized structure
  if (stringValue) {
    return {
      string: stringValue,
      pointers: data.pointers || [],
      hashMap: data.hashMap || {},
      results: data.results || null,
      calculations: data.calculations || [],
      subarrays: data.subarrays || []
    };
  }

  // Handle single string
  if (typeof data === 'string') {
    return {
      string: data,
      pointers: [],
      hashMap: {},
      results: null,
      calculations: [],
      subarrays: []
    };
  }

  // Handle legacy strings array format - convert to single string
  if (data.strings && Array.isArray(data.strings) && data.strings.length > 0) {
    return {
      string: data.strings[0].value || data.strings[0] || '',
      pointers: data.pointers || [],
      hashMap: data.hashMap || {},
      results: data.results || null,
      calculations: data.calculations || [],
      subarrays: data.subarrays || []
    };
  }

  // Handle visualization steps format
  if (data.type === 'string' && data.data) {
    return normalizeStringData(data.data);
  }

  // Handle array of strings - take first string
  if (Array.isArray(data) && data.length > 0) {
    const firstString = typeof data[0] === 'string' ? data[0] : data[0].value || '';
    return {
      string: firstString,
      pointers: [],
      hashMap: {},
      results: null,
      calculations: [],
      subarrays: []
    };
  }

  // Last resort: if we have algorithm-related data but no string, create placeholder
  if (data.pointers || data.hashMap || data.calculations) {
    console.warn('Found algorithm data but no string content, creating placeholder');
    return {
      string: 'String data not provided',
      pointers: data.pointers || [],
      hashMap: data.hashMap || {},
      results: data.results || null,
      calculations: data.calculations || [],
      subarrays: data.subarrays || []
    };
  }

  // Fallback with empty string
  console.warn('Could not normalize string data, using fallback:', data);
  return {
    string: '',
    pointers: [],
    hashMap: {},
    results: null,
    calculations: [],
    subarrays: []
  };
}

export default StringVisualizer;
