import { ChangeEvent, forwardRef } from "react";

export interface RadioOption {
  value: string;
  label: string;
}

export interface CustomRadioGroupProps {
  /** The label text displayed above the radio group */
  label?: string;
  /** Array of options to display as radio buttons */
  options: RadioOption[];
  /** Currently selected value */
  value: string;
  /** Callback function when selection changes */
  onChange: (value: string, event?: ChangeEvent<HTMLInputElement>) => void;
  /** Error message to display below the radio group */
  error?: string;
  /** Helper text to display below the radio group */
  helperText?: string;
  /** Whether the radio group should take up full width of its container */
  fullWidth?: boolean;
  /** HTML id attribute for the radio group */
  id?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the radio group is disabled */
  disabled?: boolean;
  /** Name attribute for the radio group */
  name?: string;
}

/**
 * A custom radio group component that provides a set of radio buttons with consistent styling.
 * Features include:
 * - Accessible design with ARIA attributes
 * - Error and helper text support
 * - Required field indication
 * - Disabled state
 * - Customizable width
 * - Support for react-hook-form
 *
 * @example
 * ```tsx
 * <CustomRadioGroup
 *   label="Payment Method"
 *   options={[
 *     { value: "credit", label: "Credit Card" },
 *     { value: "debit", label: "Debit Card" }
 *   ]}
 *   value={selectedPayment}
 *   onChange={handlePaymentChange}
 *   required
 * />
 * ```
 */
const CustomRadioGroup = forwardRef<HTMLDivElement, CustomRadioGroupProps>(
  (
    {
      label,
      options,
      value,
      onChange,
      error,
      helperText,
      fullWidth = true,
      id,
      required,
      disabled,
      name,
    },
    ref,
  ) => {
    const groupId = id || name || "radio-group";
    const errorId = `${groupId}-error`;
    const descriptionId = `${groupId}-description`;

    return (
      <div
        className={`${fullWidth ? "w-full" : ""}`}
        ref={ref}
        role="radiogroup"
        aria-invalid={!!error}
        aria-errormessage={error ? errorId : undefined}
        aria-describedby={helperText ? descriptionId : undefined}
      >
        {/* Label (optional) */}
        {label && (
          <label className="block text-sm font-medium leading-6 text-gray-900">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="mt-2 space-y-2">
          {options.map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                type="radio"
                id={`${groupId}-${option.value}`}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value, e)}
                disabled={disabled}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <label
                htmlFor={`${groupId}-${option.value}`}
                className="ml-3 block text-sm font-medium text-gray-700"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
        {/* Error or helper text */}
        {error && (
          <p className="mt-2 text-sm text-red-600" id={errorId}>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500" id={descriptionId}>
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

CustomRadioGroup.displayName = "CustomRadioGroup";

export default CustomRadioGroup;
