"use server";

import { and, eq, inArray } from "drizzle-orm";
import { budgetAccountMembers, incomeSources } from "@/db/schema";

import { auth } from "@/lib/auth";
import { db } from "@/db/config";
import { headers } from "next/headers";
import { randomUUID } from "crypto";

export type IncomeSource = {
  id: string;
  userId: string;
  name: string;
  amount: number;
  frequency: "weekly" | "bi-weekly" | "monthly";
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  notes?: string;
};

type DbIncomeSource = {
  id: string;
  userId: string;
  name: string;
  amount: string;
  frequency: "weekly" | "bi-weekly" | "monthly";
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

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

  const id = randomUUID();
  await db.insert(incomeSources).values({
    id,
    userId: sessionResult.user.id,
    name,
    amount: amount.toString(),
    frequency,
    startDate,
    endDate: endDate || null,
    notes,
    isActive: true,
  });

  return {
    id,
    userId: sessionResult.user.id,
    name,
    amount,
    frequency,
    startDate: (() => {
      // Parse date string as local date to avoid timezone conversion issues
      const [year, month, day] = startDate.split("-").map(Number);
      return new Date(year, month - 1, day); // month is 0-indexed
    })(),
    endDate: endDate
      ? (() => {
          // Parse date string as local date to avoid timezone conversion issues
          const [year, month, day] = endDate.split("-").map(Number);
          return new Date(year, month - 1, day); // month is 0-indexed
        })()
      : undefined,
    isActive: true,
    notes,
  };
}

/**
 * Updates an existing income source
 */
export async function updateIncomeSource(
  id: string,
  data: Partial<Omit<IncomeSource, "id" | "userId">>,
) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult || "error" in sessionResult || !sessionResult.user?.id) {
    throw new Error("Not authenticated");
  }

  // Verify ownership
  const incomeSource = await db.query.incomeSources.findFirst({
    where: and(
      eq(incomeSources.id, id),
      eq(incomeSources.userId, sessionResult.user.id),
    ),
  });

  if (!incomeSource) {
    throw new Error("Income source not found or not authorized");
  }

  // Convert dates to proper format if they exist
  const updateData: Partial<{
    name: string;
    amount: string;
    frequency: "weekly" | "bi-weekly" | "monthly";
    startDate: string;
    endDate: string | null;
    notes: string | null;
    isActive: boolean;
    updatedAt: Date;
  }> = {
    updatedAt: new Date(),
  };

  // Handle amount conversion
  if (data.amount !== undefined) {
    updateData.amount = data.amount.toString();
  }

  // Handle date conversions
  if (data.startDate !== undefined) {
    updateData.startDate = data.startDate.toISOString().slice(0, 10);
  }

  if (data.endDate !== undefined) {
    updateData.endDate = data.endDate
      ? data.endDate.toISOString().slice(0, 10)
      : null;
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

  await db
    .update(incomeSources)
    .set(updateData)
    .where(eq(incomeSources.id, id));

  return {
    ...incomeSource,
    ...data,
    amount: data.amount || Number(incomeSource.amount),
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
  const incomeSource = await db.query.incomeSources.findFirst({
    where: and(
      eq(incomeSources.id, id),
      eq(incomeSources.userId, sessionResult.user.id),
    ),
  });

  if (!incomeSource) {
    throw new Error("Income source not found or not authorized");
  }

  await db.delete(incomeSources).where(eq(incomeSources.id, id));
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

  const sources = await db.query.incomeSources.findMany({
    where: eq(incomeSources.userId, sessionResult.user.id),
    orderBy: (incomeSources, { desc }) => [desc(incomeSources.createdAt)],
  });

  return sources.map((source) => ({
    ...source,
    amount: Number(source.amount),
    startDate: (() => {
      // Parse date string as local date to avoid timezone conversion issues
      const [year, month, day] = source.startDate.split("-").map(Number);
      return new Date(year, month - 1, day); // month is 0-indexed
    })(),
    endDate: source.endDate
      ? (() => {
          // Parse date string as local date to avoid timezone conversion issues
          const [year, month, day] = source.endDate.split("-").map(Number);
          return new Date(year, month - 1, day); // month is 0-indexed
        })()
      : undefined,
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
  const members = await db.query.budgetAccountMembers.findMany({
    where: eq(budgetAccountMembers.budgetAccountId, budgetAccountId),
  });

  // Get all active income sources for these members
  const memberIncomeSources = await db.query.incomeSources.findMany({
    where: and(
      eq(incomeSources.isActive, true),
      inArray(
        incomeSources.userId,
        members.map((m) => m.userId),
      ),
    ),
  });

  // Use provided year/month or default to current
  const now = new Date();
  const calcYear = year ?? now.getFullYear();
  const calcMonth = month ?? now.getMonth() + 1; // month is 1-based
  const startOfMonth = new Date(calcYear, calcMonth - 1, 1);
  const endOfMonth = new Date(calcYear, calcMonth, 0);

  // Calculate monthly equivalent for each income source
  const monthlyIncome = memberIncomeSources.reduce(
    (total: number, source: DbIncomeSource) => {
      const amount = Number(source.amount);
      let monthlyAmount = amount;

      switch (source.frequency) {
        case "weekly":
          monthlyAmount = (amount * 52) / 12;
          break;
        case "bi-weekly": {
          // Get the start date of the income source - parse as local date to avoid timezone issues
          const [startYear, startMonth, startDay] = source.startDate
            .split("-")
            .map(Number);
          const incomeStartDate = new Date(startYear, startMonth - 1, startDay);
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
                  // Parse end date as local date to avoid timezone issues
                  const [endYear, endMonth, endDay] = source.endDate
                    .split("-")
                    .map(Number);
                  return (
                    currentPayDate <= new Date(endYear, endMonth - 1, endDay)
                  );
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
    },
    0,
  );

  return monthlyIncome;
}
