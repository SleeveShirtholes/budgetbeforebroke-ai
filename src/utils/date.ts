import {
  format,
  addDays,
  addWeeks,
  addMonths,
  isBefore,
  isEqual,
} from "date-fns";

/**
 * Safely formats a date that can be either a Date object or string
 * without timezone conversion issues
 *
 * @param date - The date as a Date object or string in YYYY-MM-DD format or ISO format
 * @param formatString - The format string to use with date-fns format function
 * @returns Formatted date string
 */
export function formatDateSafely(
  date: Date | string,
  formatString: string,
): string {
  if (date instanceof Date) {
    // For Date objects, we need to ensure they're treated as local dates
    // Create a new Date object at local midnight to avoid timezone issues
    const localDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    return format(localDate, formatString);
  }

  if (typeof date === "string") {
    // Handle ISO date strings (e.g., "2024-03-20T12:00:00Z")
    if (date.includes("T")) {
      const isoDate = new Date(date);
      if (isNaN(isoDate.getTime())) {
        console.warn("Invalid ISO date string:", date);
        return "Invalid Date";
      }
      return format(isoDate, formatString);
    }

    // For date strings in YYYY-MM-DD format, parse them directly without creating Date objects
    const [year, month, day] = date.split("-").map(Number);

    // Validate that we have valid numbers
    if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
      console.warn("Invalid date string format:", date);
      return "Invalid Date";
    }

    // Handle different format patterns manually to avoid timezone issues
    if (formatString === "MMM dd") {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${monthNames[month - 1]} ${day.toString().padStart(2, "0")}`;
    } else if (formatString === "MMM dd, yyyy") {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${monthNames[month - 1]} ${day.toString().padStart(2, "0")}, ${year}`;
    } else if (formatString === "yyyy-MM-dd") {
      return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    }

    // Fallback to date-fns for other formats
    // Create date at local midnight to avoid timezone issues
    const localDate = new Date(year, month - 1, day);
    return format(localDate, formatString);
  }

  console.warn("Invalid date input:", date);
  return "Invalid Date";
}

/**
 * Safely converts a date that can be either a Date object or string
 * into a Date object for comparison operations
 *
 * @param date - The date as a Date object or string in YYYY-MM-DD format
 * @returns Date object
 */
export function toDateObject(date: Date | string): Date {
  if (date instanceof Date) {
    // For Date objects, create a new Date at local midnight to avoid timezone issues
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  // If it's a string, parse it directly without timezone conversion
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Creates a date string in YYYY-MM-DD format from a Date object
 * without timezone conversion issues
 *
 * @param date - The Date object to convert
 * @returns Date string in YYYY-MM-DD format
 */
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Creates a date string in YYYY-MM-DD format from individual components
 * without timezone conversion issues
 *
 * @param year - The year (e.g., 2025)
 * @param month - The month (1-12)
 * @param day - The day (1-31)
 * @returns Date string in YYYY-MM-DD format
 */
export function createDateString(
  year: number,
  month: number,
  day: number,
): string {
  const monthStr = String(month).padStart(2, "0");
  const dayStr = String(day).padStart(2, "0");
  return `${year}-${monthStr}-${dayStr}`;
}

/**
 * Safely parses a date string and returns a Date object
 * without timezone conversion issues
 *
 * @param dateString - The date string in YYYY-MM-DD format
 * @returns Date object at local midnight
 */
export function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error(`Invalid date string format: ${dateString}`);
  }

  // Validate month range
  if (month < 1 || month > 12) {
    throw new Error(`Invalid date string format: ${dateString}`);
  }

  // Validate day range
  if (day < 1 || day > 31) {
    throw new Error(`Invalid date string format: ${dateString}`);
  }

  // Create date and validate it's actually valid
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error(`Invalid date string format: ${dateString}`);
  }

  return date;
}

/**
 * Safely adds days to a date string without timezone conversion issues
 *
 * @param dateString - The date string in YYYY-MM-DD format
 * @param days - Number of days to add (can be negative)
 * @returns Date string in YYYY-MM-DD format
 */
export function addDaysToString(dateString: string, days: number): string {
  const date = parseDateString(dateString);
  const newDate = addDays(date, days);
  return toDateString(newDate);
}

/**
 * Safely adds weeks to a date string without timezone conversion issues
 *
 * @param dateString - The date string in YYYY-MM-DD format
 * @param weeks - Number of weeks to add (can be negative)
 * @returns Date string in YYYY-MM-DD format
 */
export function addWeeksToString(dateString: string, weeks: number): string {
  const date = parseDateString(dateString);
  const newDate = addWeeks(date, weeks);
  return toDateString(newDate);
}

/**
 * Safely adds months to a date string without timezone conversion issues
 *
 * @param dateString - The date string in YYYY-MM-DD format
 * @param months - Number of months to add (can be negative)
 * @returns Date string in YYYY-MM-DD format
 */
export function addMonthsToString(dateString: string, months: number): string {
  const date = parseDateString(dateString);
  const newDate = addMonths(date, months);
  return toDateString(newDate);
}

/**
 * Safely compares two dates that can be either Date objects or strings
 * without timezone conversion issues
 *
 * @param date1 - First date (Date object or YYYY-MM-DD string)
 * @param date2 - Second date (Date object or YYYY-MM-DD string)
 * @returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export function compareDates(
  date1: Date | string,
  date2: Date | string,
): number {
  const obj1 = toDateObject(date1);
  const obj2 = toDateObject(date2);

  if (isBefore(obj1, obj2)) return -1;
  if (isEqual(obj1, obj2)) return 0;
  return 1;
}

/**
 * Checks if a date string is valid
 *
 * @param dateString - The date string to validate
 * @returns True if the date string is valid
 */
export function isValidDateString(dateString: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  const [year, month, day] = dateString.split("-").map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return false;
  }

  // Basic validation
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  // Check for valid day in month
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Gets the current date as a YYYY-MM-DD string
 * without timezone conversion issues
 *
 * @returns Current date in YYYY-MM-DD format
 */
export function getCurrentDateString(): string {
  const now = new Date();
  return toDateString(now);
}

/**
 * Gets the first day of a month as a YYYY-MM-DD string
 *
 * @param year - The year
 * @param month - The month (1-12)
 * @returns First day of month in YYYY-MM-DD format
 */
export function getFirstDayOfMonth(year: number, month: number): string {
  return createDateString(year, month, 1);
}

/**
 * Gets the last day of a month as a YYYY-MM-DD string
 *
 * @param year - The year
 * @param month - The month (1-12)
 * @returns Last day of month in YYYY-MM-DD format
 */
export function getLastDayOfMonth(year: number, month: number): string {
  const nextMonth = new Date(year, month, 0); // 0th day of next month = last day of current month
  return toDateString(nextMonth);
}
