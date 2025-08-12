import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import cacheService from '../../services/cacheService';
import * as geminiService from '../../services/geminiService';

// Mock the geminiService
vi.mock('../../services/geminiService', () => ({
  analyzeAlgorithm: vi.fn()
}));

describe('Complete User Workflow E2E Tests', () => {
  const user = userEvent.setup();

  const mockArrayAnalysis = {
    algorithmType: 'sliding_window',
    dataStructures: ['array'],
    problemCategory: 'Subarray Problems',
    keyVariables: [
      { name: 'left', type: 'number', description: 'Left pointer' },
      { name: 'right', type: 'number', description: 'Right pointer' },
      { name: 'maxLen', type: 'number', description: 'Maximum length found' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Initialize Pointers',
        description: 'Set up left and right pointers at the beginning',
        codeHighlight: 'let left = 0, right = 0;',
        variableStates: { left: 0, right: 0, maxLen: 0 },
        visualization: {
          type: 'array',
          data: {
            arrays: [{
              name: 'nums',
              values: [1, 2, 3, 4, 5],
              highlights: { current: [0] }
            }],
            pointers: [
              { name: 'left', position: 0, color: '#ff0000' },
              { name: 'right', position: 0, color: '#00ff00' }
            ]
          }
        },
        reasoning: 'Initialize pointers to track the sliding window',
        complexity: { stepTime: 'O(1)', stepSpace: 'O(1)' }
      },
      {
        stepNumber: 2,
        title: 'Expand Window',
        description: 'Move right pointer to expand the window',
        codeHighlight: 'right++;',
        variableStates: { left: 0, right: 1, maxLen: 0 },
        visualization: {
          type: 'array',
          data: {
            arrays: [{
              name: 'nums',
              values: [1, 2, 3, 4, 5],
              highlights: { window: { start: 0, end: 1 } }
            }],
            pointers: [
              { name: 'left', position: 0, color: '#ff0000' },
              { name: 'right', position: 1, color: '#00ff00' }
            ]
          }
        },
        reasoning: 'Expand window to include more elements',
        complexity: { stepTime: 'O(1)', stepSpace: 'O(1)' }
      }
    ],
    complexity: {
      time: 'O(n)',
      space: 'O(1)',
      explanation: 'Linear time with constant space using sliding window technique'
    },
    testCases: [
      { input: [1, 2, 3, 4, 5], expected: 2, description: 'Basic sliding window' }
    ],
    commonPitfalls: ['Off-by-one errors in window boundaries'],
    optimizations: ['Use two pointers to avoid nested loops']
  };

  const mockTreeAnalysis = {
    algorithmType: 'tree_traversal',
    dataStructures: ['binary_tree'],
    problemCategory: 'Tree Traversal',
    keyVariables: [
      { name: 'root', type: 'TreeNode', description: 'Root of the tree' },
      { name: 'result', type: 'array', description: 'Traversal result' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Visit Root',
        description: 'Process the root node',
        codeHighlight: 'result.push(root.val);',
        variableStates: { result: [1] },
        visualization: {
          type: 'tree',
          data: {
            nodes: [
              { id: '1', value: 1, x: 300, y: 50, state: 'current' },
              { id: '2', value: 2, x: 200, y: 150, state: 'normal' },
              { id: '3', value: 3, x: 400, y: 150, state: 'normal' }
            ],
            edges: [
              { from: '1', to: '2', state: 'normal' },
              { from: '1', to: '3', state: 'normal' }
            ],
            traversalPath: ['1'],
            currentNode: '1'
          }
        },
        reasoning: 'Start preorder traversal by visiting root',
        complexity: { stepTime: 'O(1)', stepSpace: 'O(1)' }
      }
    ],
    complexity: {
      time: 'O(n)',
      space: 'O(h)',
      explanation: 'Visit each node once, recursion depth equals tree height'
    }
  };

  beforeEach(() => {
    cacheService.clearCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cacheService.clearCache();
  });

  describe('Array Algorithm Workflow', () => {
    it('should complete full sliding window analysis workflow', async () => {
      geminiService.analyzeAlgorithm.mockResolvedValue(mockArrayAnalysis);

      render(<App />);

      // Step 1: Enter problem statement
      const problemInput = screen.getByPlaceholderText(/paste your dsa problem statement/i);
      await user.type(problemInput, 'Find the longest subarray with sum equal to k');

      // Step 2: Enter solution code
      const codeInput = screen.getByPlaceholderText(/paste your.*solution here/i);
      await user.type(codeInput, `
function longestSubarray(nums, k) {
  let left = 0, right = 0;
  let sum = 0, maxLen = 0;
  
  while (right < nums.length) {
    sum += nums[right];
    
    while (sum > k) {
      sum -= nums[left];
      left++;
    }
    
    if (sum === k) {
      maxLen = Math.max(maxLen, right - left + 1);
    }
    
    right++;
  }
  
  return maxLen;
}
      `);

      // Step 3: Analyze the algorithm
      const analyzeButton = screen.getByText(/analyze & visualize/i);
      await user.click(analyzeButton);

      // Wait for analysis to complete
      await waitFor(() => {
        expect(screen.getByText('sliding_window')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Verify algorithm type is displayed
      expect(screen.getByText('sliding_window')).toBeInTheDocument();

      // Step 4: Navigate through visualization steps
      const nextButton = screen.getByLabelText(/next step/i);
      expect(nextButton).toBeInTheDocument();

      // Check first step
      expect(screen.getByText('Initialize Pointers')).toBeInTheDocument();
      expect(screen.getByText('Set up left and right pointers at the beginning')).toBeInTheDocument();

      // Navigate to next step
      await user.click(nextButton);

      // Check second step
      await waitFor(() => {
        expect(screen.getByText('Expand Window')).toBeInTheDocument();
      });

      // Step 5: Check visualization controls
      const playButton = screen.getByLabelText(/play\/pause/i);
      const prevButton = screen.getByLabelText(/previous step/i);
      const resetButton = screen.getByLabelText(/reset to beginning/i);

      expect(playButton).toBeInTheDocument();
      expect(prevButton).toBeInTheDocument();
      expect(resetButton).toBeInTheDocument();

      // Step 6: Verify complexity analysis
      expect(screen.getByText('O(n)')).toBeInTheDocument(); // Time complexity
      expect(screen.getByText('O(1)')).toBeInTheDocument(); // Space complexity

      // Step 7: Check educational content
      expect(screen.getByText(/sliding window technique/i)).toBeInTheDocument();
      expect(screen.getByText(/off-by-one errors/i)).toBeInTheDocument();

      // Verify API was called correctly
      expect(geminiService.analyzeAlgorithm).toHaveBeenCalledWith(
        'Find the longest subarray with sum equal to k',
        expect.stringContaining('longestSubarray')
      );
    });

    it('should handle array visualization with multiple arrays', async () => {
      const multiArrayAnalysis = {
        ...mockArrayAnalysis,
        steps: [{
          ...mockArrayAnalysis.steps[0],
          visualization: {
            type: 'array',
            data: {
              arrays: [
                {
                  name: 'nums1',
                  values: [1, 2, 3],
                  highlights: { current: [0] }
                },
                {
                  name: 'nums2', 
                  values: [4, 5, 6],
                  highlights: { current: [0] }
                }
              ]
            }
          }
        }]
      };

      geminiService.analyzeAlgorithm.mockResolvedValue(multiArrayAnalysis);

      render(<App />);

      const problemInput = screen.getByPlaceholderText(/paste your dsa problem statement/i);
      await user.type(problemInput, 'Merge two sorted arrays');

      const codeInput = screen.getByPlaceholderText(/paste your.*solution here/i);
      await user.type(codeInput, 'function merge(nums1, nums2) { return [...nums1, ...nums2].sort(); }');

      const analyzeButton = screen.getByText(/analyze & visualize/i);
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText('nums1')).toBeInTheDocument();
        expect(screen.getByText('nums2')).toBeInTheDocument();
      });

      // Verify both arrays are displayed
      expect(screen.getByText('nums1')).toBeInTheDocument();
      expect(screen.getByText('nums2')).toBeInTheDocument();
    });
  });

  describe('Tree Algorithm Workflow', () => {
    it('should complete full tree traversal analysis workflow', async () => {
      geminiService.analyzeAlgorithm.mockResolvedValue(mockTreeAnalysis);

      render(<App />);

      // Enter tree traversal problem
      const problemInput = screen.getByPlaceholderText(/paste your dsa problem statement/i);
      await user.type(problemInput, 'Implement preorder traversal of binary tree');

      const codeInput = screen.getByPlaceholderText(/paste your.*solution here/i);
      await user.type(codeInput, `
function preorderTraversal(root) {
  if (!root) return [];
  
  const result = [];
  
  function traverse(node) {
    if (!node) return;
    
    result.push(node.val);
    traverse(node.left);
    traverse(node.right);
  }
  
  traverse(root);
  return result;
}
      `);

      const analyzeButton = screen.getByText(/analyze & visualize/i);
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText('tree_traversal')).toBeInTheDocument();
      });

      // Verify tree visualization elements
      expect(screen.getByText('Visit Root')).toBeInTheDocument();
      expect(screen.getByText('Process the root node')).toBeInTheDocument();

      // Check complexity analysis for trees
      expect(screen.getByText('O(n)')).toBeInTheDocument(); // Time
      expect(screen.getByText('O(h)')).toBeInTheDocument(); // Space (height)
    });
  });

  describe('Error Handling Workflow', () => {
    it('should handle API errors gracefully', async () => {
      geminiService.analyzeAlgorithm.mockRejectedValue(new Error('API rate limit exceeded'));

      render(<App />);

      const problemInput = screen.getByPlaceholderText(/paste your dsa problem statement/i);
      await user.type(problemInput, 'Test problem');

      const codeInput = screen.getByPlaceholderText(/paste your.*solution here/i);
      await user.type(codeInput, 'function test() { return true; }');

      const analyzeButton = screen.getByText(/analyze & visualize/i);
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText(/api rate limit exceeded/i)).toBeInTheDocument();
      });

      // Verify error message is displayed
      expect(screen.getByText(/api rate limit exceeded/i)).toBeInTheDocument();
    });

    it('should handle malformed analysis data', async () => {
      geminiService.analyzeAlgorithm.mockResolvedValue({
        // Missing required fields
        algorithmType: 'unknown'
      });

      render(<App />);

      const problemInput = screen.getByPlaceholderText(/paste your dsa problem statement/i);
      await user.type(problemInput, 'Test problem');

      const codeInput = screen.getByPlaceholderText(/paste your.*solution here/i);
      await user.type(codeInput, 'function test() { return true; }');

      const analyzeButton = screen.getByText(/analyze & visualize/i);
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText('unknown')).toBeInTheDocument();
      });

      // Should still display something even with incomplete data
      expect(screen.getByText('unknown')).toBeInTheDocument();
    });
  });

  describe('Caching Workflow', () => {
    it('should demonstrate cache hit/miss behavior', async () => {
      geminiService.analyzeAlgorithm.mockResolvedValue(mockArrayAnalysis);

      render(<App />);

      const problemInput = screen.getByPlaceholderText(/paste your dsa problem statement/i);
      const codeInput = screen.getByPlaceholderText(/paste your.*solution here/i);
      const analyzeButton = screen.getByText(/analyze & visualize/i);

      // First analysis - should be cache miss
      await user.type(problemInput, 'Test problem');
      await user.type(codeInput, 'function test() { return true; }');
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText('💾 Cached')).toBeInTheDocument();
      });

      expect(geminiService.analyzeAlgorithm).toHaveBeenCalledTimes(1);

      // Clear and re-enter same data
      await user.click(screen.getByText(/new analysis/i));
      
      await user.type(screen.getByPlaceholderText(/paste your dsa problem statement/i), 'Test problem');
      await user.type(screen.getByPlaceholderText(/paste your.*solution here/i), 'function test() { return true; }');
      await user.click(screen.getByText(/analyze & visualize/i));

      // Second analysis - should be cache hit
      await waitFor(() => {
        expect(screen.getByText('🎯 Cached')).toBeInTheDocument();
      });

      // API should not be called again
      expect(geminiService.analyzeAlgorithm).toHaveBeenCalledTimes(1);
    });
  });

  describe('Performance and Large Data', () => {
    it('should handle large array visualization', async () => {
      const largeArrayAnalysis = {
        ...mockArrayAnalysis,
        steps: [{
          ...mockArrayAnalysis.steps[0],
          visualization: {
            type: 'array',
            data: {
              arrays: [{
                name: 'largeArray',
                values: Array.from({ length: 100 }, (_, i) => i + 1),
                highlights: { current: [0] }
              }]
            }
          }
        }]
      };

      geminiService.analyzeAlgorithm.mockResolvedValue(largeArrayAnalysis);

      render(<App />);

      const problemInput = screen.getByPlaceholderText(/paste your dsa problem statement/i);
      await user.type(problemInput, 'Process large array');

      const codeInput = screen.getByPlaceholderText(/paste your.*solution here/i);
      await user.type(codeInput, 'function process(arr) { return arr.length; }');

      const analyzeButton = screen.getByText(/analyze & visualize/i);
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText('largeArray')).toBeInTheDocument();
      });

      // Should handle large arrays without crashing
      expect(screen.getByText('largeArray')).toBeInTheDocument();
      expect(screen.getByText('(length: 100)')).toBeInTheDocument();
    });
  });

  describe('Accessibility Workflow', () => {
    it('should support keyboard navigation', async () => {
      geminiService.analyzeAlgorithm.mockResolvedValue(mockArrayAnalysis);

      render(<App />);

      const problemInput = screen.getByPlaceholderText(/paste your dsa problem statement/i);
      
      // Tab navigation should work
      await user.tab();
      expect(problemInput).toHaveFocus();

      await user.type(problemInput, 'Test problem');
      
      await user.tab();
      const codeInput = screen.getByPlaceholderText(/paste your.*solution here/i);
      expect(codeInput).toHaveFocus();

      await user.type(codeInput, 'function test() { return true; }');

      await user.tab();
      const analyzeButton = screen.getByText(/analyze & visualize/i);
      expect(analyzeButton).toHaveFocus();

      // Enter key should trigger analysis
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('sliding_window')).toBeInTheDocument();
      });
    });

    it('should have proper ARIA labels and roles', async () => {
      geminiService.analyzeAlgorithm.mockResolvedValue(mockArrayAnalysis);

      render(<App />);

      const problemInput = screen.getByPlaceholderText(/paste your dsa problem statement/i);
      await user.type(problemInput, 'Test problem');

      const codeInput = screen.getByPlaceholderText(/paste your.*solution here/i);
      await user.type(codeInput, 'function test() { return true; }');

      const analyzeButton = screen.getByText(/analyze & visualize/i);
      await user.click(analyzeButton);

      await waitFor(() => {
        const nextButton = screen.getByLabelText(/next step/i);
        expect(nextButton).toHaveAttribute('aria-label');
      });

      // Check that control buttons have proper labels
      const nextButton = screen.getByLabelText(/next step/i);
      const prevButton = screen.getByLabelText(/previous step/i);
      const playButton = screen.getByLabelText(/play\/pause/i);

      expect(nextButton).toHaveAttribute('aria-label');
      expect(prevButton).toHaveAttribute('aria-label');
      expect(playButton).toHaveAttribute('aria-label');
    });
  });
});  describe(
'Additional DSA Algorithm Workflows', () => {
    it('should handle dynamic programming workflow', async () => {
      const mockDPAnalysis = {
        algorithmType: 'dynamic_programming',
        dataStructures: ['array'],
        problemCategory: 'Dynamic Programming',
        keyVariables: [
          { name: 'dp', type: 'array', description: 'DP table' },
          { name: 'i', type: 'number', description: 'Current index' }
        ],
        steps: [
          {
            stepNumber: 1,
            title: 'Initialize DP Table',
            description: 'Create DP array with base cases',
            codeHighlight: 'const dp = new Array(n + 1).fill(0); dp[0] = 1; dp[1] = 1;',
            variableStates: { dp: [1, 1, 0, 0, 0], i: 0 },
            visualization: {
              type: 'array',
              data: {
                arrays: [{
                  name: 'dp',
                  values: [1, 1, 0, 0, 0],
                  highlights: { current: [0, 1] }
                }]
              }
            },
            reasoning: 'Set up base cases for Fibonacci sequence',
            complexity: { stepTime: 'O(1)', stepSpace: 'O(n)' }
          }
        ],
        complexity: {
          time: 'O(n)',
          space: 'O(n)',
          explanation: 'Fill DP table once, store all subproblem solutions'
        }
      };

      geminiService.analyzeAlgorithm.mockResolvedValue(mockDPAnalysis);

      render(<App />);

      const problemInput = screen.getByPlaceholderText(/paste your dsa problem statement/i);
      await user.type(problemInput, 'Calculate nth Fibonacci number using dynamic programming');

      const codeInput = screen.getByPlaceholderText(/paste your.*solution here/i);
      await user.type(codeInput, `
function fibonacci(n) {
  if (n <= 1) return n;
  
  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;
  
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  
  return dp[n];
}
      `);

      const analyzeButton = screen.getByText(/analyze & visualize/i);
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText('dynamic_programming')).toBeInTheDocument();
      });

      expect(screen.getByText('Initialize DP Table')).toBeInTheDocument();
      expect(screen.getByText('dp')).toBeInTheDocument();
    });

    it('should handle sorting algorithm workflow', async () => {
      const mockSortAnalysis = {
        algorithmType: 'sorting',
        dataStructures: ['array'],
        problemCategory: 'Sorting',
        keyVariables: [
          { name: 'i', type: 'number', description: 'Outer loop index' },
          { name: 'j', type: 'number', description: 'Inner loop index' }
        ],
        steps: [
          {
            stepNumber: 1,
            title: 'Start Bubble Sort',
            description: 'Begin first pass through array',
            codeHighlight: 'for (let i = 0; i < n - 1; i++) {',
            variableStates: { i: 0, j: 0 },
            visualization: {
              type: 'array',
              data: {
                arrays: [{
                  name: 'arr',
                  values: [64, 34, 25, 12, 22, 11, 90],
                  highlights: { comparison: [0, 1] }
                }],
                operations: [{
                  type: 'compare',
                  indices: [0, 1],
                  description: 'Comparing 64 and 34'
                }]
              }
            },
            reasoning: 'Compare adjacent elements to find swaps needed',
            complexity: { stepTime: 'O(1)', stepSpace: 'O(1)' }
          }
        ],
        complexity: {
          time: 'O(n²)',
          space: 'O(1)',
          explanation: 'Nested loops for comparisons, in-place sorting'
        }
      };

      geminiService.analyzeAlgorithm.mockResolvedValue(mockSortAnalysis);

      render(<App />);

      const problemInput = screen.getByPlaceholderText(/paste your dsa problem statement/i);
      await user.type(problemInput, 'Sort array using bubble sort algorithm');

      const codeInput = screen.getByPlaceholderText(/paste your.*solution here/i);
      await user.type(codeInput, `
function bubbleSort(arr) {
  const n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  
  return arr;
}
      `);

      const analyzeButton = screen.getByText(/analyze & visualize/i);
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText('sorting')).toBeInTheDocument();
      });

      expect(screen.getByText('Start Bubble Sort')).toBeInTheDocument();
      expect(screen.getByText('Comparing 64 and 34')).toBeInTheDocument();
    });

    it('should handle linked list algorithm workflow', async () => {
      const mockLinkedListAnalysis = {
        algorithmType: 'linked_list',
        dataStructures: ['linked_list'],
        problemCategory: 'Linked List Operations',
        keyVariables: [
          { name: 'prev', type: 'ListNode', description: 'Previous node' },
          { name: 'current', type: 'ListNode', description: 'Current node' }
        ],
        steps: [
          {
            stepNumber: 1,
            title: 'Initialize Pointers',
            description: 'Set up prev and current pointers',
            codeHighlight: 'let prev = null; let current = head;',
            variableStates: { prev: null, current: 'node1' },
            visualization: {
              type: 'linked_list',
              data: {
                nodes: [
                  { id: 'node1', value: 1, next: 'node2', state: 'current' },
                  { id: 'node2', value: 2, next: 'node3', state: 'normal' },
                  { id: 'node3', value: 3, next: null, state: 'normal' }
                ],
                head: 'node1',
                listType: 'singly'
              }
            },
            reasoning: 'Initialize pointers for list reversal',
            complexity: { stepTime: 'O(1)', stepSpace: 'O(1)' }
          }
        ],
        complexity: {
          time: 'O(n)',
          space: 'O(1)',
          explanation: 'Visit each node once, constant extra space'
        }
      };

      geminiService.analyzeAlgorithm.mockResolvedValue(mockLinkedListAnalysis);

      render(<App />);

      const problemInput = screen.getByPlaceholderText(/paste your dsa problem statement/i);
      await user.type(problemInput, 'Reverse a singly linked list');

      const codeInput = screen.getByPlaceholderText(/paste your.*solution here/i);
      await user.type(codeInput, `
function reverseList(head) {
  let prev = null;
  let current = head;
  
  while (current !== null) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }
  
  return prev;
}
      `);

      const analyzeButton = screen.getByText(/analyze & visualize/i);
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText('linked_list')).toBeInTheDocument();
      });

      expect(screen.getByText('Initialize Pointers')).toBeInTheDocument();
      expect(screen.getByText('Set up prev and current pointers')).toBeInTheDocument();
    });

    it('should handle backtracking algorithm workflow', async () => {
      const mockBacktrackingAnalysis = {
        algorithmType: 'backtracking',
        dataStructures: ['array'],
        problemCategory: 'Backtracking',
        keyVariables: [
          { name: 'board', type: 'array', description: 'Chess board' },
          { name: 'row', type: 'number', description: 'Current row' }
        ],
        steps: [
          {
            stepNumber: 1,
            title: 'Try Queen Placement',
            description: 'Attempt to place queen in current row',
            codeHighlight: 'for (let col = 0; col < n; col++) {',
            variableStates: { board: [[0, 0, 0, 0]], row: 0 },
            visualization: {
              type: 'recursion',
              data: {
                callStack: [
                  {
                    function: 'solveNQueens',
                    parameters: { row: 0 },
                    level: 0,
                    state: 'active'
                  }
                ],
                decisionTree: {
                  nodes: [
                    { id: 'root', value: 'Start', state: 'normal' },
                    { id: 'try0', value: 'Try Col 0', state: 'current' }
                  ],
                  edges: [
                    { from: 'root', to: 'try0' }
                  ]
                }
              }
            },
            reasoning: 'Try placing queen in each column of current row',
            complexity: { stepTime: 'O(1)', stepSpace: 'O(n)' }
          }
        ],
        complexity: {
          time: 'O(n!)',
          space: 'O(n)',
          explanation: 'Exponential time due to backtracking, linear space for recursion'
        }
      };

      geminiService.analyzeAlgorithm.mockResolvedValue(mockBacktrackingAnalysis);

      render(<App />);

      const problemInput = screen.getByPlaceholderText(/paste your dsa problem statement/i);
      await user.type(problemInput, 'Solve N-Queens problem using backtracking');

      const codeInput = screen.getByPlaceholderText(/paste your.*solution here/i);
      await user.type(codeInput, `
function solveNQueens(n) {
  const result = [];
  const board = Array(n).fill().map(() => Array(n).fill('.'));
  
  function backtrack(row) {
    if (row === n) {
      result.push(board.map(row => row.join('')));
      return;
    }
    
    for (let col = 0; col < n; col++) {
      if (isValid(board, row, col)) {
        board[row][col] = 'Q';
        backtrack(row + 1);
        board[row][col] = '.';
      }
    }
  }
  
  backtrack(0);
  return result;
}
      `);

      const analyzeButton = screen.getByText(/analyze & visualize/i);
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText('backtracking')).toBeInTheDocument();
      });

      expect(screen.getByText('Try Queen Placement')).toBeInTheDocument();
      expect(screen.getByText('Attempt to place queen in current row')).toBeInTheDocument();
    });
  });