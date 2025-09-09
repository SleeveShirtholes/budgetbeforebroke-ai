"use server";

import { db } from "@/db/schema";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { toPrismaDateTime } from "@/utils/date";

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

  const userResult = await db.user.findFirst({
    where: { id: sessionResult.user.id },
    select: {
      defaultBudgetAccountId: true,
    },
  });

  if (!userResult?.defaultBudgetAccountId) {
    throw new Error("No default budget account found");
  }

  return userResult.defaultBudgetAccountId;
}

/**
 * Get the start and end date for the current month
 * @returns { startOfMonth: Date, endOfMonth: Date }
 */
function getCurrentMonthDateRange() {
  const now = new Date();
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    0,
    0,
    0,
  );
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
  return { startOfMonth, endOfMonth };
}

/**
 * Get total account balance by summing all income and subtracting all expenses
 */
export async function getAccountBalance(budgetAccountId?: string) {
  const accountId = budgetAccountId || (await getDefaultBudgetAccountId());

  // Get income and expenses separately
  const incomeResult = await db.transaction.aggregate({
    where: {
      budgetAccountId: accountId,
      type: "income",
    },
    _sum: {
      amount: true,
    },
  });

  const expenseResult = await db.transaction.aggregate({
    where: {
      budgetAccountId: accountId,
      type: "expense",
    },
    _sum: {
      amount: true,
    },
  });

  const income = Number(incomeResult._sum.amount || 0);
  const expenses = Number(expenseResult._sum.amount || 0);

  return income - expenses;
}

/**
 * Get monthly income for the current month
 */
export async function getMonthlyIncome(budgetAccountId?: string) {
  const accountId = budgetAccountId || (await getDefaultBudgetAccountId());

  // Get current budget to determine the month to use
  const now = new Date();
  const currentBudget = await db.budget.findFirst({
    where: {
      budgetAccountId: accountId,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    },
  });

  // Use budget's month if available, otherwise fall back to current month
  let startOfMonth, endOfMonth;
  if (currentBudget) {
    startOfMonth = new Date(
      currentBudget.year,
      currentBudget.month - 1,
      1,
      0,
      0,
      0,
      0,
    );
    endOfMonth = new Date(
      currentBudget.year,
      currentBudget.month,
      0,
      23,
      59,
      59,
      999,
    );
  } else {
    const { startOfMonth: currentStart, endOfMonth: currentEnd } =
      getCurrentMonthDateRange();
    startOfMonth = currentStart;
    endOfMonth = currentEnd;
  }

  const incomeResult = await db.transaction.aggregate({
    where: {
      budgetAccountId: accountId,
      type: "income",
      date: {
        gte: toPrismaDateTime(startOfMonth),
        lte: toPrismaDateTime(endOfMonth),
      },
    },
    _sum: {
      amount: true,
    },
  });

  return Number(incomeResult._sum.amount || 0);
}

/**
 * Get monthly expenses for the current month
 */
export async function getMonthlyExpenses(budgetAccountId?: string) {
  const accountId = budgetAccountId || (await getDefaultBudgetAccountId());

  // Get current budget to determine the month to use
  const now = new Date();
  const currentBudget = await db.budget.findFirst({
    where: {
      budgetAccountId: accountId,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    },
  });

  // Use budget's month if available, otherwise fall back to current month
  let startOfMonth, endOfMonth;
  if (currentBudget) {
    startOfMonth = new Date(
      currentBudget.year,
      currentBudget.month - 1,
      1,
      0,
      0,
      0,
      0,
    );
    endOfMonth = new Date(
      currentBudget.year,
      currentBudget.month,
      0,
      23,
      59,
      59,
      999,
    );
  } else {
    const { startOfMonth: currentStart, endOfMonth: currentEnd } =
      getCurrentMonthDateRange();
    startOfMonth = currentStart;
    endOfMonth = currentEnd;
  }

  const expenseResult = await db.transaction.aggregate({
    where: {
      budgetAccountId: accountId,
      type: "expense",
      date: {
        gte: toPrismaDateTime(startOfMonth),
        lte: toPrismaDateTime(endOfMonth),
      },
    },
    _sum: {
      amount: true,
    },
  });

  return Number(expenseResult._sum.amount || 0);
}

/**
 * Get monthly spending data for the last 12 months using a single grouped query
 * @param budgetAccountId Optional budget account ID to filter transactions
 * @returns Array of objects with { month, amount } for each of the last 12 months
 */
export async function getMonthlySpendingData(budgetAccountId?: string) {
  const accountId = budgetAccountId || (await getDefaultBudgetAccountId());

  // Get all transactions for this account (no date filtering)
  const allTransactions = await db.transaction.findMany({
    where: {
      budgetAccountId: accountId,
    },
    select: {
      id: true,
      amount: true,
      type: true,
      date: true,
      description: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  // Group transactions by month
  const monthlyTotals = new Map<string, { income: number; expenses: number }>();

  allTransactions.forEach((tx) => {
    const date = new Date(tx.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!monthlyTotals.has(monthKey)) {
      monthlyTotals.set(monthKey, { income: 0, expenses: 0 });
    }

    const current = monthlyTotals.get(monthKey)!;
    if (tx.type === "income") {
      current.income += Number(tx.amount);
    } else if (tx.type === "expense") {
      current.expenses += Number(tx.amount);
    }
  });

  // Generate the last 12 months with data
  const now = new Date();
  const monthlyData = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const monthData = monthlyTotals.get(monthKey);

    // Show only expenses (spending) instead of net cash flow
    const amount = monthData ? monthData.expenses : 0;

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

  const currentBudget = await db.budget.findFirst({
    where: {
      budgetAccountId: accountId,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    },
  });

  if (!currentBudget) {
    return [];
  }

  // Get date range for the budget's month (not current system month)
  const budgetStartOfMonth = new Date(
    currentBudget.year,
    currentBudget.month - 1,
    1,
    0,
    0,
    0,
    0,
  );
  const budgetEndOfMonth = new Date(
    currentBudget.year,
    currentBudget.month,
    0,
    23,
    59,
    59,
    999,
  );

  // Get budget categories with their amounts
  const budgetCategories = await db.budgetCategory.findMany({
    where: {
      budgetId: currentBudget.id,
    },
    include: {
      category: true,
    },
  });

  // Get spending data for each category
  const categoriesWithSpending = await Promise.all(
    budgetCategories.map(async (budgetCat) => {
      const spendingResult = await db.transaction.aggregate({
        where: {
          categoryId: budgetCat.categoryId,
          budgetAccountId: accountId,
          type: "expense",
          date: {
            gte: toPrismaDateTime(budgetStartOfMonth),
            lte: toPrismaDateTime(budgetEndOfMonth),
          },
        },
        _sum: {
          amount: true,
        },
      });

      return {
        name: budgetCat.category.name,
        spent: Number(spendingResult._sum.amount || 0),
        budget: Number(budgetCat.amount),
        color: budgetCat.category.color || "rgb(78, 0, 142)",
      };
    }),
  );

  // Color scheme for budget categories (primary colors)
  const colors = [
    "rgb(78, 0, 142)", // primary-500
    "rgb(153, 51, 255)", // primary-400
    "rgb(179, 102, 255)", // primary-300
    "rgb(209, 153, 255)", // primary-200
    "rgb(230, 204, 255)", // primary-100
  ];

  // Assign colors if not set
  return categoriesWithSpending.map((category, index) => ({
    ...category,
    color: category.color || colors[index % colors.length],
  }));
}

/**
 * Get budget categories with spending data for a specific date range
 */
export async function getBudgetCategoriesWithSpendingForDateRange(
  budgetAccountId: string,
  startDate: Date,
  endDate: Date,
) {
  const accountId = budgetAccountId || (await getDefaultBudgetAccountId());

  // Get current budget (we'll use this for budget amounts)
  const now = new Date();
  const currentBudget = await db.budget.findFirst({
    where: {
      budgetAccountId: accountId,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    },
  });

  // Get all categories for the budget account
  const allCategories = await db.category.findMany({
    where: {
      budgetAccountId: accountId,
    },
    select: {
      id: true,
      name: true,
      color: true,
    },
  });

  // If no current budget exists, show all categories with zero budget
  if (!currentBudget) {
    // Get spending data for the date range
    const spendingData = await db.transaction.groupBy({
      by: ["categoryId"],
      where: {
        budgetAccountId: accountId,
        type: "expense",
        date: {
          gte: toPrismaDateTime(startDate),
          lte: toPrismaDateTime(endDate),
        },
        categoryId: {
          not: null,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Create a map of category ID to spending
    const spendingMap = new Map(
      (
        spendingData as {
          categoryId: string;
          _sum: { amount: number | null };
        }[]
      ).map((s) => [s.categoryId, Number(s._sum.amount || 0)]),
    );

    // Color scheme for budget categories (primary colors)
    const colors = [
      "rgb(78, 0, 142)", // primary-500
      "rgb(153, 51, 255)", // primary-400
      "rgb(179, 102, 255)", // primary-300
      "rgb(209, 153, 255)", // primary-200
      "rgb(230, 204, 255)", // primary-100
    ];

    // Return all categories with zero budget and actual spending
    return allCategories.map((category, index) => ({
      name: category.name,
      spent: spendingMap.get(category.id) || 0,
      budget: 0, // No budget set
      color: category.color || colors[index % colors.length],
    }));
  }

  // Get budget amounts for each category
  const budgetAmounts = await db.budgetCategory.findMany({
    where: {
      budgetId: currentBudget.id,
    },
    select: {
      categoryId: true,
      amount: true,
    },
  });

  // Create a map of category ID to budget amount
  const budgetMap = new Map(
    budgetAmounts.map((b) => [b.categoryId, Number(b.amount)]),
  );

  // Get spending data for the date range
  const spendingData = await db.transaction.groupBy({
    by: ["categoryId"],
    where: {
      budgetAccountId: accountId,
      type: "expense",
      date: {
        gte: toPrismaDateTime(startDate),
        lte: toPrismaDateTime(endDate),
      },
      categoryId: {
        not: null,
      },
    },
    _sum: {
      amount: true,
    },
  });

  // Create a map of category ID to spending
  const spendingMap = new Map(
    (
      spendingData as { categoryId: string; _sum: { amount: number | null } }[]
    ).map((s) => [s.categoryId, Number(s._sum.amount || 0)]),
  );

  // Color scheme for budget categories (primary colors)
  const colors = [
    "rgb(78, 0, 142)", // primary-500
    "rgb(153, 51, 255)", // primary-400
    "rgb(179, 102, 255)", // primary-300
    "rgb(209, 153, 255)", // primary-200
    "rgb(230, 204, 255)", // primary-100
  ];

  // Combine all data
  const categoriesWithSpending = allCategories.map((category, index) => ({
    name: category.name,
    spent: spendingMap.get(category.id) || 0,
    budget: budgetMap.get(category.id) || 0,
    color: category.color || colors[index % colors.length],
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
