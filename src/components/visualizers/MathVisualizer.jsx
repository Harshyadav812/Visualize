import React, { useState, useEffect } from 'react';
import BaseVisualizer from './BaseVisualizer';
import { validateVisualizationData } from '../../utils/dataValidation';

/**
 * Math Algorithm Visualizer Component
 * Handles GCD, LCM, prime numbers, factorization, and other mathematical algorithms
 */
const MathVisualizer = ({ data, stepData, title = "Math Algorithm Visualization" }) => {
  const [normalizedData, setNormalizedData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const normalized = normalizeMathData(data);
      console.log('MathVisualizer normalized data:', normalized);

      // Validate the normalized data
      const validation = validateVisualizationData(normalized, 'array');
      if (!validation.isValid) {
        console.warn('MathVisualizer validation warnings:', validation.errors);
        // Don't throw error for validation warnings, just log them
      }

      setNormalizedData(normalized);
      setError(null);
    } catch (err) {
      console.error('MathVisualizer error:', err);
      setError(err);
      setNormalizedData(null);
    }
  }, [data]);

  if (error) {
    return (
      <BaseVisualizer data={data} stepData={stepData} title={title}>
        <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 text-center">
          <div className="text-red-400 text-lg mb-2">❌</div>
          <h3 className="text-red-300 font-semibold mb-2">Math Data Error</h3>
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
        <MathDisplay
          calculations={normalizedData.calculations}
          formula={normalizedData.formula}
          variables={normalizedData.variables || {}}
        />

        {normalizedData.steps && normalizedData.steps.length > 0 && (
          <StepsDisplay steps={normalizedData.steps} />
        )}

        {normalizedData.results && (
          <ResultsDisplay results={normalizedData.results} />
        )}
      </div>
    </BaseVisualizer>
  );
};

/**
 * Math calculation display component
 */
const MathDisplay = ({ calculations, formula, variables }) => (
  <div className="space-y-4">
    <h4 className="text-gray-300 font-medium mb-3">Mathematical Calculation</h4>

    {formula && (
      <div className="p-3 bg-gray-800 rounded-lg">
        <div className="text-sm text-gray-400 mb-1">Formula:</div>
        <div className="text-lg font-mono text-blue-400">{formula}</div>
      </div>
    )}

    {Object.keys(variables).length > 0 && (
      <div className="p-3 bg-gray-800 rounded-lg">
        <div className="text-sm text-gray-400 mb-2">Variables:</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(variables).map(([name, value]) => (
            <div key={name} className="text-center">
              <div className="text-blue-400 font-mono">{name}</div>
              <div className="text-green-400">{value}</div>
            </div>
          ))}
        </div>
      </div>
    )}

    <div className="grid gap-2">
      {calculations.map((calc, index) => (
        <div key={index} className="p-3 bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-mono text-gray-300">{calc.expression}</span>
            <span className="text-green-400 font-bold">{calc.result}</span>
          </div>
          {calc.explanation && (
            <div className="text-sm text-gray-400 mt-1">{calc.explanation}</div>
          )}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Steps display component
 */
const StepsDisplay = ({ steps }) => (
  <div className="mt-6 p-3 bg-gray-800 rounded-lg">
    <h5 className="text-gray-300 font-medium mb-3">Calculation Steps</h5>
    <div className="space-y-2">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start space-x-3">
          <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
            {index + 1}
          </span>
          <div className="flex-1">
            <div className="text-gray-300">{step.description}</div>
            {step.calculation && (
              <div className="font-mono text-sm text-blue-400 mt-1">{step.calculation}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Results display component
 */
const ResultsDisplay = ({ results }) => (
  <div className="mt-6 p-4 bg-green-900/30 border border-green-600 rounded-lg">
    <h5 className="text-green-300 font-medium mb-3">Results</h5>
    <div className="space-y-2">
      {Object.entries(results).map(([key, value]) => (
        <div key={key} className="flex justify-between items-center">
          <span className="text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
          <span className="text-green-400 font-mono">{value}</span>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Normalize various math data formats into a consistent structure
 */
function normalizeMathData(data) {
  console.log('normalizeMathData input:', data);

  if (!data) {
    return {
      calculations: [],
      formula: null,
      variables: {},
      steps: [],
      results: {}
    };
  }

  // If already in the correct format
  if (data.calculations && Array.isArray(data.calculations)) {
    return {
      calculations: data.calculations,
      formula: data.formula || null,
      variables: data.variables || {},
      steps: data.steps || [],
      results: data.results || {}
    };
  }

  // Handle visualization steps format
  if (data.type === 'math' && data.data) {
    return normalizeMathData(data.data);
  }

  // Handle simple calculation object
  if (typeof data === 'object') {
    // Handle GCD/LCM specific format
    if (data.gcd !== undefined || data.lcm !== undefined) {
      const calculations = [];
      const results = {};

      if (data.gcd !== undefined) {
        calculations.push({
          expression: `gcd(${data.a || 'a'}, ${data.b || 'b'})`,
          result: data.gcd,
          explanation: 'Greatest Common Divisor'
        });
        results.gcd = data.gcd;
      }

      if (data.lcm !== undefined) {
        calculations.push({
          expression: `lcm(${data.a || 'a'}, ${data.b || 'b'})`,
          result: data.lcm,
          explanation: 'Least Common Multiple'
        });
        results.lcm = data.lcm;
      }

      return {
        calculations,
        formula: data.formula || null,
        variables: { a: data.a, b: data.b, ...data.variables } || {},
        steps: data.steps || [],
        results
      };
    }

    // Handle prime factorization
    if (data.factors || data.primes) {
      const factors = data.factors || data.primes;
      return {
        calculations: [{
          expression: `factors(${data.number || 'n'})`,
          result: Array.isArray(factors) ? factors.join(' × ') : factors,
          explanation: 'Prime Factorization'
        }],
        formula: data.formula || null,
        variables: { n: data.number, ...data.variables } || {},
        steps: data.steps || [],
        results: { factors: factors, number: data.number }
      };
    }

    // Handle general calculation format
    if (data.expression || data.result !== undefined) {
      return {
        calculations: [{
          expression: data.expression || 'calculation',
          result: data.result,
          explanation: data.explanation || null
        }],
        formula: data.formula || null,
        variables: data.variables || {},
        steps: data.steps || [],
        results: data.results || { result: data.result }
      };
    }
  }

  // Handle simple number
  if (typeof data === 'number') {
    return {
      calculations: [{
        expression: 'value',
        result: data,
        explanation: null
      }],
      formula: null,
      variables: {},
      steps: [],
      results: { value: data }
    };
  }

  // Fallback with empty calculation
  console.warn('Could not normalize math data, using fallback:', data);
  return {
    calculations: [],
    formula: null,
    variables: {},
    steps: [],
    results: {}
  };
}

export default MathVisualizer;
