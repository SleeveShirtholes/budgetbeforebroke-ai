"use server";

import { db } from "@/db/schema";

import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";
import { headers } from "next/headers";

export type CategoryWithCount = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  transactionCount: number;
};

/**
 * Gets all categories for a specific budget account
 * @param accountId - The ID of the budget account to get categories for
 */
export async function getCategories(accountId: string) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Get categories with transaction counts
  const categories = await db.category.findMany({
    where: {
      budgetAccountId: accountId,
    },
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  // Convert to the expected format
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description || undefined,
    color: category.color || undefined,
    icon: category.icon || undefined,
    transactionCount: category._count.transactions,
  }));
}

/**
 * Creates a new category
 */
export async function createCategory(data: {
  name: string;
  description?: string;
  budgetAccountId: string;
}) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  if (!data.budgetAccountId) {
    throw new Error("No budget account id provided");
  }

  // Check for duplicate category name in the same budget account
  const existing = await db.category.findFirst({
    where: {
      budgetAccountId: data.budgetAccountId,
      name: data.name,
    },
  });

  if (existing) {
    throw new Error(
      "Category with this name already exists for this budget account.",
    );
  }

  const categoryId = randomUUID();
  await db.category.create({
    data: {
      id: categoryId,
      budgetAccountId: data.budgetAccountId,
      name: data.name,
      description: data.description,
    },
  });

  return {
    id: categoryId,
    name: data.name,
    description: data.description,
    transactionCount: 0,
  };
}

/**
 * Updates an existing category
 */
export async function updateCategory(data: {
  id: string;
  name: string;
  description?: string;
}) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Get the user's default budget account
  const userResult = await db.user.findFirst({
    where: { id: sessionResult.user.id },
    select: {
      defaultBudgetAccountId: true,
    },
  });

  if (!userResult?.defaultBudgetAccountId) {
    throw new Error("No default budget account found");
  }

  // Update the category
  await db.category.updateMany({
    where: {
      id: data.id,
      budgetAccountId: userResult.defaultBudgetAccountId,
    },
    data: {
      name: data.name,
      description: data.description,
    },
  });

  return {
    id: data.id,
    name: data.name,
    description: data.description,
  };
}

/**
 * Deletes a category and optionally reassigns its transactions
 */
export async function deleteCategory(data: {
  id: string;
  reassignToCategoryId?: string;
}) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Get the user's default budget account
  const userResult = await db.user.findFirst({
    where: { id: sessionResult.user.id },
    select: {
      defaultBudgetAccountId: true,
    },
  });

  if (!userResult?.defaultBudgetAccountId) {
    throw new Error("No default budget account found");
  }

  // If reassigning transactions, update them first
  if (data.reassignToCategoryId) {
    await db.transaction.updateMany({
      where: {
        categoryId: data.id,
        budgetAccountId: userResult.defaultBudgetAccountId,
      },
      data: {
        categoryId: data.reassignToCategoryId,
      },
    });
  }

  // Delete the category
  await db.category.deleteMany({
    where: {
      id: data.id,
      budgetAccountId: userResult.defaultBudgetAccountId,
    },
  });

  return { success: true };
}
