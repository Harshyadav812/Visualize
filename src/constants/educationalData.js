/**
 * Educational content constants for the Header component
 */

export const COMPLEXITY_COMPARISONS = [
  { algorithm: 'Linear Search', time: 'O(n)', space: 'O(1)' },
  { algorithm: 'Binary Search', time: 'O(log n)', space: 'O(1)' },
  { algorithm: 'Hash Table Lookup', time: 'O(1)', space: 'O(n)' },
  { algorithm: 'Merge Sort', time: 'O(n log n)', space: 'O(n)' },
  { algorithm: 'Quick Sort', time: 'O(n log n)', space: 'O(log n)' }
];

export const COMMON_PATTERNS = [
  {
    name: 'Two Pointers',
    description: 'Use two pointers to traverse data structure efficiently',
    examples: ['Two Sum', 'Container With Most Water', 'Remove Duplicates']
  },
  {
    name: 'Sliding Window',
    description: 'Maintain a window of elements to solve subarray problems',
    examples: ['Maximum Subarray Sum', 'Longest Substring', 'Minimum Window']
  },
  {
    name: 'Dynamic Programming',
    description: 'Break complex problems into simpler subproblems',
    examples: ['Fibonacci', 'Coin Change', 'Longest Common Subsequence']
  }
];
