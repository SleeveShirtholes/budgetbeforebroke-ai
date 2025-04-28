import { forwardRef } from "react";

/**
 * Props interface for the TextField component.
 * Extends the standard HTML input attributes with additional custom properties.
 */
export interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** The label text displayed above the input field */
  label: string;
  /** Error message to display below the input */
  error?: string;
  /** Helper text to display below the input when there's no error */
  helperText?: string;
  /** Optional element to display at the start of the input */
  startAdornment?: React.ReactNode;
  /** Optional element to display at the end of the input */
  endAdornment?: React.ReactNode;
  /** Whether the input should take up the full width of its container */
  fullWidth?: boolean;
  /** Whether the field is required - displays a red asterisk next to the label */
  required?: boolean;
}

/**
 * A customizable text input component with support for labels, error states, and helper text.
 * Implements the Material Design text field pattern with custom styling.
 *
 * @component
 * @example
 * ```tsx
 * <TextField
 *   label="Username"
 *   required
 *   placeholder="Enter username"
 *   error={errors.username}
 *   helperText="Must be at least 3 characters"
 *   startAdornment={<UserIcon className="h-5 w-5" />}
 * />
 * ```
 */
const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      error,
      helperText,
      startAdornment,
      endAdornment,
      fullWidth = true,
      className = "",
      required,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {/* Label with optional required indicator */}
        <label
          htmlFor={props.id}
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="mt-1.5 relative">
          {/* Optional start adornment (icon/text at start of input) */}
          {startAdornment && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {startAdornment}
            </div>
          )}
          {/* Main input element */}
          <input
            ref={ref}
            {...props}
            className={`
                            block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset
                            ${startAdornment ? "pl-7" : "pl-3"}
                            ${endAdornment ? "pr-10" : "pr-3"}
                            ${
                              error
                                ? "ring-red-300 placeholder-red-300 focus:ring-red-500"
                                : "ring-gray-300 placeholder-gray-400 focus:ring-primary-500"
                            }
                            focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
                            ${className}
                        `}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              helperText || error ? `${props.id}-description` : undefined
            }
          />
          {/* Optional end adornment (icon/text at end of input) */}
          {endAdornment && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {endAdornment}
            </div>
          )}
        </div>
        {/* Error or helper text display */}
        {(error || helperText) && (
          <p
            className={`mt-2 text-sm ${error ? "text-red-600" : "text-gray-500"}`}
            id={`${props.id}-description`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  },
);

TextField.displayName = "TextField";

export default TextField;
