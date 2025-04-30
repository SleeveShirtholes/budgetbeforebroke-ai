import { addMonths, format, startOfMonth } from "date-fns";

import { BudgetCategory } from "../types/budget.types";

/**
 * Formats a number as a currency string using the US locale
 * @param {number} value - The numeric value to format
 * @returns {string} Formatted currency string with 2 decimal places
 */
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

/**
 * Converts a string to a number, handling invalid input by removing non-numeric characters
 * @param {string} value - The string value to parse
 * @returns {number} Parsed number value, returns 0 if parsing fails
 */
export const parseAmount = (value: string): number => {
    // Remove all non-numeric characters except decimal
    const cleanValue = value.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
};

/**
 * Generates an array of month options for the next 12 months
 * @returns {Array<{value: string, label: string}>} Array of month options with value (YYYY-MM) and label (Month YYYY)
 */
export const generateMonthOptions = () => {
    const options = [];
    const currentDate = startOfMonth(new Date());

    // Generate options for 12 months into the future
    for (let i = 0; i < 12; i++) {
        const date = addMonths(currentDate, i);
        const value = format(date, "yyyy-MM");
        const label = format(date, "MMMM yyyy");
        options.push({ value, label });
    }

    return options;
};

/**
 * Calculates the total budgeted amount across all categories
 * @param {BudgetCategory[]} categories - Array of budget categories
 * @returns {number} Sum of all category amounts
 */
export const calculateTotalBudgeted = (categories: BudgetCategory[]): number => {
    return categories.reduce((sum, cat) => sum + cat.amount, 0);
};

/**
 * Calculates the remaining budget by subtracting total budgeted from total budget
 * @param {number} totalBudget - The total available budget
 * @param {number} totalBudgeted - The total amount already budgeted
 * @returns {number} The remaining budget amount
 */
export const calculateRemainingBudget = (totalBudget: number, totalBudgeted: number): number => {
    return totalBudget - totalBudgeted;
};
