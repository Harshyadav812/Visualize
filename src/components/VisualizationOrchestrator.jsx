/**
 * Visualization Orchestrator
 * Manages multiple visualizers simultaneously based on UIR entities
 * This solves the "switching problem" by allowing coexistence of multiple visualizers
 */

import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { getEntityTypes } from '../services/uirService';

// Import all visualizers
import ArrayVisualizer from './visualizers/ArrayVisualizer';
import HashMapVisualizer from './visualizers/HashMapVisualizer';
import StringVisualizer from './visualizers/StringVisualizer';
import TreeVisualizer from './visualizers/TreeVisualizer';
import GraphVisualizer from './visualizers/GraphVisualizer';
import LinkedListVisualizer from './visualizers/LinkedListVisualizer';
import RecursionVisualizer from './visualizers/RecursionVisualizer';
import DPTableVisualizer from './visualizers/DPTableVisualizer';
import StackQueueVisualizer from './visualizers/StackQueueVisualizer';

/**
 * Visualizer registry - maps entity types to their corresponding visualizers
 */
const VISUALIZER_REGISTRY = {
  array: ArrayVisualizer,
  hashmap: HashMapVisualizer,
  string: StringVisualizer,
  tree: TreeVisualizer,
  graph: GraphVisualizer,
  linkedlist: LinkedListVisualizer,
  recursion: RecursionVisualizer,
  dp: DPTableVisualizer,
  stack: StackQueueVisualizer,
  queue: StackQueueVisualizer
};

/**
 * Layout configurations for different combinations of visualizers
 */
const LAYOUT_CONFIGS = {
  // Single visualizer layouts
  single: {
    className: 'w-full h-full',
    priority: 1
  },

  // Dual visualizer layouts
  'array+hashmap': {
    layouts: [
      { type: 'array', className: 'w-full lg:w-2/3 h-96 lg:h-full', priority: 1 },
      { type: 'hashmap', className: 'w-full lg:w-1/3 h-64 lg:h-full', priority: 0.7 }
    ]
  },
  'array+string': {
    layouts: [
      { type: 'string', className: 'w-full h-32', priority: 0.8 },
      { type: 'array', className: 'w-full h-96', priority: 1 }
    ]
  },
  'linkedlist+array': {
    layouts: [
      { type: 'linkedlist', className: 'w-full h-64', priority: 1 },
      { type: 'array', className: 'w-full h-64', priority: 0.8 }
    ]
  },
  'tree+array': {
    layouts: [
      { type: 'tree', className: 'w-full lg:w-2/3 h-96', priority: 1 },
      { type: 'array', className: 'w-full lg:w-1/3 h-64', priority: 0.7 }
    ]
  },

  // Triple visualizer layouts
  'array+hashmap+string': {
    layouts: [
      { type: 'string', className: 'w-full h-24', priority: 0.6 },
      { type: 'array', className: 'w-full lg:w-2/3 h-80', priority: 1 },
      { type: 'hashmap', className: 'w-full lg:w-1/3 h-64', priority: 0.8 }
    ]
  },

  // Default fallback layout
  default: {
    layouts: [
      { type: 'primary', className: 'w-full h-96', priority: 1 },
      { type: 'secondary', className: 'w-full h-64', priority: 0.7 },
      { type: 'tertiary', className: 'w-full h-48', priority: 0.5 }
    ]
  }
};

/**
 * Convert UIR entities to legacy visualizer format
 * Maintains backward compatibility with existing visualizers
 */
function convertUIREntityToLegacyFormat(entities, entityType) {
  const entitiesOfType = entities.filter(e => e.type === entityType);

  if (entitiesOfType.length === 0) {
    return null;
  }

  // For most types, we'll use the first entity
  const primaryEntity = entitiesOfType[0];

  switch (entityType) {
    case 'array':
      return convertArrayEntity(entitiesOfType);
    case 'hashmap':
      return convertHashMapEntity(primaryEntity);
    case 'string':
      return convertStringEntity(primaryEntity);
    case 'tree':
      return convertTreeEntity(primaryEntity);
    case 'graph':
      return convertGraphEntity(primaryEntity);
    case 'linkedlist':
      return convertLinkedListEntity(primaryEntity);
    case 'recursion':
      return convertRecursionEntity(primaryEntity);
    case 'dp':
      return convertDPEntity(primaryEntity);
    case 'stack':
    case 'queue':
      return convertStackQueueEntity(primaryEntity, entityType);
    default:
      return primaryEntity.state;
  }
}

function convertArrayEntity(arrayEntities) {
  if (arrayEntities.length === 1) {
    const entity = arrayEntities[0];
    return {
      array: entity.state.values || [],
      highlights: entity.state.highlights || {},
      pointers: entity.state.pointers || [],
      operation: entity.operation,
      meta: entity.meta
    };
  } else {
    // Multiple arrays
    return {
      arrays: arrayEntities.map(entity => ({
        name: entity.meta?.name || entity.id,
        values: entity.state.values || [],
        highlights: entity.state.highlights || {},
        data: entity.state.values || []
      })),
      pointers: arrayEntities.flatMap(e => e.state.pointers || [])
    };
  }
}

function convertHashMapEntity(entity) {
  return {
    hashMap: entity.state.entries || {},
    highlights: entity.highlights || {},
    size: entity.state.size || 0,
    operation: entity.operation,
    meta: entity.meta
  };
}

function convertStringEntity(entity) {
  return {
    string: entity.state.value || '',
    length: entity.state.length || 0,
    pointers: entity.state.pointers || [],
    highlights: entity.highlights || {},
    operation: entity.operation,
    meta: entity.meta
  };
}

function convertTreeEntity(entity) {
  return {
    tree: entity.state,
    root: entity.state.root || entity.state,
    highlights: entity.highlights || {},
    traversalType: entity.meta?.traversalType || 'inorder',
    operation: entity.operation
  };
}

function convertGraphEntity(entity) {
  return {
    graph: entity.state,
    vertices: entity.state.vertices || [],
    edges: entity.state.edges || [],
    adjacencyList: entity.state.adjacencyList || {},
    highlights: entity.highlights || {},
    operation: entity.operation
  };
}

function convertLinkedListEntity(entity) {
  // Handle different linkedlist entity formats
  const state = entity.state;

  // If this is a merge scenario, structure data appropriately  
  if (state.mergeLists) {
    return {
      linkedList: {
        head: state.head,
        nodes: state.nodes,
        connections: state.connections,
        mergeLists: state.mergeLists
      },
      head: state.head,
      nodes: state.nodes || [],
      connections: state.connections || [],
      highlights: entity.highlights || {},
      operation: entity.operation,
      meta: entity.meta
    };
  }

  // Handle incomplete data gracefully
  if (state.incomplete || state.rawData) {
    // Try to extract what we can from raw data
    const rawData = state.rawData || {};
    return {
      linkedList: {
        head: state.head || rawData.head,
        nodes: state.nodes || rawData.nodes || [],
        connections: state.connections || rawData.connections || [],
        incomplete: true,
        availableData: Object.keys(rawData)
      },
      head: state.head || rawData.head,
      nodes: state.nodes || rawData.nodes || [],
      connections: state.connections || rawData.connections || [],
      highlights: entity.highlights || {},
      operation: entity.operation,
      meta: entity.meta
    };
  }

  // Standard linkedlist format
  return {
    linkedList: entity.state,
    head: entity.state.head,
    nodes: entity.state.nodes || [],
    connections: entity.state.connections || [],
    highlights: entity.highlights || {},
    operation: entity.operation
  };
}

function convertRecursionEntity(entity) {
  return {
    callStack: entity.state.callStack || [],
    currentLevel: entity.state.currentLevel || 0,
    maxDepth: entity.state.maxDepth || 0,
    baseCase: entity.meta?.baseCase,
    highlights: entity.highlights || {},
    operation: entity.operation
  };
}

function convertDPEntity(entity) {
  return {
    matrix: entity.state.matrix || [],
    dpTable: entity.state.matrix || [],
    dimensions: entity.state.dimensions || {},
    currentCell: entity.state.currentCell,
    highlights: entity.highlights || {},
    operation: entity.operation
  };
}

function convertStackQueueEntity(entity, type) {
  return {
    [type]: entity.state.items || [],
    top: entity.state.top,
    front: entity.state.front,
    rear: entity.state.rear,
    size: entity.meta?.size || 0,
    highlights: entity.highlights || {},
    operation: entity.operation,
    type: type
  };
}

/**
 * Determine layout configuration based on entity types
 */
function determineLayout(entityTypes) {
  if (entityTypes.length === 1) {
    return { type: 'single', primary: entityTypes[0] };
  }

  // Sort types for consistent layout keys
  const sortedTypes = entityTypes.sort();
  const layoutKey = sortedTypes.join('+');

  if (LAYOUT_CONFIGS[layoutKey]) {
    return { type: 'configured', config: LAYOUT_CONFIGS[layoutKey] };
  }

  // Use default layout for unknown combinations
  return { type: 'default', entityTypes: sortedTypes };
}

/**
 * Assign priority to entity types for layout decisions
 */
function getEntityPriority(entityType) {
  const priorities = {
    array: 10,
    string: 9,
    hashmap: 8,
    tree: 7,
    graph: 7,
    linkedlist: 6,
    dp: 5,
    recursion: 4,
    stack: 3,
    queue: 3
  };

  return priorities[entityType] || 1;
}

/**
 * Main Visualization Orchestrator Component
 */
const VisualizationOrchestrator = memo(function VisualizationOrchestrator({
  uirStep,
  className = '',
  showDebugInfo = false,
  onEntityError = null
}) {
  const entityTypes = useMemo(() => getEntityTypes(uirStep), [uirStep]);
  const layout = useMemo(() => determineLayout(entityTypes), [entityTypes]);

  // Convert UIR entities to legacy format for each visualizer
  const visualizerData = useMemo(() => {
    const data = {};
    entityTypes.forEach(type => {
      const legacyData = convertUIREntityToLegacyFormat(uirStep.entities, type);
      if (legacyData) {
        data[type] = legacyData;
      }
    });
    return data;
  }, [uirStep.entities, entityTypes]);

  // Render individual visualizer
  const renderVisualizer = (entityType, visualizerClassName = '') => {
    const VisualizerComponent = VISUALIZER_REGISTRY[entityType];

    if (!VisualizerComponent) {
      return (
        <div className={`flex items-center justify-center bg-red-900/20 border border-red-600 rounded-lg ${visualizerClassName}`}>
          <div className="text-red-400 text-center">
            <div className="text-xl mb-2">⚠️</div>
            <div>No visualizer found for type: {entityType}</div>
          </div>
        </div>
      );
    }

    const data = visualizerData[entityType];
    if (!data) {
      // Special handling for linkedlist - show debug info
      if (entityType === 'linkedlist') {
        const linkedlistEntities = uirStep.entities?.filter(e => e.type === 'linkedlist') || [];
        const hasLinkedlistEntities = linkedlistEntities.length > 0;

        return (
          <div className={`flex flex-col items-center justify-center bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 ${visualizerClassName}`}>
            <div className="text-yellow-400 text-center">
              <div className="text-lg mb-2">🔍</div>
              <div className="font-semibold">LinkedList Debug Info</div>
              <div className="text-sm mt-2">
                <div>Entities found: {hasLinkedlistEntities ? 'Yes' : 'No'}</div>
                {hasLinkedlistEntities && (
                  <div className="mt-1">
                    <div>Entity count: {linkedlistEntities.length}</div>
                    <div>States: {linkedlistEntities.map(e =>
                      e.state.incomplete ? 'incomplete' : 'complete'
                    ).join(', ')}</div>
                  </div>
                )}
                <div className="mt-2 text-xs">
                  Available entity types: {uirStep.entities?.map(e => e.type).join(', ') || 'None'}
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className={`flex items-center justify-center bg-gray-900/50 border border-gray-600 rounded-lg ${visualizerClassName}`}>
          <div className="text-gray-400 text-center">
            <div className="text-lg mb-2">📊</div>
            <div>No data for {entityType}</div>
          </div>
        </div>
      );
    }

    try {
      return (
        <div className={`bg-gray-900 border border-gray-600 rounded-lg p-4 ${visualizerClassName}`}>
          <div className="text-sm text-gray-400 mb-2 font-medium">
            {entityType.charAt(0).toUpperCase() + entityType.slice(1)} Visualization
          </div>
          <VisualizerComponent
            data={data}
            stepData={data}
            title={`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} View`}
            className="w-full h-full"
          />
        </div>
      );
    } catch (error) {
      console.error(`Error rendering ${entityType} visualizer:`, error);
      onEntityError?.(entityType, error);

      return (
        <div className={`flex items-center justify-center bg-red-900/20 border border-red-600 rounded-lg ${visualizerClassName}`}>
          <div className="text-red-400 text-center">
            <div className="text-xl mb-2">💥</div>
            <div>Error rendering {entityType}</div>
            <div className="text-xs mt-1">{error.message}</div>
          </div>
        </div>
      );
    }
  };

  // Render layout based on configuration
  const renderLayout = () => {
    if (entityTypes.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-900/50 border border-gray-600 rounded-lg">
          <div className="text-gray-400 text-center">
            <div className="text-2xl mb-2">📊</div>
            <div>No visualization data available</div>
          </div>
        </div>
      );
    }

    switch (layout.type) {
      case 'single':
        return renderVisualizer(layout.primary, 'w-full h-96');

      case 'configured':
        return (
          <div className="space-y-4">
            {layout.config.layouts.map((layoutItem, index) => (
              <div key={index} className={layoutItem.className}>
                {renderVisualizer(layoutItem.type)}
              </div>
            ))}
          </div>
        );

      case 'default': {
        // Sort by priority and render
        const sortedTypes = layout.entityTypes.sort((a, b) =>
          getEntityPriority(b) - getEntityPriority(a)
        );

        return (
          <div className="space-y-4">
            {sortedTypes.map((type, index) => (
              <div
                key={type}
                className={index === 0 ? 'w-full h-96' : 'w-full h-64'}
              >
                {renderVisualizer(type)}
              </div>
            ))}
          </div>
        );
      }

      default:
        return (
          <div className="flex items-center justify-center h-64 bg-gray-900/50 border border-gray-600 rounded-lg">
            <div className="text-gray-400">Unknown layout configuration</div>
          </div>
        );
    }
  };

  return (
    <div className={`visualization-orchestrator ${className}`}>
      {/* Debug information */}
      {showDebugInfo && (
        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-600 rounded-lg text-sm">
          <div className="text-blue-300 font-semibold mb-2">Debug Info</div>
          <div className="space-y-1 text-blue-200">
            <div>Entity Types: {entityTypes.join(', ') || 'None'}</div>
            <div>Layout Type: {layout.type}</div>
            <div>Step: {uirStep?.step || 'N/A'}</div>
            <div>Entities Count: {uirStep?.entities?.length || 0}</div>
          </div>
        </div>
      )}

      {/* Global state display */}
      {uirStep?.globalState?.variables && Object.keys(uirStep.globalState.variables).length > 0 && (
        <div className="mb-4 p-3 bg-green-900/20 border border-green-600 rounded-lg">
          <div className="text-green-300 font-semibold mb-2">Variables</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(uirStep.globalState.variables).map(([key, value]) => (
              <div key={key} className="bg-green-800/30 px-2 py-1 rounded text-sm">
                <span className="text-green-200 font-medium">{key}:</span>
                <span className="text-green-100 ml-1">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step description */}
      {uirStep?.note && (
        <div className="mb-4 p-3 bg-gray-800/50 border border-gray-600 rounded-lg">
          <div className="text-gray-300">{uirStep.note}</div>
          {uirStep.codeReference && (
            <div className="text-xs text-gray-500 mt-1">Code: {uirStep.codeReference}</div>
          )}
        </div>
      )}

      {/* Main visualization area */}
      <div className="min-h-[300px]">
        {renderLayout()}
      </div>
    </div>
  );
});

VisualizationOrchestrator.propTypes = {
  uirStep: PropTypes.shape({
    step: PropTypes.number,
    entities: PropTypes.array,
    globalState: PropTypes.object,
    note: PropTypes.string,
    codeReference: PropTypes.string
  }).isRequired,
  className: PropTypes.string,
  showDebugInfo: PropTypes.bool,
  onEntityError: PropTypes.func
};

export default VisualizationOrchestrator;
