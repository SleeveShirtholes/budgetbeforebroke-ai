"use server";

import { and, eq, gte, lte } from "drizzle-orm";
import { startOfDay, addWeeks, addMonths } from "date-fns";
import { toDateString } from "@/utils/date";
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
  // Date-only string to prevent timezone shifts (YYYY-MM-DD)
  date: string;
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
  futurePaychecks: PaycheckInfo[];
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
  // Date-only string (YYYY-MM-DD)
  paycheckDate: string;
  paycheckAmount: number;
  allocatedDebts: {
    debtId: string;
    debtName: string;
    amount: number;
    dueDate: string;
    originalDueDate: string; // The original due date of the debt (used for month indicator)
    paymentDate?: string;
    paymentAmount?: number; // The amount to be paid (may differ from debt amount)
    paymentId?: string;
    isPaid: boolean;
  }[];
  remainingAmount: number;
}

/**
 * Toggle the active state of a monthly debt planning record (soft delete / restore).
 * When inactive, the monthly debt instance is hidden from planning views but preserved in the database.
 */
export async function setMonthlyDebtPlanningActive(
  budgetAccountId: string,
  monthlyDebtPlanningId: string,
  isActive: boolean,
) {
  // Ensure the user is authenticated
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

  // Update the record to set the active state
  await db
    .update(monthlyDebtPlanning)
    .set({ isActive })
    .where(
      and(
        eq(monthlyDebtPlanning.id, monthlyDebtPlanningId),
        eq(monthlyDebtPlanning.budgetAccountId, budgetAccountId),
      ),
    );

  return { success: true };
}

/**
 * Get hidden (inactive) monthly debt planning records for a time window.
 * This mirrors the date filtering used for active debts but returns only isActive=false rows.
 */
export async function getHiddenMonthlyDebtPlanningData(
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

  // Access check
  const member = await db.query.budgetAccountMembers.findFirst({
    where: and(
      eq(budgetAccountMembers.budgetAccountId, budgetAccountId),
      eq(budgetAccountMembers.userId, sessionResult.user.id),
    ),
  });

  if (!member) {
    throw new Error("Access denied to budget account");
  }

  // Compute window
  const startDate = new Date(year, month - 1, 1);
  const endYear = year + Math.floor((month + planningWindowMonths - 1) / 12);
  const endMonth = ((month + planningWindowMonths - 1) % 12) + 1; // 1-12
  const endDate = new Date(endYear, endMonth, 0); // last day of end month

  const toYmd = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;

  // Fetch debts and inactive monthly planning records
  const allDebts = await db.query.debts.findMany({
    where: eq(debts.budgetAccountId, budgetAccountId),
  });

  const hiddenMonthlyRecords = await db.query.monthlyDebtPlanning.findMany({
    where: and(
      eq(monthlyDebtPlanning.budgetAccountId, budgetAccountId),
      eq(monthlyDebtPlanning.isActive, false),
      gte(monthlyDebtPlanning.dueDate, toYmd(startDate)),
      lte(monthlyDebtPlanning.dueDate, toYmd(endDate)),
    ),
  });

  // Map to DebtInfo shape, consistent with getPaycheckPlanningData
  const hiddenDebtEntries: DebtInfo[] = [];
  for (const monthlyRecord of hiddenMonthlyRecords) {
    const debt = allDebts.find((d) => d.id === monthlyRecord.debtId);
    if (!debt) {
      console.warn(
        `Monthly record with id '${monthlyRecord.id}' references non-existent debt id '${monthlyRecord.debtId}' in budgetAccountId '${budgetAccountId}'.`,
      );
      continue;
    }
    hiddenDebtEntries.push({
      id: monthlyRecord.id,
      name: debt.name,
      amount: Number(debt.paymentAmount),
      dueDate: monthlyRecord.dueDate as string,
      frequency: "monthly",
      description: debt.name,
      isRecurring: true,
      categoryId: debt.categoryId || undefined,
    });
  }

  return hiddenDebtEntries;
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
  const futurePaychecks: PaycheckInfo[] = [];

  for (const incomeSource of incomeSourcesList) {
    // startDate is now a string (YYYY-MM-DD), parse it safely
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
        paycheckDate = addWeeks(paycheckDate, 1);
      } else if (incomeSource.frequency === "bi-weekly") {
        paycheckDate = addWeeks(paycheckDate, 2);
      } else if (incomeSource.frequency === "monthly") {
        paycheckDate = addMonths(paycheckDate, 1);
      }
    }

    // Calculate all paychecks for the current month and future months in one loop
    // This ensures we don't miss any paychecks due to date boundary issues
    const endDate = addMonths(new Date(year, month - 1, 1), 4); // 4 months from start of current month

    while (paycheckDate < endDate) {
      const y = paycheckDate.getFullYear();
      const m = String(paycheckDate.getMonth() + 1).padStart(2, "0");
      const d = String(paycheckDate.getDate()).padStart(2, "0");
      const ymd = `${y}-${m}-${d}`;

      const paycheckInfo = {
        id: `${incomeSource.id}-${ymd}`,
        name: incomeSource.name,
        amount: Number(incomeSource.amount),
        date: ymd,
        frequency: incomeSource.frequency,
        userId: sessionResult.user.id,
      };

      // Add to current month paychecks if it's in the current month
      if (
        paycheckDate.getFullYear() === year &&
        paycheckDate.getMonth() === month - 1
      ) {
        paychecks.push(paycheckInfo);
      } else {
        // Add to future paychecks if it's in a future month
        futurePaychecks.push(paycheckInfo);
      }

      // Move to next paycheck
      if (incomeSource.frequency === "weekly") {
        paycheckDate = addWeeks(paycheckDate, 1);
      } else if (incomeSource.frequency === "bi-weekly") {
        paycheckDate = addWeeks(paycheckDate, 2);
      } else if (incomeSource.frequency === "monthly") {
        paycheckDate = addMonths(paycheckDate, 1);
      }
    }
  }

  // Sort paychecks by date string (YYYY-MM-DD)
  paychecks.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  futurePaychecks.sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
  );

  // Get all debts for the budget account
  const allDebts = await db.query.debts.findMany({
    where: eq(debts.budgetAccountId, budgetAccountId),
  });

  // Get monthly debt planning records for the current planning window.
  // Simpler and less error-prone: filter by dueDate between start and end.
  const startDate = startOfDay(new Date(year, month - 1, 1));
  const endYear = year + Math.floor((month + planningWindowMonths - 1) / 12);
  const endMonth = ((month + planningWindowMonths - 1) % 12) + 1; // 1-12
  const endDate = startOfDay(new Date(endYear, endMonth, 0)); // last day of end month

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
    if (!debt) {
      continue;
    }

    allDebtEntries.push({
      id: monthlyRecord.id, // Use the monthly planning ID
      name: debt.name,
      amount: Number(debt.paymentAmount),
      dueDate: monthlyRecord.dueDate as string, // dueDate is already a string
      frequency: "monthly", // Default to monthly for monthly planning records
      description: debt.name, // Use debt name as description
      isRecurring: true, // Monthly planning records are recurring
      categoryId: debt.categoryId || undefined,
    });
  }

  // Note: We intentionally removed the synthetic fallback to ensure
  // all debts shown come from monthly_debt_planning records only.

  // Use the debt entries we found/created
  const processedDebts = allDebtEntries;

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
    futurePaychecks,
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
          amount: Number(baseDebt.paymentAmount) || 0, // Original debt amount (from paymentAmount field)
          // Use the specific instance due date for the month
          dueDate: monthlyPlanning.dueDate,
          // Include the original template due date for month indicator
          originalDueDate: originalDueDate,
          paymentDate: allocation.paymentDate || undefined,
          paymentAmount: allocation.paymentAmount
            ? Number(allocation.paymentAmount) || 0
            : undefined, // Payment amount from allocation
          paymentId: allocation.id,
          isPaid: allocation.isPaid || false,
        };
      })
      .filter((debt) => debt !== null);

    const totalAllocated = allocatedDebts.reduce((sum, debt) => {
      const amount = debt.paymentAmount || debt.amount;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

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
    } else {
      // Update existing allocation
      await db
        .update(debtAllocations)
        .set({
          paymentAmount: paymentAmount ? paymentAmount.toString() : null,
          paymentDate: paymentDate || null,
          note: paymentDate
            ? `Updated payment from paycheck allocation on ${paymentDate}`
            : null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(debtAllocations.monthlyDebtPlanningId, monthlyDebtPlanningId),
            eq(debtAllocations.paycheckId, paycheckId),
            eq(debtAllocations.budgetAccountId, budgetAccountId),
          ),
        );
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
  } else if (action === "update") {
    // Update existing allocation
    const existingAllocation = await db.query.debtAllocations.findFirst({
      where: and(
        eq(debtAllocations.monthlyDebtPlanningId, monthlyDebtPlanningId),
        eq(debtAllocations.paycheckId, paycheckId),
        eq(debtAllocations.budgetAccountId, budgetAccountId),
      ),
    });

    if (existingAllocation) {
      await db
        .update(debtAllocations)
        .set({
          paymentAmount: paymentAmount ? paymentAmount.toString() : null,
          paymentDate: paymentDate || null,
          note: paymentDate
            ? `Updated payment from paycheck allocation on ${paymentDate}`
            : null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(debtAllocations.monthlyDebtPlanningId, monthlyDebtPlanningId),
            eq(debtAllocations.paycheckId, paycheckId),
            eq(debtAllocations.budgetAccountId, budgetAccountId),
          ),
        );
    }
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
      paymentDate: paymentDate || toDateString(new Date()),
      note: `Payment marked as paid on ${paymentDate || toDateString(new Date())}`,
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
 * It also checks if debts have already been allocated to different months to prevent duplication
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

  // Get ALL existing monthly debt planning records for this budget account
  // This ensures we don't create duplicates even if they exist outside the current window
  const allExistingRecords = await db.query.monthlyDebtPlanning.findMany({
    where: eq(monthlyDebtPlanning.budgetAccountId, budgetAccountId),
  });

  // Index existing by debtId-year-month
  const existingKey = new Set(
    allExistingRecords.map((r) => `${r.debtId}:${r.year}:${r.month}`),
  );

  // Create monthly planning records for each debt within the window if missing

  for (const debt of allDebts) {
    for (
      let monthOffset = 0;
      monthOffset <= planningWindowMonths;
      monthOffset++
    ) {
      // Calculate the target month by adding the offset to the current month
      let targetYear = year;
      let targetMonth = month + monthOffset;

      // Handle year transitions when month goes beyond 12
      if (targetMonth > 12) {
        targetYear = year + Math.floor((targetMonth - 1) / 12);
        targetMonth = ((targetMonth - 1) % 12) + 1;
      }

      // Parse the debt's due date to get the year and month when this debt should start appearing
      const [debtYear, debtMonth] = (debt.dueDate as string)
        .split("-")
        .map(Number);

      // Only create records for months that are on or after the debt's due date
      // This ensures debts don't appear in months before they're actually due
      const shouldInclude =
        targetYear > debtYear ||
        (targetYear === debtYear && targetMonth >= debtMonth);

      if (shouldInclude) {
        const key = `${debt.id}:${targetYear}:${targetMonth}`;

        // Skip if already present in this window
        if (existingKey.has(key)) {
          continue;
        }

        // Calculate the due date for this month (keep the same day of month)
        const [, , debtDay] = (debt.dueDate as string).split("-").map(Number);
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
        } catch (error) {
          // Check if it's a unique constraint violation (record already exists)
          if (
            error instanceof Error &&
            // Use error code or error class for unique constraint violation
            // Drizzle ORM: error.code for unique constraint violation (e.g., 'SQLITE_CONSTRAINT_UNIQUE', '23505' for Postgres)
            error &&
            typeof error === "object" &&
            "code" in error &&
            (error.code === "SQLITE_CONSTRAINT_UNIQUE" || // SQLite
              error.code === "23505") // Postgres
          ) {
            existingKey.add(key);
          } else {
            // Log other errors for debugging
            console.error(
              "Error inserting monthly debt planning record:",
              error,
            );
            throw error;
          }
        }
      }
    }
  }
}
