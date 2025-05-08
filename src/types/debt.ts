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
