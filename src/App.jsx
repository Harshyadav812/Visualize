import { useState } from 'react'
import './App.css'
import { analyzeAlgorithm } from './services/geminiService'
import AlgorithmVisualizer from './components/AlgorithmVisualizer'

export default function App() {
  const [problem, setProblem] = useState('')
  const [code, setCode] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState(null)

  const handleAnalyze = async () => {
    if (!problem.trim() || !code.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await analyzeAlgorithm(problem, code);
      setAnalysis(result);
    } catch (err) {
      setError(err.message);
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 p-4 text-center">
        <h1 className="text-2xl font-bold text-blue-400">Visualize</h1>
        <p className="text-gray-400">AI-Powered Algorithm Visualizer</p>
      </header>

      <div className="container mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 grow min-w-0">
        {/* Input Panel */}
        <div className="space-y-4 sm:space-y-6 flex flex-col h-full min-w-0">
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700 flex-1 min-h-0 flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-blue-300">Problem Statement</h2>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="w-full h-32 md:h-40 bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-100 resize-none focus:border-blue-400 focus:outline-none flex-1 min-h-0"
              placeholder="Paste your DSA problem statement here..."
            />
          </div>

          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700 flex-1 min-h-0 flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-blue-300">Your Solution</h2>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-48 md:h-56 bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-100 font-mono text-sm resize-none focus:border-blue-400 focus:outline-none flex-1 min-h-0"
              placeholder="Paste your C++/JavaScript solution here..."
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!problem || !code || isAnalyzing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isAnalyzing ? 'Analyzing...' : '🔍 Analyze & Visualize'}
          </button>
        </div>


        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-blue-300">AI Analysis & Visualization</h2>

          {error && (
            <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 mb-4">
              <p className="text-red-300">❌ {error}</p>
            </div>
          )}

          {!analysis ? (
            <div className="flex items-center justify-center flex-1 min-h-0 text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">🤖</div>
                <p>Enter a problem and solution to get started!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Algorithm Info */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <h3 className="text-green-400 font-semibold mb-2">🧠 Algorithm Analysis</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <span className="ml-2 text-blue-300">{analysis.algorithmType}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Complexity:</span>
                    <span className="ml-2 text-yellow-300">{analysis.complexity?.time}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-gray-400">Data Structures:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysis.dataStructures?.map((ds, i) => (
                      <span key={i} className="bg-purple-600/30 text-purple-300 px-2 py-1 rounded text-xs">
                        {ds}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <h3 className="text-green-400 font-semibold mb-2">📊 Key Variables</h3>
                <div className="space-y-2">
                  {analysis.keyVariables?.map((variable, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-blue-300 font-mono">{variable.name}</span>
                      <span className="text-gray-400">{variable.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <h3 className="text-green-400 font-semibold mb-4">🎬 Step-by-Step Visualization</h3>
                <AlgorithmVisualizer analysis={analysis} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

