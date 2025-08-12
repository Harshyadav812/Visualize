import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Button } from './ui/button'
import {
  ComplexityComparisonTooltip,
  PatternTooltip
} from './EducationalTooltip'
import {
  HelpCircle,
  BookOpen,
  Clock,
  Database,
  TrendingUp,
  Info
} from 'lucide-react'
import { COMPLEXITY_COMPARISONS, COMMON_PATTERNS } from '../constants/educationalData'

export default function Header() {
  const [showEducationalPanel, setShowEducationalPanel] = useState(false);

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-main">
          <div className="header-text">
            <h1 className="app-title text-responsive-title">Visualize</h1>
            <p className="app-subtitle">Algorithm Visualization</p>
          </div>

          <div className="header-actions">
            {/* Educational Help Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEducationalPanel(!showEducationalPanel)}
              className="help-button"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Learning Guide
            </Button>
          </div>
        </div>

        {/* Educational Panel */}
        {showEducationalPanel && (
          <div className="educational-panel mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Complexity Guide */}
              <div className="educational-section">
                <div className="flex items-center mb-3">
                  <Clock className="w-5 h-5 mr-2 text-blue-400" />
                  <h3 className="font-semibold text-blue-400">Time Complexity Guide</h3>
                </div>
                <ComplexityComparisonTooltip comparisons={COMPLEXITY_COMPARISONS}>
                  <div className="cursor-help p-3 bg-gray-800/50 rounded border border-gray-600 hover:border-blue-500 transition-colors">
                    <div className="text-sm text-gray-300 mb-2">
                      Click to see complexity comparison
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">O(1)</span>
                      <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">O(log n)</span>
                      <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded">O(n)</span>
                      <span className="px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded">O(n²)</span>
                    </div>
                  </div>
                </ComplexityComparisonTooltip>
              </div>

              {/* Algorithm Patterns */}
              <div className="educational-section">
                <div className="flex items-center mb-3">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                  <h3 className="font-semibold text-green-400">Common Patterns</h3>
                </div>
                <div className="space-y-2">
                  {COMMON_PATTERNS.map((pattern, i) => (
                    <PatternTooltip
                      key={i}
                      pattern={pattern.name}
                      explanation={pattern.description}
                      examples={pattern.examples}
                    >
                      <div className="cursor-help p-2 bg-gray-800/50 rounded border border-gray-600 hover:border-green-500 transition-colors">
                        <div className="font-medium text-green-300 text-sm">{pattern.name}</div>
                        <div className="text-xs text-gray-400">{pattern.description}</div>
                      </div>
                    </PatternTooltip>
                  ))}
                </div>
              </div>

              {/* Data Structures */}
              <div className="educational-section">
                <div className="flex items-center mb-3">
                  <Database className="w-5 h-5 mr-2 text-purple-400" />
                  <h3 className="font-semibold text-purple-400">Data Structures</h3>
                </div>
                <div className="text-sm text-gray-300 p-3 bg-gray-800/50 rounded border border-gray-600">
                  <div className="flex items-center mb-2">
                    <Info className="w-4 h-4 mr-2 text-purple-400" />
                    <span>Hover over elements in analysis results for detailed explanations</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Algorithm types, complexities, and data structures now have interactive tooltips with educational content.
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-4 pt-3 border-t border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-400">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span>Interactive tooltips available throughout the interface</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEducationalPanel(false)}
                  className="text-gray-400 hover:text-white"
                >
                  Close Guide
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}