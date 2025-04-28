import {
  CheckIcon,
  ChevronUpDownIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { Fragment, useEffect, useRef, useState } from "react";

import { Transition } from "@headlessui/react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  /** The label text displayed above the select input */
  label: string;
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
export default function CustomSelect({
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
}: CustomSelectProps) {
  // State for dropdown visibility
  const [isOpen, setIsOpen] = useState(false);
  // State for search/filter input
  const [searchQuery, setSearchQuery] = useState("");
  // Refs for handling click outside and focus
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find the currently selected option or default to first option
  const selectedOption =
    options.find((option) => option.value === value) || options[0];

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
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  // Handle clearing the search input
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`${fullWidth ? "w-full" : ""}`}>
      <div className="relative" ref={containerRef}>
        {/* Label */}
        <label className="block text-sm font-medium leading-6 text-gray-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative mt-1.5">
          {/* Input container */}
          <div
            className={`
                            relative w-full cursor-text rounded-md bg-white py-1.5 pl-3 pr-10 text-left shadow-sm
                            ${disabled ? "bg-gray-50 text-gray-500" : "text-gray-900"}
                            ${error ? "ring-red-300 focus-within:ring-red-500" : "ring-gray-300 focus-within:ring-primary-500"}
                            border-0 ring-1 ring-inset
                            focus-within:ring-2
                            sm:text-sm sm:leading-6
                        `}
            onClick={() => setIsOpen(true)}
          >
            {/* Search input */}
            <input
              ref={inputRef}
              type="text"
              className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 sm:text-sm sm:leading-6 bg-transparent"
              placeholder={selectedOption.label}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              onClick={handleInputClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" && filteredOptions.length > 0) {
                  handleOptionSelect(filteredOptions[0]);
                }
                if (e.key === "Escape") {
                  setIsOpen(false);
                }
              }}
              disabled={disabled}
              aria-label={`${label}${required ? " (required)" : ""}`}
              name={label?.toLowerCase()}
              id={id}
            />
            {/* Clear and dropdown icons */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
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

          {/* Dropdown menu */}
          <Transition
            show={isOpen}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg focus:outline-none sm:text-sm border border-gray-200">
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
                    className={`block truncate ${option.value === value ? "font-semibold" : "font-normal"}`}
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
            </div>
          </Transition>
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
}
