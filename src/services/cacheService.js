/**
 * CacheService - Implements intelligent caching for algorithm analysis results
 * Features:
 * - Hash-based cache keys for problem + code + input combinations
 * - LRU (Least Recently Used) eviction policy
 * - Input change detection
 * - Configurable cache size limits
 */

class CacheService {
  constructor(maxSize = 50) {
    this.maxSize = maxSize;
    this.cache = new Map(); // Using Map for LRU ordering - Map maintains insertion order
  }

  /**
   * Generate a unique hash for the combination of problem, code, and input
   * @param {string} problemStatement - The problem description
   * @param {string} solutionCode - The user's solution code
   * @param {any} inputData - Input data for the problem (optional)
   * @returns {string} - Unique hash string
   */
  generateCacheKey(problemStatement, solutionCode, inputData = null) {
    // Normalize inputs to ensure consistent hashing
    const normalizedProblem = this._normalizeString(problemStatement);
    const normalizedCode = this._normalizeString(solutionCode);
    const normalizedInput = inputData ? JSON.stringify(inputData) : '';
    
    // Combine all inputs into a single string
    const combinedInput = `${normalizedProblem}|${normalizedCode}|${normalizedInput}`;
    
    // Generate hash using a simple but effective hash function
    return this._generateHash(combinedInput);
  }

  /**
   * Store analysis result in cache with timestamp
   * @param {string} key - Cache key
   * @param {Object} analysisResult - The analysis result to cache
   */
  setCachedAnalysis(key, analysisResult) {
    const timestamp = Date.now();
    
    // If updating existing key, remove it first to update position in Map
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // If cache is at max size and this is a new key, remove least recently used item
    else if (this.cache.size >= this.maxSize) {
      this._evictLRU();
    }
    
    // Store the analysis result with metadata (this puts it at the end = most recent)
    this.cache.set(key, {
      result: analysisResult,
      timestamp: timestamp,
      accessCount: 1
    });
    
    console.log(`Cache: Stored analysis for key ${key.substring(0, 8)}...`);
  }

  /**
   * Retrieve cached analysis if it exists and is valid
   * @param {string} key - Cache key
   * @returns {Object|null} - Cached analysis result or null if not found
   */
  getCachedAnalysis(key) {
    if (!this.cache.has(key)) {
      console.log(`Cache: Miss for key ${key.substring(0, 8)}...`);
      return null;
    }
    
    const cachedItem = this.cache.get(key);
    const currentTime = Date.now();
    
    // Check if cache entry is still valid (24 hours)
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if (currentTime - cachedItem.timestamp > maxAge) {
      console.log(`Cache: Expired entry for key ${key.substring(0, 8)}...`);
      this.cache.delete(key);
      return null;
    }
    
    // Update access information for LRU
    cachedItem.accessCount++;
    
    // Move to end of Map to maintain LRU order (Maps maintain insertion order)
    // Delete and re-add to move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, cachedItem);
    
    console.log(`Cache: Hit for key ${key.substring(0, 8)}...`);
    return cachedItem.result;
  }

  /**
   * Check if inputs have changed since last analysis
   * @param {Object} currentInputs - Current input combination
   * @param {Object} lastInputs - Previous input combination
   * @returns {boolean} - True if inputs have changed
   */
  hasInputChanged(currentInputs, lastInputs) {
    if (!lastInputs) return true;
    
    // Compare each input field
    const currentKey = this.generateCacheKey(
      currentInputs.problemStatement,
      currentInputs.solutionCode,
      currentInputs.inputData
    );
    
    const lastKey = this.generateCacheKey(
      lastInputs.problemStatement,
      lastInputs.solutionCode,
      lastInputs.inputData
    );
    
    return currentKey !== lastKey;
  }

  /**
   * Clear old cache entries using LRU policy
   */
  cleanupCache() {
    const currentTime = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    // Remove expired entries
    for (const [key, cachedItem] of this.cache.entries()) {
      if (currentTime - cachedItem.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
    
    // If still over size limit, remove LRU entries
    while (this.cache.size > this.maxSize) {
      this._evictLRU();
    }
    
    console.log(`Cache: Cleanup completed. Current size: ${this.cache.size}`);
  }

  /**
   * Get cache statistics for debugging
   * @returns {Object} - Cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this._calculateHitRate(),
      oldestEntry: this._getOldestEntryAge(),
      newestEntry: this._getNewestEntryAge()
    };
  }

  /**
   * Clear all cache entries
   */
  clearCache() {
    this.cache.clear();
    console.log('Cache: All entries cleared');
  }

  // Private helper methods

  /**
   * Normalize string by removing extra whitespace and converting to lowercase
   * @param {string} str - String to normalize
   * @returns {string} - Normalized string
   */
  _normalizeString(str) {
    return str
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Generate hash from string using djb2 algorithm
   * @param {string} str - String to hash
   * @returns {string} - Hash string
   */
  _generateHash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Evict the least recently used cache entry
   */
  _evictLRU() {
    if (this.cache.size === 0) return;
    
    // The first entry in the Map is the least recently used
    const firstKey = this.cache.keys().next().value;
    
    if (firstKey) {
      this.cache.delete(firstKey);
      console.log(`Cache: Evicted LRU entry ${firstKey.substring(0, 8)}...`);
    }
  }

  /**
   * Calculate cache hit rate (placeholder for future implementation)
   * @returns {number} - Hit rate percentage
   */
  _calculateHitRate() {
    // This would require tracking hits and misses over time
    // For now, return 0 as placeholder
    return 0;
  }

  /**
   * Get age of oldest cache entry in minutes
   * @returns {number} - Age in minutes
   */
  _getOldestEntryAge() {
    if (this.cache.size === 0) return 0;
    
    let oldestTime = Infinity;
    for (const cachedItem of this.cache.values()) {
      if (cachedItem.timestamp < oldestTime) {
        oldestTime = cachedItem.timestamp;
      }
    }
    
    return Math.floor((Date.now() - oldestTime) / (1000 * 60));
  }

  /**
   * Get age of newest cache entry in minutes
   * @returns {number} - Age in minutes
   */
  _getNewestEntryAge() {
    if (this.cache.size === 0) return 0;
    
    let newestTime = 0;
    for (const cachedItem of this.cache.values()) {
      if (cachedItem.timestamp > newestTime) {
        newestTime = cachedItem.timestamp;
      }
    }
    
    return Math.floor((Date.now() - newestTime) / (1000 * 60));
  }
}

// Create and export a singleton instance
const cacheService = new CacheService();

export default cacheService;
export { CacheService };