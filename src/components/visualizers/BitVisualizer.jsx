import React, { useState, useEffect } from 'react';
import BaseVisualizer from './BaseVisualizer';
import { validateVisualizationData } from '../../utils/dataValidation';

/**
 * Bit Manipulation Visualizer Component
 * Handles bitwise operations, bitmasks, and binary representations
 */
const BitVisualizer = ({ data, stepData, title = "Bit Manipulation Visualization" }) => {
  const [normalizedData, setNormalizedData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const normalized = normalizeBitData(data);
      console.log('BitVisualizer normalized data:', normalized);

      // Validate the normalized data
      const validation = validateVisualizationData(normalized, 'array');
      if (!validation.isValid) {
        console.warn('BitVisualizer validation warnings:', validation.errors);
        // Don't throw error for validation warnings, just log them
      }

      setNormalizedData(normalized);
      setError(null);
    } catch (err) {
      console.error('BitVisualizer error:', err);
      setError(err);
      setNormalizedData(null);
    }
  }, [data]);

  if (error) {
    return (
      <BaseVisualizer data={data} stepData={stepData} title={title}>
        <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 text-center">
          <div className="text-red-400 text-lg mb-2">❌</div>
          <h3 className="text-red-300 font-semibold mb-2">Bit Data Error</h3>
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
        {normalizedData.numbers?.map((numberObj, index) => (
          <BitDisplay
            key={index}
            numberData={numberObj}
            highlights={normalizedData.highlights || {}}
          />
        ))}

        {normalizedData.operations && normalizedData.operations.length > 0 && (
          <OperationsDisplay operations={normalizedData.operations} />
        )}
      </div>
    </BaseVisualizer>
  );
};

/**
 * Individual number bit display component
 */
const BitDisplay = ({ numberData, highlights }) => {
  const { name, value, bits = 32 } = numberData;
  const binaryString = (value >>> 0).toString(2).padStart(bits, '0');
  const bitArray = Array.from(binaryString);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-gray-300 font-medium">{name || 'Number'}</h4>
        <div className="text-sm text-gray-400 space-x-4">
          <span>Decimal: <span className="text-blue-400">{value}</span></span>
          <span>Hex: <span className="text-green-400">0x{(value >>> 0).toString(16).toUpperCase()}</span></span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {bitArray.map((bit, index) => {
          const bitPosition = bits - 1 - index;
          const isHighlighted = highlights[bitPosition];

          return (
            <div
              key={index}
              className={`
                relative min-w-8 h-8 flex flex-col items-center justify-center text-sm font-mono border
                ${bit === '1' ? 'bg-blue-700 border-blue-500' : 'bg-gray-700 border-gray-600'}
                ${isHighlighted ? 'ring-2 ring-yellow-400' : ''}
                rounded
              `}
            >
              {bit}
              <span className="absolute -top-3 text-xs text-gray-400">{bitPosition}</span>
            </div>
          );
        })}
      </div>

      {/* Show powers of 2 for important bits */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>Bit positions: {bits - 1} → 0 (left to right)</div>
        {[31, 15, 7, 3, 1, 0].filter(pos => pos < bits && ((value >> pos) & 1)).map(pos => (
          <div key={pos}>
            Bit {pos}: 2^{pos} = {Math.pow(2, pos)}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Operations display component
 */
const OperationsDisplay = ({ operations }) => (
  <div className="mt-4 p-3 bg-gray-800 rounded-lg">
    <h5 className="text-gray-300 font-medium mb-2">Bit Operations</h5>
    <div className="space-y-1">
      {operations.map((op, index) => (
        <div key={index} className="text-sm text-gray-400">
          <span className="text-blue-400">{op.type}:</span> {op.description}
          {op.result !== undefined && <span className="text-green-400 ml-2">→ {op.result}</span>}
          {op.binary && <span className="text-purple-400 ml-2">({op.binary})</span>}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Normalize various bit data formats into a consistent structure
 */
function normalizeBitData(data) {
  console.log('normalizeBitData input:', data);

  if (!data) {
    return {
      numbers: [{ name: 'num', value: 0, bits: 32 }],
      highlights: {},
      operations: []
    };
  }

  // If already in the correct format
  if (data.numbers && Array.isArray(data.numbers)) {
    return {
      numbers: data.numbers,
      highlights: data.highlights || {},
      operations: data.operations || []
    };
  }

  // Handle single number
  if (typeof data === 'number') {
    return {
      numbers: [{ name: 'num', value: data, bits: 32 }],
      highlights: {},
      operations: []
    };
  }

  // Handle visualization steps format
  if (data.type === 'bit' && data.data) {
    return normalizeBitData(data.data);
  }

  // Handle object with number properties
  if (typeof data === 'object') {
    if (data.number !== undefined || data.value !== undefined || data.num !== undefined) {
      const value = data.number ?? data.value ?? data.num;
      return {
        numbers: [{
          name: data.name || 'num',
          value: value,
          bits: data.bits || 32
        }],
        highlights: data.highlights || {},
        operations: data.operations || []
      };
    }

    // Handle array of numbers
    if (data.numbers || data.values || data.array) {
      const values = data.numbers || data.values || data.array;
      if (Array.isArray(values)) {
        return {
          numbers: values.map((val, index) => ({
            name: `num${index}`,
            value: typeof val === 'number' ? val : val.value,
            bits: (typeof val === 'object' ? val.bits : null) || 32
          })),
          highlights: data.highlights || {},
          operations: data.operations || []
        };
      }
    }
  }

  // Handle array of numbers
  if (Array.isArray(data)) {
    return {
      numbers: data.map((val, index) => ({
        name: `num${index}`,
        value: typeof val === 'number' ? val : val.value || 0,
        bits: (typeof val === 'object' ? val.bits : null) || 32
      })),
      highlights: {},
      operations: []
    };
  }

  // Fallback with zero
  console.warn('Could not normalize bit data, using fallback:', data);
  return {
    numbers: [{ name: 'num', value: 0, bits: 32 }],
    highlights: {},
    operations: []
  };
}

export default BitVisualizer;
