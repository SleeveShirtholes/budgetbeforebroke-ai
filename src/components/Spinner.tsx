import React from "react";

/**
 * Props interface for the Spinner component
 * @interface SpinnerProps
 * @property {('sm'|'md'|'lg')} [size='md'] - The size of the spinner. Can be 'sm', 'md', or 'lg'
 * @property {string} [className=''] - Additional CSS classes to apply to the spinner container
 */
interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * A loading spinner component that displays an animated circular loading indicator.
 * The spinner can be customized with different sizes and additional CSS classes.
 *
 * @component
 * @example
 * // Default medium-sized spinner
 * <Spinner />
 *
 * @example
 * // Small spinner with custom class
 * <Spinner size="sm" className="my-4" />
 *
 * @param {SpinnerProps} props - The component props
 * @returns {JSX.Element} A loading spinner component
 */
const Spinner: React.FC<SpinnerProps> = ({ size = "md", className = "" }) => {
  // Size mapping for different spinner dimensions
  const sizeClasses = {
    sm: "w-4 h-4", // Small: 16x16 pixels
    md: "w-8 h-8", // Medium: 32x32 pixels
    lg: "w-12 h-12", // Large: 48x48 pixels
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-primary-600`}
        role="status"
        aria-label="loading"
      />
    </div>
  );
};

export default Spinner;
