import React, { useState, useRef, useEffect } from 'react';

/**
 * Educational tooltip component that provides detailed explanations
 * for complexity concepts and algorithm patterns
 */
export default function EducationalTooltip({ 
  children, 
  content, 
  title, 
  position = 'top',
  trigger = 'hover',
  maxWidth = '300px',
  delay = 500
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Handle mouse events for hover trigger
  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsVisible(false);
    }
  };

  // Handle click events for click trigger
  const handleClick = (e) => {
    if (trigger === 'click') {
      e.stopPropagation();
      setIsVisible(!isVisible);
    }
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (trigger === 'click' && 
          tooltipRef.current && 
          !tooltipRef.current.contains(event.target) &&
          !triggerRef.current.contains(event.target)) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, trigger]);

  // Adjust tooltip position based on viewport
  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltip = tooltipRef.current;
      const trigger = triggerRef.current;
      const rect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let newPosition = position;

      // Check if tooltip goes outside viewport and adjust
      if (position === 'top' && rect.top - tooltipRect.height < 0) {
        newPosition = 'bottom';
      } else if (position === 'bottom' && rect.bottom + tooltipRect.height > viewport.height) {
        newPosition = 'top';
      } else if (position === 'left' && rect.left - tooltipRect.width < 0) {
        newPosition = 'right';
      } else if (position === 'right' && rect.right + tooltipRect.width > viewport.width) {
        newPosition = 'left';
      }

      setActualPosition(newPosition);
    }
  }, [isVisible, position]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800'
  };

  return (
    <div className="relative inline-block">
      {/* Trigger element */}
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={`${trigger === 'click' ? 'cursor-pointer' : 'cursor-help'} inline-flex items-center`}
      >
        {children}
      </div>

      {/* Tooltip */}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${positionClasses[actualPosition]} animate-fadeIn`}
          style={{ maxWidth }}
        >
          {/* Arrow */}
          <div
            className={`absolute w-0 h-0 border-4 ${arrowClasses[actualPosition]}`}
          />
          
          {/* Tooltip content */}
          <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-4">
            {title && (
              <h4 className="text-white font-semibold mb-2 text-sm">
                {title}
              </h4>
            )}
            
            <div className="text-gray-300 text-sm leading-relaxed">
              {typeof content === 'string' ? (
                <p>{content}</p>
              ) : (
                content
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Specialized tooltip for complexity explanations
 */
export function ComplexityTooltip({ complexity, children, ...props }) {
  const content = getComplexityExplanation(complexity);
  
  return (
    <EducationalTooltip
      title={`${complexity} Complexity`}
      content={content}
      {...props}
    >
      {children}
    </EducationalTooltip>
  );
}

/**
 * Specialized tooltip for algorithm patterns
 */
export function PatternTooltip({ pattern, children, ...props }) {
  const content = getPatternExplanation(pattern);
  
  return (
    <EducationalTooltip
      title={`${pattern} Pattern`}
      content={content}
      {...props}
    >
      {children}
    </EducationalTooltip>
  );
}

/**
 * Specialized tooltip for data structures
 */
export function DataStructureTooltip({ dataStructure, children, ...props }) {
  const content = getDataStructureExplanation(dataStructure);
  
  return (
    <EducationalTooltip
      title={dataStructure}
      content={content}
      {...props}
    >
      {children}
    </EducationalTooltip>
  );
}

/**
 * Interactive complexity comparison tooltip
 */
export function ComplexityComparisonTooltip({ currentComplexity, children, ...props }) {
  const content = (
    <div className="space-y-3">
      <div>
        <h5 className="text-yellow-300 font-medium mb-1">Current: {currentComplexity}</h5>
        <p className="text-gray-300 text-xs">
          {getComplexityExplanation(currentComplexity)}
        </p>
      </div>
      
      <div className="border-t border-gray-600 pt-2">
        <h5 className="text-gray-300 font-medium mb-2 text-xs">Complexity Scale:</h5>
        <div className="space-y-1">
          {getComplexityScale().map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between text-xs p-1 rounded ${
                item.notation === currentComplexity ? 'bg-blue-600/30' : ''
              }`}
            >
              <span className="font-mono">{item.notation}</span>
              <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <EducationalTooltip
      title="Complexity Analysis"
      content={content}
      maxWidth="250px"
      {...props}
    >
      {children}
    </EducationalTooltip>
  );
}

/**
 * Performance metrics tooltip
 */
export function PerformanceTooltip({ metrics, children, ...props }) {
  const content = (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-400">Duration:</span>
          <div className="text-white font-mono">{metrics.duration}ms</div>
        </div>
        <div>
          <span className="text-gray-400">Steps:</span>
          <div className="text-white font-mono">{metrics.stepCount}</div>
        </div>
        <div>
          <span className="text-gray-400">Operations:</span>
          <div className="text-white font-mono">{metrics.totalOperations}</div>
        </div>
        <div>
          <span className="text-gray-400">Ops/sec:</span>
          <div className="text-white font-mono">{Math.round(metrics.operationsPerSecond)}</div>
        </div>
      </div>
      
      {metrics.memoryPeak && (
        <div className="border-t border-gray-600 pt-2">
          <span className="text-gray-400 text-xs">Peak Memory:</span>
          <div className="text-white font-mono text-xs">
            {formatMemory(metrics.memoryPeak)}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <EducationalTooltip
      title="Performance Metrics"
      content={content}
      maxWidth="200px"
      {...props}
    >
      {children}
    </EducationalTooltip>
  );
}

// Utility functions for generating explanations

function getComplexityExplanation(complexity) {
  const explanations = {
    'O(1)': 'Constant time - the algorithm takes the same amount of time regardless of input size. This is the best possible time complexity.',
    'O(log n)': 'Logarithmic time - the algorithm\'s runtime grows logarithmically with input size. Very efficient for large datasets.',
    'O(n)': 'Linear time - the algorithm\'s runtime grows linearly with input size. Each additional input element adds a constant amount of work.',
    'O(n log n)': 'Linearithmic time - common in efficient divide-and-conquer algorithms like merge sort and heap sort.',
    'O(n²)': 'Quadratic time - runtime grows quadratically with input size. Often caused by nested loops over the input.',
    'O(n³)': 'Cubic time - runtime grows cubically with input size. Usually involves triple nested loops.',
    'O(2ⁿ)': 'Exponential time - runtime doubles with each additional input element. Generally impractical for large inputs.',
    'O(n!)': 'Factorial time - runtime grows factorially with input size. Only feasible for very small inputs.'
  };

  return explanations[complexity] || 'Time complexity analysis for this algorithm.';
}

function getPatternExplanation(pattern) {
  const explanations = {
    'Two Pointers': 'Uses two pointers that move through the data structure, often from opposite ends or at different speeds. Useful for array problems involving pairs or subarrays.',
    'Sliding Window': 'Maintains a window of elements and slides it through the data structure. Efficient for problems involving contiguous subarrays or substrings.',
    'Divide and Conquer': 'Breaks the problem into smaller subproblems, solves them recursively, and combines the results. Common in sorting and searching algorithms.',
    'Dynamic Programming': 'Solves complex problems by breaking them down into simpler subproblems and storing the results to avoid redundant calculations.',
    'Greedy': 'Makes the locally optimal choice at each step, hoping to find a global optimum. Works well for optimization problems with certain properties.',
    'Backtracking': 'Explores all possible solutions by building candidates incrementally and abandoning candidates that cannot lead to a valid solution.',
    'Hash Table': 'Uses a hash function to map keys to values, providing O(1) average-case lookup time. Excellent for problems requiring fast lookups.',
    'Binary Search': 'Efficiently searches sorted data by repeatedly dividing the search space in half. Achieves O(log n) time complexity.'
  };

  return explanations[pattern] || 'Algorithm pattern explanation.';
}

function getDataStructureExplanation(dataStructure) {
  const explanations = {
    'Array': 'A collection of elements stored in contiguous memory locations. Provides O(1) access by index but O(n) insertion/deletion in the middle.',
    'Linked List': 'A linear data structure where elements are stored in nodes, each containing data and a reference to the next node. Efficient insertion/deletion but O(n) access.',
    'Stack': 'A Last-In-First-Out (LIFO) data structure. Elements are added and removed from the same end (top). Useful for function calls, undo operations, and parsing.',
    'Queue': 'A First-In-First-Out (FIFO) data structure. Elements are added at one end (rear) and removed from the other end (front). Useful for scheduling and breadth-first search.',
    'Hash Table': 'Maps keys to values using a hash function. Provides O(1) average-case lookup, insertion, and deletion. Excellent for caching and fast lookups.',
    'Binary Tree': 'A hierarchical data structure where each node has at most two children. Useful for representing hierarchical relationships and efficient searching.',
    'Binary Search Tree': 'A binary tree where left children are smaller and right children are larger than their parent. Provides O(log n) search, insertion, and deletion.',
    'Heap': 'A complete binary tree that satisfies the heap property. Min-heap has the smallest element at the root, max-heap has the largest. Useful for priority queues.',
    'Graph': 'A collection of vertices connected by edges. Can be directed or undirected, weighted or unweighted. Useful for modeling relationships and networks.'
  };

  return explanations[dataStructure] || 'Data structure explanation.';
}

function getComplexityScale() {
  return [
    { notation: 'O(1)', color: 'bg-green-500' },
    { notation: 'O(log n)', color: 'bg-green-400' },
    { notation: 'O(n)', color: 'bg-blue-500' },
    { notation: 'O(n log n)', color: 'bg-yellow-500' },
    { notation: 'O(n²)', color: 'bg-orange-500' },
    { notation: 'O(2ⁿ)', color: 'bg-red-500' }
  ];
}

function formatMemory(bytes) {
  if (!bytes) return 'Unknown';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}