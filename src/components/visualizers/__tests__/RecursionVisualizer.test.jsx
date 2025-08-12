import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import RecursionVisualizer from '../RecursionVisualizer';

// Mock BaseVisualizer
vi.mock('../BaseVisualizer', () => ({
  default: ({ children, title }) => (
    <div data-testid="base-visualizer">
      <h3>{title}</h3>
      {children}
    </div>
  ),
  withErrorBoundary: (Component) => Component,
  VisualizerUtils: {
    validateData: vi.fn(),
    formatValue: (value) => {
      if (value === null || value === undefined) return 'null';
      if (typeof value === 'string') return `"${value}"`;
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    }
  }
}));

describe('RecursionVisualizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Basic Rendering', () => {
    it('should render with minimal call stack data', () => {
      const data = {
        callStack: [
          {
            function: 'factorial',
            params: { n: 3 },
            level: 0,
            state: 'active'
          }
        ]
      };
      
      render(<RecursionVisualizer data={data} />);
      
      expect(screen.getByTestId('base-visualizer')).toBeInTheDocument();
      expect(screen.getByText('📚')).toBeInTheDocument();
      expect(screen.getByText('Call Stack')).toBeInTheDocument();
      expect(screen.getByText('factorial')).toBeInTheDocument();
      expect(screen.getByText('Level 0')).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      const data = {
        callStack: []
      };
      const title = 'Custom Recursion Visualization';
      
      render(<RecursionVisualizer data={data} title={title} />);
      
      expect(screen.getByText(title)).toBeInTheDocument();
    });

    it('should render empty call stack message', () => {
      const data = {
        callStack: []
      };
      
      render(<RecursionVisualizer data={data} />);
      
      expect(screen.getByText('Call stack is empty')).toBeInTheDocument();
    });
  });

  describe('Call Stack Display', () => {
    it('should render multiple call stack frames', () => {
      const data = {
        callStack: [
          {
            function: 'factorial',
            params: { n: 3 },
            level: 0,
            state: 'active'
          },
          {
            function: 'factorial',
            params: { n: 2 },
            level: 1,
            state: 'active'
          },
          {
            function: 'factorial',
            params: { n: 1 },
            level: 2,
            state: 'active'
          }
        ]
      };
      
      render(<RecursionVisualizer data={data} />);
      
      expect(screen.getAllByText('factorial')).toHaveLength(3);
      expect(screen.getByText('Level 0')).toBeInTheDocument();
      expect(screen.getByText('Level 1')).toBeInTheDocument();
      expect(screen.getByText('Level 2')).toBeInTheDocument();
    });

    it('should highlight current call', () => {
      const data = {
        callStack: [
          {
            function: 'factorial',
            params: { n: 3 },
            level: 0,
            state: 'active'
          },
          {
            function: 'factorial',
            params: { n: 2 },
            level: 1,
            state: 'active'
          }
        ],
        currentCall: 'factorial'
      };
      
      render(<RecursionVisualizer data={data} />);
      
      expect(screen.getAllByText('CURRENT')).toHaveLength(2); // Both calls match the function name
    });

    it('should highlight base case', () => {
      const data = {
        callStack: [
          {
            function: 'factorial',
            params: { n: 1 },
            level: 2,
            state: 'active'
          }
        ],
        baseCase: true
      };
      
      render(<RecursionVisualizer data={data} />);
      
      expect(screen.getByText('BASE CASE')).toBeInTheDocument();
    });

    it('should display parameters correctly', () => {
      const data = {
        callStack: [
          {
            function: 'fibonacci',
            params: { n: 5, memo: {} },
            level: 0,
            state: 'active'
          }
        ]
      };
      
      render(<RecursionVisualizer data={data} />);
      
      expect(screen.getByText('Parameters:')).toBeInTheDocument();
      expect(screen.getByText('n:')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('memo:')).toBeInTheDocument();
      expect(screen.getByText('{}')).toBeInTheDocument();
    });

    it('should display return values', () => {
      const data = {
        callStack: [
          {
            function: 'factorial',
            params: { n: 3 },
            level: 0,
            state: 'active',
            returnValue: 6
          }
        ]
      };
      
      render(<RecursionVisualizer data={data} />);
      
      expect(screen.getByText('Return Value:')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
    });

    it('should show pending return value', () => {
      const data = {
        callStack: [
          {
            function: 'factorial',
            params: { n: 3 },
            level: 0,
            state: 'active'
          }
        ]
      };
      
      render(<RecursionVisualizer data={data} />);
      
      expect(screen.getByText('Pending...')).toBeInTheDocument();
    });

    it('should handle empty parameters', () => {
      const data = {
        callStack: [
          {
            function: 'baseFunction',
            params: {},
            level: 0,
            state: 'active'
          }
        ]
      };
      
      render(<RecursionVisualizer data={data} />);
      
      expect(screen.getByText('None')).toBeInTheDocument();
    });
  });

  describe('Recursive Tree Display', () => {
    it('should render recursive tree when provided', () => {
      const data = {
        callStack: [],
        recursiveTree: [
          {
            id: 'fib(5)',
            children: ['fib(4)', 'fib(3)'],
            value: 5,
            state: 'computing'
          }
        ]
      };
      
      render(<RecursionVisualizer data={data} />);
      
      expect(screen.getByText('🌳')).toBeInTheDocument();
      expect(screen.getByText('Recursive Tree')).toBeInTheDocument();
      expect(screen.getByText('fib(5)')).toBeInTheDocument();
      expect(screen.getByText('Value: 5')).toBeInTheDocument();
    });

    it('should highlight current node in tree', () => {
      const data = {
        callStack: [],
        recursiveTree: [
          {
            id: 'fib(5)',
            children: ['fib(4)', 'fib(3)'],
            value: 5,
            state: 'computing'
          }
        ],
        currentCall: 'fib(5)'
      };
      
      render(<RecursionVisualizer data={data} />);
      
      expect(screen.getByText('fib(5)')).toBeInTheDocument();
    });

    it('should show different node states', () => {
      const data = {
        callStack: [],
        recursiveTree: [
          {
            id: 'fib(2)',
            children: [],
            value: 1,
            state: 'base_case'
          },
          {
            id: 'fib(3)',
            children: [],
            value: 2,
            state: 'completed'
          }
        ]
      };
      
      render(<RecursionVisualizer data={data} />);
      
      expect(screen.getByText('fib(2)')).toBeInTheDocument();
      expect(screen.getByText('fib(3)')).toBeInTheDocument();
      expect(screen.getByText('Value: 1')).toBeInTheDocument();
      expect(screen.getByText('Value: 2')).toBeInTheDocument();
    });

    it('should not render tree section when no tree data', () => {
      const data = {
        callStack: [
          {
            function: 'factorial',
            params: { n: 3 },
            level: 0,
            state: 'active'
          }
        ]
      };
      
      render(<RecursionVisualizer data={data} />);
      
      expect(screen.queryByText('Recursive Tree')).not.toBeInTheDocument();
    });
  });

  describe('Base Case Indicator', () => {
    it('should show base case indicator when base case is reached', () => {
      const data = {
        callStack: [
          {
            function: 'factorial',
            params: { n: 1 },
            level: 2,
            state: 'active'
          }
        ],
        baseCase: true
      };
      
      render(<RecursionVisualizer data={data} />);
      
      expect(screen.getByText('✅')).toBeInTheDocument();
      expect(screen.getByText('Base Case Reached!')).toBeInTheDocument();
      expect(screen.getByText('The recursion has reached its terminating condition and will start returning values.')).toBeInTheDocument();
    });

    it('should not show base case indicator when not at base case', () => {
      const data = {
        callStack: [
          {
            function: 'factorial',
            params: { n: 3 },
            level: 0,
            state: 'active'
          }
        ],
        baseCase: false
      };
      
      render(<RecursionVisualizer data={data} />);
      
      expect(screen.queryByText('Base Case Reached!')).not.toBeInTheDocument();
    });
  });

  describe('Recursion Statistics', () => {
    it('should display recursion statistics', () => {
      const data = {
        callStack: [
          {
            function: 'factorial',
            params: { n: 3 },
            level: 0,
            state: 'active'
          },
          {
            function: 'factorial',
            params: { n: 2 },
            level: 1,
            state: 'active',
            returnValue: 2
          },
          {
            function: 'factorial',
            params: { n: 1 },
            level: 2,
            state: 'active'
          }
        ]
      };
      
      render(<RecursionVisualizer data={data} />);
      
      expect(screen.getByText('Call Depth')).toBeInTheDocument();
      expect(screen.getByText('Total Calls')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      
      expect(screen.getAllByText('3')).toHaveLength(3); // Call depth, total calls, and parameter value
      expect(screen.getAllByText('1')).toHaveLength(2); // Completed calls and parameter value
      expect(screen.getAllByText('2')).toHaveLength(3); // Pending calls, parameter value, and return value
    });

    it('should handle empty call stack in statistics', () => {
      const data = {
        callStack: []
      };
      
      render(<RecursionVisualizer data={data} />);
      
      expect(screen.getByText('Call Depth')).toBeInTheDocument();
      expect(screen.getByText('Total Calls')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      
      expect(screen.getAllByText('1')).toHaveLength(1); // Call depth for empty stack
      expect(screen.getAllByText('0')).toHaveLength(3); // Total, completed, and pending calls
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid data gracefully', () => {
      const data = {};
      
      render(<RecursionVisualizer data={data} />);
      
      // Since the component doesn't show error for empty object, just check it renders
      expect(screen.getByTestId('base-visualizer')).toBeInTheDocument();
      expect(screen.getByText('Call stack is empty')).toBeInTheDocument();
    });

    it('should handle null data', () => {
      const data = null;
      
      render(<RecursionVisualizer data={data} />);
      
      expect(screen.getByTestId('base-visualizer')).toBeInTheDocument();
      expect(screen.getByText('Call stack is empty')).toBeInTheDocument();
    });

    it('should handle missing call stack', () => {
      const data = {
        recursiveTree: []
      };
      
      render(<RecursionVisualizer data={data} />);
      
      // Component handles missing callStack by defaulting to empty array
      expect(screen.getByTestId('base-visualizer')).toBeInTheDocument();
      expect(screen.getByText('Call stack is empty')).toBeInTheDocument();
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle fibonacci recursion visualization', () => {
      const data = {
        callStack: [
          {
            function: 'fibonacci',
            params: { n: 5 },
            level: 0,
            state: 'active'
          },
          {
            function: 'fibonacci',
            params: { n: 4 },
            level: 1,
            state: 'active'
          },
          {
            function: 'fibonacci',
            params: { n: 3 },
            level: 2,
            state: 'active'
          },
          {
            function: 'fibonacci',
            params: { n: 2 },
            level: 3,
            state: 'active',
            returnValue: 1
          }
        ],
        recursiveTree: [
          {
            id: 'fib(5)',
            children: ['fib(4)', 'fib(3)'],
            value: undefined,
            state: 'computing'
          },
          {
            id: 'fib(4)',
            children: ['fib(3)', 'fib(2)'],
            value: undefined,
            state: 'computing'
          },
          {
            id: 'fib(2)',
            children: [],
            value: 1,
            state: 'base_case'
          }
        ],
        currentCall: 'fibonacci'
      };
      
      render(<RecursionVisualizer data={data} />);
      
      expect(screen.getAllByText('fibonacci')).toHaveLength(4);
      expect(screen.getByText('fib(5)')).toBeInTheDocument();
      expect(screen.getAllByText('fib(4)')).toHaveLength(2); // In tree and as child
      expect(screen.getAllByText('fib(2)')).toHaveLength(2); // In tree and as child
      expect(screen.getAllByText('4')).toHaveLength(3); // Call depth, total calls, and parameter value
    });

    it('should handle tree traversal recursion', () => {
      const data = {
        callStack: [
          {
            function: 'inorderTraversal',
            params: { node: { val: 1, left: null, right: null } },
            level: 0,
            state: 'active'
          }
        ],
        recursiveTree: [
          {
            id: 'traverse(1)',
            children: [],
            value: 1,
            state: 'base_case'
          }
        ],
        baseCase: true
      };
      
      render(<RecursionVisualizer data={data} />);
      
      expect(screen.getByText('inorderTraversal')).toBeInTheDocument();
      expect(screen.getByText('traverse(1)')).toBeInTheDocument();
      expect(screen.getByText('BASE CASE')).toBeInTheDocument();
      expect(screen.getByText('Base Case Reached!')).toBeInTheDocument();
    });

    it('should handle backtracking recursion', () => {
      const data = {
        callStack: [
          {
            function: 'backtrack',
            params: { path: [1, 2], remaining: [3, 4] },
            level: 0,
            state: 'active'
          },
          {
            function: 'backtrack',
            params: { path: [1, 2, 3], remaining: [4] },
            level: 1,
            state: 'active'
          }
        ],
        recursiveTree: [
          {
            id: 'backtrack([1,2])',
            children: ['backtrack([1,2,3])', 'backtrack([1,2,4])'],
            value: undefined,
            state: 'computing'
          }
        ]
      };
      
      render(<RecursionVisualizer data={data} />);
      
      expect(screen.getAllByText('backtrack')).toHaveLength(2);
      expect(screen.getByText('backtrack([1,2])')).toBeInTheDocument();
      expect(screen.getAllByText('path:')).toHaveLength(2); // In both call stack frames
      expect(screen.getByText('[1,2]')).toBeInTheDocument();
      expect(screen.getAllByText('remaining:')).toHaveLength(2); // In both call stack frames
      expect(screen.getByText('[3,4]')).toBeInTheDocument();
    });
  });

  describe('Parameter Tracking', () => {
    it('should track complex parameter types', () => {
      const data = {
        callStack: [
          {
            function: 'dfs',
            params: { 
              node: { id: 1, children: [2, 3] },
              visited: new Set([1]),
              path: [1],
              target: 3
            },
            level: 0,
            state: 'active'
          }
        ]
      };
      
      render(<RecursionVisualizer data={data} />);
      
      expect(screen.getByText('node:')).toBeInTheDocument();
      expect(screen.getByText('visited:')).toBeInTheDocument();
      expect(screen.getByText('path:')).toBeInTheDocument();
      expect(screen.getByText('target:')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should handle null and undefined parameters', () => {
      const data = {
        callStack: [
          {
            function: 'traverse',
            params: { 
              node: null,
              parent: undefined,
              value: 0
            },
            level: 0,
            state: 'active'
          }
        ]
      };
      
      render(<RecursionVisualizer data={data} />);
      
      expect(screen.getByText('node:')).toBeInTheDocument();
      expect(screen.getByText('parent:')).toBeInTheDocument();
      expect(screen.getByText('value:')).toBeInTheDocument();
      expect(screen.getAllByText('null')).toHaveLength(2); // node and parent (undefined becomes null)
      expect(screen.getAllByText('0')).toHaveLength(2); // Parameter value and statistics
    });
  });

  describe('Return Value Tracking', () => {
    it('should track different return value types', () => {
      const data = {
        callStack: [
          {
            function: 'search',
            params: { arr: [1, 2, 3], target: 2 },
            level: 0,
            state: 'active',
            returnValue: true
          },
          {
            function: 'getPath',
            params: { node: 1 },
            level: 1,
            state: 'active',
            returnValue: [1, 2, 3]
          },
          {
            function: 'calculate',
            params: { x: 5 },
            level: 2,
            state: 'active',
            returnValue: { result: 25, steps: 3 }
          }
        ]
      };
      
      render(<RecursionVisualizer data={data} />);
      
      expect(screen.getByText('true')).toBeInTheDocument();
      expect(screen.getAllByText('[1,2,3]')).toHaveLength(2); // Parameter and return value
      expect(screen.getByText('{"result":25,"steps":3}')).toBeInTheDocument();
    });
  });
});