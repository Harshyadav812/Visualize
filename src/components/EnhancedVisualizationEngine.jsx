/**
 * Enhanced Visualization Engine with UIR Support
 * Bridges legacy AI responses and the new UIR architecture
 * Provides backward compatibility while enabling the new multi-visualizer approach
 */

import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import VisualizationEngine from './VisualizationEngine';
import VisualizationOrchestrator from './VisualizationOrchestrator';
import { convertLegacyToUIR, validateUIRStep } from '../services/uirService';

/**
 * Detect if analysis is already in UIR format
 */
function isUIRFormat(analysis) {
  return analysis && analysis.uirSteps && Array.isArray(analysis.uirSteps);
}

/**
 * Detect if we should use the orchestrator (multiple entity types in a step)
 */
function shouldUseOrchestrator(uirStep) {
  if (!uirStep?.entities) {
    return false;
  }

  // Use orchestrator if:
  // 1. Multiple different entity types exist
  const entityTypes = new Set(uirStep.entities.map(e => e.type));
  if (entityTypes.size > 1) {
    return true;
  }

  // 2. Single type but multiple entities of that type (e.g., multiple arrays)
  if (entityTypes.size === 1) {
    const singleType = Array.from(entityTypes)[0];
    const entitiesOfType = uirStep.entities.filter(e => e.type === singleType);
    if (entitiesOfType.length > 1) {
      return true;
    }
  }

  return false;
}

/**
 * Convert UIR step back to legacy format for single-visualizer compatibility
 */
function convertUIRStepToLegacy(uirStep) {
  if (!uirStep?.entities || uirStep.entities.length === 0) {
    return {
      stepNumber: uirStep?.step || 1,
      title: uirStep?.note || 'Visualization Step',
      description: uirStep?.note || '',
      codeHighlight: uirStep?.codeReference || '',
      variableStates: uirStep?.globalState?.variables || {},
      visualization: {
        type: 'array',
        data: {
          arrays: [{
            name: 'Default Array',
            values: [1, 2, 3, 4, 5],
            highlights: {}
          }],
          pointers: []
        }
      }
    };
  }

  const primaryEntity = uirStep.entities[0];
  const entityType = primaryEntity.type;

  // Convert entity state to legacy visualization format
  let visualizationData = {};

  switch (entityType) {
    case 'array':
      visualizationData = {
        arrays: [{
          name: primaryEntity.meta?.name || 'Array',
          values: primaryEntity.state.values || [],
          highlights: primaryEntity.state.highlights || {}
        }],
        array: primaryEntity.state.values || [], // Backward compatibility
        highlights: primaryEntity.state.highlights || {},
        pointers: primaryEntity.state.pointers || []
      };
      break;

    case 'hashmap':
      visualizationData = {
        hashMap: primaryEntity.state.entries || {},
        highlights: primaryEntity.highlights || {}
      };
      break;

    case 'string':
      visualizationData = {
        string: primaryEntity.state.value || '',
        pointers: primaryEntity.state.pointers || [],
        highlights: primaryEntity.highlights || {}
      };
      break;

    case 'tree':
      visualizationData = {
        tree: primaryEntity.state,
        highlights: primaryEntity.highlights || {}
      };
      break;

    case 'graph':
      visualizationData = {
        vertices: primaryEntity.state.vertices || [],
        edges: primaryEntity.state.edges || [],
        adjacencyList: primaryEntity.state.adjacencyList || {},
        highlights: primaryEntity.highlights || {}
      };
      break;

    case 'linkedlist':
      // Handle different linkedlist data formats
      if (primaryEntity.state.incomplete || primaryEntity.state.rawData) {
        // For incomplete linkedlist data, try to provide what we can
        const rawData = primaryEntity.state.rawData || {};
        visualizationData = {
          linkedList: {
            head: primaryEntity.state.head || rawData.head,
            nodes: primaryEntity.state.nodes || rawData.nodes || [],
            connections: primaryEntity.state.connections || rawData.connections || [],
            incomplete: true
          },
          highlights: primaryEntity.highlights || {},
          meta: {
            ...primaryEntity.meta,
            incomplete: true,
            availableFields: Object.keys(rawData).join(', ')
          }
        };
      } else {
        visualizationData = {
          linkedList: primaryEntity.state,
          highlights: primaryEntity.highlights || {}
        };
      }
      break; case 'recursion':
      visualizationData = {
        callStack: primaryEntity.state.callStack || [],
        currentLevel: primaryEntity.state.currentLevel || 0,
        highlights: primaryEntity.highlights || {}
      };
      break;

    case 'dp':
      visualizationData = {
        matrix: primaryEntity.state.matrix || [],
        currentCell: primaryEntity.state.currentCell,
        highlights: primaryEntity.highlights || {}
      };
      break;

    default:
      visualizationData = primaryEntity.state;
  }

  return {
    stepNumber: uirStep.step || 1,
    title: uirStep.note || `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Operation`,
    description: uirStep.note || '',
    codeHighlight: uirStep.codeReference || '',
    variableStates: uirStep.globalState?.variables || {},
    reasoning: uirStep.reasoning || '',
    learningPoint: uirStep.learningPoint || '',
    visualization: {
      type: entityType,
      data: visualizationData
    }
  };
}

/**
 * Enhanced Visualization Engine that supports both legacy and UIR formats
 */
const EnhancedVisualizationEngine = memo(function EnhancedVisualizationEngine({
  analysis,
  currentStep,
  onStepChange,
  preferUIR = true,
  showDebugInfo = false,
  onVisualizationError = null
}) {
  // Convert to UIR format if needed
  const uirAnalysis = useMemo(() => {
    if (isUIRFormat(analysis)) {
      return analysis;
    }

    if (!analysis) {
      return { uirSteps: [] };
    }

    console.log('Converting legacy analysis to UIR format');
    return convertLegacyToUIR(analysis);
  }, [analysis]);

  // Get current step data
  const currentUIRStep = useMemo(() => {
    if (!uirAnalysis?.uirSteps || currentStep >= uirAnalysis.uirSteps.length) {
      return null;
    }

    return uirAnalysis.uirSteps[currentStep];
  }, [uirAnalysis, currentStep]);

  // Validate current step
  const stepValidation = useMemo(() => {
    if (!currentUIRStep) {
      return { isValid: false, errors: ['No step data available'], warnings: [] };
    }

    return validateUIRStep(currentUIRStep);
  }, [currentUIRStep]);

  // Decide which engine to use
  const useOrchestrator = useMemo(() => {
    if (!preferUIR || !currentUIRStep) {
      return false;
    }

    // Force orchestrator for linkedlist type to handle incomplete data better
    if (currentUIRStep.entities?.some(e => e.type === 'linkedlist')) {
      return true;
    }

    return shouldUseOrchestrator(currentUIRStep);
  }, [preferUIR, currentUIRStep]);  // Convert back to legacy format if using legacy engine
  const legacyAnalysis = useMemo(() => {
    if (useOrchestrator || !uirAnalysis?.uirSteps) {
      return null;
    }

    return {
      ...uirAnalysis,
      steps: uirAnalysis.uirSteps.map(uirStep => convertUIRStepToLegacy(uirStep))
    };
  }, [uirAnalysis, useOrchestrator]);

  // Error handling
  const handleVisualizationError = (error, context) => {
    console.error('Visualization error:', error, 'Context:', context);
    onVisualizationError?.(error, context);
  };

  // Render debug information
  const renderDebugInfo = () => {
    if (!showDebugInfo) return null;

    return (
      <div className="mb-4 p-4 bg-purple-900/20 border border-purple-600 rounded-lg">
        <div className="text-purple-300 font-semibold mb-3">Enhanced Engine Debug Info</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1 text-purple-200">
            <div><strong>Format:</strong> {isUIRFormat(analysis) ? 'UIR' : 'Legacy'}</div>
            <div><strong>Current Step:</strong> {currentStep + 1} / {uirAnalysis?.uirSteps?.length || 0}</div>
            <div><strong>Engine:</strong> {useOrchestrator ? 'Orchestrator' : 'Legacy'}</div>
            <div><strong>Step Valid:</strong> {stepValidation.isValid ? '✅' : '❌'}</div>
          </div>
          <div className="space-y-1 text-purple-200">
            <div><strong>Entity Types:</strong> {currentUIRStep?.entities?.map(e => e.type).join(', ') || 'None'}</div>
            <div><strong>Entities Count:</strong> {currentUIRStep?.entities?.length || 0}</div>
            <div><strong>Has Global State:</strong> {currentUIRStep?.globalState ? '✅' : '❌'}</div>
            <div><strong>Has Variables:</strong> {currentUIRStep?.globalState?.variables ? '✅' : '❌'}</div>
          </div>
        </div>

        {stepValidation.errors.length > 0 && (
          <div className="mt-3 p-2 bg-red-900/30 border border-red-600 rounded">
            <div className="text-red-300 font-medium">Errors:</div>
            <ul className="text-red-200 text-xs mt-1">
              {stepValidation.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {stepValidation.warnings.length > 0 && (
          <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-600 rounded">
            <div className="text-yellow-300 font-medium">Warnings:</div>
            <ul className="text-yellow-200 text-xs mt-1">
              {stepValidation.warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Handle no data case
  if (!currentUIRStep && !legacyAnalysis) {
    return (
      <div className="enhanced-visualization-engine">
        {renderDebugInfo()}
        <div className="flex items-center justify-center h-64 bg-gray-900/50 border border-gray-600 rounded-lg">
          <div className="text-gray-400 text-center">
            <div className="text-2xl mb-2">📊</div>
            <div>No visualization data available</div>
            <div className="text-sm mt-1">Step {currentStep + 1}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-visualization-engine">
      {renderDebugInfo()}

      {useOrchestrator ? (
        <VisualizationOrchestrator
          uirStep={currentUIRStep}
          showDebugInfo={false} // Debug info is handled at this level
          onEntityError={(entityType, error) =>
            handleVisualizationError(error, { entityType, step: currentStep })
          }
        />
      ) : (
        <VisualizationEngine
          analysis={legacyAnalysis}
          currentStep={currentStep}
          onStepChange={onStepChange}
          onError={(error) =>
            handleVisualizationError(error, { mode: 'legacy', step: currentStep })
          }
        />
      )}
    </div>
  );
});

EnhancedVisualizationEngine.propTypes = {
  analysis: PropTypes.object,
  currentStep: PropTypes.number.isRequired,
  onStepChange: PropTypes.func,
  preferUIR: PropTypes.bool,
  showDebugInfo: PropTypes.bool,
  onVisualizationError: PropTypes.func
};

export default EnhancedVisualizationEngine;
