import React from 'react';

/**
 * Typography component system with consistent styling using design tokens
 * Provides Display, Heading, Body, Caption, and Code variants
 * 
 * @typedef {Object} TypographyProps
 * @property {React.ReactNode} children - The content to render
 * @property {string} [className=""] - Additional CSS classes
 * @property {React.ElementType} [as] - The HTML element or component to render as
 */

const Typography = {
  /**
   * Display text - Used for app titles and major headings
   * @param {TypographyProps & {as?: React.ElementType}} props
   */
  Display: ({ children, className = "", as: Component = "h1", ...props }) => (
    <Component 
      className={`text-display ${className}`}
      {...props}
    >
      {children}
    </Component>
  ),

  /**
   * Heading text - Used for section titles and important labels
   * @param {TypographyProps & {as?: React.ElementType}} props
   */
  Heading: ({ children, className = "", as: Component = "h2", ...props }) => (
    <Component 
      className={`text-heading ${className}`}
      {...props}
    >
      {children}
    </Component>
  ),

  /**
   * Body text - Used for primary content and descriptions
   * @param {TypographyProps & {as?: React.ElementType}} props
   */
  Body: ({ children, className = "", as: Component = "p", ...props }) => (
    <Component 
      className={`text-body ${className}`}
      {...props}
    >
      {children}
    </Component>
  ),

  /**
   * Caption text - Used for metadata and secondary information
   * @param {TypographyProps & {as?: React.ElementType}} props
   */
  Caption: ({ children, className = "", as: Component = "span", ...props }) => (
    <Component 
      className={`text-caption ${className}`}
      {...props}
    >
      {children}
    </Component>
  ),

  /**
   * Code text - Used for monospace code display
   * @param {TypographyProps & {as?: React.ElementType}} props
   */
  Code: ({ children, className = "", as: Component = "code", ...props }) => (
    <Component 
      className={`text-code ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
};

export default Typography;