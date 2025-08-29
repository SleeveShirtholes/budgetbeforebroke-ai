"use client";

import "react-datepicker/dist/react-datepicker.css";

import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { format, parse } from "date-fns";
import { forwardRef, useState, useEffect } from "react";

import ReactDatePicker from "react-datepicker";
import { formatDateSafely } from "@/utils/date";

interface DatePickerHeaderProps {
  date: Date;
  decreaseMonth: () => void;
  increaseMonth: () => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
}

export interface CustomDatePickerProps {
  label: string;
  value?: string;
  onChange: (date: string) => void;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  "data-testid"?: string;
}

export default function CustomDatePicker({
  label,
  value,
  onChange,
  error,
  helperText,
  fullWidth = true,
  id,
  required,
  disabled,
  "data-testid": testId,
}: CustomDatePickerProps) {
  // Helper function to parse date strings as local dates
  const parseLocalDate = (dateString: string): Date | null => {
    // If it's just a date string like "2024-04-01", treat it as local date
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split("-").map(Number);
      return new Date(year, month - 1, day); // month is 0-indexed
    }
    // Otherwise, parse as normal
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? parseLocalDate(value) : null,
  );
  const [inputValue, setInputValue] = useState(
    value ? formatDateSafely(value, "MMM d, yyyy") : "",
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSelectedDate(value ? parseLocalDate(value) : null);
    setInputValue(value ? formatDateSafely(value, "MMM d, yyyy") : "");
  }, [value]);

  const handleChange = (date: Date | null) => {
    setSelectedDate(date);
    setInputValue(date ? formatDateSafely(date, "MMM d, yyyy") : "");
    if (date) {
      // Format date as YYYY-MM-DD to preserve local date without timezone conversion
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}`);
    }
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    try {
      const parsedDate = parse(value, "MMM d, yyyy", new Date());
      if (parsedDate && !isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate);
        // Format date as YYYY-MM-DD to preserve local date without timezone conversion
        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
        const day = String(parsedDate.getDate()).padStart(2, "0");
        onChange(`${year}-${month}-${day}`);
      }
    } catch {
      // Invalid date format, just update input
    }
  };

  // Custom input component to match our styling
  const CustomInput = forwardRef<
    HTMLDivElement,
    { value?: string; onClick?: () => void; "data-testid"?: string }
  >(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ value: _, onClick, "data-testid": testId }, ref) => (
      <div
        ref={ref}
        className={`
                    relative w-full rounded-md bg-white text-left shadow-sm ring-1 ring-inset
                    ${disabled ? "bg-gray-50 text-gray-500" : "text-gray-900"}
                    ${error ? "ring-red-300 focus-within:ring-red-500" : "ring-gray-300 focus-within:ring-primary-500"}
                    focus-within:ring-2 focus-within:ring-inset
                    sm:text-sm sm:leading-6
                `}
      >
        <input
          type="text"
          id={id}
          name={id}
          data-testid={testId}
          aria-label={`${label}${required ? " (required)" : ""}`}
          className="block w-full border-0 bg-transparent py-1.5 pl-3 pr-10 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
          placeholder="Select or enter date"
          value={inputValue}
          onChange={handleInputChange}
          onClick={() => setIsOpen(true)}
          disabled={disabled}
          required={required}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
          onClick={() => setIsOpen(true)}
        >
          <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
      </div>
    ),
  );

  CustomInput.displayName = "CustomInput";

  const renderCustomHeader = ({
    date,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }: DatePickerHeaderProps) => (
    <div className="flex flex-col space-y-2 p-2">
      <div className="flex items-center justify-between">
        <span className="text-lg text-gray-700">
          {format(date, "MMMM yyyy")}
        </span>

        <div className="flex items-center space-x-2">
          <button
            onClick={decreaseMonth}
            disabled={prevMonthButtonDisabled}
            type="button"
            className={`
                            inline-flex p-1 text-sm font-semibold text-gray-900 
                            ${!prevMonthButtonDisabled && "hover:bg-gray-100"} 
                            rounded-md focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600
                        `}
          >
            <span className="sr-only">Previous month</span>
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          <button
            onClick={increaseMonth}
            disabled={nextMonthButtonDisabled}
            type="button"
            className={`
                            inline-flex p-1 text-sm font-semibold text-gray-900 
                            ${!nextMonthButtonDisabled && "hover:bg-gray-100"} 
                            rounded-md focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600
                        `}
          >
            <span className="sr-only">Next month</span>
            <ChevronRightIcon className="h-5 w-5" />
          </button>

          <button
            onClick={() => setIsOpen(false)}
            type="button"
            className="ml-2 inline-flex items-center rounded-md bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`${fullWidth ? "w-full" : ""}`}>
      <label
        id={`${id}-label`}
        htmlFor={id}
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-1.5">
        <ReactDatePicker
          selected={selectedDate}
          onChange={handleChange}
          customInput={<CustomInput data-testid={testId} />}
          dateFormat="MMM d, yyyy"
          disabled={disabled}
          showPopperArrow={false}
          className="w-full"
          calendarClassName="shadow-lg rounded-md border border-gray-300"
          wrapperClassName="w-full"
          popperClassName="z-50"
          popperPlacement="bottom-start"
          renderCustomHeader={renderCustomHeader}
          highlightDates={[new Date()]}
          open={isOpen}
          onClickOutside={() => setIsOpen(false)}
        />
      </div>
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
