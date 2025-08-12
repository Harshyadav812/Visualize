import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  PerformanceTracker, 
  PerformanceComparator, 
  AlgorithmBenchmark,
  PerformanceUtils 
} from '../performanceMetrics';

// Mock performance.now() for consistent testing
const mockPerformanceNow = vi.fn();
global.performance = {
  now: mockPerformanceNow,
  memory: {
    usedJSHeapSize: 1024 * 1024, // 1MB
    totalJSHeapSize: 2 * 1024 * 1024 // 2MB
  }
};

describe('PerformanceTracker', () => {
  let tracker;

  beforeEach(() => {
    tracker = new PerformanceTracker();
    mockPerformanceNow.mockClear();
  });

  describe('Basic Tracking', () => {
    it('should initialize with empty metrics', () => {
      expect(tracker.metrics.startTime).toBeNull();
      expect(tracker.metrics.endTime).toBeNull();
      expect(tracker.metrics.stepCount).toBe(0);
      expect(tracker.metrics.operationCounts).toEqual({});
    });

    it('should start tracking correctly', () => {
      mockPerformanceNow.mockReturnValue(100);
      
      tracker.start();
      
      expect(tracker.metrics.startTime).toBe(100);
      expect(tracker.metrics.stepCount).toBe(0);
      expect(tracker.metrics.operationCounts).toEqual({});
    });

    it('should end tracking correctly', () => {
      mockPerformanceNow.mockReturnValueOnce(100).mockReturnValueOnce(200);
      
      tracker.start();
      tracker.end();
      
      expect(tracker.metrics.endTime).toBe(200);
    });

    it('should record steps correctly', () => {
      tracker.start();
      
      tracker.recordStep('comparison', 2);
      tracker.recordStep('swap', 1);
      tracker.recordStep('comparison', 1);
      
      expect(tracker.metrics.stepCount).toBe(3);
      expect(tracker.metrics.operationCounts).toEqual({
        comparison: 3,
        swap: 1
      });
    });

    it('should record memory usage when available', () => {
      tracker.start();
      tracker.recordStep();
      
      expect(tracker.metrics.memoryUsage).toHaveLength(1);
      expect(tracker.metrics.memoryUsage[0]).toEqual({
        step: 1,
        used: 1024 * 1024,
        total: 2 * 1024 * 1024
      });
    });
  });

  describe('Performance Summary', () => {
    it('should calculate summary correctly', () => {
      mockPerformanceNow.mockReturnValueOnce(100).mockReturnValueOnce(300);
      
      tracker.start();
      tracker.recordStep('comparison', 5);
      tracker.recordStep('swap', 2);
      tracker.end();
      
      const summary = tracker.getSummary();
      
      expect(summary.duration).toBe(200);
      expect(summary.stepCount).toBe(2);
      expect(summary.totalOperations).toBe(7);
      expect(summary.averageStepTime).toBe(100);
      expect(summary.operationsPerSecond).toBe(35); // 7 operations / 0.2 seconds
    });

    it('should handle zero duration gracefully', () => {
      mockPerformanceNow.mockReturnValue(100);
      
      tracker.start();
      tracker.recordStep('test', 1);
      tracker.end();
      
      const summary = tracker.getSummary();
      
      expect(summary.duration).toBe(0);
      expect(summary.operationsPerSecond).toBe(Infinity);
    });

    it('should get memory peak correctly', () => {
      tracker.start();
      
      // Mock different memory usage values
      global.performance.memory.usedJSHeapSize = 1024 * 1024;
      tracker.recordStep();
      
      global.performance.memory.usedJSHeapSize = 2 * 1024 * 1024;
      tracker.recordStep();
      
      global.performance.memory.usedJSHeapSize = 1.5 * 1024 * 1024;
      tracker.recordStep();
      
      const peak = tracker.getMemoryPeak();
      expect(peak).toBe(2 * 1024 * 1024);
    });
  });

  describe('Complexity Analysis', () => {
    it('should estimate O(1) complexity correctly', () => {
      mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(10);
      
      tracker.start();
      tracker.recordStep('access', 1);
      tracker.end();
      
      const analysis = tracker.analyzeComplexity(1000);
      
      expect(analysis.estimated.time).toBe('O(1)');
      expect(analysis.confidence).toBe('high');
    });

    it('should estimate O(n) complexity correctly', () => {
      mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(100);
      
      tracker.start();
      // Simulate linear operations
      for (let i = 0; i < 50; i++) {
        tracker.recordStep('iteration', 1);
      }
      tracker.end();
      
      const analysis = tracker.analyzeComplexity(50);
      
      expect(analysis.estimated.time).toBe('O(n)');
    });

    it('should estimate O(n²) complexity correctly', () => {
      mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(100);
      
      tracker.start();
      // Simulate quadratic operations
      const n = 10;
      for (let i = 0; i < n * n; i++) {
        tracker.recordStep('nested', 1);
      }
      tracker.end();
      
      const analysis = tracker.analyzeComplexity(n);
      
      expect(analysis.estimated.time).toBe('O(n²) or higher');
    });

    it('should estimate space complexity', () => {
      tracker.start();
      tracker.recordStep();
      tracker.end();
      
      const analysis = tracker.analyzeComplexity(100);
      
      expect(analysis.estimated.space).toBeDefined();
      expect(['O(1)', 'O(log n)', 'O(n)', 'O(n) or higher', 'Unknown']).toContain(analysis.estimated.space);
    });

    it('should provide confidence levels', () => {
      tracker.start();
      tracker.end();
      
      expect(tracker.analyzeComplexity(5).confidence).toBe('low');
      expect(tracker.analyzeComplexity(50).confidence).toBe('medium');
      expect(tracker.analyzeComplexity(500).confidence).toBe('high');
    });
  });
});

describe('PerformanceComparator', () => {
  let comparator;
  let tracker1, tracker2;

  beforeEach(() => {
    comparator = new PerformanceComparator();
    tracker1 = new PerformanceTracker();
    tracker2 = new PerformanceTracker();
  });

  describe('Result Management', () => {
    it('should add results correctly', () => {
      mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(100);
      
      tracker1.start();
      tracker1.recordStep('test', 10);
      tracker1.end();
      
      comparator.addResult('Algorithm A', tracker1, 100);
      
      expect(comparator.results).toHaveLength(1);
      expect(comparator.results[0].name).toBe('Algorithm A');
      expect(comparator.results[0].inputSize).toBe(100);
    });

    it('should require at least 2 results for comparison', () => {
      tracker1.start();
      tracker1.end();
      
      comparator.addResult('Algorithm A', tracker1, 100);
      
      const comparison = comparator.getComparison();
      expect(comparison.error).toBe('Need at least 2 results to compare');
    });

    it('should compare results correctly', () => {
      // Setup two trackers with different performance
      mockPerformanceNow
        .mockReturnValueOnce(0).mockReturnValueOnce(100) // tracker1: 100ms
        .mockReturnValueOnce(0).mockReturnValueOnce(50);  // tracker2: 50ms
      
      tracker1.start();
      tracker1.recordStep('test', 5);
      tracker1.end();
      
      tracker2.start();
      tracker2.recordStep('test', 10);
      tracker2.end();
      
      comparator.addResult('Slow Algorithm', tracker1, 100);
      comparator.addResult('Fast Algorithm', tracker2, 100);
      
      const comparison = comparator.getComparison();
      
      expect(comparison.fastest.name).toBe('Fast Algorithm');
      expect(comparison.slowest.name).toBe('Slow Algorithm');
      expect(comparison.all).toHaveLength(2);
    });

    it('should generate optimization recommendations', () => {
      mockPerformanceNow
        .mockReturnValueOnce(0).mockReturnValueOnce(100)
        .mockReturnValueOnce(0).mockReturnValueOnce(50);
      
      tracker1.start();
      for (let i = 0; i < 100; i++) tracker1.recordStep('quadratic', 1);
      tracker1.end();
      
      tracker2.start();
      for (let i = 0; i < 10; i++) tracker2.recordStep('linear', 1);
      tracker2.end();
      
      comparator.addResult('O(n²) Algorithm', tracker1, 10);
      comparator.addResult('O(n) Algorithm', tracker2, 10);
      
      const comparison = comparator.getComparison();
      
      expect(comparison.recommendations).toBeDefined();
      expect(comparison.recommendations.length).toBeGreaterThan(0);
    });

    it('should clear results', () => {
      tracker1.start();
      tracker1.end();
      
      comparator.addResult('Test', tracker1, 100);
      expect(comparator.results).toHaveLength(1);
      
      comparator.clear();
      expect(comparator.results).toHaveLength(0);
    });
  });

  describe('Complexity Ordering', () => {
    it('should order complexities correctly', () => {
      expect(comparator.getComplexityOrder('O(1)')).toBeLessThan(comparator.getComplexityOrder('O(n)'));
      expect(comparator.getComplexityOrder('O(n)')).toBeLessThan(comparator.getComplexityOrder('O(n²)'));
      expect(comparator.getComplexityOrder('O(n²)')).toBeLessThan(comparator.getComplexityOrder('O(2ⁿ)'));
    });

    it('should handle unknown complexities', () => {
      expect(comparator.getComplexityOrder('O(unknown)')).toBe(8);
    });
  });
});

describe('AlgorithmBenchmark', () => {
  let benchmark;

  beforeEach(() => {
    benchmark = new AlgorithmBenchmark();
    mockPerformanceNow.mockClear();
  });

  describe('Test Case Management', () => {
    it('should add test cases correctly', () => {
      const algorithm = vi.fn();
      const inputGenerator = vi.fn();
      
      benchmark.addTestCase('Test Algorithm', algorithm, inputGenerator, [10, 100]);
      
      expect(benchmark.testCases).toHaveLength(1);
      expect(benchmark.testCases[0].name).toBe('Test Algorithm');
      expect(benchmark.testCases[0].inputSizes).toEqual([10, 100]);
    });

    it('should use default input sizes when not provided', () => {
      const algorithm = vi.fn();
      const inputGenerator = vi.fn();
      
      benchmark.addTestCase('Test Algorithm', algorithm, inputGenerator);
      
      expect(benchmark.testCases[0].inputSizes).toEqual([10, 100, 1000]);
    });
  });

  describe('Benchmark Execution', () => {
    it('should run benchmark for all test cases', async () => {
      const algorithm1 = vi.fn().mockResolvedValue();
      const algorithm2 = vi.fn().mockResolvedValue();
      const inputGenerator = vi.fn().mockReturnValue([1, 2, 3]);
      
      mockPerformanceNow.mockReturnValue(100);
      
      benchmark.addTestCase('Algorithm 1', algorithm1, inputGenerator, [10]);
      benchmark.addTestCase('Algorithm 2', algorithm2, inputGenerator, [10]);
      
      const results = await benchmark.runBenchmark();
      
      expect(results.results).toHaveLength(2);
      expect(results.results[0].name).toBe('Algorithm 1');
      expect(results.results[1].name).toBe('Algorithm 2');
      expect(algorithm1).toHaveBeenCalled();
      expect(algorithm2).toHaveBeenCalled();
    });

    it('should handle algorithm errors gracefully', async () => {
      const failingAlgorithm = vi.fn().mockRejectedValue(new Error('Algorithm failed'));
      const inputGenerator = vi.fn().mockReturnValue([1, 2, 3]);
      
      benchmark.addTestCase('Failing Algorithm', failingAlgorithm, inputGenerator, [10]);
      
      const results = await benchmark.runBenchmark();
      
      expect(results.results).toHaveLength(1);
      expect(results.results[0].results).toHaveLength(0); // No successful runs
    });

    it('should analyze scalability correctly', () => {
      const results = [
        { inputSize: 10, analysis: { metrics: { duration: 10 } } },
        { inputSize: 100, analysis: { metrics: { duration: 100 } } },
        { inputSize: 1000, analysis: { metrics: { duration: 1000 } } }
      ];
      
      const scalability = benchmark.analyzeScalability(results);
      
      expect(scalability.level).toBe('good'); // Linear growth
      expect(scalability.reason).toContain('scales well');
    });

    it('should handle insufficient data for scalability analysis', () => {
      const results = [
        { inputSize: 10, analysis: { metrics: { duration: 10 } } }
      ];
      
      const scalability = benchmark.analyzeScalability(results);
      
      expect(scalability.level).toBe('unknown');
      expect(scalability.reason).toBe('Insufficient data');
    });

    it('should compare results across algorithms', () => {
      const results = [
        {
          name: 'Fast Algorithm',
          results: [
            { inputSize: 10, analysis: { metrics: { duration: 5 } } },
            { inputSize: 100, analysis: { metrics: { duration: 50 } } }
          ]
        },
        {
          name: 'Slow Algorithm',
          results: [
            { inputSize: 10, analysis: { metrics: { duration: 10 } } },
            { inputSize: 100, analysis: { metrics: { duration: 100 } } }
          ]
        }
      ];
      
      const comparison = benchmark.compareResults(results);
      
      expect(comparison[10].fastest).toBe('Fast Algorithm');
      expect(comparison[100].fastest).toBe('Fast Algorithm');
    });
  });
});

describe('PerformanceUtils', () => {
  describe('Duration Formatting', () => {
    it('should format microseconds correctly', () => {
      expect(PerformanceUtils.formatDuration(0.5)).toBe('500.00μs');
      expect(PerformanceUtils.formatDuration(0.001)).toBe('1.00μs');
    });

    it('should format milliseconds correctly', () => {
      expect(PerformanceUtils.formatDuration(1.5)).toBe('1.50ms');
      expect(PerformanceUtils.formatDuration(999.99)).toBe('999.99ms');
    });

    it('should format seconds correctly', () => {
      expect(PerformanceUtils.formatDuration(1000)).toBe('1.00s');
      expect(PerformanceUtils.formatDuration(5500)).toBe('5.50s');
    });
  });

  describe('Memory Formatting', () => {
    it('should handle null/undefined memory values', () => {
      expect(PerformanceUtils.formatMemory(null)).toBe('Unknown');
      expect(PerformanceUtils.formatMemory(undefined)).toBe('Unknown');
    });

    it('should format bytes correctly', () => {
      expect(PerformanceUtils.formatMemory(512)).toBe('512.00 B');
      expect(PerformanceUtils.formatMemory(1023)).toBe('1023.00 B');
    });

    it('should format kilobytes correctly', () => {
      expect(PerformanceUtils.formatMemory(1024)).toBe('1.00 KB');
      expect(PerformanceUtils.formatMemory(1536)).toBe('1.50 KB');
    });

    it('should format megabytes correctly', () => {
      expect(PerformanceUtils.formatMemory(1024 * 1024)).toBe('1.00 MB');
      expect(PerformanceUtils.formatMemory(1.5 * 1024 * 1024)).toBe('1.50 MB');
    });

    it('should format gigabytes correctly', () => {
      expect(PerformanceUtils.formatMemory(1024 * 1024 * 1024)).toBe('1.00 GB');
    });
  });

  describe('Complexity Colors', () => {
    it('should return correct colors for complexities', () => {
      expect(PerformanceUtils.getComplexityColor('O(1)')).toBe('green');
      expect(PerformanceUtils.getComplexityColor('O(log n)')).toBe('green');
      expect(PerformanceUtils.getComplexityColor('O(n)')).toBe('blue');
      expect(PerformanceUtils.getComplexityColor('O(n log n)')).toBe('yellow');
      expect(PerformanceUtils.getComplexityColor('O(n²)')).toBe('orange');
      expect(PerformanceUtils.getComplexityColor('O(2ⁿ)')).toBe('red');
    });

    it('should return gray for unknown complexities', () => {
      expect(PerformanceUtils.getComplexityColor('O(unknown)')).toBe('gray');
    });
  });

  describe('Performance Insights', () => {
    it('should generate positive insights for fast algorithms', () => {
      const metrics = {
        duration: 0.5,
        operationsPerSecond: 2000000
      };
      const complexity = { estimated: { time: 'O(1)', space: 'O(1)' } };
      
      const insights = PerformanceUtils.generateInsights(metrics, complexity);
      
      expect(insights.some(insight => insight.type === 'positive')).toBe(true);
      expect(insights.some(insight => insight.message.includes('fast execution'))).toBe(true);
      expect(insights.some(insight => insight.message.includes('High throughput'))).toBe(true);
      expect(insights.some(insight => insight.message.includes('memory efficient'))).toBe(true);
    });

    it('should generate warnings for slow algorithms', () => {
      const metrics = {
        duration: 2000,
        operationsPerSecond: 100
      };
      const complexity = { estimated: { time: 'O(n²)', space: 'O(n)' } };
      
      const insights = PerformanceUtils.generateInsights(metrics, complexity);
      
      expect(insights.some(insight => insight.type === 'warning')).toBe(true);
      expect(insights.some(insight => insight.message.includes('Slow execution'))).toBe(true);
      expect(insights.some(insight => insight.message.includes('High time complexity'))).toBe(true);
    });

    it('should handle edge cases gracefully', () => {
      const metrics = {
        duration: 100,
        operationsPerSecond: 1000
      };
      const complexity = { estimated: { time: 'O(n)', space: 'O(log n)' } };
      
      const insights = PerformanceUtils.generateInsights(metrics, complexity);
      
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Integration Tests', () => {
  it('should work together for complete performance analysis', async () => {
    const tracker = new PerformanceTracker();
    const comparator = new PerformanceComparator();
    
    // Simulate algorithm execution
    mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(100);
    
    tracker.start();
    for (let i = 0; i < 50; i++) {
      tracker.recordStep('operation', 1);
    }
    tracker.end();
    
    // Add to comparator
    comparator.addResult('Test Algorithm', tracker, 50);
    
    // Create second algorithm for comparison
    const tracker2 = new PerformanceTracker();
    mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(50);
    
    tracker2.start();
    for (let i = 0; i < 25; i++) {
      tracker2.recordStep('operation', 1);
    }
    tracker2.end();
    
    comparator.addResult('Faster Algorithm', tracker2, 50);
    
    // Get comparison
    const comparison = comparator.getComparison();
    
    expect(comparison.fastest.name).toBe('Faster Algorithm');
    expect(comparison.slowest.name).toBe('Test Algorithm');
    expect(comparison.recommendations).toBeDefined();
  });
});