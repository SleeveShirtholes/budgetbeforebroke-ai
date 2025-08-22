"use client";

import { ButtonHTMLAttributes, ReactNode, useRef, useEffect } from "react";

import Link from "next/link";

/**
 * Available button variants
 * @typedef {Object} ButtonVariant
 * @property {string} primary - Purple background with white text
 * @property {string} secondary - Light blue background with blue text
 * @property {string} outline - Purple border with purple text
 * @property {string} text - Text-only with hover underline
 * @property {string} danger - Red background with white text
 */
type ButtonVariant = "primary" | "secondary" | "outline" | "text" | "danger";

/**
 * Available button sizes
 * @typedef {Object} ButtonSize
 * @property {string} sm - Small button
 * @property {string} md - Medium button (default)
 * @property {string} lg - Large button
 */
type ButtonSize = "sm" | "md" | "lg";

/**
 * Button component props
 * @interface ButtonProps
 * @extends {ButtonHTMLAttributes<HTMLButtonElement>}
 * @property {ButtonVariant} [variant="primary"] - The visual style of the button
 * @property {ButtonSize} [size="md"] - The size of the button
 * @property {string} [href] - If provided, renders as a Next.js Link instead of a button
 * @property {ReactNode} children - The content of the button
 * @property {string} [className] - Additional CSS classes to apply
 * @property {boolean} [fullWidth=false] - Whether the button should take full width
 * @property {boolean} [isLoading=false] - Whether the button is in a loading state
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  isLoading?: boolean;
}

/**
 * Style definitions for each button variant
 * @constant
 * @type {Record<ButtonVariant, string>}
 */
const variantStyles = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg hover:-translate-y-1",
  secondary:
    "bg-secondary-100 text-secondary-700 hover:bg-secondary-200 hover:shadow-md hover:-translate-y-0.5",
  outline:
    "border-2 border-primary-600 text-primary-600 hover:bg-primary-50 hover:border-primary-700 hover:shadow-md hover:-translate-y-0.5",
  text: "text-primary-600 hover:text-primary-800 hover:underline",
  danger:
    "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:-translate-y-1",
};

/**
 * Style definitions for each button size
 * @constant
 * @type {Record<ButtonSize, string>}
 */
const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-8 py-3 text-lg",
};

/**
 * A reusable button component that supports multiple variants, sizes, and can render as either a button or a link.
 *
 * @example
 * ```tsx
 * // Primary button
 * <Button variant="primary" href="/signup">Sign Up</Button>
 *
 * // Secondary button
 * <Button variant="secondary">Secondary Action</Button>
 *
 * // Outline button
 * <Button variant="outline">Outline Button</Button>
 *
 * // Text link
 * <Button variant="text" href="/login">Sign In</Button>
 *
 * // Large button
 * <Button variant="primary" size="lg">Large Button</Button>
 *
 * // Full width button
 * <Button variant="primary" fullWidth>Full Width</Button>
 *
 * // Loading state
 * <Button variant="primary" isLoading>Loading...</Button>
 * ```
 *
 * @param {ButtonProps} props - The props for the Button component
 * @returns {JSX.Element} A button or link element with the specified styles
 */
export default function Button({
  variant = "primary",
  size = "md",
  href,
  children,
  className = "",
  fullWidth = false,
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Measure button content width and set it as a CSS custom property
  useEffect(() => {
    if (buttonRef.current && !isLoading) {
      const button = buttonRef.current;
      const contentWidth = button.scrollWidth;
      button.style.setProperty("--button-content-width", `${contentWidth}px`);
    }
  }, [children, isLoading]);

  const baseStyles =
    "rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center";
  const widthStyle = fullWidth ? "w-full" : "";
  const loadingStyles = isLoading ? "opacity-70 cursor-not-allowed" : "";
  // Ensure consistent width by using min-width that accommodates both text and spinner
  const consistentWidthStyle = isLoading
    ? "min-w-[var(--button-content-width)]"
    : "";

  const buttonStyles = `
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${widthStyle}
        ${loadingStyles}
        ${consistentWidthStyle}
        ${className}
    `;

  if (href) {
    return (
      <Link href={href} className={buttonStyles}>
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={buttonRef}
      className={buttonStyles}
      disabled={disabled || isLoading}
      aria-label={
        isLoading
          ? typeof children === "string"
            ? children
            : "Loading..."
          : undefined
      }
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
