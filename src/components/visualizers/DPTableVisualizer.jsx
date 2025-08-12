import React, { memo } from 'react';
import BaseVisualizer, { withErrorBoundary } from './BaseVisualizer';

/**
 * DPTableVisualizer
 * Visualizer for dynamic programming tables / matrices.
 * Robustly normalizes various AI-produced schemas to a matrix form.
 */
function DPTableVisualizer({ data, stepData, title = 'DP Table', mode = 'default' }) {
  const normalized = normalizeDPData(data);

  if (!normalized.matrix || normalized.matrix.length === 0) {
    return (
      <BaseVisualizer data={data} stepData={stepData} title={title}>
        <div className="text-gray-400 text-sm p-4">No DP table data available.</div>
      </BaseVisualizer>
    );
  }

  const { matrix, highlights } = normalized;
  const rows = matrix.length;
  const cols = Math.max(...matrix.map(r => r.length));
  const isLarge = rows * cols > 400; // heuristic threshold
  const truncated = isLarge ? truncateMatrix(matrix, 20, 20) : matrix;

  return (
    <BaseVisualizer data={data} stepData={stepData} title={title}>
      <div className="space-y-4">
        {isLarge && (
          <div className="text-xs text-yellow-300 bg-yellow-900/30 border border-yellow-700 rounded p-2">
            Large DP table ({rows} x {cols}) truncated to 20 x 20 for performance.
          </div>
        )}
        <div className="dp-table-wrapper overflow-auto max-h-[480px] rounded">
          <table className="border-collapse text-xs">
            <tbody>
              {truncated.map((row, r) => (
                <tr key={r}>
                  {row.map((value, c) => {
                    const state = getCellState(r, c, highlights);
                    return (
                      <td
                        key={c}
                        className={`dp-cell w-10 h-10 text-center align-middle border border-gray-700 font-mono ${cellStateClass(state)}`}
                        title={`(${r},${c}) = ${value}`}
                      >
                        {formatValue(value)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DPCellLegend />
      </div>
    </BaseVisualizer>
  );
}

function normalizeDPData(data) {
  if (!data || typeof data !== 'object') return { matrix: [] };
  if (Array.isArray(data.matrix)) return { matrix: coerceMatrix(data.matrix), highlights: data.highlights || {} };
  if (Array.isArray(data.table)) return { matrix: coerceMatrix(data.table), highlights: data.highlights || {} };
  if (Array.isArray(data.dp)) return { matrix: coerceMatrix(data.dp), highlights: data.highlights || {} };
  if (Array.isArray(data.values) && Array.isArray(data.values[0])) return { matrix: coerceMatrix(data.values), highlights: data.highlights || {} };
  if (Array.isArray(data.rows) && Array.isArray(data.cols) && Array.isArray(data.values)) return { matrix: coerceMatrix(data.values), highlights: data.highlights || {} };
  if (Array.isArray(data.cells)) {
    const maxRow = Math.max(...data.cells.map(c => c.row));
    const maxCol = Math.max(...data.cells.map(c => c.col));
    const matrix = Array.from({ length: maxRow + 1 }, () => Array(maxCol + 1).fill(null));
    data.cells.forEach(cell => {
      if (cell && cell.row >= 0 && cell.col >= 0) matrix[cell.row][cell.col] = cell.value;
    });
    return { matrix, highlights: data.highlights || {} };
  }
  for (const key of Object.keys(data)) {
    if (Array.isArray(data[key]) && Array.isArray(data[key][0])) {
      return { matrix: coerceMatrix(data[key]), highlights: data.highlights || {} };
    }
  }
  return { matrix: [], highlights: data.highlights || {} };
}

function coerceMatrix(m) {
  return m.map(r => {
    const rowArr = Array.isArray(r) ? r : [r];
    return rowArr.map(v => (typeof v === 'number' && Number.isFinite(v)) ? v : (v === 0 ? 0 : (typeof v === 'number' ? null : v)));
  });
}
function truncateMatrix(m, mr, mc) { return m.slice(0, mr).map(r => r.slice(0, mc)); }
function getCellState(r, c, h = {}) {
  if (h.current && h.current.row === r && h.current.col === c) return 'current';
  if (Array.isArray(h.updating) && h.updating.some(p => p.row === r && p.col === c)) return 'updating';
  if (Array.isArray(h.path) && h.path.some(p => p.row === r && p.col === c)) return 'path';
  return 'normal';
}
function cellStateClass(s) {
  switch (s) {
    case 'current': return 'bg-yellow-500 text-black font-bold';
    case 'updating': return 'bg-blue-600 text-white';
    case 'path': return 'bg-green-600 text-white';
    default: return 'bg-gray-800 text-gray-200';
  }
}
function formatValue(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) return '';
    return Number.isInteger(v) ? v : v.toFixed(2);
  }
  if (typeof v === 'string') return v.length > 5 ? v.slice(0, 5) + '…' : v;
  return String(v);
}
const DPCellLegend = memo(function DPCellLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-gray-300">
      <LegendBadge colorClass="bg-yellow-500 text-black" label="Current" />
      <LegendBadge colorClass="bg-blue-600 text-white" label="Updating" />
      <LegendBadge colorClass="bg-green-600 text-white" label="Path" />
      <LegendBadge colorClass="bg-gray-800 text-gray-300" label="Default" />
    </div>
  );
});
function LegendBadge({ colorClass, label }) { return <div className="flex items-center space-x-1"><span className={`w-4 h-4 rounded ${colorClass} border border-gray-600`}></span><span>{label}</span></div>; }
const DPTableVisualizerMemo = memo(DPTableVisualizer);
export default withErrorBoundary(DPTableVisualizerMemo);
