import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ArrayVisualizer from '../ArrayVisualizer';

// Mock the CSS import
vi.mock('../ArrayVisualizer.css', () => ({}));

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
    formatValue: (value) => String(value)
  }
}));

describe('ArrayVisualizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Basic Rendering', () => {
    it('should render simple array data', () => {
      const data = [1, 2, 3, 4, 5];
      
      render(<ArrayVisualizer data={data} />);
      
      expect(screen.getByTestId('base-visualizer')).toBeInTheDocument();
      expect(screen.getAllByText('1')).toHaveLength(2); // Value and index
      expect(screen.getAllByText('2')).toHaveLength(2); // Value and index
      expect(screen.getAllByText('3')).toHaveLength(2); // Value and index
      expect(screen.getAllByText('4')).toHaveLength(2); // Value and index
      expect(screen.getAllByText('5')).toHaveLength(2); // Value and statistics
    });

    it('should render array with custom title', () => {
      const data = [1, 2, 3];
      const title = 'Custom Array Visualization';
      
      render(<ArrayVisualizer data={data} title={title} />);
      
      expect(screen.getByText(title)).toBeInTheDocument();
    });

    it('should render multiple arrays', () => {
      const data = {
        arrays: [
          { name: 'Array 1', values: [1, 2, 3] },
          { name: 'Array 2', values: [4, 5, 6] }
        ]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      expect(screen.getByText('Array 1 (length: 3)')).toBeInTheDocument();
      expect(screen.getByText('Array 2 (length: 3)')).toBeInTheDocument();
      expect(screen.getAllByText('1')).toHaveLength(3); // Value, index in first array, and index in second array
      expect(screen.getAllByText('4')).toHaveLength(1); // Only value (index is 3, not 4)
    });
  });

  describe('Highlighting Features', () => {
    it('should render window highlighting', () => {
      const data = {
        arrays: [{
          name: 'Array',
          values: [1, 2, 3, 4, 5],
          highlights: {
            window: { start: 1, end: 3 }
          }
        }]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      expect(screen.getByText('START')).toBeInTheDocument();
      expect(screen.getByText('END')).toBeInTheDocument();
    });

    it('should render current element highlighting', () => {
      const data = {
        arrays: [{
          name: 'Array',
          values: [1, 2, 3, 4, 5],
          highlights: {
            current: [2]
          }
        }]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      // The element at index 2 should have current styling
      const elements = screen.getAllByText('3');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should render target element highlighting', () => {
      const data = {
        arrays: [{
          name: 'Array',
          values: [1, 2, 3, 4, 5],
          highlights: {
            target: [4]
          }
        }]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      // The element at index 4 should have target styling
      const elements = screen.getAllByText('5');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should render comparison highlighting', () => {
      const data = {
        arrays: [{
          name: 'Array',
          values: [1, 2, 3, 4, 5],
          highlights: {
            comparison: [1, 3]
          }
        }]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      // Elements at indices 1 and 3 should have comparison styling
      expect(screen.getAllByText('2')).toHaveLength(2); // Value and index
      expect(screen.getAllByText('4')).toHaveLength(2); // Value and index
    });

    it('should render sorted elements highlighting', () => {
      const data = {
        arrays: [{
          name: 'Array',
          values: [1, 2, 3, 4, 5],
          highlights: {
            sorted: [0, 1, 2]
          }
        }]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      // First three elements should have sorted styling
      expect(screen.getAllByText('1')).toHaveLength(2); // Value and index
      expect(screen.getAllByText('2')).toHaveLength(2); // Value and index
      expect(screen.getAllByText('3')).toHaveLength(3); // Value, index, and statistics count
      
      // Check that sorted elements statistics is displayed
      expect(screen.getByText('Sorted Elements')).toBeInTheDocument();
    });

    it('should render subarray highlighting', () => {
      const data = {
        arrays: [{
          name: 'Array',
          values: [1, 2, 3, 4, 5],
          highlights: {
            subarray: [1, 2, 3]
          }
        }]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      expect(screen.getAllByText('SUB')).toHaveLength(3);
    });
  });

  describe('Pointers', () => {
    it('should render pointers', () => {
      const data = {
        arrays: [{
          name: 'Array',
          values: [1, 2, 3, 4, 5]
        }],
        pointers: [
          { name: 'left', position: 0, color: '#ff0000' },
          { name: 'right', position: 4, color: '#00ff00' }
        ]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      expect(screen.getAllByText('left')).toHaveLength(2); // One in pointer, one in legend
      expect(screen.getAllByText('right')).toHaveLength(2); // One in pointer, one in legend
    });

    it('should render pointers legend', () => {
      const data = {
        arrays: [{
          name: 'Array',
          values: [1, 2, 3, 4, 5]
        }],
        pointers: [
          { name: 'left', position: 0, color: '#ff0000' },
          { name: 'right', position: 4, color: '#00ff00' }
        ]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      expect(screen.getByText('🎯')).toBeInTheDocument();
      expect(screen.getByText('Pointers Legend')).toBeInTheDocument();
      expect(screen.getByText('Position: 0')).toBeInTheDocument();
      expect(screen.getByText('Position: 4')).toBeInTheDocument();
    });

    it('should handle multiple pointers at same position', () => {
      const data = {
        arrays: [{
          name: 'Array',
          values: [1, 2, 3, 4, 5]
        }],
        pointers: [
          { name: 'ptr1', position: 2, color: '#ff0000' },
          { name: 'ptr2', position: 2, color: '#00ff00' }
        ]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      expect(screen.getAllByText('ptr1')).toHaveLength(2); // One in pointer, one in legend
      expect(screen.getAllByText('ptr2')).toHaveLength(2); // One in pointer, one in legend
    });
  });

  describe('Operations', () => {
    it('should render swap operations', () => {
      const data = {
        arrays: [{
          name: 'Array',
          values: [1, 2, 3, 4, 5]
        }],
        operations: [
          {
            type: 'swap',
            indices: [0, 4],
            description: 'Swapping elements at indices 0 and 4',
            values: [1, 5]
          }
        ]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      expect(screen.getByText('Current Operations')).toBeInTheDocument();
      expect(screen.getByText('SWAP')).toBeInTheDocument();
      expect(screen.getByText('Indices: [0, 4]')).toBeInTheDocument();
      expect(screen.getByText('Swapping elements at indices 0 and 4')).toBeInTheDocument();
      expect(screen.getByText('Values: [1, 5]')).toBeInTheDocument();
    });

    it('should render compare operations', () => {
      const data = {
        arrays: [{
          name: 'Array',
          values: [1, 2, 3, 4, 5]
        }],
        operations: [
          {
            type: 'compare',
            indices: [1, 3],
            description: 'Comparing elements at indices 1 and 3'
          }
        ]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      expect(screen.getByText('COMPARE')).toBeInTheDocument();
      expect(screen.getByText('Indices: [1, 3]')).toBeInTheDocument();
      expect(screen.getByText('Comparing elements at indices 1 and 3')).toBeInTheDocument();
    });

    it('should render access operations', () => {
      const data = {
        arrays: [{
          name: 'Array',
          values: [1, 2, 3, 4, 5]
        }],
        operations: [
          {
            type: 'access',
            indices: [2],
            description: 'Accessing element at index 2'
          }
        ]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      expect(screen.getByText('ACCESS')).toBeInTheDocument();
      expect(screen.getByText('Indices: [2]')).toBeInTheDocument();
      expect(screen.getByText('Accessing element at index 2')).toBeInTheDocument();
    });

    it('should handle multiple operations', () => {
      const data = {
        arrays: [{
          name: 'Array',
          values: [1, 2, 3, 4, 5]
        }],
        operations: [
          {
            type: 'compare',
            indices: [0, 1],
            description: 'First comparison'
          },
          {
            type: 'swap',
            indices: [0, 1],
            description: 'Swap after comparison'
          }
        ]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      expect(screen.getByText('COMPARE')).toBeInTheDocument();
      expect(screen.getByText('SWAP')).toBeInTheDocument();
      expect(screen.getByText('First comparison')).toBeInTheDocument();
      expect(screen.getByText('Swap after comparison')).toBeInTheDocument();
    });
  });

  describe('Array Statistics', () => {
    it('should render basic array statistics', () => {
      const data = {
        arrays: [{
          name: 'Array',
          values: [1, 2, 3, 4, 5]
        }]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      expect(screen.getByText('Array Length')).toBeInTheDocument();
      // Check for the array length value in the statistics section specifically
      const lengthStats = screen.getByText('Array Length').parentElement.parentElement;
      expect(lengthStats).toHaveTextContent('5');
    });

    it('should render window statistics', () => {
      const data = {
        arrays: [{
          name: 'Array',
          values: [1, 2, 3, 4, 5],
          highlights: {
            window: { start: 1, end: 3 },
            windowSum: 9
          }
        }]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      expect(screen.getByText('Window Start')).toBeInTheDocument();
      expect(screen.getByText('Window End')).toBeInTheDocument();
      expect(screen.getByText('Window Size')).toBeInTheDocument();
      expect(screen.getByText('Window Sum')).toBeInTheDocument();
      
      // Check for specific values in their respective statistics sections
      const windowStartStats = screen.getByText('Window Start').parentElement.parentElement;
      expect(windowStartStats).toHaveTextContent('1');
      
      const windowEndStats = screen.getByText('Window End').parentElement.parentElement;
      expect(windowEndStats).toHaveTextContent('3');
      
      const windowSumStats = screen.getByText('Window Sum').parentElement.parentElement;
      expect(windowSumStats).toHaveTextContent('9');
    });

    it('should render sorting statistics', () => {
      const data = {
        arrays: [{
          name: 'Array',
          values: [1, 2, 3, 4, 5],
          highlights: {
            sorted: [0, 1, 2],
            comparisons: 10,
            swaps: 3
          }
        }]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      expect(screen.getByText('Sorted Elements')).toBeInTheDocument();
      expect(screen.getByText('Comparisons')).toBeInTheDocument();
      expect(screen.getByText('Swaps')).toBeInTheDocument();
      
      // Check for specific values in their respective statistics sections
      const comparisonsStats = screen.getByText('Comparisons').parentElement.parentElement;
      expect(comparisonsStats).toHaveTextContent('10');
      
      const swapsStats = screen.getByText('Swaps').parentElement.parentElement;
      expect(swapsStats).toHaveTextContent('3');
      
      const sortedStats = screen.getByText('Sorted Elements').parentElement.parentElement;
      expect(sortedStats).toHaveTextContent('3');
    });
  });

  describe('Legacy Format Support', () => {
    it('should handle legacy window mode', () => {
      const data = {
        array: [1, 2, 3, 4, 5],
        windowStart: 1,
        windowEnd: 3,
        windowSum: 9
      };
      
      render(<ArrayVisualizer data={data} mode="window" />);
      
      // Check for array elements by looking for specific structure
      expect(screen.getByText('START')).toBeInTheDocument();
      expect(screen.getByText('END')).toBeInTheDocument();
      expect(screen.getByText('Window Sum')).toBeInTheDocument();
      expect(screen.getByText('9')).toBeInTheDocument();
    });

    it('should handle legacy pointers mode', () => {
      const data = {
        array: [1, 2, 3, 4, 5],
        pointers: [
          { name: 'left', position: 0, color: '#ff0000' }
        ]
      };
      
      render(<ArrayVisualizer data={data} mode="pointers" />);
      
      expect(screen.getByText('Pointers Legend')).toBeInTheDocument();
      expect(screen.getByText('Position: 0')).toBeInTheDocument();
    });

    it('should handle single array object format', () => {
      const data = {
        array: [1, 2, 3, 4, 5],
        name: 'Test Array'
      };
      
      render(<ArrayVisualizer data={data} />);
      
      expect(screen.getByText('Test Array (length: 5)')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle empty arrays', () => {
      const data = {
        arrays: [{
          name: 'Empty Array',
          values: []
        }]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      expect(screen.getByText('Empty Array')).toBeInTheDocument();
      expect(screen.getByText('Array Length')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle null/undefined values', () => {
      const data = {
        arrays: [{
          name: 'Array with nulls',
          values: [1, null, undefined, 4, 5]
        }]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      expect(screen.getByText('Array with nulls (length: 5)')).toBeInTheDocument();
      expect(screen.getByText('null')).toBeInTheDocument();
      expect(screen.getByText('undefined')).toBeInTheDocument();
    });

    it('should handle invalid data gracefully', () => {
      const data = null;
      
      render(<ArrayVisualizer data={data} />);
      
      // Should render without crashing
      expect(screen.getByTestId('base-visualizer')).toBeInTheDocument();
    });
  });

  describe('Animations', () => {
    it('should show operation indicators for swap operations', () => {
      const data = {
        arrays: [{
          name: 'Array',
          values: [1, 2, 3, 4, 5]
        }],
        operations: [
          {
            type: 'swap',
            indices: [0, 4],
            description: 'Swapping elements'
          }
        ]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      // Check that operation is displayed
      expect(screen.getByText('SWAP')).toBeInTheDocument();
      expect(screen.getByText('Swapping elements')).toBeInTheDocument();
    });

    it('should show operation indicators for compare operations', () => {
      const data = {
        arrays: [{
          name: 'Array',
          values: [1, 2, 3, 4, 5]
        }],
        operations: [
          {
            type: 'compare',
            indices: [1, 3],
            description: 'Comparing elements'
          }
        ]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      // Check that operation is displayed
      expect(screen.getByText('COMPARE')).toBeInTheDocument();
      expect(screen.getByText('Comparing elements')).toBeInTheDocument();
    });

    it('should show operation indicators for access operations', () => {
      const data = {
        arrays: [{
          name: 'Array',
          values: [1, 2, 3, 4, 5]
        }],
        operations: [
          {
            type: 'access',
            indices: [2],
            description: 'Accessing element'
          }
        ]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      // Check that operation is displayed
      expect(screen.getByText('ACCESS')).toBeInTheDocument();
      expect(screen.getByText('Accessing element')).toBeInTheDocument();
    });
  });

  describe('Transformation Indicators', () => {
    it('should render sorting transformation indicator', () => {
      const data = {
        arrays: [{
          name: 'Array',
          values: [1, 2, 3, 4, 5],
          highlights: {
            transformation: { type: 'sort' }
          }
        }]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      expect(screen.getByText('🔄 Sorting')).toBeInTheDocument();
    });

    it('should render reverse transformation indicator', () => {
      const data = {
        arrays: [{
          name: 'Array',
          values: [1, 2, 3, 4, 5],
          highlights: {
            transformation: { type: 'reverse' }
          }
        }]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      expect(screen.getByText('↩️ Reversing')).toBeInTheDocument();
    });

    it('should render rotate transformation indicator', () => {
      const data = {
        arrays: [{
          name: 'Array',
          values: [1, 2, 3, 4, 5],
          highlights: {
            transformation: { type: 'rotate' }
          }
        }]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      expect(screen.getByText('🔄 Rotating')).toBeInTheDocument();
    });

    it('should render partition transformation indicator', () => {
      const data = {
        arrays: [{
          name: 'Array',
          values: [1, 2, 3, 4, 5],
          highlights: {
            transformation: { type: 'partition' }
          }
        }]
      };
      
      render(<ArrayVisualizer data={data} />);
      
      expect(screen.getByText('📊 Partitioning')).toBeInTheDocument();
    });
  });
});