import Spinner from "@/components/Spinner";
import { format } from "date-fns";

// Constant for noon UTC time suffix used in date string parsing
const NOON_UTC_TIME_SUFFIX = "T12:00:00Z";

/**
 * Props interface for the DateRangeSelector component
 */
interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  isLoading?: boolean;
}

/**
 * Helper function to safely create a Date object from a date string
 * @param dateString - The date string in YYYY-MM-DD format
 * @returns A valid Date object or null if the string is invalid
 */
function createValidDate(dateString: string): Date | null {
  if (!dateString || dateString.trim() === "") {
    return null;
  }

  const date = new Date(dateString + NOON_UTC_TIME_SUFFIX);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * A component that allows users to select a date range for viewing financial data.
 * Includes a help tooltip with usage instructions and date input fields.
 *
 * @param {Date} startDate - The initial start date of the range
 * @param {Date} endDate - The initial end date of the range
 * @param {Function} onDateRangeChange - Callback function that receives the new start and end dates when changed
 * @returns {JSX.Element} A date range selector with help tooltip
 */
export default function DateRangeSelector({
  startDate,
  endDate,
  onDateRangeChange,
  isLoading,
}: DateRangeSelectorProps) {
  /**
   * Handle start date change with validation
   */
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = createValidDate(e.target.value);
    if (newStartDate) {
      onDateRangeChange(newStartDate, endDate);
    }
  };

  /**
   * Handle end date change with validation
   */
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = createValidDate(e.target.value);
    if (newEndDate) {
      onDateRangeChange(startDate, newEndDate);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
      {/* Date range input fields */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-sm font-medium text-secondary-700 sm:hidden">
            Start Date
          </label>
          <input
            type="date"
            value={format(startDate, "yyyy-MM-dd")}
            onChange={handleStartDateChange}
            className="border border-secondary-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-auto"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-sm font-medium text-secondary-700 sm:hidden">
            End Date
          </label>
          <input
            type="date"
            value={format(endDate, "yyyy-MM-dd")}
            onChange={handleEndDateChange}
            className="border border-secondary-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-auto"
          />
        </div>

        {isLoading && <Spinner size="sm" />}
      </div>
    </div>
  );
}
