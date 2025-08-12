import React, { useState, useEffect } from 'react';
import BaseVisualizer from './BaseVisualizer';
import { validateVisualizationData } from '../../utils/dataValidation';

/**
 * Interval Algorithm Visualizer Component
 * Handles interval merging, scheduling, meeting rooms, and other interval-based algorithms
 */
const IntervalVisualizer = ({ data, stepData, title = "Interval Algorithm Visualization" }) => {
  const [normalizedData, setNormalizedData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const normalized = normalizeIntervalData(data);
      console.log('IntervalVisualizer normalized data:', normalized);

      // Validate the normalized data
      const validation = validateVisualizationData(normalized, 'array');
      if (!validation.isValid) {
        console.warn('IntervalVisualizer validation warnings:', validation.errors);
        // Don't throw error for validation warnings, just log them
      }

      setNormalizedData(normalized);
      setError(null);
    } catch (err) {
      console.error('IntervalVisualizer error:', err);
      setError(err);
      setNormalizedData(null);
    }
  }, [data]);

  if (error) {
    return (
      <BaseVisualizer data={data} stepData={stepData} title={title}>
        <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 text-center">
          <div className="text-red-400 text-lg mb-2">❌</div>
          <h3 className="text-red-300 font-semibold mb-2">Interval Data Error</h3>
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
        <IntervalTimeline
          intervals={normalizedData.intervals}
          mergedIntervals={normalizedData.mergedIntervals}
          conflicts={normalizedData.conflicts}
        />

        <IntervalsList intervals={normalizedData.intervals} />

        {normalizedData.mergedIntervals && normalizedData.mergedIntervals.length > 0 && (
          <MergedIntervalsList intervals={normalizedData.mergedIntervals} />
        )}

        {normalizedData.statistics && (
          <StatisticsDisplay statistics={normalizedData.statistics} />
        )}
      </div>
    </BaseVisualizer>
  );
};

/**
 * Interval timeline visualization component
 */
const IntervalTimeline = ({ intervals, mergedIntervals, conflicts }) => {
  const allIntervals = [...intervals, ...(mergedIntervals || [])];
  const minStart = Math.min(...allIntervals.map(i => i.start));
  const maxEnd = Math.max(...allIntervals.map(i => i.end));
  const range = maxEnd - minStart || 1;
  const timelineWidth = 600;
  const rowHeight = 40;

  const getPosition = (value) => ((value - minStart) / range) * timelineWidth;
  const getWidth = (start, end) => ((end - start) / range) * timelineWidth;

  return (
    <div className="mb-6">
      <h4 className="text-gray-300 font-medium mb-3">Interval Timeline</h4>
      <div className="bg-gray-800 p-4 rounded-lg overflow-x-auto">
        <svg width={timelineWidth + 40} height={(intervals.length + (mergedIntervals?.length || 0) + 2) * rowHeight}>
          {/* Timeline axis */}
          <line x1="20" y1="20" x2={timelineWidth + 20} y2="20" stroke="#6b7280" strokeWidth="2" />

          {/* Time markers */}
          {Array.from({ length: 11 }, (_, i) => {
            const value = minStart + (i / 10) * range;
            const x = 20 + (i / 10) * timelineWidth;
            return (
              <g key={i}>
                <line x1={x} y1="15" x2={x} y2="25" stroke="#6b7280" strokeWidth="1" />
                <text x={x} y="40" textAnchor="middle" className="text-xs fill-gray-400">
                  {Math.round(value * 10) / 10}
                </text>
              </g>
            );
          })}

          {/* Original intervals */}
          {intervals.map((interval, index) => {
            const y = 60 + index * rowHeight;
            const x = 20 + getPosition(interval.start);
            const width = getWidth(interval.start, interval.end);
            const isConflicted = conflicts && conflicts.includes(index);

            return (
              <g key={`interval-${index}`}>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height="25"
                  fill={isConflicted ? "#dc2626" : "#3b82f6"}
                  fillOpacity="0.7"
                  stroke={isConflicted ? "#f87171" : "#60a5fa"}
                  strokeWidth="2"
                  rx="3"
                />
                <text
                  x={x + width / 2}
                  y={y + 17}
                  textAnchor="middle"
                  className="text-xs fill-white font-medium"
                >
                  {interval.label || `I${index}`}
                </text>
                <text
                  x="10"
                  y={y + 17}
                  textAnchor="end"
                  className="text-xs fill-gray-400"
                >
                  {interval.label || `I${index}`}
                </text>
              </g>
            );
          })}

          {/* Merged intervals */}
          {mergedIntervals && mergedIntervals.map((interval, index) => {
            const y = 60 + intervals.length * rowHeight + index * rowHeight + 20;
            const x = 20 + getPosition(interval.start);
            const width = getWidth(interval.start, interval.end);

            return (
              <g key={`merged-${index}`}>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height="25"
                  fill="#10b981"
                  fillOpacity="0.7"
                  stroke="#34d399"
                  strokeWidth="2"
                  rx="3"
                />
                <text
                  x={x + width / 2}
                  y={y + 17}
                  textAnchor="middle"
                  className="text-xs fill-white font-medium"
                >
                  M{index}
                </text>
                <text
                  x="10"
                  y={y + 17}
                  textAnchor="end"
                  className="text-xs fill-gray-400"
                >
                  M{index}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

/**
 * Intervals list display component
 */
const IntervalsList = ({ intervals }) => (
  <div className="mb-4">
    <h5 className="text-gray-300 font-medium mb-2">Input Intervals</h5>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {intervals.map((interval, index) => (
        <div
          key={index}
          className={`p-3 rounded border ${interval.highlighted
            ? 'bg-blue-900/30 border-blue-600'
            : 'bg-gray-700 border-gray-600'
            }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">
              {interval.label || `Interval ${index + 1}`}
            </span>
            {interval.weight !== undefined && (
              <span className="text-xs text-yellow-400">
                Weight: {interval.weight}
              </span>
            )}
          </div>
          <div className="font-mono text-blue-400">
            [{interval.start}, {interval.end}]
          </div>
          {interval.description && (
            <div className="text-xs text-gray-400 mt-1">
              {interval.description}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Merged intervals list display component
 */
const MergedIntervalsList = ({ intervals }) => (
  <div className="mb-4">
    <h5 className="text-green-300 font-medium mb-2">Merged Intervals</h5>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {intervals.map((interval, index) => (
        <div
          key={index}
          className="p-3 rounded border bg-green-900/30 border-green-600"
        >
          <div className="text-xs text-gray-400">
            Merged {index + 1}
          </div>
          <div className="font-mono text-green-400">
            [{interval.start}, {interval.end}]
          </div>
          {interval.originalIntervals && (
            <div className="text-xs text-gray-400 mt-1">
              From: {interval.originalIntervals.join(', ')}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Statistics display component
 */
const StatisticsDisplay = ({ statistics }) => (
  <div className="mt-4 p-4 bg-gray-800 rounded-lg">
    <h5 className="text-gray-300 font-medium mb-3">Statistics</h5>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Object.entries(statistics).map(([key, value]) => (
        <div key={key} className="text-center">
          <div className="text-2xl font-bold text-blue-400">{value}</div>
          <div className="text-sm text-gray-400 capitalize">
            {key.replace(/([A-Z])/g, ' $1')}
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Normalize various interval data formats into a consistent structure
 */
function normalizeIntervalData(data) {
  console.log('normalizeIntervalData input:', data);

  if (!data) {
    return {
      intervals: [],
      mergedIntervals: null,
      conflicts: null,
      statistics: null
    };
  }

  // If already in the correct format
  if (data.intervals && Array.isArray(data.intervals)) {
    return {
      intervals: data.intervals.map(normalizeInterval),
      mergedIntervals: data.mergedIntervals ? data.mergedIntervals.map(normalizeInterval) : null,
      conflicts: data.conflicts || null,
      statistics: data.statistics || null
    };
  }

  // Handle visualization steps format
  if (data.type === 'interval' && data.data) {
    return normalizeIntervalData(data.data);
  }

  // Handle array of intervals
  if (Array.isArray(data)) {
    return {
      intervals: data.map(normalizeInterval),
      mergedIntervals: null,
      conflicts: null,
      statistics: null
    };
  }

  // Handle meeting rooms / scheduling format
  if (data.meetings || data.events || data.tasks) {
    const items = data.meetings || data.events || data.tasks;
    return {
      intervals: items.map(normalizeInterval),
      mergedIntervals: data.merged ? data.merged.map(normalizeInterval) : null,
      conflicts: data.conflicts || null,
      statistics: data.statistics || null
    };
  }

  // Handle single interval
  if ((data.start !== undefined && data.end !== undefined) ||
    (Array.isArray(data) && data.length === 2)) {
    return {
      intervals: [normalizeInterval(data)],
      mergedIntervals: null,
      conflicts: null,
      statistics: null
    };
  }

  // Fallback with empty intervals
  console.warn('Could not normalize interval data, using fallback:', data);
  return {
    intervals: [],
    mergedIntervals: null,
    conflicts: null,
    statistics: null
  };
}

/**
 * Normalize an interval to consistent format
 */
function normalizeInterval(interval) {
  // Handle array format [start, end]
  if (Array.isArray(interval)) {
    return {
      start: interval[0] || 0,
      end: interval[1] || 0,
      label: interval[2] || null,
      weight: interval[3] || undefined,
      description: null,
      highlighted: false
    };
  }

  // Handle object format
  if (typeof interval === 'object' && interval !== null) {
    return {
      start: interval.start !== undefined ? interval.start : (interval.begin || 0),
      end: interval.end !== undefined ? interval.end : (interval.finish || interval.start || 0),
      label: interval.label || interval.name || interval.id || null,
      weight: interval.weight || interval.priority || interval.value || undefined,
      description: interval.description || interval.title || null,
      highlighted: interval.highlighted || false
    };
  }

  // Fallback
  return {
    start: 0,
    end: 0,
    label: null,
    weight: undefined,
    description: null,
    highlighted: false
  };
}

export default IntervalVisualizer;
