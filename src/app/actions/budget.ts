"use server";

import { db } from "@/db/config";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { BudgetCategoryName } from "../dashboard/budgets/types/budget.types";
// Removed unused type imports

/**
 * Gets the budget categories for a specific budget
 * @param budgetId - The ID of the budget to get categories for
 * @returns Promise resolving to an array of budget categories
 * @throws {Error} If user is not authenticated
 */
export async function getBudgetCategories(budgetId: string) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  const budgetCategoriesResult = await db.budgetCategory.findMany({
    where: {
      budgetId: budgetId,
    },
    include: {
      category: {
        select: {
          name: true,
          color: true,
        },
      },
    },
  });

  return budgetCategoriesResult.map((bc) => ({
    id: bc.id,
    name: bc.category.name as BudgetCategoryName,
    amount: Number(bc.amount),
    color: bc.category.color || "#64748B",
  }));
}

/**
 * Creates a new budget category
 * @param budgetId - The ID of the budget to add the category to
 * @param name - The name of the category
 * @param amount - The budgeted amount for the category
 * @returns Promise resolving to the created budget category
 * @throws {Error} If user is not authenticated or not authorized
 */
export async function createBudgetCategory(
  budgetId: string,
  name: BudgetCategoryName,
  amount: number,
) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Get the budget to verify ownership
  const budget = await db.budget.findFirst({
    where: {
      id: budgetId,
    },
    include: {
      budgetAccount: {
        include: {
          members: true,
        },
      },
    },
  });

  if (!budget) {
    throw new Error("Budget not found");
  }

  // Verify user has permission
  const members = budget.budgetAccount?.members;
  const member = members?.find((m) => m.userId === sessionResult.user.id);
  if (!member) {
    throw new Error("Not authorized");
  }

  // Get or create the category
  let category = await db.category.findFirst({
    where: {
      budgetAccountId: budget.budgetAccountId,
      name: name,
    },
  });

  if (!category) {
    category = await db.category.create({
      data: {
        id: randomUUID(),
        budgetAccountId: budget.budgetAccountId,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  // Create the budget category
  const budgetCategory = await db.budgetCategory.create({
    data: {
      id: randomUUID(),
      budgetId,
      categoryId: category.id,
      amount: amount.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return {
    id: budgetCategory.id,
    name: category.name as BudgetCategoryName,
    amount: Number(amount),
    color: category.color || "#64748B",
  };
}

/**
 * Updates an existing budget category
 * @param budgetCategoryId - The ID of the budget category to update
 * @param amount - The new budgeted amount for the category
 * @returns Promise resolving to the updated budget category
 * @throws {Error} If user is not authenticated or not authorized
 */
export async function updateBudgetCategory(
  budgetCategoryId: string,
  amount: number,
) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Get the budget category with its related data
  const budgetCategory = await db.budgetCategory.findFirst({
    where: {
      id: budgetCategoryId,
    },
    include: {
      category: true,
      budget: {
        include: {
          budgetAccount: {
            include: {
              members: true,
            },
          },
        },
      },
    },
  });

  if (!budgetCategory) {
    throw new Error("Budget category not found");
  }

  // Verify user has permission
  const members = budgetCategory.budget?.budgetAccount?.members;
  const member = members?.find((m) => m.userId === sessionResult.user.id);
  if (!member) {
    throw new Error("Not authorized");
  }

  // Update the budget category
  await db.budgetCategory.update({
    where: {
      id: budgetCategoryId,
    },
    data: {
      amount: amount.toString(),
      updatedAt: new Date(),
    },
  });

  return {
    id: budgetCategoryId,
    name: budgetCategory.category?.name as BudgetCategoryName,
    amount: Number(amount),
    color: budgetCategory.category?.color || "#64748B",
  };
}

/**
 * Deletes a budget category
 * @param budgetCategoryId - The ID of the budget category to delete
 * @throws {Error} If user is not authenticated or not authorized
 */
export async function deleteBudgetCategory(budgetCategoryId: string) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Get the budget category with its related data
  const budgetCategory = await db.budgetCategory.findFirst({
    where: {
      id: budgetCategoryId,
    },
    include: {
      budget: {
        include: {
          budgetAccount: {
            include: {
              members: true,
            },
          },
        },
      },
    },
  });

  if (!budgetCategory) {
    throw new Error("Budget category not found");
  }

  // Verify user has permission
  const members = budgetCategory.budget?.budgetAccount?.members;
  const member = members?.find((m) => m.userId === sessionResult.user.id);
  if (!member) {
    throw new Error("Not authorized");
  }

  // Delete the budget category
  await db.budgetCategory.delete({
    where: {
      id: budgetCategoryId,
    },
  });
}

/**
 * Creates a new budget for a specific month
 * @param budgetAccountId - The ID of the budget account
 * @param year - The year for the budget
 * @param month - The month for the budget (1-12)
 * @param totalBudget - The total budget amount for the budget
 * @returns Promise resolving to the created budget
 * @throws {Error} If user is not authenticated
 */
export async function createBudget(
  budgetAccountId: string,
  year: number,
  month: number,
  totalBudget?: number,
) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Check if budget already exists
  const existingBudget = await db.budget.findFirst({
    where: {
      budgetAccountId: budgetAccountId,
      year: year,
      month: month,
    },
  });

  if (existingBudget) {
    return existingBudget;
  }

  // Create new budget
  const budget = await db.budget.create({
    data: {
      id: randomUUID(),
      budgetAccountId,
      name: `${new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" })} Budget`,
      description: null,
      year,
      month,
      totalBudget: totalBudget?.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return budget;
}

/**
 * Updates an existing budget's total budget amount
 * @param budgetId - The ID of the budget to update
 * @param totalBudget - The new total budget amount
 * @returns Promise resolving to the updated budget
 * @throws {Error} If user is not authenticated or not authorized
 */
export async function updateBudget(budgetId: string, totalBudget: number) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Get the budget to verify ownership
  const budget = await db.budget.findFirst({
    where: {
      id: budgetId,
    },
    include: {
      budgetAccount: {
        include: {
          members: true,
        },
      },
    },
  });

  if (!budget) {
    throw new Error("Budget not found");
  }

  // Verify user has permission
  const members = budget.budgetAccount?.members;
  const member = members?.find((m) => m.userId === sessionResult.user.id);
  if (!member) {
    throw new Error("Not authorized");
  }

  // Update the budget
  const updatedBudget = await db.budget.update({
    where: {
      id: budgetId,
    },
    data: {
      totalBudget: totalBudget.toString(),
      updatedAt: new Date(),
    },
  });

  return updatedBudget;
}

/**
 * Gets a budget for a specific account, year, and month (does not create if missing)
 * @param budgetAccountId - The ID of the budget account
 * @param year - The year for the budget
 * @param month - The month for the budget (1-12)
 * @returns Promise resolving to the budget or null if not found
 */
export async function getBudget(
  budgetAccountId: string,
  year: number,
  month: number,
) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Fetch the budget if it exists
  const existingBudget = await db.budget.findFirst({
    where: {
      budgetAccountId: budgetAccountId,
      year: year,
      month: month,
    },
  });

  return existingBudget || null;
}
