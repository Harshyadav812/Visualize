// Deterministic step reconstruction utilities (initial scaffold)
// Parses lightweight ops objects and produces derived state snapshots for visualizers.

/** Operation schema (initial minimal set)
 * { op: 'set'|'swap'|'compare'|'advance'|'window'|'push'|'pop', ds: 'array', indices?: number[], from?: number, to?: number, pointer?: string, value?: any }
 */

export function replayArrayOps(initialArray, ops) {
  const arr = [...initialArray];
  const snapshots = [];
  ops.forEach((o, idx) => {
    switch (o.op) {
      case 'set':
        if (typeof o.index === 'number') arr[o.index] = o.value; break;
      case 'swap':
        if (o.indices && o.indices.length === 2) {
          const [i, j] = o.indices;[arr[i], arr[j]] = [arr[j], arr[i]];
        }
        break;
      default:
        break;
    }
    snapshots.push({ step: idx, values: [...arr], op: o });
  });
  return snapshots;
}

export function buildStepVisualizationState(step, previousState = {}) {
  // If the step already includes visualization.data with arrays, keep it.
  if (step?.visualization?.data?.arrays) return step.visualization.data;
  // Attempt reconstruction from ops if present
  if (Array.isArray(step.ops) && step.base && Array.isArray(step.base.array)) {
    const snaps = replayArrayOps(step.base.array, step.ops);
    const last = snaps[snaps.length - 1];
    return { arrays: [{ name: step.base.name || 'arr', values: last?.values || [...step.base.array], highlights: {} }], pointers: [], operations: step.ops };
  }
  return previousState; // fallback
}

export function enrichAnalysisWithReconstruction(analysis) {
  if (!analysis || !Array.isArray(analysis.steps)) return analysis;
  let prev = {};
  analysis.steps = analysis.steps.map(s => {
    const data = buildStepVisualizationState(s, prev);
    if (data) prev = data; // carry forward
    if (!s.visualization) s.visualization = { type: (analysis.primaryDataStructure || 'array'), data };
    else if (!s.visualization.data && data) s.visualization.data = data;
    return s;
  });
  return analysis;
}

export default { replayArrayOps, buildStepVisualizationState, enrichAnalysisWithReconstruction };
