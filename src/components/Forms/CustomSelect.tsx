import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { Fragment, useRef, useState } from "react";

import { Transition } from "@headlessui/react";

export interface SelectOption {
    value: string;
    label: string;
}

export interface CustomSelectProps {
    label: string;
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
    id?: string;
    required?: boolean;
    disabled?: boolean;
}

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
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const selectedOption = options.find((option) => option.value === value) || options[0];

    const filteredOptions =
        searchQuery === ""
            ? options
            : options.filter((option) =>
                  option.label.toLowerCase().replace(/\s+/g, "").includes(searchQuery.toLowerCase().replace(/\s+/g, ""))
              );

    const handleInputClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isOpen) {
            setIsOpen(true);
        }
    };

    const handleOptionSelect = (option: SelectOption) => {
        onChange(option.value);
        setSearchQuery("");
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSearchQuery("");
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <div className={`${fullWidth ? "w-full" : ""}`}>
            <div className="relative">
                <label className="block text-sm font-medium leading-6 text-gray-900">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="relative mt-1.5">
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
                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                    </div>

                    <Transition
                        show={isOpen}
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-primary-50 hover:text-primary-900 ${
                                        option.value === value ? "bg-primary-50 text-primary-900" : "text-gray-900"
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
            {(error || helperText) && (
                <p className={`mt-2 text-sm ${error ? "text-red-600" : "text-gray-500"}`} id={`${id}-description`}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
}
