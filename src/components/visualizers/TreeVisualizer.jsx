import React, { useState, useEffect, memo, useMemo, useCallback } from 'react';
import BaseVisualizer, { withErrorBoundary, VisualizerUtils } from './BaseVisualizer';
import { formatValue, VISUALIZATION_SCHEMAS } from '../../utils/visualizationSchemas';

/**
 * Tree Visualizer for binary trees, BSTs, and general trees
 * Supports traversal animations, insertions, deletions, and rotations
 * Optimized with React.memo and useMemo for performance
 */
const TreeVisualizer = memo(function TreeVisualizer({ data, stepData, title = "Tree Visualization" }) {
    const [animationState, setAnimationState] = useState({
        isAnimating: false,
        currentStep: 0,
        animationType: null
    });

    // Validate required data
    try {
        VisualizerUtils.validateData(data, ['nodes']);
    } catch (error) {
        return (
            <BaseVisualizer data={data} stepData={stepData} title={title}>
                <div className="text-red-300">
                    Invalid tree data: {error.message}
                </div>
            </BaseVisualizer>
        );
    }

    const {
        nodes = [],
        edges = [],
        traversalPath = [],
        currentNode,
        traversalType = 'none',
        operations = [],
        treeType = 'binary',
        rootId = null
    } = data;

    // Auto-position nodes if positions are not provided - memoized for performance
    const { positionedNodes, contentWidth } = useMemo(() =>
        useAutoLayout(nodes, edges, rootId, treeType),
        [nodes, edges, rootId, treeType]
    );

    // Handle traversal animations - memoized callback for performance
    const handleAnimationStateChange = useCallback((newState) => {
        setAnimationState(newState);
    }, []);

    // Handle traversal animations
    useEffect(() => {
        if (traversalPath.length > 0 && traversalType !== 'none') {
            setAnimationState({
                isAnimating: true,
                currentStep: 0,
                animationType: traversalType
            });
        }
    }, [traversalPath, traversalType]);

    return (
        <BaseVisualizer data={data} stepData={stepData} title={title}>
            <div className="space-y-6">
                {/* Tree Structure */}
                <div className="relative bg-gray-800 rounded-lg p-6 min-h-96">
                    <svg
                        width="100%"
                        height="500"
                        className="overflow-visible"
                        viewBox={`0 0 ${contentWidth} 500`}
                        preserveAspectRatio="xMidYMid meet"
                    >
                        {/* Render edges first (behind nodes) */}
                        {edges.map((edge, index) => (
                            <TreeEdge
                                key={`edge-${edge.from}-${edge.to}-${index}`}
                                edge={edge}
                                nodes={positionedNodes}
                                isTraversed={traversalPath.includes(edge.from) && traversalPath.includes(edge.to)}
                                animationState={animationState}
                            />
                        ))}

                        {/* Render nodes */}
                        {positionedNodes.map((node) => (
                            <TreeNode
                                key={`node-${node.id}`}
                                node={node}
                                isCurrent={currentNode === node.id}
                                isVisited={traversalPath.includes(node.id)}
                                animationState={animationState}
                                operations={operations}
                            />
                        ))}
                    </svg>
                </div>

                {/* Traversal Controls and Information */}
                {traversalType !== 'none' && (
                    <TraversalControls
                        traversalType={traversalType}
                        traversalPath={traversalPath}
                        currentNode={currentNode}
                        nodes={positionedNodes}
                        animationState={animationState}
                        onAnimationStateChange={handleAnimationStateChange}
                    />
                )}

                {/* Operations Display */}
                {operations.length > 0 && (
                    <OperationsDisplay operations={operations} />
                )}

                {/* Tree Statistics */}
                <TreeStatistics
                    nodes={positionedNodes}
                    edges={edges}
                    treeType={treeType}
                    traversalType={traversalType}
                />
            </div>
        </BaseVisualizer>
    );
});

/**
 * Auto-layout algorithm for clean tree positioning
 */
function useAutoLayout(nodes, edges, rootId, treeType) {
    if (!nodes.length) return { positionedNodes: nodes, contentWidth: 800 };

    // If nodes already have positions, use them
    if (nodes.every(node => node.x !== undefined && node.y !== undefined)) {
        const maxX = Math.max(...nodes.map(n => n.x));
        return { positionedNodes: nodes, contentWidth: Math.max(maxX + 100, 800) };
    }

    // Find root node
    const root = rootId ? nodes.find(n => n.id === rootId) : findRoot(nodes, edges);
    if (!root) return { positionedNodes: nodes, contentWidth: 800 };

    // Build tree structure
    const tree = buildTreeStructure(nodes, edges, root.id);

    // Calculate positions based on tree type
    const { positionedNodes, baseWidth } = calculateNodePositions(tree, treeType);

    // Handle disconnected nodes by positioning them separately
    const connectedNodeIds = new Set(positionedNodes.map(n => n.id));
    const disconnectedNodes = nodes.filter(n => !connectedNodeIds.has(n.id));

    // Position disconnected nodes to the right of the main tree
    let maxX = baseWidth;
    disconnectedNodes.forEach((node, index) => {
        const x = baseWidth + 100 + (index * 120);
        const y = 50 + (index * 80);
        positionedNodes.push({
            ...node,
            x,
            y
        });
        maxX = Math.max(maxX, x);
    });

    const contentWidth = Math.max(maxX + 150, baseWidth + 150, 800);
    return { positionedNodes, contentWidth };
}

/**
 * Find root node (node with no incoming edges)
 */
function findRoot(nodes, edges) {
    const hasIncoming = new Set(edges.map(e => e.to));
    return nodes.find(node => !hasIncoming.has(node.id)) || nodes[0];
}

/**
 * Build tree structure from nodes and edges
 */
function buildTreeStructure(nodes, edges, rootId) {
    const nodeMap = new Map(nodes.map(node => [node.id, { ...node, children: [] }]));

    // Build parent-child relationships
    edges.forEach(edge => {
        const parent = nodeMap.get(edge.from);
        const child = nodeMap.get(edge.to);
        if (parent && child) {
            parent.children.push(child);
            child.parent = parent;
        }
    });

    return nodeMap.get(rootId);
}

/**
 * Calculate node positions using a clean layout algorithm
 */
function calculateNodePositions(root, treeType) {
    if (!root) return { positionedNodes: [], baseWidth: 800 };

    const positions = [];
    const levelHeight = 80;

    // Calculate subtree widths first
    calculateSubtreeWidths(root);
    const requiredWidth = Math.max(root.subtreeWidth + 200, 800); // add horizontal margin
    const baseWidth = requiredWidth;

    // Position nodes level by level starting centered
    positionNode(root, baseWidth / 2, 50, baseWidth, levelHeight, positions);

    return { positionedNodes: positions, baseWidth };
}

/**
 * Calculate width needed for each subtree
 */
function calculateSubtreeWidths(node) {
    if (!node.children || node.children.length === 0) {
        node.subtreeWidth = 60; // Minimum width for leaf nodes
        return node.subtreeWidth;
    }

    let totalWidth = 0;
    node.children.forEach(child => {
        totalWidth += calculateSubtreeWidths(child);
    });

    node.subtreeWidth = Math.max(totalWidth, 60);
    return node.subtreeWidth;
}

/**
 * Position a node and its children recursively
 */
function positionNode(node, x, y, availableWidth, levelHeight, positions) {
    // Position current node
    positions.push({
        ...node,
        x: x,
        y: y
    });

    if (!node.children || node.children.length === 0) {
        return;
    }

    // Calculate positions for children
    const totalChildWidth = node.children.reduce((sum, child) => sum + child.subtreeWidth, 0);
    let currentX = x - totalChildWidth / 2;

    node.children.forEach(child => {
        const childX = currentX + child.subtreeWidth / 2;
        positionNode(child, childX, y + levelHeight, child.subtreeWidth, levelHeight, positions);
        currentX += child.subtreeWidth;
    });
}

/**
 * Enhanced tree node component with animations
 * Optimized with React.memo for performance
 */
const TreeNode = memo(function TreeNode({ node, isCurrent, isVisited, animationState, operations }) {
    const { id, value, x = 0, y = 0, state = 'normal' } = node;

    // Check if node is involved in current operations
    const currentOperation = operations.find(op =>
        op.nodeIds && op.nodeIds.includes(id)
    );

    // Determine node styling based on state and operations
    let nodeClass = 'fill-gray-600 stroke-gray-500';
    let textClass = 'fill-gray-300';
    let pulseClass = '';

    if (currentOperation) {
        switch (currentOperation.type) {
            case 'insert':
                nodeClass = 'fill-green-500 stroke-green-300';
                textClass = 'fill-white';
                pulseClass = 'animate-pulse';
                break;
            case 'delete':
                nodeClass = 'fill-red-500 stroke-red-300';
                textClass = 'fill-white';
                pulseClass = 'animate-pulse';
                break;
            case 'rotate':
                nodeClass = 'fill-purple-500 stroke-purple-300';
                textClass = 'fill-white';
                break;
        }
    } else if (isCurrent) {
        nodeClass = 'fill-yellow-500 stroke-yellow-300';
        textClass = 'fill-black';
        pulseClass = 'animate-pulse';
    } else if (isVisited) {
        nodeClass = 'fill-green-600 stroke-green-400';
        textClass = 'fill-white';
    } else if (state === 'target') {
        nodeClass = 'fill-red-600 stroke-red-400';
        textClass = 'fill-white';
    }

    return (
        <g transform={`translate(${x}, ${y})`} className={pulseClass}>
            {/* Node circle */}
            <circle
                cx="0"
                cy="0"
                r="25"
                className={`${nodeClass} stroke-2 transition-all duration-500`}
            />

            {/* Node value */}
            <text
                x="0"
                y="6"
                textAnchor="middle"
                className={`${textClass} text-sm font-bold`}
            >
                {formatValue(value, 'tree')}
            </text>

            {/* Operation indicator */}
            {currentOperation && (
                <text
                    x="0"
                    y="-35"
                    textAnchor="middle"
                    className="fill-white text-xs font-bold"
                >
                    {currentOperation.type.toUpperCase()}
                </text>
            )}
        </g>
    );
});

/**
 * Enhanced tree edge component with animations
 * Optimized with React.memo for performance
 */
const TreeEdge = memo(function TreeEdge({ edge, nodes, isTraversed, animationState }) {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);

    if (!fromNode || !toNode) return null;

    // Calculate edge endpoints (from circle edge to circle edge)
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = 25;

    const x1 = fromNode.x + (dx / distance) * radius;
    const y1 = fromNode.y + (dy / distance) * radius;
    const x2 = toNode.x - (dx / distance) * radius;
    const y2 = toNode.y - (dy / distance) * radius;

    let edgeClass = 'stroke-gray-500 stroke-2';

    if (isTraversed) {
        edgeClass = 'stroke-blue-400 stroke-3';
    } else if (edge.state === 'highlighted') {
        edgeClass = 'stroke-purple-400 stroke-3';
    } else if (edge.state === 'rotation') {
        edgeClass = 'stroke-orange-400 stroke-3';
    }

    return (
        <g>
            <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className={`${edgeClass} transition-all duration-500`}
            />

            {/* Arrow for directed edges */}
            {edge.directed && (
                <polygon
                    points={`${x2 - 5},${y2 - 5} ${x2 + 5},${y2 - 5} ${x2},${y2 + 5}`}
                    className={edgeClass.replace('stroke-', 'fill-')}
                />
            )}
        </g>
    );
});

/**
 * Traversal controls with animation support
 */
function TraversalControls({
    traversalType,
    traversalPath,
    currentNode,
    nodes,
    animationState,
    onAnimationStateChange
}) {
    const traversalTypeNames = {
        'preorder': 'Pre-order (Root → Left → Right)',
        'inorder': 'In-order (Left → Root → Right)',
        'postorder': 'Post-order (Left → Right → Root)',
        'levelorder': 'Level-order (Breadth-first)',
        'dfs': 'Depth-First Search',
        'bfs': 'Breadth-First Search'
    };

    return (
        <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-blue-300 font-semibold flex items-center">
                    <span className="mr-2">🌳</span>
                    {traversalTypeNames[traversalType] || `${traversalType} Traversal`}
                </h4>

                {/* Animation Controls */}
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onAnimationStateChange(prev => ({
                            ...prev,
                            isAnimating: !prev.isAnimating
                        }))}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                    >
                        {animationState.isAnimating ? '⏸️ Pause' : '▶️ Play'}
                    </button>

                    <button
                        onClick={() => onAnimationStateChange(prev => ({
                            ...prev,
                            currentStep: 0,
                            isAnimating: false
                        }))}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                    >
                        🔄 Reset
                    </button>
                </div>
            </div>

            {/* Traversal Path Display */}
            <div className="flex flex-wrap gap-2">
                {traversalPath.map((nodeId, index) => {
                    const node = nodes.find(n => n.id === nodeId);
                    const isCurrent = nodeId === currentNode;
                    const isPast = index < traversalPath.indexOf(currentNode);

                    return (
                        <div key={index} className="flex items-center">
                            <div
                                className={`px-3 py-2 rounded-lg font-bold transition-all duration-300 ${isCurrent
                                    ? 'bg-yellow-500 text-black scale-110'
                                    : isPast
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-600 text-gray-300'
                                    }`}
                            >
                                {node?.value || nodeId}
                            </div>
                            {index < traversalPath.length - 1 && (
                                <span className="mx-2 text-blue-400">→</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Traversal Progress */}
            <div className="mt-4">
                <div className="flex justify-between text-sm text-blue-300 mb-1">
                    <span>Progress</span>
                    <span>{traversalPath.indexOf(currentNode) + 1} / {traversalPath.length}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{
                            width: `${((traversalPath.indexOf(currentNode) + 1) / traversalPath.length) * 100}%`
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

/**
 * Display current tree operations
 */
function OperationsDisplay({ operations }) {
    if (!operations.length) return null;

    const operationIcons = {
        'insert': '➕',
        'delete': '❌',
        'rotate': '🔄',
        'balance': '⚖️',
        'search': '🔍'
    };

    return (
        <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
            <h4 className="text-purple-300 font-semibold mb-3 flex items-center">
                <span className="mr-2">⚡</span>
                Current Operations
            </h4>

            <div className="space-y-2">
                {operations.map((operation, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-purple-800/30 rounded">
                        <span className="text-lg">
                            {operationIcons[operation.type] || '🔧'}
                        </span>

                        <div className="flex-1">
                            <div className="font-semibold text-purple-200">
                                {operation.type.toUpperCase()}
                            </div>
                            {operation.description && (
                                <div className="text-sm text-purple-300">
                                    {operation.description}
                                </div>
                            )}
                        </div>

                        {operation.nodeIds && (
                            <div className="text-sm text-purple-400">
                                Nodes: {operation.nodeIds.join(', ')}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Enhanced tree statistics display
 */
function TreeStatistics({ nodes, edges, treeType, traversalType }) {
    const height = calculateTreeHeight(nodes, edges);
    const leafCount = countLeafNodes(nodes, edges);
    const isBalanced = checkIfBalanced(nodes, edges);
    const diameter = calculateDiameter(nodes, edges);

    const stats = [
        { label: 'Total Nodes', value: nodes.length, color: 'blue', icon: '🔢' },
        { label: 'Tree Height', value: height, color: 'green', icon: '📏' },
        { label: 'Leaf Nodes', value: leafCount, color: 'yellow', icon: '🍃' },
        { label: 'Diameter', value: diameter, color: 'purple', icon: '↔️' }
    ];

    // Add tree-type specific stats
    if (treeType === 'bst') {
        stats.push({
            label: 'Balanced',
            value: isBalanced ? 'Yes' : 'No',
            color: isBalanced ? 'green' : 'red',
            icon: '⚖️'
        });
    }

    return (
        <div className="space-y-4">
            {/* Main Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-3">
                        <div className="text-2xl mb-1">{stat.icon}</div>
                        <div className={`text-${stat.color}-400 text-sm font-semibold`}>
                            {stat.label}
                        </div>
                        <div className={`text-xl font-bold text-${stat.color}-300`}>
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Tree Properties */}
            <div className="bg-gray-800 rounded-lg p-4">
                <h5 className="text-gray-300 font-semibold mb-3 flex items-center">
                    <span className="mr-2">📊</span>
                    Tree Properties
                </h5>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white font-medium">
                            {treeType.toUpperCase()}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-400">Traversal:</span>
                        <span className="text-white font-medium">
                            {traversalType !== 'none' ? traversalType.toUpperCase() : 'None'}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-400">Complete:</span>
                        <span className="text-white font-medium">
                            {isCompleteTree(nodes, edges) ? 'Yes' : 'No'}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-400">Perfect:</span>
                        <span className="text-white font-medium">
                            {isPerfectTree(nodes, edges) ? 'Yes' : 'No'}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-400">Full:</span>
                        <span className="text-white font-medium">
                            {isFullTree(nodes, edges) ? 'Yes' : 'No'}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-400">Edges:</span>
                        <span className="text-white font-medium">
                            {edges.length}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Calculate actual tree height using BFS
 */
function calculateTreeHeight(nodes, edges) {
    if (!nodes.length) return 0;

    // Find root (node with no incoming edges)
    const hasIncoming = new Set(edges.map(e => e.to));
    const root = nodes.find(node => !hasIncoming.has(node.id));
    if (!root) return 1;

    // Build adjacency list
    const children = new Map();
    edges.forEach(edge => {
        if (!children.has(edge.from)) children.set(edge.from, []);
        children.get(edge.from).push(edge.to);
    });

    // BFS to find height
    let height = 0;
    let queue = [root.id];

    while (queue.length > 0) {
        const levelSize = queue.length;
        height++;

        for (let i = 0; i < levelSize; i++) {
            const nodeId = queue.shift();
            const nodeChildren = children.get(nodeId) || [];
            queue.push(...nodeChildren);
        }
    }

    return height;
}

/**
 * Count leaf nodes (nodes with no children)
 */
function countLeafNodes(nodes, edges) {
    const hasChildren = new Set(edges.map(e => e.from));
    return nodes.filter(node => !hasChildren.has(node.id)).length;
}

/**
 * Check if tree is balanced (height difference between subtrees ≤ 1)
 */
function checkIfBalanced(nodes, edges) {
    if (!nodes.length) return true;

    // Build tree structure
    const children = new Map();
    edges.forEach(edge => {
        if (!children.has(edge.from)) children.set(edge.from, []);
        children.get(edge.from).push(edge.to);
    });

    function getHeight(nodeId) {
        if (!nodeId) return 0;
        const nodeChildren = children.get(nodeId) || [];
        if (nodeChildren.length === 0) return 1;

        return 1 + Math.max(...nodeChildren.map(getHeight));
    }

    function isBalanced(nodeId) {
        if (!nodeId) return true;
        const nodeChildren = children.get(nodeId) || [];

        if (nodeChildren.length === 0) return true;
        if (nodeChildren.length === 1) return isBalanced(nodeChildren[0]);

        const leftHeight = getHeight(nodeChildren[0]);
        const rightHeight = getHeight(nodeChildren[1]);

        return Math.abs(leftHeight - rightHeight) <= 1 &&
            isBalanced(nodeChildren[0]) &&
            isBalanced(nodeChildren[1]);
    }

    const hasIncoming = new Set(edges.map(e => e.to));
    const root = nodes.find(node => !hasIncoming.has(node.id));

    return root ? isBalanced(root.id) : true;
}

/**
 * Calculate tree diameter (longest path between any two nodes)
 */
function calculateDiameter(nodes, edges) {
    if (nodes.length < 2) return 0;

    // Build adjacency list (undirected for diameter calculation)
    const adj = new Map();
    nodes.forEach(node => adj.set(node.id, []));
    edges.forEach(edge => {
        adj.get(edge.from).push(edge.to);
        adj.get(edge.to).push(edge.from);
    });

    let maxDiameter = 0;

    // For each node, find the farthest node using BFS
    nodes.forEach(startNode => {
        const visited = new Set();
        const queue = [{ id: startNode.id, distance: 0 }];
        visited.add(startNode.id);
        let maxDistance = 0;

        while (queue.length > 0) {
            const { id, distance } = queue.shift();
            maxDistance = Math.max(maxDistance, distance);

            (adj.get(id) || []).forEach(neighborId => {
                if (!visited.has(neighborId)) {
                    visited.add(neighborId);
                    queue.push({ id: neighborId, distance: distance + 1 });
                }
            });
        }

        maxDiameter = Math.max(maxDiameter, maxDistance);
    });

    return maxDiameter;
}

/**
 * Check if tree is complete (all levels filled except possibly the last)
 */
function isCompleteTree(nodes, edges) {
    if (!nodes.length) return true;

    const hasIncoming = new Set(edges.map(e => e.to));
    const root = nodes.find(node => !hasIncoming.has(node.id));
    if (!root) return false;

    // Build children map
    const children = new Map();
    edges.forEach(edge => {
        if (!children.has(edge.from)) children.set(edge.from, []);
        children.get(edge.from).push(edge.to);
    });

    // Level-order traversal to check completeness
    const queue = [root.id];
    let foundNull = false;

    while (queue.length > 0) {
        const nodeId = queue.shift();
        const nodeChildren = children.get(nodeId) || [];

        if (nodeChildren.length === 0) {
            foundNull = true;
        } else if (foundNull) {
            return false; // Found a node with children after a null
        } else {
            queue.push(...nodeChildren);
        }
    }

    return true;
}

/**
 * Check if tree is perfect (all internal nodes have 2 children, all leaves at same level)
 */
function isPerfectTree(nodes, edges) {
    if (!nodes.length) return true;

    const children = new Map();
    edges.forEach(edge => {
        if (!children.has(edge.from)) children.set(edge.from, []);
        children.get(edge.from).push(edge.to);
    });

    // All internal nodes should have exactly 2 children
    // All leaves should be at the same level
    const hasIncoming = new Set(edges.map(e => e.to));
    const root = nodes.find(node => !hasIncoming.has(node.id));
    if (!root) return false;

    let leafLevel = -1;

    function checkPerfect(nodeId, level) {
        const nodeChildren = children.get(nodeId) || [];

        if (nodeChildren.length === 0) {
            // Leaf node
            if (leafLevel === -1) {
                leafLevel = level;
            }
            return leafLevel === level;
        }

        // Internal node must have exactly 2 children for binary tree
        if (nodeChildren.length !== 2) return false;

        return nodeChildren.every(childId => checkPerfect(childId, level + 1));
    }

    return checkPerfect(root.id, 0);
}

/**
 * Check if tree is full (every node has 0 or 2 children)
 */
function isFullTree(nodes, edges) {
    const children = new Map();
    edges.forEach(edge => {
        if (!children.has(edge.from)) children.set(edge.from, []);
        children.get(edge.from).push(edge.to);
    });

    return nodes.every(node => {
        const nodeChildren = children.get(node.id) || [];
        return nodeChildren.length === 0 || nodeChildren.length === 2;
    });
}

export default withErrorBoundary(TreeVisualizer);