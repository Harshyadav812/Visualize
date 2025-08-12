import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import LinkedListVisualizer from '../LinkedListVisualizer';

// Mock BaseVisualizer
vi.mock('../BaseVisualizer', () => ({
    default: ({ children, title }) => (
        <div data-testid="base-visualizer">
            {title && <h3 data-testid="visualizer-title">{title}</h3>}
            {children}
        </div>
    ),
    withErrorBoundary: (Component) => Component,
    VisualizerUtils: {
        validateData: vi.fn(),
        formatValue: (value) => {
            if (value === null || value === undefined) return 'null';
            if (typeof value === 'string') return `"${value}"`;
            return String(value);
        }
    }
}));

describe('LinkedListVisualizer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    describe('Basic Rendering', () => {
        it('should render base visualizer', () => {
            const data = {
                nodes: [{ id: '1', value: 10, next: null }],
                head: '1',
                type: 'singly'
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.getByTestId('base-visualizer')).toBeInTheDocument();
        });

        it('should render node values', () => {
            const data = {
                nodes: [
                    { id: '1', value: 10, next: '2' },
                    { id: '2', value: 20, next: null }
                ],
                head: '1',
                type: 'singly'
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.getAllByText('10')).toHaveLength(2); // Node display + memory layout
            expect(screen.getAllByText('20')).toHaveLength(2); // Node display + memory layout
        });

        it('should show head pointer when head exists', () => {
            const data = {
                nodes: [{ id: '1', value: 10, next: null }],
                head: '1',
                type: 'singly'
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.getByText('HEAD')).toBeInTheDocument();
        });

        it('should show tail pointer when tail exists', () => {
            const data = {
                nodes: [{ id: '1', value: 10, next: null }],
                head: '1',
                tail: '1',
                type: 'singly'
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.getByText('TAIL')).toBeInTheDocument();
        });

        it('should show NULL terminator', () => {
            const data = {
                nodes: [{ id: '1', value: 10, next: null }],
                head: '1',
                type: 'singly'
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.getAllByText('NULL')).toHaveLength(3); // Terminator + pointer info + memory layout
        });

        it('should render with custom title', () => {
            const data = {
                nodes: [{ id: '1', value: 10, next: null }],
                head: '1',
                type: 'singly'
            };
            const title = 'Custom Linked List';

            render(<LinkedListVisualizer data={data} title={title} />);

            expect(screen.getByTestId('visualizer-title')).toHaveTextContent(title);
        });
    });

    describe('Node States', () => {
        it('should render nodes with different states', () => {
            const data = {
                nodes: [
                    { id: '1', value: 10, next: '2', state: 'current' },
                    { id: '2', value: 20, next: '3', state: 'visited' },
                    { id: '3', value: 30, next: null, state: 'target' }
                ],
                head: '1',
                type: 'singly'
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.getAllByText('10')).toHaveLength(2); // Node display + memory layout
            expect(screen.getAllByText('20')).toHaveLength(2); // Node display + memory layout
            expect(screen.getAllByText('30')).toHaveLength(2); // Node display + memory layout
        });

        it('should render operation indicators on nodes', () => {
            const data = {
                nodes: [
                    { id: '1', value: 10, next: null, operation: 'insert' }
                ],
                head: '1',
                type: 'singly'
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.getByText('INSERT')).toBeInTheDocument();
        });
    });

    describe('Memory Simulation', () => {
        it('should show memory layout section', () => {
            const data = {
                nodes: [{ id: '1', value: 10, next: null }],
                head: '1',
                type: 'singly'
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.getByText('Memory Layout')).toBeInTheDocument();
        });

        it('should display node IDs in memory layout', () => {
            const data = {
                nodes: [{ id: '1', value: 10, next: null }],
                head: '1',
                type: 'singly'
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.getByText('Node 1')).toBeInTheDocument();
        });
    });

    describe('Traversal Features', () => {
        it('should show traversal status when provided', () => {
            const data = {
                nodes: [{ id: '1', value: 10, next: null }],
                head: '1',
                type: 'singly',
                traversal: {
                    type: 'forward',
                    currentNode: '1',
                    visitedNodes: [],
                    totalNodes: 1
                }
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.getByText('Traversal Status: FORWARD')).toBeInTheDocument();
        });

        it('should show current node in traversal', () => {
            const data = {
                nodes: [{ id: '1', value: 10, next: null }],
                head: '1',
                type: 'singly',
                traversal: {
                    currentNode: '1',
                    visitedNodes: [],
                    totalNodes: 1
                }
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.getByText('Current Node:')).toBeInTheDocument();
        });

        it('should show visited count', () => {
            const data = {
                nodes: [{ id: '1', value: 10, next: null }],
                head: '1',
                type: 'singly',
                traversal: {
                    visitedNodes: ['1'],
                    totalNodes: 1
                }
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.getByText('Visited:')).toBeInTheDocument();
        });
    });

    describe('Operations Display', () => {
        it('should show operations section when operations exist', () => {
            const data = {
                nodes: [{ id: '1', value: 10, next: null }],
                head: '1',
                type: 'singly',
                operations: [
                    {
                        type: 'insert',
                        description: 'Inserting node'
                    }
                ]
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.getByText('Current Operations')).toBeInTheDocument();
        });

        it('should display operation type', () => {
            const data = {
                nodes: [{ id: '1', value: 10, next: null }],
                head: '1',
                type: 'singly',
                operations: [
                    {
                        type: 'insert',
                        description: 'Inserting node'
                    }
                ]
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.getByText('INSERT')).toBeInTheDocument();
        });

        it('should display operation description', () => {
            const data = {
                nodes: [{ id: '1', value: 10, next: null }],
                head: '1',
                type: 'singly',
                operations: [
                    {
                        type: 'delete',
                        description: 'Deleting node'
                    }
                ]
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.getByText('Deleting node')).toBeInTheDocument();
        });
    });

    describe('Statistics Display', () => {
        it('should show total nodes count', () => {
            const data = {
                nodes: [
                    { id: '1', value: 10, next: '2' },
                    { id: '2', value: 20, next: null }
                ],
                head: '1',
                type: 'singly'
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.getByText('Total Nodes')).toBeInTheDocument();
        });

        it('should show list type', () => {
            const data = {
                nodes: [{ id: '1', value: 10, next: null }],
                head: '1',
                type: 'singly'
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.getByText('List Type')).toBeInTheDocument();
            expect(screen.getByText('Singly')).toBeInTheDocument();
        });

        it('should show memory usage', () => {
            const data = {
                nodes: [{ id: '1', value: 10, next: null }],
                head: '1',
                type: 'singly'
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.getByText('Memory Usage')).toBeInTheDocument();
        });

        it('should show memory analysis section', () => {
            const data = {
                nodes: [{ id: '1', value: 10, next: null }],
                head: '1',
                type: 'singly'
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.getByText('Memory Analysis')).toBeInTheDocument();
        });
    });

    describe('Value Types', () => {
        it('should handle string values', () => {
            const data = {
                nodes: [{ id: '1', value: 'hello', next: null }],
                head: '1',
                type: 'singly'
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.getAllByText('"hello"')).toHaveLength(2); // Node display + memory layout
        });

        it('should handle null values', () => {
            const data = {
                nodes: [{ id: '1', value: null, next: null }],
                head: '1',
                type: 'singly'
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.getAllByText('null')).toHaveLength(2); // Node display + memory layout
        });

        it('should handle numeric values', () => {
            const data = {
                nodes: [{ id: '1', value: 42, next: null }],
                head: '1',
                type: 'singly'
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.getAllByText('42')).toHaveLength(2); // Node display + memory layout
        });
    });

    describe('Error Handling', () => {
        it('should render without crashing on empty data', () => {
            const data = {
                nodes: [],
                type: 'singly'
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.getByTestId('base-visualizer')).toBeInTheDocument();
        });

        it('should not show operations section when no operations', () => {
            const data = {
                nodes: [{ id: '1', value: 10, next: null }],
                head: '1',
                type: 'singly',
                operations: []
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.queryByText('Current Operations')).not.toBeInTheDocument();
        });
    });

    describe('Animations', () => {
        it('should render with animations without crashing', () => {
            const data = {
                nodes: [{ id: '1', value: 10, next: null }],
                head: '1',
                type: 'singly',
                animations: [
                    {
                        type: 'node',
                        nodeId: '1',
                        duration: 100
                    }
                ]
            };

            render(<LinkedListVisualizer data={data} />);

            expect(screen.getAllByText('10')).toHaveLength(2); // Node display + memory layout
        });
    });
});