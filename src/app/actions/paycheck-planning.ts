"use server";

import { and, eq, gte, lte, or, gt, lt } from "drizzle-orm";
import {
  budgetAccountMembers,
  incomeSources,
  debts,
  debtAllocations,
  monthlyDebtPlanning,
  dismissedWarnings,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/db/config";
import { headers } from "next/headers";

export interface PaycheckInfo {
  id: string;
  name: string;
  amount: number;
  date: Date;
  frequency: "weekly" | "bi-weekly" | "monthly";
  userId: string;
}

export interface DebtInfo {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  frequency: string;
  description?: string;
  isRecurring: boolean;
  categoryId?: string;
}

export interface PaycheckPlanningData {
  paychecks: PaycheckInfo[];
  debts: DebtInfo[];
  warnings: PaycheckWarning[];
}

export interface PaycheckWarning {
  type: "debt_unpaid" | "insufficient_funds" | "late_payment";
  message: string;
  debtId?: string;
  paycheckId?: string;
  severity: "low" | "medium" | "high";
}

export interface PaycheckAllocation {
  paycheckId: string;
  paycheckDate: Date;
  paycheckAmount: number;
  allocatedDebts: {
    debtId: string;
    debtName: string;
    amount: number;
    dueDate: string;
    originalDueDate: string; // The original due date of the debt (used for month indicator)
    paymentDate?: string;
    paymentId?: string;
    isPaid: boolean;
  }[];
  remainingAmount: number;
}

/**
 * Get paycheck planning data for a specific month with planning window
 * SIMPLE APPROACH: For each debt, create entries for current month + planning window months
 * Only include months that are after or equal to the debt's startDate
 */
export async function getPaycheckPlanningData(
  budgetAccountId: string,
  year: number,
  month: number,
  planningWindowMonths: number = 0,
): Promise<PaycheckPlanningData> {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult?.user) {
    throw new Error("User not authenticated");
  }

  // Check if user has access to this budget account
  const member = await db.query.budgetAccountMembers.findFirst({
    where: and(
      eq(budgetAccountMembers.budgetAccountId, budgetAccountId),
      eq(budgetAccountMembers.userId, sessionResult.user.id),
    ),
  });

  if (!member) {
    throw new Error("Access denied to budget account");
  }

  // Get all income sources for the budget account
  const incomeSourcesList = await db.query.incomeSources.findMany({
    where: eq(incomeSources.userId, sessionResult.user.id),
  });

  // Calculate paycheck dates for the current month
  const paychecks: PaycheckInfo[] = [];

  for (const incomeSource of incomeSourcesList) {
    const [startYear, startMonth, startDay] = incomeSource.startDate
      .split("-")
      .map(Number);
    const startDate = new Date(startYear, startMonth - 1, startDay);

    // Calculate paychecks for this month based on frequency
    let paycheckDate = new Date(startDate);

    // Find the first paycheck date in or after the month
    while (
      paycheckDate.getFullYear() < year ||
      (paycheckDate.getFullYear() === year &&
        paycheckDate.getMonth() < month - 1)
    ) {
      if (incomeSource.frequency === "weekly") {
        paycheckDate = new Date(
          paycheckDate.getTime() + 7 * 24 * 60 * 60 * 1000,
        );
      } else if (incomeSource.frequency === "bi-weekly") {
        paycheckDate = new Date(
          paycheckDate.getTime() + 14 * 24 * 60 * 60 * 1000,
        );
      } else if (incomeSource.frequency === "monthly") {
        paycheckDate = new Date(
          paycheckDate.getFullYear(),
          paycheckDate.getMonth() + 1,
          paycheckDate.getDate(),
        );
      }
    }

    // Add paychecks for this month
    while (
      paycheckDate.getFullYear() === year &&
      paycheckDate.getMonth() === month - 1
    ) {
      paychecks.push({
        id: `${incomeSource.id}-${paycheckDate.getTime()}`,
        name: incomeSource.name,
        amount: Number(incomeSource.amount),
        date: new Date(paycheckDate),
        frequency: incomeSource.frequency,
        userId: sessionResult.user.id,
      });

      // Move to next paycheck
      if (incomeSource.frequency === "weekly") {
        paycheckDate = new Date(
          paycheckDate.getTime() + 7 * 24 * 60 * 60 * 1000,
        );
      } else if (incomeSource.frequency === "bi-weekly") {
        paycheckDate = new Date(
          paycheckDate.getTime() + 14 * 24 * 60 * 60 * 1000,
        );
      } else if (incomeSource.frequency === "monthly") {
        paycheckDate = new Date(
          paycheckDate.getFullYear(),
          paycheckDate.getMonth() + 1,
          paycheckDate.getDate(),
        );
      }
    }
  }

  // Sort paychecks by date
  paychecks.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Get all debts for the budget account
  const allDebts = await db.query.debts.findMany({
    where: eq(debts.budgetAccountId, budgetAccountId),
  });

  // Get monthly debt planning records for the current planning window.
  // Simpler and less error-prone: filter by dueDate between start and end.
  const startDate = new Date(year, month - 1, 1);
  const endYear = year + Math.floor((month + planningWindowMonths - 1) / 12);
  const endMonth = ((month + planningWindowMonths - 1) % 12) + 1; // 1-12
  const endDate = new Date(endYear, endMonth, 0); // last day of end month

  const toYmd = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;

  const monthlyPlanningRecords = await db.query.monthlyDebtPlanning.findMany({
    where: and(
      eq(monthlyDebtPlanning.budgetAccountId, budgetAccountId),
      eq(monthlyDebtPlanning.isActive, true),
      gte(monthlyDebtPlanning.dueDate, toYmd(startDate)),
      lte(monthlyDebtPlanning.dueDate, toYmd(endDate)),
    ),
  });

  // Convert monthly planning records to DebtInfo format
  const allDebtEntries: DebtInfo[] = [];

  for (const monthlyRecord of monthlyPlanningRecords) {
    // Find the corresponding debt
    const debt = allDebts.find((d) => d.id === monthlyRecord.debtId);
    if (!debt) continue;

    allDebtEntries.push({
      id: monthlyRecord.id, // Use the monthly planning ID
      name: debt.name,
      amount: Number(debt.paymentAmount),
      dueDate: monthlyRecord.dueDate, // dueDate is already a string
      frequency: "monthly", // Default to monthly for monthly planning records
      description: debt.name, // Use debt name as description
      isRecurring: true, // Monthly planning records are recurring
      categoryId: debt.categoryId || undefined,
    });

    console.log(
      `Found monthly debt: ${debt.name} for ${monthlyRecord.year}-${monthlyRecord.month} (due: ${monthlyRecord.dueDate})`,
    );
  }

  // Note: We intentionally removed the synthetic fallback to ensure
  // all debts shown come from monthly_debt_planning records only.

  // Use the debt entries we found/created
  const processedDebts = allDebtEntries;

  console.log(`=== SIMPLE APPROACH ===`);
  console.log(`Total debts created: ${processedDebts.length}`);
  processedDebts.forEach((debt) => {
    console.log(`  - ${debt.name} (${debt.id}) - due: ${debt.dueDate}`);
  });
  console.log(`=== END SIMPLE APPROACH ===`);

  // Generate simple warnings
  const warnings: PaycheckWarning[] = [];

  // Check for insufficient funds
  const totalIncome = paychecks.reduce(
    (sum, paycheck) => sum + paycheck.amount,
    0,
  );
  const totalDebts = processedDebts.reduce((sum, debt) => sum + debt.amount, 0);

  if (totalDebts > totalIncome) {
    warnings.push({
      type: "insufficient_funds",
      message: `Total debts ($${totalDebts.toFixed(2)}) exceed total income ($${totalIncome.toFixed(2)})`,
      severity: "high",
    });
  }

  return {
    paychecks,
    debts: processedDebts,
    warnings,
  };
}

/**
 * Dismiss a warning for a user
 */
export async function dismissWarning(
  budgetAccountId: string,
  warningType: string,
  warningKey: string,
) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult?.user) {
    throw new Error("User not authenticated");
  }

  // Verify user has access to the budget account
  const member = await db.query.budgetAccountMembers.findFirst({
    where: and(
      eq(budgetAccountMembers.budgetAccountId, budgetAccountId),
      eq(budgetAccountMembers.userId, sessionResult.user.id),
    ),
  });

  if (!member) {
    throw new Error("Access denied to budget account");
  }

  // Check if warning is already dismissed
  const existingDismissal = await db.query.dismissedWarnings.findFirst({
    where: and(
      eq(dismissedWarnings.budgetAccountId, budgetAccountId),
      eq(dismissedWarnings.userId, sessionResult.user.id),
      eq(dismissedWarnings.warningType, warningType),
      eq(dismissedWarnings.warningKey, warningKey),
    ),
  });

  if (!existingDismissal) {
    // Create dismissal record
    await db.insert(dismissedWarnings).values({
      budgetAccountId,
      userId: sessionResult.user.id,
      warningType,
      warningKey,
    });
  }

  return { success: true };
}

/**
 * Get paycheck allocations for a specific month
 */
export async function getPaycheckAllocations(
  budgetAccountId: string,
  year: number,
  month: number,
) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult?.user) {
    throw new Error("User not authenticated");
  }

  const data = await getPaycheckPlanningData(budgetAccountId, year, month);
  const storedAllocations = await getDebtAllocations(budgetAccountId);

  // Get all original debts for the budget account to find original due dates
  const allDebts = await db.query.debts.findMany({
    where: eq(debts.budgetAccountId, budgetAccountId),
  });

  // Get monthly debt planning records to link allocations to debts
  const monthlyPlanningRecords = await db.query.monthlyDebtPlanning.findMany({
    where: eq(monthlyDebtPlanning.budgetAccountId, budgetAccountId),
  });

  // Create allocations based on stored data
  const allocations = data.paychecks.map((paycheck) => {
    const paycheckAllocations = storedAllocations.filter(
      (allocation) => allocation.paycheckId === paycheck.id,
    );

    const allocatedDebts = paycheckAllocations
      .map((allocation) => {
        // Find the monthly planning record for this allocation
        const monthlyPlanning = monthlyPlanningRecords.find(
          (mp) => mp.id === allocation.monthlyDebtPlanningId,
        );
        if (!monthlyPlanning) return null;

        // Get the base debt information using the real debt id
        const baseDebt = allDebts.find((d) => d.id === monthlyPlanning.debtId);
        if (!baseDebt) return null;

        // The original due date comes from the base debt definition
        const originalDueDate = baseDebt.dueDate;

        return {
          // Use the monthly planning id as the debt identifier throughout the UI
          debtId: monthlyPlanning.id,
          debtName: baseDebt.name,
          amount: Number(baseDebt.paymentAmount),
          // Use the specific instance due date for the month
          dueDate: monthlyPlanning.dueDate,
          // Include the original template due date for month indicator
          originalDueDate: originalDueDate,
          paymentDate: allocation.paymentDate || undefined,
          paymentId: allocation.id,
          isPaid: allocation.isPaid || false,
        };
      })
      .filter((debt) => debt !== null);

    const totalAllocated = allocatedDebts.reduce(
      (sum, debt) => sum + debt.amount,
      0,
    );

    return {
      paycheckId: paycheck.id,
      paycheckDate: paycheck.date,
      paycheckAmount: paycheck.amount,
      allocatedDebts,
      remainingAmount: paycheck.amount - totalAllocated,
    };
  });

  return allocations;
}

/**
 * Get debt allocations for a specific month
 */
export async function getDebtAllocations(budgetAccountId: string) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult?.user) {
    throw new Error("User not authenticated");
  }

  // Verify user has access to the budget account
  const member = await db.query.budgetAccountMembers.findFirst({
    where: and(
      eq(budgetAccountMembers.budgetAccountId, budgetAccountId),
      eq(budgetAccountMembers.userId, sessionResult.user.id),
    ),
  });

  if (!member) {
    throw new Error("Access denied to budget account");
  }

  const allocations = await db.query.debtAllocations.findMany({
    where: eq(debtAllocations.budgetAccountId, budgetAccountId),
  });

  return allocations;
}

/**
 * Update debt allocation for a specific paycheck
 */
export async function updateDebtAllocation(
  budgetAccountId: string,
  monthlyDebtPlanningId: string, // Changed from debtId to monthlyDebtPlanningId
  paycheckId: string,
  action: "allocate" | "unallocate" | "update",
  paymentAmount?: number,
  paymentDate?: string,
) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult?.user) {
    throw new Error("User not authenticated");
  }

  // Verify user has access to the budget account
  const member = await db.query.budgetAccountMembers.findFirst({
    where: and(
      eq(budgetAccountMembers.budgetAccountId, budgetAccountId),
      eq(budgetAccountMembers.userId, sessionResult.user.id),
    ),
  });

  if (!member) {
    throw new Error("Access denied to budget account");
  }

  if (action === "allocate") {
    // Check if allocation already exists
    const existingAllocation = await db.query.debtAllocations.findFirst({
      where: and(
        eq(debtAllocations.monthlyDebtPlanningId, monthlyDebtPlanningId),
        eq(debtAllocations.paycheckId, paycheckId),
        eq(debtAllocations.budgetAccountId, budgetAccountId),
      ),
    });

    if (!existingAllocation) {
      // Create new allocation
      await db.insert(debtAllocations).values({
        budgetAccountId,
        monthlyDebtPlanningId,
        paycheckId,
        userId: sessionResult.user.id,
        paymentAmount: paymentAmount ? paymentAmount.toString() : null,
        paymentDate: paymentDate || null,
        note: paymentDate
          ? `Scheduled payment from paycheck allocation on ${paymentDate}`
          : null,
        isPaid: false,
      });
    }
  } else if (action === "unallocate") {
    // Remove the allocation
    await db
      .delete(debtAllocations)
      .where(
        and(
          eq(debtAllocations.monthlyDebtPlanningId, monthlyDebtPlanningId),
          eq(debtAllocations.paycheckId, paycheckId),
          eq(debtAllocations.budgetAccountId, budgetAccountId),
        ),
      );
  }

  return { success: true };
}

/**
 * Get current month paycheck planning data
 */
export async function getCurrentMonthPaycheckPlanning(budgetAccountId: string) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return getPaycheckPlanningData(budgetAccountId, year, month);
}

/**
 * Mark a payment as paid for a specific debt allocation
 */
export async function markPaymentAsPaid(
  budgetAccountId: string,
  monthlyDebtPlanningId: string, // Changed from debtId to monthlyDebtPlanningId
  paymentId: string,
  paymentAmount?: number,
  paymentDate?: string,
) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult?.user) {
    throw new Error("User not authenticated");
  }

  // Verify user has access to the budget account
  const member = await db.query.budgetAccountMembers.findFirst({
    where: and(
      eq(budgetAccountMembers.budgetAccountId, budgetAccountId),
      eq(budgetAccountMembers.userId, sessionResult.user.id),
    ),
  });

  if (!member) {
    throw new Error("Access denied to budget account");
  }

  // Update the debt allocation to mark it as paid
  await db
    .update(debtAllocations)
    .set({
      isPaid: true,
      paymentAmount: paymentAmount ? paymentAmount.toString() : null,
      paymentDate: paymentDate || new Date().toISOString().split("T")[0],
      note: `Payment marked as paid on ${paymentDate || new Date().toISOString().split("T")[0]}`,
    })
    .where(
      and(
        eq(debtAllocations.id, paymentId),
        eq(debtAllocations.budgetAccountId, budgetAccountId),
        eq(debtAllocations.monthlyDebtPlanningId, monthlyDebtPlanningId),
      ),
    );

  return { success: true };
}

/**
 * Get current month paycheck allocations
 */
export async function getCurrentMonthPaycheckAllocations(
  budgetAccountId: string,
) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return getPaycheckAllocations(budgetAccountId, year, month);
}

/**
 * Populate monthly debt planning table with current debts
 * This function creates monthly planning records for existing debts
 */
export async function populateMonthlyDebtPlanning(
  budgetAccountId: string,
  year: number,
  month: number,
  planningWindowMonths: number = 0,
) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult?.user) {
    throw new Error("User not authenticated");
  }

  // Check if user has access to this budget account
  const member = await db.query.budgetAccountMembers.findFirst({
    where: and(
      eq(budgetAccountMembers.budgetAccountId, budgetAccountId),
      eq(budgetAccountMembers.userId, sessionResult.user.id),
    ),
  });

  if (!member) {
    throw new Error("Access denied to budget account");
  }

  // Get all debts for the budget account
  const allDebts = await db.query.debts.findMany({
    where: eq(debts.budgetAccountId, budgetAccountId),
  });

  console.log(
    "Ensuring monthly debt planning rows exist for selected window...",
  );

  // Preload existing records for the account in the window to avoid per-row queries
  const windowStartYear = year;
  const windowStartMonth = month;
  const windowEndYear =
    year + Math.floor((month + planningWindowMonths - 1) / 12);
  const windowEndMonth = ((month + planningWindowMonths - 1) % 12) + 1;

  const existingInWindow = await db.query.monthlyDebtPlanning.findMany({
    where: and(
      eq(monthlyDebtPlanning.budgetAccountId, budgetAccountId),
      // start boundary (>= start year and month)
      or(
        gt(monthlyDebtPlanning.year, windowStartYear),
        and(
          eq(monthlyDebtPlanning.year, windowStartYear),
          gte(monthlyDebtPlanning.month, windowStartMonth),
        ),
      ),
      // end boundary (<= end year and month)
      or(
        lt(monthlyDebtPlanning.year, windowEndYear),
        and(
          eq(monthlyDebtPlanning.year, windowEndYear),
          lte(monthlyDebtPlanning.month, windowEndMonth),
        ),
      ),
    ),
  });

  // Index existing by debtId-year-month
  const existingKey = new Set(
    existingInWindow.map((r) => `${r.debtId}:${r.year}:${r.month}`),
  );

  // Create monthly planning records for each debt within the window if missing
  for (const debt of allDebts) {
    const [debtStartYear, debtStartMonth] = debt.dueDate.split("-").map(Number);

    for (
      let monthOffset = 0;
      monthOffset <= planningWindowMonths;
      monthOffset++
    ) {
      const targetYear = year + Math.floor((month + monthOffset - 1) / 12);
      const targetMonth = ((month + monthOffset - 1) % 12) + 1;

      // Only include this month if it's after or equal to the debt's start date
      if (
        targetYear > debtStartYear ||
        (targetYear === debtStartYear && targetMonth >= debtStartMonth)
      ) {
        const key = `${debt.id}:${targetYear}:${targetMonth}`;
        if (existingKey.has(key)) {
          continue; // already present in this window
        }

        // Calculate the due date for this month (keep the same day of month)
        const [, , debtDay] = debt.dueDate.split("-").map(Number);
        const dueDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(debtDay).padStart(2, "0")}`;

        try {
          await db.insert(monthlyDebtPlanning).values({
            budgetAccountId,
            debtId: debt.id,
            year: targetYear,
            month: targetMonth,
            dueDate: dueDate,
            isActive: true,
          });
          existingKey.add(key);
          console.log(
            `Created monthly planning record: ${debt.name} for ${targetYear}-${targetMonth} (due: ${dueDate})`,
          );
        } catch (error) {
          console.error(
            `Failed to create monthly planning record for ${debt.name} ${targetYear}-${targetMonth}:`,
            error,
          );
        }
      }
    }
  }

  console.log("Monthly debt planning window upsert complete");
}
