import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ArrayVisualizer from '../../components/visualizers/ArrayVisualizer';
import TreeVisualizer from '../../components/visualizers/TreeVisualizer';
import GraphVisualizer from '../../components/visualizers/GraphVisualizer';
import LinkedListVisualizer from '../../components/visualizers/LinkedListVisualizer';
import StackQueueVisualizer from '../../components/visualizers/StackQueueVisualizer';
import RecursionVisualizer from '../../components/visualizers/RecursionVisualizer';

// Mock performance APIs that might not be available in test environment
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => [])
  }
});

describe('Visual Regression Tests', () => {
  describe('ArrayVisualizer Snapshots', () => {
    it('should render basic array visualization consistently', () => {
      const data = {
        arrays: [{
          name: 'Test Array',
          values: [1, 2, 3, 4, 5],
          highlights: {}
        }]
      };

      const { container } = render(<ArrayVisualizer data={data} />);
      expect(container.firstChild).toMatchSnapshot('array-basic');
    });

    it('should render array with window highlighting consistently', () => {
      const data = {
        arrays: [{
          name: 'Sliding Window',
          values: [1, 2, 3, 4, 5, 6, 7, 8],
          highlights: {
            window: { start: 2, end: 5 },
            current: [3]
          }
        }]
      };

      const { container } = render(<ArrayVisualizer data={data} />);
      expect(container.firstChild).toMatchSnapshot('array-sliding-window');
    });

    it('should render array with pointers consistently', () => {
      const data = {
        arrays: [{
          name: 'Two Pointers',
          values: [1, 2, 3, 4, 5],
          highlights: {}
        }],
        pointers: [
          { name: 'left', position: 0, color: '#ff0000' },
          { name: 'right', position: 4, color: '#00ff00' }
        ]
      };

      const { container } = render(<ArrayVisualizer data={data} />);
      expect(container.firstChild).toMatchSnapshot('array-two-pointers');
    });

    it('should render multiple arrays consistently', () => {
      const data = {
        arrays: [
          {
            name: 'Array 1',
            values: [1, 3, 5],
            highlights: { current: [1] }
          },
          {
            name: 'Array 2', 
            values: [2, 4, 6],
            highlights: { current: [0] }
          }
        ]
      };

      const { container } = render(<ArrayVisualizer data={data} />);
      expect(container.firstChild).toMatchSnapshot('array-multiple');
    });

    it('should render sorting visualization consistently', () => {
      const data = {
        arrays: [{
          name: 'Sorting Array',
          values: [5, 2, 8, 1, 9],
          highlights: {
            comparison: [1, 3],
            sorted: [0],
            swaps: 5,
            comparisons: 12
          }
        }],
        operations: [{
          type: 'swap',
          indices: [1, 3],
          description: 'Swapping 2 and 1'
        }]
      };

      const { container } = render(<ArrayVisualizer data={data} />);
      expect(container.firstChild).toMatchSnapshot('array-sorting');
    });
  });

  describe('TreeVisualizer Snapshots', () => {
    it('should render basic binary tree consistently', () => {
      const data = {
        nodes: [
          { id: '1', value: 1, x: 300, y: 50, state: 'normal' },
          { id: '2', value: 2, x: 200, y: 150, state: 'normal' },
          { id: '3', value: 3, x: 400, y: 150, state: 'normal' },
          { id: '4', value: 4, x: 150, y: 250, state: 'normal' },
          { id: '5', value: 5, x: 250, y: 250, state: 'normal' }
        ],
        edges: [
          { from: '1', to: '2', state: 'normal' },
          { from: '1', to: '3', state: 'normal' },
          { from: '2', to: '4', state: 'normal' },
          { from: '2', to: '5', state: 'normal' }
        ],
        treeType: 'binary'
      };

      const { container } = render(<TreeVisualizer data={data} />);
      expect(container.firstChild).toMatchSnapshot('tree-binary-basic');
    });

    it('should render tree traversal consistently', () => {
      const data = {
        nodes: [
          { id: '1', value: 1, x: 300, y: 50, state: 'visited' },
          { id: '2', value: 2, x: 200, y: 150, state: 'current' },
          { id: '3', value: 3, x: 400, y: 150, state: 'normal' }
        ],
        edges: [
          { from: '1', to: '2', state: 'traversed' },
          { from: '1', to: '3', state: 'normal' }
        ],
        traversalPath: ['1', '2'],
        currentNode: '2',
        treeType: 'binary'
      };

      const { container } = render(<TreeVisualizer data={data} />);
      expect(container.firstChild).toMatchSnapshot('tree-traversal');
    });

    it('should render BST with search path consistently', () => {
      const data = {
        nodes: [
          { id: '5', value: 5, x: 300, y: 50, state: 'visited' },
          { id: '3', value: 3, x: 200, y: 150, state: 'visited' },
          { id: '7', value: 7, x: 400, y: 150, state: 'normal' },
          { id: '2', value: 2, x: 150, y: 250, state: 'current' },
          { id: '4', value: 4, x: 250, y: 250, state: 'normal' }
        ],
        edges: [
          { from: '5', to: '3', state: 'traversed' },
          { from: '5', to: '7', state: 'normal' },
          { from: '3', to: '2', state: 'traversed' },
          { from: '3', to: '4', state: 'normal' }
        ],
        treeType: 'bst',
        searchTarget: 2
      };

      const { container } = render(<TreeVisualizer data={data} />);
      expect(container.firstChild).toMatchSnapshot('tree-bst-search');
    });
  });

  describe('GraphVisualizer Snapshots', () => {
    it('should render undirected graph consistently', () => {
      const data = {
        vertices: [
          { id: 'A', label: 'A', x: 100, y: 100, state: 'normal' },
          { id: 'B', label: 'B', x: 300, y: 100, state: 'normal' },
          { id: 'C', label: 'C', x: 200, y: 250, state: 'normal' }
        ],
        edges: [
          { from: 'A', to: 'B', weight: 1, state: 'normal' },
          { from: 'B', to: 'C', weight: 2, state: 'normal' },
          { from: 'A', to: 'C', weight: 3, state: 'normal' }
        ],
        directed: false
      };

      const { container } = render(<GraphVisualizer data={data} />);
      expect(container.firstChild).toMatchSnapshot('graph-undirected');
    });

    it('should render DFS traversal consistently', () => {
      const data = {
        vertices: [
          { id: 'A', label: 'A', x: 100, y: 100, state: 'visited' },
          { id: 'B', label: 'B', x: 300, y: 100, state: 'current' },
          { id: 'C', label: 'C', x: 200, y: 250, state: 'unvisited' }
        ],
        edges: [
          { from: 'A', to: 'B', state: 'traversed' },
          { from: 'B', to: 'C', state: 'normal' },
          { from: 'A', to: 'C', state: 'normal' }
        ],
        algorithm: 'dfs',
        visitedOrder: ['A', 'B'],
        currentVertex: 'B',
        directed: false
      };

      const { container } = render(<GraphVisualizer data={data} />);
      expect(container.firstChild).toMatchSnapshot('graph-dfs-traversal');
    });

    it('should render shortest path consistently', () => {
      const data = {
        vertices: [
          { id: 'A', label: 'A', x: 100, y: 100, state: 'normal', distance: 0 },
          { id: 'B', label: 'B', x: 300, y: 100, state: 'normal', distance: 1 },
          { id: 'C', label: 'C', x: 200, y: 250, state: 'normal', distance: 2 }
        ],
        edges: [
          { from: 'A', to: 'B', weight: 1, state: 'shortest_path' },
          { from: 'B', to: 'C', weight: 1, state: 'shortest_path' },
          { from: 'A', to: 'C', weight: 5, state: 'normal' }
        ],
        algorithm: 'dijkstra',
        directed: false
      };

      const { container } = render(<GraphVisualizer data={data} />);
      expect(container.firstChild).toMatchSnapshot('graph-shortest-path');
    });
  });

  describe('LinkedListVisualizer Snapshots', () => {
    it('should render singly linked list consistently', () => {
      const data = {
        nodes: [
          { id: '1', value: 1, next: '2', state: 'normal' },
          { id: '2', value: 2, next: '3', state: 'normal' },
          { id: '3', value: 3, next: null, state: 'normal' }
        ],
        head: '1',
        listType: 'singly'
      };

      const { container } = render(<LinkedListVisualizer data={data} />);
      expect(container.firstChild).toMatchSnapshot('linkedlist-singly');
    });

    it('should render doubly linked list consistently', () => {
      const data = {
        nodes: [
          { id: '1', value: 1, next: '2', prev: null, state: 'normal' },
          { id: '2', value: 2, next: '3', prev: '1', state: 'current' },
          { id: '3', value: 3, next: null, prev: '2', state: 'normal' }
        ],
        head: '1',
        tail: '3',
        current: '2',
        listType: 'doubly'
      };

      const { container } = render(<LinkedListVisualizer data={data} />);
      expect(container.firstChild).toMatchSnapshot('linkedlist-doubly');
    });

    it('should render linked list insertion consistently', () => {
      const data = {
        nodes: [
          { id: '1', value: 1, next: '2', state: 'normal' },
          { id: '2', value: 2, next: '4', state: 'normal' },
          { id: '3', value: 3, next: '4', state: 'inserting' },
          { id: '4', value: 4, next: null, state: 'normal' }
        ],
        head: '1',
        operation: {
          type: 'insert',
          position: 2,
          newNode: '3'
        },
        listType: 'singly'
      };

      const { container } = render(<LinkedListVisualizer data={data} />);
      expect(container.firstChild).toMatchSnapshot('linkedlist-insertion');
    });
  });

  describe('StackQueueVisualizer Snapshots', () => {
    it('should render stack consistently', () => {
      const data = {
        type: 'stack',
        elements: [
          { value: 1, state: 'normal' },
          { value: 2, state: 'normal' },
          { value: 3, state: 'top' }
        ],
        operation: {
          type: 'push',
          element: 4
        }
      };

      const { container } = render(<StackQueueVisualizer data={data} />);
      expect(container.firstChild).toMatchSnapshot('stack-basic');
    });

    it('should render queue consistently', () => {
      const data = {
        type: 'queue',
        elements: [
          { value: 1, state: 'front' },
          { value: 2, state: 'normal' },
          { value: 3, state: 'rear' }
        ],
        operation: {
          type: 'enqueue',
          element: 4
        }
      };

      const { container } = render(<StackQueueVisualizer data={data} />);
      expect(container.firstChild).toMatchSnapshot('queue-basic');
    });

    it('should render priority queue consistently', () => {
      const data = {
        type: 'priority_queue',
        elements: [
          { value: 10, priority: 1, state: 'normal' },
          { value: 20, priority: 2, state: 'normal' },
          { value: 5, priority: 0, state: 'highest' }
        ],
        operation: {
          type: 'insert',
          element: { value: 15, priority: 1.5 }
        }
      };

      const { container } = render(<StackQueueVisualizer data={data} />);
      expect(container.firstChild).toMatchSnapshot('priority-queue');
    });
  });

  describe('RecursionVisualizer Snapshots', () => {
    it('should render recursion call stack consistently', () => {
      const data = {
        callStack: [
          {
            function: 'fibonacci',
            parameters: { n: 5 },
            level: 0,
            state: 'completed',
            returnValue: 5
          },
          {
            function: 'fibonacci',
            parameters: { n: 4 },
            level: 1,
            state: 'completed',
            returnValue: 3
          },
          {
            function: 'fibonacci',
            parameters: { n: 3 },
            level: 2,
            state: 'active',
            returnValue: null
          }
        ],
        recursionTree: {
          nodes: [
            { id: 'fib(5)', value: 'fib(5)', level: 0, state: 'completed' },
            { id: 'fib(4)', value: 'fib(4)', level: 1, state: 'completed' },
            { id: 'fib(3)', value: 'fib(3)', level: 2, state: 'active' },
            { id: 'fib(2)', value: 'fib(2)', level: 3, state: 'pending' },
            { id: 'fib(1)', value: 'fib(1)', level: 3, state: 'pending' }
          ],
          edges: [
            { from: 'fib(5)', to: 'fib(4)' },
            { from: 'fib(5)', to: 'fib(3)' },
            { from: 'fib(4)', to: 'fib(3)' },
            { from: 'fib(4)', to: 'fib(2)' },
            { from: 'fib(3)', to: 'fib(2)' },
            { from: 'fib(3)', to: 'fib(1)' }
          ]
        }
      };

      const { container } = render(<RecursionVisualizer data={data} />);
      expect(container.firstChild).toMatchSnapshot('recursion-fibonacci');
    });

    it('should render backtracking visualization consistently', () => {
      const data = {
        callStack: [
          {
            function: 'solve',
            parameters: { board: [[1, 0], [0, 1]], row: 0 },
            level: 0,
            state: 'active'
          },
          {
            function: 'solve',
            parameters: { board: [[1, 0], [0, 1]], row: 1 },
            level: 1,
            state: 'backtracking'
          }
        ],
        decisionTree: {
          nodes: [
            { id: 'root', value: 'Start', state: 'normal' },
            { id: 'choice1', value: 'Place Queen', state: 'tried' },
            { id: 'choice2', value: 'Backtrack', state: 'current' }
          ],
          edges: [
            { from: 'root', to: 'choice1' },
            { from: 'choice1', to: 'choice2' }
          ]
        }
      };

      const { container } = render(<RecursionVisualizer data={data} />);
      expect(container.firstChild).toMatchSnapshot('recursion-backtracking');
    });
  });

  describe('Error State Snapshots', () => {
    it('should render array error state consistently', () => {
      const { container } = render(<ArrayVisualizer data={null} />);
      expect(container.firstChild).toMatchSnapshot('array-error-state');
    });

    it('should render tree error state consistently', () => {
      const { container } = render(<TreeVisualizer data={{}} />);
      expect(container.firstChild).toMatchSnapshot('tree-error-state');
    });

    it('should render graph error state consistently', () => {
      const { container } = render(<GraphVisualizer data={{ vertices: [] }} />);
      expect(container.firstChild).toMatchSnapshot('graph-error-state');
    });
  });

  describe('Responsive Design Snapshots', () => {
    it('should render array visualization in mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const data = {
        arrays: [{
          name: 'Mobile Array',
          values: [1, 2, 3, 4, 5],
          highlights: { current: [2] }
        }]
      };

      const { container } = render(<ArrayVisualizer data={data} />);
      expect(container.firstChild).toMatchSnapshot('array-mobile');
    });

    it('should render tree visualization in tablet viewport', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const data = {
        nodes: [
          { id: '1', value: 1, x: 200, y: 50, state: 'normal' },
          { id: '2', value: 2, x: 100, y: 150, state: 'normal' },
          { id: '3', value: 3, x: 300, y: 150, state: 'normal' }
        ],
        edges: [
          { from: '1', to: '2', state: 'normal' },
          { from: '1', to: '3', state: 'normal' }
        ],
        treeType: 'binary'
      };

      const { container } = render(<TreeVisualizer data={data} />);
      expect(container.firstChild).toMatchSnapshot('tree-tablet');
    });
  });
});  describe(
'Algorithm-Specific Visual Tests', () => {
    it('should render dynamic programming visualization consistently', () => {
      const dpData = {
        arrays: [{
          name: 'DP Table',
          values: [0, 1, 1, 2, 3, 5, 8, 13],
          highlights: {
            current: [5],
            computed: [0, 1, 2, 3, 4],
            dependencies: [3, 4]
          }
        }],
        operations: [{
          type: 'compute',
          indices: [5],
          description: 'dp[5] = dp[3] + dp[4] = 2 + 3 = 5'
        }]
      };

      const { container } = render(<ArrayVisualizer data={dpData} />);
      expect(container.firstChild).toMatchSnapshot('dp-fibonacci-table');
    });

    it('should render sorting algorithm steps consistently', () => {
      const sortingData = {
        arrays: [{
          name: 'Bubble Sort',
          values: [64, 34, 25, 12, 22, 11, 90],
          highlights: {
            comparison: [0, 1],
            sorted: [6],
            swaps: 15,
            comparisons: 21
          }
        }],
        operations: [{
          type: 'swap',
          indices: [0, 1],
          description: 'Swapping 64 and 34'
        }]
      };

      const { container } = render(<ArrayVisualizer data={sortingData} />);
      expect(container.firstChild).toMatchSnapshot('bubble-sort-step');
    });

    it('should render backtracking visualization consistently', () => {
      const backtrackingData = {
        callStack: [
          {
            function: 'solveNQueens',
            parameters: { row: 0, board: [[0, 0, 0, 0]] },
            level: 0,
            state: 'active'
          },
          {
            function: 'solveNQueens',
            parameters: { row: 1, board: [[1, 0, 0, 0]] },
            level: 1,
            state: 'backtracking'
          }
        ],
        decisionTree: {
          nodes: [
            { id: 'root', value: 'Start', state: 'normal' },
            { id: 'try0', value: 'Try Col 0', state: 'tried' },
            { id: 'try1', value: 'Try Col 1', state: 'current' },
            { id: 'backtrack', value: 'Backtrack', state: 'backtracking' }
          ],
          edges: [
            { from: 'root', to: 'try0' },
            { from: 'try0', to: 'try1' },
            { from: 'try1', to: 'backtrack' }
          ]
        }
      };

      const { container } = render(<RecursionVisualizer data={backtrackingData} />);
      expect(container.firstChild).toMatchSnapshot('n-queens-backtracking');
    });

    it('should render graph algorithm states consistently', () => {
      const dijkstraData = {
        vertices: [
          { id: 'A', label: 'A', x: 100, y: 100, state: 'visited', distance: 0 },
          { id: 'B', label: 'B', x: 300, y: 100, state: 'current', distance: 4 },
          { id: 'C', label: 'C', x: 200, y: 250, state: 'unvisited', distance: Infinity },
          { id: 'D', label: 'D', x: 400, y: 250, state: 'unvisited', distance: 7 }
        ],
        edges: [
          { from: 'A', to: 'B', weight: 4, state: 'shortest_path' },
          { from: 'B', to: 'C', weight: 2, state: 'exploring' },
          { from: 'B', to: 'D', weight: 3, state: 'normal' },
          { from: 'A', to: 'C', weight: 8, state: 'normal' }
        ],
        algorithm: 'dijkstra',
        currentVertex: 'B',
        shortestPath: ['A', 'B'],
        directed: true
      };

      const { container } = render(<GraphVisualizer data={dijkstraData} />);
      expect(container.firstChild).toMatchSnapshot('dijkstra-algorithm');
    });

    it('should render complex tree operations consistently', () => {
      const bstData = {
        nodes: [
          { id: '5', value: 5, x: 300, y: 50, state: 'normal' },
          { id: '3', value: 3, x: 200, y: 150, state: 'normal' },
          { id: '7', value: 7, x: 400, y: 150, state: 'normal' },
          { id: '2', value: 2, x: 150, y: 250, state: 'normal' },
          { id: '4', value: 4, x: 250, y: 250, state: 'inserting' },
          { id: '6', value: 6, x: 350, y: 250, state: 'normal' },
          { id: '8', value: 8, x: 450, y: 250, state: 'normal' }
        ],
        edges: [
          { from: '5', to: '3', state: 'normal' },
          { from: '5', to: '7', state: 'normal' },
          { from: '3', to: '2', state: 'normal' },
          { from: '3', to: '4', state: 'inserting' },
          { from: '7', to: '6', state: 'normal' },
          { from: '7', to: '8', state: 'normal' }
        ],
        treeType: 'bst',
        operation: {
          type: 'insert',
          value: 4,
          path: ['5', '3', '4']
        }
      };

      const { container } = render(<TreeVisualizer data={bstData} />);
      expect(container.firstChild).toMatchSnapshot('bst-insertion');
    });
  });

  describe('Edge Case Visual Tests', () => {
    it('should render empty data states consistently', () => {
      const emptyArrayData = {
        arrays: [{
          name: 'Empty Array',
          values: [],
          highlights: {}
        }]
      };

      const { container } = render(<ArrayVisualizer data={emptyArrayData} />);
      expect(container.firstChild).toMatchSnapshot('empty-array');
    });

    it('should render single element data consistently', () => {
      const singleElementData = {
        arrays: [{
          name: 'Single Element',
          values: [42],
          highlights: { current: [0] }
        }]
      };

      const { container } = render(<ArrayVisualizer data={singleElementData} />);
      expect(container.firstChild).toMatchSnapshot('single-element-array');
    });

    it('should render error states consistently', () => {
      const { container } = render(<ArrayVisualizer data={null} />);
      expect(container.firstChild).toMatchSnapshot('array-error-null-data');
    });

    it('should render malformed data consistently', () => {
      const malformedData = {
        arrays: 'not an array'
      };

      const { container } = render(<ArrayVisualizer data={malformedData} />);
      expect(container.firstChild).toMatchSnapshot('array-malformed-data');
    });

    it('should render very large numbers consistently', () => {
      const largeNumberData = {
        arrays: [{
          name: 'Large Numbers',
          values: [1000000, 999999999, 1.23e10, -5000000],
          highlights: { current: [2] }
        }]
      };

      const { container } = render(<ArrayVisualizer data={largeNumberData} />);
      expect(container.firstChild).toMatchSnapshot('large-numbers-array');
    });
  });

  describe('Animation State Visual Tests', () => {
    it('should render mid-animation states consistently', () => {
      const animatingData = {
        arrays: [{
          name: 'Animating Array',
          values: [5, 2, 8, 1, 9],
          highlights: {
            comparison: [1, 3],
            animating: true,
            swapInProgress: { from: 1, to: 3 }
          }
        }],
        operations: [{
          type: 'swap',
          indices: [1, 3],
          description: 'Swapping 2 and 1',
          progress: 0.5
        }]
      };

      const { container } = render(<ArrayVisualizer data={animatingData} />);
      expect(container.firstChild).toMatchSnapshot('mid-animation-swap');
    });

    it('should render paused animation states consistently', () => {
      const pausedData = {
        nodes: [
          { id: '1', value: 1, x: 300, y: 50, state: 'current' },
          { id: '2', value: 2, x: 200, y: 150, state: 'visiting' },
          { id: '3', value: 3, x: 400, y: 150, state: 'normal' }
        ],
        edges: [
          { from: '1', to: '2', state: 'traversing' },
          { from: '1', to: '3', state: 'normal' }
        ],
        treeType: 'binary',
        animationState: 'paused',
        currentNode: '2'
      };

      const { container } = render(<TreeVisualizer data={pausedData} />);
      expect(container.firstChild).toMatchSnapshot('paused-tree-traversal');
    });
  });

  describe('Theme and Accessibility Visual Tests', () => {
    it('should render high contrast mode consistently', () => {
      const highContrastData = {
        arrays: [{
          name: 'High Contrast Array',
          values: [1, 2, 3, 4, 5],
          highlights: { current: [2] }
        }]
      };

      const HighContrastWrapper = ({ children }) => (
        <div className="high-contrast-theme">
          {children}
        </div>
      );

      const { container } = render(
        <HighContrastWrapper>
          <ArrayVisualizer data={highContrastData} />
        </HighContrastWrapper>
      );
      expect(container.firstChild).toMatchSnapshot('high-contrast-array');
    });

    it('should render focus states consistently', () => {
      const focusData = {
        arrays: [{
          name: 'Focused Array',
          values: [1, 2, 3, 4, 5],
          highlights: { 
            current: [2],
            focused: [2]
          }
        }]
      };

      const { container } = render(<ArrayVisualizer data={focusData} />);
      
      // Simulate focus on element
      const element = container.querySelector('[data-index="2"]');
      if (element) {
        element.focus();
      }
      
      expect(container.firstChild).toMatchSnapshot('focused-array-element');
    });
  });