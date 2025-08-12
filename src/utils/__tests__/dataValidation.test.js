import { describe, it, expect, beforeEach } from 'vitest';
import { 
  validateVisualizationData, 
  generateFallbackData, 
  sanitizeVisualizationData,
  ArrayDataValidator,
  TreeDataValidator,
  GraphDataValidator
} from '../dataValidation';

describe('validateVisualizationData', () => {
  describe('Array Data Validation', () => {
    it('should validate correct array data', () => {
      const data = {
        arrays: [{
          name: 'Test Array',
          values: [1, 2, 3, 4, 5],
          highlights: {
            current: [0],
            window: { start: 1, end: 3 }
          }
        }],
        pointers: [{
          name: 'left',
          position: 0,
          color: '#ff0000'
        }],
        operations: [{
          type: 'swap',
          indices: [0, 4],
          description: 'Swapping elements'
        }]
      };

      const result = validateVisualizationData(data, 'array');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitizedData).toEqual(data);
    });

    it('should detect missing arrays property', () => {
      const data = {
        pointers: [],
        operations: []
      };

      const result = validateVisualizationData(data, 'array');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('arrays: is required but was undefined');
    });

    it('should detect invalid array structure', () => {
      const data = {
        arrays: 'not an array'
      };

      const result = validateVisualizationData(data, 'array');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('arrays: must be an array but was string');
    });

    it('should detect out-of-bounds window indices', () => {
      const data = {
        arrays: [{
          name: 'Test Array',
          values: [1, 2, 3],
          highlights: {
            window: { start: 0, end: 5 } // end is out of bounds
          }
        }]
      };

      const result = validateVisualizationData(data, 'array');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('arrays[0].highlights.window: Window indices out of bounds (array length: 3)');
    });

    it('should detect invalid window range', () => {
      const data = {
        arrays: [{
          name: 'Test Array',
          values: [1, 2, 3, 4, 5],
          highlights: {
            window: { start: 3, end: 1 } // start > end
          }
        }]
      };

      const result = validateVisualizationData(data, 'array');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('arrays[0].highlights.window: Window start index cannot be greater than end index');
      expect(result.pitfalls).toContain('Invalid window range detected - ensure start <= end');
    });

    it('should detect edge cases', () => {
      const data = {
        arrays: [{
          name: 'Empty Array',
          values: [],
          highlights: {}
        }]
      };

      const result = validateVisualizationData(data, 'array');

      expect(result.isValid).toBe(true);
      expect(result.edgeCases).toContain('Empty array detected - ensure empty state is handled properly');
    });

    it('should detect single element array edge case', () => {
      const data = {
        arrays: [{
          name: 'Single Element',
          values: [42],
          highlights: {}
        }]
      };

      const result = validateVisualizationData(data, 'array');

      expect(result.isValid).toBe(true);
      expect(result.edgeCases).toContain('Array 0 has only one element - ensure single-element algorithms work correctly');
    });

    it('should detect all identical elements', () => {
      const data = {
        arrays: [{
          name: 'Identical Elements',
          values: [5, 5, 5, 5, 5],
          highlights: {}
        }]
      };

      const result = validateVisualizationData(data, 'array');

      expect(result.isValid).toBe(true);
      expect(result.edgeCases).toContain('Array 0 has all identical elements - may affect sorting/searching algorithms');
    });

    it('should detect already sorted arrays', () => {
      const data = {
        arrays: [{
          name: 'Sorted Array',
          values: [1, 2, 3, 4, 5],
          highlights: {}
        }]
      };

      const result = validateVisualizationData(data, 'array');

      expect(result.isValid).toBe(true);
      expect(result.edgeCases).toContain('Array 0 is already sorted in ascending order');
    });

    it('should detect large arrays performance warning', () => {
      const data = {
        arrays: [{
          name: 'Large Array',
          values: new Array(1500).fill(0).map((_, i) => i),
          highlights: {}
        }]
      };

      const result = validateVisualizationData(data, 'array');

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('arrays[0].values: Large array with 1500 elements may impact performance');
      expect(result.pitfalls).toContain('Large datasets can cause rendering performance issues - consider virtualization');
    });

    it('should validate pointer positions', () => {
      const data = {
        arrays: [{
          name: 'Test Array',
          values: [1, 2, 3],
          highlights: {}
        }],
        pointers: [{
          name: 'invalid',
          position: 5, // out of bounds
          color: '#ff0000'
        }]
      };

      const result = validateVisualizationData(data, 'array');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('pointers[0].position: Position 5 out of bounds (max: 2)');
    });

    it('should detect pointer collisions', () => {
      const data = {
        arrays: [{
          name: 'Test Array',
          values: [1, 2, 3],
          highlights: {}
        }],
        pointers: [
          { name: 'left', position: 1, color: '#ff0000' },
          { name: 'right', position: 1, color: '#00ff00' }
        ]
      };

      const result = validateVisualizationData(data, 'array');

      expect(result.isValid).toBe(true);
      expect(result.edgeCases).toContain('Multiple pointers at position 1 - ensure proper visual handling');
    });

    it('should validate operation types and indices', () => {
      const data = {
        arrays: [{
          name: 'Test Array',
          values: [1, 2, 3],
          highlights: {}
        }],
        operations: [{
          type: 'swap',
          indices: [0] // swap needs 2 indices
        }]
      };

      const result = validateVisualizationData(data, 'array');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('operations[0].indices: Swap operation must have exactly 2 indices');
    });
  });

  describe('Tree Data Validation', () => {
    it('should validate correct tree data', () => {
      const data = {
        nodes: [
          { id: '1', value: 1, x: 500, y: 50, state: 'normal' },
          { id: '2', value: 2, x: 400, y: 150, state: 'visited' }
        ],
        edges: [
          { from: '1', to: '2', state: 'normal' }
        ],
        traversalPath: ['1', '2'],
        currentNode: '2',
        treeType: 'binary'
      };

      const result = validateVisualizationData(data, 'tree');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing nodes property', () => {
      const data = {
        edges: [],
        traversalPath: []
      };

      const result = validateVisualizationData(data, 'tree');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('nodes: is required but was undefined');
    });

    it('should detect invalid node structure', () => {
      const data = {
        nodes: [
          { id: '1', value: 1 },
          'invalid node' // not an object
        ]
      };

      const result = validateVisualizationData(data, 'tree');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('nodes[1]: must be an object');
    });

    it('should detect missing node IDs', () => {
      const data = {
        nodes: [
          { value: 1 } // missing id
        ]
      };

      const result = validateVisualizationData(data, 'tree');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('nodes[0].id: is required but was undefined');
    });

    it('should detect edges referencing non-existent nodes', () => {
      const data = {
        nodes: [
          { id: '1', value: 1 }
        ],
        edges: [
          { from: '1', to: '999' } // node 999 doesn't exist
        ]
      };

      const result = validateVisualizationData(data, 'tree');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('edges[0].to: References non-existent node: 999');
    });

    it('should detect self-loops', () => {
      const data = {
        nodes: [
          { id: '1', value: 1 }
        ],
        edges: [
          { from: '1', to: '1' } // self-loop
        ]
      };

      const result = validateVisualizationData(data, 'tree');

      expect(result.isValid).toBe(true);
      expect(result.edgeCases).toContain('Self-loop detected - ensure proper handling');
    });

    it('should detect empty tree edge case', () => {
      const data = {
        nodes: [],
        edges: []
      };

      const result = validateVisualizationData(data, 'tree');

      expect(result.isValid).toBe(true);
      expect(result.edgeCases).toContain('Empty tree - ensure empty state is handled properly');
    });

    it('should detect single node tree', () => {
      const data = {
        nodes: [
          { id: '1', value: 1 }
        ],
        edges: []
      };

      const result = validateVisualizationData(data, 'tree');

      expect(result.isValid).toBe(true);
      expect(result.edgeCases).toContain('Single node tree - ensure single-node algorithms work correctly');
    });

    it('should detect disconnected nodes', () => {
      const data = {
        nodes: [
          { id: '1', value: 1 },
          { id: '2', value: 2 },
          { id: '3', value: 3 } // disconnected
        ],
        edges: [
          { from: '1', to: '2' }
        ]
      };

      const result = validateVisualizationData(data, 'tree');

      expect(result.isValid).toBe(true);
      expect(result.edgeCases).toContain('1 disconnected nodes detected');
    });

    it('should detect multiple roots', () => {
      const data = {
        nodes: [
          { id: '1', value: 1 },
          { id: '2', value: 2 },
          { id: '3', value: 3 }
        ],
        edges: [
          { from: '2', to: '3' } // 1 and 2 are both roots
        ]
      };

      const result = validateVisualizationData(data, 'tree');

      expect(result.isValid).toBe(true);
      expect(result.edgeCases).toContain('Multiple root nodes detected (2) - may indicate forest structure');
    });

    it('should validate BST property for BST trees', () => {
      const data = {
        nodes: [
          { id: '1', value: 5 },
          { id: '2', value: 10 }, // should be < 5 for left child
          { id: '3', value: 3 }
        ],
        edges: [
          { from: '1', to: '2' }, // left child
          { from: '1', to: '3' }  // right child
        ],
        treeType: 'bst'
      };

      const result = validateVisualizationData(data, 'tree');

      expect(result.isValid).toBe(true);
      expect(result.pitfalls).toContain('BST property violations detected - tree may not be a valid BST');
    });

    it('should detect binary tree with more than 2 children', () => {
      const data = {
        nodes: [
          { id: '1', value: 1 },
          { id: '2', value: 2 },
          { id: '3', value: 3 },
          { id: '4', value: 4 }
        ],
        edges: [
          { from: '1', to: '2' },
          { from: '1', to: '3' },
          { from: '1', to: '4' } // 3 children in binary tree
        ],
        treeType: 'binary'
      };

      const result = validateVisualizationData(data, 'tree');

      expect(result.isValid).toBe(true);
      expect(result.pitfalls).toContain('Node 1 has 3 children in binary tree');
    });
  });

  describe('Graph Data Validation', () => {
    it('should validate correct graph data', () => {
      const data = {
        vertices: [
          { id: 'A', label: 'A', x: 100, y: 100, state: 'unvisited' },
          { id: 'B', label: 'B', x: 200, y: 100, state: 'visited' }
        ],
        edges: [
          { from: 'A', to: 'B', weight: 1, state: 'normal' }
        ],
        algorithm: 'dfs',
        directed: false
      };

      const result = validateVisualizationData(data, 'graph');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing vertices property', () => {
      const data = {
        edges: [],
        algorithm: 'dfs'
      };

      const result = validateVisualizationData(data, 'graph');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('vertices: is required but was undefined');
    });

    it('should detect edges referencing non-existent vertices', () => {
      const data = {
        vertices: [
          { id: 'A', label: 'A' }
        ],
        edges: [
          { from: 'A', to: 'Z' } // vertex Z doesn't exist
        ]
      };

      const result = validateVisualizationData(data, 'graph');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('edges[0].to: References non-existent vertex: Z');
    });

    it('should detect negative weight edges', () => {
      const data = {
        vertices: [
          { id: 'A', label: 'A' },
          { id: 'B', label: 'B' }
        ],
        edges: [
          { from: 'A', to: 'B', weight: -5 }
        ]
      };

      const result = validateVisualizationData(data, 'graph');

      expect(result.isValid).toBe(true);
      expect(result.edgeCases).toContain('Negative weight edge detected - ensure algorithm supports negative weights');
    });

    it('should detect Dijkstra with negative weights pitfall', () => {
      const data = {
        vertices: [
          { id: 'A', label: 'A' },
          { id: 'B', label: 'B' }
        ],
        edges: [
          { from: 'A', to: 'B', weight: -1 }
        ],
        algorithm: 'dijkstra'
      };

      const result = validateVisualizationData(data, 'graph');

      expect(result.isValid).toBe(true);
      expect(result.pitfalls).toContain("Dijkstra's algorithm doesn't work with negative weights - use Bellman-Ford instead");
    });

    it('should detect empty graph edge case', () => {
      const data = {
        vertices: [],
        edges: []
      };

      const result = validateVisualizationData(data, 'graph');

      expect(result.isValid).toBe(true);
      expect(result.edgeCases).toContain('Empty graph - ensure empty state is handled properly');
    });

    it('should detect single vertex graph', () => {
      const data = {
        vertices: [
          { id: 'A', label: 'A' }
        ],
        edges: []
      };

      const result = validateVisualizationData(data, 'graph');

      expect(result.isValid).toBe(true);
      expect(result.edgeCases).toContain('Single vertex graph - ensure single-vertex algorithms work correctly');
    });

    it('should detect complete graph', () => {
      const data = {
        vertices: [
          { id: 'A', label: 'A' },
          { id: 'B', label: 'B' },
          { id: 'C', label: 'C' }
        ],
        edges: [
          { from: 'A', to: 'B' },
          { from: 'A', to: 'C' },
          { from: 'B', to: 'C' }
        ],
        directed: false
      };

      const result = validateVisualizationData(data, 'graph');

      expect(result.isValid).toBe(true);
      expect(result.edgeCases).toContain('Complete graph detected - may affect algorithm performance');
    });

    it('should detect duplicate edges', () => {
      const data = {
        vertices: [
          { id: 'A', label: 'A' },
          { id: 'B', label: 'B' }
        ],
        edges: [
          { from: 'A', to: 'B' },
          { from: 'A', to: 'B' } // duplicate
        ],
        directed: true
      };

      const result = validateVisualizationData(data, 'graph');

      expect(result.isValid).toBe(true);
      expect(result.pitfalls).toContain('Duplicate edges detected: A->B');
    });

    it('should detect missing weights for weighted algorithms', () => {
      const data = {
        vertices: [
          { id: 'A', label: 'A' },
          { id: 'B', label: 'B' }
        ],
        edges: [
          { from: 'A', to: 'B' } // missing weight
        ],
        algorithm: 'dijkstra'
      };

      const result = validateVisualizationData(data, 'graph');

      expect(result.isValid).toBe(true);
      expect(result.pitfalls).toContain('1 edges missing weights for weighted algorithm');
    });
  });

  describe('Generic Validation', () => {
    it('should handle null data', () => {
      const result = validateVisualizationData(null, 'array');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Data is null or undefined');
    });

    it('should handle undefined data', () => {
      const result = validateVisualizationData(undefined, 'tree');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Data is null or undefined');
    });

    it('should handle unknown visualization type', () => {
      const data = { some: 'data' };
      const result = validateVisualizationData(data, 'unknown');

      expect(result.isValid).toBe(true);
      expect(result.sanitizedData).toEqual(data);
    });
  });
});

describe('generateFallbackData', () => {
  it('should generate fallback array data', () => {
    const fallback = generateFallbackData('array');

    expect(fallback).toHaveProperty('arrays');
    expect(fallback.arrays).toHaveLength(1);
    expect(fallback.arrays[0]).toHaveProperty('name', 'Empty Array');
    expect(fallback.arrays[0]).toHaveProperty('values', []);
    expect(fallback).toHaveProperty('pointers', []);
    expect(fallback).toHaveProperty('operations', []);
  });

  it('should generate fallback tree data', () => {
    const fallback = generateFallbackData('tree');

    expect(fallback).toHaveProperty('nodes');
    expect(fallback.nodes).toHaveLength(1);
    expect(fallback.nodes[0]).toHaveProperty('id', 'root');
    expect(fallback.nodes[0]).toHaveProperty('value', 'Empty');
    expect(fallback).toHaveProperty('edges', []);
    expect(fallback).toHaveProperty('treeType', 'binary');
  });

  it('should generate fallback graph data', () => {
    const fallback = generateFallbackData('graph');

    expect(fallback).toHaveProperty('vertices');
    expect(fallback.vertices).toHaveLength(1);
    expect(fallback.vertices[0]).toHaveProperty('id', 'v1');
    expect(fallback.vertices[0]).toHaveProperty('label', 'Empty');
    expect(fallback).toHaveProperty('edges', []);
    expect(fallback).toHaveProperty('directed', false);
  });

  it('should generate generic fallback for unknown types', () => {
    const fallback = generateFallbackData('unknown');

    expect(fallback).toHaveProperty('type', 'unknown');
    expect(fallback).toHaveProperty('message', 'Unknown visualization type');
  });

  it('should include error information when provided', () => {
    const error = new Error('Test error');
    const fallback = generateFallbackData('unknown', error);

    expect(fallback).toHaveProperty('error', 'Test error');
  });
});

describe('sanitizeVisualizationData', () => {
  it('should remove functions from data', () => {
    const data = {
      arrays: [{ name: 'Test', values: [1, 2, 3] }],
      callback: () => console.log('test'), // function should be removed
      nested: {
        func: () => 'nested function' // nested function should be removed
      }
    };

    const sanitized = sanitizeVisualizationData(data, 'array');

    expect(sanitized).not.toHaveProperty('callback');
    expect(sanitized.nested).not.toHaveProperty('func');
    expect(sanitized).toHaveProperty('arrays');
  });

  it('should remove undefined values', () => {
    const data = {
      arrays: [{ name: 'Test', values: [1, 2, 3] }],
      undefinedProp: undefined,
      nested: {
        undefinedNested: undefined,
        validProp: 'valid'
      }
    };

    const sanitized = sanitizeVisualizationData(data, 'array');

    expect(sanitized).not.toHaveProperty('undefinedProp');
    expect(sanitized.nested).not.toHaveProperty('undefinedNested');
    expect(sanitized.nested).toHaveProperty('validProp', 'valid');
  });

  it('should handle null data by generating fallback', () => {
    const sanitized = sanitizeVisualizationData(null, 'array');

    expect(sanitized).toHaveProperty('arrays');
    expect(sanitized.arrays[0]).toHaveProperty('name', 'Empty Array');
  });

  it('should handle non-object data by generating fallback', () => {
    const sanitized = sanitizeVisualizationData('invalid', 'tree');

    expect(sanitized).toHaveProperty('nodes');
    expect(sanitized.nodes[0]).toHaveProperty('value', 'Empty');
  });

  it('should preserve valid data structure', () => {
    const data = {
      arrays: [{
        name: 'Valid Array',
        values: [1, 2, 3, 4, 5],
        highlights: { current: [0] }
      }],
      pointers: [{ name: 'ptr', position: 0, color: '#ff0000' }]
    };

    const sanitized = sanitizeVisualizationData(data, 'array');

    expect(sanitized).toEqual({
      arrays: data.arrays,
      pointers: data.pointers,
      operations: []
    });
  });
});

describe('Individual Validator Classes', () => {
  describe('ArrayDataValidator', () => {
    let validator;

    beforeEach(() => {
      validator = new ArrayDataValidator();
    });

    it('should handle legacy array format', () => {
      const data = {
        array: [1, 2, 3, 4, 5],
        name: 'Legacy Array'
      };

      const result = validator.validate(data);

      expect(result.isValid).toBe(true);
      expect(result.sanitizedData.arrays).toHaveLength(1);
      expect(result.sanitizedData.arrays[0].name).toBe('Legacy Array');
      expect(result.sanitizedData.arrays[0].values).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle direct array format', () => {
      const data = [1, 2, 3, 4, 5];

      const result = validator.validate(data);

      expect(result.isValid).toBe(true);
      expect(result.sanitizedData.arrays).toHaveLength(1);
      expect(result.sanitizedData.arrays[0].name).toBe('Array');
      expect(result.sanitizedData.arrays[0].values).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('TreeDataValidator', () => {
    let validator;

    beforeEach(() => {
      validator = new TreeDataValidator();
    });

    it('should calculate tree depth correctly', () => {
      const nodes = [
        { id: '1', value: 1 },
        { id: '2', value: 2 },
        { id: '3', value: 3 },
        { id: '4', value: 4 }
      ];
      const edges = [
        { from: '1', to: '2' },
        { from: '2', to: '3' },
        { from: '3', to: '4' }
      ];

      const depth = validator.calculateTreeDepth(nodes, edges);
      expect(depth).toBe(4);
    });

    it('should detect very deep trees', () => {
      const nodes = Array.from({ length: 15 }, (_, i) => ({ id: String(i + 1), value: i + 1 }));
      const edges = Array.from({ length: 14 }, (_, i) => ({ from: String(i + 1), to: String(i + 2) }));

      const data = { nodes, edges };
      const result = validator.validate(data);

      expect(result.isValid).toBe(true);
      expect(result.edgeCases).toContain('Very deep tree (depth: 15) - may affect visualization performance');
    });
  });

  describe('GraphDataValidator', () => {
    let validator;

    beforeEach(() => {
      validator = new GraphDataValidator();
    });

    it('should detect connected graphs correctly', () => {
      const vertices = [
        { id: 'A', label: 'A' },
        { id: 'B', label: 'B' },
        { id: 'C', label: 'C' }
      ];
      const edges = [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' }
      ];

      const isConnected = validator.isGraphConnected(vertices, edges, false);
      expect(isConnected).toBe(true);
    });

    it('should detect disconnected graphs correctly', () => {
      const vertices = [
        { id: 'A', label: 'A' },
        { id: 'B', label: 'B' },
        { id: 'C', label: 'C' }
      ];
      const edges = [
        { from: 'A', to: 'B' }
        // C is disconnected
      ];

      const isConnected = validator.isGraphConnected(vertices, edges, false);
      expect(isConnected).toBe(false);
    });

    it('should detect cycles in directed graphs', () => {
      const vertices = [
        { id: 'A', label: 'A' },
        { id: 'B', label: 'B' },
        { id: 'C', label: 'C' }
      ];
      const edges = [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
        { from: 'C', to: 'A' } // creates cycle
      ];

      const hasCycles = validator.hasCycles(vertices, edges);
      expect(hasCycles).toBe(true);
    });

    it('should not detect cycles in acyclic directed graphs', () => {
      const vertices = [
        { id: 'A', label: 'A' },
        { id: 'B', label: 'B' },
        { id: 'C', label: 'C' }
      ];
      const edges = [
        { from: 'A', to: 'B' },
        { from: 'A', to: 'C' }
      ];

      const hasCycles = validator.hasCycles(vertices, edges);
      expect(hasCycles).toBe(false);
    });
  });
});