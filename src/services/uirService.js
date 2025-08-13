/**
 * Unified Intermediate Representation (UIR) Service
 * Provides a universal format for visualization events that all v  const vizType = viz?.type?.toLowerCase() || 'array';

  console.log('🔍 UIR: Processing step with type:', vizType, 'data:', data);
  console.log('🔍 UIR: Data keys:', data ? Object.keys(data) : 'no data');
  console.log('🔍 UIR: Has arrays:', !!data?.arrays);
  console.log('🔍 UIR: Has array:', !!data?.array);alizers can consume
 * This solves the fundamental "switching problem" by decoupling visualization from AI response structure
 */

/**
 * UIR Event Schema
 * {
 *   "step": number,
 *   "timestamp": number,
 *   "entities": [
 *     {
 *       "id": string,        // unique identifier (e.g., "array1", "hashMap1", "linkedList1")
 *       "type": string,      // data structure type ("array", "hashmap", "linkedlist", etc.)
 *       "state": any,        // current state of the entity
 *       "operation": string, // operation performed ("init", "insert", "delete", "update", "window_shift", etc.)
 *       "meta": object,      // optional metadata (indices, keys, positions, etc.)
 *       "highlights": object // visual highlights for this entity
 *     }
 *   ],
 *   "globalState": object,   // shared state between entities
 *   "note": string,          // human-readable description
 *   "codeReference": string  // line number or code snippet
 * }
 */

/**
 * Convert legacy AI response format to UIR format
 * This enables backward compatibility while transitioning to the new architecture
 */
export function convertLegacyToUIR(legacyAnalysis) {
  console.log('🔍 UIR: convertLegacyToUIR called with:', legacyAnalysis);

  if (!legacyAnalysis?.steps) {
    console.warn('🔍 UIR: No steps found in legacyAnalysis');
    return { steps: [] };
  }

  console.log('🔍 UIR: Processing', legacyAnalysis.steps.length, 'steps');

  const uirSteps = legacyAnalysis.steps.map((step, index) => {
    console.log(`🔍 UIR: Processing step ${index + 1}:`, step);
    const entities = extractEntitiesFromLegacyStep(step);
    console.log(`🔍 UIR: Step ${index + 1} entities:`, entities);

    return {
      step: step.stepNumber || index + 1,
      timestamp: Date.now() + index,
      entities,
      globalState: extractGlobalState(step),
      note: step.description || step.title || '',
      codeReference: step.codeHighlight || '',
      reasoning: step.reasoning || '',
      learningPoint: step.learningPoint || ''
    };
  });

  console.log('🔍 UIR: Final UIR steps:', uirSteps);

  return {
    ...legacyAnalysis,
    uirSteps,
    metadata: {
      conversionType: 'legacy-to-uir',
      originalFormat: 'ai-response',
      timestamp: Date.now()
    }
  };
}

/**
 * Extract entities from legacy step format
 * Maps old format to new entity-based structure
 */
function extractEntitiesFromLegacyStep(step) {
  const entities = [];

  console.log('🔍 UIR: Input step structure:', {
    hasVisualization: !!step.visualization,
    hasData: !!step.visualization?.data,
    vizType: step.visualization?.type,
    stepKeys: Object.keys(step),
    fullStep: step
  });

  console.log('🔍 UIR: Full step object:', JSON.stringify(step, null, 2));

  // Handle case where there's no visualization object but step has data directly
  let viz = step.visualization;
  let data = viz?.data;

  // Check if data is directly in visualization (not in visualization.data)
  if (!data && viz) {
    console.log('🔍 UIR: Data not in viz.data, checking viz directly');
    if (viz.arrays || viz.array || viz.string || viz.tree || viz.hashMap) {
      console.log('🔍 UIR: Found data directly in visualization object');
      data = viz; // Use the visualization object as data
    }
  }

  if (!data && step.data) {
    console.log('🔍 UIR: Using step.data directly');
    data = step.data;
    viz = { type: step.type || 'array', data: step.data };
  }

  if (!data) {
    console.warn('🔍 UIR: No data found in step, attempting to create fallback entities');
    // Create a basic array entity if we have any array-like properties in the step
    if (step.arrays || step.array || step.values) {
      data = {
        arrays: step.arrays,
        array: step.array,
        values: step.values
      };
      viz = { type: 'array', data };
    } else {
      console.warn('UIR: No usable data found in step:', step);
      return entities;
    }
  }

  const vizType = viz.type?.toLowerCase() || 'array';

  console.log('UIR: Processing step with type:', vizType, 'data:', data);

  // Extract array entities - More flexible detection
  if (data.arrays && Array.isArray(data.arrays)) {
    // Multiple arrays format
    data.arrays.forEach((array, index) => {
      entities.push({
        id: array.name || `array${index + 1}`,
        type: 'array',
        state: {
          values: array.values || array.data || [],
          highlights: array.highlights || {},
          pointers: data.pointers?.filter(p => p.arrayId === array.name) || []
        },
        operation: detectOperation(step),
        meta: {
          length: (array.values || array.data || []).length,
          name: array.name || `Array ${index + 1}`
        },
        highlights: array.highlights || {}
      });
    });
  } else if (data.array && Array.isArray(data.array)) {
    // Single array format
    entities.push({
      id: 'array1',
      type: 'array',
      state: {
        values: data.array,
        highlights: data.highlights?.array || data.highlights || {},
        pointers: data.pointers || []
      },
      operation: detectOperation(step),
      meta: {
        length: data.array.length,
        name: 'Array'
      },
      highlights: data.highlights?.array || data.highlights || {}
    });
  } else if (Array.isArray(data.values)) {
    // Direct values array format
    entities.push({
      id: 'array1',
      type: 'array',
      state: {
        values: data.values,
        highlights: data.highlights || {},
        pointers: data.pointers || []
      },
      operation: detectOperation(step),
      meta: {
        length: data.values.length,
        name: 'Array'
      },
      highlights: data.highlights || {}
    });
  } else if (vizType === 'array' || vizType.includes('array')) {
    // Fallback: any array-like data
    console.log('UIR: Creating fallback array entity from data:', data);
    const fallbackArray = [];

    // Try to extract array data from various possible properties
    if (data.nums) fallbackArray.push(...(Array.isArray(data.nums) ? data.nums : [data.nums]));
    if (data.arr) fallbackArray.push(...(Array.isArray(data.arr) ? data.arr : [data.arr]));
    if (data.list) fallbackArray.push(...(Array.isArray(data.list) ? data.list : [data.list]));

    entities.push({
      id: 'array1',
      type: 'array',
      state: {
        values: fallbackArray.length > 0 ? fallbackArray : [1, 2, 3, 4, 5], // Example fallback
        highlights: data.highlights || {},
        pointers: data.pointers || []
      },
      operation: detectOperation(step),
      meta: {
        length: fallbackArray.length || 5,
        name: 'Array',
        fallback: true
      },
      highlights: data.highlights || {}
    });
  }

  // Extract hashmap entities
  if (data.hashMap && typeof data.hashMap === 'object') {
    entities.push({
      id: 'hashMap1',
      type: 'hashmap',
      state: {
        entries: data.hashMap,
        size: Object.keys(data.hashMap).length
      },
      operation: detectOperation(step),
      meta: {
        keys: Object.keys(data.hashMap),
        name: 'Hash Map'
      },
      highlights: data.highlights?.hashMap || {}
    });
  }

  // Extract string entities
  if (data.string || data.text || typeof data.input === 'string') {
    const stringValue = data.string || data.text || data.input;
    entities.push({
      id: 'string1',
      type: 'string',
      state: {
        value: stringValue,
        length: stringValue.length,
        pointers: data.pointers || []
      },
      operation: detectOperation(step),
      meta: {
        name: 'Input String',
        encoding: 'utf-8'
      },
      highlights: data.highlights?.string || {}
    });
  }

  // Extract tree entities
  if (data.tree || data.root) {
    entities.push({
      id: 'tree1',
      type: 'tree',
      state: data.tree || data.root,
      operation: detectOperation(step),
      meta: {
        name: 'Binary Tree',
        traversalType: data.traversalType || 'inorder'
      },
      highlights: data.highlights?.tree || {}
    });
  }

  // Extract graph entities
  if (data.graph || (data.vertices && data.edges)) {
    entities.push({
      id: 'graph1',
      type: 'graph',
      state: {
        vertices: data.vertices || data.graph?.vertices || [],
        edges: data.edges || data.graph?.edges || [],
        adjacencyList: data.adjacencyList || data.graph?.adjacencyList || {}
      },
      operation: detectOperation(step),
      meta: {
        name: 'Graph',
        directed: data.directed || false
      },
      highlights: data.highlights?.graph || {}
    });
  }

  // Extract linked list entities - Enhanced detection for merge k-lists scenarios
  if (data.linkedList || data.head || data.nodes ||
    (vizType === 'linkedlist' && (data.l || data.r || data.left || data.right || data.list1 || data.list2))) {

    // Handle different linkedlist data structures
    let linkedListState = {};

    if (data.linkedList) {
      // Standard linkedlist format
      linkedListState = {
        head: data.linkedList.head,
        nodes: data.linkedList.nodes || [],
        connections: data.linkedList.connections || []
      };
    } else if (data.head || data.nodes) {
      // Direct head/nodes format
      linkedListState = {
        head: data.head,
        nodes: data.nodes || [],
        connections: data.connections || []
      };
    } else if (data.l || data.r || data.left || data.right || data.list1 || data.list2) {
      // Merge scenarios - multiple lists being compared/merged
      linkedListState = {
        head: data.l || data.left || data.list1,
        nodes: [],
        connections: [],
        mergeLists: {
          left: data.l || data.left || data.list1,
          right: data.r || data.right || data.list2,
          result: data.result || data.merged
        }
      };
    } else {
      // Fallback - try to construct from available data
      linkedListState = {
        head: null,
        nodes: [],
        connections: [],
        rawData: data
      };
    }

    entities.push({
      id: 'linkedList1',
      type: 'linkedlist',
      state: linkedListState,
      operation: detectOperation(step),
      meta: {
        name: 'Linked List',
        type: data.listType || 'singly',
        scenario: data.l || data.r ? 'merge' : 'standard'
      },
      highlights: data.highlights?.linkedList || data.highlights || {}
    });
  }

  // Extract DP table entities
  if (data.matrix || data.dpTable || (data.dp && Array.isArray(data.dp))) {
    entities.push({
      id: 'dpTable1',
      type: 'dp',
      state: {
        matrix: data.matrix || data.dpTable || data.dp,
        dimensions: data.dimensions || {},
        currentCell: data.currentCell || null
      },
      operation: detectOperation(step),
      meta: {
        name: 'DP Table',
        problemType: data.problemType || 'unknown'
      },
      highlights: data.highlights?.dp || {}
    });
  }

  // Extract recursion call stack entities
  if (data.callStack && Array.isArray(data.callStack)) {
    entities.push({
      id: 'recursionStack1',
      type: 'recursion',
      state: {
        callStack: data.callStack,
        currentLevel: data.currentLevel || 0,
        maxDepth: data.maxDepth || data.callStack.length
      },
      operation: detectOperation(step),
      meta: {
        name: 'Call Stack',
        baseCase: data.baseCase || null
      },
      highlights: data.highlights?.recursion || {}
    });
  } else if (vizType === 'recursion' ||
    (step.title && step.title.toLowerCase().includes('recurs')) ||
    (step.description && step.description.toLowerCase().includes('recurs'))) {
    // Fallback recursion entity with minimal data
    entities.push({
      id: 'recursionStack1',
      type: 'recursion',
      state: {
        callStack: data.stack || data.calls || [
          {
            function: 'function',
            parameters: data.params || data.arguments || {},
            returnValue: data.return || data.result,
            level: 0
          }
        ],
        currentLevel: data.level || data.depth || 0,
        maxDepth: data.maxDepth || 1
      },
      operation: detectOperation(step),
      meta: {
        name: 'Call Stack (Reconstructed)',
        fallback: true,
        originalData: data
      },
      highlights: data.highlights?.recursion || {}
    });
  }

  // Extract stack/queue entities
  if (data.stack && Array.isArray(data.stack)) {
    entities.push({
      id: 'stack1',
      type: 'stack',
      state: {
        items: data.stack,
        top: data.stack.length - 1
      },
      operation: detectOperation(step),
      meta: {
        name: 'Stack',
        size: data.stack.length
      },
      highlights: data.highlights?.stack || {}
    });
  }

  if (data.queue && Array.isArray(data.queue)) {
    entities.push({
      id: 'queue1',
      type: 'queue',
      state: {
        items: data.queue,
        front: 0,
        rear: data.queue.length - 1
      },
      operation: detectOperation(step),
      meta: {
        name: 'Queue',
        size: data.queue.length
      },
      highlights: data.highlights?.queue || {}
    });
  }

  // If no specific entities found, create a generic entity based on the visualization type
  if (entities.length === 0) {
    // For linkedlist type, create a minimal linkedlist entity even if data is incomplete
    if (vizType === 'linkedlist') {
      entities.push({
        id: 'linkedList1',
        type: 'linkedlist',
        state: {
          head: null,
          nodes: [],
          connections: [],
          rawData: data,
          incomplete: true
        },
        operation: 'display',
        meta: {
          name: 'Linked List (Incomplete Data)',
          fallback: true,
          dataAvailable: Object.keys(data).join(', ')
        },
        highlights: data.highlights || {}
      });
    } else {
      // Generic fallback for other types
      entities.push({
        id: 'data1',
        type: vizType,
        state: data,
        operation: 'display',
        meta: {
          name: `${vizType.charAt(0).toUpperCase() + vizType.slice(1)} Data`,
          fallback: true
        },
        highlights: data.highlights || {}
      });
    }
  }

  console.log('UIR: Extracted entities:', entities.length > 0 ? entities : 'No entities found');

  // Final fallback - if still no entities, create a basic array visualization
  if (entities.length === 0) {
    console.warn('UIR: Creating emergency fallback entity');
    entities.push({
      id: 'fallback1',
      type: 'array',
      state: {
        values: [1, 2, 3, 4, 5],
        highlights: {},
        pointers: []
      },
      operation: 'display',
      meta: {
        name: 'Fallback Data',
        emergency: true,
        originalStep: step
      },
      highlights: {}
    });
  }

  return entities;
}

/**
 * Detect operation type from step content
 */
function detectOperation(step) {
  const description = (step.description || '').toLowerCase();
  const title = (step.title || '').toLowerCase();
  const combined = `${title} ${description}`;

  // Operation detection patterns
  const operationPatterns = {
    init: ['initialize', 'create', 'setup', 'start'],
    insert: ['add', 'insert', 'push', 'append'],
    delete: ['remove', 'delete', 'pop', 'dequeue'],
    update: ['update', 'modify', 'change', 'set'],
    search: ['find', 'search', 'locate', 'lookup'],
    compare: ['compare', 'check', 'evaluate'],
    move: ['move', 'shift', 'slide', 'advance'],
    merge: ['merge', 'combine', 'join'],
    split: ['split', 'divide', 'partition'],
    traverse: ['traverse', 'visit', 'explore'],
    sort: ['sort', 'order', 'arrange'],
    expand: ['expand', 'grow', 'extend'],
    shrink: ['shrink', 'reduce', 'contract']
  };

  for (const [operation, patterns] of Object.entries(operationPatterns)) {
    if (patterns.some(pattern => combined.includes(pattern))) {
      return operation;
    }
  }

  return 'process'; // default operation
}

/**
 * Extract global state from legacy step
 */
function extractGlobalState(step) {
  const globalState = {};

  // Extract variable states
  if (step.variableStates) {
    globalState.variables = step.variableStates;
  }

  // Extract complexity info
  if (step.complexity) {
    globalState.complexity = step.complexity;
  }

  // Extract results
  if (step.visualization?.data?.results) {
    globalState.results = step.visualization.data.results;
  }

  return globalState;
}

/**
 * Validate UIR step format
 */
export function validateUIRStep(uirStep) {
  const errors = [];
  const warnings = [];

  if (!uirStep) {
    errors.push('UIR step is null or undefined');
    return { isValid: false, errors, warnings };
  }

  if (typeof uirStep.step !== 'number') {
    errors.push('Step number must be a number');
  }

  if (!Array.isArray(uirStep.entities)) {
    errors.push('Entities must be an array');
  } else {
    uirStep.entities.forEach((entity, index) => {
      if (!entity.id) {
        errors.push(`Entity ${index} missing id`);
      }
      if (!entity.type) {
        errors.push(`Entity ${index} missing type`);
      }
      if (entity.state === undefined) {
        warnings.push(`Entity ${index} has undefined state`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Filter entities by type for specific visualizers
 */
export function filterEntitiesByType(uirStep, type) {
  if (!uirStep?.entities) {
    return [];
  }

  return uirStep.entities.filter(entity => entity.type === type);
}

/**
 * Get all entity types present in a UIR step
 */
export function getEntityTypes(uirStep) {
  if (!uirStep?.entities) {
    return [];
  }

  return [...new Set(uirStep.entities.map(entity => entity.type))];
}

/**
 * Merge multiple UIR steps for complex visualizations
 */
export function mergeUIRSteps(steps) {
  if (!Array.isArray(steps) || steps.length === 0) {
    return null;
  }

  if (steps.length === 1) {
    return steps[0];
  }

  const merged = {
    step: steps[0].step,
    timestamp: Math.max(...steps.map(s => s.timestamp || 0)),
    entities: [],
    globalState: {},
    note: steps.map(s => s.note).filter(Boolean).join(' | '),
    codeReference: steps.map(s => s.codeReference).filter(Boolean).join(', ')
  };

  // Merge entities (later steps override earlier ones for same ID)
  const entityMap = new Map();
  steps.forEach(step => {
    step.entities?.forEach(entity => {
      entityMap.set(entity.id, entity);
    });
  });
  merged.entities = Array.from(entityMap.values());

  // Merge global state
  steps.forEach(step => {
    if (step.globalState) {
      Object.assign(merged.globalState, step.globalState);
    }
  });

  return merged;
}

/**
 * Create a new UIR step from scratch
 */
export function createUIRStep({
  stepNumber,
  entities = [],
  globalState = {},
  note = '',
  codeReference = ''
}) {
  return {
    step: stepNumber,
    timestamp: Date.now(),
    entities,
    globalState,
    note,
    codeReference
  };
}

/**
 * Add entity to existing UIR step
 */
export function addEntityToUIRStep(uirStep, entity) {
  if (!uirStep.entities) {
    uirStep.entities = [];
  }

  // Replace existing entity with same ID or add new one
  const existingIndex = uirStep.entities.findIndex(e => e.id === entity.id);
  if (existingIndex >= 0) {
    uirStep.entities[existingIndex] = entity;
  } else {
    uirStep.entities.push(entity);
  }

  return uirStep;
}

/**
 * Generate UIR for instrumented Python code execution
 * This is the foundation for the GPT-5 suggested approach
 */
export function generateUIRFromInstrumentation(events) {
  const uirSteps = [];
  let currentStep = 1;
  let stepEvents = [];

  events.forEach(event => {
    // Group events by logical step
    if (event.type === 'step_boundary') {
      if (stepEvents.length > 0) {
        uirSteps.push(createUIRStepFromEvents(currentStep, stepEvents));
        currentStep++;
        stepEvents = [];
      }
    } else {
      stepEvents.push(event);
    }
  });

  // Handle remaining events
  if (stepEvents.length > 0) {
    uirSteps.push(createUIRStepFromEvents(currentStep, stepEvents));
  }

  return uirSteps;
}

/**
 * Create UIR step from instrumentation events
 */
function createUIRStepFromEvents(stepNumber, events) {
  const entities = [];
  const globalState = {};

  events.forEach(event => {
    switch (event.type) {
      case 'variable_assignment':
        globalState.variables = globalState.variables || {};
        globalState.variables[event.variable] = event.value;
        break;

      case 'array_mutation':
        entities.push({
          id: event.arrayId,
          type: 'array',
          state: {
            values: event.newState,
            highlights: event.highlights || {}
          },
          operation: event.operation,
          meta: event.meta || {}
        });
        break;

      case 'hashmap_mutation':
        entities.push({
          id: event.hashmapId,
          type: 'hashmap',
          state: {
            entries: event.newState,
            size: Object.keys(event.newState).length
          },
          operation: event.operation,
          meta: event.meta || {}
        });
        break;

      // Add more event types as needed
    }
  });

  return createUIRStep({
    stepNumber,
    entities,
    globalState,
    note: events.find(e => e.description)?.description || '',
    codeReference: events.find(e => e.line)?.line || ''
  });
}

export default {
  convertLegacyToUIR,
  validateUIRStep,
  filterEntitiesByType,
  getEntityTypes,
  mergeUIRSteps,
  createUIRStep,
  addEntityToUIRStep,
  generateUIRFromInstrumentation
};
