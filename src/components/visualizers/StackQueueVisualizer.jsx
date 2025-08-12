import React, { useState, useEffect } from 'react';
import BaseVisualizer, { withErrorBoundary, VisualizerUtils } from './BaseVisualizer';
import { formatValue, VISUALIZATION_SCHEMAS } from '../../utils/visualizationSchemas';

/**
 * Stack and Queue Visualizer with LIFO/FIFO operation animations
 * Supports push/pop, enqueue/dequeue, and priority queue operations
 */
function StackQueueVisualizer({ data, stepData, type = 'stack', title }) {
  const [animatingElements, setAnimatingElements] = useState(new Set());
  const [animatingOperation, setAnimatingOperation] = useState(null);

  // Validate required data
  try {
    VisualizerUtils.validateData(data, ['elements']);
  } catch (error) {
    return (
      <BaseVisualizer data={data} stepData={stepData} title={title}>
        <div className="text-red-300">
          Invalid {type} data: {error.message}
        </div>
      </BaseVisualizer>
    );
  }

  const {
    elements = [],
    top,
    front,
    rear,
    operations = [],
    capacity = 10,
    size = elements.length,
    priority = false,
    overflow = false,
    underflow = false,
    animationState = null
  } = data;

  // Handle animations
  useEffect(() => {
    if (animationState) {
      setAnimatingOperation(animationState.operation);
      if (animationState.elementIndices) {
        setAnimatingElements(new Set(animationState.elementIndices));
      }

      const timer = setTimeout(() => {
        setAnimatingOperation(null);
        setAnimatingElements(new Set());
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [animationState]);

  const displayTitle = title || `${type.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Visualization${priority ? ' (Priority)' : ''}`;

  return (
    <BaseVisualizer data={data} stepData={stepData} title={displayTitle}>
      <div className="space-y-6">
        {/* Overflow/Underflow Indicators */}
        {(overflow || underflow) && (
          <StateIndicators overflow={overflow} underflow={underflow} />
        )}

        {/* Stack/Queue Structure */}
        <div className="bg-gray-800 rounded-lg p-6">
          {type === 'stack' ? (
            <StackDisplay
              elements={elements}
              top={top}
              capacity={capacity}
              animatingElements={animatingElements}
              animatingOperation={animatingOperation}
              priority={priority}
            />
          ) : type === 'queue' ? (
            <QueueDisplay
              elements={elements}
              front={front}
              rear={rear}
              capacity={capacity}
              animatingElements={animatingElements}
              animatingOperation={animatingOperation}
              priority={priority}
            />
          ) : (
            <PriorityQueueDisplay
              elements={elements}
              capacity={capacity}
              animatingElements={animatingElements}
              animatingOperation={animatingOperation}
            />
          )}
        </div>

        {/* Operations Display */}
        {operations.length > 0 && (
          <OperationsDisplay operations={operations} type={type} priority={priority} />
        )}

        {/* Statistics */}
        <StackQueueStatistics
          elements={elements}
          capacity={capacity}
          size={size}
          type={type}
          overflow={overflow}
          underflow={underflow}
          priority={priority}
        />
      </div>
    </BaseVisualizer>
  );
}

/**
 * State indicators for overflow/underflow conditions
 */
function StateIndicators({ overflow, underflow }) {
  return (
    <div className="flex justify-center space-x-4">
      {overflow && (
        <div className="bg-red-900/50 border border-red-600 rounded-lg px-4 py-2 flex items-center space-x-2">
          <span className="text-red-400 text-xl">⚠️</span>
          <span className="text-red-300 font-semibold">OVERFLOW</span>
          <span className="text-red-200 text-sm">Structure is full</span>
        </div>
      )}
      {underflow && (
        <div className="bg-orange-900/50 border border-orange-600 rounded-lg px-4 py-2 flex items-center space-x-2">
          <span className="text-orange-400 text-xl">⚠️</span>
          <span className="text-orange-300 font-semibold">UNDERFLOW</span>
          <span className="text-orange-200 text-sm">Structure is empty</span>
        </div>
      )}
    </div>
  );
}

/**
 * Stack display component (vertical layout)
 */
function StackDisplay({ elements, top, capacity, animatingElements, animatingOperation, priority }) {
  // Pad elements array to show capacity
  const displayElements = [...elements];
  while (displayElements.length < capacity) {
    displayElements.push(null);
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Operation animation indicator */}
      {animatingOperation && (
        <div className="mb-4 px-4 py-2 bg-purple-900/50 border border-purple-600 rounded-lg">
          <span className="text-purple-300 font-semibold">
            {animatingOperation === 'push' ? '⬇️ PUSHING' : '⬆️ POPPING'}
          </span>
        </div>
      )}

      {/* Stack container */}
      <div className="relative">
        {/* Top pointer */}
        {top !== undefined && top >= 0 && (
          <div className="absolute -left-16 flex items-center"
            style={{ top: `${(capacity - top - 1) * 60 + 20}px` }}>
            <span className="text-yellow-400 font-bold text-sm mr-2">TOP</span>
            <span className="text-yellow-400 text-xl">→</span>
          </div>
        )}

        {/* Stack elements (from top to bottom) */}
        <div className="space-y-1">
          {displayElements.slice().reverse().map((element, index) => {
            const actualIndex = capacity - index - 1;
            // Distinguish between empty slots (padding) and actual null values
            const isEmptySlot = actualIndex >= elements.length;
            const isTop = actualIndex === top;
            const isAnimating = animatingElements.has(actualIndex);

            return (
              <StackElement
                key={actualIndex}
                element={element}
                index={actualIndex}
                isEmpty={isEmptySlot}
                isTop={isTop}
                isAnimating={isAnimating}
                priority={priority}
              />
            );
          })}
        </div>

        {/* Stack base */}
        <div className="w-32 h-2 bg-gray-600 rounded-b-lg mt-1"></div>
      </div>

      {/* Stack label */}
      <div className="text-gray-400 font-bold text-sm mt-4">
        STACK (LIFO){priority ? ' - PRIORITY' : ''}
      </div>
    </div>
  );
}

/**
 * Queue display component (horizontal layout)
 */
function QueueDisplay({ elements, front, rear, capacity, animatingElements, animatingOperation, priority }) {
  // Pad elements array to show capacity
  const displayElements = [...elements];
  while (displayElements.length < capacity) {
    displayElements.push(null);
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Operation animation indicator */}
      {animatingOperation && (
        <div className="mb-4 px-4 py-2 bg-purple-900/50 border border-purple-600 rounded-lg">
          <span className="text-purple-300 font-semibold">
            {animatingOperation === 'enqueue' ? '➡️ ENQUEUING' : '⬅️ DEQUEUING'}
          </span>
        </div>
      )}

      {/* Front and Rear pointers */}
      <div className="flex space-x-2 w-full justify-center">
        {displayElements.map((_, index) => (
          <div key={index} className="w-16 text-center">
            {index === front && (
              <div className="text-green-400 font-bold text-sm">
                FRONT
                <div className="text-green-400 text-xl">↓</div>
              </div>
            )}
            {index === rear && (
              <div className="text-red-400 font-bold text-sm">
                REAR
                <div className="text-red-400 text-xl">↓</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Queue elements */}
      <div className="flex space-x-2">
        {displayElements.map((element, index) => {
          const isEmpty = element === null || element === undefined;
          const isFront = index === front;
          const isRear = index === rear;
          const isAnimating = animatingElements.has(index);

          return (
            <QueueElement
              key={index}
              element={element}
              index={index}
              isEmpty={isEmpty}
              isFront={isFront}
              isRear={isRear}
              isAnimating={isAnimating}
              priority={priority}
            />
          );
        })}
      </div>

      {/* Queue label */}
      <div className="text-gray-400 font-bold text-sm">
        QUEUE (FIFO){priority ? ' - PRIORITY' : ''}
      </div>
    </div>
  );
}

/**
 * Priority Queue display component (sorted by priority)
 */
function PriorityQueueDisplay({ elements, capacity, animatingElements, animatingOperation }) {
  // Sort elements by priority for display
  const sortedElements = [...elements].sort((a, b) => {
    const priorityA = a?.priority || 0;
    const priorityB = b?.priority || 0;
    return priorityB - priorityA; // Higher priority first
  });

  // Pad elements array to show capacity
  const displayElements = [...sortedElements];
  while (displayElements.length < capacity) {
    displayElements.push(null);
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Operation animation indicator */}
      {animatingOperation && (
        <div className="mb-4 px-4 py-2 bg-purple-900/50 border border-purple-600 rounded-lg">
          <span className="text-purple-300 font-semibold">
            {animatingOperation === 'insert' ? '⬇️ INSERTING' : '⬆️ EXTRACTING'}
          </span>
        </div>
      )}

      {/* Priority Queue elements (vertical layout, highest priority at top) */}
      <div className="space-y-2">
        <div className="text-center text-purple-400 font-semibold text-sm mb-2">
          HIGHEST PRIORITY ↑
        </div>
        {displayElements.map((element, index) => {
          const isEmpty = element === null || element === undefined;
          const isAnimating = animatingElements.has(index);

          return (
            <PriorityQueueElement
              key={index}
              element={element}
              index={index}
              isEmpty={isEmpty}
              isAnimating={isAnimating}
            />
          );
        })}
        <div className="text-center text-purple-400 font-semibold text-sm mt-2">
          ↓ LOWEST PRIORITY
        </div>
      </div>

      {/* Priority Queue label */}
      <div className="text-gray-400 font-bold text-sm">
        PRIORITY QUEUE
      </div>
    </div>
  );
}

/**
 * Individual stack element component
 */
function StackElement({ element, index, isEmpty, isTop, isAnimating, priority }) {
  let elementClass = 'w-32 h-12 border-2 rounded-lg flex items-center justify-center font-bold transition-all duration-300';

  if (isEmpty) {
    elementClass += ' bg-gray-800 border-gray-600 text-gray-500 border-dashed';
  } else if (isAnimating) {
    elementClass += ' bg-purple-500 border-purple-300 text-white shadow-lg animate-pulse';
  } else if (isTop) {
    elementClass += ' bg-yellow-500 border-yellow-300 text-black shadow-lg';
  } else {
    elementClass += ' bg-blue-600 border-blue-400 text-white';
  }

  return (
    <div className={elementClass}>
      <div className="text-center">
        {isEmpty ? (
          <span className="text-gray-500">empty</span>
        ) : (
          <>
            <div className="text-lg">{formatValue(element?.value || element, 'stack')}</div>
            <div className="text-xs opacity-75">
              [{index}]{priority && element?.priority !== undefined ? ` P:${element.priority}` : ''}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Individual queue element component
 */
function QueueElement({ element, index, isEmpty, isFront, isRear, isAnimating, priority }) {
  let elementClass = 'w-16 h-16 border-2 rounded-lg flex flex-col items-center justify-center font-bold transition-all duration-300';

  if (isEmpty) {
    elementClass += ' bg-gray-800 border-gray-600 text-gray-500 border-dashed';
  } else if (isAnimating) {
    elementClass += ' bg-purple-500 border-purple-300 text-white shadow-lg animate-pulse';
  } else if (isFront) {
    elementClass += ' bg-green-600 border-green-400 text-white shadow-lg';
  } else if (isRear) {
    elementClass += ' bg-red-600 border-red-400 text-white shadow-lg';
  } else {
    elementClass += ' bg-blue-600 border-blue-400 text-white';
  }

  return (
    <div className={elementClass}>
      {isEmpty ? (
        <span className="text-gray-500 text-xs">empty</span>
      ) : (
        <>
          <div className="text-sm">{formatValue(element?.value || element, 'queue')}</div>
          <div className="text-xs opacity-75">
            [{index}]{priority && element?.priority !== undefined ? ` P:${element.priority}` : ''}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Individual priority queue element component
 */
function PriorityQueueElement({ element, index, isEmpty, isAnimating }) {
  let elementClass = 'w-40 h-16 border-2 rounded-lg flex items-center justify-between font-bold transition-all duration-300 px-3';

  if (isEmpty) {
    elementClass += ' bg-gray-800 border-gray-600 text-gray-500 border-dashed';
  } else if (isAnimating) {
    elementClass += ' bg-purple-500 border-purple-300 text-white shadow-lg animate-pulse';
  } else {
    // Color based on priority level
    const priority = element?.priority || 0;
    if (priority >= 8) {
      elementClass += ' bg-red-600 border-red-400 text-white shadow-lg'; // Critical
    } else if (priority >= 6) {
      elementClass += ' bg-orange-600 border-orange-400 text-white shadow-lg'; // High
    } else if (priority >= 4) {
      elementClass += ' bg-yellow-600 border-yellow-400 text-black shadow-lg'; // Medium
    } else if (priority >= 2) {
      elementClass += ' bg-blue-600 border-blue-400 text-white shadow-lg'; // Low
    } else {
      elementClass += ' bg-gray-600 border-gray-400 text-white'; // Minimal
    }
  }

  return (
    <div className={elementClass}>
      {isEmpty ? (
        <span className="text-gray-500 text-sm">empty</span>
      ) : (
        <>
          <div className="flex flex-col">
            <div className="text-sm">{formatValue(element?.value || element, 'priority_queue')}</div>
            <div className="text-xs opacity-75">[{index}]</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-xs text-gray-300">Priority</div>
            <div className="text-lg font-bold">{element?.priority || 0}</div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Display current operations being performed
 */
function OperationsDisplay({ operations, type, priority }) {
  const operationNames = {
    push: 'Push (Add to top)',
    pop: 'Pop (Remove from top)',
    enqueue: 'Enqueue (Add to rear)',
    dequeue: 'Dequeue (Remove from front)',
    insert: 'Insert (Add with priority)',
    extract: 'Extract (Remove highest priority)',
    peek: 'Peek (View top/front)',
    isEmpty: 'Check if empty',
    isFull: 'Check if full'
  };

  const getOperationIcon = (operationType) => {
    const icons = {
      push: '⬇️',
      pop: '⬆️',
      enqueue: '➡️',
      dequeue: '⬅️',
      insert: '📥',
      extract: '📤',
      peek: '👁️',
      isEmpty: '❓',
      isFull: '🔒'
    };
    return icons[operationType] || '⚡';
  };

  return (
    <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
      <h4 className="text-purple-300 font-semibold mb-3 flex items-center">
        <span className="mr-2">⚡</span>
        Current Operations
      </h4>
      <div className="space-y-3">
        {operations.map((operation, index) => (
          <div key={index} className="bg-purple-800/50 rounded-lg p-3">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xl">{getOperationIcon(operation.type)}</span>
              <span className="bg-purple-600 text-white px-2 py-1 rounded text-sm font-medium">
                {operation.type.toUpperCase()}
              </span>
              <span className="text-purple-200 font-medium">
                {operationNames[operation.type] || operation.description}
              </span>
            </div>

            {/* Operation details */}
            <div className="text-sm text-purple-300 space-y-1">
              {operation.value !== undefined && (
                <div>Value: {formatValue(operation.value, 'stack')}</div>
              )}
              {operation.priority !== undefined && priority && (
                <div>Priority: {operation.priority}</div>
              )}
              {operation.position !== undefined && (
                <div>Position: {operation.position}</div>
              )}
              {operation.result !== undefined && (
                <div className="text-green-300">Result: {formatValue(operation.result, 'stack')}</div>
              )}
              {operation.description && (
                <div className="mt-1 text-purple-200">{operation.description}</div>
              )}
              {operation.complexity && (
                <div className="text-xs text-purple-400">
                  Time: {operation.complexity.time} | Space: {operation.complexity.space}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Display stack/queue statistics
 */
function StackQueueStatistics({ elements, capacity, size, type, overflow, underflow, priority }) {
  const utilization = capacity > 0 ? Math.round((size / capacity) * 100) : 0;
  const isEmpty = size === 0;
  const isFull = size >= capacity;

  // Calculate priority statistics if applicable
  const priorityStats = priority && elements.length > 0 ? {
    avgPriority: Math.round(elements.reduce((sum, el) => sum + (el?.priority || 0), 0) / elements.length * 100) / 100,
    maxPriority: Math.max(...elements.map(el => el?.priority || 0)),
    minPriority: Math.min(...elements.map(el => el?.priority || 0))
  } : null;

  const stats = [
    { label: 'Size', value: size, color: 'blue' },
    { label: 'Capacity', value: capacity, color: 'green' },
    { label: 'Utilization', value: `${utilization}%`, color: 'yellow' },
    {
      label: 'Status',
      value: overflow ? 'Overflow' : underflow ? 'Underflow' : isEmpty ? 'Empty' : isFull ? 'Full' : 'Available',
      color: overflow || underflow ? 'red' : isEmpty ? 'orange' : isFull ? 'orange' : 'green'
    }
  ];

  // Add priority statistics if applicable
  if (priorityStats) {
    stats.push(
      { label: 'Avg Priority', value: priorityStats.avgPriority, color: 'purple' },
      { label: 'Max Priority', value: priorityStats.maxPriority, color: 'red' },
      { label: 'Min Priority', value: priorityStats.minPriority, color: 'blue' }
    );
  }

  return (
    <div className="space-y-4">
      {/* Main statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {stats.slice(0, 4).map((stat, index) => (
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

      {/* Priority statistics */}
      {priorityStats && (
        <div className="bg-purple-900/20 border border-purple-600 rounded-lg p-4">
          <h4 className="text-purple-300 font-semibold mb-3 flex items-center">
            <span className="mr-2">📊</span>
            Priority Statistics
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            {stats.slice(4).map((stat, index) => (
              <div key={index} className="bg-purple-800/30 rounded-lg p-3">
                <div className={`text-${stat.color}-400 text-sm font-semibold`}>
                  {stat.label}
                </div>
                <div className={`text-lg font-bold text-${stat.color}-300`}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Operation complexity information */}
      <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
        <h4 className="text-blue-300 font-semibold mb-3 flex items-center">
          <span className="mr-2">⏱️</span>
          Operation Complexity
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {type === 'stack' && (
            <>
              <div className="text-center">
                <div className="text-blue-400 font-medium">Push</div>
                <div className="text-blue-300">O(1)</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-medium">Pop</div>
                <div className="text-blue-300">O(1)</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-medium">Peek</div>
                <div className="text-blue-300">O(1)</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-medium">Space</div>
                <div className="text-blue-300">O(n)</div>
              </div>
            </>
          )}
          {type === 'queue' && !priority && (
            <>
              <div className="text-center">
                <div className="text-blue-400 font-medium">Enqueue</div>
                <div className="text-blue-300">O(1)</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-medium">Dequeue</div>
                <div className="text-blue-300">O(1)</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-medium">Peek</div>
                <div className="text-blue-300">O(1)</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-medium">Space</div>
                <div className="text-blue-300">O(n)</div>
              </div>
            </>
          )}
          {priority && (
            <>
              <div className="text-center">
                <div className="text-blue-400 font-medium">Insert</div>
                <div className="text-blue-300">O(log n)</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-medium">Extract</div>
                <div className="text-blue-300">O(log n)</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-medium">Peek</div>
                <div className="text-blue-300">O(1)</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-medium">Space</div>
                <div className="text-blue-300">O(n)</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default withErrorBoundary(StackQueueVisualizer);