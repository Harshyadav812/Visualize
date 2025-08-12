import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CacheService } from '../cacheService.js';

describe('CacheService', () => {
  let cacheService;

  beforeEach(() => {
    cacheService = new CacheService(3); // Small cache size for testing
    vi.clearAllMocks();
  });

  describe('generateCacheKey', () => {
    it('should generate consistent hash for same inputs', () => {
      const problem = 'Find maximum subarray sum';
      const code = 'function maxSubarray(arr) { return Math.max(...arr); }';
      const input = [1, 2, 3];

      const key1 = cacheService.generateCacheKey(problem, code, input);
      const key2 = cacheService.generateCacheKey(problem, code, input);

      expect(key1).toBe(key2);
      expect(key1).toBeTruthy();
      expect(typeof key1).toBe('string');
    });

    it('should generate different hashes for different inputs', () => {
      const problem1 = 'Find maximum subarray sum';
      const problem2 = 'Find minimum subarray sum';
      const code = 'function test() {}';

      const key1 = cacheService.generateCacheKey(problem1, code);
      const key2 = cacheService.generateCacheKey(problem2, code);

      expect(key1).not.toBe(key2);
    });

    it('should normalize whitespace and case', () => {
      const problem1 = 'Find   Maximum   Sum';
      const problem2 = 'find maximum sum';
      const code1 = 'function   test()   {   return   true;   }';
      const code2 = 'function test() { return true; }';

      const key1 = cacheService.generateCacheKey(problem1, code1);
      const key2 = cacheService.generateCacheKey(problem2, code2);

      expect(key1).toBe(key2);
    });

    it('should handle null input data', () => {
      const problem = 'Test problem';
      const code = 'function test() {}';

      const key1 = cacheService.generateCacheKey(problem, code, null);
      const key2 = cacheService.generateCacheKey(problem, code);

      expect(key1).toBe(key2);
    });

    it('should include input data in hash when provided', () => {
      const problem = 'Test problem';
      const code = 'function test() {}';
      const input1 = [1, 2, 3];
      const input2 = [4, 5, 6];

      const key1 = cacheService.generateCacheKey(problem, code, input1);
      const key2 = cacheService.generateCacheKey(problem, code, input2);

      expect(key1).not.toBe(key2);
    });
  });

  describe('setCachedAnalysis and getCachedAnalysis', () => {
    it('should store and retrieve analysis results', () => {
      const key = 'test-key';
      const analysisResult = {
        algorithmType: 'sliding_window',
        steps: [{ stepNumber: 1, title: 'Initialize' }]
      };

      cacheService.setCachedAnalysis(key, analysisResult);
      const retrieved = cacheService.getCachedAnalysis(key);

      expect(retrieved).toEqual(analysisResult);
    });

    it('should return null for non-existent keys', () => {
      const result = cacheService.getCachedAnalysis('non-existent-key');
      expect(result).toBeNull();
    });

    it('should update access count and timestamp on retrieval', () => {
      const key = 'test-key';
      const analysisResult = { test: 'data' };

      cacheService.setCachedAnalysis(key, analysisResult);

      // First access
      cacheService.getCachedAnalysis(key);

      // Check internal state (accessing private property for testing)
      const cachedItem = cacheService.cache.get(key);
      expect(cachedItem.accessCount).toBe(2); // 1 from set, 1 from get
    });

    it('should handle expired cache entries', () => {
      const key = 'test-key';
      const analysisResult = { test: 'data' };

      cacheService.setCachedAnalysis(key, analysisResult);

      // Mock an old timestamp (25 hours ago)
      const cachedItem = cacheService.cache.get(key);
      cachedItem.timestamp = Date.now() - (25 * 60 * 60 * 1000);

      const result = cacheService.getCachedAnalysis(key);
      expect(result).toBeNull();
      expect(cacheService.cache.has(key)).toBe(false);
    });
  });

  describe('LRU eviction policy', () => {
    it('should evict least recently used item when cache is full', () => {
      const results = [
        { key: 'key1', data: { test: 'data1' } },
        { key: 'key2', data: { test: 'data2' } },
        { key: 'key3', data: { test: 'data3' } },
        { key: 'key4', data: { test: 'data4' } }
      ];

      // Fill cache to capacity (3 items)
      results.slice(0, 3).forEach(({ key, data }) => {
        cacheService.setCachedAnalysis(key, data);
      });

      expect(cacheService.cache.size).toBe(3);

      // Add fourth item, should evict first item (key1)
      cacheService.setCachedAnalysis(results[3].key, results[3].data);

      expect(cacheService.cache.size).toBe(3);
      expect(cacheService.getCachedAnalysis('key1')).toBeNull();
      expect(cacheService.getCachedAnalysis('key2')).toEqual(results[1].data);
      expect(cacheService.getCachedAnalysis('key3')).toEqual(results[2].data);
      expect(cacheService.getCachedAnalysis('key4')).toEqual(results[3].data);
    });

    it('should update LRU order when accessing existing items', () => {
      const results = [
        { key: 'key1', data: { test: 'data1' } },
        { key: 'key2', data: { test: 'data2' } },
        { key: 'key3', data: { test: 'data3' } }
      ];

      // Fill cache
      results.forEach(({ key, data }) => {
        cacheService.setCachedAnalysis(key, data);
      });

      // Access key1 to make it most recently used
      cacheService.getCachedAnalysis('key1');

      // Add new item, should evict key2 (now least recently used)
      cacheService.setCachedAnalysis('key4', { test: 'data4' });

      expect(cacheService.getCachedAnalysis('key1')).toEqual(results[0].data);
      expect(cacheService.getCachedAnalysis('key2')).toBeNull();
      expect(cacheService.getCachedAnalysis('key3')).toEqual(results[2].data);
      expect(cacheService.getCachedAnalysis('key4')).toEqual({ test: 'data4' });
    });
  });

  describe('hasInputChanged', () => {
    it('should return true when lastInputs is null', () => {
      const currentInputs = {
        problemStatement: 'Test problem',
        solutionCode: 'function test() {}',
        inputData: [1, 2, 3]
      };

      const result = cacheService.hasInputChanged(currentInputs, null);
      expect(result).toBe(true);
    });

    it('should return false when inputs are identical', () => {
      const inputs = {
        problemStatement: 'Test problem',
        solutionCode: 'function test() {}',
        inputData: [1, 2, 3]
      };

      const result = cacheService.hasInputChanged(inputs, inputs);
      expect(result).toBe(false);
    });

    it('should return true when problem statement changes', () => {
      const currentInputs = {
        problemStatement: 'Test problem 1',
        solutionCode: 'function test() {}',
        inputData: [1, 2, 3]
      };

      const lastInputs = {
        problemStatement: 'Test problem 2',
        solutionCode: 'function test() {}',
        inputData: [1, 2, 3]
      };

      const result = cacheService.hasInputChanged(currentInputs, lastInputs);
      expect(result).toBe(true);
    });

    it('should return true when solution code changes', () => {
      const currentInputs = {
        problemStatement: 'Test problem',
        solutionCode: 'function test1() {}',
        inputData: [1, 2, 3]
      };

      const lastInputs = {
        problemStatement: 'Test problem',
        solutionCode: 'function test2() {}',
        inputData: [1, 2, 3]
      };

      const result = cacheService.hasInputChanged(currentInputs, lastInputs);
      expect(result).toBe(true);
    });

    it('should return true when input data changes', () => {
      const currentInputs = {
        problemStatement: 'Test problem',
        solutionCode: 'function test() {}',
        inputData: [1, 2, 3]
      };

      const lastInputs = {
        problemStatement: 'Test problem',
        solutionCode: 'function test() {}',
        inputData: [4, 5, 6]
      };

      const result = cacheService.hasInputChanged(currentInputs, lastInputs);
      expect(result).toBe(true);
    });
  });

  describe('cleanupCache', () => {
    it('should remove expired entries', () => {
      const key1 = 'key1';
      const key2 = 'key2';
      const data = { test: 'data' };

      cacheService.setCachedAnalysis(key1, data);
      cacheService.setCachedAnalysis(key2, data);

      // Mock one entry as expired (25 hours old)
      const cachedItem1 = cacheService.cache.get(key1);
      cachedItem1.timestamp = Date.now() - (25 * 60 * 60 * 1000);

      cacheService.cleanupCache();

      expect(cacheService.getCachedAnalysis(key1)).toBeNull();
      expect(cacheService.getCachedAnalysis(key2)).toEqual(data);
    });

    it('should enforce size limit after cleanup', () => {
      // Create cache service with size 2
      const smallCache = new CacheService(2);

      // Add 3 items
      smallCache.setCachedAnalysis('key1', { test: 'data1' });
      smallCache.setCachedAnalysis('key2', { test: 'data2' });
      smallCache.setCachedAnalysis('key3', { test: 'data3' });

      expect(smallCache.cache.size).toBe(2); // Should auto-evict during set

      smallCache.cleanupCache();
      expect(smallCache.cache.size).toBeLessThanOrEqual(2);
    });
  });

  describe('getStats', () => {
    it('should return correct cache statistics', () => {
      const data = { test: 'data' };
      cacheService.setCachedAnalysis('key1', data);
      cacheService.setCachedAnalysis('key2', data);

      const stats = cacheService.getStats();

      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('oldestEntry');
      expect(stats).toHaveProperty('newestEntry');

      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(3);
      expect(typeof stats.hitRate).toBe('number');
      expect(typeof stats.oldestEntry).toBe('number');
      expect(typeof stats.newestEntry).toBe('number');
    });

    it('should handle empty cache', () => {
      const stats = cacheService.getStats();

      expect(stats.size).toBe(0);
      expect(stats.oldestEntry).toBe(0);
      expect(stats.newestEntry).toBe(0);
    });
  });

  describe('clearCache', () => {
    it('should remove all cache entries', () => {
      const data = { test: 'data' };
      cacheService.setCachedAnalysis('key1', data);
      cacheService.setCachedAnalysis('key2', data);

      expect(cacheService.cache.size).toBe(2);

      cacheService.clearCache();

      expect(cacheService.cache.size).toBe(0);
    });
  });

  describe('private helper methods', () => {
    it('should normalize strings correctly', () => {
      const testString = '  Hello   World  ';
      const normalized = cacheService._normalizeString(testString);

      expect(normalized).toBe('hello world');
    });

    it('should generate consistent hashes', () => {
      const testString = 'test string';
      const hash1 = cacheService._generateHash(testString);
      const hash2 = cacheService._generateHash(testString);

      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('string');
      expect(hash1.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for different strings', () => {
      const hash1 = cacheService._generateHash('string1');
      const hash2 = cacheService._generateHash('string2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      const key = cacheService.generateCacheKey('', '', null);
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });

    it('should handle very long inputs', () => {
      const longString = 'a'.repeat(10000);
      const key = cacheService.generateCacheKey(longString, longString, null);
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });

    it('should handle special characters in inputs', () => {
      const specialChars = '!@#$%^&*()[]{}|;:,.<>?';
      const key = cacheService.generateCacheKey(specialChars, specialChars, null);
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });

    it('should handle complex input data structures', () => {
      const complexInput = {
        array: [1, 2, 3],
        nested: { a: 1, b: [4, 5, 6] },
        string: 'test'
      };

      const key = cacheService.generateCacheKey('problem', 'code', complexInput);
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });
  });
});