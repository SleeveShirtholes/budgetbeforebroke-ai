import { forwardRef } from "react";

/**
 * Props interface for the TextArea component.
 * Extends the standard HTML textarea attributes with additional custom properties.
 */
export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** The label text displayed above the textarea */
    label: string;
    /** Error message to display below the textarea */
    error?: string;
    /** Helper text to display below the textarea when there's no error */
    helperText?: string;
    /** Whether the textarea should take up the full width of its container */
    fullWidth?: boolean;
    /** Whether the field is required - displays a red asterisk next to the label */
    required?: boolean;
}

/**
 * A customizable textarea component with support for labels, error states, and helper text.
 * Implements the Material Design text area pattern with custom styling.
 *
 * @component
 * @example
 * ```tsx
 * <TextArea
 *   label="Description"
 *   required
 *   placeholder="Enter description"
 *   rows={4}
 *   error={errors.description}
 *   helperText="Maximum 500 characters"
 * />
 * ```
 */
const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ label, error, helperText, fullWidth = true, className = "", rows = 3, required, ...props }, ref) => {
        return (
            <div className={`${fullWidth ? "w-full" : ""}`}>
                {/* Label with optional required indicator */}
                <label htmlFor={props.id} className="block text-sm font-medium leading-6 text-gray-900">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="mt-1.5">
                    {/* Main textarea element */}
                    <textarea
                        ref={ref}
                        rows={rows}
                        {...props}
                        className={`
                            block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset
                            ${
                                error
                                    ? "ring-red-300 placeholder-red-300 focus:ring-red-500"
                                    : "ring-gray-300 placeholder-gray-400 focus:ring-primary-500"
                            }
                            focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
                            ${className}
                        `}
                        aria-invalid={error ? "true" : "false"}
                        aria-describedby={helperText || error ? `${props.id}-description` : undefined}
                    />
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
    }
);

TextArea.displayName = "TextArea";

export default TextArea;
