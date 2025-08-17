"use server";

import { and, eq, desc } from "drizzle-orm";
import {
  debts,
  debtAllocations,
  budgetAccounts,
  user,
  transactions,
  categories,
} from "@/db/schema";

import { db } from "@/db/config";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";
import { headers } from "next/headers";

/**
 * Input type for creating a new debt
 */
export type CreateDebtInput = {
  name: string;
  paymentAmount: number;
  interestRate: number;
  dueDate: string;
  hasBalance?: boolean;
  categoryId?: string;
};

/**
 * Input type for updating an existing debt
 */
export type UpdateDebtInput = {
  id: string;
  name: string;
  paymentAmount: number;
  interestRate: number;
  dueDate: string;
  categoryId?: string;
};

/**
 * Input type for creating a debt payment
 */
export type CreateDebtPaymentInput = {
  debtId: string;
  amount: number;
  date: string;
  note?: string;
};

/**
 * Debt data structure with payments
 */
export type Debt = {
  id: string;
  budgetAccountId: string;
  createdByUserId: string;
  categoryId?: string;
  name: string;
  paymentAmount: number;
  interestRate: number;
  dueDate: string; // Now a date string in YYYY-MM-DD format
  hasBalance: boolean;
  createdAt: Date;
  updatedAt: Date;
  payments: DebtPayment[];
};

/**
 * Debt payment data structure
 */
export type DebtPayment = {
  id: string;
  debtId: string;
  amount: number;
  date: string; // Now a date string in YYYY-MM-DD format
  note: string | null;
  isPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Gets the default budget account ID for the current user
 */
async function getDefaultBudgetAccountId(): Promise<string> {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  const userData = await db
    .select()
    .from(user)
    .where(eq(user.id, sessionResult.user.id))
    .limit(1);

  if (!userData[0]?.defaultBudgetAccountId) {
    throw new Error("No default budget account found");
  }

  return userData[0].defaultBudgetAccountId;
}

/**
 * Gets all debts for the specified budget account (or default if not provided)
 *
 * This function retrieves all debts for a budget account, including
 * payment information. Debts are ordered by due date in ascending order.
 *
 * @param budgetAccountId - Optional budget account ID. If not provided, uses the user's default account
 * @returns Promise<Debt[]> - Array of debts with payment information
 */
export async function getDebts(budgetAccountId?: string) {
  // Use provided account ID or get the default one
  const accountId = budgetAccountId || (await getDefaultBudgetAccountId());

  // Get debts with allocation/payment information
  const debtsWithAllocations = await db
    .select({
      id: debts.id,
      budgetAccountId: debts.budgetAccountId,
      createdByUserId: debts.createdByUserId,
      categoryId: debts.categoryId,
      name: debts.name,
      paymentAmount: debts.paymentAmount,
      interestRate: debts.interestRate,
      dueDate: debts.dueDate,
      hasBalance: debts.hasBalance,
      createdAt: debts.createdAt,
      updatedAt: debts.updatedAt,
      allocationId: debtAllocations.id,
      allocationDebtId: debtAllocations.debtId,
      paymentAmountAllocation: debtAllocations.paymentAmount,
      paymentDate: debtAllocations.paymentDate,
      paymentNote: debtAllocations.note,
      paymentIsPaid: debtAllocations.isPaid,
      paymentCreatedAt: debtAllocations.createdAt,
      paymentUpdatedAt: debtAllocations.updatedAt,
    })
    .from(debts)
    .leftJoin(debtAllocations, eq(debts.id, debtAllocations.debtId))
    .where(eq(debts.budgetAccountId, accountId))
    .orderBy(debts.dueDate, desc(debtAllocations.paymentDate));

  // Group allocations by debt
  const debtMap = new Map<string, Debt>();

  debtsWithAllocations.forEach((row) => {
    if (!debtMap.has(row.id)) {
      debtMap.set(row.id, {
        id: row.id,
        budgetAccountId: row.budgetAccountId,
        createdByUserId: row.createdByUserId,
        categoryId: row.categoryId || undefined,
        name: row.name,
        paymentAmount: Number(row.paymentAmount),
        interestRate: Number(row.interestRate),
        dueDate: row.dueDate,
        hasBalance: row.hasBalance,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        payments: [],
      });
    }

    if (row.allocationId && row.paymentAmountAllocation && row.paymentDate) {
      const debt = debtMap.get(row.id)!;
      debt.payments.push({
        id: row.allocationId,
        debtId: row.allocationDebtId!,
        amount: Number(row.paymentAmountAllocation),
        date: row.paymentDate!,
        note: row.paymentNote,
        isPaid: row.paymentIsPaid!,
        createdAt: row.paymentCreatedAt!,
        updatedAt: row.paymentUpdatedAt!,
      });
    }
  });

  return Array.from(debtMap.values());
}

/**
 * Creates a new debt
 *
 * This function creates a new debt in the database. It validates that
 * the user is authenticated and the budget account exists.
 *
 * @param data - Debt data including name, balance, interest rate, and due date
 * @param budgetAccountId - Optional budget account ID. If not provided, uses the user's default account
 * @returns Promise<{id: string}> - Object containing the ID of the created debt
 * @throws Error - If user is not authenticated or budget account not found
 */
export async function createDebt(
  data: CreateDebtInput,
  budgetAccountId?: string,
) {
  // Get the current user session
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  // Validate authentication
  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Get the user's default budget account ID if not provided
  const accountId = budgetAccountId || (await getDefaultBudgetAccountId());

  // Verify the budget account exists
  const budgetAccount = await db
    .select()
    .from(budgetAccounts)
    .where(eq(budgetAccounts.id, accountId))
    .limit(1);

  if (!budgetAccount[0]) {
    throw new Error("Budget account not found");
  }

  // Generate a unique debt ID and insert the debt
  const debtId = randomUUID();
  await db.insert(debts).values({
    id: debtId,
    budgetAccountId: accountId,
    createdByUserId: sessionResult.user.id,
    categoryId: data.categoryId,
    name: data.name,
    paymentAmount: data.paymentAmount.toString(),
    interestRate: data.interestRate.toString(),
    dueDate: data.dueDate, // Now a date string in YYYY-MM-DD format
    hasBalance: data.hasBalance || false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return { id: debtId };
}

/**
 * Updates an existing debt
 *
 * This function updates an existing debt in the database. It validates that
 * the user is authenticated and the debt exists.
 *
 * @param data - Debt data including ID, name, balance, interest rate, and due date
 * @param budgetAccountId - Optional budget account ID. If not provided, uses the user's default account
 * @returns Promise<{id: string}> - Object containing the ID of the updated debt
 * @throws Error - If user is not authenticated or debt not found
 */
export async function updateDebt(
  data: UpdateDebtInput,
  budgetAccountId?: string,
) {
  // Get the current user session
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  // Validate authentication
  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Get the user's default budget account ID if not provided
  const accountId = budgetAccountId || (await getDefaultBudgetAccountId());

  // Verify the debt exists and belongs to the user's budget account
  const existingDebt = await db
    .select()
    .from(debts)
    .where(and(eq(debts.id, data.id), eq(debts.budgetAccountId, accountId)))
    .limit(1);

  if (!existingDebt[0]) {
    throw new Error("Debt not found");
  }

  // Update the debt
  await db
    .update(debts)
    .set({
      name: data.name,
      categoryId: data.categoryId,
      paymentAmount: data.paymentAmount.toString(),
      interestRate: data.interestRate.toString(),
      dueDate: data.dueDate, // Now a date string in YYYY-MM-DD format
      updatedAt: new Date(),
    })
    .where(eq(debts.id, data.id));

  return { id: data.id };
}

/**
 * Deletes a debt
 *
 * This function deletes a debt and all its associated payments from the database.
 * It validates that the user is authenticated and the debt exists.
 *
 * @param id - The ID of the debt to delete
 * @param budgetAccountId - Optional budget account ID. If not provided, uses the user's default account
 * @returns Promise<{id: string}> - Object containing the ID of the deleted debt
 * @throws Error - If user is not authenticated or debt not found
 */
export async function deleteDebt(id: string, budgetAccountId?: string) {
  // Get the current user session
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  // Validate authentication
  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Get the user's default budget account ID if not provided
  const accountId = budgetAccountId || (await getDefaultBudgetAccountId());

  // Verify the debt exists and belongs to the user's budget account
  const existingDebt = await db
    .select()
    .from(debts)
    .where(and(eq(debts.id, id), eq(debts.budgetAccountId, accountId)))
    .limit(1);

  if (!existingDebt[0]) {
    throw new Error("Debt not found");
  }

  // Delete the debt (payments will be cascaded due to foreign key constraint)
  await db.delete(debts).where(eq(debts.id, id));

  return { id };
}

/**
 * Creates a payment for a debt
 *
 * This function creates a payment for a debt and updates the debt's balance and due date.
 * It also creates a corresponding transaction in the Debts category (creating the category if needed).
 * The due date only advances if a payment is made for the current due period (month/year).
 *
 * @param data - Payment data including debt ID, amount, date, and optional note
 * @param budgetAccountId - Optional budget account ID. If not provided, uses the user's default account
 * @returns Promise<{id: string}> - Object containing the ID of the created payment
 * @throws Error - If user is not authenticated, debt not found, or insufficient balance
 */
export async function createDebtPayment(
  data: CreateDebtPaymentInput,
  budgetAccountId?: string,
) {
  // Get the current user session
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  // Validate authentication
  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Get the user's default budget account ID if not provided
  const accountId = budgetAccountId || (await getDefaultBudgetAccountId());

  // Verify the debt exists and belongs to the user's budget account
  const existingDebtArr = await db
    .select()
    .from(debts)
    .where(and(eq(debts.id, data.debtId), eq(debts.budgetAccountId, accountId)))
    .limit(1);

  const existingDebt = existingDebtArr[0];
  if (!existingDebt) {
    throw new Error("Debt not found");
  }

  const currentBalance = Number(existingDebt.paymentAmount);
  const paymentAmount = data.amount;

  if (paymentAmount > currentBalance) {
    throw new Error("Payment amount cannot exceed current balance");
  }

  if (paymentAmount <= 0) {
    throw new Error("Payment amount must be positive");
  }

  // Calculate new payment amount
  const newPaymentAmount = currentBalance - paymentAmount;

  // Find or create the 'Debts' category for this budget account
  let debtsCategory = await db.query.categories.findFirst({
    where: (cat, { eq, and }) =>
      and(eq(cat.name, "Debts"), eq(cat.budgetAccountId, accountId)),
  });
  if (!debtsCategory) {
    const newCategoryId = randomUUID();
    await db.insert(categories).values({
      id: newCategoryId,
      budgetAccountId: accountId,
      name: "Debts",
      color: "#8B5CF6", // Example color
      icon: "banknotes", // Example icon
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    debtsCategory = {
      id: newCategoryId,
      name: "Debts",
      color: "#8B5CF6",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      budgetAccountId: accountId,
      icon: "banknotes",
    };
  }

  // Create the payment as a standalone allocation (not tied to a paycheck)
  const paymentId = randomUUID();
  await db.insert(debtAllocations).values({
    id: paymentId,
    budgetAccountId: accountId,
    debtId: data.debtId,
    paycheckId: "standalone-payment", // Special ID for standalone payments
    paymentAmount: paymentAmount.toString(),
    paymentDate: data.date, // Already a date string in YYYY-MM-DD format
    note: data.note || null,
    isPaid: false, // Default to unpaid when created
    userId: sessionResult.user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create a transaction for this payment
  // Use the debt's category if available, otherwise use the "Debts" category we found/created
  let categoryId = existingDebt.categoryId;

  if (!categoryId) {
    // Use the "Debts" category we found or created earlier
    categoryId = debtsCategory.id;
  }

  // Always create a transaction since we now have a category
  await db.insert(transactions).values({
    id: randomUUID(),
    budgetAccountId: accountId,
    categoryId,
    createdByUserId: sessionResult.user.id,
    debtId: existingDebt.id, // Add the foreign key reference
    amount: paymentAmount.toString(), // always positive, use type field to distinguish expense/income
    description: `Debt payment: ${existingDebt.name}`,
    date: new Date(data.date),
    type: "expense", // explicitly set as expense
    status: "completed",
    merchantName: existingDebt.name,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Advance due date only if payment is for the current due period
  const paymentDate = new Date(data.date);
  const dueDate = new Date(existingDebt.dueDate);
  const lastPaymentMonth = existingDebt.lastPaymentMonth
    ? new Date(existingDebt.lastPaymentMonth)
    : null;
  const paymentMonth = new Date(
    paymentDate.getFullYear(),
    paymentDate.getMonth(),
    1,
  );
  const dueMonth = new Date(dueDate.getFullYear(), dueDate.getMonth(), 1);

  // Check if this payment should advance the due date
  // (but we won't modify the base debt due date - we'll use monthly planning instead)
  const shouldAdvanceDueDate =
    (paymentDate <= dueDate || paymentMonth.getTime() === dueMonth.getTime()) &&
    (!lastPaymentMonth ||
      lastPaymentMonth.getTime() !== paymentMonth.getTime());

  if (shouldAdvanceDueDate) {
    // Instead of modifying the base debt due date, we'll create monthly planning
    // for future months. The base debt.dueDate remains unchanged.

    // Calculate the next month after this payment
    const nextMonth = new Date(
      paymentDate.getFullYear(),
      paymentDate.getMonth() + 1,
      1,
    );
    const nextYear = nextMonth.getFullYear();
    const nextMonthNum = nextMonth.getMonth() + 1;

    // Create monthly planning for the next month to track the advanced due date
    // This preserves the base debt due date while allowing monthly due date tracking
    try {
      // Import the function dynamically to avoid circular dependencies
      const { getOrCreateMonthlyDebtPlanning } = await import(
        "./paycheck-planning"
      );
      await getOrCreateMonthlyDebtPlanning(
        accountId,
        data.debtId,
        nextYear,
        nextMonthNum,
      );
    } catch (error) {
      console.error(
        "Failed to create monthly planning for debt payment:",
        error,
      );
    }

    // Update the debt with payment information but NOT the due date
    await db
      .update(debts)
      .set({
        lastPaymentMonth: paymentMonth,
        paymentAmount: newPaymentAmount.toString(),
        updatedAt: new Date(),
      })
      .where(eq(debts.id, data.debtId));
  } else {
    // Just update payment amount
    await db
      .update(debts)
      .set({
        paymentAmount: newPaymentAmount.toString(),
        updatedAt: new Date(),
      })
      .where(eq(debts.id, data.debtId));
  }

  return { id: data.debtId };
}
