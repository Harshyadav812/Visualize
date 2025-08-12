import React, { useState, memo, useMemo, useCallback } from 'react';
import VisualizationEngine from './VisualizationEngine';
import VisualizationControls from './VisualizationControls';
import DraggableControls from './DraggableControls';
import { ProgressBar } from './LoadingIndicators';
import { Cog6ToothIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

/**
 * Extract line numbers from codeHighlight data
 */
function getHighlightedLineNumbers(codeHighlight) {
  if (!codeHighlight) return [];

  // If codeHighlight contains line numbers (e.g., "7, 17" or "line 5")
  const lineNumberMatch = codeHighlight.match(/(\d+)/g);
  if (lineNumberMatch) {
    // Remove duplicates and sort line numbers, convert to 0-based index
    return [...new Set(lineNumberMatch.map(num => parseInt(num) - 1))]
      .sort((a, b) => a - b)
      .filter(lineNum => lineNum >= 0);
  }

  return [];
}

/**
 * Render code with highlighted lines using dark theme design tokens
 */
function renderCodeWithHighlights(originalCode, highlightedLines) {
  if (!originalCode) return null;

  const codeLines = originalCode.split('\n');
  const highlightedSet = new Set(highlightedLines);

  return codeLines.map((line, index) => {
    const isHighlighted = highlightedSet.has(index);
    return (
      <div
        key={index}
        className={`relative ${isHighlighted
          ? 'bg-accent-primary/10 border-l-2 border-accent-primary pl-3 -ml-1'
          : ''
          } transition-colors duration-200 hover:bg-surface-secondary/30`}
        style={{
          backgroundColor: isHighlighted ? 'var(--color-accent-primary)' + '20' : 'transparent',
          borderLeftColor: isHighlighted ? 'var(--color-accent-primary)' : 'transparent',
        }}
      >
        <span
          className="select-none mr-4 inline-block w-8 text-right font-mono text-xs leading-relaxed"
          style={{
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-family-mono)'
          }}
        >
          {index + 1}
        </span>
        <span
          className={`font-mono text-sm leading-relaxed ${isHighlighted ? 'font-medium' : ''}`}
          style={{
            color: isHighlighted ? 'var(--color-text-primary)' : 'var(--color-code-text)',
            fontFamily: 'var(--font-family-mono)',
            fontSize: 'var(--font-size-sm)',
            lineHeight: 'var(--line-height-relaxed)'
          }}
        >
          {line || '\u00A0'}
        </span>
      </div>
    );
  });
}

const AlgorithmVisualizer = memo(function AlgorithmVisualizer({ analysis, originalCode }) {
  const [currentStep, setCurrentStep] = useState(0);
  // Show code by default so students always see highlighted execution context
  const [showCode, setShowCode] = useState(true);
  const [condensed, setCondensed] = useState(true);
  // Controls state
  const [showControls, setShowControls] = useState(true);
  const [controlsPosition, setControlsPosition] = useState({ x: 20, y: 20 });
  const [isDraggableMode, setIsDraggableMode] = useState(false);

  const steps = useMemo(() => analysis.steps || [], [analysis.steps]);
  const currentStepData = useMemo(() => steps[currentStep], [steps, currentStep]);

  const handleStepChange = useCallback((s) => setCurrentStep(s), []);
  const handleReset = useCallback(() => setCurrentStep(0), []);
  const toggleCode = useCallback(() => setShowCode(p => !p), []);
  const toggleCondensed = useCallback(() => setCondensed(p => !p), []);
  const toggleControls = useCallback(() => setShowControls(prev => !prev), []);
  const toggleDraggableMode = useCallback(() => setIsDraggableMode(prev => !prev), []);

  if (!steps.length) {
    return <div className="text-center text-gray-400 py-8">No visualization steps available</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 bg-surface-primary border-b border-surface-tertiary px-2 py-2 md:px-4 md:py-2">
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center space-x-2 md:space-x-3">
            <span className="text-xs md:text-sm text-text-secondary">Step {currentStep + 1} of {steps.length}</span>
            {currentStepData?.title && <span className="text-xs md:text-sm font-medium text-accent-primary truncate">{currentStepData.title}</span>}
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={toggleControls} className="flex items-center gap-1 text-xs px-2 py-1 text-text-tertiary hover:text-text-primary transition-colors border border-surface-tertiary rounded" title="Toggle controls visibility">
              {showControls ? <EyeSlashIcon className="w-3 h-3" /> : <EyeIcon className="w-3 h-3" />}
              {showControls ? 'Hide Controls' : 'Show Controls'}
            </button>
            {showControls && (
              <button onClick={toggleDraggableMode} className="flex items-center gap-1 text-xs px-2 py-1 text-text-tertiary hover:text-text-primary transition-colors border border-surface-tertiary rounded" title="Toggle draggable mode">
                <Cog6ToothIcon className="w-3 h-3" />
                {isDraggableMode ? 'Fixed' : 'Draggable'}
              </button>
            )}
            {originalCode && <button onClick={toggleCode} className="text-xs px-2 py-1 text-text-tertiary hover:text-text-primary transition-colors">{showCode ? 'Hide Code' : 'Show Code'}</button>}
            <button onClick={toggleCondensed} className="text-xs px-2 py-1 text-text-tertiary hover:text-text-primary transition-colors" title="Toggle condensed descriptions">{condensed ? 'Expand Text' : 'Full Text'}</button>
          </div>
        </div>
        <div className="mt-2">
          <ProgressBar progress={((currentStep + 1) / steps.length) * 100} size="sm" variant="primary" className="w-full" />
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 relative">
          {currentStepData?.visualization ? (
            <div className="h-full p-4">
              <VisualizationEngine analysis={analysis} currentStep={currentStep} onStepChange={handleStepChange} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-text-muted">No visualization available for this step</div>
          )}
        </div>
        {(currentStepData?.description || Object.keys(currentStepData?.variableStates || {}).length > 0) && (
          <div className="border-t border-surface-tertiary bg-surface-secondary/70 backdrop-blur-sm px-3 py-2 space-y-2">
            {currentStepData?.description && (
              <p className="text-xs md:text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                {condensed && currentStepData.description.length > 280 ? currentStepData.description.slice(0, 280) + '…' : currentStepData.description}
              </p>
            )}
            {Object.keys(currentStepData?.variableStates || {}).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(currentStepData.variableStates).map(([k, v]) => (
                  <div key={k} className="px-2 py-1 rounded bg-surface-primary border border-surface-tertiary text-[10px] md:text-xs font-mono">
                    <span className="text-text-tertiary mr-1">{k}=</span>
                    <span className="text-accent-secondary">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls Section - Can be draggable or fixed */}
      {showControls && (
        <>
          {isDraggableMode ? (
            <DraggableControls
              initialPosition={controlsPosition}
              onPositionChange={setControlsPosition}
              className="min-w-80"
            >
              <VisualizationControls
                currentStep={currentStep}
                totalSteps={steps.length}
                onStepChange={handleStepChange}
                onReset={handleReset}
              />
            </DraggableControls>
          ) : (
            <div className="flex-shrink-0 border-t border-surface-tertiary">
              <VisualizationControls
                currentStep={currentStep}
                totalSteps={steps.length}
                onStepChange={handleStepChange}
                onReset={handleReset}
              />
            </div>
          )}
        </>
      )}

      {showCode && originalCode && (
        <div className="border-t border-surface-tertiary bg-surface-primary/90 backdrop-blur-sm p-3 md:p-4 max-h-72 overflow-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-text-primary">Code (highlighted)</h3>
            <button onClick={toggleCode} className="text-text-tertiary hover:text-text-primary text-xs">Hide</button>
          </div>
          <pre className="overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-surface-tertiary" style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-relaxed)', color: 'var(--color-code-text)', margin: 0, padding: 0 }}>
            {renderCodeWithHighlights(originalCode, getHighlightedLineNumbers(currentStepData?.codeHighlight))}
          </pre>
        </div>
      )}
    </div>
  );
});

export default AlgorithmVisualizer;

