import React, { useState, useCallback, useMemo } from 'react'
import './App.css'
import { analyzeAlgorithm } from './services/geminiService'
import cacheService from './services/cacheService'
import AlgorithmVisualizer from './components/AlgorithmVisualizer'
import { usePreloadVisualizers, getVisualizationTypes } from './components/LazyVisualizationLoader'
import Header from './components/Header'
import { ButtonSpinner, InlineLoader } from './components/LoadingIndicators'

export default function App() {
  const [problem, setProblem] = useState('')
  const [code, setCode] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState(null)
  const [cacheStatus, setCacheStatus] = useState(null)

  // Preload visualization components based on current analysis
  const visualizationTypes = useMemo(() =>
    analysis ? getVisualizationTypes(analysis) : ['array'],
    [analysis]
  );

  usePreloadVisualizers(visualizationTypes);

  // Memoized callback for better performance
  const handleAnalyze = useCallback(async () => {
    if (!problem.trim() || !code.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setCacheStatus(null);

    try {
      // Generate cache key based on problem, code, and input data
      const cacheKey = cacheService.generateCacheKey(problem.trim(), code.trim(), null);

      // Check cache first
      const cachedResult = cacheService.getCachedAnalysis(cacheKey);

      if (cachedResult) {
        // Cache hit - use cached result
        setCacheStatus({ type: 'hit', message: 'Using cached analysis result' });
        setAnalysis(cachedResult);
        console.log('Cache hit: Using cached analysis result');
      } else {
        // Cache miss - make API call
        setCacheStatus({ type: 'miss', message: 'Generating new analysis...' });
        console.log('Cache miss: Generating new analysis');

        const result = await analyzeAlgorithm(problem, code);

        // Store result in cache
        try {
          cacheService.setCachedAnalysis(cacheKey, result);
          setCacheStatus({ type: 'stored', message: 'Analysis cached for future use' });
        } catch (cacheError) {
          console.warn('Failed to cache analysis result:', cacheError);
          setCacheStatus({ type: 'cache_error', message: 'Analysis completed but caching failed' });
        }

        setAnalysis(result);
      }
    } catch (err) {
      // Handle cache errors gracefully with fallback to API calls
      console.error('Analysis error:', err);

      try {
        // If there was a cache-related error, try direct API call as fallback
        if (err.message.includes('cache') || err.message.includes('Cache')) {
          console.log('Cache error detected, attempting direct API call...');
          setCacheStatus({ type: 'fallback', message: 'Cache error - using direct API call' });

          const result = await analyzeAlgorithm(problem, code);
          setAnalysis(result);
        } else {
          throw err; // Re-throw non-cache errors
        }
      } catch (fallbackErr) {
        setError(fallbackErr.message);
        setCacheStatus({ type: 'error', message: 'Both cache and API failed' });
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [problem, code]);

  const handleNewAnalysis = useCallback(() => {
    setAnalysis(null);
    setCacheStatus(null);
    setError(null);
  }, []);

  return (
    <div className="app-container">
      <Header />

      <main className={`main-content ${analysis ? 'analysis-active layout-wide' : ''}`}>
        {!analysis ? (
          <div className="input-section">
            <div className="input-grid">
              <div className="input-card">
                <h2 className="input-title">Problem Statement</h2>
                <textarea
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  className="input-textarea"
                  placeholder="Describe the algorithm problem you want to visualize..."
                />
              </div>

              <div className="input-card">
                <h2 className="input-title">Solution Code</h2>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="input-textarea code-input"
                  placeholder="Paste your solution code here..."
                />
              </div>
            </div>

            <div className="analyze-section">
              <button
                onClick={handleAnalyze}
                disabled={!problem || !code || isAnalyzing}
                className="analyze-button"
              >
                {isAnalyzing ? (
                  <>
                    <ButtonSpinner size="sm" className="text-current" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Algorithm'
                )}
              </button>

              {isAnalyzing && (
                <InlineLoader
                  text="Processing your algorithm for visualization"
                  showSpinner={false}
                  className="text-text-secondary"
                />
              )}
            </div>

            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            {cacheStatus && (
              <div className={`status-message status-${cacheStatus.type}`}>
                <p>{cacheStatus.message}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="visualization-section layout-wide">
            <div className="algorithm-summary">
              <div className="summary-header">
                <h2 className="summary-title">Algorithm Analysis</h2>
                <div className="summary-actions">
                  {cacheStatus && (
                    <span className={`cache-indicator cache-${cacheStatus.type}`}>
                      {cacheStatus.type === 'hit' ? 'Cached' :
                        cacheStatus.type === 'stored' ? 'Cached' :
                          cacheStatus.type === 'fallback' ? 'Fallback' :
                            'Fresh'}
                    </span>
                  )}
                  <button
                    onClick={handleNewAnalysis}
                    className="new-analysis-button"
                  >
                    New Analysis
                  </button>
                </div>
              </div>

              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Algorithm Type</span>
                  <span className="summary-value">{analysis.algorithmType}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Time Complexity</span>
                  <span className="summary-value complexity">{analysis.complexity?.time}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Space Complexity</span>
                  <span className="summary-value complexity">{analysis.complexity?.space}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Data Structures</span>
                  <div className="data-structures">
                    {analysis.dataStructures?.map((ds, i) => (
                      <span key={i} className="data-structure-tag">
                        {ds}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="visualization-container">
              <AlgorithmVisualizer analysis={analysis} originalCode={code} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

