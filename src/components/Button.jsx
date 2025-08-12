import React from 'react';

/**
 * Button component with minimal styling using design tokens
 * Provides Primary, Secondary, and Ghost variants without unnecessary icons
 * 
 * @typedef {Object} ButtonProps
 * @property {React.ReactNode} children - The button content
 * @property {string} [className=""] - Additional CSS classes
 * @property {'primary' | 'secondary' | 'ghost'} [variant='primary'] - Button variant
 * @property {'sm' | 'md' | 'lg'} [size='md'] - Button size
 * @property {boolean} [disabled=false] - Whether the button is disabled
 * @property {React.ElementType} [as] - The HTML element or component to render as
 * @property {Function} [onClick] - Click handler
 */

/**
 * Base button styles using design tokens with enhanced transitions
 */
const baseButtonStyles = `
  inline-flex items-center justify-center
  font-medium text-center
  border border-transparent
  transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]
  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-background-primary)]
  disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
  select-none
  transform-gpu
  will-change-transform
`;

/**
 * Size variants
 */
const sizeStyles = {
  sm: `
    h-[var(--button-height-sm)] px-[var(--button-padding-x-sm)]
    text-[var(--font-size-sm)] rounded-[var(--radius-sm)]
  `,
  md: `
    h-[var(--button-height-md)] px-[var(--button-padding-x-md)]
    text-[var(--font-size-base)] rounded-[var(--radius-md)]
  `,
  lg: `
    h-[var(--button-height-lg)] px-[var(--button-padding-x-lg)]
    text-[var(--font-size-lg)] rounded-[var(--radius-lg)]
  `
};

/**
 * Variant styles using design tokens
 */
const variantStyles = {
  primary: `
    bg-[var(--button-primary-bg)] text-[var(--button-primary-text)]
    hover:bg-[var(--button-primary-hover)] active:bg-[var(--button-primary-active)]
    focus:ring-[var(--color-accent-primary)]
    shadow-[var(--shadow-sm)]
  `,
  secondary: `
    bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)]
    border-[var(--color-border-primary)]
    hover:bg-[var(--button-secondary-hover)] active:bg-[var(--button-secondary-active)]
    focus:ring-[var(--color-accent-primary)]
  `,
  ghost: `
    bg-[var(--button-ghost-bg)] text-[var(--button-ghost-text)]
    hover:bg-[var(--button-ghost-hover)] active:bg-[var(--button-ghost-active)]
    focus:ring-[var(--color-accent-primary)]
  `
};

/**
 * Button component with design token integration
 */
const Button = ({ 
  children, 
  className = "", 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  as: Component = 'button',
  onClick,
  ...props 
}) => {
  const buttonClasses = [
    baseButtonStyles,
    sizeStyles[size],
    variantStyles[variant],
    className
  ].join(' ').replace(/\s+/g, ' ').trim();

  return (
    <Component
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * Convenience components for each variant
 */
Button.Primary = (props) => <Button variant="primary" {...props} />;
Button.Secondary = (props) => <Button variant="secondary" {...props} />;
Button.Ghost = (props) => <Button variant="ghost" {...props} />;

export default Button;