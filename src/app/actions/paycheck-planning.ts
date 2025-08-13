"use server";

import { and, eq, inArray } from "drizzle-orm";
import {
  budgetAccountMembers,
  incomeSources,
  recurringTransactions,
  debts,
  debtAllocations,
  dismissedWarnings,
  monthlyDebtPlanning,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/db/config";
import { headers } from "next/headers";
import {
  addDays,
  addWeeks,
  addMonths,
  format,
  isBefore,
  isAfter,
} from "date-fns";
import { formatDateSafely, toDateObject } from "@/utils/date";

export interface PaycheckInfo {
  id: string;
  name: string;
  amount: number;
  date: Date; // Use Date object for consistency
  frequency: "weekly" | "bi-weekly" | "monthly";
  userId: string;
}

export interface DebtInfo {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // Keep as string in YYYY-MM-DD format
  frequency: string;
  description?: string;
  isRecurring: boolean;
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
    dueDate: string; // Now a date string in YYYY-MM-DD format
    paymentDate?: string; // Payment date from debt_payment table
    paymentId?: string; // ID of the debt_payment record
    isPaid: boolean; // Whether the payment has been marked as paid
  }[];
  remainingAmount: number;
}

/**
 * Calculate all paycheck dates for a given month
 */
function calculatePaycheckDates(
  incomeSource: {
    startDate: string; // Changed from Date to string since income.startDate is a date field in DB
    frequency: "weekly" | "bi-weekly" | "monthly";
  },
  year: number,
  month: number,
): Date[] {
  const dates: Date[] = [];
  // Use UTC dates to avoid timezone issues
  const monthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  // Parse the startDate string (YYYY-MM-DD format) to a Date object
  const [startYear, startMonth, startDay] = incomeSource.startDate
    .split("-")
    .map(Number);
  const startDate = new Date(startYear, startMonth - 1, startDay, 12, 0, 0, 0); // Use noon to avoid edge cases
  let currentDate = new Date(startDate);

  // Find the first paycheck date in or after the month
  while (isBefore(currentDate, monthStart)) {
    switch (incomeSource.frequency) {
      case "weekly":
        currentDate = addWeeks(currentDate, 1);
        break;
      case "bi-weekly":
        currentDate = addWeeks(currentDate, 2);
        break;
      case "monthly":
        currentDate = addMonths(currentDate, 1);
        break;
    }
  }

  // Add all paycheck dates within the month
  while (!isAfter(currentDate, monthEnd)) {
    dates.push(new Date(currentDate));

    switch (incomeSource.frequency) {
      case "weekly":
        currentDate = addWeeks(currentDate, 1);
        break;
      case "bi-weekly":
        currentDate = addWeeks(currentDate, 2);
        break;
      case "monthly":
        currentDate = addMonths(currentDate, 1);
        break;
    }
  }

  return dates;
}

/**
 * Get paycheck planning data for a specific month
 */
export async function getPaycheckPlanningData(
  budgetAccountId: string,
  year: number,
  month: number,
): Promise<PaycheckPlanningData> {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult?.user) {
    throw new Error("User not authenticated");
  }

  // Verify user has access to the budget account
  const membership = await db.query.budgetAccountMembers.findFirst({
    where: and(
      eq(budgetAccountMembers.budgetAccountId, budgetAccountId),
      eq(budgetAccountMembers.userId, sessionResult.user.id),
    ),
  });

  if (!membership) {
    throw new Error("User does not have access to this budget account");
  }

  // Get all budget account members to fetch their income sources
  const members = await db.query.budgetAccountMembers.findMany({
    where: eq(budgetAccountMembers.budgetAccountId, budgetAccountId),
  });

  const memberUserIds = members.map((m) => m.userId);

  // Get active income sources for all members
  const incomes = await db.query.incomeSources.findMany({
    where: and(
      inArray(incomeSources.userId, memberUserIds),
      eq(incomeSources.isActive, true),
    ),
  });

  // Calculate paychecks for the month
  const paychecks: PaycheckInfo[] = [];

  for (const income of incomes) {
    // The startDate is already a string in YYYY-MM-DD format from the database
    const payDates = calculatePaycheckDates(
      { ...income, startDate: income.startDate },
      year,
      month,
    );

    for (const payDate of payDates) {
      paychecks.push({
        id: `${income.id}-${format(payDate, "yyyy-MM-dd")}`,
        name: income.name,
        amount: Number(income.amount),
        date: payDate, // This is already a Date object
        frequency: income.frequency,
        userId: income.userId,
      });
    }
  }

  // Sort paychecks by date
  paychecks.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Get recurring transactions (debts) for the month
  const recurringDebts = await db.query.recurringTransactions.findMany({
    where: and(
      eq(recurringTransactions.budgetAccountId, budgetAccountId),
      eq(recurringTransactions.status, "active"),
      // Include all active recurring transactions - we'll calculate their due dates
    ),
  });

  // Get one-time debts - include all debts, not just those due this month
  const oneTimeDebts = await db.query.debts.findMany({
    where: and(
      eq(debts.budgetAccountId, budgetAccountId),
      // Include all debts, including those from previous months that are still unpaid
    ),
  });

  // Get all debt allocations to check payment history
  const allDebtAllocations = await db.query.debtAllocations.findMany({
    where: eq(debtAllocations.budgetAccountId, budgetAccountId),
  });

  // Create a map of debtId to last payment date
  const lastPaymentMap = new Map<string, Date>();
  allDebtAllocations.forEach((allocation) => {
    if (allocation.isPaid && allocation.paidAt) {
      const existingLastPayment = lastPaymentMap.get(allocation.debtId);
      if (!existingLastPayment || allocation.paidAt > existingLastPayment) {
        lastPaymentMap.set(allocation.debtId, allocation.paidAt);
      }
    }
  });

  // Debug logging
  console.log("Database Query Results:", {
    budgetAccountId,
    year,
    month,
    recurringDebtsCount: recurringDebts.length,
    oneTimeDebtsCount: oneTimeDebts.length,
    recurringDebts: recurringDebts.map((d) => ({
      id: d.id,
      description: d.description,
      amount: d.amount,
      status: d.status,
    })),
    oneTimeDebts: oneTimeDebts.map((d) => ({
      id: d.id,
      name: d.name,
      paymentAmount: d.paymentAmount,
      dueDate: d.dueDate,
    })),
  });

  // Process recurring debts with proper due date calculation
  const recurringDebtsWithDueDates = recurringDebts.map((debt) => {
    // For recurring debts, calculate due date based on frequency and start date
    // Don't use monthly planning as it can have incorrect due dates

    const startDate = new Date(debt.startDate);
    const startDay = startDate.getDate();

    // Create the target month's due date
    let targetMonth = new Date(year, month - 1, startDay);

    // Check if this debt has been paid in previous months
    const lastPayment = lastPaymentMap.get(debt.id);
    if (lastPayment) {
      // If the debt was paid in a previous month, advance the due date
      const lastPaymentMonth = lastPayment.getMonth();
      const lastPaymentYear = lastPayment.getFullYear();

      // Calculate how many months to advance
      let monthsToAdvance = 0;
      if (year > lastPaymentYear) {
        monthsToAdvance =
          (year - lastPaymentYear) * 12 + (month - lastPaymentMonth - 1);
      } else if (year === lastPaymentYear && month > lastPaymentMonth + 1) {
        monthsToAdvance = month - lastPaymentMonth - 1;
      }

      if (monthsToAdvance > 0) {
        targetMonth = new Date(
          targetMonth.getFullYear(),
          targetMonth.getMonth() + monthsToAdvance,
          targetMonth.getDate(),
        );
      }
    }

    // If the target month's due date would be in the past, advance it by months
    let dueDate = targetMonth;
    while (dueDate < new Date()) {
      dueDate = new Date(
        dueDate.getFullYear(),
        dueDate.getMonth() + 1,
        dueDate.getDate(),
      );
    }

    return {
      id: debt.id,
      name: debt.description || "Recurring Payment",
      amount: Number(debt.amount),
      dueDate: `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-${String(dueDate.getDate()).padStart(2, "0")}`,
      frequency: debt.frequency,
      description: debt.description || undefined,
      isRecurring: true,
    };
  });

  // Process one-time debts with proper due date calculation
  const oneTimeDebtsWithDueDates = oneTimeDebts.map(async (debt) => {
    // For one-time debts, we need to calculate the effective due date for this month
    // based on the base due date and payment history, WITHOUT modifying the base debt

    // First, check if we have monthly planning for this debt and month
    const monthlyPlanning = await db.query.monthlyDebtPlanning.findFirst({
      where: and(
        eq(monthlyDebtPlanning.budgetAccountId, budgetAccountId),
        eq(monthlyDebtPlanning.debtId, debt.id),
        eq(monthlyDebtPlanning.year, year),
        eq(monthlyDebtPlanning.month, month),
        eq(monthlyDebtPlanning.isActive, true),
      ),
    });

    let effectiveDueDate: string;

    if (monthlyPlanning) {
      // Use the monthly planning due date if it exists
      effectiveDueDate = monthlyPlanning.dueDate.toString().split("T")[0];
    } else {
      // Calculate the effective due date based on base due date and payment history
      // Fix timezone issue: parse the date string directly instead of creating Date objects
      // debt.dueDate is in format "YYYY-MM-DD", so we can split it directly
      const [, , baseDay] = debt.dueDate.split("-").map(Number);
      const baseDueDay = baseDay;

      // Start with the base due date for this planning month
      // Create the date string directly to avoid timezone issues
      let calculatedDueDateString = `${year}-${String(month).padStart(2, "0")}-${String(baseDueDay).padStart(2, "0")}`;

      // Check if this debt has been paid in previous months
      const lastPayment = lastPaymentMap.get(debt.id);

      if (lastPayment) {
        // If the debt was paid, we need to advance the due date by the number of months
        // since the last payment, but only if we're planning for a month after the payment

        const lastPaymentMonth = lastPayment.getMonth();
        const lastPaymentYear = lastPayment.getFullYear();

        // Calculate how many months to advance based on payment history
        let monthsToAdvance = 0;

        if (year > lastPaymentYear) {
          monthsToAdvance =
            (year - lastPaymentYear) * 12 + (month - lastPaymentMonth - 1);
        } else if (year === lastPaymentYear && month > lastPaymentMonth + 1) {
          monthsToAdvance = month - lastPaymentMonth - 1;
        }

        if (monthsToAdvance > 0) {
          // Calculate the advanced date by adding months
          let advancedYear = year;
          let advancedMonth = month;

          for (let i = 0; i < monthsToAdvance; i++) {
            advancedMonth++;
            if (advancedMonth > 12) {
              advancedMonth = 1;
              advancedYear++;
            }
          }

          calculatedDueDateString = `${advancedYear}-${String(advancedMonth).padStart(2, "0")}-${String(baseDueDay).padStart(2, "0")}`;
        }
      }

      // Ensure the calculated due date is not in the past relative to the planning month
      // Compare as strings to avoid timezone issues
      const planningMonthString = `${year}-${String(month).padStart(2, "0")}-01`;
      if (calculatedDueDateString < planningMonthString) {
        // If the calculated due date is in the past for this planning month,
        // use the planning month with the base due day
        calculatedDueDateString = `${year}-${String(month).padStart(2, "0")}-${String(baseDueDay).padStart(2, "0")}`;
      }

      effectiveDueDate = calculatedDueDateString;

      // Create monthly planning for this month to store the calculated due date
      // This preserves the payment history while allowing monthly due date tracking
      await getOrCreateMonthlyDebtPlanning(
        budgetAccountId,
        debt.id,
        year,
        month,
      ).catch((error) => {
        console.error(
          `Failed to create monthly planning for debt ${debt.id}:`,
          error,
        );
      });
    }

    return {
      id: debt.id,
      name: debt.name,
      amount: Number(debt.paymentAmount),
      dueDate: effectiveDueDate,
      frequency: "one-time",
      description: debt.name,
      isRecurring: false,
    };
  });

  // Wait for all async operations to complete
  const resolvedOneTimeDebts = await Promise.all(oneTimeDebtsWithDueDates);

  const allDebts: DebtInfo[] = [
    ...recurringDebtsWithDueDates,
    ...resolvedOneTimeDebts,
  ];

  // Debug logging for final debt list
  console.log("Final Debt List:", {
    totalDebts: allDebts.length,
    recurringDebts: recurringDebtsWithDueDates.length,
    oneTimeDebts: resolvedOneTimeDebts.length,
    allDebts: allDebts.map((d) => ({
      id: d.id,
      name: d.name,
      amount: d.amount,
      dueDate: d.dueDate,
      isRecurring: d.isRecurring,
    })),
  });

  // Additional debug logging for Car Loan specifically
  const carLoan = allDebts.find((d) => d.name.includes("Car Loan"));
  if (carLoan) {
    console.log("Car Loan Debug Info:", {
      id: carLoan.id,
      name: carLoan.name,
      dueDate: carLoan.dueDate,
      isRecurring: carLoan.isRecurring,
      originalDebtDueDate: oneTimeDebts.find((d) => d.id === carLoan.id)
        ?.dueDate,
      monthlyPlanning: await db.query.monthlyDebtPlanning.findFirst({
        where: and(
          eq(monthlyDebtPlanning.budgetAccountId, budgetAccountId),
          eq(monthlyDebtPlanning.debtId, carLoan.id),
          eq(monthlyDebtPlanning.year, year),
          eq(monthlyDebtPlanning.month, month),
        ),
      }),
    });
  }

  // Generate warnings
  const warnings = generateWarnings(paychecks, allDebts);

  // Get dismissed warnings and filter them out
  const dismissedWarnings = await getDismissedWarnings(budgetAccountId);
  const dismissedWarningKeys = new Set(
    dismissedWarnings.map((d) => `${d.warningType}:${d.warningKey}`),
  );

  const filteredWarnings = warnings.filter((warning) => {
    const warningKey = generateWarningKey(warning);
    return !dismissedWarningKeys.has(warningKey);
  });

  return {
    paychecks,
    debts: allDebts,
    warnings: filteredWarnings,
  };
}

/**
 * Generate a unique key for a warning to identify it for dismissal
 */
function generateWarningKey(warning: PaycheckWarning): string {
  switch (warning.type) {
    case "late_payment":
      return `${warning.type}:${warning.debtId}:${warning.paycheckId}`;
    case "insufficient_funds":
      return `${warning.type}:${warning.paycheckId}`;
    case "debt_unpaid":
      return `${warning.type}:${warning.debtId}`;
    default:
      return `${warning.type}:${warning.debtId || warning.paycheckId || "unknown"}`;
  }
}

/**
 * Generate warnings for potential payment issues
 */
function generateWarnings(
  paychecks: PaycheckInfo[],
  debts: DebtInfo[],
): PaycheckWarning[] {
  const warnings: PaycheckWarning[] = [];

  // Sort debts by due date
  const sortedDebts = [...debts].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
  );

  // Calculate allocations to check for issues
  const allocations = calculateOptimalAllocations(paychecks, sortedDebts);

  for (const allocation of allocations) {
    // Check for insufficient funds
    if (allocation.remainingAmount < 0) {
      warnings.push({
        type: "insufficient_funds",
        message: `Paycheck on ${format(allocation.paycheckDate, "MMM dd")} has insufficient funds. Short by $${Math.abs(allocation.remainingAmount).toFixed(2)}`,
        paycheckId: allocation.paycheckId,
        severity: "high",
      });
    }

    // Check for debts that might be paid late
    for (const debt of allocation.allocatedDebts) {
      if (isAfter(allocation.paycheckDate, toDateObject(debt.dueDate))) {
        warnings.push({
          type: "late_payment",
          message: `${debt.debtName} payment will be late. Due ${formatDateSafely(debt.dueDate, "MMM dd")}, paid ${formatDateSafely(allocation.paycheckDate, "MMM dd")}`,
          debtId: debt.debtId,
          paycheckId: allocation.paycheckId,
          severity: "medium",
        });
      }
    }
  }

  // Check for unpaid debts
  const allocatedDebtIds = new Set(
    allocations.flatMap((a) => a.allocatedDebts.map((d) => d.debtId)),
  );

  for (const debt of sortedDebts) {
    if (!allocatedDebtIds.has(debt.id)) {
      warnings.push({
        type: "debt_unpaid",
        message: `${debt.name} (due ${formatDateSafely(debt.dueDate, "MMM dd")}) cannot be paid with available paychecks`,
        debtId: debt.id,
        severity: "medium",
      });
    }
  }

  return warnings;
}

/**
 * Calculate optimal debt allocations across paychecks
 */
function calculateOptimalAllocations(
  paychecks: PaycheckInfo[],
  debts: DebtInfo[],
): PaycheckAllocation[] {
  const allocations: PaycheckAllocation[] = [];
  const remainingDebts = [...debts].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
  );

  for (const paycheck of paychecks) {
    const allocation: PaycheckAllocation = {
      paycheckId: paycheck.id,
      paycheckDate: paycheck.date,
      paycheckAmount: paycheck.amount,
      allocatedDebts: [],
      remainingAmount: paycheck.amount,
    };

    // Allocate debts that are due before or on the paycheck date
    for (let i = remainingDebts.length - 1; i >= 0; i--) {
      const debt = remainingDebts[i];

      // Only allocate if debt is due before or shortly after this paycheck
      // and we have enough funds
      if (
        !isAfter(toDateObject(debt.dueDate), addDays(paycheck.date, 7)) &&
        allocation.remainingAmount >= debt.amount
      ) {
        allocation.allocatedDebts.push({
          debtId: debt.id,
          debtName: debt.name,
          amount: debt.amount,
          dueDate: debt.dueDate,
          paymentId: undefined, // No payment ID for optimal allocations
          isPaid: false, // Optimal allocations are not paid yet
        });

        allocation.remainingAmount -= debt.amount;
        remainingDebts.splice(i, 1);
      }
    }

    allocations.push(allocation);
  }

  return allocations;
}

/**
 * Get paycheck allocations for a specific month
 */
export async function getPaycheckAllocations(
  budgetAccountId: string,
  year: number,
  month: number,
): Promise<PaycheckAllocation[]> {
  const data = await getPaycheckPlanningData(budgetAccountId, year, month);
  const storedAllocations = await getDebtAllocations(budgetAccountId);

  // Get all payments for all allocated debts (both paid and unpaid)
  const debtIds = storedAllocations.map((allocation) => allocation.debtId);

  // Get all allocations with payment information for allocated debts
  // Now payment info is stored directly in debtAllocations
  const allAllocationsWithPayments = await db.query.debtAllocations.findMany({
    where: inArray(debtAllocations.debtId, debtIds),
  });

  // Create maps of debtId to payment details from the consolidated table
  const paymentAmountMap = new Map<string, number>();
  const paymentDateMap = new Map<string, string>();
  const paymentIdMap = new Map<string, string>();
  const paymentStatusMap = new Map<string, boolean>();

  allAllocationsWithPayments.forEach((allocation) => {
    if (allocation.paymentAmount && allocation.paymentDate) {
      paymentAmountMap.set(allocation.debtId, Number(allocation.paymentAmount));
      paymentDateMap.set(allocation.debtId, allocation.paymentDate);
      paymentIdMap.set(allocation.debtId, allocation.id); // Use allocation ID as payment ID
      paymentStatusMap.set(allocation.debtId, allocation.isPaid);
    }
  });

  // Create allocations based on stored data
  const allocations: PaycheckAllocation[] = data.paychecks.map((paycheck) => {
    const paycheckAllocations = storedAllocations.filter(
      (allocation) => allocation.paycheckId === paycheck.id,
    );

    const allocatedDebts = paycheckAllocations
      .map((allocation) => {
        const debt = data.debts.find((d) => d.id === allocation.debtId);
        if (!debt) return null;

        // Use scheduled payment amount if available, otherwise use debt amount
        const scheduledAmount = paymentAmountMap.get(debt.id);
        const displayAmount = scheduledAmount || debt.amount;
        const paymentId = paymentIdMap.get(debt.id);
        const isPaid = paymentStatusMap.get(debt.id) || false;

        return {
          debtId: debt.id,
          debtName: debt.name,
          amount: displayAmount,
          dueDate: debt.dueDate,
          paymentDate: paymentDateMap.get(debt.id),
          paymentId,
          isPaid,
        };
      })
      .filter(
        (
          debt,
        ): debt is {
          debtId: string;
          debtName: string;
          amount: number;
          dueDate: string;
          paymentDate: string | undefined;
          paymentId: string | undefined;
          isPaid: boolean;
        } => debt !== null,
      );

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
 * Update debt allocation for a specific paycheck
 */
export async function updateDebtAllocation(
  budgetAccountId: string,
  debtId: string,
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
  const membership = await db.query.budgetAccountMembers.findFirst({
    where: and(
      eq(budgetAccountMembers.budgetAccountId, budgetAccountId),
      eq(budgetAccountMembers.userId, sessionResult.user.id),
    ),
  });

  if (!membership) {
    throw new Error("User does not have access to this budget account");
  }

  if (action === "allocate") {
    // Check if allocation already exists
    const existingAllocation = await db.query.debtAllocations.findFirst({
      where: and(
        eq(debtAllocations.debtId, debtId),
        eq(debtAllocations.paycheckId, paycheckId),
        eq(debtAllocations.budgetAccountId, budgetAccountId),
      ),
    });

    if (!existingAllocation) {
      // Create new allocation
      await db.insert(debtAllocations).values({
        budgetAccountId,
        debtId,
        paycheckId,
        userId: sessionResult.user.id,
        // Store payment information directly in the allocation
        paymentAmount: paymentAmount ? paymentAmount.toString() : null,
        paymentDate: paymentDate || null,
        note: paymentDate
          ? `Scheduled payment from paycheck allocation on ${paymentDate}`
          : null,
        isPaid: false, // Default to unpaid when scheduled
      });
    }
  } else if (action === "update") {
    // Update existing debt allocation with payment information
    if (paymentAmount && paymentDate) {
      // Find the existing allocation for this debt and paycheck
      const existingAllocation = await db.query.debtAllocations.findFirst({
        where: and(
          eq(debtAllocations.debtId, debtId),
          eq(debtAllocations.paycheckId, paycheckId),
          eq(debtAllocations.budgetAccountId, budgetAccountId),
        ),
      });

      if (existingAllocation) {
        // Update the existing allocation with new payment details
        await db
          .update(debtAllocations)
          .set({
            paymentAmount: paymentAmount.toString(),
            paymentDate: paymentDate,
            note: `Scheduled payment from paycheck allocation on ${paymentDate}`,
            updatedAt: new Date(),
          })
          .where(eq(debtAllocations.id, existingAllocation.id));
      }
    }
  } else {
    // Remove allocation - payment information is stored directly in the allocation
    // so deleting the allocation removes everything
    await db
      .delete(debtAllocations)
      .where(
        and(
          eq(debtAllocations.debtId, debtId),
          eq(debtAllocations.paycheckId, paycheckId),
          eq(debtAllocations.budgetAccountId, budgetAccountId),
        ),
      );
  }

  return { success: true };
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
  const membership = await db.query.budgetAccountMembers.findFirst({
    where: and(
      eq(budgetAccountMembers.budgetAccountId, budgetAccountId),
      eq(budgetAccountMembers.userId, sessionResult.user.id),
    ),
  });

  if (!membership) {
    throw new Error("User does not have access to this budget account");
  }

  const allocations = await db.query.debtAllocations.findMany({
    where: eq(debtAllocations.budgetAccountId, budgetAccountId),
  });

  return allocations;
}

/**
 * Get all debts for a budget account (no month filtering)
 */
export async function getAllDebtsForBudgetAccount(
  budgetAccountId: string,
): Promise<PaycheckPlanningData> {
  // Get all recurring transactions
  const recurringDebts = await db.query.recurringTransactions.findMany({
    where: and(
      eq(recurringTransactions.budgetAccountId, budgetAccountId),
      eq(recurringTransactions.status, "active"),
    ),
  });

  // Get all one-time debts (no date filtering)
  const oneTimeDebts = await db.query.debts.findMany({
    where: eq(debts.budgetAccountId, budgetAccountId),
  });

  // Convert to common format
  const recurringDebtsWithDueDates = recurringDebts.map((debt) => ({
    id: debt.id,
    name: debt.description || "Recurring Payment",
    amount: Number(debt.amount),
    // Fix timezone issue: manually construct date string instead of using toISOString()
    // This prevents the date from shifting due to timezone conversion
    dueDate: `${debt.startDate.getFullYear()}-${String(debt.startDate.getMonth() + 1).padStart(2, "0")}-${String(debt.startDate.getDate()).padStart(2, "0")}`,
    frequency: debt.frequency,
    description: debt.description || undefined,
    isRecurring: true,
  }));

  const allDebts: DebtInfo[] = [
    ...recurringDebtsWithDueDates,
    ...oneTimeDebts.map((debt) => ({
      id: debt.id,
      name: debt.name,
      amount: Number(debt.paymentAmount),
      dueDate: debt.dueDate,
      frequency: "one-time",
      description: debt.name,
      isRecurring: false,
    })),
  ];

  return {
    paychecks: [], // No paychecks needed for debt management
    debts: allDebts,
    warnings: [], // No warnings needed for debt management
  };
}

/**
 * Get current month paycheck planning data
 */
export async function getCurrentMonthPaycheckPlanning(
  budgetAccountId: string,
): Promise<PaycheckPlanningData> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return getPaycheckPlanningData(budgetAccountId, year, month);
}

/**
 * Get current month paycheck allocations
 */
export async function getCurrentMonthPaycheckAllocations(
  budgetAccountId: string,
): Promise<PaycheckAllocation[]> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return getPaycheckAllocations(budgetAccountId, year, month);
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
  const membership = await db.query.budgetAccountMembers.findFirst({
    where: and(
      eq(budgetAccountMembers.budgetAccountId, budgetAccountId),
      eq(budgetAccountMembers.userId, sessionResult.user.id),
    ),
  });

  if (!membership) {
    throw new Error("User does not have access to this budget account");
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
 * Get dismissed warnings for a user and budget account
 */
export async function getDismissedWarnings(
  budgetAccountId: string,
): Promise<{ warningType: string; warningKey: string }[]> {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult?.user) {
    throw new Error("User not authenticated");
  }

  const dismissed = await db.query.dismissedWarnings.findMany({
    where: and(
      eq(dismissedWarnings.budgetAccountId, budgetAccountId),
      eq(dismissedWarnings.userId, sessionResult.user.id),
    ),
  });

  return dismissed.map((d) => ({
    warningType: d.warningType,
    warningKey: d.warningKey,
  }));
}

/**
 * Mark a debt payment as paid and schedule next payment if recurring
 */
export async function markPaymentAsPaid(
  budgetAccountId: string,
  debtId: string,
  paymentId: string,
) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult?.user) {
    throw new Error("User not authenticated");
  }

  // Verify user has access to the budget account
  const membership = await db.query.budgetAccountMembers.findFirst({
    where: and(
      eq(budgetAccountMembers.budgetAccountId, budgetAccountId),
      eq(budgetAccountMembers.userId, sessionResult.user.id),
    ),
  });

  if (!membership) {
    throw new Error("User does not have access to this budget account");
  }

  // Get the allocation details (paymentId is now the allocation ID)
  const allocation = await db.query.debtAllocations.findFirst({
    where: eq(debtAllocations.id, paymentId),
  });

  if (!allocation) {
    throw new Error("Allocation not found");
  }

  // Verify the allocation belongs to the specified debt
  if (allocation.debtId !== debtId) {
    throw new Error("Allocation does not match the specified debt");
  }

  // Get the debt details
  const debt = await db.query.debts.findFirst({
    where: eq(debts.id, debtId),
  });

  if (!debt) {
    throw new Error("Debt not found");
  }

  // Mark the allocation as paid
  await db
    .update(debtAllocations)
    .set({
      isPaid: true,
      paidAt: new Date(),
      // Set paymentDate if it's not already set (for payments made without advance scheduling)
      paymentDate:
        allocation.paymentDate || new Date().toISOString().split("T")[0],
      updatedAt: new Date(),
    })
    .where(eq(debtAllocations.id, paymentId));

  // Update the debt's last payment month
  await db
    .update(debts)
    .set({
      lastPaymentMonth: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(debts.id, debtId));

  // For recurring debts, we need to create a new monthly planning record for the next month
  // The current month's due date will remain unchanged in the monthlyDebtPlanning table
  // preserving historical data
  // Check if this debt is a recurring transaction
  const recurringTransaction = await db.query.recurringTransactions.findFirst({
    where: eq(recurringTransactions.id, debtId),
  });

  if (
    recurringTransaction &&
    recurringTransaction.frequency &&
    recurringTransaction.frequency !== "one-time"
  ) {
    // Calculate the next month
    const currentDate = new Date();
    const nextMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1,
    );
    const nextYear = nextMonth.getFullYear();
    const nextMonthNum = nextMonth.getMonth() + 1; // getMonth() returns 0-11, so add 1

    // Create or update the monthly planning for the next month
    await getOrCreateMonthlyDebtPlanning(
      budgetAccountId,
      debtId,
      nextYear,
      nextMonthNum,
    );
  } else {
    // This is a one-time debt
    // DO NOT modify the base debt.dueDate - this preserves payment history
    // Instead, create monthly planning for the next month to track due date advancement

    // Calculate the next month after the current payment
    const currentDate = new Date();
    const nextMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1,
    );
    const nextYear = nextMonth.getFullYear();
    const nextMonthNum = nextMonth.getMonth() + 1; // getMonth() returns 0-11, so add 1

    // Create monthly planning for the next month to track the advanced due date
    // The base debt.dueDate remains unchanged (August 1st)
    await getOrCreateMonthlyDebtPlanning(
      budgetAccountId,
      debtId,
      nextYear,
      nextMonthNum,
    );
  }

  return { success: true };
}

/**
 * Get or create monthly debt planning for a specific debt and month
 * This function works entirely with string manipulation to avoid timezone issues
 */
export async function getOrCreateMonthlyDebtPlanning(
  budgetAccountId: string,
  debtId: string,
  year: number,
  month: number,
) {
  // First, try to find existing planning
  const existingPlanning = await db.query.monthlyDebtPlanning.findFirst({
    where: and(
      eq(monthlyDebtPlanning.budgetAccountId, budgetAccountId),
      eq(monthlyDebtPlanning.debtId, debtId),
      eq(monthlyDebtPlanning.year, year),
      eq(monthlyDebtPlanning.month, month),
    ),
  });

  if (existingPlanning) {
    return existingPlanning;
  }

  // Get the debt to determine the base due date
  const debt = await db.query.debts.findFirst({
    where: eq(debts.id, debtId),
  });

  if (!debt) {
    throw new Error(`Debt with ID ${debtId} not found`);
  }

  // For all debts, use the due date directly from the debts table
  const baseDueDateString = debt.dueDate;

  // Parse the base due date string directly (YYYY-MM-DD format)
  const [, , baseDay] = baseDueDateString.split("-").map(Number);

  // Calculate the due date for the target month
  // Keep the same day of month, but use the target year/month
  const dueDateString = `${year}-${String(month).padStart(2, "0")}-${String(baseDay).padStart(2, "0")}`;

  // Create the monthly planning record
  const [newPlanning] = await db
    .insert(monthlyDebtPlanning)
    .values({
      budgetAccountId,
      debtId,
      year,
      month,
      dueDate: dueDateString,
      isActive: true,
    })
    .returning();

  return newPlanning;
}

/**
 * Get all monthly debt planning for a specific month
 */
export async function getMonthlyDebtPlanningForMonth(
  budgetAccountId: string,
  year: number,
  month: number,
) {
  return await db.query.monthlyDebtPlanning.findMany({
    where: and(
      eq(monthlyDebtPlanning.budgetAccountId, budgetAccountId),
      eq(monthlyDebtPlanning.year, year),
      eq(monthlyDebtPlanning.month, month),
      eq(monthlyDebtPlanning.isActive, true),
    ),
  });
}

/**
 * Initialize monthly debt planning for all debts in a month
 * This ensures every debt has a planned due date for the month
 */
export async function initializeMonthlyDebtPlanning(
  budgetAccountId: string,
  year: number,
  month: number,
) {
  // Get all debts for this budget account
  const recurringDebts = await db.query.recurringTransactions.findMany({
    where: and(
      eq(recurringTransactions.budgetAccountId, budgetAccountId),
      eq(recurringTransactions.status, "active"),
    ),
  });

  const oneTimeDebts = await db.query.debts.findMany({
    where: eq(debts.budgetAccountId, budgetAccountId),
  });

  const allDebts = [...recurringDebts, ...oneTimeDebts];

  // Get or create monthly planning for each debt
  const monthlyPlanningPromises = allDebts.map((debt) =>
    getOrCreateMonthlyDebtPlanning(budgetAccountId, debt.id, year, month),
  );

  return await Promise.all(monthlyPlanningPromises);
}



/**
 * Clean up incorrect monthly debt planning records
 * This function removes monthly planning records that have incorrect due dates
 */
export async function cleanupIncorrectMonthlyPlanning(budgetAccountId: string) {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionResult?.user) {
    throw new Error("User not authenticated");
  }

  // Verify user has access to the budget account
  const membership = await db.query.budgetAccountMembers.findFirst({
    where: and(
      eq(budgetAccountMembers.budgetAccountId, budgetAccountId),
      eq(budgetAccountMembers.userId, sessionResult.user.id),
    ),
  });

  if (!membership) {
    throw new Error("User does not have access to this budget account");
  }

  try {
    // Get all monthly planning records for this budget account
    const allMonthlyPlanning = await db.query.monthlyDebtPlanning.findMany({
      where: eq(monthlyDebtPlanning.budgetAccountId, budgetAccountId),
    });

    let cleanedCount = 0;

    for (const planning of allMonthlyPlanning) {
      // Check if this is a one-time debt
      const debt = await db.query.debts.findFirst({
        where: eq(debts.id, planning.debtId),
      });

      if (debt) {
        // For one-time debts, the monthly planning due date should match the debt's due date
        // If they don't match, delete the monthly planning record
        const planningDueDate = planning.dueDate.toString().split("T")[0];
        if (planningDueDate !== debt.dueDate) {
          await db
            .delete(monthlyDebtPlanning)
            .where(eq(monthlyDebtPlanning.id, planning.id));
          cleanedCount++;
        }
      }
    }

    return { success: true, cleanedCount };
  } catch (error) {
    console.error("Error cleaning up monthly planning:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
