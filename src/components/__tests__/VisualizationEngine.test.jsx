import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import VisualizationEngine from '../VisualizationEngine';
import {
  detectVisualizationType,
  validateVisualizationData
} from '../../utils/visualizationEngineUtils';

// Mock the visualizer components
vi.mock('../visualizers/ArrayVisualizer', () => ({
  default: ({ data, title }) => <div data-testid="array-visualizer">{title}: {JSON.stringify(data)}</div>
}));

vi.mock('../visualizers/TreeVisualizer', () => ({
  default: ({ data, title }) => <div data-testid="tree-visualizer">{title}: {JSON.stringify(data)}</div>
}));

vi.mock('../visualizers/GraphVisualizer', () => ({
  default: ({ data, title }) => <div data-testid="graph-visualizer">{title}: {JSON.stringify(data)}</div>
}));

vi.mock('../visualizers/LinkedListVisualizer', () => ({
  default: ({ data, title }) => <div data-testid="linkedlist-visualizer">{title}: {JSON.stringify(data)}</div>
}));

vi.mock('../visualizers/StackQueueVisualizer', () => ({
  default: ({ data, title, type }) => <div data-testid="stack-queue-visualizer">{title}: {type} - {JSON.stringify(data)}</div>
}));

vi.mock('../visualizers/RecursionVisualizer', () => ({
  default: ({ data, title }) => <div data-testid="recursion-visualizer">{title}: {JSON.stringify(data)}</div>
}));

describe('VisualizationEngine', () => {
  const mockAnalysis = {
    steps: [
      {
        stepNumber: 1,
        title: 'Test Step',
        description: 'Test description',
        visualization: {
          type: 'array',
          data: { array: [1, 2, 3] }
        }
      }
    ]
  };

  describe('Component Rendering', () => {
    it('should render array visualizer for array type', () => {
      render(
        <VisualizationEngine
          analysis={mockAnalysis}
          currentStep={0}
          onStepChange={() => { }}
        />
      );

      expect(screen.getByTestId('array-visualizer')).toBeInTheDocument();
      expect(screen.getByText(/Array Visualization/)).toBeInTheDocument();
    });

    it('should render tree visualizer for tree type', () => {
      const treeAnalysis = {
        steps: [{
          ...mockAnalysis.steps[0],
          visualization: {
            type: 'tree',
            data: { nodes: [{ id: '1', value: 10 }] }
          }
        }]
      };

      render(
        <VisualizationEngine
          analysis={treeAnalysis}
          currentStep={0}
          onStepChange={() => { }}
        />
      );

      expect(screen.getByTestId('tree-visualizer')).toBeInTheDocument();
    });

    it('should render graph visualizer for graph type', () => {
      const graphAnalysis = {
        steps: [{
          ...mockAnalysis.steps[0],
          visualization: {
            type: 'graph',
            data: { vertices: [], edges: [] }
          }
        }]
      };

      render(
        <VisualizationEngine
          analysis={graphAnalysis}
          currentStep={0}
          onStepChange={() => { }}
        />
      );

      expect(screen.getByTestId('graph-visualizer')).toBeInTheDocument();
    });

    it('should render linked list visualizer for linkedlist type', () => {
      const linkedListAnalysis = {
        steps: [{
          ...mockAnalysis.steps[0],
          visualization: {
            type: 'linkedlist',
            data: { nodes: [] }
          }
        }]
      };

      render(
        <VisualizationEngine
          analysis={linkedListAnalysis}
          currentStep={0}
          onStepChange={() => { }}
        />
      );

      expect(screen.getByTestId('linkedlist-visualizer')).toBeInTheDocument();
    });

    it('should render stack visualizer for stack type', () => {
      const stackAnalysis = {
        steps: [{
          ...mockAnalysis.steps[0],
          visualization: {
            type: 'stack',
            data: { elements: [] }
          }
        }]
      };

      render(
        <VisualizationEngine
          analysis={stackAnalysis}
          currentStep={0}
          onStepChange={() => { }}
        />
      );

      expect(screen.getByTestId('stack-queue-visualizer')).toBeInTheDocument();
    });

    it('should render queue visualizer for queue type', () => {
      const queueAnalysis = {
        steps: [{
          ...mockAnalysis.steps[0],
          visualization: {
            type: 'queue',
            data: { elements: [] }
          }
        }]
      };

      render(
        <VisualizationEngine
          analysis={queueAnalysis}
          currentStep={0}
          onStepChange={() => { }}
        />
      );

      expect(screen.getByTestId('stack-queue-visualizer')).toBeInTheDocument();
    });

    it('should render recursion visualizer for recursion type', () => {
      const recursionAnalysis = {
        steps: [{
          ...mockAnalysis.steps[0],
          visualization: {
            type: 'recursion',
            data: { callStack: [] }
          }
        }]
      };

      render(
        <VisualizationEngine
          analysis={recursionAnalysis}
          currentStep={0}
          onStepChange={() => { }}
        />
      );

      expect(screen.getByTestId('recursion-visualizer')).toBeInTheDocument();
    });
  });

  describe('Legacy Support', () => {
    it('should handle legacy window visualization type', () => {
      const windowAnalysis = {
        steps: [{
          ...mockAnalysis.steps[0],
          visualization: {
            type: 'window',
            data: { array: [1, 2, 3], windowStart: 0, windowEnd: 1 }
          }
        }]
      };

      render(
        <VisualizationEngine
          analysis={windowAnalysis}
          currentStep={0}
          onStepChange={() => { }}
        />
      );

      expect(screen.getByTestId('array-visualizer')).toBeInTheDocument();
    });

    it('should handle legacy pointers visualization type', () => {
      const pointersAnalysis = {
        steps: [{
          ...mockAnalysis.steps[0],
          visualization: {
            type: 'pointers',
            data: { array: [1, 2, 3], pointers: [] }
          }
        }]
      };

      render(
        <VisualizationEngine
          analysis={pointersAnalysis}
          currentStep={0}
          onStepChange={() => { }}
        />
      );

      expect(screen.getByTestId('array-visualizer')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should show error for invalid analysis data', () => {
      render(
        <VisualizationEngine
          analysis={null}
          currentStep={0}
          onStepChange={() => { }}
        />
      );

      expect(screen.getByText(/Invalid analysis data/)).toBeInTheDocument();
    });

    it('should show error for invalid step index', () => {
      render(
        <VisualizationEngine
          analysis={mockAnalysis}
          currentStep={5}
          onStepChange={() => { }}
        />
      );

      expect(screen.getByText(/Invalid step index/)).toBeInTheDocument();
    });

    it('should show fallback for unknown visualization type', () => {
      const unknownAnalysis = {
        steps: [{
          ...mockAnalysis.steps[0],
          visualization: {
            type: 'unknown',
            data: { test: 'data' }
          }
        }]
      };

      render(
        <VisualizationEngine
          analysis={unknownAnalysis}
          currentStep={0}
          onStepChange={() => { }}
        />
      );

      expect(screen.getByText(/Unknown Visualization Type/)).toBeInTheDocument();
      expect(screen.getByText(/unknown.*is not supported/)).toBeInTheDocument();
    });

    it('should show message when no visualization data available', () => {
      const noVizAnalysis = {
        steps: [{
          stepNumber: 1,
          title: 'Test Step',
          description: 'Test description'
          // No visualization property
        }]
      };

      render(
        <VisualizationEngine
          analysis={noVizAnalysis}
          currentStep={0}
          onStepChange={() => { }}
        />
      );

      expect(screen.getByText(/No visualization data available/)).toBeInTheDocument();
    });
  });

  describe('Case Insensitive Type Matching', () => {
    it('should handle uppercase visualization types', () => {
      const upperCaseAnalysis = {
        steps: [{
          ...mockAnalysis.steps[0],
          visualization: {
            type: 'ARRAY',
            data: { array: [1, 2, 3] }
          }
        }]
      };

      render(
        <VisualizationEngine
          analysis={upperCaseAnalysis}
          currentStep={0}
          onStepChange={() => { }}
        />
      );

      expect(screen.getByTestId('array-visualizer')).toBeInTheDocument();
    });

    it('should handle mixed case visualization types', () => {
      const mixedCaseAnalysis = {
        steps: [{
          ...mockAnalysis.steps[0],
          visualization: {
            type: 'LinkedList',
            data: { nodes: [] }
          }
        }]
      };

      render(
        <VisualizationEngine
          analysis={mixedCaseAnalysis}
          currentStep={0}
          onStepChange={() => { }}
        />
      );

      expect(screen.getByTestId('linkedlist-visualizer')).toBeInTheDocument();
    });
  });
});

describe('detectVisualizationType', () => {
  it('should detect array type from dataStructures', () => {
    const analysis = {
      dataStructures: ['array', 'hashmap'],
      algorithmType: 'sliding_window'
    };

    const result = detectVisualizationType(analysis);
    expect(result).toBe('array');
  });

  it('should detect tree type from dataStructures', () => {
    const analysis = {
      dataStructures: ['tree'],
      algorithmType: 'dfs'
    };

    const result = detectVisualizationType(analysis);
    expect(result).toBe('tree');
  });

  it('should fallback to algorithm type mapping', () => {
    const analysis = {
      algorithmType: 'dfs'
    };

    const result = detectVisualizationType(analysis);
    expect(result).toBe('graph');
  });

  it('should default to array for unknown types', () => {
    const analysis = {
      algorithmType: 'unknown'
    };

    const result = detectVisualizationType(analysis);
    expect(result).toBe('array');
  });

  it('should handle null analysis', () => {
    const result = detectVisualizationType(null);
    expect(result).toBe('array');
  });
});

describe('validateVisualizationData', () => {
  it('should validate array visualization data', () => {
    const visualization = {
      type: 'array',
      data: { array: [1, 2, 3] }
    };

    const result = validateVisualizationData(visualization);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate tree visualization data', () => {
    const visualization = {
      type: 'tree',
      data: { nodes: [{ id: '1', value: 10 }] }
    };

    const result = validateVisualizationData(visualization);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate graph visualization data', () => {
    const visualization = {
      type: 'graph',
      data: { vertices: [], edges: [] }
    };

    const result = validateVisualizationData(visualization);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should return errors for missing type', () => {
    const visualization = {
      data: { array: [1, 2, 3] }
    };

    const result = validateVisualizationData(visualization);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Visualization type is missing');
  });

  it('should return errors for missing data', () => {
    const visualization = {
      type: 'array'
    };

    const result = validateVisualizationData(visualization);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Visualization data is missing');
  });

  it('should return errors for invalid array data', () => {
    const visualization = {
      type: 'array',
      data: { notArray: 'invalid' }
    };

    const result = validateVisualizationData(visualization);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Array visualization requires array or arrays data');
  });

  it('should return errors for invalid tree data', () => {
    const visualization = {
      type: 'tree',
      data: { notNodes: 'invalid' }
    };

    const result = validateVisualizationData(visualization);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Tree visualization requires nodes array');
  });

  it('should return errors for invalid graph data', () => {
    const visualization = {
      type: 'graph',
      data: { vertices: [] } // Missing edges
    };

    const result = validateVisualizationData(visualization);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Graph visualization requires vertices and edges arrays');
  });

  it('should handle null visualization', () => {
    const result = validateVisualizationData(null);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Visualization object is null or undefined');
  });
});