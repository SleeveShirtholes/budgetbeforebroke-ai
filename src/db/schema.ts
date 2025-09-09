// Re-export Prisma types and client for compatibility
export { PrismaClient } from "@prisma/client";
export type {
  User,
  Session,
  Account,
  Verification,
  Passkey,
  BudgetAccount,
  BudgetAccountMember,
  BudgetAccountInvitation,
  Budget,
  Category,
  BudgetCategory,
  Transaction,
  Goal,
  PlaidItem,
  PlaidAccount,
  IncomeSource,
  Debt,
  DebtAllocation,
  MonthlyDebtPlanning,
  SupportRequest,
  SupportComment,
  DismissedWarning,
  ContactSubmission,
  EmailConversation,
} from "@prisma/client";

// Export the database instance
export { db } from "./config";

// Utility function for generating IDs (keeping for compatibility)
export const generateId = () =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);
