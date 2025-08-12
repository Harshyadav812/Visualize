/**
 * Educational content utilities for algorithm visualization
 * Provides explanations, examples, and descriptions for various CS concepts
 */

// Algorithm explanations
const ALGORITHM_EXPLANATIONS = {
  'sliding window': 'A technique that uses two pointers to create a window of elements, efficiently solving subarray/substring problems.',
  'two pointers': 'Uses two pointers moving in opposite directions or at different speeds to solve array/string problems efficiently.',
  'binary search': 'Divide and conquer algorithm that efficiently finds elements in sorted arrays by halving the search space.',
  'dynamic programming': 'Optimization technique that solves complex problems by breaking them into simpler subproblems and storing results.',
  'breadth-first search': 'Graph traversal algorithm that explores all vertices at current depth before moving to next depth level.',
  'depth-first search': 'Graph traversal algorithm that explores as far as possible along each branch before backtracking.',
  'greedy algorithm': 'Makes locally optimal choices at each step, hoping to find a global optimum.',
  'divide and conquer': 'Breaks problem into smaller subproblems, solves them recursively, then combines results.',
  'hash table': 'Uses hash functions to map keys to values, providing average O(1) lookup, insertion, and deletion.',
  'sorting': 'Arranges elements in a specific order (ascending/descending) using various comparison-based or non-comparison algorithms.'
};

// Algorithm examples
const ALGORITHM_EXAMPLES = {
  'sliding window': ['Maximum subarray sum', 'Longest substring without repeating characters', 'Minimum window substring'],
  'two pointers': ['Two sum in sorted array', 'Container with most water', 'Remove duplicates'],
  'binary search': ['Search in rotated array', 'Find first/last position', 'Search 2D matrix'],
  'dynamic programming': ['Fibonacci sequence', 'Longest common subsequence', 'Knapsack problem'],
  'breadth-first search': ['Level order traversal', 'Shortest path in unweighted graph', 'Word ladder'],
  'depth-first search': ['Tree traversals', 'Detect cycle in graph', 'Topological sorting'],
  'greedy algorithm': ['Activity selection', 'Fractional knapsack', 'Huffman coding'],
  'divide and conquer': ['Merge sort', 'Quick sort', 'Maximum subarray'],
  'hash table': ['Two sum', 'Group anagrams', 'First non-repeating character'],
  'sorting': ['Merge sort', 'Quick sort', 'Heap sort']
};

// Time complexity descriptions
const TIME_COMPLEXITY_DESCRIPTIONS = {
  'O(1)': 'Constant time - executes in the same time regardless of input size. Most efficient.',
  'O(log n)': 'Logarithmic time - execution time grows logarithmically with input size. Very efficient.',
  'O(n)': 'Linear time - execution time grows linearly with input size. Generally acceptable.',
  'O(n log n)': 'Log-linear time - common in efficient sorting algorithms like merge sort.',
  'O(n²)': 'Quadratic time - execution time grows quadratically. Can be slow for large inputs.',
  'O(n³)': 'Cubic time - execution time grows cubically. Generally inefficient for large inputs.',
  'O(2^n)': 'Exponential time - execution time doubles with each additional input. Very inefficient.',
  'O(n!)': 'Factorial time - execution time grows factorially. Extremely inefficient.'
};

// Space complexity descriptions
const SPACE_COMPLEXITY_DESCRIPTIONS = {
  'O(1)': 'Constant space - uses fixed amount of memory regardless of input size. Most memory efficient.',
  'O(log n)': 'Logarithmic space - memory usage grows logarithmically, often from recursion depth. Very space efficient.',
  'O(n)': 'Linear space - memory usage grows linearly with input size. Common for storing input copies.',
  'O(n log n)': 'Log-linear space - memory grows at n log n rate, often from divide-and-conquer algorithms.',
  'O(n²)': 'Quadratic space - memory usage grows quadratically. Often from 2D arrays or nested structures.',
  'O(n³)': 'Cubic space - memory usage grows cubically. Generally high memory usage.',
  'O(2^n)': 'Exponential space - memory usage doubles with each input increase. Very memory intensive.',
  'O(n!)': 'Factorial space - memory usage grows factorially. Extremely memory intensive.'
};

// Data structure properties
const DATA_STRUCTURE_PROPERTIES = {
  'array': ['Fixed size', 'Random access O(1)', 'Sequential memory layout', 'Cache-friendly'],
  'linked list': ['Dynamic size', 'Sequential access O(n)', 'Node-based structure', 'Easy insertion/deletion'],
  'hash table': ['Key-value pairs', 'Average O(1) operations', 'Hash function based', 'May have collisions'],
  'stack': ['LIFO (Last In, First Out)', 'O(1) push/pop', 'Limited access to top', 'Recursion support'],
  'queue': ['FIFO (First In, First Out)', 'O(1) enqueue/dequeue', 'Two-ended access', 'BFS support'],
  'binary tree': ['Hierarchical structure', 'Left and right children', 'Recursive definition', 'Various traversals'],
  'heap': ['Complete binary tree', 'Heap property maintained', 'O(log n) insert/delete', 'Priority queue implementation'],
  'graph': ['Vertices and edges', 'Adjacency representation', 'Directed/undirected', 'Weighted/unweighted'],
  'trie': ['Prefix tree structure', 'String storage optimized', 'Common prefix sharing', 'Fast prefix matching'],
  'string': ['Character sequence', 'Immutable in many languages', 'Pattern matching support', 'Various encoding']
};

// Data structure use cases
const DATA_STRUCTURE_USE_CASES = {
  'array': ['Data storage', 'Mathematical operations', 'Lookup tables', 'Sorting algorithms'],
  'linked list': ['Dynamic collections', 'Undo functionality', 'Music playlists', 'Browser history'],
  'hash table': ['Caching', 'Database indexing', 'Symbol tables', 'Duplicate detection'],
  'stack': ['Function calls', 'Undo operations', 'Expression evaluation', 'Backtracking'],
  'queue': ['Task scheduling', 'Breadth-first search', 'Print queues', 'Buffer for streams'],
  'binary tree': ['Search operations', 'Expression parsing', 'Decision trees', 'File systems'],
  'heap': ['Priority queues', 'Dijkstra\'s algorithm', 'Job scheduling', 'Finding extremes'],
  'graph': ['Social networks', 'Maps and navigation', 'Web crawling', 'Dependency resolution'],
  'trie': ['Autocomplete', 'Spell checkers', 'IP routing', 'Dictionary lookups'],
  'string': ['Text processing', 'Pattern matching', 'DNA sequencing', 'Compression']
};

/**
 * Get explanation for an algorithm type
 * @param {string} algorithmType - The algorithm type
 * @returns {string} - Explanation of the algorithm
 */
export function getAlgorithmExplanation(algorithmType) {
  return ALGORITHM_EXPLANATIONS[algorithmType?.toLowerCase()] ||
    'An algorithmic approach for solving computational problems efficiently.';
}

/**
 * Get examples for an algorithm type
 * @param {string} algorithmType - The algorithm type
 * @returns {string[]} - Array of example problems
 */
export function getAlgorithmExamples(algorithmType) {
  return ALGORITHM_EXAMPLES[algorithmType?.toLowerCase()] || ['Various computational problems'];
}

/**
 * Get description for a complexity notation
 * @param {string} complexity - The complexity notation (e.g., "O(n)")
 * @param {string} type - The type of complexity ('time' or 'space')
 * @returns {string} - Description of the complexity
 */
export function getComplexityDescription(complexity, type = 'time') {
  if (!complexity) return 'Complexity analysis for the algorithm.';

  // Extract the complexity notation from the string
  const match = complexity.match(/O\([^)]+\)/);
  const notation = match ? match[0] : complexity;

  // Choose the appropriate description dictionary
  const descriptions = type.toLowerCase() === 'space'
    ? SPACE_COMPLEXITY_DESCRIPTIONS
    : TIME_COMPLEXITY_DESCRIPTIONS;

  return descriptions[notation] ||
    `${notation} - The algorithm's ${type} complexity grows at this rate with input size.`;
}

/**
 * Get properties for a data structure
 * @param {string} dataStructure - The data structure name
 * @returns {string[]} - Array of properties
 */
export function getDataStructureProperties(dataStructure) {
  return DATA_STRUCTURE_PROPERTIES[dataStructure?.toLowerCase()] || ['A data organization structure'];
}

/**
 * Get use cases for a data structure
 * @param {string} dataStructure - The data structure name
 * @returns {string[]} - Array of use cases
 */
export function getDataStructureUseCases(dataStructure) {
  return DATA_STRUCTURE_USE_CASES[dataStructure?.toLowerCase()] || ['Various computational applications'];
}
