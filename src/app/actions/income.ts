"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db/config";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
// Removed unused type import

export type IncomeSource = {
  id: string;
  userId: string;
  name: string;
  amount: number;
  frequency: "weekly" | "bi-weekly" | "monthly";
  startDate: string; // Date-only string to prevent timezone shifts (YYYY-MM-DD)
  endDate?: string; // Date-only string to prevent timezone shifts (YYYY-MM-DD)
  isActive: boolean;
  notes?: string;
};

// Removed unused type definition

/**
 * Creates a new income source for the authenticated user
 */
export async function createIncomeSource(
  name: string,
  amount: number,
  frequency: "weekly" | "bi-weekly" | "monthly",
  startDate: string,
  endDate?: string,
  notes?: string,
) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  const incomeSource = await db.incomeSource.create({
    data: {
      id: randomUUID(),
      userId: sessionResult.user.id,
      name,
      amount: amount.toString(),
      frequency,
      startDate: startDate,
      endDate: endDate || null,
      notes,
      isActive: true,
    },
  });

  return {
    id: incomeSource.id,
    userId: incomeSource.userId,
    name: incomeSource.name,
    amount: Number(incomeSource.amount),
    frequency: incomeSource.frequency,
    startDate: incomeSource.startDate,
    endDate: incomeSource.endDate || undefined,
    isActive: incomeSource.isActive,
    notes: incomeSource.notes || undefined,
  };
}

/**
 * Updates an existing income source
 */
export async function updateIncomeSource(
  id: string,
  data: Partial<{
    name: string;
    amount: number;
    frequency: "weekly" | "bi-weekly" | "monthly";
    startDate: string;
    endDate?: string;
    notes?: string;
    isActive?: boolean;
  }>,
) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Verify ownership
  const incomeSource = await db.incomeSource.findFirst({
    where: {
      id: id,
      userId: sessionResult.user.id,
    },
  });

  if (!incomeSource) {
    throw new Error("Income source not found or not authorized");
  }

  // Convert dates to proper format if they exist
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  // Handle amount conversion
  if (data.amount !== undefined) {
    updateData.amount = data.amount.toString();
  }

  // Handle date conversions - store strings directly
  if (data.startDate !== undefined) {
    updateData.startDate = data.startDate;
  }

  if (data.endDate !== undefined) {
    updateData.endDate = data.endDate || null;
  }

  // Handle other fields
  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.frequency !== undefined) {
    updateData.frequency = data.frequency;
  }

  if (data.notes !== undefined) {
    updateData.notes = data.notes;
  }

  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive;
  }

  const updatedIncomeSource = await db.incomeSource.update({
    where: {
      id: id,
    },
    data: updateData,
  });

  return {
    id: updatedIncomeSource.id,
    userId: updatedIncomeSource.userId,
    name: updatedIncomeSource.name,
    amount: Number(updatedIncomeSource.amount),
    frequency: updatedIncomeSource.frequency,
    startDate: updatedIncomeSource.startDate,
    endDate: updatedIncomeSource.endDate || undefined,
    isActive: updatedIncomeSource.isActive,
    notes: updatedIncomeSource.notes || undefined,
  };
}

/**
 * Deletes an income source
 */
export async function deleteIncomeSource(id: string) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Verify ownership
  const incomeSource = await db.incomeSource.findFirst({
    where: {
      id: id,
      userId: sessionResult.user.id,
    },
  });

  if (!incomeSource) {
    throw new Error("Income source not found or not authorized");
  }

  await db.incomeSource.delete({
    where: {
      id: id,
    },
  });
}

/**
 * Gets all income sources for the authenticated user
 */
export async function getIncomeSources() {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  const sources = await db.incomeSource.findMany({
    where: {
      userId: sessionResult.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return sources.map((source) => ({
    ...source,
    amount: Number(source.amount),
    startDate: source.startDate, // Return the date string directly
    endDate: source.endDate || undefined, // Return the date string directly
  }));
}

/**
 * Calculates the total monthly income for a budget account
 */
export async function calculateMonthlyIncome(
  budgetAccountId: string,
  year?: number,
  month?: number,
) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Get all members of the budget account
  const members = await db.budgetAccountMember.findMany({
    where: {
      budgetAccountId: budgetAccountId,
    },
  });

  // Get all active income sources for these members
  const memberIncomeSources = await db.incomeSource.findMany({
    where: {
      isActive: true,
      userId: {
        in: members.map((m) => m.userId),
      },
    },
  });

  // Use provided year/month or default to current
  const now = new Date();
  const calcYear = year ?? now.getFullYear();
  const calcMonth = month ?? now.getMonth() + 1; // month is 1-based
  const startOfMonth = new Date(calcYear, calcMonth - 1, 1);
  const endOfMonth = new Date(calcYear, calcMonth, 0);

  // Calculate monthly equivalent for each income source
  const monthlyIncome = memberIncomeSources.reduce((total: number, source) => {
    const amount = Number(source.amount);
    let monthlyAmount = amount;

    switch (source.frequency) {
      case "weekly":
        monthlyAmount = (amount * 52) / 12;
        break;
      case "bi-weekly": {
        // Get the start date of the income source - use Date object directly
        const incomeStartDate = source.startDate;
        // Find the first pay date on or after the income start date
        const firstPayDate = new Date(incomeStartDate);
        while (firstPayDate < startOfMonth) {
          firstPayDate.setDate(firstPayDate.getDate() + 14);
        }
        // Count pay periods in the selected month
        let payPeriods = 0;
        const currentPayDate = new Date(firstPayDate);
        while (currentPayDate <= endOfMonth) {
          if (
            currentPayDate >= startOfMonth &&
            (!source.endDate ||
              (() => {
                // Convert string date to Date object for comparison
                return currentPayDate <= new Date(source.endDate);
              })())
          ) {
            payPeriods++;
          }
          currentPayDate.setDate(currentPayDate.getDate() + 14);
        }
        monthlyAmount = amount * payPeriods;
        break;
      }
      case "monthly":
        monthlyAmount = amount;
        break;
    }
    return total + monthlyAmount;
  }, 0);

  return monthlyIncome;
}
