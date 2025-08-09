import { useState } from 'react';
import VisualizationEngine from './VisualizationEngine';

export default function AlgorithmVisualizer({ analysis }) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = analysis.steps || [];

  if (!steps.length) {
    return (
      <div className="text-center text-gray-400 py-8">
        No visualization steps available
      </div>
    );
  }

  const currentStepData = steps[currentStep];

  return (
    <div className="space-y-4">
      {/* Step Controls */}
      <div className="flex items-center justify-between bg-gray-900 rounded-lg p-4 border border-gray-600">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          ← Previous
        </button>

        <div className="text-center flex-1">
          <div className="text-lg font-semibold text-blue-300">
            Step {currentStep + 1} of {steps.length}
          </div>
          {currentStepData?.title && (
            <div className="text-md font-medium text-green-400 mt-1">
              {currentStepData.title}
            </div>
          )}
          <div className="text-sm text-gray-300 mt-2 max-w-md mx-auto">
            {currentStepData?.description}
          </div>
        </div>

        <button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Variable States */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
        <h3 className="text-green-400 font-semibold mb-3">📊 Variable States</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(currentStepData?.variableStates || {}).map(([varName, value]) => (
            <div key={varName} className="bg-gray-800 rounded-lg p-3 border border-gray-600">
              <div className="text-blue-300 font-mono text-sm">{varName}</div>
              <div className="text-yellow-300 font-bold text-lg">{String(value)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Highlight */}
      {currentStepData?.codeHighlight && (
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
          <h3 className="text-green-400 font-semibold mb-3">💻 Code Focus</h3>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-600">
            <code className="text-green-300 text-sm font-mono">
              {currentStepData.codeHighlight}
            </code>
          </div>
        </div>
      )}

      {/* Reasoning */}
      {currentStepData?.reasoning && (
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
          <h3 className="text-green-400 font-semibold mb-3">🧠 Algorithm Reasoning</h3>
          <div className="text-gray-300 text-sm leading-relaxed">
            {currentStepData.reasoning}
          </div>
        </div>
      )}

      {/* Enhanced Visualization using VisualizationEngine */}
      {currentStepData?.visualization && (
        <VisualizationEngine 
          analysis={analysis}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
        />
      )}
    </div>
  );
}

