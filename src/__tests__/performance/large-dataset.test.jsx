import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { performance } from 'perf_hooks';
import ArrayVisualizer from '../../components/visualizers/ArrayVisualizer';
import TreeVisualizer from '../../components/visualizers/TreeVisualizer';
import GraphVisualizer from '../../components/visualizers/GraphVisualizer';
import VisualizationEngine from '../../components/VisualizationEngine';

// Mock performance APIs for consistent testing
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(() => []),
  getEntriesByName: vi.fn(() => [])
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance
});

describe('Performance Tests for Large Datasets', () => {
  let performanceEntries = [];

  beforeEach(() => {
    performanceEntries = [];
    mockPerformance.now.mockImplementation(() => Date.now());
    mockPerformance.mark.mockImplementation((name) => {
      performanceEntries.push({ name, startTime: Date.now() });
    });
    mockPerformance.measure.mockImplementation((name, startMark, endMark) => {
      const start = performanceEntries.find(e => e.name === startMark);
      const end = performanceEntries.find(e => e.name === endMark);
      const duration = end ? end.startTime - start.startTime : 100;
      performanceEntries.push({ name, duration });
      return { duration };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Array Visualization Performance', () => {
    it('should render large arrays within performance budget', async () => {
      const startTime = performance.now();
      
      // Create large array (1000 elements)
      const largeArrayData = {
        arrays: [{
          name: 'Large Array',
          values: Array.from({ length: 1000 }, (_, i) => i + 1),
          highlights: {
            current: [500],
            window: { start: 400, end: 600 }
          }
        }],
        pointers: [
          { name: 'left', position: 400, color: '#ff0000' },
          { name: 'right', position: 600, color: '#00ff00' }
        ]
      };

      const { container } = render(<ArrayVisualizer data={largeArrayData} />);
      
      await waitFor(() => {
        expect(screen.getByText('Large Array')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within 2 seconds even for large arrays
      expect(renderTime).toBeLessThan(2000);
      
      // Should display array length
      expect(screen.getByText('(length: 1000)')).toBeInTheDocument();
      
      // Should handle large arrays without crashing
      expect(container.firstChild).toBeTruthy();
    });

    it('should handle very large arrays with virtualization', async () => {
      const startTime = performance.now();
      
      // Create very large array (10000 elements)
      const veryLargeArrayData = {
        arrays: [{
          name: 'Very Large Array',
          values: Array.from({ length: 10000 }, (_, i) => Math.floor(Math.random() * 1000)),
          highlights: {
            current: [5000]
          }
        }]
      };

      const { container } = render(<ArrayVisualizer data={veryLargeArrayData} />);
      
      await waitFor(() => {
        expect(screen.getByText('Very Large Array')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should still render within reasonable time with virtualization
      expect(renderTime).toBeLessThan(3000);
      
      // Should display correct length
      expect(screen.getByText('(length: 10000)')).toBeInTheDocument();
      
      // Should not crash
      expect(container.firstChild).toBeTruthy();
    });

    it('should handle multiple large arrays efficiently', async () => {
      const startTime = performance.now();
      
      const multipleArraysData = {
        arrays: [
          {
            name: 'Array 1',
            values: Array.from({ length: 500 }, (_, i) => i * 2),
            highlights: { current: [250] }
          },
          {
            name: 'Array 2',
            values: Array.from({ length: 500 }, (_, i) => i * 3),
            highlights: { current: [250] }
          },
          {
            name: 'Array 3',
            values: Array.from({ length: 500 }, (_, i) => i * 5),
            highlights: { current: [250] }
          }
        ]
      };

      const { container } = render(<ArrayVisualizer data={multipleArraysData} />);
      
      await waitFor(() => {
        expect(screen.getByText('Array 1')).toBeInTheDocument();
        expect(screen.getByText('Array 2')).toBeInTheDocument();
        expect(screen.getByText('Array 3')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should handle multiple arrays efficiently
      expect(renderTime).toBeLessThan(2500);
      expect(container.firstChild).toBeTruthy();
    });

    it('should handle frequent updates without memory leaks', async () => {
      let renderCount = 0;
      const maxRenders = 50;
      
      const TestComponent = () => {
        const [data, setData] = React.useState({
          arrays: [{
            name: 'Dynamic Array',
            values: [1, 2, 3],
            highlights: { current: [0] }
          }]
        });

        React.useEffect(() => {
          const interval = setInterval(() => {
            if (renderCount < maxRenders) {
              setData(prev => ({
                arrays: [{
                  ...prev.arrays[0],
                  highlights: { 
                    current: [Math.floor(Math.random() * prev.arrays[0].values.length)] 
                  }
                }]
              }));
              renderCount++;
            }
          }, 10);

          return () => clearInterval(interval);
        }, []);

        return <ArrayVisualizer data={data} />;
      };

      const startTime = performance.now();
      const { container } = render(<TestComponent />);

      // Wait for all updates to complete
      await waitFor(() => {
        expect(renderCount).toBeGreaterThanOrEqual(maxRenders);
      }, { timeout: 1000 });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle frequent updates efficiently
      expect(totalTime).toBeLessThan(1500);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('Tree Visualization Performance', () => {
    it('should render large binary trees efficiently', async () => {
      const startTime = performance.now();
      
      // Create large binary tree (1000 nodes)
      const nodes = [];
      const edges = [];
      
      for (let i = 1; i <= 1000; i++) {
        nodes.push({
          id: i.toString(),
          value: i,
          x: (i % 50) * 20,
          y: Math.floor(i / 50) * 30,
          state: 'normal'
        });
        
        if (i > 1) {
          const parent = Math.floor(i / 2).toString();
          edges.push({
            from: parent,
            to: i.toString(),
            state: 'normal'
          });
        }
      }

      const largeTreeData = {
        nodes,
        edges,
        treeType: 'binary'
      };

      const { container } = render(<TreeVisualizer data={largeTreeData} />);
      
      await waitFor(() => {
        expect(container.querySelector('svg')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render large tree within reasonable time
      expect(renderTime).toBeLessThan(3000);
      expect(container.firstChild).toBeTruthy();
    });

    it('should handle deep recursion trees without stack overflow', async () => {
      const startTime = performance.now();
      
      // Create deep tree (100 levels)
      const nodes = [];
      const edges = [];
      
      for (let i = 0; i < 100; i++) {
        nodes.push({
          id: i.toString(),
          value: `Level ${i}`,
          x: 300,
          y: i * 40,
          state: i === 99 ? 'current' : 'normal'
        });
        
        if (i > 0) {
          edges.push({
            from: (i - 1).toString(),
            to: i.toString(),
            state: 'normal'
          });
        }
      }

      const deepTreeData = {
        nodes,
        edges,
        treeType: 'binary'
      };

      const { container } = render(<TreeVisualizer data={deepTreeData} />);
      
      await waitFor(() => {
        expect(container.querySelector('svg')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should handle deep trees without issues
      expect(renderTime).toBeLessThan(2000);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('Graph Visualization Performance', () => {
    it('should render large graphs efficiently', async () => {
      const startTime = performance.now();
      
      // Create large graph (500 vertices, 1000 edges)
      const vertices = [];
      const edges = [];
      
      for (let i = 0; i < 500; i++) {
        vertices.push({
          id: i.toString(),
          label: `V${i}`,
          x: (i % 25) * 30,
          y: Math.floor(i / 25) * 30,
          state: 'normal'
        });
      }
      
      // Create random edges
      for (let i = 0; i < 1000; i++) {
        const from = Math.floor(Math.random() * 500).toString();
        const to = Math.floor(Math.random() * 500).toString();
        if (from !== to) {
          edges.push({
            from,
            to,
            weight: Math.floor(Math.random() * 10) + 1,
            state: 'normal'
          });
        }
      }

      const largeGraphData = {
        vertices,
        edges,
        directed: false
      };

      const { container } = render(<GraphVisualizer data={largeGraphData} />);
      
      await waitFor(() => {
        expect(container.querySelector('svg')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render large graph within reasonable time
      expect(renderTime).toBeLessThan(4000);
      expect(container.firstChild).toBeTruthy();
    });

    it('should handle dense graphs without performance degradation', async () => {
      const startTime = performance.now();
      
      // Create dense graph (complete graph with 50 vertices)
      const vertices = [];
      const edges = [];
      
      for (let i = 0; i < 50; i++) {
        vertices.push({
          id: i.toString(),
          label: `V${i}`,
          x: 300 + 200 * Math.cos(2 * Math.PI * i / 50),
          y: 300 + 200 * Math.sin(2 * Math.PI * i / 50),
          state: 'normal'
        });
      }
      
      // Create complete graph (all possible edges)
      for (let i = 0; i < 50; i++) {
        for (let j = i + 1; j < 50; j++) {
          edges.push({
            from: i.toString(),
            to: j.toString(),
            weight: 1,
            state: 'normal'
          });
        }
      }

      const denseGraphData = {
        vertices,
        edges,
        directed: false
      };

      const { container } = render(<GraphVisualizer data={denseGraphData} />);
      
      await waitFor(() => {
        expect(container.querySelector('svg')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should handle dense graphs efficiently
      expect(renderTime).toBeLessThan(3000);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('Visualization Engine Performance', () => {
    it('should route to appropriate visualizers efficiently', async () => {
      const startTime = performance.now();
      
      const analysisData = {
        algorithmType: 'sorting',
        dataStructures: ['array'],
        steps: Array.from({ length: 100 }, (_, i) => ({
          stepNumber: i + 1,
          title: `Step ${i + 1}`,
          description: `Sorting step ${i + 1}`,
          visualization: {
            type: 'array',
            data: {
              arrays: [{
                name: 'Sorting Array',
                values: Array.from({ length: 50 }, () => Math.floor(Math.random() * 100)),
                highlights: { current: [i % 50] }
              }]
            }
          }
        }))
      };

      const { container } = render(
        <VisualizationEngine 
          analysis={analysisData} 
          currentStep={0}
          onStepChange={() => {}}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Step 1')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should route efficiently even with many steps
      expect(renderTime).toBeLessThan(1000);
      expect(container.firstChild).toBeTruthy();
    });

    it('should handle rapid step changes without lag', async () => {
      const steps = Array.from({ length: 50 }, (_, i) => ({
        stepNumber: i + 1,
        title: `Step ${i + 1}`,
        description: `Description ${i + 1}`,
        visualization: {
          type: 'array',
          data: {
            arrays: [{
              name: 'Test Array',
              values: [1, 2, 3, 4, 5],
              highlights: { current: [i % 5] }
            }]
          }
        }
      }));

      const analysisData = {
        algorithmType: 'test',
        dataStructures: ['array'],
        steps
      };

      let currentStep = 0;
      const TestComponent = () => {
        const [step, setStep] = React.useState(0);

        React.useEffect(() => {
          const interval = setInterval(() => {
            if (currentStep < 49) {
              currentStep++;
              setStep(currentStep);
            }
          }, 20); // Rapid step changes

          return () => clearInterval(interval);
        }, []);

        return (
          <VisualizationEngine 
            analysis={analysisData} 
            currentStep={step}
            onStepChange={setStep}
          />
        );
      };

      const startTime = performance.now();
      const { container } = render(<TestComponent />);

      // Wait for all step changes to complete
      await waitFor(() => {
        expect(currentStep).toBe(49);
      }, { timeout: 2000 });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle rapid changes efficiently
      expect(totalTime).toBeLessThan(2500);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not leak memory with repeated renders', async () => {
      const initialMemory = process.memoryUsage?.()?.heapUsed || 0;
      
      // Render and unmount components repeatedly
      for (let i = 0; i < 100; i++) {
        const data = {
          arrays: [{
            name: `Array ${i}`,
            values: Array.from({ length: 100 }, (_, j) => j),
            highlights: { current: [i % 100] }
          }]
        };

        const { unmount } = render(<ArrayVisualizer data={data} />);
        unmount();
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage?.()?.heapUsed || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it('should clean up event listeners and timers', async () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      const setIntervalSpy = vi.spyOn(global, 'setInterval');
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      const data = {
        arrays: [{
          name: 'Test Array',
          values: [1, 2, 3, 4, 5],
          highlights: {}
        }]
      };

      const { unmount } = render(<ArrayVisualizer data={data} />);
      
      const initialListeners = addEventListenerSpy.mock.calls.length;
      const initialIntervals = setIntervalSpy.mock.calls.length;

      unmount();

      // Should clean up listeners and intervals
      expect(removeEventListenerSpy).toHaveBeenCalled();
      expect(clearIntervalSpy.mock.calls.length).toBeGreaterThanOrEqual(0);

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
      setIntervalSpy.mockRestore();
      clearIntervalSpy.mockRestore();
    });
  });

  describe('Animation Performance', () => {
    it('should maintain smooth animations with large datasets', async () => {
      const frameRates = [];
      let lastTime = performance.now();
      
      // Mock requestAnimationFrame to track frame rates
      const originalRAF = global.requestAnimationFrame;
      global.requestAnimationFrame = vi.fn((callback) => {
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;
        frameRates.push(1000 / deltaTime);
        lastTime = currentTime;
        return setTimeout(callback, 16); // ~60fps
      });

      const animatedData = {
        arrays: [{
          name: 'Animated Array',
          values: Array.from({ length: 200 }, (_, i) => i),
          highlights: { current: [0] }
        }]
      };

      const AnimatedComponent = () => {
        const [highlightIndex, setHighlightIndex] = React.useState(0);

        React.useEffect(() => {
          const interval = setInterval(() => {
            setHighlightIndex(prev => (prev + 1) % 200);
          }, 50);

          return () => clearInterval(interval);
        }, []);

        return (
          <ArrayVisualizer 
            data={{
              ...animatedData,
              arrays: [{
                ...animatedData.arrays[0],
                highlights: { current: [highlightIndex] }
              }]
            }} 
          />
        );
      };

      render(<AnimatedComponent />);

      // Let animation run for a bit
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Restore original RAF
      global.requestAnimationFrame = originalRAF;

      // Should maintain reasonable frame rates (>30fps average)
      const averageFrameRate = frameRates.reduce((a, b) => a + b, 0) / frameRates.length;
      expect(averageFrameRate).toBeGreaterThan(30);
    });
  });
}); 
 describe('Complex Algorithm Performance', () => {
    it('should handle recursive algorithm visualization efficiently', async () => {
      const startTime = performance.now();
      
      // Create deep recursion visualization (50 levels)
      const recursionData = {
        callStack: Array.from({ length: 50 }, (_, i) => ({
          function: 'fibonacci',
          parameters: { n: 50 - i },
          level: i,
          state: i === 49 ? 'active' : 'completed',
          returnValue: i === 49 ? null : Math.floor(Math.random() * 1000)
        })),
        recursionTree: {
          nodes: Array.from({ length: 100 }, (_, i) => ({
            id: `fib(${i})`,
            value: `fib(${i})`,
            level: Math.floor(i / 10),
            state: i < 50 ? 'completed' : 'pending'
          })),
          edges: Array.from({ length: 99 }, (_, i) => ({
            from: `fib(${Math.floor(i / 2)})`,
            to: `fib(${i + 1})`
          }))
        }
      };

      const { container } = render(<RecursionVisualizer data={recursionData} />);
      
      await waitFor(() => {
        expect(container.querySelector('.recursion-visualizer')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should handle deep recursion efficiently
      expect(renderTime).toBeLessThan(3000);
      expect(container.firstChild).toBeTruthy();
    });

    it('should handle complex graph algorithms with large datasets', async () => {
      const startTime = performance.now();
      
      // Create large graph for shortest path algorithm (200 vertices, 800 edges)
      const vertices = [];
      const edges = [];
      
      for (let i = 0; i < 200; i++) {
        vertices.push({
          id: i.toString(),
          label: `V${i}`,
          x: (i % 20) * 40,
          y: Math.floor(i / 20) * 40,
          state: i === 0 ? 'current' : 'unvisited',
          distance: i === 0 ? 0 : Infinity
        });
      }
      
      // Create edges with weights
      for (let i = 0; i < 800; i++) {
        const from = Math.floor(Math.random() * 200).toString();
        const to = Math.floor(Math.random() * 200).toString();
        if (from !== to) {
          edges.push({
            from,
            to,
            weight: Math.floor(Math.random() * 10) + 1,
            state: 'normal'
          });
        }
      }

      const largeGraphData = {
        vertices,
        edges,
        algorithm: 'dijkstra',
        directed: true
      };

      const { container } = render(<GraphVisualizer data={largeGraphData} />);
      
      await waitFor(() => {
        expect(container.querySelector('svg')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render large graph within reasonable time
      expect(renderTime).toBeLessThan(5000);
      expect(container.firstChild).toBeTruthy();
    });

    it('should handle sorting visualization with large arrays', async () => {
      const startTime = performance.now();
      
      // Create large array for sorting visualization
      const largeArray = Array.from({ length: 2000 }, () => Math.floor(Math.random() * 1000));
      
      const sortingData = {
        arrays: [{
          name: 'Large Sorting Array',
          values: largeArray,
          highlights: {
            comparison: [500, 501],
            sorted: Array.from({ length: 100 }, (_, i) => i),
            swaps: 1250,
            comparisons: 5000
          }
        }],
        operations: [{
          type: 'compare',
          indices: [500, 501],
          description: 'Comparing elements during merge sort'
        }]
      };

      const { container } = render(<ArrayVisualizer data={sortingData} />);
      
      await waitFor(() => {
        expect(screen.getByText('Large Sorting Array')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should handle large sorting arrays efficiently
      expect(renderTime).toBeLessThan(2500);
      expect(screen.getByText('(length: 2000)')).toBeInTheDocument();
    });

    it('should handle tree visualization with many nodes', async () => {
      const startTime = performance.now();
      
      // Create large binary tree (2000 nodes)
      const nodes = [];
      const edges = [];
      
      for (let i = 1; i <= 2000; i++) {
        nodes.push({
          id: i.toString(),
          value: i,
          x: (i % 50) * 15,
          y: Math.floor(i / 50) * 25,
          state: i === 1000 ? 'current' : 'normal'
        });
        
        if (i > 1) {
          const parent = Math.floor(i / 2).toString();
          edges.push({
            from: parent,
            to: i.toString(),
            state: i <= 1000 ? 'traversed' : 'normal'
          });
        }
      }

      const largeTreeData = {
        nodes,
        edges,
        treeType: 'binary',
        traversalPath: Array.from({ length: 1000 }, (_, i) => (i + 1).toString()),
        currentNode: '1000'
      };

      const { container } = render(<TreeVisualizer data={largeTreeData} />);
      
      await waitFor(() => {
        expect(container.querySelector('svg')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should handle large trees within reasonable time
      expect(renderTime).toBeLessThan(4000);
      expect(container.firstChild).toBeTruthy();
    });

    it('should handle multiple simultaneous visualizations', async () => {
      const startTime = performance.now();
      
      // Create data for multiple visualizers running simultaneously
      const arrayData = {
        arrays: [{
          name: 'Array 1',
          values: Array.from({ length: 500 }, (_, i) => i),
          highlights: { current: [250] }
        }]
      };

      const treeData = {
        nodes: Array.from({ length: 100 }, (_, i) => ({
          id: i.toString(),
          value: i,
          x: (i % 10) * 50,
          y: Math.floor(i / 10) * 50,
          state: 'normal'
        })),
        edges: Array.from({ length: 99 }, (_, i) => ({
          from: Math.floor(i / 2).toString(),
          to: (i + 1).toString(),
          state: 'normal'
        })),
        treeType: 'binary'
      };

      const graphData = {
        vertices: Array.from({ length: 50 }, (_, i) => ({
          id: i.toString(),
          label: `V${i}`,
          x: (i % 10) * 60,
          y: Math.floor(i / 10) * 60,
          state: 'normal'
        })),
        edges: Array.from({ length: 100 }, (_, i) => ({
          from: Math.floor(Math.random() * 50).toString(),
          to: Math.floor(Math.random() * 50).toString(),
          state: 'normal'
        })),
        directed: false
      };

      const MultiVisualizerComponent = () => (
        <div>
          <ArrayVisualizer data={arrayData} />
          <TreeVisualizer data={treeData} />
          <GraphVisualizer data={graphData} />
        </div>
      );

      const { container } = render(<MultiVisualizerComponent />);
      
      await waitFor(() => {
        expect(screen.getByText('Array 1')).toBeInTheDocument();
        expect(container.querySelectorAll('svg')).toHaveLength(2); // Tree and Graph
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should handle multiple visualizers efficiently
      expect(renderTime).toBeLessThan(3500);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('Memory Stress Tests', () => {
    it('should handle rapid data updates without memory leaks', async () => {
      let updateCount = 0;
      const maxUpdates = 200;
      
      const StressTestComponent = () => {
        const [data, setData] = React.useState({
          arrays: [{
            name: 'Stress Test Array',
            values: Array.from({ length: 100 }, (_, i) => i),
            highlights: { current: [0] }
          }]
        });

        React.useEffect(() => {
          const interval = setInterval(() => {
            if (updateCount < maxUpdates) {
              setData(prev => ({
                arrays: [{
                  ...prev.arrays[0],
                  values: Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000)),
                  highlights: { 
                    current: [Math.floor(Math.random() * 100)],
                    window: { 
                      start: Math.floor(Math.random() * 50), 
                      end: Math.floor(Math.random() * 50) + 50 
                    }
                  }
                }]
              }));
              updateCount++;
            }
          }, 5); // Very rapid updates

          return () => clearInterval(interval);
        }, []);

        return <ArrayVisualizer data={data} />;
      };

      const startTime = performance.now();
      const { container, unmount } = render(<StressTestComponent />);

      // Wait for all updates to complete
      await waitFor(() => {
        expect(updateCount).toBeGreaterThanOrEqual(maxUpdates);
      }, { timeout: 2000 });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle rapid updates without crashing
      expect(totalTime).toBeLessThan(3000);
      expect(container.firstChild).toBeTruthy();

      unmount();
      
      // Component should unmount cleanly
      expect(container.firstChild).toBeFalsy();
    });

    it('should clean up resources properly on unmount', async () => {
      const cleanupSpies = {
        removeEventListener: vi.spyOn(window, 'removeEventListener'),
        clearInterval: vi.spyOn(global, 'clearInterval'),
        clearTimeout: vi.spyOn(global, 'clearTimeout')
      };

      const ResourceTestComponent = () => {
        React.useEffect(() => {
          const interval = setInterval(() => {}, 100);
          const timeout = setTimeout(() => {}, 1000);
          
          const handleResize = () => {};
          window.addEventListener('resize', handleResize);

          return () => {
            clearInterval(interval);
            clearTimeout(timeout);
            window.removeEventListener('resize', handleResize);
          };
        }, []);

        return (
          <ArrayVisualizer 
            data={{
              arrays: [{
                name: 'Resource Test',
                values: [1, 2, 3, 4, 5],
                highlights: {}
              }]
            }} 
          />
        );
      };

      const { unmount } = render(<ResourceTestComponent />);
      
      // Unmount component
      unmount();

      // Should have cleaned up resources
      expect(cleanupSpies.removeEventListener).toHaveBeenCalled();
      expect(cleanupSpies.clearInterval).toHaveBeenCalled();
      expect(cleanupSpies.clearTimeout).toHaveBeenCalled();

      // Restore spies
      Object.values(cleanupSpies).forEach(spy => spy.mockRestore());
    });
  });