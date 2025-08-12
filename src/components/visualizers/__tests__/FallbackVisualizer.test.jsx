import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  GenericFallbackVisualizer,
  ArrayFallbackVisualizer,
  TreeFallbackVisualizer,
  GraphFallbackVisualizer,
  LoadingFallbackVisualizer,
  EmptyStateFallbackVisualizer
} from '../FallbackVisualizer';

// Mock BaseVisualizer
vi.mock('../BaseVisualizer', () => ({
  default: ({ children, title }) => (
    <div data-testid="base-visualizer">
      <h3>{title}</h3>
      {children}
    </div>
  )
}));

describe('GenericFallbackVisualizer', () => {
  it('should render with default props', () => {
    render(<GenericFallbackVisualizer />);

    expect(screen.getByText('Visualization Unavailable')).toBeInTheDocument();
    expect(screen.getByText('💡 Troubleshooting Tips')).toBeInTheDocument();
  });

  it('should display error information when provided', () => {
    const error = new Error('Test error message');
    
    render(<GenericFallbackVisualizer error={error} />);

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should categorize data validation errors correctly', () => {
    const error = new Error('missing required property arrays');
    
    render(<GenericFallbackVisualizer error={error} />);

    expect(screen.getByText('📊')).toBeInTheDocument();
    expect(screen.getByText('Data Validation Error')).toBeInTheDocument();
    expect(screen.getByText(/Check that all required data properties are present/)).toBeInTheDocument();
  });

  it('should categorize rendering errors correctly', () => {
    const error = new Error('Cannot read property length of undefined');
    
    render(<GenericFallbackVisualizer error={error} />);

    expect(screen.getByText('🎨')).toBeInTheDocument();
    expect(screen.getByText('Rendering Error')).toBeInTheDocument();
    expect(screen.getByText(/Check that all data properties exist before accessing them/)).toBeInTheDocument();
  });

  it('should categorize performance errors correctly', () => {
    const error = new Error('Maximum call stack size exceeded');
    
    render(<GenericFallbackVisualizer error={error} />);

    expect(screen.getByText('⚡')).toBeInTheDocument();
    expect(screen.getByText('Performance Error')).toBeInTheDocument();
    expect(screen.getByText(/Check for infinite loops in rendering logic/)).toBeInTheDocument();
  });

  it('should categorize network errors correctly', () => {
    const error = new Error('Network request failed');
    
    render(<GenericFallbackVisualizer error={error} />);

    expect(screen.getByText('🌐')).toBeInTheDocument();
    expect(screen.getByText('Network Error')).toBeInTheDocument();
    expect(screen.getByText(/Check your internet connection/)).toBeInTheDocument();
  });

  it('should handle retry callback', () => {
    const onRetry = vi.fn();
    
    render(<GenericFallbackVisualizer onRetry={onRetry} />);

    const retryButton = screen.getByText('🔄 Try Again');
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalled();
  });

  it('should handle reset callback', () => {
    const onReset = vi.fn();
    
    render(<GenericFallbackVisualizer onReset={onReset} />);

    const resetButton = screen.getByText('🔄 Reset');
    fireEvent.click(resetButton);

    expect(onReset).toHaveBeenCalled();
  });

  it('should show raw data when provided', () => {
    const data = { test: 'data', nested: { value: 123 } };
    
    render(<GenericFallbackVisualizer data={data} />);

    const debugToggle = screen.getByText('🔍 Show Raw Data (Debug)');
    fireEvent.click(debugToggle);

    expect(screen.getByText(/"test": "data"/)).toBeInTheDocument();
    expect(screen.getByText(/"value": 123/)).toBeInTheDocument();
  });

  it('should use custom title when provided', () => {
    render(<GenericFallbackVisualizer title="Custom Error Title" />);

    expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
  });
});

describe('ArrayFallbackVisualizer', () => {
  it('should render array-specific error message', () => {
    const error = new Error('Invalid array data');
    
    render(<ArrayFallbackVisualizer error={error} />);

    expect(screen.getByText('📊')).toBeInTheDocument();
    expect(screen.getByText('Array Data Error')).toBeInTheDocument();
    expect(screen.getByText('Invalid array data')).toBeInTheDocument();
  });

  it('should show example array structure', () => {
    render(<ArrayFallbackVisualizer />);

    expect(screen.getByText('Example Array Structure')).toBeInTheDocument();
    expect(screen.getByText('This is how your array visualization should appear')).toBeInTheDocument();
    
    // Check for array elements
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should show expected data format', () => {
    render(<ArrayFallbackVisualizer />);

    expect(screen.getByText('Expected Data Format')).toBeInTheDocument();
    expect(screen.getByText(/"arrays":/)).toBeInTheDocument();
    expect(screen.getByText(/"pointers":/)).toBeInTheDocument();
    expect(screen.getByText(/"operations":/)).toBeInTheDocument();
  });

  it('should handle retry and reset callbacks', () => {
    const onRetry = vi.fn();
    const onReset = vi.fn();
    
    render(<ArrayFallbackVisualizer onRetry={onRetry} onReset={onReset} />);

    const retryButton = screen.getByText('🔄 Retry Visualization');
    const resetButton = screen.getByText('🔄 Reset Data');

    fireEvent.click(retryButton);
    fireEvent.click(resetButton);

    expect(onRetry).toHaveBeenCalled();
    expect(onReset).toHaveBeenCalled();
  });
});

describe('TreeFallbackVisualizer', () => {
  it('should render tree-specific error message', () => {
    const error = new Error('Invalid tree data');
    
    render(<TreeFallbackVisualizer error={error} />);

    expect(screen.getByText('🌳')).toBeInTheDocument();
    expect(screen.getByText('Tree Data Error')).toBeInTheDocument();
    expect(screen.getByText('Invalid tree data')).toBeInTheDocument();
  });

  it('should show example tree structure', () => {
    render(<TreeFallbackVisualizer />);

    expect(screen.getByText('Example Tree Structure')).toBeInTheDocument();
    expect(screen.getByText('This is how your tree visualization should appear')).toBeInTheDocument();
  });

  it('should show expected data format with nodes and edges', () => {
    render(<TreeFallbackVisualizer />);

    expect(screen.getByText('Expected Data Format')).toBeInTheDocument();
    expect(screen.getByText(/"nodes":/)).toBeInTheDocument();
    expect(screen.getByText(/"edges":/)).toBeInTheDocument();
    expect(screen.getByText(/"traversalPath":/)).toBeInTheDocument();
  });

  it('should handle retry and reset callbacks', () => {
    const onRetry = vi.fn();
    const onReset = vi.fn();
    
    render(<TreeFallbackVisualizer onRetry={onRetry} onReset={onReset} />);

    const retryButton = screen.getByText('🔄 Retry Visualization');
    const resetButton = screen.getByText('🔄 Reset Data');

    fireEvent.click(retryButton);
    fireEvent.click(resetButton);

    expect(onRetry).toHaveBeenCalled();
    expect(onReset).toHaveBeenCalled();
  });
});

describe('GraphFallbackVisualizer', () => {
  it('should render graph-specific error message', () => {
    const error = new Error('Invalid graph data');
    
    render(<GraphFallbackVisualizer error={error} />);

    expect(screen.getByText('🕸️')).toBeInTheDocument();
    expect(screen.getByText('Graph Data Error')).toBeInTheDocument();
    expect(screen.getByText('Invalid graph data')).toBeInTheDocument();
  });

  it('should show example graph structure', () => {
    render(<GraphFallbackVisualizer />);

    expect(screen.getByText('Example Graph Structure')).toBeInTheDocument();
    expect(screen.getByText('This is how your graph visualization should appear')).toBeInTheDocument();
  });

  it('should show expected data format with vertices and edges', () => {
    render(<GraphFallbackVisualizer />);

    expect(screen.getByText('Expected Data Format')).toBeInTheDocument();
    expect(screen.getByText(/"vertices":/)).toBeInTheDocument();
    expect(screen.getByText(/"edges":/)).toBeInTheDocument();
    expect(screen.getByText(/"algorithm":/)).toBeInTheDocument();
  });

  it('should handle retry and reset callbacks', () => {
    const onRetry = vi.fn();
    const onReset = vi.fn();
    
    render(<GraphFallbackVisualizer onRetry={onRetry} onReset={onReset} />);

    const retryButton = screen.getByText('🔄 Retry Visualization');
    const resetButton = screen.getByText('🔄 Reset Data');

    fireEvent.click(retryButton);
    fireEvent.click(resetButton);

    expect(onRetry).toHaveBeenCalled();
    expect(onReset).toHaveBeenCalled();
  });
});

describe('LoadingFallbackVisualizer', () => {
  it('should render loading animation and message', () => {
    render(<LoadingFallbackVisualizer />);

    expect(screen.getByText('Loading Visualization...')).toBeInTheDocument();
    expect(screen.getByText('Please wait while we prepare your visualization')).toBeInTheDocument();
    expect(screen.getByText('🧠')).toBeInTheDocument();
  });

  it('should show loading steps', () => {
    render(<LoadingFallbackVisualizer />);

    expect(screen.getByText('Analyzing algorithm structure')).toBeInTheDocument();
    expect(screen.getByText('Preparing visualization data')).toBeInTheDocument();
    expect(screen.getByText('Rendering components...')).toBeInTheDocument();
  });

  it('should use custom title and message when provided', () => {
    render(
      <LoadingFallbackVisualizer 
        title="Custom Loading Title"
        message="Custom loading message"
      />
    );

    expect(screen.getByText('Custom Loading Title')).toBeInTheDocument();
    expect(screen.getByText('Custom loading message')).toBeInTheDocument();
  });
});

describe('EmptyStateFallbackVisualizer', () => {
  it('should render empty state with default props', () => {
    render(<EmptyStateFallbackVisualizer />);

    expect(screen.getByText('No Data Available')).toBeInTheDocument();
    expect(screen.getByText("There's no data to visualize at the moment")).toBeInTheDocument();
    expect(screen.getByText('📋')).toBeInTheDocument(); // default icon
  });

  it('should use type-specific icons', () => {
    const { rerender } = render(<EmptyStateFallbackVisualizer type="array" />);
    expect(screen.getByText('📊')).toBeInTheDocument();

    rerender(<EmptyStateFallbackVisualizer type="tree" />);
    expect(screen.getByText('🌳')).toBeInTheDocument();

    rerender(<EmptyStateFallbackVisualizer type="graph" />);
    expect(screen.getByText('🕸️')).toBeInTheDocument();

    rerender(<EmptyStateFallbackVisualizer type="linkedlist" />);
    expect(screen.getByText('🔗')).toBeInTheDocument();

    rerender(<EmptyStateFallbackVisualizer type="stack" />);
    expect(screen.getByText('📚')).toBeInTheDocument();

    rerender(<EmptyStateFallbackVisualizer type="queue" />);
    expect(screen.getByText('🚶‍♂️')).toBeInTheDocument();
  });

  it('should show action button when callback provided', () => {
    const onAction = vi.fn();
    
    render(
      <EmptyStateFallbackVisualizer 
        onAction={onAction}
        actionLabel="Custom Action"
      />
    );

    const actionButton = screen.getByText('Custom Action');
    fireEvent.click(actionButton);

    expect(onAction).toHaveBeenCalled();
  });

  it('should not show action button when no callback provided', () => {
    render(<EmptyStateFallbackVisualizer />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should show getting started tips', () => {
    render(<EmptyStateFallbackVisualizer />);

    expect(screen.getByText('💡 Getting Started')).toBeInTheDocument();
    expect(screen.getByText(/Enter your algorithm problem and solution code/)).toBeInTheDocument();
    expect(screen.getByText(/Click "Analyze & Visualize" to generate visualization/)).toBeInTheDocument();
    expect(screen.getByText(/Use the controls to step through the algorithm/)).toBeInTheDocument();
    expect(screen.getByText(/Explore different data structures and algorithms/)).toBeInTheDocument();
  });

  it('should use custom title and message when provided', () => {
    render(
      <EmptyStateFallbackVisualizer 
        title="Custom Empty Title"
        message="Custom empty message"
      />
    );

    expect(screen.getByText('Custom Empty Title')).toBeInTheDocument();
    expect(screen.getByText('Custom empty message')).toBeInTheDocument();
  });
});

describe('Error Categorization', () => {
  it('should categorize no data error correctly', () => {
    render(<GenericFallbackVisualizer data={null} />);

    expect(screen.getByText('📋')).toBeInTheDocument();
    expect(screen.getByText('No Data Provided')).toBeInTheDocument();
    expect(screen.getByText(/Ensure your algorithm analysis completed successfully/)).toBeInTheDocument();
  });

  it('should categorize invalid data structure error correctly', () => {
    const error = new Error('invalid data structure');
    
    render(<GenericFallbackVisualizer error={error} />);

    expect(screen.getByText('⚠️')).toBeInTheDocument();
    expect(screen.getByText('Invalid Data Structure')).toBeInTheDocument();
    expect(screen.getByText(/Check that all required fields are present/)).toBeInTheDocument();
  });

  it('should categorize missing required fields error correctly', () => {
    const error = new Error('missing required field arrays');
    
    render(<GenericFallbackVisualizer error={error} />);

    expect(screen.getByText('🔍')).toBeInTheDocument();
    expect(screen.getByText('Missing Required Data')).toBeInTheDocument();
    expect(screen.getByText(/Ensure all required properties are included/)).toBeInTheDocument();
  });

  it('should categorize data type mismatch error correctly', () => {
    const error = new Error('expected array but got string');
    
    render(<GenericFallbackVisualizer error={error} />);

    expect(screen.getByText('🔄')).toBeInTheDocument();
    expect(screen.getByText('Data Type Mismatch')).toBeInTheDocument();
    expect(screen.getByText(/Check that arrays are actually arrays/)).toBeInTheDocument();
  });

  it('should use generic error category for unknown errors', () => {
    const error = new Error('some unknown error');
    
    render(<GenericFallbackVisualizer error={error} />);

    expect(screen.getByText('❌')).toBeInTheDocument();
    expect(screen.getByText('Visualization Error')).toBeInTheDocument();
    expect(screen.getByText(/Try refreshing the page and re-running the analysis/)).toBeInTheDocument();
  });
});

describe('Accessibility', () => {
  it('should have proper button attributes', () => {
    const onRetry = vi.fn();
    const onReset = vi.fn();
    
    render(<GenericFallbackVisualizer onRetry={onRetry} onReset={onReset} />);

    const retryButton = screen.getByText('🔄 Try Again');
    const resetButton = screen.getByText('🔄 Reset');

    expect(retryButton).toHaveAttribute('type', 'button');
    expect(resetButton).toHaveAttribute('type', 'button');
  });

  it('should have proper details/summary structure', () => {
    const data = { test: 'data' };
    
    render(<GenericFallbackVisualizer data={data} />);

    const summary = screen.getByText('🔍 Show Raw Data (Debug)');
    expect(summary.tagName).toBe('SUMMARY');
    
    const details = summary.closest('details');
    expect(details).toBeInTheDocument();
  });

  it('should have proper color contrast for error states', () => {
    render(<ArrayFallbackVisualizer />);

    const errorContainer = screen.getByText('Array Data Error').closest('div');
    expect(errorContainer).toHaveClass('bg-red-900/30', 'border-red-600/50');
  });

  it('should have proper semantic structure', () => {
    render(<GenericFallbackVisualizer />);

    // Should have proper heading hierarchy
    const mainHeading = screen.getByText('Visualization Error');
    expect(mainHeading.tagName).toBe('H3');

    const subHeading = screen.getByText('💡 Troubleshooting Tips');
    expect(subHeading.tagName).toBe('H4');
  });
});

describe('Integration with BaseVisualizer', () => {
  it('should pass props to BaseVisualizer correctly', () => {
    const stepData = { step: 1, description: 'Test step' };
    const data = { test: 'data' };
    
    render(
      <ArrayFallbackVisualizer 
        data={data}
        stepData={stepData}
        title="Custom Title"
      />
    );

    expect(screen.getByTestId('base-visualizer')).toBeInTheDocument();
    expect(screen.getByText('Array Visualization Error')).toBeInTheDocument();
  });

  it('should work without optional props', () => {
    render(<GenericFallbackVisualizer />);

    expect(screen.getByTestId('base-visualizer')).toBeInTheDocument();
    expect(screen.getByText('Visualization Unavailable')).toBeInTheDocument();
  });
});