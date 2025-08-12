import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ArrayVisualizer from './visualizers/ArrayVisualizer';
import GraphVisualizer from './visualizers/GraphVisualizer';
import TreeVisualizer from './visualizers/TreeVisualizer';
import HashMapVisualizer from './visualizers/HashMapVisualizer';

/**
 * Smart Visualization Engine - Routes to appropriate visualizer based on data type
 * This enables AI to generate type-aware visualizations for better educational value
 */
const SmartVisualizationEngine = ({
  visualizationData,
  currentStep = 0,
  onStepChange, // eslint-disable-line no-unused-vars
  className = ""
}) => {
  const [detectedType, setDetectedType] = useState(null);
  const [hybridLayout, setHybridLayout] = useState(null);

  // Get current step data
  const getCurrentStepData = () => {
    if (!visualizationData?.steps) return null;
    return visualizationData.steps[currentStep] || null;
  };

  const stepData = getCurrentStepData();

  // Smart type detection with priority rules
  const detectVisualizationType = (data) => {
    if (!data) return 'array'; // fallback

    // Explicit type specification (AI can set this)
    if (data.type) {
      return data.type;
    }

    // Hybrid detection - multiple important data structures
    const hasArray = data.arrays && data.arrays.length > 0;
    const hasHashMap = data.hashMap && Object.keys(data.hashMap).length > 0;
    const hasGraph = data.graph || data.edges || data.nodes;
    const hasTree = data.tree || data.root;
    const hasResults = data.results && Object.keys(data.results).length > 0;

    const activeStructures = [
      hasArray && 'array',
      hasHashMap && 'hashmap',
      hasGraph && 'graph',
      hasTree && 'tree',
      hasResults && 'results'
    ].filter(Boolean);

    // Multiple active structures suggest hybrid
    if (activeStructures.length > 1) {
      return 'hybrid';
    }

    // Single structure priority
    if (hasResults) return 'results';
    if (hasHashMap) return 'hashmap';
    if (hasGraph) return 'graph';
    if (hasTree) return 'tree';
    if (hasArray) return 'array';

    return 'array'; // ultimate fallback
  };

  // Update detected type when step data changes
  useEffect(() => {
    const type = detectVisualizationType(stepData);
    setDetectedType(type);

    // For hybrid types, determine layout
    if (type === 'hybrid' && stepData?.components) {
      setHybridLayout(stepData.components);
    }
  }, [stepData]);

  // Render appropriate visualizer
  const renderVisualizer = () => {
    if (!stepData) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-400">
          No visualization data available
        </div>
      );
    }

    switch (detectedType) {
      case 'array':
        return (
          <ArrayVisualizer
            data={stepData}
            className="w-full"
          />
        );

      case 'hashmap':
        return (
          <div className="space-y-4">
            <HashMapVisualizer
              data={stepData.hashMap}
              highlights={stepData.highlights}
              className="w-full"
            />
            {/* Show supporting array data if available */}
            {stepData.secondaryData?.arrays && (
              <div className="opacity-75 scale-90">
                <ArrayVisualizer
                  data={stepData.secondaryData}
                  className="w-full"
                />
              </div>
            )}
          </div>
        );

      case 'graph':
        return (
          <GraphVisualizer
            data={stepData}
            className="w-full"
          />
        );

      case 'tree':
        return (
          <TreeVisualizer
            data={stepData}
            className="w-full"
          />
        );

      case 'hybrid':
        return renderHybridVisualization();

      case 'results':
        return renderResultsVisualization();

      default:
        return (
          <ArrayVisualizer
            data={stepData}
            className="w-full"
          />
        );
    }
  };

  // Render hybrid visualization with weighted layouts
  const renderHybridVisualization = () => {
    if (!hybridLayout) return renderVisualizer();

    return (
      <div className="space-y-4">
        {hybridLayout.map((component, index) => {
          const weight = component.weight || 1;
          const heightClass = weight > 0.6 ? 'h-96' : 'h-64';

          return (
            <div key={index} className={`${heightClass} transition-all duration-300`}>
              {renderComponentByType(component.type, component.data)}
            </div>
          );
        })}
      </div>
    );
  };

  // Render results-focused visualization
  const renderResultsVisualization = () => {
    return (
      <div className="space-y-6">
        {/* Primary results display */}
        <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 p-6 rounded-lg border border-green-600">
          <h3 className="text-green-300 font-bold text-xl mb-4 flex items-center">
            <span className="mr-2">🎯</span>
            Algorithm Results
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stepData.results || {}).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="text-3xl font-bold text-green-400">{value}</div>
                <div className="text-sm text-green-300 capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supporting visualizations */}
        {stepData.supportingData && (
          <div className="opacity-80">
            {stepData.supportingData.arrays && (
              <ArrayVisualizer
                data={stepData.supportingData}
                className="w-full"
              />
            )}
          </div>
        )}
      </div>
    );
  };

  // Helper to render components by type
  const renderComponentByType = (type, data) => {
    switch (type) {
      case 'array':
        return <ArrayVisualizer data={data} className="w-full h-full" />;
      case 'hashmap':
        return <HashMapVisualizer data={data.hashMap} highlights={data.highlights} className="w-full h-full" />;
      case 'graph':
        return <GraphVisualizer data={data} className="w-full h-full" />;
      case 'tree':
        return <TreeVisualizer data={data} className="w-full h-full" />;
      default:
        return <div className="flex items-center justify-center h-full text-gray-400">Unknown component type</div>;
    }
  };

  return (
    <div className={`smart-visualization-engine ${className}`}>
      {/* Type indicator for debugging/development */}
      <div className="mb-2 text-xs text-gray-500 flex items-center justify-between">
        <span>Type: {detectedType}</span>
        {stepData?.description && (
          <span className="italic">{stepData.description}</span>
        )}
      </div>

      {/* Main visualization area */}
      <div className="min-h-[300px]">
        {renderVisualizer()}
      </div>
    </div>
  );
};

SmartVisualizationEngine.propTypes = {
  visualizationData: PropTypes.shape({
    steps: PropTypes.array
  }),
  currentStep: PropTypes.number,
  onStepChange: PropTypes.func,
  className: PropTypes.string
};

SmartVisualizationEngine.displayName = 'SmartVisualizationEngine';

export default SmartVisualizationEngine;
