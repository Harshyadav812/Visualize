import React from 'react';
import BaseVisualizer, { withErrorBoundary, VisualizerUtils } from './BaseVisualizer';
import { formatValue, VISUALIZATION_SCHEMAS } from '../../utils/visualizationSchemas';

/**
 * Recursion Visualizer with call stack representation
 * Supports recursive tree structure, parameter tracking, and base case highlighting
 */
function RecursionVisualizer({ data, stepData, title = "Recursion Visualization" }) {
  // Handle null/undefined data
  if (!data) {
    data = {};
  }

  // Validate required data
  try {
    VisualizerUtils.validateData(data, ['callStack']);
  } catch (error) {
    return (
      <BaseVisualizer data={data} stepData={stepData} title={title}>
        <div className="text-red-300">
          Invalid recursion data: {error.message}
        </div>
      </BaseVisualizer>
    );
  }

  const {
    callStack = [],
    recursiveTree = [],
    currentCall,
    baseCase = false
  } = data;

  return (
    <BaseVisualizer data={data} stepData={stepData} title={title}>
      <div className="space-y-6">
        {/* Call Stack Display */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-green-400 font-semibold mb-4 flex items-center">
            <span className="mr-2">📚</span>
            Call Stack
          </h4>
          <CallStackDisplay
            callStack={callStack}
            currentCall={currentCall}
            baseCase={baseCase}
          />
        </div>

        {/* Recursive Tree Structure */}
        {recursiveTree.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h4 className="text-blue-400 font-semibold mb-4 flex items-center">
              <span className="mr-2">🌳</span>
              Recursive Tree
            </h4>
            <RecursiveTreeDisplay
              recursiveTree={recursiveTree}
              currentCall={currentCall}
            />
          </div>
        )}

        {/* Base Case Indicator */}
        {baseCase && (
          <BaseCaseIndicator />
        )}

        {/* Recursion Statistics */}
        <RecursionStatistics
          callStack={callStack}
        />
      </div>
    </BaseVisualizer>
  );
}

/**
 * Call stack display component
 */
function CallStackDisplay({ callStack, currentCall, baseCase }) {
  return (
    <div className="space-y-2">
      {callStack.length === 0 ? (
        <div className="text-gray-400 text-center py-8">
          Call stack is empty
        </div>
      ) : (
        callStack.map((call, index) => (
          <CallStackFrame
            key={index}
            call={call}
            isCurrent={currentCall === call.function}
            isTop={index === callStack.length - 1}
            baseCase={baseCase && index === callStack.length - 1}
          />
        ))
      )}
    </div>
  );
}

/**
 * Individual call stack frame component
 */
function CallStackFrame({ call, isCurrent, isTop, baseCase }) {
  const {
    function: functionName,
    params = {},
    level = 0,
    state = 'active',
    returnValue
  } = call;

  let frameClass = 'border-2 rounded-lg p-4 transition-all duration-300';

  if (baseCase) {
    frameClass += ' bg-green-900/50 border-green-400 shadow-lg';
  } else if (isCurrent) {
    frameClass += ' bg-yellow-900/50 border-yellow-400 shadow-lg';
  } else if (isTop) {
    frameClass += ' bg-blue-900/50 border-blue-400';
  } else {
    frameClass += ' bg-gray-700 border-gray-500';
  }

  return (
    <div className={frameClass} style={{ marginLeft: `${level * 20}px` }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-blue-300 font-bold font-mono">
            {functionName}
          </span>
          {baseCase && (
            <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
              BASE CASE
            </span>
          )}
          {isCurrent && (
            <span className="bg-yellow-600 text-black px-2 py-1 rounded text-xs font-bold">
              CURRENT
            </span>
          )}
        </div>
        <div className="text-gray-400 text-sm">
          Level {level}
        </div>
      </div>

      {/* Parameters */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <span className="text-gray-400 text-sm font-semibold">Parameters:</span>
          <div className="bg-gray-800 rounded p-2 mt-1">
            {Object.keys(params).length === 0 ? (
              <span className="text-gray-500 text-sm">None</span>
            ) : (
              Object.entries(params).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-blue-300 font-mono">{key}:</span>
                  <span className="text-yellow-300">{formatValue(value, 'recursion')}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Return Value */}
        <div>
          <span className="text-gray-400 text-sm font-semibold">Return Value:</span>
          <div className="bg-gray-800 rounded p-2 mt-1">
            {returnValue !== undefined ? (
              <span className="text-green-300 font-mono">
                {formatValue(returnValue, 'recursion')}
              </span>
            ) : (
              <span className="text-gray-500 text-sm">Pending...</span>
            )}
          </div>
        </div>
      </div>

      {/* State indicator */}
      <div className="text-xs text-gray-400">
        State: <span className={`font-semibold ${state === 'active' ? 'text-green-400' :
          state === 'waiting' ? 'text-yellow-400' :
            'text-gray-400'
          }`}>
          {state.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

/**
 * Recursive tree display component
 */
function RecursiveTreeDisplay({ recursiveTree, currentCall }) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        {recursiveTree.map((node) => (
          <RecursiveTreeNode
            key={node.id}
            node={node}
            isCurrent={currentCall === node.id}
            level={0}
            currentCall={currentCall}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual recursive tree node component
 */
function RecursiveTreeNode({ node, isCurrent, level, currentCall }) {
  const { id, children = [], value, state = 'computing' } = node;

  let nodeClass = 'inline-block border-2 rounded-lg p-3 m-1 transition-all duration-300';

  if (isCurrent) {
    nodeClass += ' bg-yellow-500 border-yellow-300 text-black';
  } else if (state === 'completed') {
    nodeClass += ' bg-green-600 border-green-400 text-white';
  } else if (state === 'base_case') {
    nodeClass += ' bg-blue-600 border-blue-400 text-white';
  } else {
    nodeClass += ' bg-gray-700 border-gray-500 text-gray-300';
  }

  return (
    <div style={{ marginLeft: `${level * 40}px` }}>
      <div className={nodeClass}>
        <div className="font-mono font-bold text-sm">{id}</div>
        {value !== undefined && (
          <div className="text-xs mt-1">
            Value: {formatValue(value, 'recursion')}
          </div>
        )}
      </div>

      {/* Render children */}
      {children.length > 0 && (
        <div className="ml-4 border-l-2 border-gray-600 pl-4">
          {children.map((childId) => {
            // Find child node in the tree
            const childNode = { id: childId, children: [], state: 'computing' };
            return (
              <RecursiveTreeNode
                key={childId}
                node={childNode}
                isCurrent={currentCall === childId}
                level={level + 1}
                currentCall={currentCall}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Base case indicator component
 */
function BaseCaseIndicator() {
  return (
    <div className="bg-green-900/50 border border-green-400 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <span className="text-green-400 text-2xl">✅</span>
        <div>
          <h4 className="text-green-300 font-semibold">Base Case Reached!</h4>
          <p className="text-green-200 text-sm">
            The recursion has reached its terminating condition and will start returning values.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Display recursion statistics
 */
function RecursionStatistics({ callStack }) {
  const maxDepth = Math.max(...callStack.map(call => call.level || 0), 0);
  const totalCalls = callStack.length;
  const completedCalls = callStack.filter(call => call.returnValue !== undefined).length;

  const stats = [
    { label: 'Call Depth', value: maxDepth + 1, color: 'blue' },
    { label: 'Total Calls', value: totalCalls, color: 'green' },
    { label: 'Completed', value: completedCalls, color: 'yellow' },
    { label: 'Pending', value: totalCalls - completedCalls, color: 'red' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
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
  );
}

RecursionVisualizer.displayName = 'RecursionVisualizer';

const RecursionVisualizerWithErrorBoundary = withErrorBoundary(RecursionVisualizer);
RecursionVisualizerWithErrorBoundary.displayName = 'RecursionVisualizerWithErrorBoundary';

export default RecursionVisualizerWithErrorBoundary;