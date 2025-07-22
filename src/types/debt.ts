export interface Payment {
  id: string;
  amount: string;
  date: string;
  note?: string;
}

export interface RecurringDebt {
  id: string;
  name: string;
  balance: string;
  interestRate: string;
  dueDate: string;
  payments: Payment[];
}

// Database types for server actions
export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  date: Date;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Debt {
  id: string;
  budgetAccountId: string;
  createdByUserId: string;
  name: string;
  balance: number;
  interestRate: number;
  dueDate: Date;
  lastPaymentMonth?: Date;
  createdAt: Date;
  updatedAt: Date;
  payments: DebtPayment[];
}

// Form input types
export interface CreateDebtInput {
  name: string;
  balance: number;
  interestRate: number;
  dueDate: string;
}

export interface UpdateDebtInput {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  dueDate: string;
}

export interface CreateDebtPaymentInput {
  debtId: string;
  amount: number;
  date: string;
  note?: string;
}
