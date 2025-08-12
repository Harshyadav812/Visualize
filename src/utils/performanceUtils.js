/**
 * Performance optimization utilities for visualization components
 * Provides tools for monitoring, optimizing, and debugging performance
 */

import React from 'react';

/**
 * Performance profiler for React components
 */
export class ComponentProfiler {
  constructor(componentName) {
    this.componentName = componentName;
    this.renderTimes = [];
    this.maxSamples = 100;
  }

  /**
   * Start profiling a render
   * @returns {Function} End profiling function
   */
  startRender() {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      this.renderTimes.push(renderTime);
      
      // Keep only recent samples
      if (this.renderTimes.length > this.maxSamples) {
        this.renderTimes.shift();
      }
      
      // Log slow renders in development
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`Slow render in ${this.componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  }

  /**
   * Get performance statistics
   * @returns {Object} Performance stats
   */
  getStats() {
    if (this.renderTimes.length === 0) {
      return { average: 0, min: 0, max: 0, total: 0, count: 0 };
    }

    const total = this.renderTimes.reduce((sum, time) => sum + time, 0);
    const average = total / this.renderTimes.length;
    const min = Math.min(...this.renderTimes);
    const max = Math.max(...this.renderTimes);

    return {
      average: parseFloat(average.toFixed(2)),
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      count: this.renderTimes.length
    };
  }

  /**
   * Reset profiling data
   */
  reset() {
    this.renderTimes = [];
  }
}

/**
 * Memory usage monitor for visualization components
 */
export class MemoryMonitor {
  constructor() {
    this.snapshots = [];
    this.isMonitoring = false;
    this.intervalId = null;
  }

  /**
   * Start monitoring memory usage
   * @param {number} interval - Monitoring interval in milliseconds
   */
  start(interval = 5000) {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.intervalId = setInterval(() => {
      this.takeSnapshot();
    }, interval);
  }

  /**
   * Stop monitoring memory usage
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isMonitoring = false;
  }

  /**
   * Take a memory usage snapshot
   */
  takeSnapshot() {
    if (performance.memory) {
      const snapshot = {
        timestamp: Date.now(),
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
      
      this.snapshots.push(snapshot);
      
      // Keep only recent snapshots (last 100)
      if (this.snapshots.length > 100) {
        this.snapshots.shift();
      }

      // Warn about high memory usage
      const usagePercent = (snapshot.usedJSHeapSize / snapshot.jsHeapSizeLimit) * 100;
      if (usagePercent > 80) {
        console.warn(`High memory usage: ${usagePercent.toFixed(1)}%`);
      }
    }
  }

  /**
   * Get memory usage statistics
   * @returns {Object} Memory stats
   */
  getStats() {
    if (this.snapshots.length === 0) return null;

    const latest = this.snapshots[this.snapshots.length - 1];
    const oldest = this.snapshots[0];
    
    return {
      current: {
        used: this.formatBytes(latest.usedJSHeapSize),
        total: this.formatBytes(latest.totalJSHeapSize),
        limit: this.formatBytes(latest.jsHeapSizeLimit),
        usagePercent: ((latest.usedJSHeapSize / latest.jsHeapSizeLimit) * 100).toFixed(1)
      },
      trend: {
        change: this.formatBytes(latest.usedJSHeapSize - oldest.usedJSHeapSize),
        duration: latest.timestamp - oldest.timestamp
      }
    };
  }

  /**
   * Format bytes to human readable format
   * @param {number} bytes - Bytes to format
   * @returns {string} Formatted string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

/**
 * Virtual scrolling utility for large datasets
 */
export class VirtualScrollManager {
  constructor(containerHeight, itemHeight, buffer = 5) {
    this.containerHeight = containerHeight;
    this.itemHeight = itemHeight;
    this.buffer = buffer;
    this.scrollTop = 0;
  }

  /**
   * Calculate visible range for virtual scrolling
   * @param {number} totalItems - Total number of items
   * @returns {Object} Visible range information
   */
  getVisibleRange(totalItems) {
    const visibleCount = Math.ceil(this.containerHeight / this.itemHeight);
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    
    const bufferedStart = Math.max(0, startIndex - this.buffer);
    const bufferedEnd = Math.min(totalItems - 1, startIndex + visibleCount + this.buffer);
    
    return {
      startIndex: bufferedStart,
      endIndex: bufferedEnd,
      visibleCount: bufferedEnd - bufferedStart + 1,
      offsetY: bufferedStart * this.itemHeight,
      totalHeight: totalItems * this.itemHeight
    };
  }

  /**
   * Update scroll position
   * @param {number} scrollTop - New scroll position
   */
  updateScrollTop(scrollTop) {
    this.scrollTop = scrollTop;
  }
}

/**
 * Debounced resize observer for responsive components
 */
export class DebouncedResizeObserver {
  constructor(callback, delay = 100) {
    this.callback = callback;
    this.delay = delay;
    this.timeoutId = null;
    this.observer = null;
  }

  /**
   * Start observing element
   * @param {HTMLElement} element - Element to observe
   */
  observe(element) {
    if (!element) return;

    this.observer = new ResizeObserver((entries) => {
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => {
        this.callback(entries);
      }, this.delay);
    });

    this.observer.observe(element);
  }

  /**
   * Stop observing
   */
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

/**
 * Performance-optimized data structure for large datasets
 */
export class OptimizedDataStructure {
  constructor(data = []) {
    this.data = data;
    this.indices = new Map();
    this.buildIndices();
  }

  /**
   * Build indices for fast lookups
   */
  buildIndices() {
    this.indices.clear();
    this.data.forEach((item, index) => {
      if (item.id) {
        this.indices.set(item.id, index);
      }
    });
  }

  /**
   * Fast lookup by ID
   * @param {string} id - Item ID
   * @returns {Object|null} Found item or null
   */
  findById(id) {
    const index = this.indices.get(id);
    return index !== undefined ? this.data[index] : null;
  }

  /**
   * Update item by ID
   * @param {string} id - Item ID
   * @param {Object} updates - Updates to apply
   * @returns {boolean} Success status
   */
  updateById(id, updates) {
    const index = this.indices.get(id);
    if (index !== undefined) {
      this.data[index] = { ...this.data[index], ...updates };
      return true;
    }
    return false;
  }

  /**
   * Add item to structure
   * @param {Object} item - Item to add
   */
  add(item) {
    const index = this.data.length;
    this.data.push(item);
    
    if (item.id) {
      this.indices.set(item.id, index);
    }
  }

  /**
   * Remove item by ID
   * @param {string} id - Item ID
   * @returns {boolean} Success status
   */
  removeById(id) {
    const index = this.indices.get(id);
    if (index !== undefined) {
      this.data.splice(index, 1);
      this.buildIndices(); // Rebuild indices after removal
      return true;
    }
    return false;
  }

  /**
   * Get all data
   * @returns {Array} All data
   */
  getAll() {
    return this.data;
  }

  /**
   * Get data slice for virtual scrolling
   * @param {number} start - Start index
   * @param {number} end - End index
   * @returns {Array} Data slice
   */
  getSlice(start, end) {
    return this.data.slice(start, end + 1);
  }
}

/**
 * React hook for performance monitoring
 * @param {string} componentName - Name of the component
 * @returns {Object} Performance monitoring utilities
 */
export function usePerformanceMonitor(componentName) {
  const profiler = React.useMemo(() => new ComponentProfiler(componentName), [componentName]);
  const memoryMonitor = React.useMemo(() => new MemoryMonitor(), []);

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      memoryMonitor.start();
      return () => memoryMonitor.stop();
    }
  }, [memoryMonitor]);

  const startRender = React.useCallback(() => {
    return profiler.startRender();
  }, [profiler]);

  const getStats = React.useCallback(() => {
    return {
      render: profiler.getStats(),
      memory: memoryMonitor.getStats()
    };
  }, [profiler, memoryMonitor]);

  return {
    startRender,
    getStats,
    profiler,
    memoryMonitor
  };
}

/**
 * React hook for debounced resize handling
 * @param {Function} callback - Resize callback
 * @param {number} delay - Debounce delay
 * @returns {Function} Ref callback for element
 */
export function useDebouncedResize(callback, delay = 100) {
  const observerRef = React.useRef(null);

  const refCallback = React.useCallback((element) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (element) {
      observerRef.current = new DebouncedResizeObserver(callback, delay);
      observerRef.current.observe(element);
    }
  }, [callback, delay]);

  React.useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return refCallback;
}

/**
 * React hook for virtual scrolling
 * @param {Array} items - Items to virtualize
 * @param {number} itemHeight - Height of each item
 * @param {number} containerHeight - Height of container
 * @returns {Object} Virtual scrolling utilities
 */
export function useVirtualScroll(items, itemHeight, containerHeight) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const manager = React.useMemo(
    () => new VirtualScrollManager(containerHeight, itemHeight),
    [containerHeight, itemHeight]
  );

  const visibleRange = React.useMemo(() => {
    manager.updateScrollTop(scrollTop);
    return manager.getVisibleRange(items.length);
  }, [manager, scrollTop, items.length]);

  const visibleItems = React.useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const handleScroll = React.useCallback((event) => {
    setScrollTop(event.target.scrollTop);
  }, []);

  return {
    visibleItems,
    visibleRange,
    handleScroll,
    totalHeight: visibleRange.totalHeight,
    offsetY: visibleRange.offsetY
  };
}

// Global performance monitor instance
export const globalPerformanceMonitor = {
  profilers: new Map(),
  memoryMonitor: new MemoryMonitor(),

  getProfiler(componentName) {
    if (!this.profilers.has(componentName)) {
      this.profilers.set(componentName, new ComponentProfiler(componentName));
    }
    return this.profilers.get(componentName);
  },

  getAllStats() {
    const stats = {};
    for (const [name, profiler] of this.profilers) {
      stats[name] = profiler.getStats();
    }
    return {
      components: stats,
      memory: this.memoryMonitor.getStats()
    };
  },

  startMonitoring() {
    this.memoryMonitor.start();
  },

  stopMonitoring() {
    this.memoryMonitor.stop();
  }
};

export default {
  ComponentProfiler,
  MemoryMonitor,
  VirtualScrollManager,
  DebouncedResizeObserver,
  OptimizedDataStructure,
  usePerformanceMonitor,
  useDebouncedResize,
  useVirtualScroll,
  globalPerformanceMonitor
};