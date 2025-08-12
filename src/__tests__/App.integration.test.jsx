import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import cacheService from '../services/cacheService';
import * as geminiService from '../services/geminiService';

// Mock the geminiService
vi.mock('../services/geminiService', () => ({
  analyzeAlgorithm: vi.fn()
}));

// Mock the AlgorithmVisualizer component to avoid complex rendering
vi.mock('../components/AlgorithmVisualizer', () => ({
  default: ({ analysis }) => (
    <div data-testid="algorithm-visualizer">
      Algorithm Type: {analysis?.algorithmType || 'None'}
    </div>
  )
}));

describe('App Integration Tests - Caching Behavior', () => {
  const mockAnalysisResult = {
    algorithmType: 'sliding_window',
    dataStructures: ['array'],
    problemCategory: 'Subarray Sum',
    keyVariables: [
      { name: 'maxLen', type: 'number', description: 'Maximum length found' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Initialize Variables',
        description: 'Set up variables for tracking',
        codeHighlight: 'let maxLen = 0;',
        variableStates: { maxLen: 0 },
        visualization: {
          type: 'array',
          data: { arrays: [{ name: 'arr', values: [1, 2, 3] }] }
        },
        reasoning: 'Initialize tracking variables',
        complexity: { stepTime: 'O(1)', stepSpace: 'O(1)' }
      }
    ],
    complexity: {
      time: 'O(n)',
      space: 'O(1)',
      explanation: 'Linear time complexity'
    }
  };

  const testProblem = 'Find the longest subarray with sum equal to k';
  const testCode = 'function longestSubarray(arr, k) { return 0; }';

  beforeEach(() => {
    // Clear cache before each test
    cacheService.clearCache();
    
    // Reset all mocks
    vi.clearAllMocks();
    
    // Mock successful API response
    geminiService.analyzeAlgorithm.mockResolvedValue(mockAnalysisResult);
  });

  afterEach(() => {
    // Clean up after each test
    cacheService.clearCache();
  });

  it('should make API call on first analysis (cache miss)', async () => {
    render(<App />);

    // Fill in the form
    const problemTextarea = screen.getByPlaceholderText(/paste your dsa problem statement/i);
    const codeTextarea = screen.getByPlaceholderText(/paste your.*solution here/i);
    
    fireEvent.change(problemTextarea, { target: { value: testProblem } });
    fireEvent.change(codeTextarea, { target: { value: testCode } });

    // Click analyze button
    const analyzeButton = screen.getByText(/analyze & visualize/i);
    fireEvent.click(analyzeButton);

    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.getByTestId('algorithm-visualizer')).toBeInTheDocument();
    });

    // Verify API was called
    expect(geminiService.analyzeAlgorithm).toHaveBeenCalledTimes(1);
    expect(geminiService.analyzeAlgorithm).toHaveBeenCalledWith(testProblem, testCode);

    // Verify analysis result is displayed
    expect(screen.getByText('Algorithm Type: sliding_window')).toBeInTheDocument();
    
    // Verify cache status indicator shows stored
    expect(screen.getByText('💾 Cached')).toBeInTheDocument();
  });

  it('should use cached result on second analysis (cache hit)', async () => {
    // Pre-populate cache with a result
    const cacheKey = cacheService.generateCacheKey(testProblem, testCode, null);
    cacheService.setCachedAnalysis(cacheKey, mockAnalysisResult);

    render(<App />);

    // Fill in the form with same data
    const problemTextarea = screen.getByPlaceholderText(/paste your dsa problem statement/i);
    const codeTextarea = screen.getByPlaceholderText(/paste your.*solution here/i);
    
    fireEvent.change(problemTextarea, { target: { value: testProblem } });
    fireEvent.change(codeTextarea, { target: { value: testCode } });

    // Click analyze button (should hit cache)
    const analyzeButton = screen.getByText(/analyze & visualize/i);
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByTestId('algorithm-visualizer')).toBeInTheDocument();
    });

    // Verify API was NOT called (cache hit)
    expect(geminiService.analyzeAlgorithm).toHaveBeenCalledTimes(0);

    // Verify cache hit indicator is shown
    expect(screen.getByText('🎯 Cached')).toBeInTheDocument();

    // Verify same analysis result is displayed
    expect(screen.getByText('Algorithm Type: sliding_window')).toBeInTheDocument();
  });

  it('should detect input changes and make new API call', async () => {
    // Pre-populate cache with original problem
    const originalCacheKey = cacheService.generateCacheKey(testProblem, testCode, null);
    cacheService.setCachedAnalysis(originalCacheKey, mockAnalysisResult);

    render(<App />);

    const problemTextarea = screen.getByPlaceholderText(/paste your dsa problem statement/i);
    const codeTextarea = screen.getByPlaceholderText(/paste your.*solution here/i);
    
    // Use different input (should not hit cache)
    const modifiedProblem = 'Find the maximum sum subarray';
    fireEvent.change(problemTextarea, { target: { value: modifiedProblem } });
    fireEvent.change(codeTextarea, { target: { value: testCode } });

    // Analysis with different input
    const analyzeButton = screen.getByText(/analyze & visualize/i);
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByTestId('algorithm-visualizer')).toBeInTheDocument();
    });

    // Verify API was called (cache miss due to different input)
    expect(geminiService.analyzeAlgorithm).toHaveBeenCalledTimes(1);
    expect(geminiService.analyzeAlgorithm).toHaveBeenCalledWith(modifiedProblem, testCode);

    // Verify analysis result is displayed
    expect(screen.getByText('Algorithm Type: sliding_window')).toBeInTheDocument();
  });

  it('should handle cache errors gracefully with API fallback', async () => {
    // Mock cache service to throw an error
    const originalGetCachedAnalysis = cacheService.getCachedAnalysis;
    cacheService.getCachedAnalysis = vi.fn().mockImplementation(() => {
      throw new Error('Cache storage error');
    });

    render(<App />);

    const problemTextarea = screen.getByPlaceholderText(/paste your dsa problem statement/i);
    const codeTextarea = screen.getByPlaceholderText(/paste your.*solution here/i);
    
    fireEvent.change(problemTextarea, { target: { value: testProblem } });
    fireEvent.change(codeTextarea, { target: { value: testCode } });

    const analyzeButton = screen.getByText(/analyze & visualize/i);
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByTestId('algorithm-visualizer')).toBeInTheDocument();
    });

    // Verify API was still called as fallback
    expect(geminiService.analyzeAlgorithm).toHaveBeenCalledTimes(1);

    // Verify fallback indicator is shown
    expect(screen.getByText('⚠️ Fallback')).toBeInTheDocument();

    // Verify analysis still works
    expect(screen.getByText('Algorithm Type: sliding_window')).toBeInTheDocument();

    // Restore original method
    cacheService.getCachedAnalysis = originalGetCachedAnalysis;
  });

  it('should handle API errors properly', async () => {
    // Mock API to fail
    geminiService.analyzeAlgorithm.mockRejectedValue(new Error('API request failed'));

    render(<App />);

    const problemTextarea = screen.getByPlaceholderText(/paste your dsa problem statement/i);
    const codeTextarea = screen.getByPlaceholderText(/paste your.*solution here/i);
    
    fireEvent.change(problemTextarea, { target: { value: testProblem } });
    fireEvent.change(codeTextarea, { target: { value: testCode } });

    const analyzeButton = screen.getByText(/analyze & visualize/i);
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByText(/❌.*api request failed/i)).toBeInTheDocument();
    });

    // Verify API was called
    expect(geminiService.analyzeAlgorithm).toHaveBeenCalledTimes(1);

    // Verify no analysis result is displayed
    expect(screen.queryByTestId('algorithm-visualizer')).not.toBeInTheDocument();
  });

  it('should show cache status indicators in analysis view', async () => {
    render(<App />);

    const problemTextarea = screen.getByPlaceholderText(/paste your dsa problem statement/i);
    const codeTextarea = screen.getByPlaceholderText(/paste your.*solution here/i);
    
    fireEvent.change(problemTextarea, { target: { value: testProblem } });
    fireEvent.change(codeTextarea, { target: { value: testCode } });

    const analyzeButton = screen.getByText(/analyze & visualize/i);
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByTestId('algorithm-visualizer')).toBeInTheDocument();
    });

    // Verify cache status indicator in analysis view
    expect(screen.getByText('💾 Cached')).toBeInTheDocument();
  });

  it('should clear cache status when starting new analysis', async () => {
    render(<App />);

    const problemTextarea = screen.getByPlaceholderText(/paste your dsa problem statement/i);
    const codeTextarea = screen.getByPlaceholderText(/paste your.*solution here/i);
    
    // First analysis
    fireEvent.change(problemTextarea, { target: { value: testProblem } });
    fireEvent.change(codeTextarea, { target: { value: testCode } });

    const analyzeButton = screen.getByText(/analyze & visualize/i);
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByTestId('algorithm-visualizer')).toBeInTheDocument();
    });

    // Click "New Analysis" button
    const newAnalysisButton = screen.getByText(/new analysis/i);
    fireEvent.click(newAnalysisButton);

    // Verify cache status is cleared
    expect(screen.queryByText(/💾 cached/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/🎯 cached/i)).not.toBeInTheDocument();
  });

  it('should generate different cache keys for different inputs', () => {
    const key1 = cacheService.generateCacheKey('problem1', 'code1', null);
    const key2 = cacheService.generateCacheKey('problem2', 'code1', null);
    const key3 = cacheService.generateCacheKey('problem1', 'code2', null);
    const key4 = cacheService.generateCacheKey('problem1', 'code1', { input: 'data' });

    // All keys should be different
    expect(key1).not.toBe(key2);
    expect(key1).not.toBe(key3);
    expect(key1).not.toBe(key4);
    expect(key2).not.toBe(key3);
    expect(key2).not.toBe(key4);
    expect(key3).not.toBe(key4);
  });

  it('should generate same cache key for identical inputs', () => {
    const key1 = cacheService.generateCacheKey('problem', 'code', null);
    const key2 = cacheService.generateCacheKey('problem', 'code', null);
    const key3 = cacheService.generateCacheKey('  problem  ', '  code  ', null); // With whitespace

    expect(key1).toBe(key2);
    expect(key1).toBe(key3); // Should normalize whitespace
  });
});