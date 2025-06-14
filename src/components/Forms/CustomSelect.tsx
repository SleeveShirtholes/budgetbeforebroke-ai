import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from "@floating-ui/react-dom";
import {
  CheckIcon,
  ChevronUpDownIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { Ref, forwardRef, useEffect, useRef, useState } from "react";

import ReactDOM from "react-dom";

export interface SelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  /** The label text displayed above the select input */
  label?: string;
  /** Array of options to display in the dropdown */
  options: SelectOption[];
  /** Currently selected value */
  value: string;
  /** Callback function when selection changes */
  onChange: (value: string) => void;
  /** Error message to display below the select */
  error?: string;
  /** Helper text to display below the select */
  helperText?: string;
  /** Whether the select should take up full width of its container */
  fullWidth?: boolean;
  /** HTML id attribute for the select input */
  id?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Optional icon to display on the left side of the input */
  leftIcon?: React.ReactNode;
  /** Placeholder text to show when nothing is selected */
  placeholder?: string;
  /** Whether the select can be cleared with an X button */
  clearable?: boolean;
}

/**
 * A custom select component that provides a searchable dropdown with keyboard navigation.
 * Features include:
 * - Search/filter functionality
 * - Keyboard navigation (Enter to select, Escape to close)
 * - Accessible design with ARIA attributes
 * - Error and helper text support
 * - Required field indication
 * - Disabled state
 * - Customizable width
 *
 * @example
 * ```tsx
 * <CustomSelect
 *   label="Country"
 *   options={[
 *     { value: "us", label: "United States" },
 *     { value: "ca", label: "Canada" }
 *   ]}
 *   value={selectedCountry}
 *   onChange={handleCountryChange}
 *   required
 * />
 * ```
 */
const CustomSelect = forwardRef<HTMLInputElement, CustomSelectProps>(
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
      leftIcon,
      placeholder = "",
      clearable = false,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    // Floating UI setup
    const { x, y, strategy, update, refs } = useFloating({
      placement: "bottom-start",
      middleware: [offset(4), flip(), shift({ padding: 8 })],
      whileElementsMounted: autoUpdate,
    });

    // Update floating position when open
    useEffect(() => {
      if (isOpen && update) update();
      setIsVisible(isOpen);
    }, [isOpen, update]);

    // Find the currently selected option or undefined
    const selectedOption = options.find((option) => option.value === value);

    // Filter options based on search query
    const filteredOptions =
      searchQuery === ""
        ? options
        : options.filter((option) =>
            option.label
              .toLowerCase()
              .replace(/\s+/g, "")
              .includes(searchQuery.toLowerCase().replace(/\s+/g, "")),
          );

    // Handle clicks outside the component to close the dropdown
    useEffect(() => {
      function handleClickOutside(event: MouseEvent | TouchEvent) {
        if (
          refs.reference.current instanceof HTMLElement &&
          !refs.reference.current.contains(event.target as Node) &&
          refs.floating.current instanceof HTMLElement &&
          !refs.floating.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchQuery("");
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }, [refs.reference, refs.floating]);

    // Prevent event propagation when clicking input
    const handleInputClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isOpen) {
        setIsOpen(true);
      }
    };

    // Handle option selection
    const handleOptionSelect = (option: SelectOption) => {
      onChange(option.value);
      setSearchQuery("");
      setIsOpen(false);
    };

    return (
      <div className={`${fullWidth ? "w-full" : ""}`} ref={containerRef}>
        <div className="relative" ref={refs.reference as Ref<HTMLDivElement>}>
          {/* Label (optional) */}
          {label && (
            <label className="block text-sm font-medium leading-6 text-gray-900">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          <div className="relative mt-1.5">
            {/* Input container */}
            <div
              className={`
                    relative w-full cursor-text rounded-md bg-white py-1.5 ${leftIcon ? "pl-10" : "pl-3"} pr-10 text-left shadow-sm
                    ${disabled ? "bg-gray-50 text-gray-500" : "text-gray-900"}
                    ${error ? "ring-red-300 focus-within:ring-red-500" : "ring-gray-300 focus-within:ring-primary-500"}
                    border-0 ring-1 ring-inset
                    focus-within:ring-2
                    sm:text-sm sm:leading-6
                `}
              onClick={() => setIsOpen(true)}
            >
              {leftIcon && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {leftIcon}
                </div>
              )}
              {/* Search input */}
              <input
                ref={ref}
                type="text"
                className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 sm:text-sm sm:leading-6 bg-transparent"
                placeholder={
                  selectedOption ? selectedOption.label : placeholder
                }
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!isOpen) setIsOpen(true);
                }}
                onClick={handleInputClick}
                onFocus={() => setIsOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filteredOptions.length > 0) {
                    handleOptionSelect(filteredOptions[0]);
                  }
                  if (e.key === "Escape") {
                    setIsOpen(false);
                  }
                }}
                disabled={disabled}
                aria-label={
                  label ? `${label}${required ? " (required)" : ""}` : undefined
                }
                name={label?.toLowerCase()}
                id={id}
              />
              {/* Clear and dropdown icons */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
                {/* Show clear button if a value is selected, not disabled, and clearable */}
                {clearable && value && !disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange("");
                      setSearchQuery("");
                    }}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Dropdown menu rendered in a portal */}
            {isOpen &&
              typeof window !== "undefined" &&
              ReactDOM.createPortal(
                <div
                  ref={refs.floating as Ref<HTMLDivElement>}
                  style={{
                    position: strategy,
                    top: y ?? 0,
                    left: x ?? 0,
                    width: containerRef.current?.offsetWidth || "100%",
                    zIndex: 9999,
                    opacity: isVisible ? 1 : 0,
                    transform: `translateY(${isVisible ? "0" : "-10px"})`,
                    transition:
                      "opacity 100ms ease-in-out, transform 100ms ease-in-out",
                    maxHeight: 240,
                    overflowY: "auto",
                  }}
                  className="rounded-md shadow-lg bg-white border border-gray-200 overflow-auto py-1 text-base focus:outline-none sm:text-sm"
                >
                  {filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-primary-50 hover:text-primary-900 ${
                        option.value === value
                          ? "bg-primary-50 text-primary-900"
                          : "text-gray-900"
                      }`}
                      onClick={() => handleOptionSelect(option)}
                    >
                      <span
                        className={`block truncate ${
                          option.value === value
                            ? "font-semibold"
                            : "font-normal"
                        }`}
                      >
                        {option.label}
                      </span>
                      {option.value === value && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </div>
                  ))}
                </div>,
                document.body,
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

CustomSelect.displayName = "CustomSelect";

export default CustomSelect;
