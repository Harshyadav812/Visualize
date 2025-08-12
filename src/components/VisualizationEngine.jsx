import React, { memo, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import LazyVisualizationLoader from './LazyVisualizationLoader';
import { VisualizationErrorBoundary } from './ErrorBoundary';
import { validateVisualizationData as coreValidateVisualizationData } from '../utils/dataValidation';
import {
  GenericFallbackVisualizer,
  ArrayFallbackVisualizer,
  TreeFallbackVisualizer,
  GraphFallbackVisualizer,
  LoadingFallbackVisualizer,
  EmptyStateFallbackVisualizer
} from './visualizers/FallbackVisualizer';
import {
  detectPrimaryVisualizationType,
  deriveSlimData,
  mapToCanonicalType,
  getVisualizationTitle,
  getVisualizationMode
} from '../utils/visualizationEngineUtils';

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
  const debug = (typeof window !== 'undefined') && window.__VIZ_DEBUG && import.meta.env.NODE_ENV !== 'production';
  // Cache for validation + sanitized data per step index
  const cacheRef = useRef(new Map());

  // Memoize current step data for performance - moved before early returns to follow hooks rules
  const currentStepData = useMemo(() => {
    if (!analysis?.steps || !Array.isArray(analysis.steps) || currentStep < 0 || currentStep >= analysis.steps.length) {
      return null;
    }
    return analysis.steps[currentStep];
  }, [analysis?.steps, currentStep]);

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

  // Retrieve or compute cached validation for this step
  let cached = cacheRef.current.get(currentStep);
  if (!cached) {
    const visualization = currentStepData?.visualization;
    if (visualization && visualization.type) {
      // Enhanced type detection - use AI-specified type or auto-detect
      const detectedType = detectPrimaryVisualizationType(visualization.data, visualization.type);
      const finalCanonicalType = mapToCanonicalType(detectedType);

      // Some AI responses may embed fields directly on visualization instead of nested data
      // Fallback: if visualization.data missing, use visualization itself (excluding type)
      const rawData = visualization.data ?? (() => {
        const { type, ...rest } = visualization; // eslint-disable-line no-unused-vars
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

VisualizationEngine.propTypes = {
  analysis: PropTypes.shape({
    steps: PropTypes.array
  }),
  currentStep: PropTypes.number,
  onStepChange: PropTypes.func
};

export default VisualizationEngine;

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
  if (!validationResult.isValid && ['array', 'window', 'pointers'].includes(effectiveType?.toLowerCase())) {
    const raw = visualization.data || {};
    if (Array.isArray(raw.array)) {
      const salvage = { arrays: [{ name: raw.name || 'Array', values: raw.array, highlights: raw.highlights || {} }], pointers: raw.pointers || [], operations: raw.operations || [] };
      sanitizedData = salvage;
      validationResult = { ...validationResult, isValid: true, errors: [] };
    }
  }

  if (debug) {
    // Lightweight debug info only
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
        pointers: [{ name: 'start', position: 0, color: '#60a5fa' }],
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

