"use client";

import { forwardRef } from "react";

export interface NumberInputProps {
  /** The label text displayed above the input */
  label: string;
  /** The current value of the input */
  value: string;
  /** Callback function when value changes */
  onChange: (value: string) => void;
  /** Callback function when input loses focus */
  onBlur?: (value: string) => void;
  /** Error message to display below the input */
  error?: string;
  /** Helper text to display below the input */
  helperText?: string;
  /** Whether the input should take up full width of its container */
  fullWidth?: boolean;
  /** HTML id attribute for the input */
  id?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Optional icon to display on the left side of the input */
  leftIcon?: React.ReactNode;
  /** Optional icon to display on the right side of the input */
  rightIcon?: React.ReactNode;
}

/**
 * A number input component that provides currency formatting and validation.
 * Features include:
 * - Currency formatting
 * - Error and helper text support
 * - Required field indication
 * - Disabled state
 * - Left and right icons
 * - Customizable width
 *
 * @example
 * ```tsx
 * <NumberInput
 *   label="Amount"
 *   value={amount}
 *   onChange={handleAmountChange}
 *   required
 * />
 * ```
 */
const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      label,
      value,
      onChange,
      onBlur,
      error,
      helperText,
      fullWidth = true,
      id,
      required,
      disabled,
      placeholder,
      leftIcon,
      rightIcon,
    },
    ref,
  ) => {
    // Format number as currency string
    const formatValue = (value: string): string => {
      // Remove all non-numeric characters except decimal
      const cleanValue = value.replace(/[^0-9.]/g, "");

      // Handle multiple decimal points - keep only the first one
      const parts = cleanValue.split(".");
      const formattedValue =
        parts[0] + (parts.length > 1 ? "." + parts[1] : "");

      // If it ends with a decimal point, preserve it
      if (value.endsWith(".")) {
        return formattedValue;
      }

      // If it has a decimal part, format appropriately
      if (formattedValue.includes(".")) {
        const [whole, decimal] = formattedValue.split(".");
        const formattedWhole = new Intl.NumberFormat("en-US").format(
          parseFloat(whole),
        );
        return `${formattedWhole}.${decimal.slice(0, 2)}`;
      }

      // Format whole numbers
      const number = parseFloat(formattedValue);
      if (isNaN(number)) {
        return "";
      }

      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(number);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(formatValue(e.target.value));
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (!value) {
        onBlur?.(value);
        return;
      }

      const number = parseFloat(value.replace(/[^0-9.]/g, ""));
      if (isNaN(number)) {
        onBlur?.("");
        return;
      }

      const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(number);
      onBlur?.(formatted);
    };

    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {/* Label */}
        <label
          htmlFor={id}
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative mt-1.5">
          {/* Input container */}
          <div
            className={`
                            relative w-full rounded-md shadow-sm
                            ${disabled ? "bg-gray-50" : "bg-white"}
                        `}
          >
            {leftIcon && (
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                {leftIcon}
              </div>
            )}
            <input
              ref={ref}
              type="text"
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={disabled}
              placeholder={placeholder}
              id={id}
              className={`
                                block w-full rounded-md border-0 py-1.5
                                ${leftIcon ? "pl-10" : "pl-3"}
                                ${rightIcon ? "pr-10" : "pr-3"}
                                ${disabled ? "text-gray-500" : "text-gray-900"}
                                ${error ? "ring-red-300 focus:ring-red-500" : "ring-gray-300 focus:ring-primary-500"}
                                ring-1 ring-inset
                                focus:ring-2 focus:ring-inset
                                sm:text-sm sm:leading-6
                                placeholder:text-gray-400
                                disabled:cursor-not-allowed
                                disabled:bg-gray-50
                            `}
            />
            {rightIcon && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                {rightIcon}
              </div>
            )}
          </div>
        </div>
        {/* Error or helper text */}
        {(error || helperText) && (
          <p
            className={`mt-2 text-sm ${error ? "text-red-600" : "text-gray-500"}`}
            id={`${id}-description`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  },
);

NumberInput.displayName = "NumberInput";

export default NumberInput;
