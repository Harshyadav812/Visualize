import React from 'react';

/**
 * Card component with clean styling using design tokens
 * Provides Primary, Secondary, and Subtle variants with minimal borders and shadows
 * 
 * @typedef {Object} CardProps
 * @property {React.ReactNode} children - The card content
 * @property {string} [className=""] - Additional CSS classes
 * @property {'primary' | 'secondary' | 'subtle'} [variant='primary'] - Card variant
 * @property {'sm' | 'md' | 'lg'} [padding='md'] - Card padding size
 * @property {React.ElementType} [as] - The HTML element or component to render as
 */

/**
 * Base card styles using design tokens with enhanced transitions
 */
const baseCardStyles = `
  rounded-[var(--radius-md)]
  transition-all duration-[var(--duration-normal)] ease-[var(--ease-out)]
  transform-gpu
  will-change-transform
`;

/**
 * Padding variants using design tokens
 */
const paddingStyles = {
  sm: 'p-[var(--card-padding-sm)]',
  md: 'p-[var(--card-padding-md)]',
  lg: 'p-[var(--card-padding-lg)]'
};

/**
 * Variant styles using design tokens
 */
const variantStyles = {
  primary: `
    bg-[var(--card-primary-bg)]
    border border-[var(--card-primary-border)]
    shadow-[var(--shadow-sm)]
  `,
  secondary: `
    bg-[var(--card-secondary-bg)]
    border border-[var(--card-secondary-border)]
    shadow-[var(--shadow-sm)]
  `,
  subtle: `
    bg-[var(--card-subtle-bg)]
    border border-[var(--card-subtle-border)]
  `
};

/**
 * Card component with design token integration
 */
const Card = ({ 
  children, 
  className = "", 
  variant = 'primary', 
  padding = 'md',
  as: Component = 'div',
  ...props 
}) => {
  const cardClasses = [
    baseCardStyles,
    paddingStyles[padding],
    variantStyles[variant],
    className
  ].join(' ').replace(/\s+/g, ' ').trim();

  return (
    <Component
      className={cardClasses}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * Card Header component for consistent card headers
 */
const CardHeader = ({ children, className = "", ...props }) => (
  <div 
    className={`mb-[var(--spacing-md)] ${className}`}
    {...props}
  >
    {children}
  </div>
);

/**
 * Card Body component for main card content
 */
const CardBody = ({ children, className = "", ...props }) => (
  <div 
    className={`${className}`}
    {...props}
  >
    {children}
  </div>
);

/**
 * Card Footer component for card actions or metadata
 */
const CardFooter = ({ children, className = "", ...props }) => (
  <div 
    className={`mt-[var(--spacing-md)] pt-[var(--spacing-md)] border-t border-[var(--color-border-subtle)] ${className}`}
    {...props}
  >
    {children}
  </div>
);

/**
 * Convenience components for each variant
 */
Card.Primary = (props) => <Card variant="primary" {...props} />;
Card.Secondary = (props) => <Card variant="secondary" {...props} />;
Card.Subtle = (props) => <Card variant="subtle" {...props} />;

/**
 * Attach sub-components to Card
 */
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;