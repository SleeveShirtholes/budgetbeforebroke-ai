"use server";

import { budgetAccounts, categories, transactions, user } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";

import { db } from "@/db/config";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";
import { headers } from "next/headers";

/**
 * Input type for creating a new transaction
 */
export type CreateTransactionInput = {
  amount: number;
  description?: string;
  date: string;
  type: "income" | "expense";
  categoryId?: string;
  merchantName?: string;
};

/**
 * Input type for updating an existing transaction
 */
export type UpdateTransactionInput = {
  id: string;
  amount?: number;
  description?: string;
  date?: string;
  type?: "income" | "expense";
  categoryId?: string;
  merchantName?: string;
};

/**
 * Transaction data structure with optional category name
 */
export type Transaction = {
  id: string;
  budgetAccountId: string;
  categoryId: string | null;
  createdByUserId: string;
  amount: number;
  description: string | null;
  date: string;
  type: "income" | "expense";
  status: string;
  merchantName: string | null;
  plaidCategory: string | null;
  pending: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoryName?: string;
};

/**
 * Helper function to get the user's default budget account ID
 *
 * This function retrieves the authenticated user's session and fetches their
 * default budget account ID from the database. It's used by other transaction
 * functions to ensure operations are performed on the correct budget account.
 *
 * @returns Promise<string> - The default budget account ID for the authenticated user
 * @throws Error - If user is not authenticated or no default budget account is found
 */
async function getDefaultBudgetAccountId(): Promise<string> {
  // Get the current user session
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  // Validate authentication
  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Query the database for the user's default budget account
  const userResult = await db
    .select({
      defaultBudgetAccountId: user.defaultBudgetAccountId,
    })
    .from(user)
    .where(eq(user.id, sessionResult.user.id))
    .limit(1);

  // Ensure the user has a default budget account
  if (!userResult[0]?.defaultBudgetAccountId) {
    throw new Error("No default budget account found");
  }

  return userResult[0].defaultBudgetAccountId;
}

/**
 * Parses a transaction date string into a date string
 * Handles both YYYY-MM-DD format and ISO strings
 * Returns date string in YYYY-MM-DD format to avoid timezone issues
 *
 * @param dateString - The date string to parse (optional)
 * @returns Date string in YYYY-MM-DD format, or current date if no string provided
 */
function parseTransactionDate(dateString?: string): string {
  if (!dateString) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Handle both YYYY-MM-DD format and ISO strings
  let normalizedDateString: string;
  if (dateString.includes("T")) {
    // If it's an ISO string, extract just the date part
    normalizedDateString = dateString.split("T")[0]; // Get just YYYY-MM-DD
  } else {
    // If it's already in YYYY-MM-DD format, use it directly
    normalizedDateString = dateString;
  }

  // Validate the date string format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDateString)) {
    throw new Error(
      `Invalid date format: ${dateString}. Expected YYYY-MM-DD format.`,
    );
  }

  return normalizedDateString;
}

/**
 * Gets all transactions for the specified budget account (or default if not provided)
 *
 * This function retrieves all transactions for a budget account, including
 * category information through a left join. Transactions are ordered by date
 * in descending order (most recent first).
 *
 * @param budgetAccountId - Optional budget account ID. If not provided, uses the user's default account
 * @returns Promise<Transaction[]> - Array of transactions with category names
 */
export async function getTransactions(budgetAccountId?: string) {
  // Use provided account ID or get the default one
  const accountId = budgetAccountId || (await getDefaultBudgetAccountId());

  // Get transactions with category names using a left join
  const transactionsWithCategories = await db
    .select({
      id: transactions.id,
      budgetAccountId: transactions.budgetAccountId,
      categoryId: transactions.categoryId,
      createdByUserId: transactions.createdByUserId,
      amount: transactions.amount,
      description: transactions.description,
      date: transactions.date,
      type: transactions.type,
      status: transactions.status,
      merchantName: transactions.merchantName,
      plaidCategory: transactions.plaidCategory,
      pending: transactions.pending,
      createdAt: transactions.createdAt,
      updatedAt: transactions.updatedAt,
      categoryName: categories.name,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.budgetAccountId, accountId))
    .orderBy(desc(transactions.date));

  // Convert amount to number and return transactions
  return transactionsWithCategories.map((transaction) => ({
    ...transaction,
    amount: Number(transaction.amount),
    type: transaction.type as "income" | "expense",
    categoryName: transaction.categoryName || undefined,
  }));
}

/**
 * Gets all categories for the specified budget account (or default if not provided)
 *
 * This function retrieves all categories associated with a budget account.
 * Categories are ordered alphabetically by name.
 *
 * @param budgetAccountId - Optional budget account ID. If not provided, uses the user's default account
 * @returns Promise<Array> - Array of categories with optional fields properly handled
 */
export async function getTransactionCategories(budgetAccountId?: string) {
  // Use provided account ID or get the default one
  const accountId = budgetAccountId || (await getDefaultBudgetAccountId());

  // Query categories for the specified budget account
  const categoriesResult = await db
    .select({
      id: categories.id,
      name: categories.name,
      description: categories.description,
      color: categories.color,
      icon: categories.icon,
    })
    .from(categories)
    .where(eq(categories.budgetAccountId, accountId))
    .orderBy(categories.name);

  // Convert null values to undefined for optional fields
  return categoriesResult.map((category) => ({
    ...category,
    description: category.description || undefined,
    color: category.color || undefined,
    icon: category.icon || undefined,
  }));
}

/**
 * Creates a new transaction
 *
 * This function creates a new transaction in the database. It validates that
 * the user is authenticated, the budget account exists, and the category exists
 * (if provided). The transaction is created with a "completed" status by default.
 *
 * @param data - Transaction data including amount, description, date, type, and optional category/merchant
 * @returns Promise<{id: string}> - Object containing the ID of the created transaction
 * @throws Error - If user is not authenticated, budget account not found, or category not found
 */
export async function createTransaction(data: CreateTransactionInput) {
  // Get the current user session
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  // Validate authentication
  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Get the user's default budget account ID
  const budgetAccountId = await getDefaultBudgetAccountId();

  // Verify the budget account exists
  const budgetAccount = await db
    .select()
    .from(budgetAccounts)
    .where(eq(budgetAccounts.id, budgetAccountId))
    .limit(1);

  if (!budgetAccount[0]) {
    throw new Error("Budget account not found");
  }

  // Verify category exists if provided
  if (data.categoryId) {
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, data.categoryId))
      .limit(1);

    if (!category[0]) {
      throw new Error("Category not found");
    }
  }

  // Generate a unique transaction ID and insert the transaction
  const transactionId = randomUUID();

  // Parse the date using the helper function
  const transactionDate = parseTransactionDate(data.date);

  await db.insert(transactions).values({
    id: transactionId,
    budgetAccountId,
    categoryId: data.categoryId || null,
    createdByUserId: sessionResult.user.id,
    amount: data.amount.toString(),
    description: data.description || null,
    date: transactionDate,
    type: data.type,
    status: "completed",
    merchantName: data.merchantName || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return { id: transactionId };
}

/**
 * Updates an existing transaction
 *
 * This function updates a transaction in the database. It validates that
 * the user is authenticated and the transaction exists. Only the provided
 * fields are updated.
 *
 * @param data - Transaction update data including ID and optional fields to update
 * @returns Promise<{id: string}> - Object containing the ID of the updated transaction
 * @throws Error - If user is not authenticated or transaction not found
 */
export async function updateTransaction(data: UpdateTransactionInput) {
  // Get the current user session
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  // Validate authentication
  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Get the user's default budget account ID
  const budgetAccountId = await getDefaultBudgetAccountId();

  // Verify the transaction exists and belongs to the user's budget account
  const existingTransaction = await db
    .select({
      id: transactions.id,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.id, data.id),
        eq(transactions.budgetAccountId, budgetAccountId),
      ),
    )
    .limit(1);

  if (!existingTransaction[0]) {
    throw new Error("Transaction not found");
  }

  // Verify category exists if provided
  if (data.categoryId) {
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, data.categoryId))
      .limit(1);

    if (!category[0]) {
      throw new Error("Category not found");
    }
  }

  // Build update data object with only provided fields
  const updateData: Partial<{
    amount: string;
    description: string | null;
    date: string;
    type: "income" | "expense";
    categoryId: string | null;
    merchantName: string | null;
    updatedAt: Date;
  }> = {
    updatedAt: new Date(),
  };

  // Add provided fields to update data
  if (data.amount !== undefined) {
    updateData.amount = data.amount.toString();
  }
  if (data.description !== undefined) {
    updateData.description = data.description || null;
  }
  if (data.date !== undefined) {
    // Parse the date using the helper function
    updateData.date = parseTransactionDate(data.date);
  }
  if (data.type !== undefined) {
    updateData.type = data.type;
  }
  if (data.categoryId !== undefined) {
    updateData.categoryId = data.categoryId || null;
  }
  if (data.merchantName !== undefined) {
    updateData.merchantName = data.merchantName || null;
  }

  // Update the transaction
  await db
    .update(transactions)
    .set(updateData)
    .where(eq(transactions.id, data.id));

  return { id: data.id };
}

/**
 * Updates the category of a transaction
 *
 * This function specifically updates the category of an existing transaction.
 * It validates that the category exists (if provided) and that the transaction
 * belongs to the user's budget account.
 *
 * @param transactionId - The ID of the transaction to update
 * @param categoryId - The new category ID (or null to remove the category)
 * @returns Promise<{id: string}> - Object containing the ID of the updated transaction
 * @throws Error - If category not found or transaction doesn't belong to user's budget account
 */
export async function updateTransactionCategory(
  transactionId: string,
  categoryId: string | null,
) {
  // Get the user's default budget account ID
  const budgetAccountId = await getDefaultBudgetAccountId();

  // Verify category exists if provided
  if (categoryId) {
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (!category[0]) {
      throw new Error("Category not found");
    }
  }

  // Update the transaction category in the database
  await db
    .update(transactions)
    .set({
      categoryId,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(transactions.id, transactionId),
        eq(transactions.budgetAccountId, budgetAccountId),
      ),
    );

  return { id: transactionId };
}

/**
 * Deletes a transaction
 *
 * This function permanently deletes a transaction from the database.
 * It ensures that the transaction belongs to the user's budget account
 * before deletion.
 *
 * @param transactionId - The ID of the transaction to delete
 * @returns Promise<{id: string}> - Object containing the ID of the deleted transaction
 * @throws Error - If transaction doesn't belong to user's budget account
 */
export async function deleteTransaction(transactionId: string) {
  // Get the user's default budget account ID
  const budgetAccountId = await getDefaultBudgetAccountId();

  // Delete the transaction from the database
  await db
    .delete(transactions)
    .where(
      and(
        eq(transactions.id, transactionId),
        eq(transactions.budgetAccountId, budgetAccountId),
      ),
    );

  return { id: transactionId };
}
