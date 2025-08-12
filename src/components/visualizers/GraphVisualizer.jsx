import React, { useState, useEffect, useRef } from 'react';
import BaseVisualizer, { withErrorBoundary, VisualizerUtils } from './BaseVisualizer';
import './GraphVisualizer.css';

/**
 * Enhanced Graph Visualizer for directed and undirected graphs
 * Features:
 * - Force-directed layout algorithm for automatic node positioning
 * - DFS/BFS traversal animations with visited state tracking
 * - Shortest path highlighting and edge weight display
 * - Support for various graph algorithms (DFS, BFS, Dijkstra)
 */
function GraphVisualizer({ data, stepData, title = "Graph Visualization" }) {
  // Validate required data
  try {
    VisualizerUtils.validateData(data, ['vertices', 'edges']);
  } catch (error) {
    return (
      <BaseVisualizer data={data} stepData={stepData} title={title}>
        <div className="text-red-300">
          Invalid graph data: {error.message}
        </div>
      </BaseVisualizer>
    );
  }

  const {
    vertices = [],
    edges = [],
    algorithm = 'dfs',
    currentVertex,
    visitedOrder = [],
    shortestPath = [],
    distances = {}
  } = data;

  // State for force-directed layout
  const [layoutVertices, setLayoutVertices] = useState([]);
  const [isLayoutStable, setIsLayoutStable] = useState(false);
  const animationRef = useRef();
  const layoutConfigRef = useRef({
    width: 800,
    height: 400,
    centerX: 400,
    centerY: 200,
    repulsionForce: 1000,
    attractionForce: 0.01,
    damping: 0.9,
    minDistance: 50,
    maxIterations: 1000,
    stabilityThreshold: 0.1
  });

  // Initialize layout when vertices change
  useEffect(() => {
    if (vertices.length > 0) {
      initializeForceDirectedLayout();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [vertices, edges]);

  /**
   * Initialize force-directed layout algorithm
   */
  const initializeForceDirectedLayout = () => {
    const config = layoutConfigRef.current;

    // Initialize vertices with random positions if not provided
    const initialVertices = vertices.map((vertex, index) => ({
      ...vertex,
      x: vertex.x !== undefined ? vertex.x : config.centerX + (Math.random() - 0.5) * 200,
      y: vertex.y !== undefined ? vertex.y : config.centerY + (Math.random() - 0.5) * 200,
      vx: 0, // velocity x
      vy: 0, // velocity y
      fx: 0, // force x
      fy: 0  // force y
    }));

    setLayoutVertices(initialVertices);
    setIsLayoutStable(false);

    // Start force simulation
    runForceSimulation(initialVertices);
  };

  /**
   * Run force-directed layout simulation
   */
  const runForceSimulation = (currentVertices) => {
    const config = layoutConfigRef.current;
    let iteration = 0;
    let maxVelocity = Infinity;

    const simulate = () => {
      if (iteration >= config.maxIterations || maxVelocity < config.stabilityThreshold) {
        setIsLayoutStable(true);
        return;
      }

      const newVertices = [...currentVertices];

      // Reset forces
      newVertices.forEach(vertex => {
        vertex.fx = 0;
        vertex.fy = 0;
      });

      // Apply repulsion forces between all vertices
      for (let i = 0; i < newVertices.length; i++) {
        for (let j = i + 1; j < newVertices.length; j++) {
          const v1 = newVertices[i];
          const v2 = newVertices[j];

          const dx = v1.x - v2.x;
          const dy = v1.y - v2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 0) {
            const force = config.repulsionForce / (distance * distance);
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;

            v1.fx += fx;
            v1.fy += fy;
            v2.fx -= fx;
            v2.fy -= fy;
          }
        }
      }

      // Apply attraction forces for connected vertices
      edges.forEach(edge => {
        const v1 = newVertices.find(v => v.id === edge.from);
        const v2 = newVertices.find(v => v.id === edge.to);

        if (v1 && v2) {
          const dx = v2.x - v1.x;
          const dy = v2.y - v1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > config.minDistance) {
            const force = config.attractionForce * distance;
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;

            v1.fx += fx;
            v1.fy += fy;
            v2.fx -= fx;
            v2.fy -= fy;
          }
        }
      });

      // Update velocities and positions
      maxVelocity = 0;
      newVertices.forEach(vertex => {
        vertex.vx = (vertex.vx + vertex.fx) * config.damping;
        vertex.vy = (vertex.vy + vertex.fy) * config.damping;

        vertex.x += vertex.vx;
        vertex.y += vertex.vy;

        // Keep vertices within bounds
        vertex.x = Math.max(50, Math.min(config.width - 50, vertex.x));
        vertex.y = Math.max(50, Math.min(config.height - 50, vertex.y));

        const velocity = Math.sqrt(vertex.vx * vertex.vx + vertex.vy * vertex.vy);
        maxVelocity = Math.max(maxVelocity, velocity);
      });

      setLayoutVertices(newVertices);
      iteration++;

      animationRef.current = requestAnimationFrame(simulate);
    };

    simulate();
  };

  // Use layout vertices if available, otherwise fall back to original vertices
  const displayVertices = layoutVertices.length > 0 ? layoutVertices : vertices;

  // Compute dynamic width based on vertex dispersion so we can expand/use full available width
  const contentWidth = React.useMemo(() => {
    if (!displayVertices.length) return 800;
    const xs = displayVertices.map(v => v.x || 0);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    // Add padding and ensure a sensible minimum
    return Math.max(maxX - minX + 200, 800);
  }, [displayVertices]);

  return (
    <BaseVisualizer data={data} stepData={stepData} title={title}>
      <div className="space-y-6">
        {/* Layout Status */}
        {!isLayoutStable && layoutVertices.length > 0 && (
          <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              <span className="text-blue-300 text-sm">Computing optimal layout...</span>
            </div>
          </div>
        )}

        {/* Graph Structure */}
        <div className="relative bg-gray-800 rounded-lg p-6 min-h-96">
          <svg
            width="100%"
            height="400"
            className="overflow-visible"
            viewBox={`0 0 ${contentWidth} 400`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Render edges first (behind vertices) */}
            {edges.map((edge, index) => (
              <EnhancedGraphEdge
                key={`${edge.from}-${edge.to}-${index}`}
                edge={edge}
                vertices={displayVertices}
                visitedOrder={visitedOrder}
                shortestPath={shortestPath}
                algorithm={algorithm}
              />
            ))}

            {/* Render vertices */}
            {displayVertices.map((vertex) => (
              <EnhancedGraphVertex
                key={vertex.id}
                vertex={vertex}
                isCurrent={currentVertex === vertex.id}
                visitIndex={visitedOrder.indexOf(vertex.id)}
                distance={distances[vertex.id]}
                isInShortestPath={shortestPath.includes(vertex.id)}
                algorithm={algorithm}
              />
            ))}

            {/* Render traversal animation */}
            {algorithm && (visitedOrder.length > 0 || currentVertex) && (
              <TraversalAnimation
                vertices={displayVertices}
                visitedOrder={visitedOrder}
                currentVertex={currentVertex}
                algorithm={algorithm}
              />
            )}
          </svg>
        </div>

        {/* Algorithm Information */}
        <EnhancedAlgorithmDisplay
          algorithm={algorithm}
          currentVertex={currentVertex}
          visitedOrder={visitedOrder}
          vertices={displayVertices}
          shortestPath={shortestPath}
          distances={distances}
        />

        {/* Graph Statistics */}
        <EnhancedGraphStatistics
          vertices={displayVertices}
          edges={edges}
          algorithm={algorithm}
          visitedOrder={visitedOrder}
          shortestPath={shortestPath}
        />
      </div>
    </BaseVisualizer>
  );
}

/**
 * Enhanced graph vertex component with improved animations and state handling
 */
function EnhancedGraphVertex({ vertex, isCurrent, visitIndex, distance, isInShortestPath, algorithm }) {
  const {
    id,
    label,
    x = 0,
    y = 0,
    state = 'unvisited',
    parent
  } = vertex;

  // Determine vertex styling based on state and algorithm
  let vertexClass = 'fill-gray-600 stroke-gray-500';
  let textClass = 'fill-gray-300';
  let pulseClass = '';

  if (isCurrent) {
    vertexClass = 'fill-yellow-500 stroke-yellow-300';
    textClass = 'fill-black';
    pulseClass = 'animate-pulse';
  } else if (isInShortestPath) {
    vertexClass = 'fill-red-500 stroke-red-300';
    textClass = 'fill-white';
  } else if (state === 'visited' || visitIndex >= 0) {
    vertexClass = 'fill-green-600 stroke-green-400';
    textClass = 'fill-white';
  } else if (state === 'target') {
    vertexClass = 'fill-red-600 stroke-red-400';
    textClass = 'fill-white';
  } else if (state === 'processing') {
    vertexClass = 'fill-orange-500 stroke-orange-300';
    textClass = 'fill-black';
    pulseClass = 'animate-pulse';
  }

  // Calculate radius based on importance
  const radius = isCurrent ? 30 : (isInShortestPath ? 28 : 25);

  return (
    <g transform={`translate(${x}, ${y})`} className={pulseClass}>
      {/* Outer glow for current vertex */}
      {isCurrent && (
        <circle
          cx="0"
          cy="0"
          r="35"
          className="fill-yellow-400 opacity-20 animate-ping"
        />
      )}

      {/* Vertex circle */}
      <circle
        cx="0"
        cy="0"
        r={radius}
        className={`${vertexClass} stroke-2 transition-all duration-500`}
      />

      {/* Inner highlight for shortest path */}
      {isInShortestPath && !isCurrent && (
        <circle
          cx="0"
          cy="0"
          r="20"
          className="fill-red-300 opacity-30"
        />
      )}

      {/* Vertex label */}
      <text
        x="0"
        y="5"
        textAnchor="middle"
        className={`${textClass} text-sm font-bold transition-all duration-300`}
      >
        {label || id}
      </text>

      {/* Visit order with enhanced styling */}
      {visitIndex >= 0 && (
        <g>
          <circle
            cx="0"
            cy="-40"
            r="12"
            className="fill-blue-600 stroke-blue-400 stroke-1"
          />
          <text
            x="0"
            y="-36"
            textAnchor="middle"
            className="fill-white text-xs font-bold"
          >
            {visitIndex + 1}
          </text>
        </g>
      )}

      {/* Distance display for shortest path algorithms */}
      {distance !== undefined && distance !== Infinity && (
        <g>
          <rect
            x="-15"
            y="30"
            width="30"
            height="16"
            rx="8"
            className="fill-purple-600 stroke-purple-400 stroke-1"
          />
          <text
            x="0"
            y="40"
            textAnchor="middle"
            className="fill-white text-xs font-bold"
          >
            {distance}
          </text>
        </g>
      )}

      {/* Parent indicator for tree-like algorithms */}
      {parent && algorithm === 'dijkstra' && (
        <text
          x="35"
          y="5"
          textAnchor="start"
          className="fill-gray-400 text-xs"
        >
          ←{parent}
        </text>
      )}
    </g>
  );
}

/**
 * Enhanced graph edge component with improved styling and animations
 */
function EnhancedGraphEdge({ edge, vertices, visitedOrder, shortestPath, algorithm }) {
  const fromVertex = vertices.find(v => v.id === edge.from);
  const toVertex = vertices.find(v => v.id === edge.to);

  if (!fromVertex || !toVertex) return null;

  const isTraversed = visitedOrder.includes(edge.from) && visitedOrder.includes(edge.to);
  const isInShortestPath = shortestPath.includes(edge.from) && shortestPath.includes(edge.to);
  const isCurrentlyBeingTraversed = edge.state === 'current';

  // Enhanced edge styling
  let edgeClass = 'stroke-gray-500 stroke-1';
  let animationClass = '';

  if (isInShortestPath) {
    edgeClass = 'stroke-red-400 stroke-3';
    animationClass = 'animate-pulse';
  } else if (isCurrentlyBeingTraversed) {
    edgeClass = 'stroke-yellow-400 stroke-2';
    animationClass = 'animate-pulse';
  } else if (isTraversed) {
    edgeClass = 'stroke-blue-400 stroke-2';
  }

  // Calculate positions with improved arrow handling
  const dx = toVertex.x - fromVertex.x;
  const dy = toVertex.y - fromVertex.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) return null; // Avoid division by zero

  const unitX = dx / length;
  const unitY = dy / length;

  // Adjust for vertex radius (dynamic based on vertex state)
  const fromRadius = fromVertex.isCurrent ? 30 : 25;
  const toRadius = toVertex.isCurrent ? 30 : 25;

  const startX = fromVertex.x + unitX * fromRadius;
  const startY = fromVertex.y + unitY * fromRadius;
  const endX = toVertex.x - unitX * toRadius;
  const endY = toVertex.y - unitY * toRadius;

  // Calculate midpoint for weight display
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  return (
    <g className={animationClass}>
      {/* Edge glow effect for shortest path */}
      {isInShortestPath && (
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          className="stroke-red-300 stroke-6 opacity-30"
        />
      )}

      {/* Main edge line */}
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        className={`${edgeClass} transition-all duration-500`}
        strokeDasharray={isCurrentlyBeingTraversed ? "5,5" : "none"}
      />

      {/* Arrow for directed edges */}
      {edge.directed && (
        <g>
          <polygon
            points={`${endX},${endY} ${endX - 12 * unitX + 6 * unitY},${endY - 12 * unitY - 6 * unitX} ${endX - 12 * unitX - 6 * unitY},${endY - 12 * unitY + 6 * unitX}`}
            className={`${edgeClass.replace('stroke-', 'fill-')} transition-all duration-500`}
          />
        </g>
      )}

      {/* Enhanced edge weight display */}
      {edge.weight !== undefined && (
        <g>
          {/* Background circle for weight */}
          <circle
            cx={midX}
            cy={midY}
            r="12"
            className="fill-gray-800 stroke-gray-600 stroke-1"
          />
          <text
            x={midX}
            y={midY + 3}
            textAnchor="middle"
            className="fill-gray-200 text-xs font-bold"
          >
            {edge.weight}
          </text>
        </g>
      )}

      {/* Edge label for algorithm-specific information */}
      {edge.label && (
        <text
          x={midX}
          y={midY - 20}
          textAnchor="middle"
          className="fill-blue-300 text-xs"
        >
          {edge.label}
        </text>
      )}
    </g>
  );
}

/**
 * Traversal animation component for showing algorithm progress
 */
function TraversalAnimation({ vertices, visitedOrder, currentVertex, algorithm }) {
  if (!currentVertex && visitedOrder.length === 0) return null;

  return (
    <g>
      {/* Animated path for traversal order */}
      {visitedOrder.length > 1 && (
        <g>
          {visitedOrder.slice(0, -1).map((vertexId, index) => {
            const fromVertex = vertices.find(v => v.id === vertexId);
            const toVertex = vertices.find(v => v.id === visitedOrder[index + 1]);

            if (!fromVertex || !toVertex) return null;

            return (
              <line
                key={`traversal-${index}`}
                x1={fromVertex.x}
                y1={fromVertex.y}
                x2={toVertex.x}
                y2={toVertex.y}
                className="stroke-green-400 stroke-2 opacity-60"
                strokeDasharray="3,3"
                style={{
                  animation: `dash 2s linear infinite`,
                  animationDelay: `${index * 0.2}s`
                }}
              />
            );
          })}
        </g>
      )}

      {/* Current vertex highlight ring */}
      {currentVertex && (
        <g>
          {(() => {
            const vertex = vertices.find(v => v.id === currentVertex);
            if (!vertex) return null;

            return (
              <circle
                cx={vertex.x}
                cy={vertex.y}
                r="40"
                className="fill-none stroke-yellow-400 stroke-2 opacity-50"
                style={{
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}
              />
            );
          })()}
        </g>
      )}
    </g>
  );
}

/**
 * Enhanced algorithm display with more detailed information
 */
function EnhancedAlgorithmDisplay({ algorithm, currentVertex, visitedOrder, vertices, shortestPath, distances }) {
  const algorithmInfo = {
    'dfs': {
      name: 'Depth-First Search',
      description: 'Explores as far as possible along each branch before backtracking',
      complexity: 'O(V + E)',
      icon: '🔍'
    },
    'bfs': {
      name: 'Breadth-First Search',
      description: 'Explores all neighbors at current depth before moving to next depth',
      complexity: 'O(V + E)',
      icon: '🌊'
    },
    'dijkstra': {
      name: "Dijkstra's Algorithm",
      description: 'Finds shortest path from source to all other vertices',
      complexity: 'O((V + E) log V)',
      icon: '🛤️'
    },
    'kruskal': {
      name: "Kruskal's Algorithm",
      description: 'Finds minimum spanning tree using union-find',
      complexity: 'O(E log E)',
      icon: '🌳'
    }
  };

  const info = algorithmInfo[algorithm] || {
    name: algorithm?.toUpperCase() || 'Graph Algorithm',
    description: 'Graph traversal or pathfinding algorithm',
    complexity: 'O(V + E)',
    icon: '📊'
  };

  return (
    <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
      <h4 className="text-purple-300 font-semibold mb-3 flex items-center">
        <span className="mr-2">{info.icon}</span>
        {info.name}
      </h4>

      <p className="text-purple-200 text-sm mb-4">{info.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Current vertex */}
        {currentVertex && (
          <div className="bg-purple-800/30 rounded p-3">
            <span className="text-purple-200 font-medium text-sm">Current:</span>
            <div className="mt-1">
              <span className="bg-yellow-500 text-black px-2 py-1 rounded font-bold">
                {currentVertex}
              </span>
            </div>
          </div>
        )}

        {/* Visit order */}
        {visitedOrder.length > 0 && (
          <div className="bg-purple-800/30 rounded p-3">
            <span className="text-purple-200 font-medium text-sm">Visited ({visitedOrder.length}):</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {visitedOrder.slice(-5).map((vertexId, index) => (
                <span
                  key={index}
                  className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                >
                  {vertexId}
                </span>
              ))}
              {visitedOrder.length > 5 && (
                <span className="text-purple-300 text-xs">+{visitedOrder.length - 5} more</span>
              )}
            </div>
          </div>
        )}

        {/* Shortest path */}
        {shortestPath.length > 0 && (
          <div className="bg-purple-800/30 rounded p-3">
            <span className="text-purple-200 font-medium text-sm">Shortest Path:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {shortestPath.map((vertexId, index) => (
                <span
                  key={index}
                  className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                >
                  {vertexId}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Algorithm complexity */}
      <div className="mt-4 pt-3 border-t border-purple-600">
        <span className="text-purple-300 text-sm font-medium">Time Complexity: </span>
        <span className="text-purple-200 text-sm">{info.complexity}</span>
      </div>
    </div>
  );
}

/**
 * Enhanced graph statistics with algorithm-specific metrics
 */
function EnhancedGraphStatistics({ vertices, edges, algorithm, visitedOrder, shortestPath }) {
  const directedEdges = edges.filter(e => e.directed).length;
  const undirectedEdges = edges.length - directedEdges;
  const totalWeight = edges.reduce((sum, edge) => sum + (edge.weight || 0), 0);

  const basicStats = [
    { label: 'Vertices', value: vertices.length, color: 'blue', icon: '⚪' },
    { label: 'Edges', value: edges.length, color: 'green', icon: '↔️' },
    { label: 'Directed', value: directedEdges, color: 'yellow', icon: '→' },
    { label: 'Undirected', value: undirectedEdges, color: 'purple', icon: '↔' }
  ];

  const algorithmStats = [];

  if (visitedOrder.length > 0) {
    algorithmStats.push({
      label: 'Visited',
      value: visitedOrder.length,
      color: 'green',
      icon: '✓'
    });
  }

  if (shortestPath.length > 0) {
    algorithmStats.push({
      label: 'Path Length',
      value: shortestPath.length,
      color: 'red',
      icon: '🛤️'
    });
  }

  if (totalWeight > 0) {
    algorithmStats.push({
      label: 'Total Weight',
      value: totalWeight,
      color: 'orange',
      icon: '⚖️'
    });
  }

  const allStats = [...basicStats, ...algorithmStats];

  return (
    <div className="space-y-4">
      <h4 className="text-gray-300 font-semibold">Graph Statistics</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {allStats.map((stat, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-lg mb-1">{stat.icon}</div>
            <div className={`text-${stat.color}-400 text-xs font-semibold`}>
              {stat.label}
            </div>
            <div className={`text-xl font-bold text-${stat.color}-300`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Graph density calculation */}
      {vertices.length > 1 && (
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-gray-300 text-sm">
            <span className="font-medium">Graph Density: </span>
            <span className="text-blue-300">
              {((edges.length / (vertices.length * (vertices.length - 1))) * 100).toFixed(1)}%
            </span>
            <span className="text-gray-400 ml-2">
              ({edges.length} / {vertices.length * (vertices.length - 1)} possible edges)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default withErrorBoundary(GraphVisualizer);