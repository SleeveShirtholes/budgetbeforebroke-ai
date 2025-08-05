"use server";

import { and, eq, gte, lte, inArray } from "drizzle-orm";
import { 
  budgetAccountMembers, 
  incomeSources, 
  recurringTransactions,
  debts
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/db/config";
import { headers } from "next/headers";
import { addDays, addWeeks, addMonths, startOfMonth, endOfMonth, format, isBefore, isAfter } from "date-fns";

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
  dueDate: Date;
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
    dueDate: Date;
  }[];
  remainingAmount: number;
}

/**
 * Calculate all paycheck dates for a given month
 */
function calculatePaycheckDates(
  incomeSource: {
    startDate: Date;
    frequency: "weekly" | "bi-weekly" | "monthly";
  },
  year: number,
  month: number
): Date[] {
  const dates: Date[] = [];
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));
  const startDate = new Date(incomeSource.startDate);
  
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
  month: number
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
      eq(budgetAccountMembers.userId, sessionResult.user.id)
    ),
  });

  if (!membership) {
    throw new Error("User does not have access to this budget account");
  }

  // Get all budget account members to fetch their income sources
  const members = await db.query.budgetAccountMembers.findMany({
    where: eq(budgetAccountMembers.budgetAccountId, budgetAccountId),
  });

  const memberUserIds = members.map(m => m.userId);

  // Get active income sources for all members
  const incomes = await db.query.incomeSources.findMany({
    where: and(
      inArray(incomeSources.userId, memberUserIds),
      eq(incomeSources.isActive, true)
    ),
  });

  // Calculate paychecks for the month
  const paychecks: PaycheckInfo[] = [];
  
  for (const income of incomes) {
    const payDates = calculatePaycheckDates(income, year, month);
    
    for (const payDate of payDates) {
      paychecks.push({
        id: `${income.id}-${format(payDate, 'yyyy-MM-dd')}`,
        name: income.name,
        amount: Number(income.amount),
        date: payDate,
        frequency: income.frequency,
        userId: income.userId,
      });
    }
  }

  // Sort paychecks by date
  paychecks.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Get recurring transactions (debts) for the month
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));

  const recurringDebts = await db.query.recurringTransactions.findMany({
    where: and(
      eq(recurringTransactions.budgetAccountId, budgetAccountId),
      eq(recurringTransactions.status, "active"),
      lte(recurringTransactions.startDate, monthEnd),
      // Only include if no end date or end date is after month start
      // TODO: Add proper end date handling
    ),
  });

  // Get one-time debts
  const oneTimeDebts = await db.query.debts.findMany({
    where: and(
      eq(debts.budgetAccountId, budgetAccountId),
      gte(debts.dueDate, monthStart),
      lte(debts.dueDate, monthEnd)
    ),
  });

  // Convert to common format
  const allDebts: DebtInfo[] = [
    ...recurringDebts.map(debt => ({
      id: debt.id,
      name: debt.description || "Recurring Payment",
      amount: Number(debt.amount),
      dueDate: calculateNextDueDate(debt, monthStart),
      frequency: debt.frequency,
      description: debt.description || undefined,
      isRecurring: true,
    })),
    ...oneTimeDebts.map(debt => ({
      id: debt.id,
      name: debt.name,
      amount: Number(debt.balance), // Use balance as amount for one-time debts
      dueDate: debt.dueDate,
      frequency: "one-time",
      description: debt.name,
      isRecurring: false,
    })),
  ];

  // Generate warnings
  const warnings = generateWarnings(paychecks, allDebts);

  return {
    paychecks,
    debts: allDebts,
    warnings,
  };
}

/**
 * Calculate the next due date for a recurring transaction within a month
 */
function calculateNextDueDate(recurringTransaction: { startDate: Date }, monthStart: Date): Date {
  // For simplicity, assume monthly frequency and use the day from start date
  const startDate = new Date(recurringTransaction.startDate);
  const dayOfMonth = startDate.getDate();
  
  const dueDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), dayOfMonth);
  
  // If the due date is before the month start, move to next occurrence
  if (isBefore(dueDate, monthStart)) {
    return addMonths(dueDate, 1);
  }
  
  return dueDate;
}

/**
 * Generate warnings for potential payment issues
 */
function generateWarnings(paychecks: PaycheckInfo[], debts: DebtInfo[]): PaycheckWarning[] {
  const warnings: PaycheckWarning[] = [];
  
  // Sort debts by due date
  const sortedDebts = [...debts].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  
  // Calculate allocations to check for issues
  const allocations = calculateOptimalAllocations(paychecks, sortedDebts);
  
  for (const allocation of allocations) {
    // Check for insufficient funds
    if (allocation.remainingAmount < 0) {
      warnings.push({
        type: "insufficient_funds",
        message: `Paycheck on ${format(allocation.paycheckDate, 'MMM dd')} has insufficient funds. Short by $${Math.abs(allocation.remainingAmount).toFixed(2)}`,
        paycheckId: allocation.paycheckId,
        severity: "high",
      });
    }
    
    // Check for debts that might be paid late
    for (const debt of allocation.allocatedDebts) {
      if (isAfter(allocation.paycheckDate, debt.dueDate)) {
        warnings.push({
          type: "late_payment",
          message: `${debt.debtName} payment will be late. Due ${format(debt.dueDate, 'MMM dd')}, paid ${format(allocation.paycheckDate, 'MMM dd')}`,
          debtId: debt.debtId,
          paycheckId: allocation.paycheckId,
          severity: "medium",
        });
      }
    }
  }
  
  // Check for unpaid debts
  const allocatedDebtIds = new Set(
    allocations.flatMap(a => a.allocatedDebts.map(d => d.debtId))
  );
  
  for (const debt of sortedDebts) {
    if (!allocatedDebtIds.has(debt.id)) {
      warnings.push({
        type: "debt_unpaid",
        message: `${debt.name} (due ${format(debt.dueDate, 'MMM dd')}) cannot be paid with available paychecks`,
        debtId: debt.id,
        severity: "high",
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
  debts: DebtInfo[]
): PaycheckAllocation[] {
  const allocations: PaycheckAllocation[] = [];
  const remainingDebts = [...debts].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  
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
      if (!isAfter(debt.dueDate, addDays(paycheck.date, 7)) && 
          allocation.remainingAmount >= debt.amount) {
        
        allocation.allocatedDebts.push({
          debtId: debt.id,
          debtName: debt.name,
          amount: debt.amount,
          dueDate: debt.dueDate,
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
  month: number
): Promise<PaycheckAllocation[]> {
  const data = await getPaycheckPlanningData(budgetAccountId, year, month);
  return calculateOptimalAllocations(data.paychecks, data.debts);
}