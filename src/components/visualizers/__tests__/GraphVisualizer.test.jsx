import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import GraphVisualizer from '../GraphVisualizer';

// Mock browser APIs
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id));

// Mock CSS import
vi.mock('../GraphVisualizer.css', () => ({}));

// Shared mock data for multiple describe blocks
const sharedMockGraphData = {
  vertices: [
    { id: 'A', label: 'A', x: 100, y: 100, state: 'unvisited' },
    { id: 'B', label: 'B', x: 200, y: 100, state: 'visited' },
    { id: 'C', label: 'C', x: 150, y: 200, state: 'unvisited' }
  ],
  edges: [
    { from: 'A', to: 'B', weight: 5, directed: true },
    { from: 'B', to: 'C', weight: 3, directed: false },
    { from: 'A', to: 'C', weight: 8, directed: true }
  ],
  algorithm: 'dfs',
  currentVertex: 'B',
  visitedOrder: ['A', 'B'],
  shortestPath: [],
  distances: { A: 0, B: 5, C: Infinity }
};

const sharedMockStepData = {
  complexity: {
    stepTime: 'O(1)',
    stepSpace: 'O(1)'
  },
  edgeCases: ['Empty graph', 'Disconnected components'],
  pitfalls: ['Not handling cycles', 'Incorrect distance initialization']
};

describe('GraphVisualizer', () => {
  const mockGraphData = sharedMockGraphData;
  const mockStepData = sharedMockStepData;

  beforeEach(() => {
    // Reset any global state if needed
    vi.clearAllTimers();
  });

  test('renders without crashing', () => {
    const { container } = render(
      <GraphVisualizer
        data={mockGraphData}
        stepData={mockStepData}
        title="Test Graph"
      />
    );
    expect(container).toBeDefined();
  });

  test('renders basic graph elements', () => {
    render(
      <GraphVisualizer
        data={mockGraphData}
        stepData={mockStepData}
        title="Test Graph"
      />
    );

    // Check for basic elements that should always be present
    expect(screen.getByText('Test Graph')).toBeInTheDocument();
  });

  test('renders with different algorithms', () => {
    const bfsData = {
      ...mockGraphData,
      algorithm: 'bfs'
    };

    const { rerender } = render(
      <GraphVisualizer
        data={mockGraphData}
        stepData={mockStepData}
      />
    );

    // Test DFS
    expect(screen.getByText(/Depth-First/)).toBeInTheDocument();

    // Test BFS
    rerender(
      <GraphVisualizer
        data={bfsData}
        stepData={mockStepData}
      />
    );
    expect(screen.getByText(/Breadth-First/)).toBeInTheDocument();
  });

  test('renders SVG visualization', () => {
    render(
      <GraphVisualizer
        data={mockGraphData}
        stepData={mockStepData}
      />
    );

    // Check that SVG is rendered
    const svgElement = document.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  test('handles empty graph gracefully', () => {
    const emptyData = {
      vertices: [],
      edges: [],
      algorithm: 'dfs',
      visitedOrder: []
    };

    const { container } = render(
      <GraphVisualizer
        data={emptyData}
        stepData={mockStepData}
      />
    );

    // Should render without crashing
    expect(container).toBeDefined();
  });

  test('shows error for invalid data', () => {
    const invalidData = {
      // Missing required vertices and edges
      algorithm: 'dfs'
    };

    render(
      <GraphVisualizer
        data={invalidData}
        stepData={mockStepData}
      />
    );

    expect(screen.getByText(/Invalid graph data/)).toBeInTheDocument();
  });
});

// Basic integration tests
describe('GraphVisualizer Integration', () => {
  const mockGraphData = sharedMockGraphData;
  const mockStepData = sharedMockStepData;
  test('component initializes correctly', () => {
    const result = render(
      <GraphVisualizer
        data={mockGraphData}
        stepData={mockStepData}
      />
    );
    expect(result).toBeDefined();
  });

  test('handles different data structures', () => {
    const minimalData = {
      vertices: [{ id: 'A', label: 'A' }],
      edges: [],
      algorithm: 'dfs',
      visitedOrder: []
    };

    const result = render(
      <GraphVisualizer
        data={minimalData}
        stepData={mockStepData}
      />
    );
    expect(result).toBeDefined();
  });
});