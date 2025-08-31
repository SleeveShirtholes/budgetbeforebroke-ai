import {
  formatDateSafely,
  toDateObject,
  toDateString,
  createDateString,
  parseDateString,
  addDaysToString,
  addWeeksToString,
  addMonthsToString,
  compareDates,
  isValidDateString,
  getCurrentDateString,
  getFirstDayOfMonth,
  getLastDayOfMonth,
} from "../date";

describe("Date Utilities", () => {
  describe("formatDateSafely", () => {
    it("formats Date objects correctly", () => {
      const date = new Date(2025, 7, 21); // August 21, 2025
      expect(formatDateSafely(date, "MMM dd, yyyy")).toBe("Aug 21, 2025");
      expect(formatDateSafely(date, "yyyy-MM-dd")).toBe("2025-08-21");
    });

    it("formats date strings correctly without timezone conversion", () => {
      expect(formatDateSafely("2025-08-21", "MMM dd, yyyy")).toBe(
        "Aug 21, 2025",
      );
      expect(formatDateSafely("2025-08-21", "MMM dd")).toBe("Aug 21");
      expect(formatDateSafely("2025-08-21", "yyyy-MM-dd")).toBe("2025-08-21");
    });

    it("handles ISO date strings", () => {
      expect(formatDateSafely("2025-08-21T12:00:00Z", "MMM dd, yyyy")).toBe(
        "Aug 21, 2025",
      );
    });

    it("returns 'Invalid Date' for invalid inputs", () => {
      expect(formatDateSafely("invalid", "MMM dd, yyyy")).toBe("Invalid Date");
      expect(formatDateSafely("", "MMM dd, yyyy")).toBe("Invalid Date");
    });
  });

  describe("toDateObject", () => {
    it("converts Date objects to local midnight", () => {
      const date = new Date(2025, 7, 21, 15, 30, 45); // August 21, 2025 3:30:45 PM
      const result = toDateObject(date);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(7);
      expect(result.getDate()).toBe(21);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });

    it("converts date strings to Date objects", () => {
      const result = toDateObject("2025-08-21");
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(7);
      expect(result.getDate()).toBe(21);
    });
  });

  describe("toDateString", () => {
    it("converts Date objects to YYYY-MM-DD format", () => {
      const date = new Date(2025, 7, 21);
      expect(toDateString(date)).toBe("2025-08-21");
    });

    it("handles single digit months and days", () => {
      const date = new Date(2025, 0, 1); // January 1, 2025
      expect(toDateString(date)).toBe("2025-01-01");
    });
  });

  describe("createDateString", () => {
    it("creates date strings from components", () => {
      expect(createDateString(2025, 8, 21)).toBe("2025-08-21");
      expect(createDateString(2025, 1, 1)).toBe("2025-01-01");
      expect(createDateString(2025, 12, 31)).toBe("2025-12-31");
    });

    it("pads single digits with zeros", () => {
      expect(createDateString(2025, 3, 5)).toBe("2025-03-05");
    });
  });

  describe("parseDateString", () => {
    it("parses valid date strings", () => {
      const result = parseDateString("2025-08-21");
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(7);
      expect(result.getDate()).toBe(21);
    });

    it("throws error for invalid date strings", () => {
      expect(() => parseDateString("invalid")).toThrow(
        "Invalid date string format: invalid",
      );
      expect(() => parseDateString("2025-13-01")).toThrow(
        "Invalid date string format: 2025-13-01",
      );
    });
  });

  describe("addDaysToString", () => {
    it("adds days to date strings", () => {
      expect(addDaysToString("2025-08-21", 1)).toBe("2025-08-22");
      expect(addDaysToString("2025-08-21", -1)).toBe("2025-08-20");
      expect(addDaysToString("2025-08-31", 1)).toBe("2025-09-01");
    });
  });

  describe("addWeeksToString", () => {
    it("adds weeks to date strings", () => {
      expect(addWeeksToString("2025-08-21", 1)).toBe("2025-08-28");
      expect(addWeeksToString("2025-08-21", -1)).toBe("2025-08-14");
    });
  });

  describe("addMonthsToString", () => {
    it("adds months to date strings", () => {
      expect(addMonthsToString("2025-08-21", 1)).toBe("2025-09-21");
      expect(addMonthsToString("2025-08-21", -1)).toBe("2025-07-21");
      expect(addMonthsToString("2025-01-31", 1)).toBe("2025-02-28"); // February has fewer days
    });
  });

  describe("compareDates", () => {
    it("compares dates correctly", () => {
      expect(compareDates("2025-08-21", "2025-08-22")).toBe(-1);
      expect(compareDates("2025-08-21", "2025-08-21")).toBe(0);
      expect(compareDates("2025-08-22", "2025-08-21")).toBe(1);
    });

    it("compares Date objects and strings", () => {
      const date1 = new Date(2025, 7, 21);
      const date2 = new Date(2025, 7, 22);
      expect(compareDates(date1, date2)).toBe(-1);
      expect(compareDates("2025-08-21", date2)).toBe(-1);
    });
  });

  describe("isValidDateString", () => {
    it("validates correct date strings", () => {
      expect(isValidDateString("2025-08-21")).toBe(true);
      expect(isValidDateString("2025-01-01")).toBe(true);
      expect(isValidDateString("2025-12-31")).toBe(true);
    });

    it("rejects invalid date strings", () => {
      expect(isValidDateString("invalid")).toBe(false);
      expect(isValidDateString("2025-13-01")).toBe(false);
      expect(isValidDateString("2025-02-30")).toBe(false);
      expect(isValidDateString("2025-04-31")).toBe(false);
      expect(isValidDateString("1899-01-01")).toBe(false);
      expect(isValidDateString("2101-01-01")).toBe(false);
    });
  });

  describe("getCurrentDateString", () => {
    it("returns current date in correct format", () => {
      const result = getCurrentDateString();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      const now = new Date();
      const expected = toDateString(now);
      expect(result).toBe(expected);
    });
  });

  describe("getFirstDayOfMonth", () => {
    it("returns first day of month", () => {
      expect(getFirstDayOfMonth(2025, 8)).toBe("2025-08-01");
      expect(getFirstDayOfMonth(2025, 1)).toBe("2025-01-01");
      expect(getFirstDayOfMonth(2025, 12)).toBe("2025-12-01");
    });
  });

  describe("getLastDayOfMonth", () => {
    it("returns last day of month", () => {
      expect(getLastDayOfMonth(2025, 8)).toBe("2025-08-31");
      expect(getLastDayOfMonth(2025, 2)).toBe("2025-02-28"); // Not leap year
      expect(getLastDayOfMonth(2025, 4)).toBe("2025-04-30");
      expect(getLastDayOfMonth(2025, 6)).toBe("2025-06-30");
    });
  });
});
