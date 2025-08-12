import React from 'react';
import PropTypes from 'prop-types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { TOOLTIP_WIDTHS, COMPLEXITY_TYPES, COMPLEXITY_CONFIG } from '../constants/ui';

/**
 * Educational tooltip component using shadcn/ui Tooltip
 */
export default function EducationalTooltip({
  children,
  content,
  title,
  width = 'md'
}) {
  const widthClass = TOOLTIP_WIDTHS[width] || TOOLTIP_WIDTHS.md;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent className={widthClass} aria-describedby={title}>
          {title && (
            <div className="font-semibold mb-1" role="heading" aria-level="4">
              {title}
            </div>
          )}
          <div>{content}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

EducationalTooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
  title: PropTypes.string,
  width: PropTypes.oneOf(Object.keys(TOOLTIP_WIDTHS))
};

/**
 * Complexity tooltip for algorithm complexity explanations
 */
export function ComplexityTooltip({ children, complexity, description, type = COMPLEXITY_TYPES.TIME }) {
  const normalizedType = type.toLowerCase();
  const config = COMPLEXITY_CONFIG[normalizedType] || COMPLEXITY_CONFIG[COMPLEXITY_TYPES.TIME];

  const content = (
    <div className="space-y-2">
      <div className={`font-semibold ${config.color}`}>
        {complexity}
      </div>
      <div className="text-sm">{description}</div>
    </div>
  );

  return (
    <EducationalTooltip
      content={content}
      title={config.title}
      width="lg"
    >
      {children}
    </EducationalTooltip>
  );
}

ComplexityTooltip.propTypes = {
  children: PropTypes.node.isRequired,
  complexity: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  type: PropTypes.oneOf(Object.values(COMPLEXITY_TYPES))
};

/**
 * Pattern tooltip for algorithm pattern explanations
 */
export function PatternTooltip({ children, pattern, explanation, examples }) {
  const content = (
    <div className="space-y-2">
      <div className="font-semibold text-green-400">{pattern}</div>
      <div className="text-sm">{explanation}</div>
      {examples && examples.length > 0 && (
        <div className="text-xs text-gray-300">
          Examples: {examples.join(', ')}
        </div>
      )}
    </div>
  );

  return (
    <EducationalTooltip content={content} title="Algorithm Pattern" width="lg">
      {children}
    </EducationalTooltip>
  );
}

PatternTooltip.propTypes = {
  children: PropTypes.node.isRequired,
  pattern: PropTypes.string.isRequired,
  explanation: PropTypes.string.isRequired,
  examples: PropTypes.arrayOf(PropTypes.string)
};

/**
 * Data structure tooltip
 */
export function DataStructureTooltip({ children, dataStructure, properties, useCases }) {
  const content = (
    <div className="space-y-2">
      <div className="font-semibold text-purple-400">{dataStructure}</div>
      {properties && properties.length > 0 && (
        <div className="text-sm">
          <div className="font-medium">Properties:</div>
          <ul className="list-disc list-inside text-xs">
            {properties.map((prop, index) => (
              <li key={index}>{prop}</li>
            ))}
          </ul>
        </div>
      )}
      {useCases && useCases.length > 0 && (
        <div className="text-xs text-gray-300">
          Use cases: {useCases.join(', ')}
        </div>
      )}
    </div>
  );

  return (
    <EducationalTooltip content={content} title="Data Structure" width="lg">
      {children}
    </EducationalTooltip>
  );
}

DataStructureTooltip.propTypes = {
  children: PropTypes.node.isRequired,
  dataStructure: PropTypes.string.isRequired,
  properties: PropTypes.arrayOf(PropTypes.string),
  useCases: PropTypes.arrayOf(PropTypes.string)
};

/**
 * Complexity comparison tooltip
 */
export function ComplexityComparisonTooltip({ children, comparisons }) {
  if (!comparisons || comparisons.length === 0) {
    return children;
  }

  const content = (
    <div className="space-y-2">
      {comparisons.map((comp, index) => (
        <div key={index} className="border-b border-gray-600 pb-2 last:border-b-0">
          <div className="font-medium text-yellow-400">{comp.algorithm}</div>
          <div className="text-sm text-blue-300">Time: {comp.time}</div>
          <div className="text-sm text-green-300">Space: {comp.space}</div>
        </div>
      ))}
    </div>
  );

  return (
    <EducationalTooltip content={content} title="Complexity Comparison" width="xl">
      {children}
    </EducationalTooltip>
  );
}

ComplexityComparisonTooltip.propTypes = {
  children: PropTypes.node.isRequired,
  comparisons: PropTypes.arrayOf(
    PropTypes.shape({
      algorithm: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      space: PropTypes.string.isRequired
    })
  ).isRequired
};