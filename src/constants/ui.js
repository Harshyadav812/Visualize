/**
 * UI Constants and Configurations
 * Centralized constants for consistent UI behavior
 */

export const TOOLTIP_WIDTHS = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl'
};

export const COMPLEXITY_TYPES = {
  TIME: 'time',
  SPACE: 'space'
};

export const COMPLEXITY_CONFIG = {
  [COMPLEXITY_TYPES.TIME]: {
    title: 'Time Complexity',
    color: 'text-blue-400'
  },
  [COMPLEXITY_TYPES.SPACE]: {
    title: 'Space Complexity',
    color: 'text-purple-400'
  }
};

export const COLORS = {
  COMPLEXITY: {
    TIME: 'text-blue-400',
    SPACE: 'text-purple-400'
  },
  PATTERN: 'text-green-400',
  DATA_STRUCTURE: 'text-purple-400',
  ALGORITHM: 'text-yellow-400'
};
