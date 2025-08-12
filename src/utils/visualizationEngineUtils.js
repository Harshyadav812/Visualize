/**
 * Utility functions for VisualizationEngine component
 */

/**
 * Legacy validation wrapper to maintain test expectations
 * (accepts visualization object rather than raw data & type)
 * For new code, use validateVisualizationData from dataValidation.js directly
 */
export function validateVisualizationData(visualization) {
  const errors = [];
  if (!visualization) {
    return { isValid: false, errors: ['Visualization object is null or undefined'] };
  }
  if (!visualization.type) {
    errors.push('Visualization type is missing');
  }
  if (!visualization.data) {
    errors.push('Visualization data is missing');
  }
  const type = visualization.type;
  const data = visualization.data;
  if (type) {
    switch (type.toLowerCase()) {
      case 'array':
      case 'window':
      case 'pointers':
        if (data && !Array.isArray(data.array) && !Array.isArray(data.arrays)) {
          errors.push('Array visualization requires array or arrays data');
        }
        break;
      case 'tree':
        if (data && !Array.isArray(data.nodes)) {
          errors.push('Tree visualization requires nodes array');
        }
        break;
      case 'graph':
        if (data && (!Array.isArray(data.vertices) || !Array.isArray(data.edges))) {
          errors.push('Graph visualization requires vertices and edges arrays');
        }
        break;
      case 'linkedlist':
      case 'linked_list':
        if (data && !Array.isArray(data.nodes)) {
          errors.push('Linked list visualization requires nodes array');
        }
        break;
      case 'stack':
      case 'queue':
        if (data && !Array.isArray(data.elements)) {
          errors.push(`${type} visualization requires elements array`);
        }
        break;
      case 'recursion':
        if (data && !Array.isArray(data.callStack)) {
          errors.push('Recursion visualization requires callStack array');
        }
        break;
      default:
        break;
    }
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * Utility function to detect visualization type from analysis data
 * @param {Object} analysis - Analysis data from AI service
 * @returns {string} - Detected primary visualization type
 */
export function detectVisualizationType(analysis) {
  if (!analysis) return 'array';

  // Check data structures array for primary type
  if (analysis.dataStructures && Array.isArray(analysis.dataStructures)) {
    const primaryType = analysis.dataStructures[0];
    if (primaryType) return primaryType.toLowerCase();
  }

  // Fallback to algorithm type mapping
  const algorithmTypeMap = {
    'sliding_window': 'array',
    'two_pointer': 'array',
    'binary_search': 'array',
    'sorting': 'array',
    'dfs': 'graph',
    'bfs': 'graph',
    'tree_traversal': 'tree',
    'linked_list': 'linkedlist',
    'dp': 'dp',
    'dp_matrix': 'dp',
    'dp_knapsack': 'dp',
    'dp_lcs': 'dp',
    'dp_bitmask': 'dp'
  };

  const algorithmType = analysis.algorithmType?.toLowerCase();
  return algorithmTypeMap[algorithmType] || 'array';
}

/**
 * Helper to map legacy/alias visualization types to canonical ones for validation/rendering
 */
export function mapToCanonicalType(type) {
  if (!type) return type;
  const t = type.toLowerCase();
  switch (t) {
    case 'window':
    case 'pointers':
      return 'array';
    case 'linked_list':
      return 'linkedlist';
    case 'string':
    case 'strings':
    case 'char_array':
    case 'substring':
    case 'text':
      return 'string'; // Keep string as its own type
    case 'hash_map':
    case 'hash-map':
    case 'map':
    case 'dictionary':
    case 'frequency':
    case 'counter':
      return 'hashmap';
    case 'dp_table':
    case 'dynamic_programming':
      return 'dp';
    case 'results':
    case 'summary':
      return 'results';
    case 'hybrid':
    case 'mixed':
      return 'hybrid';
    default:
      return t;
  }
}

/**
 * Enhanced type detection for AI-generated visualizations
 * This enables the AI to specify the primary data structure focus for each step
 */
export function detectPrimaryVisualizationType(data, explicitType) {
  if (!data || typeof data !== 'object') {
    return 'array'; // fallback
  }

  // Count the "weight" of different data structure types
  const hasArray = (data.arrays && data.arrays.length > 0) || (data.array && Array.isArray(data.array));
  const hasString = data.string || data.text || (typeof data.input === 'string');
  const hasHashMap = data.hashMap && Object.keys(data.hashMap).length > 0;
  const hasTree = data.tree || data.root || (data.nodes && data.nodes.some(n => n.parent !== undefined));
  const hasGraph = data.graph || (data.vertices && data.edges);
  const hasResults = data.results && Object.keys(data.results).length > 0;
  const hasPointers = data.pointers && data.pointers.length > 0;
  const hasCallStack = data.callStack && Array.isArray(data.callStack);
  const hasDPMatrix = data.matrix && Array.isArray(data.matrix) && data.matrix.length > 0;

  // If AI explicitly specified type, validate it against the actual data
  if (explicitType) {
    const explicitTypeLower = explicitType.toLowerCase();

    // Check if the explicit type matches the data structure
    switch (explicitTypeLower) {
      case 'dp':
      case 'dynamic_programming':
        if (hasDPMatrix || hasArray) {
          return 'dp'; // Valid DP data (DP often uses arrays/matrices)
        }
        break;
      case 'recursion':
        if (hasCallStack) {
          return explicitTypeLower; // Valid recursion data
        }
        // Fallback: If no callStack but has array data, treat as array
        if (hasArray || hasPointers) {
          console.warn(`Type mismatch: specified "recursion" but data appears to be array-based. Using "array" instead.`);
          return 'array';
        }
        break;
      case 'tree':
        if (hasTree) {
          return explicitTypeLower; // Valid tree data
        }
        // Fallback for tree type mismatch
        if (hasArray) {
          console.warn(`Type mismatch: specified "tree" but data appears to be array-based. Using "array" instead.`);
          return 'array';
        }
        break;
      case 'graph':
        if (hasGraph) {
          return explicitTypeLower; // Valid graph data
        }
        // Fallback for graph type mismatch
        if (hasArray) {
          console.warn(`Type mismatch: specified "graph" but data appears to be array-based. Using "array" instead.`);
          return 'array';
        }
        break;
      case 'array':
      case 'window':
      case 'pointers':
        if (hasArray || hasPointers) {
          return 'array'; // Valid array-based data
        }
        break;
      default:
        // For other types, trust the explicit type if it's commonly valid
        if (['string', 'hashmap', 'dp', 'results', 'hybrid'].includes(explicitTypeLower)) {
          return explicitTypeLower;
        }
        break;
    }
  }

  // Auto-detection based on data structure priority
  if (hasResults && !hasArray && !hasHashMap && !hasString) {
    return 'results';
  }

  if (hasDPMatrix) {
    return 'dp';
  }

  if (hasString && (!hasArray || hasPointers)) {
    // String problems often use pointers/sliding window
    return 'string';
  }

  if (hasHashMap && (!hasArray || Object.keys(data.hashMap).length > 3)) {
    // HashMap is primary if it has significant data or no competing arrays
    return 'hashmap';
  }

  if (hasCallStack) {
    return 'recursion';
  }

  if (hasTree) {
    return 'tree';
  }

  if (hasGraph) {
    return 'graph';
  }

  if (hasArray) {
    return 'array';
  }

  return 'array'; // ultimate fallback
}/**
 * Produce a lightweight data object for the visualizer to reduce prop churn.
 */
export function deriveSlimData(type, data) {
  if (!data || typeof data !== 'object') return data;
  const t = type?.toLowerCase();
  switch (t) {
    case 'array':
    case 'window':
    case 'pointers': {
      const { arrays = [], pointers = [], operations = [], highlights, window: win, hashMap, subarrays, calculations, results, ...rest } = data;
      return {
        arrays,
        pointers,
        operations,
        highlights: highlights || rest?.highlights,
        window: win || rest?.window,
        hashMap: hashMap || rest?.hashMap,
        subarrays: subarrays || rest?.subarrays,
        calculations: calculations || rest?.calculations,
        results: results || rest?.results
      };
    }
    case 'string':
    case 'strings':
    case 'substring':
    case 'text': {
      const { string, text, input, pointers = [], hashMap, highlights, calculations, results, subarrays, operations = [], ...rest } = data;
      return {
        string: string || text || input || '',
        pointers,
        hashMap: hashMap || rest?.hashMap,
        highlights: highlights || rest?.highlights,
        calculations: calculations || rest?.calculations,
        results: results || rest?.results,
        subarrays: subarrays || rest?.subarrays,
        operations
      };
    }
    case 'hashmap':
    case 'hash_map':
    case 'map': {
      const { hashMap, map, dictionary, highlights, operations, ...rest } = data;
      return {
        hashMap: hashMap || map || dictionary || data,
        highlights: highlights || rest?.highlights,
        operations: operations || rest?.operations
      };
    }
    case 'tree': {
      const { nodes = [], edges = [], traversalPath, currentNode } = data;
      return { nodes, edges, traversalPath, currentNode };
    }
    case 'graph': {
      const { vertices = [], edges = [], algorithm, directed } = data;
      return { vertices, edges, algorithm, directed };
    }
    case 'linkedlist':
    case 'linked_list': {
      const { nodes = [], head, tail } = data;
      return { nodes, head, tail };
    }
    case 'stack':
    case 'queue': {
      const { elements = [] } = data;
      return { elements };
    }
    case 'dp':
    case 'dp_table':
    case 'dynamic_programming': {
      if (Array.isArray(data.matrix)) return { matrix: data.matrix };
      if (Array.isArray(data.table)) return { matrix: data.table };
      if (Array.isArray(data.dp)) return { matrix: data.dp };
      return data;
    }
    case 'results':
    case 'summary': {
      const { results, supportingData, statistics, ...rest } = data;
      return {
        results: results || rest,
        supportingData: supportingData || rest?.supportingData,
        statistics: statistics || rest?.statistics
      };
    }
    case 'hybrid': {
      // For hybrid visualizations, preserve all data
      return data;
    }
    default:
      return data; // Fallback: return original
  }
}

/**
 * Helper function to get appropriate title for visualization type
 */
export function getVisualizationTitle(type) {
  switch (type?.toLowerCase()) {
    case 'array':
      return 'Array Visualization';
    case 'string':
    case 'strings':
    case 'substring':
    case 'text':
      return 'String Visualization';
    case 'hashmap':
    case 'hash_map':
    case 'map':
      return 'HashMap Visualization';
    case 'dp':
    case 'dp_table':
    case 'dynamic_programming':
      return 'DP Table Visualization';
    case 'tree':
      return 'Tree Visualization';
    case 'graph':
      return 'Graph Visualization';
    case 'linkedlist':
    case 'linked_list':
      return 'Linked List Visualization';
    case 'stack':
      return 'Stack Visualization';
    case 'queue':
      return 'Queue Visualization';
    case 'recursion':
      return 'Recursion Visualization';
    case 'window':
      return 'Sliding Window Visualization';
    case 'pointers':
      return 'Two Pointers Visualization';
    case 'hybrid':
      return 'Hybrid Visualization';
    case 'results':
      return 'Algorithm Results';
    default:
      return `${type || 'Unknown'} Visualization`;
  }
}

/**
 * Helper function to get appropriate mode for visualization type
 */
export function getVisualizationMode(type) {
  switch (type?.toLowerCase()) {
    case 'window':
      return 'window';
    case 'pointers':
      return 'pointers';
    case 'dp':
    case 'dp_table':
    case 'dynamic_programming':
      return 'dp';
    default:
      return 'default';
  }
}
