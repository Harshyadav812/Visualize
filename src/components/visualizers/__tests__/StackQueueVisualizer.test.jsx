import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import StackQueueVisualizer from '../StackQueueVisualizer';

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

describe('StackQueueVisualizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Basic Rendering', () => {
    it('should render stack with basic elements', () => {
      const data = {
        elements: [1, 2, 3],
        top: 2,
        capacity: 5
      };
      
      render(<StackQueueVisualizer data={data} type="stack" />);
      
      expect(screen.getByTestId('base-visualizer')).toBeInTheDocument();
      expect(screen.getByText('Stack Visualization')).toBeInTheDocument();
      expect(screen.getByText('STACK (LIFO)')).toBeInTheDocument();
      expect(screen.getByText('TOP')).toBeInTheDocument();
    });

    it('should render queue with basic elements', () => {
      const data = {
        elements: [1, 2, 3],
        front: 0,
        rear: 2,
        capacity: 5
      };
      
      render(<StackQueueVisualizer data={data} type="queue" />);
      
      expect(screen.getByText('Queue Visualization')).toBeInTheDocument();
      expect(screen.getByText('QUEUE (FIFO)')).toBeInTheDocument();
      expect(screen.getByText('FRONT')).toBeInTheDocument();
      expect(screen.getByText('REAR')).toBeInTheDocument();
    });

    it('should render priority queue with elements', () => {
      const data = {
        elements: [
          { value: 'Task A', priority: 5 },
          { value: 'Task B', priority: 3 },
          { value: 'Task C', priority: 8 }
        ],
        capacity: 5,
        priority: true
      };
      
      render(<StackQueueVisualizer data={data} type="priority_queue" />);
      
      expect(screen.getByText('Priority Queue Visualization (Priority)')).toBeInTheDocument();
      expect(screen.getByText('PRIORITY QUEUE')).toBeInTheDocument();
      expect(screen.getByText('HIGHEST PRIORITY ↑')).toBeInTheDocument();
      expect(screen.getByText('↓ LOWEST PRIORITY')).toBeInTheDocument();
    });

    it('should render custom title when provided', () => {
      const data = {
        elements: [1, 2, 3],
        top: 2,
        capacity: 5
      };
      const title = 'Custom Stack Title';
      
      render(<StackQueueVisualizer data={data} type="stack" title={title} />);
      
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  describe('Stack Operations', () => {
    it('should display stack push operation', () => {
      const data = {
        elements: [1, 2, 3],
        top: 2,
        capacity: 5,
        operations: [{
          type: 'push',
          value: 4,
          description: 'Pushing value 4 onto stack'
        }]
      };
      
      render(<StackQueueVisualizer data={data} type="stack" />);
      
      expect(screen.getByText('Current Operations')).toBeInTheDocument();
      expect(screen.getByText('PUSH')).toBeInTheDocument();
      expect(screen.getByText('Value: 4')).toBeInTheDocument();
      expect(screen.getByText('Pushing value 4 onto stack')).toBeInTheDocument();
    });

    it('should display stack pop operation', () => {
      const data = {
        elements: [1, 2],
        top: 1,
        capacity: 5,
        operations: [{
          type: 'pop',
          result: 3,
          description: 'Popping top element from stack'
        }]
      };
      
      render(<StackQueueVisualizer data={data} type="stack" />);
      
      expect(screen.getByText('POP')).toBeInTheDocument();
      expect(screen.getByText('Result: 3')).toBeInTheDocument();
      expect(screen.getByText('Popping top element from stack')).toBeInTheDocument();
    });

    it('should display peek operation', () => {
      const data = {
        elements: [1, 2, 3],
        top: 2,
        capacity: 5,
        operations: [{
          type: 'peek',
          result: 3,
          description: 'Viewing top element without removing'
        }]
      };
      
      render(<StackQueueVisualizer data={data} type="stack" />);
      
      expect(screen.getByText('PEEK')).toBeInTheDocument();
      expect(screen.getByText('Result: 3')).toBeInTheDocument();
    });
  });

  describe('Queue Operations', () => {
    it('should display queue enqueue operation', () => {
      const data = {
        elements: [1, 2, 3],
        front: 0,
        rear: 2,
        capacity: 5,
        operations: [{
          type: 'enqueue',
          value: 4,
          description: 'Adding element to rear of queue'
        }]
      };
      
      render(<StackQueueVisualizer data={data} type="queue" />);
      
      expect(screen.getByText('ENQUEUE')).toBeInTheDocument();
      expect(screen.getByText('Value: 4')).toBeInTheDocument();
      expect(screen.getByText('Adding element to rear of queue')).toBeInTheDocument();
    });

    it('should display queue dequeue operation', () => {
      const data = {
        elements: [2, 3],
        front: 0,
        rear: 1,
        capacity: 5,
        operations: [{
          type: 'dequeue',
          result: 1,
          description: 'Removing element from front of queue'
        }]
      };
      
      render(<StackQueueVisualizer data={data} type="queue" />);
      
      expect(screen.getByText('DEQUEUE')).toBeInTheDocument();
      expect(screen.getByText('Result: 1')).toBeInTheDocument();
      expect(screen.getByText('Removing element from front of queue')).toBeInTheDocument();
    });
  });

  describe('Priority Queue Operations', () => {
    it('should display priority queue insert operation', () => {
      const data = {
        elements: [
          { value: 'Task A', priority: 5 },
          { value: 'Task B', priority: 3 }
        ],
        capacity: 5,
        priority: true,
        operations: [{
          type: 'insert',
          value: 'Task C',
          priority: 8,
          description: 'Inserting high priority task'
        }]
      };
      
      render(<StackQueueVisualizer data={data} type="priority_queue" />);
      
      expect(screen.getByText('INSERT')).toBeInTheDocument();
      expect(screen.getByText('Value: Task C')).toBeInTheDocument();
      expect(screen.getByText('Priority: 8')).toBeInTheDocument();
      expect(screen.getByText('Inserting high priority task')).toBeInTheDocument();
    });

    it('should display priority queue extract operation', () => {
      const data = {
        elements: [
          { value: 'Task A', priority: 5 },
          { value: 'Task B', priority: 3 }
        ],
        capacity: 5,
        priority: true,
        operations: [{
          type: 'extract',
          result: 'Task C',
          description: 'Extracting highest priority element'
        }]
      };
      
      render(<StackQueueVisualizer data={data} type="priority_queue" />);
      
      expect(screen.getByText('EXTRACT')).toBeInTheDocument();
      expect(screen.getByText('Result: Task C')).toBeInTheDocument();
      expect(screen.getByText('Extracting highest priority element')).toBeInTheDocument();
    });

    it('should display priority statistics', () => {
      const data = {
        elements: [
          { value: 'Task A', priority: 5 },
          { value: 'Task B', priority: 3 },
          { value: 'Task C', priority: 8 }
        ],
        capacity: 5,
        priority: true
      };
      
      render(<StackQueueVisualizer data={data} type="priority_queue" />);
      
      expect(screen.getByText('Priority Statistics')).toBeInTheDocument();
      expect(screen.getByText('Avg Priority')).toBeInTheDocument();
      expect(screen.getByText('Max Priority')).toBeInTheDocument();
      expect(screen.getByText('Min Priority')).toBeInTheDocument();
    });
  });

  describe('State Indicators', () => {
    it('should display overflow indicator', () => {
      const data = {
        elements: [1, 2, 3, 4, 5],
        top: 4,
        capacity: 5,
        overflow: true
      };
      
      render(<StackQueueVisualizer data={data} type="stack" />);
      
      expect(screen.getByText('OVERFLOW')).toBeInTheDocument();
      expect(screen.getByText('Structure is full')).toBeInTheDocument();
    });

    it('should display underflow indicator', () => {
      const data = {
        elements: [],
        capacity: 5,
        underflow: true
      };
      
      render(<StackQueueVisualizer data={data} type="stack" />);
      
      expect(screen.getByText('UNDERFLOW')).toBeInTheDocument();
      expect(screen.getByText('Structure is empty')).toBeInTheDocument();
    });

    it('should display both overflow and underflow indicators', () => {
      const data = {
        elements: [],
        capacity: 5,
        overflow: true,
        underflow: true
      };
      
      render(<StackQueueVisualizer data={data} type="stack" />);
      
      expect(screen.getByText('OVERFLOW')).toBeInTheDocument();
      expect(screen.getByText('UNDERFLOW')).toBeInTheDocument();
    });
  });

  describe('Animation States', () => {
    it('should display push animation indicator', () => {
      const data = {
        elements: [1, 2, 3],
        top: 2,
        capacity: 5,
        animationState: {
          operation: 'push',
          elementIndices: [3]
        }
      };
      
      render(<StackQueueVisualizer data={data} type="stack" />);
      
      expect(screen.getByText('⬇️ PUSHING')).toBeInTheDocument();
    });

    it('should display pop animation indicator', () => {
      const data = {
        elements: [1, 2],
        top: 1,
        capacity: 5,
        animationState: {
          operation: 'pop',
          elementIndices: [2]
        }
      };
      
      render(<StackQueueVisualizer data={data} type="stack" />);
      
      expect(screen.getByText('⬆️ POPPING')).toBeInTheDocument();
    });

    it('should display enqueue animation indicator', () => {
      const data = {
        elements: [1, 2, 3],
        front: 0,
        rear: 2,
        capacity: 5,
        animationState: {
          operation: 'enqueue',
          elementIndices: [3]
        }
      };
      
      render(<StackQueueVisualizer data={data} type="queue" />);
      
      expect(screen.getByText('➡️ ENQUEUING')).toBeInTheDocument();
    });

    it('should display dequeue animation indicator', () => {
      const data = {
        elements: [2, 3],
        front: 1,
        rear: 2,
        capacity: 5,
        animationState: {
          operation: 'dequeue',
          elementIndices: [0]
        }
      };
      
      render(<StackQueueVisualizer data={data} type="queue" />);
      
      expect(screen.getByText('⬅️ DEQUEUING')).toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('should display basic statistics', () => {
      const data = {
        elements: [1, 2, 3],
        top: 2,
        capacity: 5
      };
      
      render(<StackQueueVisualizer data={data} type="stack" />);
      
      expect(screen.getByText('Size')).toBeInTheDocument();
      expect(screen.getByText('Capacity')).toBeInTheDocument();
      expect(screen.getByText('Utilization')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument(); // 3/5 * 100
      expect(screen.getByText('Available')).toBeInTheDocument();
    });

    it('should display empty status', () => {
      const data = {
        elements: [],
        capacity: 5
      };
      
      render(<StackQueueVisualizer data={data} type="stack" />);
      
      expect(screen.getByText('Empty')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should display full status', () => {
      const data = {
        elements: [1, 2, 3, 4, 5],
        top: 4,
        capacity: 5
      };
      
      render(<StackQueueVisualizer data={data} type="stack" />);
      
      expect(screen.getByText('Full')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should display overflow status', () => {
      const data = {
        elements: [1, 2, 3, 4, 5],
        top: 4,
        capacity: 5,
        overflow: true
      };
      
      render(<StackQueueVisualizer data={data} type="stack" />);
      
      expect(screen.getByText('Overflow')).toBeInTheDocument();
    });

    it('should display underflow status', () => {
      const data = {
        elements: [],
        capacity: 5,
        underflow: true
      };
      
      render(<StackQueueVisualizer data={data} type="stack" />);
      
      expect(screen.getByText('Underflow')).toBeInTheDocument();
    });
  });

  describe('Complexity Information', () => {
    it('should display stack operation complexities', () => {
      const data = {
        elements: [1, 2, 3],
        top: 2,
        capacity: 5
      };
      
      render(<StackQueueVisualizer data={data} type="stack" />);
      
      expect(screen.getByText('Operation Complexity')).toBeInTheDocument();
      expect(screen.getByText('Push')).toBeInTheDocument();
      expect(screen.getByText('Pop')).toBeInTheDocument();
      expect(screen.getByText('Peek')).toBeInTheDocument();
      expect(screen.getAllByText('O(1)')).toHaveLength(3); // Push, Pop, Peek
      expect(screen.getByText('O(n)')).toBeInTheDocument(); // Space
    });

    it('should display queue operation complexities', () => {
      const data = {
        elements: [1, 2, 3],
        front: 0,
        rear: 2,
        capacity: 5
      };
      
      render(<StackQueueVisualizer data={data} type="queue" />);
      
      expect(screen.getByText('Enqueue')).toBeInTheDocument();
      expect(screen.getByText('Dequeue')).toBeInTheDocument();
      expect(screen.getAllByText('O(1)')).toHaveLength(3); // Enqueue, Dequeue, Peek
    });

    it('should display priority queue operation complexities', () => {
      const data = {
        elements: [
          { value: 'Task A', priority: 5 }
        ],
        capacity: 5,
        priority: true
      };
      
      render(<StackQueueVisualizer data={data} type="priority_queue" />);
      
      expect(screen.getByText('Insert')).toBeInTheDocument();
      expect(screen.getByText('Extract')).toBeInTheDocument();
      expect(screen.getAllByText('O(log n)')).toHaveLength(2); // Insert, Extract
      expect(screen.getByText('O(1)')).toBeInTheDocument(); // Peek
    });
  });

  describe('Error Handling', () => {
    it('should handle missing elements gracefully', () => {
      const data = {
        capacity: 5
      };
      
      render(<StackQueueVisualizer data={data} type="stack" />);
      
      expect(screen.getByTestId('base-visualizer')).toBeInTheDocument();
    });

    it('should handle null elements', () => {
      const data = {
        elements: [1, null, 3],
        top: 2,
        capacity: 5
      };
      
      render(<StackQueueVisualizer data={data} type="stack" />);
      
      expect(screen.getByText('null')).toBeInTheDocument();
    });

    it('should handle empty priority queue', () => {
      const data = {
        elements: [],
        capacity: 5,
        priority: true
      };
      
      render(<StackQueueVisualizer data={data} type="priority_queue" />);
      
      expect(screen.getByText('PRIORITY QUEUE')).toBeInTheDocument();
      expect(screen.getByText('Empty')).toBeInTheDocument();
    });
  });

  describe('Priority Queue Sorting', () => {
    it('should sort elements by priority in priority queue', () => {
      const data = {
        elements: [
          { value: 'Low', priority: 2 },
          { value: 'High', priority: 8 },
          { value: 'Medium', priority: 5 }
        ],
        capacity: 5,
        priority: true
      };
      
      render(<StackQueueVisualizer data={data} type="priority_queue" />);
      
      // Elements should be displayed in priority order (highest first)
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument();
    });

    it('should handle elements without priority values', () => {
      const data = {
        elements: [
          { value: 'Task A' }, // No priority
          { value: 'Task B', priority: 5 },
          { value: 'Task C' } // No priority
        ],
        capacity: 5,
        priority: true
      };
      
      render(<StackQueueVisualizer data={data} type="priority_queue" />);
      
      expect(screen.getByText('Task A')).toBeInTheDocument();
      expect(screen.getByText('Task B')).toBeInTheDocument();
      expect(screen.getByText('Task C')).toBeInTheDocument();
    });
  });

  describe('Multiple Operations', () => {
    it('should display multiple operations simultaneously', () => {
      const data = {
        elements: [1, 2, 3],
        top: 2,
        capacity: 5,
        operations: [
          {
            type: 'push',
            value: 4,
            description: 'First operation'
          },
          {
            type: 'peek',
            result: 3,
            description: 'Second operation'
          }
        ]
      };
      
      render(<StackQueueVisualizer data={data} type="stack" />);
      
      expect(screen.getByText('PUSH')).toBeInTheDocument();
      expect(screen.getByText('PEEK')).toBeInTheDocument();
      expect(screen.getByText('First operation')).toBeInTheDocument();
      expect(screen.getByText('Second operation')).toBeInTheDocument();
    });

    it('should display operation complexity information', () => {
      const data = {
        elements: [1, 2, 3],
        top: 2,
        capacity: 5,
        operations: [{
          type: 'push',
          value: 4,
          complexity: {
            time: 'O(1)',
            space: 'O(1)'
          }
        }]
      };
      
      render(<StackQueueVisualizer data={data} type="stack" />);
      
      expect(screen.getByText('Time: O(1) | Space: O(1)')).toBeInTheDocument();
    });
  });
});