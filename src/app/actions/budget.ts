"use server";

import {
  budgetAccountMembers,
  budgetCategories,
  budgets,
  categories,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";

import { db } from "@/db/config";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";
import type { InferSelectModel } from "drizzle-orm";
import { headers } from "next/headers";
import { BudgetCategoryName } from "../dashboard/budgets/types/budget.types";

type BudgetAccountMember = InferSelectModel<typeof budgetAccountMembers>;
type Budget = InferSelectModel<typeof budgets> & {
  budgetAccount?: {
    members?: BudgetAccountMember[];
  };
};
type Category = InferSelectModel<typeof categories>;
type BudgetCategory = InferSelectModel<typeof budgetCategories> & {
  category?: Category;
  budget?: Budget;
};

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

  const budgetCategoriesResult = await db
    .select({
      id: budgetCategories.id,
      amount: budgetCategories.amount,
      category: {
        name: categories.name,
        color: categories.color,
      },
    })
    .from(budgetCategories)
    .innerJoin(categories, eq(budgetCategories.categoryId, categories.id))
    .where(eq(budgetCategories.budgetId, budgetId));

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
  const budget = (await db.query.budgets.findFirst({
    where: eq(budgets.id, budgetId),
    with: {
      budgetAccount: {
        with: {
          members: true,
        },
      },
    },
  })) as Budget | null;

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
  let category = await db.query.categories.findFirst({
    where: and(
      eq(categories.budgetAccountId, budget.budgetAccountId),
      eq(categories.name, name),
    ),
  });

  if (!category) {
    const categoryId = randomUUID();
    await db.insert(categories).values({
      id: categoryId,
      budgetAccountId: budget.budgetAccountId,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    category = {
      id: categoryId,
      budgetAccountId: budget.budgetAccountId,
      name,
      description: null,
      color: null,
      icon: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Create the budget category
  const budgetCategoryId = randomUUID();
  await db.insert(budgetCategories).values({
    id: budgetCategoryId,
    budgetId,
    categoryId: category.id,
    amount: amount.toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    id: budgetCategoryId,
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
  const budgetCategory = (await db.query.budgetCategories.findFirst({
    where: eq(budgetCategories.id, budgetCategoryId),
    with: {
      category: true,
      budget: {
        with: {
          budgetAccount: {
            with: {
              members: true,
            },
          },
        },
      },
    },
  })) as BudgetCategory | null;

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
  await db
    .update(budgetCategories)
    .set({
      amount: amount.toString(),
      updatedAt: new Date(),
    })
    .where(eq(budgetCategories.id, budgetCategoryId));

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
  const budgetCategory = (await db.query.budgetCategories.findFirst({
    where: eq(budgetCategories.id, budgetCategoryId),
    with: {
      budget: {
        with: {
          budgetAccount: {
            with: {
              members: true,
            },
          },
        },
      },
    },
  })) as BudgetCategory | null;

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
  await db
    .delete(budgetCategories)
    .where(eq(budgetCategories.id, budgetCategoryId));
}

/**
 * Creates a new budget for a specific month
 * @param budgetAccountId - The ID of the budget account
 * @param year - The year for the budget
 * @param month - The month for the budget (1-12)
 * @returns Promise resolving to the created budget
 * @throws {Error} If user is not authenticated
 */
export async function createBudget(
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

  // Check if budget already exists
  const existingBudget = await db.query.budgets.findFirst({
    where: and(
      eq(budgets.budgetAccountId, budgetAccountId),
      eq(budgets.year, year),
      eq(budgets.month, month),
    ),
  });

  if (existingBudget) {
    return existingBudget;
  }

  // Create new budget
  const budgetId = randomUUID();
  await db.insert(budgets).values({
    id: budgetId,
    budgetAccountId,
    name: `${new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" })} Budget`,
    year,
    month,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    id: budgetId,
    budgetAccountId,
    name: `${new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" })} Budget`,
    year,
    month,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
