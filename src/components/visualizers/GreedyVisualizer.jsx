import React, { useState, useEffect } from 'react';
import BaseVisualizer from './BaseVisualizer';
import { validateVisualizationData } from '../../utils/dataValidation';

/**
 * Greedy Algorithm Visualizer Component
 * Handles fractional knapsack, activity selection, coin change, and other greedy algorithms
 */
const GreedyVisualizer = ({ data, stepData, title = "Greedy Algorithm Visualization" }) => {
  const [normalizedData, setNormalizedData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const normalized = normalizeGreedyData(data);
      console.log('GreedyVisualizer normalized data:', normalized);

      // Validate the normalized data
      const validation = validateVisualizationData(normalized, 'array');
      if (!validation.isValid) {
        console.warn('GreedyVisualizer validation warnings:', validation.errors);
        // Don't throw error for validation warnings, just log them
      }

      setNormalizedData(normalized);
      setError(null);
    } catch (err) {
      console.error('GreedyVisualizer error:', err);
      setError(err);
      setNormalizedData(null);
    }
  }, [data]);

  if (error) {
    return (
      <BaseVisualizer data={data} stepData={stepData} title={title}>
        <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 text-center">
          <div className="text-red-400 text-lg mb-2">❌</div>
          <h3 className="text-red-300 font-semibold mb-2">Greedy Data Error</h3>
          <p className="text-red-200 text-sm">{error.message}</p>
        </div>
      </BaseVisualizer>
    );
  }

  if (!normalizedData) {
    return (
      <BaseVisualizer data={data} stepData={stepData} title={title}>
        <div className="flex justify-center items-center min-h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </BaseVisualizer>
    );
  }

  return (
    <BaseVisualizer data={normalizedData} stepData={stepData} title={title}>
      <div className="p-4">
        <GreedyChoiceDisplay
          items={normalizedData.items}
          selectedItems={normalizedData.selectedItems}
          sortCriteria={normalizedData.sortCriteria}
        />

        <ItemsList
          items={normalizedData.items}
          selectedItems={normalizedData.selectedItems}
        />

        {normalizedData.steps && normalizedData.steps.length > 0 && (
          <StepsDisplay steps={normalizedData.steps} />
        )}

        {normalizedData.results && (
          <ResultsDisplay results={normalizedData.results} />
        )}
      </div>
    </BaseVisualizer>
  );
};

/**
 * Greedy choice visualization component
 */
const GreedyChoiceDisplay = ({ items, selectedItems, sortCriteria }) => {
  const maxValue = Math.max(...items.map(item =>
    Math.max(item.value || 0, item.weight || 0, item.ratio || 0)
  ));

  return (
    <div className="mb-6">
      <h4 className="text-gray-300 font-medium mb-3">
        Greedy Selection Process
        {sortCriteria && (
          <span className="ml-2 text-sm text-blue-400">
            (Sorted by: {sortCriteria})
          </span>
        )}
      </h4>
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="space-y-2">
          {items.map((item, index) => {
            const isSelected = selectedItems && selectedItems.includes(index);
            const isPartiallySelected = item.selectedAmount && item.selectedAmount < (item.weight || item.amount || 1);

            return (
              <div
                key={index}
                className={`p-3 rounded-lg border-2 transition-all ${isSelected
                  ? 'bg-green-900/30 border-green-500'
                  : isPartiallySelected
                    ? 'bg-yellow-900/30 border-yellow-500'
                    : 'bg-gray-700 border-gray-600'
                  }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {item.name || `Item ${index + 1}`}
                      </div>
                      <div className="text-sm text-gray-400 space-x-4">
                        {item.value !== undefined && (
                          <span>Value: {item.value}</span>
                        )}
                        {item.weight !== undefined && (
                          <span>Weight: {item.weight}</span>
                        )}
                        {item.ratio !== undefined && (
                          <span>Ratio: {item.ratio.toFixed(2)}</span>
                        )}
                        {item.time !== undefined && (
                          <span>Time: {item.time}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {item.selectedAmount !== undefined && (
                      <div className="text-sm">
                        <span className="text-gray-400">Amount: </span>
                        <span className="text-yellow-400">{item.selectedAmount}</span>
                        <span className="text-gray-400">/{item.weight || item.amount}</span>
                      </div>
                    )}
                    <div className={`w-4 h-4 rounded-full ${isSelected ? 'bg-green-500' :
                      isPartiallySelected ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                  </div>
                </div>

                {/* Visual bar for ratios or values */}
                {(item.ratio !== undefined || item.value !== undefined) && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${isSelected ? 'bg-green-500' :
                          isPartiallySelected ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}
                        style={{
                          width: `${((item.ratio || item.value || 0) / maxValue) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * Items list display component
 */
const ItemsList = ({ items, selectedItems }) => (
  <div className="mb-4">
    <h5 className="text-gray-300 font-medium mb-2">Items Summary</h5>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((item, index) => {
        const isSelected = selectedItems && selectedItems.includes(index);

        return (
          <div
            key={index}
            className={`p-3 rounded border ${isSelected
              ? 'bg-green-900/30 border-green-600'
              : 'bg-gray-700 border-gray-600'
              }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-white">
                {item.name || `Item ${index + 1}`}
              </span>
              {isSelected && (
                <span className="text-green-400 text-sm">✓ Selected</span>
              )}
            </div>

            <div className="space-y-1 text-sm">
              {item.value !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Value:</span>
                  <span className="text-blue-400">{item.value}</span>
                </div>
              )}
              {item.weight !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Weight:</span>
                  <span className="text-blue-400">{item.weight}</span>
                </div>
              )}
              {item.ratio !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Ratio:</span>
                  <span className="text-yellow-400">{item.ratio.toFixed(2)}</span>
                </div>
              )}
              {item.time !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Time:</span>
                  <span className="text-blue-400">{item.time}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/**
 * Steps display component
 */
const StepsDisplay = ({ steps }) => (
  <div className="mt-6 p-3 bg-gray-800 rounded-lg">
    <h5 className="text-gray-300 font-medium mb-3">Algorithm Steps</h5>
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start space-x-3">
          <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
            {index + 1}
          </span>
          <div className="flex-1">
            <div className="text-gray-300">{step.description}</div>
            {step.choice && (
              <div className="text-blue-400 text-sm mt-1">
                Choice: {step.choice}
              </div>
            )}
            {step.reasoning && (
              <div className="text-gray-400 text-sm mt-1">
                Reasoning: {step.reasoning}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Results display component
 */
const ResultsDisplay = ({ results }) => (
  <div className="mt-6 p-4 bg-green-900/30 border border-green-600 rounded-lg">
    <h5 className="text-green-300 font-medium mb-3">Final Results</h5>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Object.entries(results).map(([key, value]) => (
        <div key={key} className="text-center">
          <div className="text-2xl font-bold text-green-400">{value}</div>
          <div className="text-sm text-gray-400 capitalize">
            {key.replace(/([A-Z])/g, ' $1')}
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Normalize various greedy data formats into a consistent structure
 */
function normalizeGreedyData(data) {
  console.log('normalizeGreedyData input:', data);

  if (!data) {
    return {
      items: [],
      selectedItems: null,
      sortCriteria: null,
      steps: [],
      results: null
    };
  }

  // If already in the correct format
  if (data.items && Array.isArray(data.items)) {
    return {
      items: data.items.map(normalizeGreedyItem),
      selectedItems: data.selectedItems || data.selected || null,
      sortCriteria: data.sortCriteria || data.criteria || null,
      steps: data.steps || [],
      results: data.results || null
    };
  }

  // Handle visualization steps format
  if (data.type === 'greedy' && data.data) {
    return normalizeGreedyData(data.data);
  }

  // Handle array of items directly
  if (Array.isArray(data)) {
    return {
      items: data.map(normalizeGreedyItem),
      selectedItems: null,
      sortCriteria: null,
      steps: [],
      results: null
    };
  }

  // Handle knapsack format
  if (data.knapsack || data.capacity !== undefined) {
    const items = data.items || data.knapsack || [];
    return {
      items: items.map(normalizeGreedyItem),
      selectedItems: data.selectedItems || data.solution || null,
      sortCriteria: data.sortCriteria || 'value/weight ratio',
      steps: data.steps || [],
      results: {
        totalValue: data.totalValue || data.value || 0,
        totalWeight: data.totalWeight || data.weight || 0,
        capacity: data.capacity || 0,
        ...data.results
      }
    };
  }

  // Handle activity selection format
  if (data.activities || data.events) {
    const activities = data.activities || data.events;
    return {
      items: activities.map(normalizeGreedyItem),
      selectedItems: data.selectedActivities || data.selected || null,
      sortCriteria: data.sortCriteria || 'finish time',
      steps: data.steps || [],
      results: data.results || null
    };
  }

  // Handle coin change format
  if (data.coins || data.denominations) {
    const coins = data.coins || data.denominations;
    return {
      items: coins.map((coin, index) => normalizeGreedyItem({
        value: coin,
        name: `Coin ${coin}`,
        count: data.coinCounts ? data.coinCounts[index] : undefined
      })),
      selectedItems: data.selectedCoins || null,
      sortCriteria: 'largest denomination first',
      steps: data.steps || [],
      results: {
        totalCoins: data.totalCoins || 0,
        amount: data.amount || data.target || 0,
        ...data.results
      }
    };
  }

  // Fallback with empty items
  console.warn('Could not normalize greedy data, using fallback:', data);
  return {
    items: [],
    selectedItems: null,
    sortCriteria: null,
    steps: [],
    results: null
  };
}

/**
 * Normalize a greedy item to consistent format
 */
function normalizeGreedyItem(item) {
  if (typeof item === 'number') {
    return {
      value: item,
      weight: undefined,
      ratio: undefined,
      time: undefined,
      name: undefined,
      selectedAmount: undefined
    };
  }

  if (typeof item === 'object' && item !== null) {
    const value = item.value || item.profit || item.benefit || 0;
    const weight = item.weight || item.cost || item.size || item.duration || undefined;
    const ratio = (weight && weight > 0) ? value / weight : undefined;

    return {
      value: value,
      weight: weight,
      ratio: ratio,
      time: item.time || item.start || item.finish || undefined,
      name: item.name || item.id || item.label || undefined,
      selectedAmount: item.selectedAmount || item.amount || undefined
    };
  }

  if (Array.isArray(item)) {
    const value = item[0] || 0;
    const weight = item[1] || undefined;
    const ratio = (weight && weight > 0) ? value / weight : undefined;

    return {
      value: value,
      weight: weight,
      ratio: ratio,
      time: item[2] || undefined,
      name: item[3] || undefined,
      selectedAmount: undefined
    };
  }

  return {
    value: 0,
    weight: undefined,
    ratio: undefined,
    time: undefined,
    name: undefined,
    selectedAmount: undefined
  };
}

export default GreedyVisualizer;
