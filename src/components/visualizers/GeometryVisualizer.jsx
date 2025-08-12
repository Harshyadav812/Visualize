import React, { useState, useEffect } from 'react';
import BaseVisualizer from './BaseVisualizer';
import { validateVisualizationData } from '../../utils/dataValidation';

/**
 * Geometry Algorithm Visualizer Component
 * Handles points, lines, polygons, convex hull, and other geometric algorithms
 */
const GeometryVisualizer = ({ data, stepData, title = "Geometry Algorithm Visualization" }) => {
  const [normalizedData, setNormalizedData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const normalized = normalizeGeometryData(data);
      console.log('GeometryVisualizer normalized data:', normalized);

      // Validate the normalized data
      const validation = validateVisualizationData(normalized, 'array');
      if (!validation.isValid) {
        console.warn('GeometryVisualizer validation warnings:', validation.errors);
        // Don't throw error for validation warnings, just log them
      }

      setNormalizedData(normalized);
      setError(null);
    } catch (err) {
      console.error('GeometryVisualizer error:', err);
      setError(err);
      setNormalizedData(null);
    }
  }, [data]);

  if (error) {
    return (
      <BaseVisualizer data={data} stepData={stepData} title={title}>
        <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 text-center">
          <div className="text-red-400 text-lg mb-2">❌</div>
          <h3 className="text-red-300 font-semibold mb-2">Geometry Data Error</h3>
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
        <GeometryCanvas
          points={normalizedData.points}
          lines={normalizedData.lines || []}
          polygons={normalizedData.polygons || []}
          width={normalizedData.canvasWidth || 400}
          height={normalizedData.canvasHeight || 300}
        />

        <PointsList points={normalizedData.points} />

        {normalizedData.calculations && normalizedData.calculations.length > 0 && (
          <CalculationsDisplay calculations={normalizedData.calculations} />
        )}
      </div>
    </BaseVisualizer>
  );
};

/**
 * Geometry canvas component for visual display
 */
const GeometryCanvas = ({ points, lines, polygons, width, height }) => {
  // Calculate bounds and scale
  const margin = 20;
  const bounds = calculateBounds(points);
  const scaleX = (width - 2 * margin) / (bounds.maxX - bounds.minX || 1);
  const scaleY = (height - 2 * margin) / (bounds.maxY - bounds.minY || 1);
  const scale = Math.min(scaleX, scaleY);

  const transformX = (x) => margin + (x - bounds.minX) * scale;
  const transformY = (y) => margin + (y - bounds.minY) * scale;

  return (
    <div className="mb-4">
      <h4 className="text-gray-300 font-medium mb-3">Geometric Visualization</h4>
      <div className="bg-gray-800 p-4 rounded-lg">
        <svg width={width} height={height} className="border border-gray-600 bg-gray-900">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Polygons */}
          {polygons.map((polygon, index) => (
            <polygon
              key={`polygon-${index}`}
              points={polygon.map(p => `${transformX(p.x)},${transformY(p.y)}`).join(' ')}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="#3b82f6"
              strokeWidth="2"
            />
          ))}

          {/* Lines */}
          {lines.map((line, index) => (
            <line
              key={`line-${index}`}
              x1={transformX(line.start.x)}
              y1={transformY(line.start.y)}
              x2={transformX(line.end.x)}
              y2={transformY(line.end.y)}
              stroke="#10b981"
              strokeWidth="2"
            />
          ))}

          {/* Points */}
          {points.map((point, index) => (
            <g key={`point-${index}`}>
              <circle
                cx={transformX(point.x)}
                cy={transformY(point.y)}
                r="4"
                fill={point.highlighted ? "#ef4444" : "#3b82f6"}
                stroke="#ffffff"
                strokeWidth="1"
              />
              <text
                x={transformX(point.x)}
                y={transformY(point.y) - 8}
                textAnchor="middle"
                className="text-xs fill-gray-300"
              >
                {point.label || index}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

/**
 * Points list display component
 */
const PointsList = ({ points }) => (
  <div className="mb-4">
    <h5 className="text-gray-300 font-medium mb-2">Points</h5>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {points.map((point, index) => (
        <div
          key={index}
          className={`p-2 rounded border ${point.highlighted
            ? 'bg-red-900/30 border-red-600'
            : 'bg-gray-700 border-gray-600'
            }`}
        >
          <div className="text-xs text-gray-400">
            {point.label || `P${index}`}
          </div>
          <div className="font-mono text-sm text-blue-400">
            ({point.x}, {point.y})
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Calculations display component
 */
const CalculationsDisplay = ({ calculations }) => (
  <div className="mt-4 p-3 bg-gray-800 rounded-lg">
    <h5 className="text-gray-300 font-medium mb-3">Calculations</h5>
    <div className="space-y-2">
      {calculations.map((calc, index) => (
        <div key={index} className="p-2 bg-gray-700 rounded">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">{calc.operation}</span>
            <span className="text-green-400 font-mono">{calc.result}</span>
          </div>
          {calc.formula && (
            <div className="text-xs text-gray-400 mt-1 font-mono">{calc.formula}</div>
          )}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Calculate bounds for scaling
 */
function calculateBounds(points) {
  if (points.length === 0) {
    return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
  }

  let minX = points[0].x;
  let maxX = points[0].x;
  let minY = points[0].y;
  let maxY = points[0].y;

  points.forEach(point => {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  });

  // Add some padding
  const paddingX = (maxX - minX) * 0.1 || 1;
  const paddingY = (maxY - minY) * 0.1 || 1;

  return {
    minX: minX - paddingX,
    maxX: maxX + paddingX,
    minY: minY - paddingY,
    maxY: maxY + paddingY
  };
}

/**
 * Normalize various geometry data formats into a consistent structure
 */
function normalizeGeometryData(data) {
  console.log('normalizeGeometryData input:', data);

  if (!data) {
    return {
      points: [],
      lines: [],
      polygons: [],
      calculations: [],
      canvasWidth: 400,
      canvasHeight: 300
    };
  }

  // If already in the correct format
  if (data.points && Array.isArray(data.points)) {
    return {
      points: data.points.map(normalizePoint),
      lines: (data.lines || []).map(normalizeLine),
      polygons: (data.polygons || []).map(polygon =>
        polygon.map(normalizePoint)
      ),
      calculations: data.calculations || [],
      canvasWidth: data.canvasWidth || 400,
      canvasHeight: data.canvasHeight || 300
    };
  }

  // Handle visualization steps format
  if (data.type === 'geometry' && data.data) {
    return normalizeGeometryData(data.data);
  }

  // Handle array of points
  if (Array.isArray(data)) {
    return {
      points: data.map(normalizePoint),
      lines: [],
      polygons: [],
      calculations: [],
      canvasWidth: 400,
      canvasHeight: 300
    };
  }

  // Handle convex hull format
  if (data.hull || data.convexHull) {
    const allPoints = data.points || data.hull || data.convexHull;
    const hullPoints = data.hull || data.convexHull;

    return {
      points: allPoints.map(normalizePoint),
      lines: [],
      polygons: [hullPoints.map(normalizePoint)],
      calculations: data.calculations || [],
      canvasWidth: 400,
      canvasHeight: 300
    };
  }

  // Handle line segment algorithms
  if (data.segments || data.lines) {
    const segments = data.segments || data.lines;
    const points = [];
    const lines = [];

    segments.forEach(segment => {
      const line = normalizeLine(segment);
      lines.push(line);
      points.push(line.start, line.end);
    });

    return {
      points: points,
      lines: lines,
      polygons: [],
      calculations: data.calculations || [],
      canvasWidth: 400,
      canvasHeight: 300
    };
  }

  // Handle single point or coordinate
  if (data.x !== undefined && data.y !== undefined) {
    return {
      points: [normalizePoint(data)],
      lines: [],
      polygons: [],
      calculations: [],
      canvasWidth: 400,
      canvasHeight: 300
    };
  }

  // Fallback with empty data
  console.warn('Could not normalize geometry data, using fallback:', data);
  return {
    points: [],
    lines: [],
    polygons: [],
    calculations: [],
    canvasWidth: 400,
    canvasHeight: 300
  };
}

/**
 * Normalize a point to consistent format
 */
function normalizePoint(point) {
  if (Array.isArray(point)) {
    return {
      x: point[0] || 0,
      y: point[1] || 0,
      label: point[2] || null,
      highlighted: false
    };
  }

  if (typeof point === 'object' && point !== null) {
    return {
      x: point.x || 0,
      y: point.y || 0,
      label: point.label || point.name || null,
      highlighted: point.highlighted || false
    };
  }

  return { x: 0, y: 0, label: null, highlighted: false };
}

/**
 * Normalize a line to consistent format
 */
function normalizeLine(line) {
  if (Array.isArray(line) && line.length >= 2) {
    return {
      start: normalizePoint(line[0]),
      end: normalizePoint(line[1])
    };
  }

  if (line.start && line.end) {
    return {
      start: normalizePoint(line.start),
      end: normalizePoint(line.end)
    };
  }

  if (line.p1 && line.p2) {
    return {
      start: normalizePoint(line.p1),
      end: normalizePoint(line.p2)
    };
  }

  return {
    start: { x: 0, y: 0, label: null, highlighted: false },
    end: { x: 1, y: 1, label: null, highlighted: false }
  };
}

export default GeometryVisualizer;
