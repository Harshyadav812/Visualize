import React, { useState, useEffect } from 'react';
import BaseVisualizer, { withErrorBoundary, VisualizerUtils } from './BaseVisualizer';
import { formatValue, VISUALIZATION_SCHEMAS } from '../../utils/visualizationSchemas';

/**
 * Enhanced Linked List Visualizer for single and doubly linked lists
 * Supports pointer animations, insertions, deletions, traversals, and memory simulation
 */
function LinkedListVisualizer({ data, stepData, title = "Linked List Visualization" }) {
  const [animatingNodes, setAnimatingNodes] = useState(new Set());
  const [animatingPointers, setAnimatingPointers] = useState(new Set());

  // Extract data with graceful fallbacks
  const {
    nodes = [],
    head,
    tail,
    operations = [],
    type = 'singly', // 'singly' or 'doubly'
    traversal = null, // Current traversal state
    animations = [], // Animation instructions
    arrays = [], // Fallback for array-like data
    array = [] // Another fallback
  } = data || {};

  // Enhanced validation with helpful error messages
  const hasValidNodes = nodes && Array.isArray(nodes) && nodes.length > 0;
  const hasArrayData = (arrays && arrays.length > 0) || (array && array.length > 0);

  // Handle animations - must be called before any conditional returns
  useEffect(() => {
    if (animations && animations.length > 0) {
      animations.forEach(animation => {
        if (animation.type === 'node' && animation.nodeId) {
          setAnimatingNodes(prev => new Set([...prev, animation.nodeId]));
          setTimeout(() => {
            setAnimatingNodes(prev => {
              const newSet = new Set(prev);
              newSet.delete(animation.nodeId);
              return newSet;
            });
          }, animation.duration || 1000);
        } else if (animation.type === 'pointer' && animation.pointerId) {
          setAnimatingPointers(prev => new Set([...prev, animation.pointerId]));
          setTimeout(() => {
            setAnimatingPointers(prev => {
              const newSet = new Set(prev);
              newSet.delete(animation.pointerId);
              return newSet;
            });
          }, animation.duration || 1000);
        }
      });
    }
  }, [animations]);

  // Internal component definitions to fix Fast Refresh
  const LinkedListNode = ({ node, isHead, isTail, nodeType, isAnimating, nodeTraversal }) => {
    const { id, value, next, prev, state = 'normal', operation } = node;

    // Determine node styling based on state and traversal
    let nodeClass = 'bg-gray-700 border-gray-500 text-gray-300';
    let glowClass = '';

    if (state === 'current' || (nodeTraversal && nodeTraversal.currentNode === id)) {
      nodeClass = 'bg-yellow-500 border-yellow-300 text-black';
      glowClass = 'shadow-lg shadow-yellow-400/50';
    } else if (state === 'visited' || (nodeTraversal && nodeTraversal.visitedNodes.includes(id))) {
      nodeClass = 'bg-green-600 border-green-400 text-white';
      glowClass = 'shadow-lg shadow-green-400/30';
    } else if (state === 'target') {
      nodeClass = 'bg-red-600 border-red-400 text-white';
      glowClass = 'shadow-lg shadow-red-400/50';
    } else if (state === 'inserting') {
      nodeClass = 'bg-blue-600 border-blue-400 text-white';
      glowClass = 'shadow-lg shadow-blue-400/50';
    } else if (state === 'deleting') {
      nodeClass = 'bg-red-800 border-red-600 text-red-200';
      glowClass = 'shadow-lg shadow-red-600/50';
    } else if (isHead && !state) {
      nodeClass = 'bg-green-700 border-green-500 text-white';
    } else if (isTail && !state) {
      nodeClass = 'bg-red-700 border-red-500 text-white';
    }

    // Animation classes
    const animationClass = isAnimating ? 'animate-bounce' : '';
    const operationClass = operation ? 'ring-2 ring-yellow-400 ring-opacity-75' : '';

    return (
      <div className="relative">
        {/* Node container */}
        <div className={`border-2 rounded-lg p-4 transition-all duration-500 ${nodeClass} ${glowClass} ${animationClass} ${operationClass}`}>
          <div className="text-center">
            {/* Node value */}
            <div className="font-bold text-lg mb-2">
              {formatValue(value, 'linked_list')}
            </div>

            {/* Node ID */}
            <div className="text-xs opacity-75">
              ID: {id}
            </div>

            {/* Memory address simulation */}
            <div className="text-xs opacity-50 mt-1">
              @0x{generateMemoryAddress(id)}
            </div>

            {/* Operation indicator */}
            {operation && (
              <div className="text-xs mt-1 px-2 py-1 bg-yellow-600 rounded text-yellow-100">
                {operation.toUpperCase()}
              </div>
            )}
          </div>

          {/* Pointer information */}
          <div className="mt-3 text-xs space-y-1">
            {next && (
              <div className="flex justify-between">
                <span>next:</span>
                <span className="font-mono">@0x{generateMemoryAddress(next)}</span>
              </div>
            )}
            {nodeType === 'doubly' && prev && (
              <div className="flex justify-between">
                <span>prev:</span>
                <span className="font-mono">@0x{generateMemoryAddress(prev)}</span>
              </div>
            )}
            {!next && (
              <div className="flex justify-between">
                <span>next:</span>
                <span className="font-mono text-gray-500">NULL</span>
              </div>
            )}
          </div>
        </div>

        {/* Previous pointer for doubly linked list */}
        {nodeType === 'doubly' && (
          <div className="absolute -left-8 top-1/2 transform -translate-y-1/2">
            <PointerArrow direction="prev" isAnimating={false} />
          </div>
        )}
      </div>
    );
  };

  const PointerArrow = ({ direction, isAnimating }) => {
    const isNext = direction === 'next';
    const arrowClass = isAnimating ? 'animate-pulse scale-125' : '';
    const colorClass = isNext ? 'text-blue-400' : 'text-purple-400';

    return (
      <div className="flex flex-col items-center">
        <div className={`${colorClass} text-sm font-bold`}>
          {direction}
        </div>
        <div className={`${colorClass} text-2xl transition-all duration-300 ${arrowClass}`}>
          {isNext ? '→' : '←'}
        </div>
      </div>
    );
  };

  const TraversalStatus = ({ nodeTraversal }) => {
    const { type: traversalType, currentNode, visitedNodes = [], totalNodes, step } = nodeTraversal;

    return (
      <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
        <h4 className="text-blue-300 font-semibold mb-3 flex items-center">
          <span className="mr-2">🔍</span>
          Traversal Status: {traversalType?.toUpperCase() || 'FORWARD'}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-200">Current Node:</span>
            <div className="font-mono text-blue-100">{currentNode || 'None'}</div>
          </div>
          <div>
            <span className="text-blue-200">Visited:</span>
            <div className="font-mono text-blue-100">{visitedNodes.length}</div>
          </div>
          <div>
            <span className="text-blue-200">Remaining:</span>
            <div className="font-mono text-blue-100">{totalNodes - visitedNodes.length}</div>
          </div>
          <div>
            <span className="text-blue-200">Step:</span>
            <div className="font-mono text-blue-100">{step || 1}</div>
          </div>
        </div>

        {/* Visited nodes path */}
        {visitedNodes.length > 0 && (
          <div className="mt-3">
            <span className="text-blue-200 text-sm">Path: </span>
            <span className="font-mono text-blue-100">
              {visitedNodes.join(' → ')}
              {currentNode && currentNode !== visitedNodes[visitedNodes.length - 1] && ` → [${currentNode}]`}
            </span>
          </div>
        )}
      </div>
    );
  };

  const MemoryLayout = ({ nodeList, listType }) => {
    if (nodeList.length === 0) return null;

    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-gray-300 font-semibold mb-3 flex items-center">
          <span className="mr-2">💾</span>
          Memory Layout
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {nodeList.map(node => (
            <div key={node.id} className="bg-gray-700 rounded p-3 text-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 font-mono">@0x{generateMemoryAddress(node.id)}</span>
                <span className="text-gray-400">Node {node.id}</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">value:</span>
                  <span className="text-gray-200">{formatValue(node.value, 'linked_list')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">next:</span>
                  <span className="text-gray-200 font-mono">
                    {node.next ? `@0x${generateMemoryAddress(node.next)}` : 'NULL'}
                  </span>
                </div>
                {listType === 'doubly' && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">prev:</span>
                    <span className="text-gray-200 font-mono">
                      {node.prev ? `@0x${generateMemoryAddress(node.prev)}` : 'NULL'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const OperationsDisplay = ({ operationList }) => {
    return (
      <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
        <h4 className="text-blue-300 font-semibold mb-3 flex items-center">
          <span className="mr-2">⚡</span>
          Current Operations
        </h4>
        <div className="space-y-3">
          {operationList.map((operation, index) => (
            <div key={index} className="bg-blue-800/50 rounded-lg p-3">
              <div className="flex items-center space-x-3 mb-2">
                <span className={`px-2 py-1 rounded text-sm font-medium ${getOperationColor(operation.type)}`}>
                  {operation.type.toUpperCase()}
                </span>
                <span className="text-blue-200 font-medium">
                  {operation.description}
                </span>
                {operation.isAnimating && (
                  <span className="text-yellow-400 animate-pulse">●</span>
                )}
              </div>

              {/* Operation details */}
              <div className="text-sm text-blue-300 space-y-1">
                {operation.position !== undefined && (
                  <div>Position: {operation.position}</div>
                )}
                {operation.nodeId && (
                  <div>Node ID: {operation.nodeId}</div>
                )}
                {operation.newValue !== undefined && (
                  <div>New Value: {formatValue(operation.newValue, 'linked_list')}</div>
                )}
                {operation.fromNode && operation.toNode && (
                  <div>Connection: {operation.fromNode} → {operation.toNode}</div>
                )}
                {operation.duration && (
                  <div>Duration: {operation.duration}ms</div>
                )}
              </div>

              {/* Operation progress */}
              {operation.progress !== undefined && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-blue-300 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(operation.progress * 100)}%</span>
                  </div>
                  <div className="w-full bg-blue-800 rounded-full h-2">
                    <div
                      className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${operation.progress * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ListStatistics = ({ nodeList, listType, statsTraversal }) => {
    const memoryPerNode = listType === 'doubly' ? 3 : 2; // value + next + prev (if doubly)
    const totalMemory = nodeList.length * memoryPerNode;

    const stats = [
      { label: 'Total Nodes', value: nodeList.length, color: 'blue' },
      { label: 'List Type', value: listType === 'doubly' ? 'Doubly' : 'Singly', color: 'green' },
      { label: 'Memory Usage', value: `${totalMemory} ptrs`, color: 'yellow' },
      { label: 'Avg Access Time', value: 'O(n)', color: 'purple' }
    ];

    // Add traversal statistics if available
    if (statsTraversal) {
      stats.push(
        { label: 'Visited Nodes', value: statsTraversal.visitedNodes?.length || 0, color: 'cyan' },
        { label: 'Traversal Progress', value: `${Math.round(((statsTraversal.visitedNodes?.length || 0) / nodeList.length) * 100)}%`, color: 'orange' }
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-3">
              <div className={`text-${stat.color}-400 text-sm font-semibold`}>
                {stat.label}
              </div>
              <div className={`text-xl font-bold text-${stat.color}-300`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Memory efficiency info */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h5 className="text-gray-300 font-semibold mb-2 flex items-center">
            <span className="mr-2">📊</span>
            Memory Analysis
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Memory per node:</span>
              <div className="text-gray-200">
                {listType === 'doubly' ? '3 pointers (value, next, prev)' : '2 pointers (value, next)'}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Space complexity:</span>
              <div className="text-gray-200">O(n) where n = {nodeList.length}</div>
            </div>
            <div>
              <span className="text-gray-400">Access pattern:</span>
              <div className="text-gray-200">Sequential access only</div>
            </div>
            <div>
              <span className="text-gray-400">Cache efficiency:</span>
              <div className="text-gray-200">
                {nodeList.length > 10 ? 'Poor (scattered memory)' : 'Moderate'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!hasValidNodes && !hasArrayData) {
    return (
      <BaseVisualizer data={data} stepData={stepData} title={title}>
        <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
          <div className="text-yellow-300 font-medium mb-2">
            ⚠️ Linked List Data Issue
          </div>
          <div className="text-yellow-200 text-sm space-y-1">
            <p>Expected: nodes array with linked list structure</p>
            <p>Received: {data ? JSON.stringify(Object.keys(data)) : 'null'}</p>
            {hasArrayData && (
              <p className="text-blue-300">
                💡 This step appears to have array data - consider using "array" visualization type
              </p>
            )}
          </div>
        </div>
      </BaseVisualizer>
    );
  }

  return (
    <BaseVisualizer data={data} stepData={stepData} title={title}>
      <div className="space-y-6">
        {/* Traversal Status */}
        {traversal && (
          <TraversalStatus traversal={traversal} />
        )}

        {/* Linked List Structure */}
        <div className="bg-gray-800 rounded-lg p-6 overflow-x-auto">
          <div className="flex items-center space-x-4 min-w-max">
            {/* Head pointer */}
            {head && (
              <div className="text-center">
                <div className="text-green-400 font-bold text-sm mb-2">HEAD</div>
                <div className={`text-green-400 text-2xl transition-all duration-300 ${animatingPointers.has('head') ? 'animate-pulse scale-125' : ''
                  }`}>↓</div>
              </div>
            )}

            {/* Render nodes */}
            {nodes.map((node, index) => (
              <React.Fragment key={node.id}>
                <LinkedListNode
                  node={node}
                  isHead={head === node.id}
                  isTail={tail === node.id}
                  type={type}
                  isAnimating={animatingNodes.has(node.id)}
                  traversal={traversal}
                />

                {/* Next pointer arrow */}
                {node.next && index < nodes.length - 1 && (
                  <PointerArrow
                    direction="next"
                    isAnimating={animatingPointers.has(`${node.id}-next`)}
                    type={type}
                  />
                )}
              </React.Fragment>
            ))}

            {/* Null terminator */}
            <div className="text-center">
              <div className="bg-gray-600 border-2 border-gray-500 rounded-lg px-3 py-2">
                <span className="text-gray-300 font-bold">NULL</span>
              </div>
            </div>

            {/* Tail pointer */}
            {tail && (
              <div className="text-center">
                <div className={`text-red-400 text-2xl transition-all duration-300 ${animatingPointers.has('tail') ? 'animate-pulse scale-125' : ''
                  }`}>↑</div>
                <div className="text-red-400 font-bold text-sm mt-2">TAIL</div>
              </div>
            )}
          </div>
        </div>

        {/* Memory Layout Visualization */}
        <MemoryLayout nodes={nodes} type={type} />

        {/* Operations Display */}
        {operations.length > 0 && (
          <OperationsDisplay operationList={operations} />
        )}

        {/* List Statistics */}
        <ListStatistics nodeList={nodes} listType={type} statsTraversal={traversal} />
      </div>
    </BaseVisualizer>
  );
}

/**
 * Generate a realistic-looking memory address from node ID
 */
function generateMemoryAddress(nodeId) {
  if (!nodeId) return '0000';

  // Create a consistent hash-like address from the node ID
  let hash = 0;
  const str = String(nodeId);
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to hex and pad to 4 characters
  const address = Math.abs(hash).toString(16).toUpperCase().padStart(4, '0').slice(-4);
  return `${address.slice(0, 2)}${address.slice(2, 4)}`;
}

/**
 * Get color class for operation type
 */
function getOperationColor(operationType) {
  const colorMap = {
    'insert': 'bg-green-600 text-white',
    'delete': 'bg-red-600 text-white',
    'traverse': 'bg-blue-600 text-white',
    'search': 'bg-purple-600 text-white',
    'update': 'bg-yellow-600 text-black',
    'connect': 'bg-cyan-600 text-white',
    'disconnect': 'bg-orange-600 text-white'
  };

  return colorMap[operationType.toLowerCase()] || 'bg-gray-600 text-white';
}

// Named export to fix Fast Refresh
const LinkedListVisualizerComponent = withErrorBoundary(LinkedListVisualizer);
LinkedListVisualizerComponent.displayName = 'LinkedListVisualizer';
export default LinkedListVisualizerComponent;