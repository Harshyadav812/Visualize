/**
 * Universal Data Schemas and Validation for Visualization Types
 * Provides consistent structure and validation across all visualizers
 */

/**
 * Standard schemas for each visualization type
 */
export const VISUALIZATION_SCHEMAS = {
  string: {
    required: ['string'],
    optional: ['pointers', 'hashMap', 'calculations', 'highlights', 'results', 'subarrays'],
    dataTypes: {
      string: 'string',
      pointers: 'array',
      hashMap: 'object',
      calculations: 'array',
      highlights: 'object',
      results: 'object',
      subarrays: 'array'
    }
  },

  hashmap: {
    required: ['hashMap'],
    optional: ['operations', 'highlights', 'statistics', 'keys', 'values'],
    dataTypes: {
      hashMap: 'object',
      operations: 'array',
      highlights: 'object',
      statistics: 'object',
      keys: 'array',
      values: 'array'
    }
  },

  array: {
    required: ['arrays'],
    optional: ['pointers', 'operations', 'highlights', 'window', 'hashMap', 'calculations', 'results'],
    dataTypes: {
      arrays: 'array',
      pointers: 'array',
      operations: 'array',
      highlights: 'object',
      window: 'object',
      hashMap: 'object',
      calculations: 'array',
      results: 'object'
    }
  },

  hybrid: {
    required: [], // Hybrid can combine any structures
    optional: ['arrays', 'string', 'hashMap', 'pointers', 'operations', 'calculations', 'results'],
    dataTypes: {
      arrays: 'array',
      string: 'string',
      hashMap: 'object',
      pointers: 'array',
      operations: 'array',
      calculations: 'array',
      results: 'object'
    }
  }
};

/**
 * Enhanced value formatting with context awareness
 * Handles objects, arrays, and primitives intelligently
 */
export function formatValue(value, context = 'display', maxLength = 50) {
  if (value === null || value === undefined) {
    return 'null';
  }

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      const content = value.map(v => formatValue(v, 'nested', 10)).join(', ');
      return content.length > maxLength ? `[${content.substring(0, maxLength)}...]` : `[${content}]`;
    }

    // For objects, provide clean key-value representation
    const entries = Object.entries(value);
    if (entries.length === 0) return '{}';

    if (context === 'hashmap' || context === 'display') {
      const content = entries
        .map(([k, v]) => `${k}: ${formatValue(v, 'nested', 8)}`)
        .join(', ');
      return content.length > maxLength ? `{${content.substring(0, maxLength)}...}` : `{${content}}`;
    }

    // Fallback to JSON for complex objects
    try {
      const json = JSON.stringify(value);
      return json.length > maxLength ? `${json.substring(0, maxLength)}...` : json;
    } catch {
      return '[Complex Object]';
    }
  }

  const str = String(value);
  return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
}

/**
 * Validate data against schema
 */
export function validateAgainstSchema(data, type) {
  const schema = VISUALIZATION_SCHEMAS[type];
  if (!schema) {
    return { isValid: false, errors: [`Unknown visualization type: ${type}`] };
  }

  const errors = [];
  const warnings = [];

  // Check required fields
  for (const field of schema.required) {
    if (!(field in data) || data[field] === undefined || data[field] === null) {
      errors.push(`Required field '${field}' is missing`);
    }
  }

  // Check data types
  for (const [field, expectedType] of Object.entries(schema.dataTypes)) {
    if (field in data && data[field] !== null && data[field] !== undefined) {
      const actualType = Array.isArray(data[field]) ? 'array' : typeof data[field];
      if (actualType !== expectedType) {
        warnings.push(`Field '${field}' expected ${expectedType}, got ${actualType}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    hasData: Object.keys(data).length > 0
  };
}

/**
 * Calculate relevance scores for each visualization type
 */
export function calculateTypeRelevance(data, stepContext = {}) {
  const scores = {
    string: 0,
    hashmap: 0,
    array: 0,
    hybrid: 0
  };

  // String relevance
  if (data.string && typeof data.string === 'string' && data.string.length > 0) {
    scores.string += 3;
  }
  if (data.pointers && Array.isArray(data.pointers) && data.pointers.length > 0) {
    scores.string += 2; // Pointers often used with strings
  }

  // HashMap relevance  
  if (data.hashMap && typeof data.hashMap === 'object') {
    const mapSize = Object.keys(data.hashMap).length;
    scores.hashmap += mapSize > 0 ? 3 : 0;
    scores.hashmap += mapSize > 2 ? 2 : 0; // Bonus for substantial maps
  }

  // Array relevance
  if (data.arrays && Array.isArray(data.arrays) && data.arrays.length > 0) {
    scores.array += 3;
    const totalElements = data.arrays.reduce((sum, arr) => sum + (arr.values?.length || 0), 0);
    scores.array += totalElements > 3 ? 2 : 0; // Bonus for substantial arrays
  }

  // Hybrid relevance (multiple significant structures)
  const significantStructures = [
    scores.string > 2,
    scores.hashmap > 2,
    scores.array > 2
  ].filter(Boolean).length;

  if (significantStructures >= 2) {
    scores.hybrid = Math.max(scores.string, scores.hashmap, scores.array) + 1;
  }

  return scores;
}

/**
 * Select optimal visualization type based on scores and context
 */
export function selectOptimalType(data, stepContext = {}, explicitType = null) {
  // Respect explicit type if provided and valid
  if (explicitType && VISUALIZATION_SCHEMAS[explicitType]) {
    return explicitType;
  }

  const scores = calculateTypeRelevance(data, stepContext);

  // Find type with highest score
  const bestType = Object.entries(scores).reduce((best, [type, score]) => {
    return score > best.score ? { type, score } : best;
  }, { type: 'array', score: 0 });

  // Fallback to array if no clear winner
  return bestType.score > 0 ? bestType.type : 'array';
}

/**
 * Normalize data for any visualization type
 */
export function normalizeVisualizationData(data, targetType) {
  if (!data) return {};

  const schema = VISUALIZATION_SCHEMAS[targetType];
  if (!schema) return data;

  const normalized = {};

  // Copy all existing data
  Object.assign(normalized, data);

  // Ensure required fields have defaults
  for (const field of schema.required) {
    if (!(field in normalized) || normalized[field] === null || normalized[field] === undefined) {
      switch (schema.dataTypes[field]) {
        case 'array':
          normalized[field] = [];
          break;
        case 'object':
          normalized[field] = {};
          break;
        case 'string':
          normalized[field] = '';
          break;
        default:
          normalized[field] = null;
      }
    }
  }

  return normalized;
}
