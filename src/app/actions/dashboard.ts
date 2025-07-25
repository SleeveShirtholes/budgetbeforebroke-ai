"use server";

import { and, eq, gte, lte, sql } from "drizzle-orm";
import {
  transactions,
  categories,
  budgetCategories,
  budgets,
  user,
} from "@/db/schema";

import { db } from "@/db/config";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Dashboard data structure
 */
export type DashboardData = {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySpendingData: { month: string; amount: number }[];
  budgetCategories: {
    name: string;
    spent: number;
    budget: number;
    color: string;
  }[];
};

/**
 * Get the user's default budget account ID
 */
async function getDefaultBudgetAccountId(): Promise<string> {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  const userResult = await db
    .select({
      defaultBudgetAccountId: user.defaultBudgetAccountId,
    })
    .from(user)
    .where(eq(user.id, sessionResult.user.id))
    .limit(1);

  if (!userResult[0]?.defaultBudgetAccountId) {
    throw new Error("No default budget account found");
  }

  return userResult[0].defaultBudgetAccountId;
}

/**
 * Get the start and end date for the current month
 * @returns { startOfMonth: Date, endOfMonth: Date }
 */
function getCurrentMonthDateRange() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { startOfMonth, endOfMonth };
}

/**
 * Get total account balance by summing all income and subtracting all expenses
 */
export async function getAccountBalance(budgetAccountId?: string) {
  const accountId = budgetAccountId || (await getDefaultBudgetAccountId());

  const balanceResult = await db
    .select({
      totalIncome: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
      totalExpenses: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`,
    })
    .from(transactions)
    .where(eq(transactions.budgetAccountId, accountId));

  const income = Number(balanceResult[0]?.totalIncome || 0);
  const expenses = Number(balanceResult[0]?.totalExpenses || 0);

  return income - expenses;
}

/**
 * Get monthly income for the current month
 */
export async function getMonthlyIncome(budgetAccountId?: string) {
  const accountId = budgetAccountId || (await getDefaultBudgetAccountId());

  const { startOfMonth, endOfMonth } = getCurrentMonthDateRange();

  const incomeResult = await db
    .select({
      totalIncome: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.budgetAccountId, accountId),
        eq(transactions.type, "income"),
        gte(transactions.date, startOfMonth),
        lte(transactions.date, endOfMonth),
      ),
    );

  return Number(incomeResult[0]?.totalIncome || 0);
}

/**
 * Get monthly expenses for the current month
 */
export async function getMonthlyExpenses(budgetAccountId?: string) {
  const accountId = budgetAccountId || (await getDefaultBudgetAccountId());

  const { startOfMonth, endOfMonth } = getCurrentMonthDateRange();

  const expenseResult = await db
    .select({
      totalExpenses: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.budgetAccountId, accountId),
        eq(transactions.type, "expense"),
        gte(transactions.date, startOfMonth),
        lte(transactions.date, endOfMonth),
      ),
    );

  return Number(expenseResult[0]?.totalExpenses || 0);
}

/**
 * Get monthly spending data for the last 12 months using a single grouped query
 * @param budgetAccountId Optional budget account ID to filter transactions
 * @returns Array of objects with { month, amount } for each of the last 12 months
 */
export async function getMonthlySpendingData(budgetAccountId?: string) {
  const accountId = budgetAccountId || (await getDefaultBudgetAccountId());

  // Calculate the start date (12 months ago, at the start of that month)
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Query: group by year and month, sum income and expenses
  const results = await db
    .select({
      year: sql<number>`EXTRACT(YEAR FROM ${transactions.date})`,
      month: sql<number>`EXTRACT(MONTH FROM ${transactions.date})`,
      totalIncome: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
      totalExpenses: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.budgetAccountId, accountId),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate),
      ),
    )
    .groupBy(
      sql`EXTRACT(YEAR FROM ${transactions.date})`,
      sql`EXTRACT(MONTH FROM ${transactions.date})`
    )
    .orderBy(
      sql`EXTRACT(YEAR FROM ${transactions.date}) ASC`,
      sql`EXTRACT(MONTH FROM ${transactions.date}) ASC`
    );

  // Build a map for quick lookup
  const dataMap = new Map<string, { income: number; expenses: number }>();
  for (const row of results) {
    const key = `${row.year}-${row.month}`;
    dataMap.set(key, {
      income: Number(row.totalIncome || 0),
      expenses: Number(row.totalExpenses || 0),
    });
  }

  // Prepare the last 12 months in order, filling missing months with zeroes
  const monthlyData = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JS months are 0-based
    const key = `${year}-${month}`;
    const entry = dataMap.get(key);
    const amount = (entry ? entry.income - entry.expenses : 0);
    monthlyData.push({
      month: date.toLocaleDateString("en-US", { month: "short" }),
      amount,
    });
  }

  return monthlyData;
}

/**
 * Get budget categories with spending data for the current month
 */
export async function getBudgetCategoriesWithSpending(
  budgetAccountId?: string,
) {
  const accountId = budgetAccountId || (await getDefaultBudgetAccountId());

  // Get current budget
  const now = new Date();
  const currentBudget = await db.query.budgets.findFirst({
    where: and(
      eq(budgets.budgetAccountId, accountId),
      eq(budgets.year, now.getFullYear()),
      eq(budgets.month, now.getMonth() + 1),
    ),
  });

  if (!currentBudget) {
    return [];
  }

  // Get date range for current month
  const { startOfMonth, endOfMonth } = getCurrentMonthDateRange();

  // Single grouped query for all categories' spending
  const categoriesWithSpendingRaw = await db
    .select({
      categoryName: categories.name,
      budgetAmount: budgetCategories.amount,
      totalSpent: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(budgetCategories)
    .innerJoin(categories, eq(budgetCategories.categoryId, categories.id))
    .leftJoin(
      transactions,
      and(
        eq(transactions.categoryId, categories.id),
        eq(transactions.budgetAccountId, accountId),
        eq(transactions.type, "expense"),
        gte(transactions.date, startOfMonth),
        lte(transactions.date, endOfMonth)
      )
    )
    .where(eq(budgetCategories.budgetId, currentBudget.id))
    .groupBy(categories.name, budgetCategories.amount);

  // Color scheme for budget categories (primary colors)
  const colors = [
    "rgb(78, 0, 142)", // primary-500
    "rgb(153, 51, 255)", // primary-400
    "rgb(179, 102, 255)", // primary-300
    "rgb(209, 153, 255)", // primary-200
    "rgb(230, 204, 255)", // primary-100
  ];

  // Map results to match previous structure and assign colors
  const categoriesWithSpending = categoriesWithSpendingRaw.map((row, index) => ({
    name: row.categoryName,
    spent: Number(row.totalSpent || 0),
    budget: Number(row.budgetAmount),
    color: colors[index % colors.length],
  }));

  return categoriesWithSpending;
}

/**
 * Get all dashboard data in a single call
 */
export async function getDashboardData(
  budgetAccountId?: string,
): Promise<DashboardData> {
  const accountId = budgetAccountId || (await getDefaultBudgetAccountId());

  const [
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    monthlySpendingData,
    budgetCategories,
  ] = await Promise.all([
    getAccountBalance(accountId),
    getMonthlyIncome(accountId),
    getMonthlyExpenses(accountId),
    getMonthlySpendingData(accountId),
    getBudgetCategoriesWithSpending(accountId),
  ]);

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    monthlySpendingData,
    budgetCategories,
  };
}
