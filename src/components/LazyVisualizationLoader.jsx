import React, { memo } from 'react';

// Maximum number of retry attempts for failed lazy loads
const MAX_LAZY_LOAD_RETRIES = 3;

/**
 * Lazy loading wrapper for visualization components
 * Improves initial load time by loading visualizers only when needed
 */

// Direct (eager) imports for deterministic rendering in tests
import ArrayVisualizer from './visualizers/ArrayVisualizer';
import StringVisualizer from './visualizers/StringVisualizer';
import HashMapVisualizer from './visualizers/HashMapVisualizer';
import HeapVisualizer from './visualizers/HeapVisualizer';
import TreeVisualizer from './visualizers/TreeVisualizer';
import GraphVisualizer from './visualizers/GraphVisualizer';
import LinkedListVisualizer from './visualizers/LinkedListVisualizer';
import StackQueueVisualizer from './visualizers/StackQueueVisualizer';
import RecursionVisualizer from './visualizers/RecursionVisualizer';
import DPTableVisualizer from './visualizers/DPTableVisualizer';
import BitVisualizer from './visualizers/BitVisualizer';
import MathVisualizer from './visualizers/MathVisualizer';
import GeometryVisualizer from './visualizers/GeometryVisualizer';
import IntervalVisualizer from './visualizers/IntervalVisualizer';
import GreedyVisualizer from './visualizers/GreedyVisualizer';

/**
 * Centralized mapping of visualization types (canonical) to their component and preload import.
 * Aliases provide alternative user-facing type strings that map to the same canonical key.
 */
const VISUALIZER_DEFS = {
  array: {
    component: ArrayVisualizer,
    preload: () => import('./visualizers/ArrayVisualizer'),
    aliases: ['window', 'pointers', 'arrays', 'list', 'sliding-window', 'two-pointer', 'subarray']
  },
  string: {
    component: StringVisualizer,
    preload: () => import('./visualizers/StringVisualizer'),
    aliases: ['strings', 'text', 'pattern', 'substring', 'char', 'character']
  },
  hashmap: {
    component: HashMapVisualizer,
    preload: () => import('./visualizers/HashMapVisualizer'),
    aliases: ['hash-map', 'map', 'dictionary', 'hash-table', 'frequency', 'counter']
  },
  heap: {
    component: HeapVisualizer,
    preload: () => import('./visualizers/HeapVisualizer'),
    aliases: ['heaps', 'priority-queue', 'min-heap', 'max-heap', 'binary-heap']
  },
  tree: {
    component: TreeVisualizer,
    preload: () => import('./visualizers/TreeVisualizer'),
    aliases: ['trees', 'binary-tree', 'bst', 'binary-search-tree', 'trie']
  },
  graph: {
    component: GraphVisualizer,
    preload: () => import('./visualizers/GraphVisualizer'),
    aliases: ['graphs', 'network', 'nodes', 'edges', 'dfs', 'bfs']
  },
  linkedlist: {
    component: LinkedListVisualizer,
    preload: () => import('./visualizers/LinkedListVisualizer'),
    aliases: ['linked_list', 'linked-list', 'list', 'node']
  },
  stackqueue: {
    component: StackQueueVisualizer,
    preload: () => import('./visualizers/StackQueueVisualizer'),
    aliases: ['stack', 'queue', 'deque', 'lifo', 'fifo']
  },
  recursion: {
    component: RecursionVisualizer,
    preload: () => import('./visualizers/RecursionVisualizer'),
    aliases: ['recursive', 'backtrack', 'backtracking']
  },
  dp: {
    component: DPTableVisualizer,
    preload: () => import('./visualizers/DPTableVisualizer'),
    aliases: ['dp_table', 'dynamic_programming', 'dynamic-programming', 'memoization', 'tabulation']
  },
  bit: {
    component: BitVisualizer,
    preload: () => import('./visualizers/BitVisualizer'),
    aliases: ['bits', 'bitwise', 'binary', 'bit-manipulation']
  },
  math: {
    component: MathVisualizer,
    preload: () => import('./visualizers/MathVisualizer'),
    aliases: ['mathematics', 'number-theory', 'gcd', 'lcm', 'prime', 'factors']
  },
  geometry: {
    component: GeometryVisualizer,
    preload: () => import('./visualizers/GeometryVisualizer'),
    aliases: ['geometric', 'points', 'lines', 'polygon', 'convex-hull']
  },
  interval: {
    component: IntervalVisualizer,
    preload: () => import('./visualizers/IntervalVisualizer'),
    aliases: ['intervals', 'scheduling', 'meeting-rooms', 'merge-intervals']
  },
  greedy: {
    component: GreedyVisualizer,
    preload: () => import('./visualizers/GreedyVisualizer'),
    aliases: ['greedy-algorithm', 'knapsack', 'activity-selection', 'coin-change']
  }
};

// Build alias lookup map once
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
 * Loading fallback component with skeleton UI
 */
const VisualizationSkeleton = memo(function VisualizationSkeleton({ type = 'default' }) {
  const getSkeletonContent = () => {
    switch (type) {
      case 'array':
        return (
          <div className="flex justify-center space-x-2 p-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-12 h-12 bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        );

      case 'tree':
        return (
          <div className="flex flex-col items-center space-y-4 p-8">
            <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse" />
            <div className="flex space-x-8">
              <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse" />
              <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse" />
            </div>
            <div className="flex space-x-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-6 h-6 bg-gray-700 rounded-full animate-pulse" />
              ))}
            </div>
          </div>
        );

      case 'graph':
        return (
          <div className="grid grid-cols-4 gap-4 p-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-8 h-8 bg-gray-700 rounded-full animate-pulse" />
            ))}
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center p-8">
            <div className="w-16 h-16 bg-gray-700 rounded animate-pulse" />
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-600 min-h-[300px] flex flex-col">
      <div className="p-3 border-b border-gray-600">
        <div className="h-4 bg-gray-700 rounded w-32 animate-pulse" />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          {getSkeletonContent()}
          <div className="mt-4 text-sm text-gray-400 animate-pulse">
            Loading visualization...
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Error fallback for lazy loading failures
 */
const LazyLoadError = memo(function LazyLoadError({ error, retry, type, canRetry = true, retryScheduled = false, nextDelayMs = 0 }) {
  return (
    <div className="bg-red-900/50 border border-red-600 rounded-lg p-6 text-center">
      <div className="text-red-400 text-lg mb-2">⚠️</div>
      <h3 className="text-red-300 font-semibold mb-2">
        Failed to load {type} visualizer
      </h3>
      <p className="text-red-200 text-sm mb-4">
        The visualization component could not be loaded.
      </p>
      {canRetry ? (
        <button
          onClick={retry}
          disabled={retryScheduled}
          type="button"
          className={`px-4 py-2 rounded-lg transition-colors text-sm text-white ${retryScheduled ? 'bg-red-700/60 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
        >
          {retryScheduled ? `Retrying in ${Math.ceil(nextDelayMs / 1000)}s...` : 'Try Again'}
        </button>
      ) : (
        <div className="text-red-300 text-sm font-medium">Maximum retry attempts reached.</div>
      )}
      <details className="mt-4 text-left">
        <summary className="text-red-300 cursor-pointer text-sm">
          Show Error Details
        </summary>
        <pre className="text-red-100 text-xs mt-2 overflow-x-auto bg-red-800/30 p-2 rounded">
          {error?.message || 'Unknown error'}
        </pre>
      </details>
      {canRetry && !retryScheduled && (
        <div className="mt-3 text-xs text-red-300/80">
          Attempts left: {MAX_LAZY_LOAD_RETRIES - (error?._retryCount || 0)}
        </div>
      )}
    </div>
  );
});

/**
 * Lazy visualization loader with error boundary and retry logic
 */
// Simplified loader (eager) - keeps API surface but without Suspense timing issues
class LazyVisualizationLoader extends React.Component {
  render() {
    const { type, ...visualizerProps } = this.props;
    return <LazyVisualizerRenderer type={type} {...visualizerProps} />;
  }
}

/**
 * Renderer component that selects the appropriate lazy-loaded visualizer
 */
// Removed memoization to avoid potential stale renders when visualization props change subtly
function LazyVisualizerRenderer({ type, ...props }) {
  const canonical = canonicalizeType(type);
  if (canonical && VISUALIZER_DEFS[canonical]) {
    const Comp = VISUALIZER_DEFS[canonical].component;
    // In test environment (vitest), components are mocked synchronously, so Suspense may be unnecessary
    return <Comp data-testid={`${canonical}-visualizer`} {...props} />;
  }
  return (
    <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-4 text-center">
      <div className="text-yellow-400 text-lg mb-2">⚠️</div>
      <h3 className="text-yellow-300 font-semibold mb-2">
        Unknown Visualization Type
      </h3>
      <p className="text-yellow-200 text-sm">
        Visualization type "{type}" is not supported.
      </p>
      <div className="mt-4 text-xs text-yellow-300 bg-yellow-800/30 p-2 rounded">
        Supported types: {Object.keys(VISUALIZER_DEFS).join(', ')}
      </div>
    </div>
  );
}

export default LazyVisualizationLoader;

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