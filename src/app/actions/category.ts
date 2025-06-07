"use server";

import { categories, transactions, user } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db/config";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";
import { headers } from "next/headers";

export type Category = {
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
  const categoriesWithCounts = await db
    .select({
      id: categories.id,
      name: categories.name,
      description: categories.description,
      color: categories.color,
      icon: categories.icon,
      transactionCount: sql<number>`count(${transactions.id})::int`,
    })
    .from(categories)
    .leftJoin(transactions, eq(transactions.categoryId, categories.id))
    .where(eq(categories.budgetAccountId, accountId))
    .groupBy(categories.id);

  // Convert null values to undefined
  return categoriesWithCounts.map((category) => ({
    ...category,
    description: category.description || undefined,
    color: category.color || undefined,
    icon: category.icon || undefined,
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
  const existing = await db.query.categories.findFirst({
    where: and(
      eq(categories.budgetAccountId, data.budgetAccountId),
      eq(categories.name, data.name),
    ),
  });
  if (existing) {
    throw new Error(
      "Category with this name already exists for this budget account.",
    );
  }

  const categoryId = randomUUID();
  await db.insert(categories).values({
    id: categoryId,
    budgetAccountId: data.budgetAccountId,
    name: data.name,
    description: data.description,
    createdAt: new Date(),
    updatedAt: new Date(),
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

  // Update the category
  await db
    .update(categories)
    .set({
      name: data.name,
      description: data.description,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(categories.id, data.id),
        eq(categories.budgetAccountId, userResult[0].defaultBudgetAccountId),
      ),
    );

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

  // If reassigning transactions, update them first
  if (data.reassignToCategoryId) {
    await db
      .update(transactions)
      .set({
        categoryId: data.reassignToCategoryId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(transactions.categoryId, data.id),
          eq(
            transactions.budgetAccountId,
            userResult[0].defaultBudgetAccountId,
          ),
        ),
      );
  }

  // Delete the category
  await db
    .delete(categories)
    .where(
      and(
        eq(categories.id, data.id),
        eq(categories.budgetAccountId, userResult[0].defaultBudgetAccountId),
      ),
    );

  return { success: true };
}
