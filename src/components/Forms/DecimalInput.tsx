"use client";

import React, { forwardRef } from "react";

export interface DecimalInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "onBlur" | "type"
  > {
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
  /** Maximum number of decimal places allowed */
  maxDecimalPlaces?: number;
}

/**
 * A decimal input component that allows decimal values without currency formatting.
 * Features include:
 * - Decimal input support
 * - Error and helper text support
 * - Required field indication
 * - Disabled state
 * - Left and right icons
 * - Customizable width
 * - Configurable decimal places
 *
 * @example
 * ```tsx
 * <DecimalInput
 *   label="Interest Rate"
 *   value={interestRate}
 *   onChange={handleInterestRateChange}
 *   rightIcon={<span>%</span>}
 *   maxDecimalPlaces={2}
 *   required
 * />
 * ```
 */
const DecimalInput = forwardRef<HTMLInputElement, DecimalInputProps>(
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
      maxDecimalPlaces = 2,
      ...props
    },
    ref,
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Allow empty string
      if (inputValue === "") {
        onChange("");
        return;
      }

      // Only allow numbers and one decimal point
      const cleanValue = inputValue.replace(/[^0-9.]/g, "");

      // Handle multiple decimal points - keep only the first one
      const parts = cleanValue.split(".");
      if (parts.length > 2) {
        const formattedValue = parts[0] + "." + parts.slice(1).join("");
        onChange(formattedValue);
        return;
      }

      // Limit decimal places
      if (parts.length === 2 && parts[1].length > maxDecimalPlaces) {
        const formattedValue =
          parts[0] + "." + parts[1].slice(0, maxDecimalPlaces);
        onChange(formattedValue);
        return;
      }

      onChange(cleanValue);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (!value) {
        onBlur?.(value);
        return;
      }

      const number = parseFloat(value);
      if (isNaN(number)) {
        onBlur?.("");
        return;
      }

      // Format to specified decimal places
      const formatted = number.toFixed(maxDecimalPlaces);
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
              {...props}
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

DecimalInput.displayName = "DecimalInput";

export default DecimalInput;
