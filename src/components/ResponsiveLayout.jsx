import React from 'react'

/**
 * Responsive container component that provides consistent spacing and max-width
 */
export function ResponsiveContainer({ children, className = '', maxWidth = 'default' }) {
  const maxWidthClasses = {
    default: 'max-w-screen-xl',
    narrow: 'max-w-4xl',
    wide: 'max-w-screen-2xl',
    full: 'max-w-none'
  }

  return (
    <div className={`container-responsive ${maxWidthClasses[maxWidth]} ${className}`}>
      {children}
    </div>
  )
}

/**
 * Responsive grid component with configurable columns
 */
export function ResponsiveGrid({ children, columns = 'auto', className = '', gap = 'default' }) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-responsive-2',
    auto: 'grid-responsive-auto'
  }

  const gapClasses = {
    sm: 'gap-sm',
    default: 'gap-responsive',
    lg: 'gap-lg'
  }

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  )
}

/**
 * Responsive flex component with configurable direction and alignment
 */
export function ResponsiveFlex({ 
  children, 
  direction = 'column', 
  align = 'stretch', 
  justify = 'start',
  wrap = false,
  className = '' 
}) {
  const directionClass = direction === 'responsive' ? 'flex-responsive-column' : `flex-${direction}`
  const alignClass = align !== 'stretch' ? `items-${align}` : ''
  const justifyClass = justify !== 'start' ? `justify-${justify}` : ''
  const wrapClass = wrap ? 'flex-wrap' : ''

  return (
    <div className={`flex ${directionClass} ${alignClass} ${justifyClass} ${wrapClass} ${className}`}>
      {children}
    </div>
  )
}

/**
 * Responsive card component with consistent padding and styling
 */
export function ResponsiveCard({ children, variant = 'primary', className = '' }) {
  const variantClasses = {
    primary: 'surface-primary',
    secondary: 'surface-secondary',
    tertiary: 'surface-tertiary'
  }

  return (
    <div className={`${variantClasses[variant]} spacing-responsive ${className}`}>
      {children}
    </div>
  )
}

/**
 * Responsive section component for major layout sections
 */
export function ResponsiveSection({ 
  children, 
  spacing = 'default', 
  background = 'transparent',
  className = '' 
}) {
  const spacingClasses = {
    sm: 'py-4',
    default: 'spacing-responsive',
    lg: 'py-8 md:py-12 lg:py-16'
  }

  const backgroundClasses = {
    transparent: '',
    primary: 'bg-surface-primary',
    secondary: 'bg-surface-secondary'
  }

  return (
    <section className={`${spacingClasses[spacing]} ${backgroundClasses[background]} ${className}`}>
      {children}
    </section>
  )
}

/**
 * Responsive typography component
 */
export function ResponsiveText({ 
  children, 
  variant = 'body', 
  responsive = false,
  className = '' 
}) {
  const variantClasses = {
    display: responsive ? 'text-responsive-title font-bold' : 'text-display',
    title: responsive ? 'text-responsive-title font-bold' : 'text-heading',
    heading: responsive ? 'text-responsive-heading font-semibold' : 'text-heading',
    body: 'text-body',
    caption: 'text-caption',
    code: 'text-code'
  }

  const Component = variant === 'display' || variant === 'title' ? 'h1' : 
                   variant === 'heading' ? 'h2' : 
                   variant === 'code' ? 'code' : 'p'

  return (
    <Component className={`${variantClasses[variant]} ${className}`}>
      {children}
    </Component>
  )
}

/**
 * Responsive button component
 */
export function ResponsiveButton({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  className = '',
  ...props 
}) {
  const variantClasses = {
    primary: 'bg-button-primary-bg text-button-primary-text hover:bg-button-primary-hover',
    secondary: 'bg-button-secondary-bg text-button-secondary-text hover:bg-button-secondary-hover',
    ghost: 'bg-button-ghost-bg text-button-ghost-text hover:bg-button-ghost-hover'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[2rem]',
    md: 'px-4 py-2 text-base min-h-[2.5rem]',
    lg: 'px-6 py-3 text-lg min-h-[3rem]'
  }

  const widthClass = fullWidth ? 'w-full md:w-auto' : ''

  return (
    <button 
      className={`
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${widthClass}
        border-none rounded-md font-semibold cursor-pointer
        transition-colors duration-150 ease-out
        flex items-center justify-center gap-2
        focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

export default {
  Container: ResponsiveContainer,
  Grid: ResponsiveGrid,
  Flex: ResponsiveFlex,
  Card: ResponsiveCard,
  Section: ResponsiveSection,
  Text: ResponsiveText,
  Button: ResponsiveButton
}