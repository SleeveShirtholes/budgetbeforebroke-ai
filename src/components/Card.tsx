import { ReactNode, HTMLAttributes } from "react";

/**
 * Card component that provides a flexible container with different styling options.
 *
 * @param {ReactNode} children - The content to be displayed inside the card
 * @param {string} [className] - Additional CSS classes to be applied to the card
 * @param {"default" | "outline" | "filled"} [variant="default"] - The visual style variant of the card
 * @param {"none" | "sm" | "md" | "lg"} [padding="md"] - The amount of padding to apply to the card
 * @returns {JSX.Element} A styled card container
 */
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  variant?: "default" | "outline" | "filled";
  padding?: "none" | "sm" | "md" | "lg";
}

const Card = ({
  children,
  className = "",
  variant = "default",
  padding = "md",
  ...rest
}: CardProps) => {
  // Base styles that are always applied to the card
  const baseStyles = "rounded-xl shadow";

  // Different visual variants of the card
  const variantStyles = {
    default: "bg-white border border-secondary-100", // White background with light border
    outline: "bg-transparent border border-secondary-200", // Transparent with darker border
    filled: "bg-secondary-50 border border-secondary-100", // Light gray background
  };

  // Padding options for the card content
  const paddingStyles = {
    none: "", // No padding
    sm: "p-4", // Small padding
    md: "p-6", // Medium padding (default)
    lg: "p-8", // Large padding
  };

  // Combine all styles
  const combinedStyles = [
    baseStyles,
    variantStyles[variant],
    paddingStyles[padding],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={combinedStyles} {...rest}>
      {children}
    </div>
  );
};

export default Card;
