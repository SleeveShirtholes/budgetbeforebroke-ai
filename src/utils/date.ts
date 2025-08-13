import { format } from "date-fns";

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
