import { cn } from "@/lib/utils";
import { forwardRef } from "react";

/**
 * Props interface for the DatePicker component.
 * Extends the standard HTML input attributes (except type) with additional custom properties.
 */
export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    /** The label text displayed above the date input */
    label: string;
    /** Error message to display below the date input */
    error?: string;
    /** Helper text to display below the date input when there's no error */
    helperText?: string;
    /** Whether the date input should take up the full width of its container */
    fullWidth?: boolean;
    /** Whether the field is required - displays a red asterisk next to the label */
    required?: boolean;
}

/**
 * A customizable date input component with support for labels, error states, and helper text.
 * Uses the native HTML date input with custom styling to match the application's design.
 *
 * @component
 * @example
 * ```tsx
 * <DatePicker
 *   label="Birth Date"
 *   required
 *   error={errors.birthDate}
 *   helperText="Must be at least 18 years old"
 *   onChange={handleDateChange}
 * />
 * ```
 */
const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
    ({ label, id, error, helperText, className, required, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
        const descriptionId = `${inputId}-description`;
        const hasError = !!error;

        return (
            <div className={cn("flex flex-col gap-1", className)}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className={cn(
                            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                            hasError ? "text-destructive" : "text-foreground"
                        )}
                    >
                        {label}
                        {required && <span className="text-destructive"> *</span>}
                    </label>
                )}
                <input
                    type="date"
                    id={inputId}
                    ref={ref}
                    role="textbox"
                    aria-label={label}
                    aria-invalid={hasError}
                    aria-describedby={error || helperText ? descriptionId : undefined}
                    required={required}
                    className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        hasError && "border-destructive focus-visible:ring-destructive"
                    )}
                    {...props}
                />
                {(error || helperText) && (
                    <p
                        id={descriptionId}
                        className={cn("text-sm", error ? "text-destructive" : "text-muted-foreground")}
                    >
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

DatePicker.displayName = "DatePicker";

export default DatePicker;
