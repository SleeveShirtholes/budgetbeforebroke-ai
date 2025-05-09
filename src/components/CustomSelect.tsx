import { Listbox, ListboxButton, Transition } from "@headlessui/react";

import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

/**
 * Represents a single option in the select dropdown
 */
interface Option {
  /** The value that will be passed to onChange when selected */
  value: string;
  /** The text displayed to the user for this option */
  label: string;
}

/**
 * Props for the CustomSelect component
 */
interface CustomSelectProps {
  /** Array of options to display in the dropdown */
  options: Option[];
  /** Currently selected value */
  value: string;
  /** Callback function when a new option is selected */
  onChange: (value: string) => void;
}

/**
 * A custom select component built with Headless UI's Listbox.
 * Provides a fully accessible dropdown select with keyboard navigation,
 * custom styling, and a checkmark indicator for the selected option.
 *
 * @example
 * ```tsx
 * const options = [
 *   { value: "1", label: "Option 1" },
 *   { value: "2", label: "Option 2" }
 * ];
 *
 * <CustomSelect
 *   options={options}
 *   value="1"
 *   onChange={(value) => console.log(value)}
 * />
 * ```
 */
export default function CustomSelect({
  options,
  value,
  onChange,
}: CustomSelectProps) {
  // Find the currently selected option to display its label
  const selectedOption = options.find((option) => option.value === value);

  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        {/* Main button that shows the selected value and opens the dropdown */}
        <ListboxButton
          as="button"
          className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <span className="block truncate">{selectedOption?.label}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-secondary-400"
              aria-hidden="true"
            />
          </span>
        </ListboxButton>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* Dropdown options container */}
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active
                      ? "bg-primary-100 text-primary-900"
                      : "text-secondary-900"
                  }`
                }
                value={option.value}
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                    >
                      {option.label}
                    </span>
                    {/* Checkmark icon for selected option */}
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600">
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
