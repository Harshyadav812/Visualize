import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ComplexityTooltip, PatternTooltip, DataStructureTooltip, ComplexityComparisonTooltip } from './EducationalTooltip';

export default function ComplexityAnalysis({ analysis, originalCode }) { // eslint-disable-line no-unused-vars
  const [activeTab, setActiveTab] = useState('complexity');
  const [showOptimizations, setShowOptimizations] = useState(false);

  if (!analysis) return null;

  const complexity = analysis.complexity || {};
  const algorithmType = analysis.algorithmType || 'Unknown';
  const dataStructures = analysis.dataStructures || [];
  const steps = analysis.steps || [];

  // Utility functions
  const getComplexityScore = (timeComplexity) => {
    const scores = {
      'O(1)': 100,
      'O(log n)': 90,
      'O(n)': 70,
      'O(n log n)': 60,
      'O(n²)': 40,
      'O(2ⁿ)': 20
    };
    return scores[timeComplexity] || 50;
  };

  const calculatePerformanceMetrics = (steps, complexity) => {
    const stepCount = (steps || []).length;
    const timeScore = getComplexityScore(complexity.time);
    const spaceScore = getComplexityScore(complexity.space);
    const efficiencyScore = Math.round((timeScore + spaceScore) / 2);

    return {
      totalSteps: stepCount,
      estimatedOps: Math.min(stepCount * 2, 9999),
      memoryUsage: ['O(1)', 'O(log n)'].includes(complexity.space) ? 'Low' :
        complexity.space === 'O(n)' ? 'Medium' : 'High',
      efficiencyScore: efficiencyScore + '%',
      efficiencyLevel: efficiencyScore >= 90 ? 'excellent' :
        efficiencyScore >= 70 ? 'good' :
          efficiencyScore >= 50 ? 'fair' : 'poor'
    };
  };

  const getOptimizationSuggestions = (complexity, algorithmType, dataStructures) => {
    const suggestions = [];
    if (complexity.time === 'O(n²)') {
      suggestions.push({
        icon: '⚡',
        title: 'Reduce Time Complexity',
        description: 'Consider using hash tables or sorting to reduce nested loops from O(n²) to O(n log n) or O(n).',
        targetComplexity: 'O(n log n) or O(n)'
      });
    }
    if (complexity.time === 'O(2ⁿ)') {
      suggestions.push({
        icon: '💾',
        title: 'Use Memoization',
        description: 'Cache intermediate results to avoid redundant calculations in recursive algorithms.',
        targetComplexity: 'O(n²) or better'
      });
    }
    if (complexity.space === 'O(n)' && /sort/i.test(algorithmType)) {
      suggestions.push({
        icon: '🔄',
        title: 'In-place Algorithm',
        description: 'Consider in-place sorting algorithms like quicksort or heapsort to reduce space complexity.',
        targetComplexity: 'O(log n) space'
      });
    }
    if (dataStructures.includes('Array') && /search/i.test(algorithmType)) {
      suggestions.push({
        icon: '🔍',
        title: 'Use Better Data Structure',
        description: 'Consider using a hash table or binary search tree for faster lookups.',
        targetComplexity: 'O(1) or O(log n) lookup'
      });
    }
    if (suggestions.length === 0) {
      suggestions.push({
        icon: '💡',
        title: 'Algorithm Analysis',
        description: 'Your algorithm appears to be reasonably efficient for its complexity class.',
        targetComplexity: null
      });
    }
    return suggestions;
  };

  const getAlgorithmComparisons = (algorithmType, complexity) => {
    const comparisons = [];
    const type = (algorithmType || '').toLowerCase();

    if (type.includes('sort')) {
      comparisons.push(
        { name: 'Bubble Sort', time: 'O(n²)', space: 'O(1)', bestFor: 'Educational purposes' },
        { name: 'Quick Sort', time: 'O(n log n)', space: 'O(log n)', bestFor: 'General purpose' },
        { name: 'Merge Sort', time: 'O(n log n)', space: 'O(n)', bestFor: 'Stable sorting' },
        { name: 'Heap Sort', time: 'O(n log n)', space: 'O(1)', bestFor: 'Guaranteed performance' }
      );
    } else if (type.includes('search')) {
      comparisons.push(
        { name: 'Linear Search', time: 'O(n)', space: 'O(1)', bestFor: 'Unsorted data' },
        { name: 'Binary Search', time: 'O(log n)', space: 'O(1)', bestFor: 'Sorted data' },
        { name: 'Hash Table', time: 'O(1)', space: 'O(n)', bestFor: 'Fast lookups' }
      );
    }

    return comparisons.map(item => ({
      ...item,
      isCurrent: item.time === complexity.time && item.space === complexity.space
    }));
  };

  const getEfficiencyDescription = (timeComplexity, algorithmType) => {
    const score = getComplexityScore(timeComplexity);
    if (score >= 90) return `Excellent efficiency for ${algorithmType}.`;
    if (score >= 70) return `Good efficiency for ${algorithmType}.`;
    if (score >= 50) return `Fair efficiency for ${algorithmType}.`;
    return `Poor efficiency for ${algorithmType}. Consider optimization.`;
  };

  const getScalabilityDescription = (timeComplexity) => {
    if (['O(1)', 'O(log n)'].includes(timeComplexity)) return 'Excellent scalability';
    if (timeComplexity === 'O(n)') return 'Good scalability';
    if (timeComplexity === 'O(n log n)') return 'Fair scalability';
    return 'Poor scalability';
  };

  const getMemoryEfficiencyDescription = (spaceComplexity) => {
    if (spaceComplexity === 'O(1)') return 'Excellent memory efficiency';
    if (spaceComplexity === 'O(log n)') return 'Good memory efficiency';
    if (spaceComplexity === 'O(n)') return 'Fair memory efficiency';
    return 'High memory usage';
  };

  const performanceMetrics = calculatePerformanceMetrics(steps, complexity);
  const optimizationSuggestions = getOptimizationSuggestions(complexity, algorithmType, dataStructures);
  const algorithmComparisons = getAlgorithmComparisons(algorithmType, complexity);

  // Tab content components
  const ComplexityTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-gray-300 font-medium mb-3 flex items-center">
            <ComplexityTooltip complexity={complexity.time}>
              <span className="mr-2">⏱️</span>
              Time Complexity
            </ComplexityTooltip>
          </h4>
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-bold text-blue-400">{complexity.time || 'Unknown'}</div>
            <span className="text-2xl">
              {complexity.time === 'O(1)' && '🟢'}
              {complexity.time === 'O(log n)' && '🟡'}
              {complexity.time === 'O(n)' && '🔵'}
              {complexity.time === 'O(n log n)' && '🟡'}
              {complexity.time === 'O(n²)' && '🟠'}
              {complexity.time === 'O(2ⁿ)' && '🔴'}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-2">{getEfficiencyDescription(complexity.time, algorithmType)}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-gray-300 font-medium mb-3 flex items-center">
            <ComplexityTooltip complexity={complexity.space}>
              <span className="mr-2">💾</span>
              Space Complexity
            </ComplexityTooltip>
          </h4>
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-bold text-green-400">{complexity.space || 'Unknown'}</div>
            <span className="text-2xl">
              {complexity.space === 'O(1)' && '🟢'}
              {complexity.space === 'O(log n)' && '🟡'}
              {complexity.space === 'O(n)' && '🔵'}
              {complexity.space === 'O(n²)' && '🟠'}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-2">{getMemoryEfficiencyDescription(complexity.space)}</p>
        </div>
      </div>

      {complexity.explanation && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-gray-300 font-medium mb-3">Analysis Explanation</h4>
          <p className="text-gray-300">{complexity.explanation}</p>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-gray-300 font-medium mb-3">Complexity Indicators</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Scalability</span>
            <span className="text-blue-400">{getScalabilityDescription(complexity.time)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Memory Efficiency</span>
            <span className="text-green-400">{getMemoryEfficiencyDescription(complexity.space)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const PerformanceTab = () => (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-gray-300 font-medium mb-3 flex items-center">
          <span className="mr-2">📈</span>
          Performance Analysis
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{performanceMetrics.totalSteps}</div>
            <div className="text-sm text-gray-400">Total Steps</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{performanceMetrics.estimatedOps}</div>
            <div className="text-sm text-gray-400">Estimated Operations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{performanceMetrics.memoryUsage}</div>
            <div className="text-sm text-gray-400">Memory Usage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{performanceMetrics.efficiencyScore}</div>
            <div className="text-sm text-gray-400">Efficiency Score</div>
          </div>
        </div>
      </div>      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setShowOptimizations(!showOptimizations)}
            className="text-gray-300 font-medium hover:text-blue-300"
          >
            Optimization Suggestions
          </button>
          <button
            type="button"
            onClick={() => setShowOptimizations(!showOptimizations)}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            {showOptimizations ? 'Hide' : 'Show'}
          </button>
        </div>
        {showOptimizations && (
          <div className="space-y-3">
            {optimizationSuggestions.map((suggestion, index) => (
              <div key={index} className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-600/50 rounded-lg p-3">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{suggestion.icon}</span>
                  <div className="flex-1">
                    <h5 className="text-blue-300 font-medium">{suggestion.title}</h5>
                    <p className="text-blue-200 text-sm mt-1 leading-relaxed">{suggestion.description}</p>
                    {suggestion.targetComplexity && (
                      <div className="text-xs text-blue-400 mt-2 font-mono">Target: {suggestion.targetComplexity}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!showOptimizations && (
          <div className="text-gray-500 text-sm">
            Click 'Show' to view optimization suggestions
          </div>
        )}
      </div>

      {algorithmComparisons.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-gray-300 font-medium mb-3">Algorithm Comparison</h4>
          <div className="space-y-2">
            {algorithmComparisons.map((algo, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${algo.isCurrent ? 'bg-blue-900/30 border border-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                <div className="flex-1">
                  <span className={`font-medium ${algo.isCurrent ? 'text-blue-300' : 'text-gray-300'}`}>
                    {algo.name}{algo.isCurrent && <span className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded">Current</span>}
                  </span>
                  {algo.bestFor && (
                    <div className="text-xs text-gray-400 mt-1">Best for: {algo.bestFor}</div>
                  )}
                </div>
                <div className="flex space-x-4">
                  <span className="text-blue-400 text-sm font-mono">{algo.time}</span>
                  <span className="text-green-400 text-sm font-mono">{algo.space}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const EducationTab = () => {
    const complexityList = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'];
    const complexityIcons = { 'O(1)': '🟢', 'O(log n)': '🟡', 'O(n)': '🔵', 'O(n log n)': '🟡', 'O(n²)': '🟠', 'O(2ⁿ)': '🔴' };
    const complexityDescriptions = {
      'O(1)': 'Constant time - always takes the same amount of time',
      'O(log n)': 'Logarithmic time - very efficient, time grows slowly',
      'O(n)': 'Linear time - time grows proportionally with input size',
      'O(n log n)': 'Linearithmic time - efficient for larger datasets',
      'O(n²)': 'Quadratic time - time grows quickly with input size',
      'O(2ⁿ)': 'Exponential time - very slow for large inputs'
    };

    return (
      <div className="space-y-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-gray-300 font-medium mb-3 flex items-center">
            <span className="mr-2">📚</span>
            Big O Notation Guide
          </h4>
          <div className="space-y-2">
            {complexityList.map(notation => (
              <div key={notation} className={`p-3 rounded-lg border transition-colors ${complexity.time === notation ? 'bg-blue-900/30 border-blue-600' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{complexityIcons[notation]}</span>
                    <div>
                      <span className="font-mono text-white font-medium">{notation}</span>
                      <div className="text-sm text-gray-400">{complexityDescriptions[notation]}</div>
                    </div>
                  </div>
                  {complexity.time === notation && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Your Algorithm</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-gray-300 font-medium mb-3 flex items-center">
            <span className="mr-2">🎯</span>
            Algorithm Patterns
          </h4>
          <div className="space-y-2">
            <div className="text-gray-300 text-sm">Recognize these common patterns:</div>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <span>🔍</span>
                <div>
                  <span className="text-blue-400 font-medium">Divide and Conquer</span>
                  <div className="text-gray-400 text-sm">Breaks problem into smaller subproblems</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span>👥</span>
                <div>
                  <span className="text-green-400 font-medium">Two Pointers</span>
                  <div className="text-gray-400 text-sm">Uses two pointers moving through data</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span>🗂️</span>
                <div>
                  <span className="text-purple-400 font-medium">Hash Map Pattern</span>
                  <div className="text-gray-400 text-sm">Uses hash table for O(1) lookups</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4">
          <h4 className="text-yellow-300 font-medium mb-3 flex items-center">
            <span className="mr-2">⚠️</span>
            Common Pitfalls to Avoid
          </h4>
          <div className="text-yellow-200 text-sm space-y-2">
            <div>• <strong>Off-by-One Errors:</strong> Careful with array bounds and loop conditions</div>
            <div>• <strong>Unnecessary Nested Loops:</strong> Consider hash tables to reduce complexity</div>
            <div>• <strong>Stack Overflow:</strong> Watch recursion depth for large inputs</div>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-4">
          <h4 className="text-blue-300 font-medium mb-3 flex items-center">
            <span className="mr-2">🎓</span>
            Learn More
          </h4>
          <div className="text-blue-200 text-sm space-y-1">
            <div>📖 Big O Notation and Algorithm Analysis</div>
            <div>🔄 Sorting Algorithms and Their Trade-offs</div>
            <div>🧮 Data Structures and Performance Impact</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-surface-primary rounded-lg border border-surface-tertiary overflow-hidden">
      <div className="border-b border-surface-tertiary px-3 py-2 md:px-4 md:py-3">
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <h3 className="text-text-primary font-medium text-sm md:text-base">Algorithm Analysis</h3>
          <div className="flex space-x-1">
            <button
              type="button"
              onClick={() => setActiveTab('complexity')}
              className={`px-2 py-1 md:px-3 md:py-1 text-xs md:text-sm rounded transition-colors ${activeTab === 'complexity'
                ? 'bg-accent-primary text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                }`}
            >
              Complexity
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('performance')}
              className={`px-2 py-1 md:px-3 md:py-1 text-xs md:text-sm rounded transition-colors ${activeTab === 'performance'
                ? 'bg-accent-primary text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                }`}
            >
              Performance
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('learn')}
              className={`px-2 py-1 md:px-3 md:py-1 text-xs md:text-sm rounded transition-colors ${activeTab === 'learn'
                ? 'bg-accent-primary text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                }`}
            >
              Learn
            </button>
          </div>
        </div>
      </div>

      <div className="p-3 md:p-4">
        {activeTab === 'complexity' && <ComplexityTab />}
        {activeTab === 'performance' && <PerformanceTab />}
        {activeTab === 'learn' && <EducationTab />}
      </div>
    </div>
  );
}

ComplexityAnalysis.propTypes = {
  analysis: PropTypes.shape({
    complexity: PropTypes.object,
    algorithmType: PropTypes.string,
    dataStructures: PropTypes.array,
    steps: PropTypes.array
  }),
  originalCode: PropTypes.string
};
