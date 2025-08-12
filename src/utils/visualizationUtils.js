import React from 'react';

// Import the VISUALIZER_DEFS and canonicalizeType function from LazyVisualizationLoader
// Note: These would need to be moved to a shared constants file for optimal organization
const VISUALIZER_DEFS = {
  array: {
    preload: () => import('../components/visualizers/ArrayVisualizer'),
    aliases: ['window', 'pointers', 'arrays', 'list', 'sliding-window', 'two-pointer', 'subarray']
  },
  string: {
    preload: () => import('../components/visualizers/StringVisualizer'),
    aliases: ['strings', 'text', 'pattern', 'substring', 'char', 'character']
  },
  hashmap: {
    preload: () => import('../components/visualizers/HashMapVisualizer'),
    aliases: ['hash-map', 'map', 'dictionary', 'hash-table', 'frequency', 'counter']
  },
  heap: {
    preload: () => import('../components/visualizers/HeapVisualizer'),
    aliases: ['heaps', 'priority-queue', 'min-heap', 'max-heap', 'binary-heap']
  },
  tree: {
    preload: () => import('../components/visualizers/TreeVisualizer'),
    aliases: ['trees', 'binary-tree', 'bst', 'binary-search-tree', 'trie']
  },
  graph: {
    preload: () => import('../components/visualizers/GraphVisualizer'),
    aliases: ['graphs', 'network', 'nodes', 'edges', 'dfs', 'bfs']
  },
  linkedlist: {
    preload: () => import('../components/visualizers/LinkedListVisualizer'),
    aliases: ['linked_list', 'linked-list', 'list', 'node']
  },
  stackqueue: {
    preload: () => import('../components/visualizers/StackQueueVisualizer'),
    aliases: ['stack', 'queue', 'deque', 'lifo', 'fifo']
  },
  recursion: {
    preload: () => import('../components/visualizers/RecursionVisualizer'),
    aliases: ['recursive', 'backtrack', 'backtracking']
  },
  dp: {
    preload: () => import('../components/visualizers/DPTableVisualizer'),
    aliases: ['dp_table', 'dynamic_programming', 'dynamic-programming', 'memoization', 'tabulation']
  },
  bit: {
    preload: () => import('../components/visualizers/BitVisualizer'),
    aliases: ['bits', 'bitwise', 'binary', 'bit-manipulation']
  },
  math: {
    preload: () => import('../components/visualizers/MathVisualizer'),
    aliases: ['mathematics', 'number-theory', 'gcd', 'lcm', 'prime', 'factors']
  },
  geometry: {
    preload: () => import('../components/visualizers/GeometryVisualizer'),
    aliases: ['geometric', 'points', 'lines', 'polygon', 'convex-hull']
  },
  interval: {
    preload: () => import('../components/visualizers/IntervalVisualizer'),
    aliases: ['intervals', 'scheduling', 'meeting-rooms', 'merge-intervals']
  },
  greedy: {
    preload: () => import('../components/visualizers/GreedyVisualizer'),
    aliases: ['greedy-algorithm', 'knapsack', 'activity-selection', 'coin-change']
  }
};

// Build alias lookup map
const VISUALIZER_ALIAS_MAP = (() => {
  const map = new Map();
  for (const [canonical, def] of Object.entries(VISUALIZER_DEFS)) {
    map.set(canonical, canonical);
    if (def.aliases) {
      def.aliases.forEach(a => map.set(a, canonical));
    }
  }
  return map;
})();

function canonicalizeType(type) {
  if (!type || typeof type !== 'string') return null;
  return VISUALIZER_ALIAS_MAP.get(type.toLowerCase()) || null;
}

/**
 * Hook for preloading visualization components
 * Can be used to preload likely-to-be-used visualizers
 */
export function usePreloadVisualizers(types = []) {
  // Ref holds the canonical types that have already been preloaded to avoid duplicate work
  const preloadedRef = React.useRef(new Set());

  // Normalize, deduplicate, and sort incoming types so dependency is stable regardless of order
  const normalizedTypes = React.useMemo(() => {
    const set = new Set();
    types.forEach(t => {
      const c = canonicalizeType(t);
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [types]);

  // Stable string key so effect only runs when the actual canonical membership changes
  const normalizedKey = React.useMemo(() => normalizedTypes.join(','), [normalizedTypes]);

  React.useEffect(() => {
    if (!normalizedTypes.length) return;

    // Determine which types still need preloading
    const toPreload = normalizedTypes.filter(t => !preloadedRef.current.has(t));
    if (!toPreload.length) return; // All already preloaded

    const preloadPromises = toPreload.map(t => VISUALIZER_DEFS[t]?.preload?.() || Promise.resolve());

    Promise.allSettled(preloadPromises).then(results => {
      // Mark all attempted types as preloaded (even failures to avoid tight retry loops); could refine per status
      toPreload.forEach(t => preloadedRef.current.add(t));
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      if (successful > 0) {
        console.log(`Preloaded ${successful} visualization component${successful > 1 ? 's' : ''}`);
      }
      if (failed > 0) {
        console.warn(`Failed to preload ${failed} visualization component${failed > 1 ? 's' : ''}`);
      }
    });
  }, [normalizedKey, normalizedTypes]);
}

/**
 * Utility to get visualization type from analysis data
 */
export function getVisualizationTypes(analysis) {
  if (!analysis) return [];

  const types = new Set();

  // Add types from data structures
  if (analysis.dataStructures) {
    analysis.dataStructures.forEach(ds => types.add(ds.toLowerCase()));
  }

  // Add types from steps
  if (analysis.steps) {
    analysis.steps.forEach(step => {
      if (step.visualization?.type) {
        types.add(step.visualization.type.toLowerCase());
      }
    });
  }

  return Array.from(types);
}
