"use server";

import { db } from "@/db/schema";

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
export type DebtWithPayments = {
  id: string;
  budgetAccountId: string;
  createdByUserId: string;
  categoryId?: string;
  name: string;
  paymentAmount: number;
  interestRate: number;
  dueDate: string; // Now a string from the database (date() field)
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
  date: string; // Now a string from the database (date() field)
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

  const userData = await db.user.findFirst({
    where: { id: sessionResult.user.id },
    select: {
      defaultBudgetAccountId: true,
    },
  });

  if (!userData?.defaultBudgetAccountId) {
    throw new Error("No default budget account found");
  }

  return userData.defaultBudgetAccountId;
}

/**
 * Gets all debts for the specified budget account (or default if not provided)
 */
export async function getDebts(budgetAccountId?: string) {
  const accountId = budgetAccountId || (await getDefaultBudgetAccountId());

  const debts = await db.debt.findMany({
    where: {
      budgetAccountId: accountId,
    },
    include: {
      category: true,
      monthlyPlanning: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get payments for each debt
  const debtsWithPayments = await Promise.all(
    debts.map(async (debt) => {
      const payments = await db.debtAllocation.findMany({
        where: {
          monthlyDebtPlanning: {
            debtId: debt.id,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        id: debt.id,
        budgetAccountId: debt.budgetAccountId,
        createdByUserId: debt.createdByUserId,
        categoryId: debt.categoryId,
        name: debt.name,
        paymentAmount: Number(debt.paymentAmount),
        interestRate: Number(debt.interestRate),
        dueDate: debt.dueDate.toISOString().split("T")[0],
        hasBalance: debt.hasBalance,
        createdAt: debt.createdAt,
        updatedAt: debt.updatedAt,
        category: debt.category,
        payments: payments.map((payment) => ({
          id: payment.id,
          debtId: payment.monthlyDebtPlanningId, // This maps to the debt through monthly planning
          amount: Number(payment.paymentAmount || 0),
          date: payment.paymentDate?.toISOString().split("T")[0] || "",
          note: payment.note,
          isPaid: payment.isPaid,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
        })),
      };
    }),
  );

  return debtsWithPayments;
}

/**
 * Creates a new debt
 */
export async function createDebt(
  data: CreateDebtInput,
  budgetAccountId?: string,
) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  const accountId = budgetAccountId || (await getDefaultBudgetAccountId());

  // Verify the budget account exists
  const budgetAccount = await db.budgetAccount.findFirst({
    where: { id: accountId },
  });

  if (!budgetAccount) {
    throw new Error("Budget account not found");
  }

  // Verify category exists if provided
  if (data.categoryId) {
    const category = await db.category.findFirst({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new Error("Category not found");
    }
  }

  const debtId = randomUUID();

  const debt = await db.debt.create({
    data: {
      id: debtId,
      budgetAccountId: accountId,
      createdByUserId: sessionResult.user.id,
      categoryId: data.categoryId || null,
      name: data.name,
      paymentAmount: data.paymentAmount,
      interestRate: data.interestRate,
      dueDate: new Date(data.dueDate),
      hasBalance: data.hasBalance || false,
    },
  });

  return { id: debt.id };
}

/**
 * Updates an existing debt
 */
export async function updateDebt(
  data: UpdateDebtInput,
  budgetAccountId?: string,
) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  const accountId = budgetAccountId || (await getDefaultBudgetAccountId());

  // Verify the debt exists and belongs to the user's budget account
  const existingDebt = await db.debt.findFirst({
    where: {
      id: data.id,
      budgetAccountId: accountId,
    },
  });

  if (!existingDebt) {
    throw new Error("Debt not found");
  }

  // Verify category exists if provided
  if (data.categoryId) {
    const category = await db.category.findFirst({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new Error("Category not found");
    }
  }

  await db.debt.update({
    where: { id: data.id },
    data: {
      name: data.name,
      paymentAmount: data.paymentAmount,
      interestRate: data.interestRate,
      dueDate: new Date(data.dueDate),
      categoryId: data.categoryId || null,
    },
  });

  return { id: data.id };
}

/**
 * Deletes a debt
 */
export async function deleteDebt(id: string, budgetAccountId?: string) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  const accountId = budgetAccountId || (await getDefaultBudgetAccountId());

  // Verify the debt exists and belongs to the user's budget account
  const existingDebt = await db.debt.findFirst({
    where: {
      id: id,
      budgetAccountId: accountId,
    },
  });

  if (!existingDebt) {
    throw new Error("Debt not found");
  }

  await db.debt.delete({
    where: { id },
  });

  return { id };
}

/**
 * Creates a debt payment
 */
export async function createDebtPayment(
  data: CreateDebtPaymentInput,
  budgetAccountId?: string,
) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  const accountId = budgetAccountId || (await getDefaultBudgetAccountId());

  // Get the debt
  const debt = await db.debt.findFirst({
    where: {
      id: data.debtId,
      budgetAccountId: accountId,
    },
  });

  if (!debt) {
    throw new Error("Debt not found");
  }

  // Check if payment amount exceeds balance (for debts with balance)
  if (debt.hasBalance) {
    // This is a simplified check - in a real app you'd calculate the actual balance
    if (data.amount > Number(debt.paymentAmount)) {
      throw new Error("Payment amount cannot exceed current balance");
    }
  }

  // Find or create the "Debts" category
  let debtsCategory = await db.category.findFirst({
    where: {
      budgetAccountId: accountId,
      name: "Debts",
    },
  });

  if (!debtsCategory) {
    debtsCategory = await db.category.create({
      data: {
        id: randomUUID(),
        budgetAccountId: accountId,
        name: "Debts",
        description: "Debt payments and related expenses",
        color: "#ef4444", // Red color for debts
      },
    });
  }

  // Create the transaction
  const transactionId = randomUUID();
  await db.transaction.create({
    data: {
      id: transactionId,
      budgetAccountId: accountId,
      categoryId: debtsCategory.id,
      createdByUserId: sessionResult.user.id,
      amount: data.amount,
      description: `Payment for ${debt.name}`,
      date: new Date(data.date),
      type: "expense",
      status: "completed",
      debtId: debt.id,
    },
  });

  // Create monthly debt planning entry if it doesn't exist
  const currentDate = new Date(data.date);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  let monthlyPlanning = await db.monthlyDebtPlanning.findFirst({
    where: {
      budgetAccountId: accountId,
      debtId: debt.id,
      year: year,
      month: month,
    },
  });

  if (!monthlyPlanning) {
    monthlyPlanning = await db.monthlyDebtPlanning.create({
      data: {
        id: randomUUID(),
        budgetAccountId: accountId,
        debtId: debt.id,
        year: year,
        month: month,
        dueDate: new Date(data.date),
      },
    });
  }

  // Create debt allocation
  const allocationId = randomUUID();
  await db.debtAllocation.create({
    data: {
      id: allocationId,
      budgetAccountId: accountId,
      monthlyDebtPlanningId: monthlyPlanning.id,
      paycheckId: randomUUID(), // This would come from paycheck planning in a real app
      paymentAmount: data.amount,
      paymentDate: new Date(data.date),
      isPaid: true,
      paidAt: new Date(),
      note: data.note || null,
      userId: sessionResult.user.id,
    },
  });

  // Advance due date if payment is made before due date
  const paymentDate = new Date(data.date);
  const dueDate = new Date(debt.dueDate);

  if (paymentDate < dueDate) {
    // Advance due date by one month
    const newDueDate = new Date(dueDate);
    newDueDate.setMonth(newDueDate.getMonth() + 1);

    await db.debt.update({
      where: { id: debt.id },
      data: {
        dueDate: newDueDate,
        lastPaymentMonth: new Date(year, month - 1, 1),
      },
    });
  }

  return { id: allocationId };
}
