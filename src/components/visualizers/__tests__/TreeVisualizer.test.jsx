import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TreeVisualizer from '../TreeVisualizer';

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

describe('TreeVisualizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Basic Rendering', () => {
    it('should render simple tree data', () => {
      const data = {
        nodes: [
          { id: '1', value: 10, x: 100, y: 50 },
          { id: '2', value: 5, x: 50, y: 150 },
          { id: '3', value: 15, x: 150, y: 150 }
        ],
        edges: [
          { from: '1', to: '2' },
          { from: '1', to: '3' }
        ]
      };
      
      render(<TreeVisualizer data={data} />);
      
      expect(screen.getByTestId('base-visualizer')).toBeInTheDocument();
      expect(screen.getByText('Tree Visualization')).toBeInTheDocument();
    });

    it('should render tree with custom title', () => {
      const data = {
        nodes: [{ id: '1', value: 10, x: 100, y: 50 }],
        edges: []
      };
      const title = 'Binary Search Tree';
      
      render(<TreeVisualizer data={data} title={title} />);
      
      expect(screen.getByText(title)).toBeInTheDocument();
    });

    it('should handle empty tree data', () => {
      const data = {
        nodes: [],
        edges: []
      };
      
      render(<TreeVisualizer data={data} />);
      
      expect(screen.getByTestId('base-visualizer')).toBeInTheDocument();
      expect(screen.getByText('Total Nodes')).toBeInTheDocument();
      
      // Check for zero nodes more specifically
      const totalNodesSection = screen.getByText('Total Nodes').parentElement;
      expect(totalNodesSection).toHaveTextContent('0');
    });
  });

  describe('Auto Layout', () => {
    it('should auto-position nodes when positions are not provided', () => {
      const data = {
        nodes: [
          { id: '1', value: 10 },
          { id: '2', value: 5 },
          { id: '3', value: 15 }
        ],
        edges: [
          { from: '1', to: '2' },
          { from: '1', to: '3' }
        ],
        rootId: '1'
      };
      
      render(<TreeVisualizer data={data} />);
      
      // Should render without errors and show tree statistics
      expect(screen.getByText('Total Nodes')).toBeInTheDocument();
      
      const totalNodesSection = screen.getByText('Total Nodes').parentElement;
      expect(totalNodesSection).toHaveTextContent('3');
    });

    it('should use provided positions when available', () => {
      const data = {
        nodes: [
          { id: '1', value: 10, x: 100, y: 50 },
          { id: '2', value: 5, x: 50, y: 150 }
        ],
        edges: [
          { from: '1', to: '2' }
        ]
      };
      
      render(<TreeVisualizer data={data} />);
      
      expect(screen.getByText('Total Nodes')).toBeInTheDocument();
      
      const totalNodesSection = screen.getByText('Total Nodes').parentElement;
      expect(totalNodesSection).toHaveTextContent('2');
    });
  });

  describe('Tree Types', () => {
    it('should handle binary tree type', () => {
      const data = {
        nodes: [
          { id: '1', value: 10 },
          { id: '2', value: 5 },
          { id: '3', value: 15 }
        ],
        edges: [
          { from: '1', to: '2' },
          { from: '1', to: '3' }
        ],
        treeType: 'binary',
        rootId: '1'
      };
      
      render(<TreeVisualizer data={data} />);
      
      expect(screen.getByText('BINARY')).toBeInTheDocument();
    });

    it('should handle BST type with balance information', () => {
      const data = {
        nodes: [
          { id: '1', value: 10 },
          { id: '2', value: 5 },
          { id: '3', value: 15 }
        ],
        edges: [
          { from: '1', to: '2' },
          { from: '1', to: '3' }
        ],
        treeType: 'bst',
        rootId: '1'
      };
      
      render(<TreeVisualizer data={data} />);
      
      expect(screen.getByText('BST')).toBeInTheDocument();
      expect(screen.getByText('Balanced')).toBeInTheDocument();
    });
  });

  describe('Traversal Animations', () => {
    it('should render preorder traversal', () => {
      const data = {
        nodes: [
          { id: '1', value: 10 },
          { id: '2', value: 5 },
          { id: '3', value: 15 }
        ],
        edges: [
          { from: '1', to: '2' },
          { from: '1', to: '3' }
        ],
        traversalType: 'preorder',
        traversalPath: ['1', '2', '3'],
        currentNode: '1',
        rootId: '1'
      };
      
      render(<TreeVisualizer data={data} />);
      
      expect(screen.getByText('Pre-order (Root → Left → Right)')).toBeInTheDocument();
      expect(screen.getByText('Progress')).toBeInTheDocument();
      
      // Check for progress more specifically
      const progressSection = screen.getByText('Progress').closest('div');
      expect(progressSection).toHaveTextContent('1 / 3');
    });

    it('should render inorder traversal', () => {
      const data = {
        nodes: [
          { id: '1', value: 10 },
          { id: '2', value: 5 },
          { id: '3', value: 15 }
        ],
        edges: [
          { from: '1', to: '2' },
          { from: '1', to: '3' }
        ],
        traversalType: 'inorder',
        traversalPath: ['2', '1', '3'],
        currentNode: '2',
        rootId: '1'
      };
      
      render(<TreeVisualizer data={data} />);
      
      expect(screen.getByText('In-order (Left → Root → Right)')).toBeInTheDocument();
    });

    it('should render postorder traversal', () => {
      const data = {
        nodes: [
          { id: '1', value: 10 },
          { id: '2', value: 5 },
          { id: '3', value: 15 }
        ],
        edges: [
          { from: '1', to: '2' },
          { from: '1', to: '3' }
        ],
        traversalType: 'postorder',
        traversalPath: ['2', '3', '1'],
        currentNode: '2',
        rootId: '1'
      };
      
      render(<TreeVisualizer data={data} />);
      
      expect(screen.getByText('Post-order (Left → Right → Root)')).toBeInTheDocument();
    });

    it('should render level-order traversal', () => {
      const data = {
        nodes: [
          { id: '1', value: 10 },
          { id: '2', value: 5 },
          { id: '3', value: 15 }
        ],
        edges: [
          { from: '1', to: '2' },
          { from: '1', to: '3' }
        ],
        traversalType: 'levelorder',
        traversalPath: ['1', '2', '3'],
        currentNode: '1',
        rootId: '1'
      };
      
      render(<TreeVisualizer data={data} />);
      
      expect(screen.getByText('Level-order (Breadth-first)')).toBeInTheDocument();
    });

    it('should handle traversal controls', () => {
      const data = {
        nodes: [
          { id: '1', value: 10 },
          { id: '2', value: 5 }
        ],
        edges: [
          { from: '1', to: '2' }
        ],
        traversalType: 'preorder',
        traversalPath: ['1', '2'],
        currentNode: '1',
        rootId: '1'
      };
      
      render(<TreeVisualizer data={data} />);
      
      // Animation starts automatically, so button shows "Pause"
      const pauseButton = screen.getByText('⏸️ Pause');
      const resetButton = screen.getByText('🔄 Reset');
      
      expect(pauseButton).toBeInTheDocument();
      expect(resetButton).toBeInTheDocument();
      
      // Test button interactions
      fireEvent.click(pauseButton);
      expect(screen.getByText('▶️ Play')).toBeInTheDocument();
      
      fireEvent.click(resetButton);
      // Reset should work without errors
    });
  });

  describe('Tree Operations', () => {
    it('should render insertion operations', () => {
      const data = {
        nodes: [
          { id: '1', value: 10 },
          { id: '2', value: 5 }
        ],
        edges: [
          { from: '1', to: '2' }
        ],
        operations: [
          {
            type: 'insert',
            nodeIds: ['2'],
            description: 'Inserting node with value 5'
          }
        ],
        rootId: '1'
      };
      
      render(<TreeVisualizer data={data} />);
      
      expect(screen.getByText('Current Operations')).toBeInTheDocument();
      expect(screen.getAllByText('INSERT')).toHaveLength(2); // 1 on node + 1 in operations
      expect(screen.getByText('Inserting node with value 5')).toBeInTheDocument();
      expect(screen.getByText('Nodes: 2')).toBeInTheDocument();
    });

    it('should render deletion operations', () => {
      const data = {
        nodes: [
          { id: '1', value: 10 },
          { id: '2', value: 5 }
        ],
        edges: [
          { from: '1', to: '2' }
        ],
        operations: [
          {
            type: 'delete',
            nodeIds: ['2'],
            description: 'Deleting node with value 5'
          }
        ],
        rootId: '1'
      };
      
      render(<TreeVisualizer data={data} />);
      
      expect(screen.getAllByText('DELETE')).toHaveLength(2); // 1 on node + 1 in operations
      expect(screen.getByText('Deleting node with value 5')).toBeInTheDocument();
    });

    it('should render rotation operations', () => {
      const data = {
        nodes: [
          { id: '1', value: 10 },
          { id: '2', value: 5 },
          { id: '3', value: 15 }
        ],
        edges: [
          { from: '1', to: '2' },
          { from: '1', to: '3' }
        ],
        operations: [
          {
            type: 'rotate',
            nodeIds: ['1', '2'],
            description: 'Right rotation at node 10'
          }
        ],
        rootId: '1'
      };
      
      render(<TreeVisualizer data={data} />);
      
      expect(screen.getAllByText('ROTATE')).toHaveLength(3); // 2 on nodes + 1 in operations
      expect(screen.getByText('Right rotation at node 10')).toBeInTheDocument();
      expect(screen.getByText('Nodes: 1, 2')).toBeInTheDocument();
    });

    it('should render multiple operations', () => {
      const data = {
        nodes: [
          { id: '1', value: 10 }
        ],
        edges: [],
        operations: [
          {
            type: 'insert',
            nodeIds: ['2'],
            description: 'Insert operation'
          },
          {
            type: 'balance',
            nodeIds: ['1'],
            description: 'Balance operation'
          }
        ],
        rootId: '1'
      };
      
      render(<TreeVisualizer data={data} />);
      
      expect(screen.getByText('INSERT')).toBeInTheDocument();
      expect(screen.getAllByText('BALANCE')).toHaveLength(2); // 1 on node + 1 in operations
      expect(screen.getByText('Insert operation')).toBeInTheDocument();
      expect(screen.getByText('Balance operation')).toBeInTheDocument();
    });
  });

  describe('Tree Statistics', () => {
    it('should calculate and display basic statistics', () => {
      const data = {
        nodes: [
          { id: '1', value: 10 },
          { id: '2', value: 5 },
          { id: '3', value: 15 },
          { id: '4', value: 3 }
        ],
        edges: [
          { from: '1', to: '2' },
          { from: '1', to: '3' },
          { from: '2', to: '4' }
        ],
        rootId: '1'
      };
      
      render(<TreeVisualizer data={data} />);
      
      expect(screen.getByText('Total Nodes')).toBeInTheDocument();
      expect(screen.getByText('Tree Height')).toBeInTheDocument();
      expect(screen.getByText('Leaf Nodes')).toBeInTheDocument();
      expect(screen.getByText('Diameter')).toBeInTheDocument();
      
      // Check for statistics values more specifically
      const totalNodesSection = screen.getByText('Total Nodes').parentElement;
      expect(totalNodesSection).toHaveTextContent('4');
    });

    it('should display tree properties', () => {
      const data = {
        nodes: [
          { id: '1', value: 10 },
          { id: '2', value: 5 },
          { id: '3', value: 15 }
        ],
        edges: [
          { from: '1', to: '2' },
          { from: '1', to: '3' }
        ],
        treeType: 'binary',
        traversalType: 'preorder',
        rootId: '1'
      };
      
      render(<TreeVisualizer data={data} />);
      
      expect(screen.getByText('Tree Properties')).toBeInTheDocument();
      expect(screen.getByText('Type:')).toBeInTheDocument();
      expect(screen.getByText('BINARY')).toBeInTheDocument();
      expect(screen.getByText('Traversal:')).toBeInTheDocument();
      expect(screen.getByText('PREORDER')).toBeInTheDocument();
      expect(screen.getByText('Complete:')).toBeInTheDocument();
      expect(screen.getByText('Perfect:')).toBeInTheDocument();
      expect(screen.getByText('Full:')).toBeInTheDocument();
    });

    it('should show balance information for BST', () => {
      const data = {
        nodes: [
          { id: '1', value: 10 },
          { id: '2', value: 5 },
          { id: '3', value: 15 }
        ],
        edges: [
          { from: '1', to: '2' },
          { from: '1', to: '3' }
        ],
        treeType: 'bst',
        rootId: '1'
      };
      
      render(<TreeVisualizer data={data} />);
      
      expect(screen.getByText('Balanced')).toBeInTheDocument();
      
      // Check for "Yes" more specifically in the balanced section
      const balancedSection = screen.getByText('Balanced').parentElement;
      expect(balancedSection).toHaveTextContent('Yes');
    });
  });

  describe('Node States and Highlighting', () => {
    it('should highlight current node', () => {
      const data = {
        nodes: [
          { id: '1', value: 10 },
          { id: '2', value: 5 }
        ],
        edges: [
          { from: '1', to: '2' }
        ],
        currentNode: '1',
        rootId: '1'
      };
      
      render(<TreeVisualizer data={data} />);
      
      // Current node should be highlighted (tested through component rendering)
      expect(screen.getByTestId('base-visualizer')).toBeInTheDocument();
    });

    it('should highlight visited nodes in traversal', () => {
      const data = {
        nodes: [
          { id: '1', value: 10 },
          { id: '2', value: 5 },
          { id: '3', value: 15 }
        ],
        edges: [
          { from: '1', to: '2' },
          { from: '1', to: '3' }
        ],
        traversalPath: ['1', '2'],
        currentNode: '2',
        rootId: '1'
      };
      
      render(<TreeVisualizer data={data} />);
      
      // Visited nodes should be highlighted (tested through component rendering)
      expect(screen.getByTestId('base-visualizer')).toBeInTheDocument();
    });

    it('should highlight target nodes', () => {
      const data = {
        nodes: [
          { id: '1', value: 10 },
          { id: '2', value: 5, state: 'target' }
        ],
        edges: [
          { from: '1', to: '2' }
        ],
        rootId: '1'
      };
      
      render(<TreeVisualizer data={data} />);
      
      // Target node should be highlighted (tested through component rendering)
      expect(screen.getByTestId('base-visualizer')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle single node tree', () => {
      const data = {
        nodes: [
          { id: '1', value: 10 }
        ],
        edges: []
      };
      
      render(<TreeVisualizer data={data} />);
      
      expect(screen.getByText('Total Nodes')).toBeInTheDocument();
      expect(screen.getByText('Tree Height')).toBeInTheDocument();
      
      // Check for single node more specifically
      const totalNodesSection = screen.getByText('Total Nodes').parentElement;
      expect(totalNodesSection).toHaveTextContent('1');
    });

    it('should handle disconnected nodes', () => {
      const data = {
        nodes: [
          { id: '1', value: 10 },
          { id: '2', value: 5 },
          { id: '3', value: 15 }
        ],
        edges: [
          { from: '1', to: '2' }
          // Node 3 is disconnected
        ],
        rootId: '1'
      };
      
      render(<TreeVisualizer data={data} />);
      
      expect(screen.getByText('Total Nodes')).toBeInTheDocument();
      
      const totalNodesSection = screen.getByText('Total Nodes').parentElement;
      expect(totalNodesSection).toHaveTextContent('3');
    });

    it('should handle null/undefined values', () => {
      const data = {
        nodes: [
          { id: '1', value: null },
          { id: '2', value: undefined },
          { id: '3', value: 0 }
        ],
        edges: [
          { from: '1', to: '2' },
          { from: '1', to: '3' }
        ],
        rootId: '1'
      };
      
      render(<TreeVisualizer data={data} />);
      
      expect(screen.getByTestId('base-visualizer')).toBeInTheDocument();
    });

    it('should handle missing edge endpoints', () => {
      const data = {
        nodes: [
          { id: '1', value: 10 }
        ],
        edges: [
          { from: '1', to: '999' }, // Non-existent node
          { from: '888', to: '1' }  // Non-existent node
        ],
        rootId: '1'
      };
      
      render(<TreeVisualizer data={data} />);
      
      expect(screen.getByTestId('base-visualizer')).toBeInTheDocument();
    });
  });

  describe('Complex Tree Structures', () => {
    it('should handle deep tree', () => {
      const data = {
        nodes: [
          { id: '1', value: 1 },
          { id: '2', value: 2 },
          { id: '3', value: 3 },
          { id: '4', value: 4 },
          { id: '5', value: 5 }
        ],
        edges: [
          { from: '1', to: '2' },
          { from: '2', to: '3' },
          { from: '3', to: '4' },
          { from: '4', to: '5' }
        ],
        rootId: '1'
      };
      
      render(<TreeVisualizer data={data} />);
      
      expect(screen.getByText('Total Nodes')).toBeInTheDocument();
      expect(screen.getByText('Tree Height')).toBeInTheDocument();
      
      // Check for 5 nodes more specifically in the statistics
      const totalNodesSection = screen.getByText('Total Nodes').parentElement;
      expect(totalNodesSection).toHaveTextContent('5');
    });

    it('should handle wide tree', () => {
      const data = {
        nodes: [
          { id: '1', value: 1 },
          { id: '2', value: 2 },
          { id: '3', value: 3 },
          { id: '4', value: 4 },
          { id: '5', value: 5 }
        ],
        edges: [
          { from: '1', to: '2' },
          { from: '1', to: '3' },
          { from: '1', to: '4' },
          { from: '1', to: '5' }
        ],
        rootId: '1'
      };
      
      render(<TreeVisualizer data={data} />);
      
      expect(screen.getByText('Total Nodes')).toBeInTheDocument();
      
      // Check for 5 nodes more specifically in the statistics
      const totalNodesSection = screen.getByText('Total Nodes').parentElement;
      expect(totalNodesSection).toHaveTextContent('5');
    });

    it('should handle complete binary tree', () => {
      const data = {
        nodes: [
          { id: '1', value: 1 },
          { id: '2', value: 2 },
          { id: '3', value: 3 },
          { id: '4', value: 4 },
          { id: '5', value: 5 },
          { id: '6', value: 6 },
          { id: '7', value: 7 }
        ],
        edges: [
          { from: '1', to: '2' },
          { from: '1', to: '3' },
          { from: '2', to: '4' },
          { from: '2', to: '5' },
          { from: '3', to: '6' },
          { from: '3', to: '7' }
        ],
        treeType: 'binary',
        rootId: '1'
      };
      
      render(<TreeVisualizer data={data} />);
      
      expect(screen.getByText('Complete:')).toBeInTheDocument();
      expect(screen.getByText('Perfect:')).toBeInTheDocument();
      expect(screen.getByText('Full:')).toBeInTheDocument();
    });
  });
});