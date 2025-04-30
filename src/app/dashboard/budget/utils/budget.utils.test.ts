import { BudgetCategory, CATEGORY_COLORS } from "../types/budget.types";
import {
    calculateRemainingBudget,
    calculateTotalBudgeted,
    formatCurrency,
    generateMonthOptions,
    parseAmount,
} from "./budget.utils";

// Mock date-fns functions
jest.mock("date-fns", () => ({
    ...jest.requireActual("date-fns"),
    startOfMonth: jest.fn((date) => date),
    addMonths: jest.fn((date, months) => {
        const newDate = new Date(date);
        newDate.setMonth(date.getMonth() + months);
        return newDate;
    }),
    format: jest.fn((date, formatStr) => {
        if (formatStr === "yyyy-MM") {
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        }
        if (formatStr === "MMMM yyyy") {
            const months = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ];
            return `${months[date.getMonth()]} ${date.getFullYear()}`;
        }
        return "";
    }),
}));

// Mock the current date
const mockDate = new Date(2024, 0, 1); // January 1, 2024
jest.spyOn(global, "Date").mockImplementation(() => mockDate);

describe("budget.utils", () => {
    describe("formatCurrency", () => {
        it("should format positive numbers correctly", () => {
            expect(formatCurrency(1000)).toBe("1,000.00");
            expect(formatCurrency(1000.5)).toBe("1,000.50");
            expect(formatCurrency(0.99)).toBe("0.99");
        });

        it("should format negative numbers correctly", () => {
            expect(formatCurrency(-1000)).toBe("-1,000.00");
            expect(formatCurrency(-1000.5)).toBe("-1,000.50");
        });

        it("should handle zero correctly", () => {
            expect(formatCurrency(0)).toBe("0.00");
        });
    });

    describe("parseAmount", () => {
        it("should parse valid number strings correctly", () => {
            expect(parseAmount("1000")).toBe(1000);
            expect(parseAmount("1,000.50")).toBe(1000.5);
            expect(parseAmount("$1,000.50")).toBe(1000.5);
        });

        it("should handle invalid input", () => {
            expect(parseAmount("abc")).toBe(0);
            expect(parseAmount("")).toBe(0);
            expect(parseAmount("$")).toBe(0);
        });

        it("should handle decimal points correctly", () => {
            expect(parseAmount("1000.50")).toBe(1000.5);
            expect(parseAmount("1000.")).toBe(1000);
        });
    });

    describe("generateMonthOptions", () => {
        it("should generate 12 months of options", () => {
            const options = generateMonthOptions();
            expect(options).toHaveLength(12);
        });

        it("should generate options with correct format", () => {
            const options = generateMonthOptions();
            const firstOption = options[0];

            // Check value format (YYYY-MM)
            expect(firstOption.value).toMatch(/^\d{4}-\d{2}$/);

            // Check label format (Month YYYY)
            expect(firstOption.label).toMatch(/^[A-Za-z]+ \d{4}$/);
        });
    });

    describe("calculateTotalBudgeted", () => {
        it("should calculate total budgeted amount correctly", () => {
            const categories: BudgetCategory[] = [
                { id: "1", name: "Food & Groceries", amount: 500, color: CATEGORY_COLORS["Food & Groceries"] },
                { id: "2", name: "Housing", amount: 1000, color: CATEGORY_COLORS.Housing },
                { id: "3", name: "Utilities", amount: 200, color: CATEGORY_COLORS.Utilities },
            ];

            expect(calculateTotalBudgeted(categories)).toBe(1700);
        });

        it("should handle empty array", () => {
            expect(calculateTotalBudgeted([])).toBe(0);
        });

        it("should handle negative amounts", () => {
            const categories: BudgetCategory[] = [
                { id: "1", name: "Food & Groceries", amount: -500, color: CATEGORY_COLORS["Food & Groceries"] },
                { id: "2", name: "Housing", amount: 1000, color: CATEGORY_COLORS.Housing },
            ];

            expect(calculateTotalBudgeted(categories)).toBe(500);
        });
    });

    describe("calculateRemainingBudget", () => {
        it("should calculate remaining budget correctly", () => {
            expect(calculateRemainingBudget(2000, 1500)).toBe(500);
            expect(calculateRemainingBudget(1000, 1000)).toBe(0);
            expect(calculateRemainingBudget(1000, 1200)).toBe(-200);
        });

        it("should handle zero values", () => {
            expect(calculateRemainingBudget(0, 0)).toBe(0);
            expect(calculateRemainingBudget(1000, 0)).toBe(1000);
            expect(calculateRemainingBudget(0, 1000)).toBe(-1000);
        });
    });
});
