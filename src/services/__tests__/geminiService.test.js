import { describe, it, expect, vi } from 'vitest';
import {
    detectProblemType,
    generateTestCases
} from '../geminiService.js';

// Mock the Google Generative AI module
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: vi.fn(() => ({
        getGenerativeModel: vi.fn(() => ({
            generateContent: vi.fn()
        }))
    }))
}));

describe('Enhanced Gemini Service - DSA Support', () => {
    describe('detectProblemType', () => {
        it('should detect array-based sliding window problems', () => {
            const problem = 'Find the maximum sum of a subarray of size k';
            const code = 'for(int i = 0; i < k; i++) { windowSum += arr[i]; }';

            const result = detectProblemType(problem, code);

            expect(result.dataStructures).toContain('array');
            expect(result.algorithms).toContain('sliding_window');
            expect(result.primaryDataStructure).toBe('array');
        });

        it('should detect tree traversal problems', () => {
            const problem = 'Perform inorder traversal of a binary tree';
            const code = 'function inorder(root) { if(root) { inorder(root.left); } }';

            const result = detectProblemType(problem, code);

            expect(result.dataStructures).toContain('tree');
            expect(result.primaryDataStructure).toBe('tree');
        });

        it('should detect graph algorithms', () => {
            const problem = 'Find shortest path using BFS';
            const code = 'queue.push(start); visited[start] = true;';

            const result = detectProblemType(problem, code);

            expect(result.dataStructures).toContain('graph');
            expect(result.algorithms).toContain('bfs');
        });

        it('should detect linked list problems', () => {
            const problem = 'Reverse a linked list';
            const code = 'ListNode* prev = nullptr; while(current) { next = current->next; }';

            const result = detectProblemType(problem, code);

            expect(result.dataStructures).toContain('linkedlist');
            expect(result.primaryDataStructure).toBe('linkedlist');
        });

        it('should detect stack operations', () => {
            const problem = 'Valid parentheses checker';
            const code = 'stack.push(char); if(!stack.empty()) stack.pop();';

            const result = detectProblemType(problem, code);

            expect(result.dataStructures).toContain('stack');
        });

        it('should detect recursion patterns', () => {
            const problem = 'Calculate fibonacci numbers';
            const code = 'function fib(n) { if(n <= 1) return n; return fib(n-1) + fib(n-2); }';

            const result = detectProblemType(problem, code);

            expect(result.dataStructures).toContain('recursion');
        });

        it('should provide default fallbacks for unknown problems', () => {
            const problem = 'Some unknown algorithm';
            const code = 'console.log("hello");';

            const result = detectProblemType(problem, code);

            expect(result.dataStructures).toContain('array'); // Default fallback
            expect(result.algorithms).toContain('general'); // Default fallback
        });

        it('should detect multiple data structures', () => {
            const problem = 'BFS traversal of a graph using queue';
            const code = 'queue.push(node); graph[node].forEach(neighbor => {});';

            const result = detectProblemType(problem, code);

            expect(result.dataStructures).toContain('graph');
            expect(result.dataStructures).toContain('queue');
        });

        it('should handle edge cases gracefully', () => {
            // Empty inputs
            const result1 = detectProblemType('', '');
            expect(result1.dataStructures).toContain('array');
            expect(result1.algorithms).toContain('general');

            // Null/undefined inputs
            const result2 = detectProblemType(null, undefined);
            expect(result2).toHaveProperty('dataStructures');
            expect(result2).toHaveProperty('algorithms');

            // Very long problem statement
            const longProblem = 'a'.repeat(1000) + ' sliding window maximum sum';
            const result3 = detectProblemType(longProblem, 'code');
            expect(result3.algorithms).toContain('sliding_window');

            // Code with special characters
            const codeWithSpecialChars = 'if (arr[i] >= arr[j] && i != j) { /* comment */ }';
            const result4 = detectProblemType('array problem', codeWithSpecialChars);
            expect(result4.dataStructures).toContain('array');
        });
    });

    describe('generateTestCases', () => {
        it('should generate sliding window test cases', () => {
            const testCases = generateTestCases('Maximum sum subarray', 'sliding_window');

            expect(testCases).toHaveLength(2);
            expect(testCases[0]).toHaveProperty('input');
            expect(testCases[0]).toHaveProperty('expected');
            expect(testCases[0]).toHaveProperty('description');
            expect(testCases[0].input).toContain('k=3');
        });

        it('should generate two pointer test cases', () => {
            const testCases = generateTestCases('Two sum problem', 'two_pointer');

            expect(testCases).toHaveLength(2);
            expect(testCases[0].input).toContain('target');
        });

        it('should generate binary search test cases', () => {
            const testCases = generateTestCases('Search in sorted array', 'binary_search');

            expect(testCases).toHaveLength(2);
            expect(testCases[1].expected).toBe('-1'); // Not found case
        });

        it('should generate default test cases for unknown algorithms', () => {
            const testCases = generateTestCases('Unknown problem', 'unknown');

            expect(testCases).toHaveLength(1);
            expect(testCases[0]).toHaveProperty('input');
            expect(testCases[0]).toHaveProperty('expected');
        });
    });

    describe('Problem type detection accuracy', () => {
        it('should correctly identify dynamic programming problems', () => {
            const problem = 'Find the longest common subsequence using dynamic programming';
            const code = 'dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);';

            const result = detectProblemType(problem, code);

            expect(result.dataStructures).toContain('dp');
        });

        it('should identify queue-based problems', () => {
            const problem = 'Implement a queue using two stacks';
            const code = 'queue.enqueue(item); queue.dequeue();';

            const result = detectProblemType(problem, code);

            expect(result.dataStructures).toContain('queue');
        });

        it('should detect sorting algorithms', () => {
            const problem = 'Implement merge sort algorithm';
            const code = 'function mergeSort(arr) { if (arr.length <= 1) return arr; }';

            const result = detectProblemType(problem, code);

            expect(result.algorithms).toContain('sorting');
        });

        it('should identify two-pointer technique', () => {
            const problem = 'Find two numbers that sum to target';
            const code = 'let left = 0, right = arr.length - 1;';

            const result = detectProblemType(problem, code);

            expect(result.algorithms).toContain('two_pointer');
        });
    });
});