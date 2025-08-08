import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// DSA Problem Type Detection Patterns
const DSA_PATTERNS = {
  // Array-based algorithms
  array: {
    keywords: ['array', 'sliding window', 'two pointer', 'subarray', 'maximum subarray', 'kadane', 'sort', 'merge', 'binary search'],
    indicators: ['arr[', 'nums[', 'window', 'left', 'right', 'pivot']
  },
  // Tree algorithms
  tree: {
    keywords: ['binary tree', 'bst', 'binary search tree', 'traversal', 'inorder', 'preorder', 'postorder', 'level order', 'tree', 'tree node', 'root'],
    indicators: ['TreeNode', 'root.left', 'root.right', 'node.left', 'node.right', 'parent', 'children']
  },
  // Graph algorithms
  graph: {
    keywords: ['graph', 'dfs', 'bfs', 'depth first', 'breadth first', 'dijkstra', 'shortest path', 'connected components', 'cycle', 'topological'],
    indicators: ['adjacency', 'visited', 'neighbors', 'edges', 'vertices', 'graph[']
  },
  // Linked List algorithms
  linkedlist: {
    keywords: ['linked list', 'singly linked', 'doubly linked', 'circular', 'reverse', 'merge lists', 'cycle detection'],
    indicators: ['ListNode', 'current->next', 'node->next', 'next', 'prev', 'head', 'tail', 'node.next', 'nullptr']
  },
  // Stack and Queue algorithms
  stack: {
    keywords: ['stack', 'lifo', 'push', 'pop', 'parentheses', 'valid parentheses', 'monotonic stack'],
    indicators: ['stack.push', 'stack.pop', 'Stack()', 'peek()']
  },
  queue: {
    keywords: ['queue', 'fifo', 'enqueue', 'dequeue', 'level order', 'bfs', 'priority queue'],
    indicators: ['queue.push', 'queue.shift', 'Queue()', 'front', 'rear']
  },
  // Recursion and Dynamic Programming
  recursion: {
    keywords: ['recursion', 'recursive', 'backtrack', 'divide and conquer', 'memoization', 'fibonacci'],
    indicators: ['fib(n-1)', 'fib(n-2)', 'return n', 'base case', 'recursive call']
  },
  dp: {
    keywords: ['dynamic programming', 'dp', 'memoization', 'tabulation', 'optimal substructure', 'overlapping subproblems'],
    indicators: ['dp[', 'memo[', 'cache[', 'dp.get', 'memoize']
  }
};

// Algorithm Type Detection Patterns
const ALGORITHM_PATTERNS = {
  sliding_window: ['sliding window', 'maximum sum', 'minimum window', 'longest substring', 'subarray'],
  two_pointer: ['two pointer', 'left right', 'palindrome', 'container with most water', 'three sum', 'left = 0', 'right = arr.length'],
  binary_search: ['binary search', 'search insert', 'find peak', 'search rotated'],
  sorting: ['bubble sort', 'merge sort', 'quick sort', 'heap sort', 'insertion sort'],
  dfs: ['depth first', 'dfs', 'backtrack', 'path finding', 'connected components'],
  bfs: ['breadth first', 'bfs', 'level order', 'shortest path', 'minimum steps'],
  greedy: ['greedy', 'activity selection', 'fractional knapsack', 'huffman'],
  divide_conquer: ['divide and conquer', 'merge sort', 'quick sort', 'closest pair']
};

/**
 * Detects the problem type and data structures from problem statement and code
 * @param {string} problemStatement - The problem description
 * @param {string} solutionCode - The user's solution code
 * @returns {Object} - Detected problem characteristics
 */
export function detectProblemType(problemStatement, solutionCode) {
  const combinedText = (problemStatement + ' ' + solutionCode).toLowerCase();
  
  // Detect data structures
  const detectedDataStructures = [];
  const detectedAlgorithms = [];
  
  // Check for data structure patterns with scoring
  const dsScores = {};
  
  Object.entries(DSA_PATTERNS).forEach(([dsType, patterns]) => {
    let score = 0;
    
    // Check keywords
    patterns.keywords.forEach(keyword => {
      if (combinedText.includes(keyword.toLowerCase())) {
        score += keyword.length; // Longer, more specific keywords get higher scores
      }
    });
    
    // Check indicators
    patterns.indicators.forEach(indicator => {
      const lowerIndicator = indicator.toLowerCase();
      // First try simple string matching
      if (combinedText.includes(lowerIndicator)) {
        score += indicator.length + 5; // Indicators get bonus points
        return;
      }
      // For regex matching, escape special characters
      try {
        const escapedIndicator = lowerIndicator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (new RegExp(escapedIndicator).test(combinedText)) {
          score += indicator.length + 5;
        }
      } catch (error) {
        // If regex fails, fall back to string matching only
      }
    });
    
    if (score > 0) {
      dsScores[dsType] = score;
      detectedDataStructures.push(dsType);
    }
  });
  
  // Check for algorithm patterns
  Object.entries(ALGORITHM_PATTERNS).forEach(([algType, keywords]) => {
    const match = keywords.some(keyword => 
      combinedText.includes(keyword.toLowerCase())
    );
    if (match) {
      detectedAlgorithms.push(algType);
    }
  });
  
  // Default fallbacks
  if (detectedDataStructures.length === 0) {
    detectedDataStructures.push('array'); // Most common default
  }
  if (detectedAlgorithms.length === 0) {
    detectedAlgorithms.push('general'); // Generic algorithm
  }
  
  // Sort data structures by score (highest first)
  const sortedDataStructures = detectedDataStructures.sort((a, b) => {
    return (dsScores[b] || 0) - (dsScores[a] || 0);
  });

  return {
    dataStructures: detectedDataStructures,
    algorithms: detectedAlgorithms,
    primaryDataStructure: sortedDataStructures[0] || detectedDataStructures[0],
    primaryAlgorithm: detectedAlgorithms[0]
  };
}

/**
 * Generates comprehensive prompts for different DSA problem types
 * @param {string} problemStatement - The problem description
 * @param {string} solutionCode - The user's solution code
 * @param {Object} detectedTypes - Detected problem characteristics
 * @returns {string} - Tailored prompt for the specific problem type
 */
function generateDSAPrompt(problemStatement, solutionCode, detectedTypes) {
  const { primaryDataStructure, primaryAlgorithm, dataStructures } = detectedTypes;
  
  // Base prompt structure
  let prompt = `
Analyze this ${primaryDataStructure} ${primaryAlgorithm} algorithm and return ONLY valid JSON (no extra text):

PROBLEM: ${problemStatement}
CODE: ${solutionCode}

Return this exact JSON structure with enhanced DSA support:
{
  "algorithmType": "${primaryAlgorithm}",
  "dataStructures": ${JSON.stringify(dataStructures)},
  "problemCategory": "determine_category",
  "keyVariables": [
    {"name": "variable_name", "type": "data_type", "description": "clear description"}
  ],
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step title",
      "description": "Detailed step description",
      "codeHighlight": "relevant code snippet",
      "variableStates": {"var1": "value1", "var2": "value2"},
      "visualization": {
        "type": "${primaryDataStructure}",
        "data": "structure_specific_data"
      },
      "reasoning": "Why this step is necessary and what it accomplishes",
      "complexity": {"stepTime": "O(1)", "stepSpace": "O(1)"},
      "edgeCases": ["edge case descriptions"],
      "pitfalls": ["common mistakes to avoid"]
    }
  ],
  "complexity": {"time": "overall_time", "space": "overall_space", "explanation": "complexity reasoning"},
  "testCases": [{"input": "test_input", "expected": "expected_output", "description": "test description"}],
  "commonPitfalls": ["pitfall descriptions"],
  "optimizations": ["optimization suggestions"]
}`;

  // Add specific instructions based on data structure type
  switch (primaryDataStructure) {
    case 'array':
      prompt += `

ARRAY VISUALIZATION REQUIREMENTS:
- Show array elements with indices
- Highlight current positions, windows, or subarrays
- Include pointer movements and comparisons
- Show sorting/swapping operations if applicable
- Use "array" visualization type with structure:
{
  "type": "array",
  "arrays": [{"name": "arr", "values": [1,2,3], "highlights": {"current": [0], "window": {"start": 0, "end": 2}}}],
  "pointers": [{"name": "left", "position": 0, "color": "blue"}],
  "operations": [{"type": "compare", "indices": [0,1], "description": "comparing elements"}]
}`;
      break;
      
    case 'tree':
      prompt += `

TREE VISUALIZATION REQUIREMENTS:
- Show tree structure with nodes and edges
- Highlight traversal paths and current node
- Include insertion/deletion operations
- Show tree rotations if applicable
- Use "tree" visualization type with structure:
{
  "type": "tree",
  "nodes": [{"id": "1", "value": 10, "x": 100, "y": 50, "parent": null, "children": ["2","3"], "state": "current"}],
  "edges": [{"from": "1", "to": "2", "state": "traversed"}],
  "traversalPath": ["1", "2", "3"],
  "currentNode": "1"
}`;
      break;
      
    case 'graph':
      prompt += `

GRAPH VISUALIZATION REQUIREMENTS:
- Show vertices and edges with proper layout
- Highlight visited nodes and traversal paths
- Include algorithm-specific data (distances, parents)
- Show directed/undirected edges appropriately
- Use "graph" visualization type with structure:
{
  "type": "graph",
  "vertices": [{"id": "A", "label": "A", "x": 100, "y": 100, "state": "visited", "distance": 0}],
  "edges": [{"from": "A", "to": "B", "weight": 1, "state": "traversed", "directed": true}],
  "algorithm": "dfs",
  "currentVertex": "A",
  "visitedOrder": ["A", "B"]
}`;
      break;
      
    case 'linkedlist':
      prompt += `

LINKED LIST VISUALIZATION REQUIREMENTS:
- Show nodes with values and pointer connections
- Highlight current node and operations
- Include insertion/deletion animations
- Show pointer manipulations clearly
- Use "linkedlist" visualization type with structure:
{
  "type": "linkedlist",
  "nodes": [{"id": "1", "value": 10, "next": "2", "prev": null, "state": "current"}],
  "head": "1",
  "tail": "3",
  "operations": [{"type": "insert", "position": "after", "nodeId": "1", "newValue": 15}]
}`;
      break;
      
    case 'stack':
    case 'queue':
      prompt += `

STACK/QUEUE VISUALIZATION REQUIREMENTS:
- Show LIFO/FIFO structure clearly
- Highlight push/pop or enqueue/dequeue operations
- Include overflow/underflow states
- Show top/front/rear pointers
- Use "stack" or "queue" visualization type with structure:
{
  "type": "${primaryDataStructure}",
  "elements": [{"value": 10, "index": 0, "state": "normal"}],
  "top": 2,
  "operations": [{"type": "push", "value": 15, "description": "adding element"}],
  "capacity": 10,
  "size": 3
}`;
      break;
      
    case 'recursion':
      prompt += `

RECURSION VISUALIZATION REQUIREMENTS:
- Show call stack with function calls
- Highlight base cases and recursive calls
- Include parameter passing and return values
- Show recursive tree structure
- Use "recursion" visualization type with structure:
{
  "type": "recursion",
  "callStack": [{"function": "fibonacci", "params": {"n": 5}, "level": 0, "state": "active"}],
  "recursiveTree": [{"id": "fib(5)", "children": ["fib(4)", "fib(3)"], "value": 5, "state": "computing"}],
  "currentCall": "fib(5)",
  "baseCase": false
}`;
      break;
  }

  prompt += `

Generate 5-8 meaningful steps showing the algorithm execution with appropriate test data.
Focus on educational value and clear step-by-step progression.
Include complexity analysis for each step and overall algorithm.
Highlight common pitfalls and edge cases.
Provide optimization suggestions where applicable.`;

  return prompt;
}

/**
 * Enhanced algorithm analysis with comprehensive DSA support
 * @param {string} problemStatement - The problem description
 * @param {string} solutionCode - The user's solution code
 * @param {string} inputData - Optional input data for testing
 * @returns {Promise<Object>} - Structured visualization data
 */
export async function analyzeAlgorithm(problemStatement, solutionCode, inputData = '') {
  // Detect problem type and generate appropriate prompt
  const detectedTypes = detectProblemType(problemStatement, solutionCode);
  const prompt = generateDSAPrompt(problemStatement, solutionCode, detectedTypes);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Raw AI response:', text); // Debug log
    
    // Enhanced JSON parsing with better error handling
    const analysisData = parseAIResponse(text);
    
    // Validate and enhance the response
    const validatedData = validateAndEnhanceResponse(analysisData, detectedTypes);
    
    return validatedData;
    
  } catch (error) {
    console.error('Error analyzing algorithm:', error);
    console.error('Full error details:', error);
    throw new Error(`AI Analysis failed: ${error.message}`);
  }
}

/**
 * Enhanced JSON parsing with better error handling and validation
 * @param {string} text - Raw AI response text
 * @returns {Object} - Parsed JSON object
 */
function parseAIResponse(text) {
  let jsonStr = text;
  
  try {
    // Remove markdown code blocks if present
    jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find the JSON object boundaries more carefully
    const startIndex = jsonStr.indexOf('{');
    const lastIndex = jsonStr.lastIndexOf('}');
    
    if (startIndex === -1 || lastIndex === -1) {
      throw new Error('No valid JSON object found in AI response');
    }
    
    jsonStr = jsonStr.substring(startIndex, lastIndex + 1);
    
    // Try parsing the raw JSON first
    try {
      const parsedData = JSON.parse(jsonStr);
      console.log('Direct JSON parsing successful:', parsedData);
      return parsedData;
    } catch (directParseError) {
      console.log('Direct parsing failed, attempting cleanup...');
      
      // Clean up common JSON issues only if direct parsing fails
      jsonStr = jsonStr
        .replace(/,\s*}/g, '}')  // Remove trailing commas in objects
        .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
        .replace(/\n/g, ' ')     // Replace newlines with spaces
        .replace(/\s+/g, ' ')    // Normalize whitespace
        .trim();
      
      console.log('Cleaned JSON:', jsonStr); // Debug log
      
      const parsedData = JSON.parse(jsonStr);
      return parsedData;
    }
    
  } catch (parseError) {
    console.error('JSON parsing failed:', parseError);
    console.error('Attempted to parse:', jsonStr);
    
    // Try alternative parsing strategies
    return attemptAlternativeParsing(text);
  }
}

/**
 * Fix common JSON formatting issues
 * @param {string} jsonStr - JSON string to fix
 * @returns {string} - Fixed JSON string
 */
function fixCommonJSONIssues(jsonStr) {
  // Fix unescaped quotes in strings
  jsonStr = jsonStr.replace(/"([^"]*)"([^"]*)"([^"]*)":/g, '"$1\\"$2\\"$3":');
  
  // Fix missing quotes around string values
  jsonStr = jsonStr.replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*([,}])/g, ': "$1"$2');
  
  // Fix boolean and null values (don't quote them)
  jsonStr = jsonStr.replace(/:\s*"(true|false|null)"/g, ': $1');
  
  // Fix numeric values (don't quote them)
  jsonStr = jsonStr.replace(/:\s*"(\d+\.?\d*)"/g, ': $1');
  
  return jsonStr;
}

/**
 * Attempt alternative parsing strategies when standard parsing fails
 * @param {string} text - Original AI response text
 * @returns {Object} - Fallback parsed object
 */
function attemptAlternativeParsing(text) {
  console.log('Attempting alternative parsing strategies...');
  
  // Strategy 1: Try to find and parse JSON chunks
  try {
    // Look for the main JSON structure patterns
    const algorithmTypeMatch = text.match(/"algorithmType":\s*"([^"]+)"/);
    const dataStructuresMatch = text.match(/"dataStructures":\s*\[([^\]]+)\]/);
    const problemCategoryMatch = text.match(/"problemCategory":\s*"([^"]+)"/);
    
    // Extract key variables
    const keyVariablesMatch = text.match(/"keyVariables":\s*\[([^\]]+)\]/);
    let keyVariables = [];
    if (keyVariablesMatch) {
      try {
        keyVariables = JSON.parse(`[${keyVariablesMatch[1]}]`);
      } catch (e) {
        // Fallback for key variables
        keyVariables = [
          { name: 'maxLen', type: 'number', description: 'Maximum length found' },
          { name: 'windowStart', type: 'number', description: 'Window start index' },
          { name: 'currentSum', type: 'number', description: 'Current window sum' }
        ];
      }
    }
    
    // Extract steps - this is more complex, so we'll create a reasonable fallback
    const steps = createReasonableSteps(text);
    
    const fallbackData = {
      algorithmType: algorithmTypeMatch ? algorithmTypeMatch[1] : 'sliding_window',
      dataStructures: dataStructuresMatch ? JSON.parse(`[${dataStructuresMatch[1]}]`) : ['array'],
      problemCategory: problemCategoryMatch ? problemCategoryMatch[1] : 'Subarray Sum (Longest)',
      keyVariables: keyVariables,
      steps: steps,
      complexity: { 
        time: 'O(n)', 
        space: 'O(1)', 
        explanation: 'Linear time complexity with constant space' 
      },
      testCases: [
        { 
          input: { arr: [1, 2, 3, 1, 1, 1, 1, 4, 2, 3], k: 4 }, 
          expected: 6, 
          description: 'Find longest subarray with sum = 4' 
        }
      ],
      commonPitfalls: ['Not handling negative numbers', 'Off-by-one errors in window boundaries'],
      optimizations: ['Use sliding window technique for optimal performance']
    };
    
    console.log('Alternative parsing successful:', fallbackData);
    return fallbackData;
    
  } catch (altError) {
    console.error('Alternative parsing also failed:', altError);
    
    // Final fallback: return minimal valid structure
    return createFallbackResponse();
  }
}

/**
 * Create reasonable steps based on the algorithm type detected
 * @param {string} text - Original text to analyze
 * @returns {Array} - Array of step objects
 */
function createReasonableSteps(text) {
  // Check if this is a sliding window problem
  if (text.includes('sliding_window') || text.includes('windowStart') || text.includes('windowEnd')) {
    return [
      {
        stepNumber: 1,
        title: 'Initialize Variables',
        description: 'Set up variables for tracking the sliding window and maximum length.',
        codeHighlight: 'let maxLen = 0, windowStart = 0, currentSum = 0;',
        variableStates: { maxLen: 0, windowStart: 0, currentSum: 0, k: 4 },
        visualization: {
          type: 'array',
          arrays: [{
            name: 'arr',
            values: [1, 2, 3, 1, 1, 1, 1, 4, 2, 3],
            highlights: { current: [0] }
          }],
          pointers: [
            { name: 'windowStart', position: 0, color: 'blue' }
          ]
        },
        reasoning: 'Initialize tracking variables for the sliding window algorithm.',
        complexity: { stepTime: 'O(1)', stepSpace: 'O(1)' },
        edgeCases: ['Empty array', 'All elements greater than k'],
        pitfalls: ['Forgetting to initialize variables properly']
      },
      {
        stepNumber: 2,
        title: 'Expand Window',
        description: 'Add elements to the current window while sum is less than k.',
        codeHighlight: 'currentSum += arr[windowEnd]; windowEnd++;',
        variableStates: { maxLen: 0, windowStart: 0, currentSum: 6, windowEnd: 2, k: 4 },
        visualization: {
          type: 'array',
          arrays: [{
            name: 'arr',
            values: [1, 2, 3, 1, 1, 1, 1, 4, 2, 3],
            highlights: { 
              window: { start: 0, end: 2 },
              current: [2]
            }
          }],
          pointers: [
            { name: 'windowStart', position: 0, color: 'blue' },
            { name: 'windowEnd', position: 2, color: 'green' }
          ],
          operations: [{
            type: 'sum',
            indices: [0, 1, 2],
            description: 'currentSum = arr[0] + arr[1] + arr[2] = 1 + 2 + 3 = 6'
          }]
        },
        reasoning: 'Expand the window by adding elements until we exceed the target sum.',
        complexity: { stepTime: 'O(1)', stepSpace: 'O(1)' },
        edgeCases: ['Window reaches end of array'],
        pitfalls: ['Not checking bounds when expanding window']
      },
      {
        stepNumber: 3,
        title: 'Contract Window',
        description: 'Remove elements from the left when sum exceeds k.',
        codeHighlight: 'while (currentSum > k) { currentSum -= arr[windowStart]; windowStart++; }',
        variableStates: { maxLen: 0, windowStart: 2, currentSum: 3, windowEnd: 2, k: 4 },
        visualization: {
          type: 'array',
          arrays: [{
            name: 'arr',
            values: [1, 2, 3, 1, 1, 1, 1, 4, 2, 3],
            highlights: { 
              window: { start: 2, end: 2 },
              current: [2]
            }
          }],
          pointers: [
            { name: 'windowStart', position: 2, color: 'blue' },
            { name: 'windowEnd', position: 2, color: 'green' }
          ],
          operations: [{
            type: 'remove_from_sum',
            indices: [0],
            description: 'currentSum = 6 - arr[0] (1) = 5. windowStart moves to 1.'
          }]
        },
        reasoning: 'Contract the window from the left when sum becomes greater than k.',
        complexity: { stepTime: 'O(1)', stepSpace: 'O(1)' },
        edgeCases: ['Window becomes empty'],
        pitfalls: ['Not updating windowStart correctly']
      }
    ];
  }
  
  // Default steps for other algorithms
  return [
    {
      stepNumber: 1,
      title: 'Algorithm Initialization',
      description: 'Initialize variables and set up the algorithm.',
      codeHighlight: 'Initialize variables',
      variableStates: {},
      visualization: {
        type: 'array',
        arrays: [{ name: 'arr', values: [1, 2, 3, 4, 5] }]
      },
      reasoning: 'Set up the initial state for algorithm execution.',
      complexity: { stepTime: 'O(1)', stepSpace: 'O(1)' },
      edgeCases: [],
      pitfalls: []
    }
  ];
}

/**
 * Extract a simple value from text using regex
 * @param {string} text - Text to search
 * @param {string} key - Key to find
 * @returns {string|null} - Extracted value
 */
function extractValue(text, key) {
  const regex = new RegExp(`"${key}"\\s*:\\s*"([^"]*)"`, 'i');
  const match = text.match(regex);
  return match ? match[1] : null;
}

/**
 * Extract an array from text (simplified)
 * @param {string} text - Text to search
 * @param {string} key - Key to find
 * @returns {Array} - Extracted array or empty array
 */
function extractArray(text, key) {
  try {
    const regex = new RegExp(`"${key}"\\s*:\\s*\\[([^\\]]+)\\]`, 'i');
    const match = text.match(regex);
    if (match) {
      // Simple array parsing - just split by comma and clean up
      return match[1].split(',').map(item => item.trim().replace(/"/g, ''));
    }
  } catch (error) {
    console.error(`Error extracting array ${key}:`, error);
  }
  return [];
}

/**
 * Extract an object from text (simplified)
 * @param {string} text - Text to search
 * @param {string} key - Key to find
 * @returns {Object} - Extracted object or empty object
 */
function extractObject(text, key) {
  try {
    const regex = new RegExp(`"${key}"\\s*:\\s*\\{([^}]+)\\}`, 'i');
    const match = text.match(regex);
    if (match) {
      const obj = {};
      const pairs = match[1].split(',');
      pairs.forEach(pair => {
        const [k, v] = pair.split(':').map(s => s.trim().replace(/"/g, ''));
        if (k && v) obj[k] = v;
      });
      return obj;
    }
  } catch (error) {
    console.error(`Error extracting object ${key}:`, error);
  }
  return {};
}

/**
 * Create a minimal fallback response when all parsing fails
 * @returns {Object} - Minimal valid response structure
 */
function createFallbackResponse() {
  return {
    algorithmType: 'general',
    dataStructures: ['array'],
    problemCategory: 'general',
    keyVariables: [
      { name: 'i', type: 'int', description: 'Loop counter' },
      { name: 'result', type: 'variable', description: 'Result variable' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Algorithm Execution',
        description: 'The algorithm processes the input data step by step.',
        codeHighlight: 'Processing...',
        variableStates: { i: 0, result: 'initial' },
        visualization: {
          type: 'array',
          data: { array: [1, 2, 3], current: 0 }
        },
        reasoning: 'This step processes the input according to the algorithm logic.',
        complexity: { stepTime: 'O(1)', stepSpace: 'O(1)' },
        edgeCases: [],
        pitfalls: []
      }
    ],
    complexity: { time: 'O(n)', space: 'O(1)', explanation: 'Linear time complexity' },
    testCases: [],
    commonPitfalls: ['Check boundary conditions', 'Handle empty input'],
    optimizations: ['Consider alternative approaches']
  };
}

/**
 * Validate and enhance the parsed response
 * @param {Object} data - Parsed response data
 * @param {Object} detectedTypes - Detected problem characteristics
 * @returns {Object} - Validated and enhanced response
 */
function validateAndEnhanceResponse(data, detectedTypes) {
  // Ensure required fields exist
  const validatedData = {
    algorithmType: data.algorithmType || detectedTypes.primaryAlgorithm || 'general',
    dataStructures: data.dataStructures || detectedTypes.dataStructures || ['array'],
    problemCategory: data.problemCategory || 'general',
    keyVariables: Array.isArray(data.keyVariables) ? data.keyVariables : [],
    steps: Array.isArray(data.steps) ? data.steps : [],
    complexity: data.complexity || { time: 'O(n)', space: 'O(1)' },
    testCases: Array.isArray(data.testCases) ? data.testCases : [],
    commonPitfalls: Array.isArray(data.commonPitfalls) ? data.commonPitfalls : [],
    optimizations: Array.isArray(data.optimizations) ? data.optimizations : []
  };
  
  // Validate and fix steps structure
  validatedData.steps = validatedData.steps.map((step, index) => ({
    stepNumber: step.stepNumber || index + 1,
    title: step.title || `Step ${index + 1}`,
    description: step.description || 'Algorithm step execution',
    codeHighlight: step.codeHighlight || '',
    variableStates: step.variableStates || {},
    visualization: step.visualization || { type: detectedTypes.primaryDataStructure, data: {} },
    reasoning: step.reasoning || 'Algorithm logic execution',
    complexity: step.complexity || { stepTime: 'O(1)', stepSpace: 'O(1)' },
    edgeCases: Array.isArray(step.edgeCases) ? step.edgeCases : [],
    pitfalls: Array.isArray(step.pitfalls) ? step.pitfalls : []
  }));
  
  // Ensure complexity has explanation
  if (!validatedData.complexity.explanation) {
    validatedData.complexity.explanation = `Time: ${validatedData.complexity.time}, Space: ${validatedData.complexity.space}`;
  }
  
  return validatedData;
}

/**
 * Generate test cases for visualization based on problem type
 * @param {string} problemStatement - The problem description
 * @param {string} algorithmType - Detected algorithm type
 * @returns {Array} - Generated test cases
 */
export function generateTestCases(problemStatement, algorithmType) {
  const testCases = [];
  
  switch (algorithmType) {
    case 'sliding_window':
      testCases.push(
        { input: '[1,4,2,1,5], k=3', expected: '7', description: 'Maximum sum of subarray of size 3' },
        { input: '[2,1,3,4,1], k=2', expected: '7', description: 'Maximum sum of subarray of size 2' }
      );
      break;
    case 'two_pointer':
      testCases.push(
        { input: '[1,2,3,4,6], target=6', expected: '[1,3]', description: 'Two sum with sorted array' },
        { input: '[2,7,11,15], target=9', expected: '[0,1]', description: 'Two sum indices' }
      );
      break;
    case 'binary_search':
      testCases.push(
        { input: '[1,3,5,7,9], target=5', expected: '2', description: 'Find target in sorted array' },
        { input: '[1,3,5,7,9], target=6', expected: '-1', description: 'Target not found' }
      );
      break;
    default:
      testCases.push(
        { input: 'sample_input', expected: 'sample_output', description: 'Basic test case' }
      );
  }
  
  return testCases;
}

/**
 * Test function to verify API connection
 */
export async function testGeminiConnection() {
  try {
    const result = await model.generateContent("Say 'Hello from Gemini!' if you can read this.");
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini connection test failed:', error);
    throw error;
  }
}