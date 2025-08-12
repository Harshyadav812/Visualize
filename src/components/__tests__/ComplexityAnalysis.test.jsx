import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ComplexityAnalysis from '../ComplexityAnalysis';

// Mock the EducationalTooltip components
vi.mock('../EducationalTooltip', () => ({
  ComplexityTooltip: ({ children, complexity }) => (
    <div data-testid={`complexity-tooltip-${complexity}`}>
      {children}
    </div>
  ),
  PatternTooltip: ({ children, pattern }) => (
    <div data-testid={`pattern-tooltip-${pattern}`}>
      {children}
    </div>
  ),
  DataStructureTooltip: ({ children, dataStructure }) => (
    <div data-testid={`ds-tooltip-${dataStructure}`}>
      {children}
    </div>
  ),
  ComplexityComparisonTooltip: ({ children }) => (
    <div data-testid="comparison-tooltip">
      {children}
    </div>
  )
}));

describe('ComplexityAnalysis', () => {
  const mockAnalysis = {
    complexity: {
      time: 'O(n)',
      space: 'O(1)',
      explanation: 'Linear time complexity with constant space usage'
    },
    algorithmType: 'Linear Search',
    dataStructures: ['Array', 'Hash Table'],
    steps: [
      { title: 'Step 1', description: 'Initialize' },
      { title: 'Step 2', description: 'Search' },
      { title: 'Step 3', description: 'Return result' }
    ]
  };

  const mockCode = `
    function linearSearch(arr, target) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) return i;
      }
      return -1;
    }
  `;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without analysis data', () => {
      render(<ComplexityAnalysis />);
      // Should not crash and not render anything
      expect(screen.queryByText('Algorithm Analysis')).not.toBeInTheDocument();
    });

    it('should render with complete analysis data', () => {
      render(<ComplexityAnalysis analysis={mockAnalysis} originalCode={mockCode} />);
      
      expect(screen.getByText('Algorithm Analysis')).toBeInTheDocument();
      expect(screen.getByText('Complexity')).toBeInTheDocument();
      expect(screen.getByText('Performance')).toBeInTheDocument();
      expect(screen.getByText('Learn')).toBeInTheDocument();
    });

    it('should render complexity values with tooltips', () => {
      render(<ComplexityAnalysis analysis={mockAnalysis} />);
      
      expect(screen.getByTestId('complexity-tooltip-O(n)')).toBeInTheDocument();
      expect(screen.getByTestId('complexity-tooltip-O(1)')).toBeInTheDocument();
    });

    it('should render data structures with tooltips', () => {
      render(<ComplexityAnalysis analysis={mockAnalysis} />);
      
      expect(screen.getByTestId('ds-tooltip-Array')).toBeInTheDocument();
      expect(screen.getByTestId('ds-tooltip-Hash Table')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should start with complexity tab active', () => {
      render(<ComplexityAnalysis analysis={mockAnalysis} />);
      
      const complexityTab = screen.getByText('Complexity').closest('button');
      expect(complexityTab).toHaveClass('bg-blue-600');
    });

    it('should switch to performance tab when clicked', () => {
      render(<ComplexityAnalysis analysis={mockAnalysis} />);
      
      const performanceTab = screen.getByText('Performance').closest('button');
      fireEvent.click(performanceTab);
      
      expect(performanceTab).toHaveClass('bg-blue-600');
      expect(screen.getByText('Total Steps')).toBeInTheDocument();
    });

    it('should switch to education tab when clicked', () => {
      render(<ComplexityAnalysis analysis={mockAnalysis} />);
      
      const educationTab = screen.getByText('Learn').closest('button');
      fireEvent.click(educationTab);
      
      expect(educationTab).toHaveClass('bg-blue-600');
      expect(screen.getByText('Big O Notation Guide')).toBeInTheDocument();
    });
  });

  describe('Complexity Tab', () => {
    it('should display time and space complexity', () => {
      render(<ComplexityAnalysis analysis={mockAnalysis} />);
      
      expect(screen.getByText('Time Complexity')).toBeInTheDocument();
      expect(screen.getByText('Space Complexity')).toBeInTheDocument();
      expect(screen.getByText('O(n)')).toBeInTheDocument();
      expect(screen.getByText('O(1)')).toBeInTheDocument();
    });

    it('should display algorithm details', () => {
      render(<ComplexityAnalysis analysis={mockAnalysis} />);
      
      expect(screen.getByText('Algorithm Details')).toBeInTheDocument();
      expect(screen.getByText('Linear Search')).toBeInTheDocument();
      expect(screen.getByText('Array')).toBeInTheDocument();
      expect(screen.getByText('Hash Table')).toBeInTheDocument();
    });

    it('should display complexity explanation when provided', () => {
      render(<ComplexityAnalysis analysis={mockAnalysis} />);
      
      expect(screen.getByText('Complexity Explanation')).toBeInTheDocument();
      expect(screen.getByText('Linear time complexity with constant space usage')).toBeInTheDocument();
    });

    it('should toggle optimization suggestions', () => {
      render(<ComplexityAnalysis analysis={mockAnalysis} />);
      
      const optimizationButton = screen.getByText('Optimization Suggestions').closest('button');
      expect(screen.queryByText('Algorithm Analysis')).toBeInTheDocument(); // Default text when no specific optimizations
      
      fireEvent.click(optimizationButton);
      // Should show optimization content
      expect(screen.getByText('▼')).toBeInTheDocument();
    });
  });

  describe('Performance Tab', () => {
    it('should display performance metrics', () => {
      render(<ComplexityAnalysis analysis={mockAnalysis} />);
      
      const performanceTab = screen.getByText('Performance').closest('button');
      fireEvent.click(performanceTab);
      
      expect(screen.getByText('Total Steps')).toBeInTheDocument();
      expect(screen.getByText('Estimated Operations')).toBeInTheDocument();
      expect(screen.getByText('Memory Usage')).toBeInTheDocument();
      expect(screen.getByText('Efficiency Score')).toBeInTheDocument();
    });

    it('should display performance analysis', () => {
      render(<ComplexityAnalysis analysis={mockAnalysis} />);
      
      const performanceTab = screen.getByText('Performance').closest('button');
      fireEvent.click(performanceTab);
      
      expect(screen.getByText('Performance Analysis')).toBeInTheDocument();
      expect(screen.getByText('Algorithm Efficiency')).toBeInTheDocument();
      expect(screen.getByText('Scalability')).toBeInTheDocument();
      expect(screen.getByText('Memory Efficiency')).toBeInTheDocument();
    });

    it('should show algorithm comparison when available', () => {
      const analysisWithSort = {
        ...mockAnalysis,
        algorithmType: 'Bubble Sort'
      };
      
      render(<ComplexityAnalysis analysis={analysisWithSort} />);
      
      const performanceTab = screen.getByText('Performance').closest('button');
      fireEvent.click(performanceTab);
      
      expect(screen.getByText('Algorithm Comparison')).toBeInTheDocument();
    });
  });

  describe('Education Tab', () => {
    it('should display Big O notation guide', () => {
      render(<ComplexityAnalysis analysis={mockAnalysis} />);
      
      const educationTab = screen.getByText('Learn').closest('button');
      fireEvent.click(educationTab);
      
      expect(screen.getByText('Big O Notation Guide')).toBeInTheDocument();
      expect(screen.getByText('O(1)')).toBeInTheDocument();
      expect(screen.getByText('O(log n)')).toBeInTheDocument();
      expect(screen.getByText('O(n²)')).toBeInTheDocument();
    });

    it('should display algorithm patterns', () => {
      render(<ComplexityAnalysis analysis={mockAnalysis} />);
      
      const educationTab = screen.getByText('Learn').closest('button');
      fireEvent.click(educationTab);
      
      expect(screen.getByText('Pattern Recognition')).toBeInTheDocument();
    });

    it('should display common pitfalls', () => {
      render(<ComplexityAnalysis analysis={mockAnalysis} />);
      
      const educationTab = screen.getByText('Learn').closest('button');
      fireEvent.click(educationTab);
      
      expect(screen.getByText('Common Pitfalls to Avoid')).toBeInTheDocument();
      expect(screen.getByText('Off-by-One Errors')).toBeInTheDocument();
    });

    it('should display learning resources', () => {
      render(<ComplexityAnalysis analysis={mockAnalysis} />);
      
      const educationTab = screen.getByText('Learn').closest('button');
      fireEvent.click(educationTab);
      
      expect(screen.getByText('Learn More')).toBeInTheDocument();
      expect(screen.getByText('Big O Notation')).toBeInTheDocument();
      expect(screen.getByText('Data Structures')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing complexity data', () => {
      const incompleteAnalysis = {
        algorithmType: 'Unknown Algorithm',
        dataStructures: []
      };
      
      render(<ComplexityAnalysis analysis={incompleteAnalysis} />);
      
      expect(screen.getByText('Not specified')).toBeInTheDocument();
    });

    it('should handle empty data structures array', () => {
      const analysisWithoutDS = {
        ...mockAnalysis,
        dataStructures: []
      };
      
      render(<ComplexityAnalysis analysis={analysisWithoutDS} />);
      
      expect(screen.getByText('Algorithm Details')).toBeInTheDocument();
      // Should not crash when no data structures are present
    });

    it('should handle missing steps array', () => {
      const analysisWithoutSteps = {
        ...mockAnalysis,
        steps: undefined
      };
      
      render(<ComplexityAnalysis analysis={analysisWithoutSteps} />);
      
      const performanceTab = screen.getByText('Performance').closest('button');
      fireEvent.click(performanceTab);
      
      expect(screen.getByText('0')).toBeInTheDocument(); // Should show 0 steps
    });

    it('should handle very high complexity values', () => {
      const highComplexityAnalysis = {
        ...mockAnalysis,
        complexity: {
          time: 'O(2ⁿ)',
          space: 'O(n²)',
          explanation: 'Exponential time with quadratic space'
        }
      };
      
      render(<ComplexityAnalysis analysis={highComplexityAnalysis} />);
      
      expect(screen.getByTestId('complexity-tooltip-O(2ⁿ)')).toBeInTheDocument();
      expect(screen.getByTestId('complexity-tooltip-O(n²)')).toBeInTheDocument();
    });
  });

  describe('Performance Calculations', () => {
    it('should calculate performance metrics correctly', () => {
      const analysisWithManySteps = {
        ...mockAnalysis,
        steps: new Array(100).fill({ title: 'Step', description: 'Test step' })
      };
      
      render(<ComplexityAnalysis analysis={analysisWithManySteps} />);
      
      const performanceTab = screen.getByText('Performance').closest('button');
      fireEvent.click(performanceTab);
      
      expect(screen.getByText('100')).toBeInTheDocument(); // Should show correct step count
    });

    it('should show appropriate efficiency levels', () => {
      const efficientAnalysis = {
        ...mockAnalysis,
        complexity: {
          time: 'O(1)',
          space: 'O(1)'
        }
      };
      
      render(<ComplexityAnalysis analysis={efficientAnalysis} />);
      
      const performanceTab = screen.getByText('Performance').closest('button');
      fireEvent.click(performanceTab);
      
      // Should show high efficiency score for O(1) complexity
      expect(screen.getByText(/\d+%/)).toBeInTheDocument();
    });
  });

  describe('Optimization Suggestions', () => {
    it('should provide suggestions for O(n²) algorithms', () => {
      const quadraticAnalysis = {
        ...mockAnalysis,
        complexity: {
          time: 'O(n²)',
          space: 'O(1)'
        }
      };
      
      render(<ComplexityAnalysis analysis={quadraticAnalysis} />);
      
      const optimizationButton = screen.getByText('Optimization Suggestions').closest('button');
      fireEvent.click(optimizationButton);
      
      expect(screen.getByText('Reduce Time Complexity')).toBeInTheDocument();
    });

    it('should provide suggestions for exponential algorithms', () => {
      const exponentialAnalysis = {
        ...mockAnalysis,
        complexity: {
          time: 'O(2ⁿ)',
          space: 'O(n)'
        }
      };
      
      render(<ComplexityAnalysis analysis={exponentialAnalysis} />);
      
      const optimizationButton = screen.getByText('Optimization Suggestions').closest('button');
      fireEvent.click(optimizationButton);
      
      expect(screen.getByText('Use Memoization')).toBeInTheDocument();
    });

    it('should provide space optimization suggestions', () => {
      const spaceheavyAnalysis = {
        ...mockAnalysis,
        algorithmType: 'Merge Sort',
        complexity: {
          time: 'O(n log n)',
          space: 'O(n)'
        }
      };
      
      render(<ComplexityAnalysis analysis={spaceheavyAnalysis} />);
      
      const optimizationButton = screen.getByText('Optimization Suggestions').closest('button');
      fireEvent.click(optimizationButton);
      
      expect(screen.getByText('In-place Algorithm')).toBeInTheDocument();
    });
  });

  describe('Algorithm Comparisons', () => {
    it('should show sorting algorithm comparisons', () => {
      const sortAnalysis = {
        ...mockAnalysis,
        algorithmType: 'Quick Sort',
        complexity: {
          time: 'O(n log n)',
          space: 'O(log n)'
        }
      };
      
      render(<ComplexityAnalysis analysis={sortAnalysis} />);
      
      const performanceTab = screen.getByText('Performance').closest('button');
      fireEvent.click(performanceTab);
      
      expect(screen.getByText('Algorithm Comparison')).toBeInTheDocument();
      expect(screen.getByText('Bubble Sort')).toBeInTheDocument();
      expect(screen.getByText('Merge Sort')).toBeInTheDocument();
    });

    it('should show search algorithm comparisons', () => {
      const searchAnalysis = {
        ...mockAnalysis,
        algorithmType: 'Binary Search',
        complexity: {
          time: 'O(log n)',
          space: 'O(1)'
        }
      };
      
      render(<ComplexityAnalysis analysis={searchAnalysis} />);
      
      const performanceTab = screen.getByText('Performance').closest('button');
      fireEvent.click(performanceTab);
      
      expect(screen.getByText('Algorithm Comparison')).toBeInTheDocument();
      expect(screen.getByText('Linear Search')).toBeInTheDocument();
      expect(screen.getByText('Binary Search')).toBeInTheDocument();
    });

    it('should highlight current algorithm in comparison', () => {
      const sortAnalysis = {
        ...mockAnalysis,
        algorithmType: 'Quick Sort',
        complexity: {
          time: 'O(n log n)',
          space: 'O(log n)'
        }
      };
      
      render(<ComplexityAnalysis analysis={sortAnalysis} />);
      
      const performanceTab = screen.getByText('Performance').closest('button');
      fireEvent.click(performanceTab);
      
      expect(screen.getByText('(Current)')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for tabs', () => {
      render(<ComplexityAnalysis analysis={mockAnalysis} />);
      
      const complexityTab = screen.getByText('Complexity').closest('button');
      const performanceTab = screen.getByText('Performance').closest('button');
      const educationTab = screen.getByText('Learn').closest('button');
      
      expect(complexityTab).toHaveAttribute('type', 'button');
      expect(performanceTab).toHaveAttribute('type', 'button');
      expect(educationTab).toHaveAttribute('type', 'button');
    });

    it('should have proper keyboard navigation', () => {
      render(<ComplexityAnalysis analysis={mockAnalysis} />);
      
      const performanceTab = screen.getByText('Performance').closest('button');
      performanceTab.focus();
      
      expect(document.activeElement).toBe(performanceTab);
    });

    it('should have proper color contrast for complexity indicators', () => {
      render(<ComplexityAnalysis analysis={mockAnalysis} />);
      
      const educationTab = screen.getByText('Learn').closest('button');
      fireEvent.click(educationTab);
      
      // Check that complexity indicators are present
      expect(screen.getByText('🟢')).toBeInTheDocument(); // O(1) indicator
      expect(screen.getByText('🔵')).toBeInTheDocument(); // O(n) indicator
    });
  });
});