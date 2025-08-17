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
  date: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Debt {
  id: string;
  budgetAccountId: string;
  createdByUserId: string;
  categoryId?: string;
  name: string;
  paymentAmount: number;
  interestRate: number;
  dueDate: string;
  hasBalance: boolean;
  lastPaymentMonth?: Date;
  createdAt: Date;
  updatedAt: Date;
  payments: DebtPayment[];
}

// Form input types
export interface CreateDebtInput {
  name: string;
  paymentAmount: number;
  interestRate: number;
  dueDate: string;
  hasBalance?: boolean;
  categoryId?: string;
}

export interface UpdateDebtInput {
  id: string;
  name: string;
  paymentAmount: number;
  interestRate: number;
  dueDate: string;
  categoryId?: string;
}

export interface CreateDebtPaymentInput {
  debtId: string;
  amount: number;
  date: string;
  note?: string;
}
